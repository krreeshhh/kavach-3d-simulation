'use client';

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function AttackerNode({ position = [-10.5, 1.0, 0] }: { position?: [number, number, number] }) {
  const state = useSimulationStore((s) => s.state);
  const attackerActive = useSimulationStore((s) => s.attackerActive);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);

  const isHighlighted = activeHighlights.includes('ATTACKER');
  const isAttacking = state === 'ATTACK' || attackerActive;

  const materials = useMemo(() => {
    return {
      tableMetal: new THREE.MeshStandardMaterial({
        color: '#64748b',
        metalness: 0.7,
        roughness: 0.3,
      }),
      laptopBody: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        metalness: 0.8,
        roughness: 0.3,
      }),
      keyboardArea: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.7,
      }),
      screenActive: new THREE.MeshBasicMaterial({
        color: isAttacking ? '#ef4444' : '#334155',
      }),
      antenna: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.5,
      }),
    };
  }, [isAttacking]);

  return (
    <group position={position} name="Attacker_RogueClient">
      {/* 3D CAD Highlighting Component Box */}
      <ComponentHighlight
        active={isHighlighted}
        color="#ef4444"
        label="ROGUE INJECTION"
        changeDetail="Injecting Malicious Modbus Frame"
        size={[1.4, 0.9, 1.1]}
        offsetY={0.2}
      />

      {/* Field Table / Workstation Stand */}
      <mesh position={[0, -0.5, 0]} material={materials.tableMetal}>
        <cylinderGeometry args={[0.06, 0.08, 1.0, 16]} />
      </mesh>
      <mesh position={[0, 0, 0]} material={materials.tableMetal}>
        <boxGeometry args={[1.2, 0.06, 0.8]} />
      </mesh>

      {/* --- LAPTOP / ROGUE TERMINAL --- */}
      <group position={[0, 0.04, 0]}>
        {/* Base Chassis */}
        <mesh position={[0, 0.015, 0]} material={materials.laptopBody}>
          <boxGeometry args={[0.6, 0.03, 0.42]} />
        </mesh>
        {/* Keyboard Well */}
        <mesh position={[0, 0.032, -0.05]} material={materials.keyboardArea}>
          <boxGeometry args={[0.5, 0.005, 0.22]} />
        </mesh>
        {/* Trackpad */}
        <mesh position={[0, 0.032, 0.12]} material={materials.keyboardArea}>
          <boxGeometry args={[0.16, 0.005, 0.1]} />
        </mesh>

        {/* Angled Laptop Display Lid */}
        <group position={[0, 0.03, -0.21]} rotation={[-0.4, 0, 0]}>
          <mesh position={[0, 0.2, 0]} material={materials.laptopBody}>
            <boxGeometry args={[0.6, 0.4, 0.02]} />
          </mesh>
          <mesh position={[0, 0.2, 0.012]} material={materials.screenActive}>
            <planeGeometry args={[0.54, 0.34]} />
          </mesh>
        </group>

        {/* Antenna */}
        <group position={[0.26, 0.05, -0.15]}>
          <mesh material={materials.antenna}>
            <cylinderGeometry args={[0.012, 0.012, 0.28, 8]} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color={isAttacking ? '#ef4444' : '#64748b'} />
          </mesh>
        </group>
      </group>

      {/* ASD-STE100 Tag */}
      <Html
        position={[0, 0.85, 0]}
        center
        distanceFactor={9}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-red-200 shadow-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isAttacking ? 'bg-red-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span className="font-mono text-xs font-bold tracking-wider text-red-900">
              ROGUE CLIENT
            </span>
          </div>
          <span className="font-mono text-[10px] text-red-600">
            {isAttacking ? 'INJECTING PACKETS' : 'EXTERNAL NETWORK'}
          </span>
        </div>
      </Html>
    </group>
  );
}
