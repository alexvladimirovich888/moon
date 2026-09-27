export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  image: string;
  priceUsd: number | null;
  priceNative: number | null;
  marketCap: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  bondingCurveProgress?: number | null;
  totalTxns24h?: number | null;
  feesPaidSol?: number | null;
  feesPaidUsd?: number | null;
  pairUrl?: string;
  source?: string;
  updatedAt?: string;
}

export type TokenStatus = 'idle' | 'loading' | 'success' | 'error';
