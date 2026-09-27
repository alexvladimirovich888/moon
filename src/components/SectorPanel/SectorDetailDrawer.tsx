import React, { useState } from 'react';
import { LunarSector } from '../../types/sector';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import registrySealUrl from '../../assets/images/moon_registry_seal_1790530855230.jpg';
import {
  X,
  Compass,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface SectorDetailDrawerProps {
  sector: LunarSector | null;
  onClose: () => void;
  onSelectNext: () => void;
  onSelectPrev: () => void;
}

export const SectorDetailDrawer: React.FC<SectorDetailDrawerProps> = ({
  sector,
  onClose,
  onSelectNext,
  onSelectPrev,
}) => {
  const [showOrderModal, setShowOrderModal] = useState(false);

  if (!sector) return null;

  const formatCoordinate = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(2)}° ${latDir}, ${Math.abs(lon).toFixed(2)}° ${lonDir}`;
  };

  const formatAcres = (km2: number) => {
    const acres = Math.round(km2 * 247.105);
    return `${km2.toLocaleString()} km² (~${acres.toLocaleString()} acres)`;
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-[#07090e]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header Ribbon */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded uppercase tracking-wider">
                {sector.id}
              </span>
              <span
                className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                  sector.status === 'acquired'
                    ? 'text-cyan-400'
                    : sector.status === 'reserved'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                ● {sector.status}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onSelectPrev}
                title="Previous Sector"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onSelectNext}
                title="Next Sector"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                title="Close (Esc)"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6 space-y-6 text-left">
            {/* Title & Landmark */}
            <div>
              <h2 className="font-display text-xl font-bold text-white tracking-tight">
                {sector.name}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{sector.landmark}</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Valuation
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {sector.priceSol}
                  </span>
                  <span className="ml-1.5 text-sm font-mono text-cyan-400 font-semibold">
                    SOL
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Matrix */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                Lunar Telemetry & Cartography
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-slate-500 text-[10px] uppercase">Lunar Coordinates</div>
                  <div className="text-slate-200 font-medium mt-1 truncate">
                    {formatCoordinate(sector.latitude, sector.longitude)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-slate-500 text-[10px] uppercase">Terrain Type</div>
                  <div className="text-slate-200 font-medium mt-1">{sector.regionType}</div>
                </div>

                <div className="col-span-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-slate-500 text-[10px] uppercase">Calculated Area</div>
                  <div className="text-slate-200 font-medium mt-1">
                    {formatAcres(sector.areaKm2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Geological / Historical Notes */}
            {sector.historicalNote && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500">
                  Mission History & Topography
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3.5 rounded-lg border border-white/5">
                  {sector.historicalNote}
                </p>
              </div>
            )}

            {/* Acquired Verification Stamp */}
            {sector.status === 'acquired' && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3.5">
                <img
                  src={registrySealUrl}
                  alt="Registry Seal"
                  className="w-11 h-11 rounded-lg border border-cyan-400/30 object-cover shrink-0"
                />
                <div className="text-xs">
                  <div className="flex items-center gap-1 text-cyan-300 font-bold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>ACQUIRED TERRITORY</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Acquisition Date: {sector.acquiredDate}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Deed Ref: <span className="text-cyan-200">{sector.registryReference}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Allocated: {sector.solAllocated} SOL via Treasury
                  </div>
                </div>
              </div>
            )}

            {/* Reserved Status Note */}
            {sector.status === 'reserved' && (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <span className="font-semibold text-amber-300">Allocation Queue:</span> This sector is currently reserved for the next Moon Register acquisition batch funded by $MOON trading volume.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-[#06080d] space-y-2">
          {sector.status === 'available' ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full py-3 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.3)] cursor-pointer"
              >
                <span>ACQUIRE ON MOON REGISTER</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-center text-slate-500 font-mono">
                Order directly on Moon Register or let project treasury allocate volume.
              </div>
            </div>
          ) : sector.status === 'acquired' ? (
            <a
              href={PROJECT_CONFIG.moonRegisterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-mono text-xs text-center flex items-center justify-center gap-2 transition-colors"
            >
              <span>VIEW ON MOON REGISTER (ORDER.PHP)</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          ) : (
            <button
              onClick={() => setShowOrderModal(true)}
              className="w-full py-2.5 px-4 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>VIEW RESERVATION DETAILS</span>
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Moon Register Direct Order Dialog */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full bg-[#0a0d14] border border-white/15 rounded-2xl p-6 text-left shadow-2xl relative">
            <button
              onClick={() => setShowOrderModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>MOON REGISTER ORDER PROCESS</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              Acquiring Lunar Land
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              All lunar territory acquisitions are processed through the external land registry service{' '}
              <strong className="text-white">Moon Register</strong> at{' '}
              <code className="text-cyan-300 font-mono">moonregister.com/order.php</code>.
            </p>

            <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-xs font-mono space-y-1 mb-5 text-slate-300">
              <div>Sector ID: <span className="text-white">{sector.id}</span></div>
              <div>Coordinates: <span className="text-white">{formatCoordinate(sector.latitude, sector.longitude)}</span></div>
              <div>Estimated Sol: <span className="text-cyan-300">{sector.priceSol} SOL</span></div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <a
                href={PROJECT_CONFIG.moonRegisterUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Proceed to Moon Register</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
