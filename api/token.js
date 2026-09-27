export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Contract address required' });
  }

  try {
    // 1. Fetch from Dexscreener public API
    const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (dexResponse.ok) {
      const dexData = await dexResponse.json();
      const pairs = dexData.pairs || [];
      const pair = pairs[0];

      if (pair) {
        let totalVolume24h = 0;
        let totalTxns24h = 0;

        pairs.forEach((p) => {
          if (p.volume?.h24) totalVolume24h += p.volume.h24;
          if (p.txns?.h24) {
            totalTxns24h += (p.txns.h24.buys || 0) + (p.txns.h24.sells || 0);
          }
        });

        // 1% standard Pump.fun protocol fee
        const feesPaidUsd = totalVolume24h * 0.01;
        const solPriceUsd = pair.priceUsd && pair.priceNative ? pair.priceUsd / pair.priceNative : 122;
        const feesPaidSol = solPriceUsd > 0 ? feesPaidUsd / solPriceUsd : 0;

        return res.status(200).json({
          address,
          name: pair.baseToken?.name || 'Moon Coin',
          symbol: pair.baseToken?.symbol || 'MOON',
          priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
          priceNative: pair.priceNative ? parseFloat(pair.priceNative) : null,
          marketCap: pair.marketCap || pair.fdv || null,
          volume24h: totalVolume24h || pair.volume?.h24 || null,
          liquidityUsd: pair.liquidity?.usd || null,
          image: pair.info?.imageUrl || null,
          pairUrl: pair.url || `https://pump.fun/coin/${address}`,
          totalTxns24h: totalTxns24h,
          feesPaidSol: parseFloat(feesPaidSol.toFixed(3)),
          feesPaidUsd: parseFloat(feesPaidUsd.toFixed(2)),
          source: 'dexscreener',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return res.status(200).json({
      address,
      name: 'Moon Coin',
      symbol: 'MOON',
      priceUsd: null,
      marketCap: null,
      volume24h: null,
      liquidityUsd: null,
      bondingCurveProgress: null,
      pairUrl: `https://pump.fun/coin/${address}`,
      source: 'unindexed',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
