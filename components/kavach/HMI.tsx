'use client';

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';

export function HMI({ position = [-5.5, 2.0, 2.5] }: { position?: [number, number, number] }) {
  const state = useSimulationStore((s) => s.state);
  const productionActive = useSimulationStore((s) => s.productionActive);
  const isIsolated = state === 'ISOLATE';

  const materials = useMemo(() => {
    return {
      standMetal: new THREE.MeshStandardMaterial({
        color: '#64748b',
        metalness: 0.8,
        roughness: 0.3,
      }),
      panelBezel: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.4,
      }),
      screenGlass: new THREE.MeshBasicMaterial({
        color: '#0f172a',
      }),
    };
  }, []);

  return (
    <group position={position} name="HMI_Terminal">
      {/* Articulated Stand */}
      <mesh position={[0, -0.9, 0]} material={materials.standMetal}>
        <cylinderGeometry args={[0.06, 0.08, 1.8, 16]} />
      </mesh>
      {/* Base plate */}
      <mesh position={[0, -1.8, 0]} material={materials.standMetal}>
        <cylinderGeometry args={[0.35, 0.4, 0.06, 20]} />
      </mesh>

      {/* Screen Enclosure */}
      <group position={[0, 0.1, 0]} rotation={[-0.35, 0, 0]}>
        <mesh material={materials.panelBezel}>
          <boxGeometry args={[1.2, 0.8, 0.12]} />
        </mesh>
        <mesh position={[0, 0, 0.065]} material={materials.screenGlass}>
          <planeGeometry args={[1.05, 0.68]} />
        </mesh>

        {/* Embedded Screen Graphics */}
        <Html position={[0, 0, 0.07]} center distanceFactor={6} transform className="pointer-events-none select-none">
          <div className="w-[180px] h-[115px] bg-slate-900 text-slate-100 p-2 flex flex-col justify-between font-mono text-[9px] border border-slate-700 rounded">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1">
              <span className={`font-bold ${isIsolated ? 'text-red-400 animate-pulse' : 'text-sky-400'}`}>
                {isIsolated ? 'EMERGENCY TRIP' : 'HMI CONSOLE'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isIsolated ? 'bg-red-500 animate-ping' : productionActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>

            {isIsolated ? (
              <div className="space-y-1 text-[8px] bg-red-950/60 p-1.5 rounded border border-red-800 text-red-200">
                <div className="flex justify-between font-bold text-red-400">
                  <span>NETWORK:</span>
                  <span>ISOLATED</span>
                </div>
                <div className="flex justify-between">
                  <span>RELAY:</span>
                  <span>OPEN (CUT)</span>
                </div>
                <div className="flex justify-between">
                  <span>MOTORS:</span>
                  <span>POWER SEVERED</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 text-[8px] text-slate-300">
                <div className="flex justify-between">
                  <span>LINE:</span>
                  <span className={productionActive ? 'text-emerald-400 font-semibold' : 'text-red-400'}>
                    {productionActive ? 'RUNNING' : 'HALTED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>FEED:</span>
                  <span>240 PPM</span>
                </div>
                <div className="flex justify-between">
                  <span>INTERLOCK:</span>
                  <span className="text-sky-400">ARMED</span>
                </div>
              </div>
            )}

            <div className="text-[7px] text-slate-500 border-t border-slate-800 pt-0.5">
              SIEMENS SIMATIC S7-1200
            </div>
          </div>
        </Html>
      </group>

      {/* ASD-STE100 Tag */}
      <Html position={[0, 0.85, 0]} center distanceFactor={9} className="pointer-events-none select-none">
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-slate-300 shadow-sm whitespace-nowrap">
          <span className="font-mono text-xs font-bold text-slate-800">HMI</span>
          <span className={`font-mono text-[10px] font-semibold ${isIsolated ? 'text-red-600' : 'text-slate-500'}`}>
            {isIsolated ? 'FAILSAFE ACTIVE' : 'Operator Terminal'}
          </span>
        </div>
      </Html>
    </group>
  );
}
