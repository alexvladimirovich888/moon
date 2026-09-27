import { TokenData } from '../types/token';
import tokenAvatarFallback from '../assets/images/moon_token_avatar_1790530843341.jpg';

/**
 * Pump.fun & On-chain Token Service
 * Fetches verified market metrics from Pump.fun / Dexscreener public APIs with server-side proxy fallback.
 */
export async function getTokenData(contractAddress: string): Promise<TokenData> {
  // 1. Try server-side proxy route first (bypasses browser CORS)
  try {
    const res = await fetch(`/api/token/${contractAddress}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        address: contractAddress,
        name: data.name || 'Moon Coin',
        symbol: data.symbol || 'MOON',
        image: data.image || tokenAvatarFallback,
        priceUsd: typeof data.priceUsd === 'number' ? data.priceUsd : null,
        priceNative: typeof data.priceNative === 'number' ? data.priceNative : null,
        marketCap: typeof data.marketCap === 'number' ? data.marketCap : null,
        volume24h: typeof data.volume24h === 'number' ? data.volume24h : null,
        liquidityUsd: typeof data.liquidityUsd === 'number' ? data.liquidityUsd : null,
        bondingCurveProgress: typeof data.bondingCurveProgress === 'number' ? data.bondingCurveProgress : null,
        totalTxns24h: typeof data.totalTxns24h === 'number' ? data.totalTxns24h : null,
        feesPaidSol: typeof data.feesPaidSol === 'number' ? data.feesPaidSol : null,
        feesPaidUsd: typeof data.feesPaidUsd === 'number' ? data.feesPaidUsd : null,
        pairUrl: data.pairUrl || `https://pump.fun/coin/${contractAddress}`,
        source: data.source || 'server-proxy',
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (serverErr) {
    // If server route is unavailable (e.g. direct static vite preview), continue to browser client fallbacks
  }

  // 2. Direct client call to Dexscreener public CORS-enabled API
  try {
    const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (dexRes.ok) {
      const dexData = await dexRes.json();
      const pair = dexData.pairs?.[0];
      if (pair) {
        const volume24h = pair.volume?.h24 || 0;
        const totalTxns = (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0);
        // Pump.fun standard trading fee is 1% of transaction volume
        const feesPaidUsd = volume24h * 0.01;
        const solPrice = pair.priceUsd && pair.priceNative ? pair.priceUsd / pair.priceNative : 122;
        const feesPaidSol = solPrice > 0 ? feesPaidUsd / solPrice : 0;

        return {
          address: contractAddress,
          name: pair.baseToken?.name || 'Moon Coin',
          symbol: pair.baseToken?.symbol || 'MOON',
          image: pair.info?.imageUrl || tokenAvatarFallback,
          priceUsd: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
          priceNative: pair.priceNative ? parseFloat(pair.priceNative) : null,
          marketCap: pair.marketCap || pair.fdv || null,
          volume24h: pair.volume?.h24 || null,
          liquidityUsd: pair.liquidity?.usd || null,
          bondingCurveProgress: null,
          totalTxns24h: totalTxns,
          feesPaidSol: parseFloat(feesPaidSol.toFixed(3)),
          feesPaidUsd: parseFloat(feesPaidUsd.toFixed(2)),
          pairUrl: pair.url || `https://pump.fun/coin/${contractAddress}`,
          source: 'dexscreener-direct',
          updatedAt: new Date().toISOString(),
        };
      }
    }
  } catch (dexErr) {
    // Continue to next fallback
  }

  // 3. Fallback attempt directly to pump.fun frontend API
  try {
    const pumpRes = await fetch(`https://frontend-api.pump.fun/coins/${contractAddress}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    if (pumpRes.ok) {
      const pumpData = await pumpRes.json();
      return {
        address: contractAddress,
        name: pumpData.name || 'Moon Coin',
        symbol: pumpData.symbol || 'MOON',
        image: pumpData.image_uri || tokenAvatarFallback,
        priceUsd: pumpData.usd_market_cap ? pumpData.usd_market_cap / 1_000_000_000 : null,
        priceNative: null,
        marketCap: pumpData.usd_market_cap || null,
        volume24h: pumpData.volume_24h || null,
        liquidityUsd: null,
        bondingCurveProgress: pumpData.complete ? 100 : (pumpData.bonding_curve_progress || null),
        pairUrl: `https://pump.fun/coin/${contractAddress}`,
        source: 'pumpfun-direct',
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (pumpErr) {
    // Ignore CORS / network failure
  }

  // 4. Return default base token model if no remote data could be queried
  // Note: We do NOT invent fake numbers as mandated by Section 8 & 22
  return {
    address: contractAddress,
    name: 'Moon Coin',
    symbol: 'MOON',
    image: tokenAvatarFallback,
    priceUsd: null,
    priceNative: null,
    marketCap: null,
    volume24h: null,
    liquidityUsd: null,
    bondingCurveProgress: null,
    pairUrl: `https://pump.fun/coin/${contractAddress}`,
    source: 'fallback',
    updatedAt: new Date().toISOString(),
  };
}
