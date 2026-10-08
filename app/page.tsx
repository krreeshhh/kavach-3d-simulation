'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { SimulationControls } from '@/components/kavach/SimulationControls';
import { TelemetryHUD } from '@/components/kavach/TelemetryHUD';

// Dynamically import KavachScene to prevent WebGL SSR mismatch
const KavachScene = dynamic(
  () => import('@/components/kavach/KavachScene').then((mod) => mod.KavachScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
          <span className="font-mono text-xs tracking-wider text-slate-500">
            LOADING KAVACH DIGITAL TWIN...
          </span>
        </div>
      </div>
    ),
  }
);

export default function SimulationPage() {
  return (
    <main className="w-screen h-screen relative overflow-hidden bg-[#f8fafc]">
      {/* 1. Fullscreen 3D Canvas */}
      <KavachScene />

      {/* 2. Minimal Engineering Header (ASD-STE100 compliant) */}
      <div className="fixed top-5 left-6 z-40 pointer-events-none select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-sm bg-slate-900" />
          <span className="font-mono font-black text-sm tracking-widest text-slate-900">
            KAVACH
          </span>
          <span className="font-mono text-xs text-slate-400 font-medium">|</span>
          <span className="font-mono text-xs text-slate-500 tracking-wider">
            CYBER-PHYSICAL SIMULATION
          </span>
        </div>
      </div>

      {/* 3. Live Component Changes & Telemetry HUD */}
      <TelemetryHUD />

      {/* 4. Floating Engineering Simulation Controls */}
      <SimulationControls />
    </main>
  );
}
