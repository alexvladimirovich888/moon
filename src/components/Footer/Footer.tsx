import React, { useState } from 'react';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
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
    <footer className="w-full border-t border-white/10 bg-[#030407] py-12 px-4 md:px-8 text-xs font-mono text-slate-400">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="font-display font-bold text-lg text-white">MOON COIN</div>
            <div className="text-slate-400 text-xs mt-0.5">
              Turning token activity into lunar territory.
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
            <a
              href={PROJECT_CONFIG.pumpfunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Pump.fun</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href={PROJECT_CONFIG.moonRegisterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>Moon Register</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href={PROJECT_CONFIG.xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              <span>X (Twitter)</span>
              <ArrowUpRight className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Contract Quick Row */}
        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-slate-500">Contract Address:</span>
            <span className="text-slate-300 select-all truncate">{PROJECT_CONFIG.tokenCa}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy CA</span>
              </>
            )}
          </button>
        </div>

        {/* Mandatory Disclaimer from Section 19 */}
        <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 leading-relaxed text-left">
          MOON COIN is an independent community crypto project. Lunar land information and purchases are subject to the terms and availability of the external land registry service (Moon Register). Holding tokens does not constitute direct real property ownership or investment securities.
        </div>
      </div>
    </footer>
  );
};
