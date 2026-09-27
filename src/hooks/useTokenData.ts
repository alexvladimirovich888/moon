import { useState, useEffect, useCallback } from 'react';
import { TokenData, TokenStatus } from '../types/token';
import { getTokenData } from '../services/pumpfun';

export function useTokenData(contractAddress: string) {
  const [data, setData] = useState<TokenData | null>(null);
  const [status, setStatus] = useState<TokenStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchToken = useCallback(async () => {
    if (!contractAddress) return;
    setStatus((prev) => (prev === 'idle' ? 'loading' : prev));
    try {
      const result = await getTokenData(contractAddress);
      setData(result);
      if (result.marketCap === null && result.source === 'fallback') {
        setStatus('error');
        setErrorMessage('Token on-chain data currently synchronizing or unavailable.');
      } else {
        setStatus('success');
        setErrorMessage(null);
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to retrieve token statistics');
    }
  }, [contractAddress]);

  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, 45000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  return { data, status, error: errorMessage, refetch: fetchToken };
}
