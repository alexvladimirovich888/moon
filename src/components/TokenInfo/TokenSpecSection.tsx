import React, { useState } from 'react';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import { TokenData } from '../../types/token';
import { Copy, Check, ExternalLink, ArrowUpRight, Shield, Zap, Flame } from 'lucide-react';

interface TokenSpecSectionProps {
  tokenData: TokenData | null;
}

export const TokenSpecSection: React.FC<TokenSpecSectionProps> = ({ tokenData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_CONFIG.tokenCa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section id="token-spec" className="w-full py-20 px-4 md:px-8 border-t border-white/10 bg-[#05060a]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mb-12 text-left">
          <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-2">
            On-Chain Specifications
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
            Token & Contract Information
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            MOON COIN ($MOON) was launched via Pump.fun on the Solana blockchain. All liquidity, minting rules, and contract parameters are permanently immutable.
          </p>
        </div>

        {/* Spec Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Card 1: CA */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                Contract Address (Solana CA)
              </div>
              <div className="p-3 bg-black/50 border border-white/10 rounded-lg text-slate-200 break-all text-[11px] leading-relaxed">
                {PROJECT_CONFIG.tokenCa}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-300">COPIED TO CLIPBOARD</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>COPY CONTRACT ADDRESS</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: Global Fees Paid */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-cyan-500/20 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Flame className="w-3 h-3 text-cyan-400" />
                <span>Global Fees Paid</span>
              </div>
              <div className="space-y-2 mt-3">
                <div>
                  <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
                    {tokenData?.feesPaidSol !== undefined && tokenData?.feesPaidSol !== null
                      ? `${tokenData.feesPaidSol.toLocaleString()} SOL`
                      : '—'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {tokenData?.feesPaidUsd
                      ? `≈ $${tokenData.feesPaidUsd.toLocaleString()} USD accumulated`
                      : 'Real-time protocol fees'}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>24h Transactions:</span>
                    <span className="text-white font-semibold">
                      {tokenData?.totalTxns24h ? tokenData.totalTxns24h.toLocaleString() : 'Live'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee Mechanism:</span>
                    <span className="text-slate-300">1% Pump.fun Swap Fee</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-1.5 text-cyan-300 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Feeds directly into land fund</span>
            </div>
          </div>

          {/* Card 2: Tokenomics */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                Tokenomics & Parameters
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-400">Total Supply:</span>
                  <span className="text-white font-bold">1,000,000,000 $MOON</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-400">Network:</span>
                  <span className="text-white">Solana Mainnet</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-white/5">
                  <span className="text-slate-400">Launch Mechanism:</span>
                  <span className="text-cyan-300">Pump.fun Fair Launch</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mint Authority:</span>
                  <span className="text-emerald-400 font-semibold">REVOKED</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-slate-400 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Immutable zero-tax smart contract</span>
            </div>
          </div>

          {/* Card 3: Pump.fun Gateway */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                Trading & Liquidity Platform
              </div>
              <div className="p-3 bg-black/50 border border-white/10 rounded-lg text-slate-300 text-xs leading-relaxed">
                Tokens are traded 24/7 on the Pump.fun bonding curve. Once the bonding curve target is reached, liquidity is automatically deposited to Raydium and burned.
              </div>
            </div>

            <a
              href={PROJECT_CONFIG.pumpfunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-2.5 px-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>TRADE ON PUMP.FUN</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
