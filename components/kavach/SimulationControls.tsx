'use client';

import React, { useState } from 'react';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { CameraViewPreset } from '@/lib/simulation/types';

export function SimulationControls() {
  const state = useSimulationStore((s) => s.state);
  const cameraPreset = useSimulationStore((s) => s.cameraPreset);
  const autoTour = useSimulationStore((s) => s.autoTour);
  const simulationSpeed = useSimulationStore((s) => s.simulationSpeed);

  const triggerAttack = useSimulationStore((s) => s.triggerAttack);
  const triggerSentinelOffline = useSimulationStore((s) => s.triggerSentinelOffline);
  const triggerIsolate = useSimulationStore((s) => s.triggerIsolate);
  const resetToNormal = useSimulationStore((s) => s.resetToNormal);
  const setCameraPreset = useSimulationStore((s) => s.setCameraPreset);
  const toggleAutoTour = useSimulationStore((s) => s.toggleAutoTour);
  const setSimulationSpeed = useSimulationStore((s) => s.setSimulationSpeed);

  const [showNavHelp, setShowNavHelp] = useState(false);

  const subsystemViews: { id: CameraViewPreset; label: string }[] = [
    { id: 'OVERVIEW', label: 'OVERVIEW' },
    { id: 'NETWORK', label: 'OT NETWORK' },
    { id: 'SENTINEL', label: 'SENTINEL' },
    { id: 'LIFELINE', label: 'LIFELINE' },
    { id: 'SAFETY', label: 'SAFETY' },
    { id: 'ATTACK_DECEPTION', label: 'DECEPTION' },
    { id: 'ESP_NOW', label: 'ESP-NOW' },
    { id: 'PRODUCTION', label: 'PRODUCTION' },
  ];

  const cadAngles: { id: CameraViewPreset; label: string }[] = [
    { id: 'TOP', label: 'TOP (PLAN)' },
    { id: 'ISOMETRIC', label: 'ISOMETRIC' },
    { id: 'FRONT', label: 'FRONT' },
    { id: 'SIDE', label: 'SIDE' },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 pointer-events-auto max-w-[96vw]">
      {/* 1. Main Simulation Action Controls */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md border border-slate-300 rounded-lg shadow-lg">
        {/* NORMAL BUTTON */}
        <button
          onClick={resetToNormal}
          className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide rounded transition-all ${
            state === 'NORMAL'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          NORMAL
        </button>

        {/* ATTACK BUTTON */}
        <button
          onClick={triggerAttack}
          className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide rounded transition-all ${
            state === 'ATTACK' || state === 'DECEIVED'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
          }`}
        >
          SIMULATE ATTACK
        </button>

        {/* SENTINEL OFF BUTTON */}
        <button
          onClick={triggerSentinelOffline}
          className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide rounded transition-all ${
            state === 'SENTINEL_OFFLINE' || state === 'AUTONOMOUS'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-amber-50 hover:text-amber-800'
          }`}
        >
          SENTINEL FAULT
        </button>

        {/* ISOLATE BUTTON */}
        <button
          onClick={triggerIsolate}
          className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wide rounded transition-all ${
            state === 'ISOLATE'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          ISOLATE
        </button>

        <div className="w-[1px] h-5 bg-slate-300 mx-1" />

        {/* RESET BUTTON */}
        <button
          onClick={resetToNormal}
          className="px-2.5 py-1.5 text-xs font-mono text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-all"
          title="Reset Simulation"
        >
          RESET
        </button>
      </div>

      {/* 2. Camera View & Subsystem Relocation Bar */}
      <div className="flex flex-wrap items-center justify-center gap-1 px-2 py-1 bg-white/85 backdrop-blur-md border border-slate-200 rounded-md shadow text-[10px] font-mono text-slate-600">
        <span className="text-slate-400 font-semibold px-1">RELOCATE VIEW:</span>

        {/* Subsystem Focus Views */}
        {subsystemViews.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setCameraPreset(preset.id)}
            className={`px-2 py-0.5 rounded transition-colors ${
              cameraPreset === preset.id && !autoTour
                ? 'bg-slate-800 text-white font-bold'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            {preset.label}
          </button>
        ))}

        <div className="w-[1px] h-3 bg-slate-300 mx-0.5 hidden sm:block" />

        {/* CAD Angle Presets */}
        <span className="text-slate-400 font-semibold px-0.5 hidden sm:inline">CAD:</span>
        {cadAngles.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setCameraPreset(preset.id)}
            className={`px-1.5 py-0.5 rounded transition-colors ${
              cameraPreset === preset.id && !autoTour
                ? 'bg-sky-700 text-white font-bold'
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            {preset.label}
          </button>
        ))}

        <div className="w-[1px] h-3 bg-slate-300 mx-0.5" />

        {/* Auto Tour Toggle */}
        <button
          onClick={toggleAutoTour}
          className={`px-2 py-0.5 rounded font-bold transition-colors ${
            autoTour
              ? 'bg-sky-600 text-white'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          AUTO TOUR {autoTour ? 'ON' : 'OFF'}
        </button>

        <div className="w-[1px] h-3 bg-slate-200 mx-0.5" />

        {/* Speed toggle */}
        <div className="flex items-center gap-0.5">
          {[0.5, 1, 2].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimulationSpeed(spd)}
              className={`px-1.5 py-0.5 rounded ${
                simulationSpeed === spd
                  ? 'bg-slate-300 font-bold text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Navigation Help Tooltip Toggle */}
        <button
          onClick={() => setShowNavHelp(!showNavHelp)}
          className="ml-1 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[9px]"
          title="Mouse and 3D View Relocation Controls"
        >
          ?
        </button>
      </div>

      {/* 3. Navigation Help Legend Bar (shown on toggle or initial hover) */}
      {showNavHelp && (
        <div className="flex items-center gap-3 px-3 py-1 bg-slate-900/90 text-slate-200 text-[9px] font-mono rounded shadow backdrop-blur-md animate-fadeIn">
          <span>🖱️ Left-Click + Drag: <b>Free Orbit</b></span>
          <span>🖱️ Right-Click + Drag: <b>Pan View</b></span>
          <span>📜 Scroll: <b>Zoom In/Out</b></span>
          <span>⚡ Double-Click: <b>Focus & Center Target</b></span>
          <span>🧭 Bottom-Left Gizmo: <b>Click Axis to Align</b></span>
          <button
            onClick={() => setShowNavHelp(false)}
            className="text-slate-400 hover:text-white font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
