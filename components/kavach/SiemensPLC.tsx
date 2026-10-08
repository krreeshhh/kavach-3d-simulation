'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function SiemensPLC({ position = [0.5, 2.0, 2.5] }: { position?: [number, number, number] }) {
  const productionActive = useSimulationStore((s) => s.productionActive);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);
  const ledsRef = useRef<THREE.Group>(null);

  const isHighlighted = activeHighlights.includes('PLC');

  const materials = useMemo(() => {
    return {
      plcGrey: new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.4,
      }),
      darkAccent: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.5,
      }),
      terminalStrip: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        roughness: 0.6,
      }),
      dinRail: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.9,
        roughness: 0.2,
      }),
      cabinet: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.2,
        roughness: 0.5,
      }),
    };
  }, []);

  useFrame((st) => {
    if (ledsRef.current) {
      ledsRef.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (!productionActive) {
          mat.color.set(i === 0 ? '#ef4444' : '#334155');
        } else {
          const runFlash = Math.sin(st.clock.elapsedTime * 8 + i) > 0;
          mat.color.set(runFlash ? '#22c55e' : '#15803d');
        }
      });
    }
  });

  return (
    <group position={position} name="Production_Siemens_PLC">
      {/* 3D CAD Highlighting Component Box */}
      <ComponentHighlight
        active={isHighlighted}
        color="#10b981"
        label="REAL PLC PROTECTED"
        changeDetail="0 Corrupted Packets -> Safe Flow"
        size={[1.8, 1.4, 1.2]}
        offsetY={0.1}
      />

      {/* Industrial Control Cabinet housing */}
      <mesh position={[0, -0.6, 0]} castShadow material={materials.cabinet}>
        <boxGeometry args={[1.6, 1.8, 0.8]} />
      </mesh>

      {/* DIN Rail */}
      <mesh position={[0, 0, 0.41]} material={materials.dinRail}>
        <boxGeometry args={[1.4, 0.08, 0.04]} />
      </mesh>

      {/* PLC Main CPU Block */}
      <group position={[-0.25, 0.05, 0.46]}>
        <mesh material={materials.plcGrey}>
          <boxGeometry args={[0.7, 0.65, 0.35]} />
        </mesh>
        {/* Flap cover */}
        <mesh position={[0, 0, 0.18]} material={materials.darkAccent}>
          <boxGeometry args={[0.66, 0.3, 0.02]} />
        </mesh>
        {/* Terminal strip top/bottom */}
        <mesh position={[0, 0.28, 0.1]} material={materials.terminalStrip}>
          <boxGeometry args={[0.66, 0.08, 0.15]} />
        </mesh>
        <mesh position={[0, -0.28, 0.1]} material={materials.terminalStrip}>
          <boxGeometry args={[0.66, 0.08, 0.15]} />
        </mesh>
        {/* Status LEDs */}
        <group ref={ledsRef} position={[-0.15, 0.2, 0.18]}>
          {[-0.08, 0, 0.08, 0.16].map((lx, i) => (
            <mesh key={`plc-led-${i}`} position={[lx, 0, 0]}>
              <boxGeometry args={[0.03, 0.025, 0.01]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
          ))}
        </group>
      </group>

      {/* I/O Expansion Module Block */}
      <group position={[0.35, 0.05, 0.46]}>
        <mesh material={materials.plcGrey}>
          <boxGeometry args={[0.4, 0.65, 0.35]} />
        </mesh>
        <mesh position={[0, 0.28, 0.1]} material={materials.terminalStrip}>
          <boxGeometry args={[0.36, 0.08, 0.15]} />
        </mesh>
        <mesh position={[0, -0.28, 0.1]} material={materials.terminalStrip}>
          <boxGeometry args={[0.36, 0.08, 0.15]} />
        </mesh>
      </group>

      {/* ASD-STE100 Tag */}
      <Html position={[0, 0.6, 0.5]} center distanceFactor={9} className="pointer-events-none select-none">
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-slate-300 shadow-sm whitespace-nowrap">
          <span className="font-mono text-xs font-bold text-slate-800">PLC</span>
          <span className="font-mono text-[10px] text-emerald-600 font-semibold">
            {productionActive ? 'REAL PRODUCTION' : 'SAFETY ISOLATED'}
          </span>
        </div>
      </Html>
    </group>
  );
}
