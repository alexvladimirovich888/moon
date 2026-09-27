import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.json());

  // API endpoint: Get live Pump.fun / Dexscreener token statistics
  app.get('/api/token/:address', async (req: Request, res: Response) => {
    const { address } = req.params;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Contract address required' });
    }

    try {
      // 1. Try Dexscreener API (aggregates pump.fun tokens with price, marketCap, volume, liquidity)
      const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      });

      if (dexResponse.ok) {
        const dexData = await dexResponse.json();
        const pairs = dexData.pairs || [];
        const pair = pairs[0];
        if (pair) {
          // Aggregate real volume across all pools (PumpSwap, Meteora, Raydium)
          let totalVolume24h = 0;
          let totalTxns24h = 0;
          pairs.forEach((p: any) => {
            if (p.volume?.h24) totalVolume24h += p.volume.h24;
            if (p.txns?.h24) {
              totalTxns24h += (p.txns.h24.buys || 0) + (p.txns.h24.sells || 0);
            }
          });

          // Pump.fun / Solana protocol standard 1% fee on curve and liquidity trading
          const feesPaidUsd = totalVolume24h * 0.01;
          const solPriceUsd = (pair.priceUsd && pair.priceNative) ? (pair.priceUsd / pair.priceNative) : 122;
          const feesPaidSol = solPriceUsd > 0 ? feesPaidUsd / solPriceUsd : 0;

          return res.json({
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

      // 2. Try Pump.fun public coin API endpoint
      try {
        const pumpResponse = await fetch(`https://frontend-api.pump.fun/coins/${address}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(3000),
        });

        if (pumpResponse.ok) {
          const pumpData = await pumpResponse.json();
          return res.json({
            address,
            name: pumpData.name || 'Moon Coin',
            symbol: pumpData.symbol || 'MOON',
            priceUsd: pumpData.usd_market_cap ? pumpData.usd_market_cap / 1_000_000_000 : null,
            marketCap: pumpData.usd_market_cap || null,
            image: pumpData.image_uri || null,
            bondingCurveProgress: pumpData.complete ? 100 : (pumpData.bonding_curve_progress || null),
            pairUrl: `https://pump.fun/coin/${address}`,
            source: 'pumpfun',
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (e) {
        // Continue to fallback response
      }

      // If token is newly deployed and unindexed yet, return normalized baseline
      return res.json({
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
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Internal proxy error' });
    }
  });

  // Mount Vite middleware in development or static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`MOON COIN server listening on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
