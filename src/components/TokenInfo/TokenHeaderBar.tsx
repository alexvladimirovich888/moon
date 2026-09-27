import React, { useState } from 'react';
import { TokenData, TokenStatus } from '../../types/token';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import tokenAvatarFallback from '../../assets/images/moon_token_avatar_1790530843341.jpg';
import { Copy, Check, ArrowUpRight, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';

interface TokenHeaderBarProps {
  tokenData: TokenData | null;
  status: TokenStatus;
  onRefresh: () => void;
}

export const TokenHeaderBar: React.FC<TokenHeaderBarProps> = ({
  tokenData,
  status,
  onRefresh,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_CONFIG.tokenCa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const formatUsd = (val: number | null | undefined) => {
    if (val === null || val === undefined) return null;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
    if (val < 0.0001) return `$${val.toFixed(8)}`;
    return `$${val.toFixed(4)}`;
  };

  const formatSolPrice = (sol: number | null | undefined) => {
    if (!sol) return null;
    return `${sol.toFixed(6)} SOL`;
  };

  return (
    <div className="w-full bg-[#080b11]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Token Identity: Avatar + Name + CA */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 bg-slate-900 shadow-md">
            <img
              src={tokenData?.image || tokenAvatarFallback}
              alt="MOON COIN Avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to static emblem if remote URL fails
                (e.target as HTMLImageElement).src = tokenAvatarFallback;
              }}
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white tracking-wide text-sm truncate">
                {tokenData?.name || 'Moon Coin'}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                ${tokenData?.symbol || 'MOON'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                {PROJECT_CONFIG.tokenCa}
              </span>
              <button
                onClick={handleCopy}
                title="Copy Full Contract Address"
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-cyan-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Token Metrics */}
        <div className="flex items-center justify-between md:justify-end gap-5 sm:gap-7 w-full md:w-auto text-xs font-mono overflow-x-auto pb-1 md:pb-0">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Price</span>
            <span className="text-slate-200 font-medium tabular-nums">
              {formatUsd(tokenData?.priceUsd) || (status === 'loading' ? '—' : 'SYNCING')}
            </span>
          </div>

          {/* Market Cap */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Market Cap</span>
            <span className="text-slate-200 font-medium tabular-nums">
              {formatUsd(tokenData?.marketCap) || (status === 'loading' ? '—' : 'SYNCING')}
            </span>
          </div>

          {/* 24h Volume */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Volume 24h</span>
            <span className="text-slate-200 font-medium tabular-nums">
              {formatUsd(tokenData?.volume24h) || (status === 'loading' ? '—' : 'SYNCING')}
            </span>
          </div>

          {/* Liquidity */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Liquidity</span>
            <span className="text-slate-200 font-medium tabular-nums">
              {formatUsd(tokenData?.liquidityUsd) || (status === 'loading' ? '—' : 'SYNCING')}
            </span>
          </div>

          {/* Global Fees Paid */}
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Fees Paid</span>
            </span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {tokenData?.feesPaidSol !== undefined && tokenData?.feesPaidSol !== null
                ? `${tokenData.feesPaidSol.toLocaleString()} SOL`
                : tokenData?.feesPaidUsd
                ? formatUsd(tokenData.feesPaidUsd)
                : (status === 'loading' ? '—' : 'SYNCING')}
            </span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            title="Refresh Token Metrics"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Trade CTA */}
          <a
            href={PROJECT_CONFIG.pumpfunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg transition-colors whitespace-nowrap ml-1 shrink-0"
          >
            <span>TRADE</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
