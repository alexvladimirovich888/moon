import React, { useState } from 'react';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import { Copy, Check, ExternalLink, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  onNavClick: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCa = async () => {
    try {
      await navigator.clipboard.writeText(PROJECT_CONFIG.tokenCa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy CA', err);
    }
  };

  const truncateCa = (ca: string) => {
    if (ca.length <= 12) return ca;
    return `${ca.slice(0, 4)}...${ca.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050608]/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 group shrink-0"
        >
          <span className="font-display text-lg md:text-xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            MOON COIN
          </span>
          <span className="text-[11px] font-mono text-slate-400 border border-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
            $MOON
          </span>
        </a>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => onNavClick('territory')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            3D Moon
          </button>
          <button
            onClick={() => onNavClick('economics')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Economics
          </button>
          <button
            onClick={() => onNavClick('acquired')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Acquired Land
          </button>
          <button
            onClick={() => onNavClick('moon-register')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Moon Register
          </button>
          <button
            onClick={() => onNavClick('token-spec')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Contract
          </button>
        </nav>

        {/* Zone 3: Primary actions (CA copy + Pump.fun + X) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Copy CA Button */}
          <button
            onClick={handleCopyCa}
            title={PROJECT_CONFIG.tokenCa}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-colors whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">CA:</span>
                <span>{truncateCa(PROJECT_CONFIG.tokenCa)}</span>
              </>
            )}
          </button>

          {/* X / Twitter Link */}
          <a
            href={PROJECT_CONFIG.xUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            title="Follow on X"
          >
            <span className="font-bold text-xs">𝕏</span>
          </a>

          {/* Pump.fun Direct Button */}
          <a
            href={PROJECT_CONFIG.pumpfunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 md:px-4 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-300 to-sky-400 hover:from-cyan-200 hover:to-sky-300 rounded-lg transition-all shadow-[0_0_15px_rgba(56,189,248,0.25)] whitespace-nowrap"
          >
            <span>PUMP.FUN</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
