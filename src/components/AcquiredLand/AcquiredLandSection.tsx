import React from 'react';
import { LunarSector } from '../../types/sector';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import registrySealUrl from '../../assets/images/moon_registry_seal_1790530855230.jpg';
import { ShieldCheck, MapPin, ExternalLink, Eye, ArrowUpRight } from 'lucide-react';

interface AcquiredLandSectionProps {
  sectors: LunarSector[];
  tokenData?: import('../../types/token').TokenData | null;
  onSelectSector: (sector: LunarSector) => void;
}

export const AcquiredLandSection: React.FC<AcquiredLandSectionProps> = ({
  sectors,
  tokenData,
  onSelectSector,
}) => {
  const acquiredSectors = sectors.filter((s) => s.status === 'acquired');

  const formatCoordinate = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(1)}°${latDir} / ${Math.abs(lon).toFixed(1)}°${lonDir}`;
  };

  return (
    <section id="acquired" className="w-full py-20 px-4 md:px-8 border-t border-white/10 bg-[#05070c]">
      <div className="max-w-7xl mx-auto">
        {/* Header & Counters */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 text-left">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Project Acquisition Ledger</span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
              Acquired Lunar Territory
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Every sector in this registry represents confirmed territory acquired via the
              Moon Register external service with capital funded by $MOON token volume.
            </p>
          </div>

          {/* Aggregated Counters */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 p-4 rounded-2xl bg-white/[0.02] border border-white/10 shrink-0 font-mono">
            <div>
              <div className="text-[10px] uppercase text-cyan-400 font-semibold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Global Fees Paid</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-cyan-300 tabular-nums">
                {tokenData?.feesPaidSol !== undefined && tokenData?.feesPaidSol !== null
                  ? `${tokenData.feesPaidSol.toLocaleString()} `
                  : tokenData?.feesPaidUsd
                  ? `$${tokenData.feesPaidUsd.toLocaleString()}`
                  : '—'}
                {tokenData?.feesPaidSol !== undefined && tokenData?.feesPaidSol !== null && (
                  <span className="text-xs text-slate-400 font-normal">SOL</span>
                )}
              </div>
            </div>

            <div className="w-px h-8 bg-white/10 hidden sm:block" />

            <div>
              <div className="text-[10px] uppercase text-slate-500 tracking-wider">Territory Acquired</div>
              <div className="text-xl md:text-2xl font-bold text-white tabular-nums">
                {PROJECT_CONFIG.totalSectorsAcquired}{' '}
                <span className="text-xs text-cyan-400 font-normal">Sectors</span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10 hidden sm:block" />

            <div>
              <div className="text-[10px] uppercase text-slate-500 tracking-wider">Capital Allocated</div>
              <div className="text-xl md:text-2xl font-bold text-white tabular-nums">
                {PROJECT_CONFIG.totalSolAllocated}{' '}
                <span className="text-xs text-slate-400 font-normal">SOL</span>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10 hidden sm:block" />

            <div>
              <div className="text-[10px] uppercase text-slate-500 tracking-wider">Surface Area</div>
              <div className="text-xl md:text-2xl font-bold text-white tabular-nums">
                {PROJECT_CONFIG.totalLandAcquiredKm2.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-normal">km²</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.015] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Sector ID</th>
                  <th className="py-3.5 px-4 font-semibold">Lunar Landmark</th>
                  <th className="py-3.5 px-4 font-semibold">Coordinates</th>
                  <th className="py-3.5 px-4 font-semibold">Area</th>
                  <th className="py-3.5 px-4 font-semibold">Treasury Sol</th>
                  <th className="py-3.5 px-4 font-semibold">Registry Ref</th>
                  <th className="py-3.5 px-4 font-semibold">Date Acquired</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {acquiredSectors.map((sector) => (
                  <tr
                    key={sector.id}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => {
                      onSelectSector(sector);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <td className="py-3 px-4 font-bold text-cyan-400">
                      {sector.id}
                    </td>
                    <td className="py-3 px-4 text-white font-sans font-medium">
                      <div>{sector.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                        {sector.landmark}
                      </div>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-slate-400">
                      {formatCoordinate(sector.latitude, sector.longitude)}
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {sector.areaKm2.toLocaleString()} km²
                    </td>
                    <td className="py-3 px-4 tabular-nums text-cyan-300 font-semibold">
                      {sector.solAllocated || sector.priceSol} SOL
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[11px] text-cyan-200">
                        {sector.registryReference}
                      </span>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-slate-400">
                      {sector.acquiredDate}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSector(sector);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors"
                        title="Focus Camera on 3D Moon"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Footnote */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
          <div>
            Data sourced from centralized verifiable project registry configuration.
          </div>
          <a
            href={PROJECT_CONFIG.moonRegisterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <span>Verify deeds at Moon Register (order.php)</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
};
