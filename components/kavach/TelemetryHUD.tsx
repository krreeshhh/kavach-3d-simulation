'use client';

import React from 'react';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { CameraViewPreset } from '@/lib/simulation/types';

export function TelemetryHUD() {
  const changeLogs = useSimulationStore((s) => s.changeLogs);
  const showTelemetry = useSimulationStore((s) => s.showTelemetry);
  const toggleTelemetry = useSimulationStore((s) => s.toggleTelemetry);
  const setCameraPreset = useSimulationStore((s) => s.setCameraPreset);
  const state = useSimulationStore((s) => s.state);

  // Map component name to camera preset
  const handleFocusComponent = (compName: string) => {
    const upper = compName.toUpperCase();
    if (upper.includes('SENTINEL')) setCameraPreset('SENTINEL');
    else if (upper.includes('LIFELINE')) setCameraPreset('LIFELINE');
    else if (upper.includes('RELAY') || upper.includes('SIREN') || upper.includes('E-STOP')) setCameraPreset('SAFETY');
    else if (upper.includes('HONEYPOT')) setCameraPreset('ATTACK_DECEPTION');
    else if (upper.includes('ROGUE') || upper.includes('ATTACKER')) setCameraPreset('ATTACK_DECEPTION');
    else if (upper.includes('ESP-NOW')) setCameraPreset('ESP_NOW');
    else if (upper.includes('PLC') || upper.includes('PRODUCTION')) setCameraPreset('PRODUCTION');
    else setCameraPreset('OVERVIEW');
  };

  return (
    <div className="fixed top-5 right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Minimized or Expanded Toggle Header */}
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-300 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider text-slate-800">
            COMPONENT TELEMETRY
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
          {state}
        </span>
        <button
          onClick={toggleTelemetry}
          className="text-slate-400 hover:text-slate-800 font-mono text-xs font-bold px-1 transition-colors"
          title="Toggle component telemetry feed"
        >
          {showTelemetry ? '▼' : '▲'}
        </button>
      </div>

      {/* Expanded Live Component Change Stream */}
      {showTelemetry && (
        <div className="mt-2 w-80 max-h-[360px] overflow-y-auto bg-white/90 backdrop-blur-md rounded-lg border border-slate-300 shadow-xl p-2.5 flex flex-col gap-1.5 font-mono text-xs transition-all">
          <div className="flex items-center justify-between text-[9px] text-slate-400 border-b border-slate-200 pb-1 px-1">
            <span>LIVE COMPONENT ACTIVITY</span>
            <span>CLICK TO FOCUS</span>
          </div>

          {changeLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => handleFocusComponent(log.component)}
              className="group p-2 rounded-md border border-slate-200 hover:border-slate-400 bg-white/80 hover:bg-slate-50/90 cursor-pointer transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: log.color }}
                  />
                  <span className="font-bold text-[11px] text-slate-800 group-hover:text-sky-700">
                    {log.component}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400">{log.time}</span>
              </div>

              <div
                className="text-[10px] font-semibold mt-0.5 tracking-tight"
                style={{ color: log.color }}
              >
                {log.action}
              </div>

              <div className="text-[9px] text-slate-500 mt-0.5 leading-snug">
                {log.detail}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
