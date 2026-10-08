'use client';

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';

export function ScadaServer({ position = [-5.5, 2.5, -3.5] }: { position?: [number, number, number] }) {
  const state = useSimulationStore((s) => s.state);
  const isIsolated = state === 'ISOLATE';

  const materials = useMemo(() => {
    return {
      rackBody: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        metalness: 0.7,
        roughness: 0.3,
      }),
      rackRails: new THREE.MeshStandardMaterial({
        color: '#475569',
        metalness: 0.8,
        roughness: 0.2,
      }),
      serverFace: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.5,
      }),
      meshGrill: new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.6,
      }),
    };
  }, []);

  return (
    <group position={position} name="SCADA_Server_Workstation">
      {/* 19" Industrial Server Cabinet */}
      <mesh position={[0, 0, 0]} castShadow material={materials.rackBody}>
        <boxGeometry args={[1.2, 2.4, 1.2]} />
      </mesh>

      {/* Front Perforated Glass/Mesh Door */}
      <mesh position={[0, 0, 0.61]} material={materials.meshGrill}>
        <boxGeometry args={[1.1, 2.3, 0.02]} />
      </mesh>

      {/* 1U / 2U Server Units inside rack */}
      {[-0.8, -0.4, 0.0, 0.4, 0.8].map((sy, i) => (
        <group key={`server-${i}`} position={[0, sy, 0.3]}>
          <mesh material={materials.serverFace}>
            <boxGeometry args={[1.0, 0.25, 0.5]} />
          </mesh>
          {/* Status LEDs */}
          <mesh position={[-0.4, 0, 0.26]}>
            <boxGeometry args={[0.03, 0.03, 0.01]} />
            <meshBasicMaterial color={isIsolated ? '#ef4444' : '#22c55e'} />
          </mesh>
          <mesh position={[-0.34, 0, 0.26]}>
            <boxGeometry args={[0.03, 0.03, 0.01]} />
            <meshBasicMaterial color={isIsolated ? '#7f1d1d' : '#0284c7'} />
          </mesh>
        </group>
      ))}

      {/* ASD-STE100 Tag */}
      <Html position={[0, 1.45, 0]} center distanceFactor={9} className="pointer-events-none select-none">
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-slate-300 shadow-sm whitespace-nowrap">
          <span className="font-mono text-xs font-bold text-slate-800">SCADA</span>
          <span className={`font-mono text-[10px] font-semibold ${isIsolated ? 'text-red-600' : 'text-slate-500'}`}>
            {isIsolated ? 'NETWORK CUT' : 'Supervisory Control'}
          </span>
        </div>
      </Html>
    </group>
  );
}
