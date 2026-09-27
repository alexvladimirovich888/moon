import React, { useState, useMemo } from 'react';
import { Header } from './components/Navigation/Header';
import { TokenHeaderBar } from './components/TokenInfo/TokenHeaderBar';
import { MoonScene } from './components/MoonScene/MoonScene';
import { SectorDetailDrawer } from './components/SectorPanel/SectorDetailDrawer';
import { SectorFilterBar } from './components/LunarMap/SectorFilterBar';
import { HowItWorks } from './components/Economics/HowItWorks';
import { AcquiredLandSection } from './components/AcquiredLand/AcquiredLandSection';
import { MoonRegisterSection } from './components/MoonRegister/MoonRegisterSection';
import { TokenSpecSection } from './components/TokenInfo/TokenSpecSection';
import { Footer } from './components/Footer/Footer';
import { LUNAR_SECTORS, PROJECT_CONFIG } from './data/projectConfig';
import { LunarSector, SectorStatus } from './types/sector';
import { useTokenData } from './hooks/useTokenData';
import { Sparkles, Globe, ShieldCheck } from 'lucide-react';

export default function App() {
  const [sectors] = useState<LunarSector[]>(LUNAR_SECTORS);
  const [selectedSector, setSelectedSector] = useState<LunarSector | null>(null);
  const [activeFilter, setActiveFilter] = useState<SectorStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live token data hook from Pump.fun / Dexscreener service
  const { data: tokenData, status: tokenStatus, refetch: refreshToken } = useTokenData(PROJECT_CONFIG.tokenCa);

  // Filtered sectors list for search
  const filteredSectors = useMemo(() => {
    return sectors.filter((s) => {
      if (activeFilter !== 'all' && s.status !== activeFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.landmark.toLowerCase().includes(q)
      );
    });
  }, [sectors, activeFilter, searchQuery]);

  // Navigate to next / previous sector
  const handleSelectNext = () => {
    if (!selectedSector) return;
    const currentIndex = sectors.findIndex((s) => s.id === selectedSector.id);
    const nextIndex = (currentIndex + 1) % sectors.length;
    setSelectedSector(sectors[nextIndex]);
  };

  const handleSelectPrev = () => {
    if (!selectedSector) return;
    const currentIndex = sectors.findIndex((s) => s.id === selectedSector.id);
    const prevIndex = (currentIndex - 1 + sectors.length) % sectors.length;
    setSelectedSector(sectors[prevIndex]);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#040508] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <Header onNavClick={scrollToSection} />

      {/* Compact Token Header Bar with live Pump.fun data */}
      <TokenHeaderBar
        tokenData={tokenData}
        status={tokenStatus}
        onRefresh={refreshToken}
      />

      {/* Hero Screen: Dominant Interactive 3D Moon */}
      <section id="territory" className="relative w-full overflow-hidden flex flex-col">
        {/* Subtle Hero Header Overlay */}
        <div className="pointer-events-none absolute top-4 inset-x-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md text-[11px] font-mono text-cyan-300 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>INTERACTIVE LUNAR EXPLORER</span>
            <span className="text-slate-500">·</span>
            <span>{PROJECT_CONFIG.totalSectorsAcquired} SECTORS ACQUIRED</span>
            {tokenData?.feesPaidSol !== undefined && tokenData?.feesPaidSol !== null && (
              <>
                <span className="text-slate-500">·</span>
                <span className="text-cyan-200 font-bold">{tokenData.feesPaidSol.toLocaleString()} SOL FEES PAID</span>
              </>
            )}
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            MOON COIN
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-mono max-w-lg mx-auto">
            Turning token activity into lunar territory.
          </p>
        </div>

        {/* 3D Moon Canvas Container */}
        <MoonScene
          sectors={filteredSectors}
          selectedSector={selectedSector}
          onSelectSector={setSelectedSector}
          filterStatus={activeFilter}
        />

        {/* Interaction Hint Overlay */}
        <div className="pointer-events-none absolute bottom-4 inset-x-0 z-10 hidden md:flex items-center justify-center text-[11px] font-mono text-slate-400">
          <span>Drag to rotate · Scroll to zoom · Click sector marker to inspect valuation & coordinates</span>
        </div>
      </section>

      {/* Sector Filter & Search Navigation Bar */}
      <SectorFilterBar
        sectors={sectors}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Cinematic Sector Detail Drawer */}
      <SectorDetailDrawer
        sector={selectedSector}
        onClose={() => setSelectedSector(null)}
        onSelectNext={handleSelectNext}
        onSelectPrev={handleSelectPrev}
      />

      {/* Project Economics & Mechanism Section */}
      <HowItWorks tokenData={tokenData} />

      {/* Acquired Land Registry Section */}
      <AcquiredLandSection
        sectors={sectors}
        tokenData={tokenData}
        onSelectSector={setSelectedSector}
      />

      {/* Moon Register External Integration Section */}
      <MoonRegisterSection />

      {/* Token & Smart Contract Specification Section */}
      <TokenSpecSection tokenData={tokenData} />

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
