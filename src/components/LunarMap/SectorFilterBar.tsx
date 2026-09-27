import React from 'react';
import { LunarSector, SectorStatus } from '../../types/sector';
import { Filter, Search, Globe, ChevronDown } from 'lucide-react';

interface SectorFilterBarProps {
  sectors: LunarSector[];
  activeFilter: SectorStatus | 'all';
  onFilterChange: (status: SectorStatus | 'all') => void;
  selectedSector: LunarSector | null;
  onSelectSector: (sector: LunarSector | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SectorFilterBar: React.FC<SectorFilterBarProps> = ({
  sectors,
  activeFilter,
  onFilterChange,
  selectedSector,
  onSelectSector,
  searchQuery,
  onSearchChange,
}) => {
  const counts = {
    all: sectors.length,
    acquired: sectors.filter((s) => s.status === 'acquired').length,
    reserved: sectors.filter((s) => s.status === 'reserved').length,
    available: sectors.filter((s) => s.status === 'available').length,
  };

  const filteredForSelect = sectors.filter((s) => {
    if (activeFilter !== 'all' && s.status !== activeFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.id.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.landmark.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full bg-[#07090e]/80 border-y border-white/10 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-lg w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ALL ({counts.all})
          </button>

          <button
            onClick={() => onFilterChange('acquired')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'acquired'
                ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>ACQUIRED ({counts.acquired})</span>
          </button>

          <button
            onClick={() => onFilterChange('reserved')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'reserved'
                ? 'bg-amber-950/70 border border-amber-500/40 text-amber-200'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>RESERVED ({counts.reserved})</span>
          </button>

          <button
            onClick={() => onFilterChange('available')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'available'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>AVAILABLE ({counts.available})</span>
          </button>
        </div>

        {/* Search & Quick Selector */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sector or crater..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.07] border border-white/10 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Quick Sector Selector Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedSector?.id || ''}
              onChange={(e) => {
                const sec = sectors.find((s) => s.id === e.target.value);
                onSelectSector(sec || null);
              }}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-slate-300">
                Jump to Sector...
              </option>
              {filteredForSelect.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.id} · {s.name.slice(0, 22)} ({s.priceSol} SOL)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};
