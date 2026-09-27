import React from 'react';
import { ArrowRight, Coins, Vault, Compass, ShieldCheck, Flame } from 'lucide-react';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import { TokenData } from '../../types/token';

interface HowItWorksProps {
  tokenData?: TokenData | null;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ tokenData }) => {
  const steps = [
    {
      num: '01',
      title: 'Token Activity on Pump.fun',
      subtitle: 'Decentralized Liquidity Volume',
      desc: 'Trading volume of the $MOON token on Pump.fun generates continuous liquidity fees designated for project development.',
      icon: Coins,
    },
    {
      num: '02',
      title: 'Treasury Capital Allocation',
      subtitle: 'Transparent Fund Accrual',
      desc: 'Accumulated project fees are routed into the public acquisition treasury specifically reserved for lunar land acquisitions.',
      icon: Vault,
    },
    {
      num: '03',
      title: 'External Moon Register Purchase',
      subtitle: 'Official Registry Orders',
      desc: 'The project executes official lunar plot purchases through the independent registry service Moon Register (moonregister.com/order.php).',
      icon: Compass,
    },
    {
      num: '04',
      title: '3D Territory Verification',
      subtitle: 'Real-time Surface Mapping',
      desc: 'Once confirmed with official deed reference IDs, sectors are updated to ACQUIRED status and illuminated on the interactive 3D Moon.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="economics" className="w-full py-20 px-4 md:px-8 border-t border-white/10 bg-[#040609]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-2">
            Project Architecture
          </div>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
            How $MOON Acquires Lunar Territory
          </h2>
          <p className="mt-3 text-sm md:text-base text-slate-400 leading-relaxed">
            MOON COIN establishes a direct operational bridge between decentralized market activity
            and verifiable extraterrestrial property registry. Every acquisition is processed through
            the external Moon Register service.
          </p>
        </div>

        {/* 4-Step Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-sm font-bold text-cyan-400/80">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 group-hover:text-cyan-300 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-white mb-1">
                    {step.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mb-3">
                    {step.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600 pointer-events-none">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Metric Ribbon */}
        <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Treasury Status: <strong className="text-white">Active Allocation Protocol</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-slate-500">Global Fees Paid: </span>
              <strong className="text-cyan-300 font-bold">
                {tokenData?.feesPaidSol !== undefined && tokenData?.feesPaidSol !== null
                  ? `${tokenData.feesPaidSol.toLocaleString()} SOL`
                  : tokenData?.feesPaidUsd
                  ? `$${tokenData.feesPaidUsd.toLocaleString()}`
                  : 'Syncing...'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Allocated to Land: </span>
              <strong className="text-white font-bold">{PROJECT_CONFIG.totalSolAllocated} SOL</strong>
            </div>
            <div>
              <span className="text-slate-500">Deeds Registered: </span>
              <strong className="text-white font-bold">{PROJECT_CONFIG.totalSectorsAcquired} Sectors</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
