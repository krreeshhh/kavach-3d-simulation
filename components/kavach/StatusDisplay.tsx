'use client';

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';

export function StatusDisplay({ position = [1.8, 4.8, 0] }: { position?: [number, number, number] }) {
  const state = useSimulationStore((s) => s.state);
  const activeLabel = useSimulationStore((s) => s.activeLabel);
  const activeSublabel = useSimulationStore((s) => s.activeSublabel);

  const materials = useMemo(() => {
    return {
      frameDark: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.3,
        metalness: 0.8,
      }),
      hanger: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.7,
        roughness: 0.3,
      }),
    };
  }, []);

  // Visual status pill colors
  const statusColorClass = useMemo(() => {
    switch (state) {
      case 'NORMAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'ATTACK':
        return 'bg-red-50 text-red-700 border-red-300 animate-pulse';
      case 'DECEIVED':
        return 'bg-purple-50 text-purple-700 border-purple-300';
      case 'SENTINEL_OFFLINE':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'AUTONOMOUS':
        return 'bg-sky-50 text-sky-700 border-sky-300';
      case 'ISOLATE':
        return 'bg-red-100 text-red-900 border-red-400 font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  }, [state]);

  return (
    <group position={position} name="Floating_Status_Monitor">
      {/* Ceiling Hanger Rods */}
      {[-0.8, 0.8].map((hx, i) => (
        <mesh key={`h-${i}`} position={[hx, 1.0, 0]} material={materials.hanger}>
          <cylinderGeometry args={[0.015, 0.015, 2.0, 8]} />
        </mesh>
      ))}

      {/* Monitor Outer Chassis */}
      <mesh material={materials.frameDark}>
        <boxGeometry args={[2.4, 1.4, 0.08]} />
      </mesh>

      {/* 3D Holographic Industrial Display Face */}
      <Html
        position={[0, 0, 0.05]}
        center
        distanceFactor={7}
        transform
        className="pointer-events-none select-none"
      >
        <div className="w-[340px] bg-white/95 backdrop-blur-md p-4 rounded-lg border border-slate-300 shadow-xl font-mono flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-extrabold tracking-widest text-slate-900 text-sm">
              KAVACH
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">
              CYBER-PHYSICAL TWIN
            </span>
          </div>

          <div className="my-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] tracking-widest text-slate-400 mb-1">
              SYSTEM STATE
            </span>
            <div
              className={`px-3 py-1 rounded text-base font-extrabold tracking-wider border ${statusColorClass}`}
            >
              {activeLabel}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-600">
            <span>ACTION:</span>
            <span className="font-semibold text-slate-800">{activeSublabel}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
