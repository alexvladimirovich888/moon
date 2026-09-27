import React from 'react';
import { PROJECT_CONFIG } from '../../data/projectConfig';
import registrySealUrl from '../../assets/images/moon_registry_seal_1790530855230.jpg';
import { ExternalLink, CheckCircle2, ArrowUpRight, Compass, Shield } from 'lucide-react';

export const MoonRegisterSection: React.FC = () => {
  return (
    <section id="moon-register" className="w-full py-20 px-4 md:px-8 border-t border-white/10 bg-[#040608]">
      <div className="max-w-7xl mx-auto">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.005] border border-white/10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-2xl text-left">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase mb-3">
                <Compass className="w-4 h-4" />
                <span>External Lunar Registry Integration</span>
              </div>

              <h2 className="font-display text-2xl md:text-4xl font-bold text-white tracking-tight">
                Moon Register Land Ordering
              </h2>

              <p className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed">
                Moon Coin utilizes <strong className="text-white">Moon Register</strong> as the external service for lunar land acquisitions. All parcels recorded in our 3D Explorer correspond to real orders processed directly through their order gateway.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 font-mono">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Independent extraterrestrial registry service since 1999</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Publicly verifiable deeds with latitude/longitude coordinates</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Direct individual ordering available for community members</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Transparent project treasury order logging</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href={PROJECT_CONFIG.moonRegisterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center gap-2"
                >
                  <span>ORDER ON MOON REGISTER</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>

                <span className="text-xs font-mono text-slate-500">
                  URL: moonregister.com/order.php
                </span>
              </div>
            </div>

            {/* Verification Seal Visual */}
            <div className="relative p-6 rounded-2xl bg-black/40 border border-white/10 shrink-0 max-w-sm w-full">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={registrySealUrl}
                  alt="Moon Register Verification Seal"
                  className="w-14 h-14 rounded-xl border border-white/15 object-cover"
                />
                <div>
                  <div className="text-xs font-mono text-cyan-400 uppercase font-semibold">
                    Service Disclosure
                  </div>
                  <div className="text-sm font-bold text-white font-display">
                    Independent Provider
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                MOON COIN operates independently. Land registration is executed through Moon Register’s public ordering system. Acquisition status is updated once certificates and coordinates are verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
