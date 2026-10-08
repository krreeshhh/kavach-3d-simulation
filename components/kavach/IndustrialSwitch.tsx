'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function IndustrialSwitch({ position = [-3.0, 3.2, 0] }: { position?: [number, number, number] }) {
  const state = useSimulationStore((s) => s.state);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);
  const switchLedsRef = useRef<THREE.Group>(null);

  const isIsolated = state === 'ISOLATE';
  const isAttacking = state === 'ATTACK';
  const isHighlighted = isIsolated || activeHighlights.includes('SWITCH');

  const materials = useMemo(() => {
    return {
      body: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.4,
        metalness: 0.6,
      }),
      faceplate: new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.3,
      }),
      rj45Jack: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.8,
      }),
      pedestal: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.4,
        roughness: 0.4,
      }),
    };
  }, []);

  useFrame((st) => {
    if (switchLedsRef.current) {
      switchLedsRef.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (isIsolated) {
          // All link LEDs solid red on emergency disconnect
          mat.color.set('#ef4444');
        } else if (isAttacking && i === 1) {
          mat.color.set('#ef4444');
        } else {
          const flicker = Math.sin(st.clock.elapsedTime * 12 + i * 2) > 0;
          mat.color.set(flicker ? '#22c55e' : '#15803d');
        }
      });
    }
  });

  return (
    <group position={position} name="Industrial_Managed_Switch">
      {/* Component Highlight on Isolation */}
      <ComponentHighlight
        active={isIsolated}
        color="#ef4444"
        label="PORTS SHUTDOWN"
        changeDetail="Ethernet Link State: DOWN"
        size={[1.2, 1.6, 1.3]}
        offsetY={0.1}
      />

      {/* Support Pedestal */}
      <mesh position={[0, -1.6, 0]} material={materials.pedestal}>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 16]} />
      </mesh>

      {/* Switch Enclosure */}
      <mesh castShadow material={materials.body}>
        <boxGeometry args={[0.8, 1.2, 0.9]} />
      </mesh>

      {/* Front Faceplate */}
      <mesh position={[0, 0, 0.46]} material={materials.faceplate}>
        <boxGeometry args={[0.76, 1.15, 0.02]} />
      </mesh>

      {/* 8x RJ45 Ports */}
      {[-0.2, 0.2].map((cx, colIdx) => (
        <group key={`col-${colIdx}`} position={[cx, -0.15, 0.47]}>
          {[-0.25, -0.08, 0.08, 0.25].map((ry, rowIdx) => (
            <mesh key={`port-${rowIdx}`} position={[0, ry, 0]} material={materials.rj45Jack}>
              <boxGeometry args={[0.12, 0.1, 0.03]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* RJ45 Activity LEDs */}
      <group ref={switchLedsRef} position={[0, 0.32, 0.47]}>
        {[-0.25, -0.15, -0.05, 0.05, 0.15, 0.25].map((lx, i) => (
          <mesh key={`led-${i}`} position={[lx, 0, 0]}>
            <boxGeometry args={[0.03, 0.03, 0.02]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        ))}
      </group>

      {/* Label */}
      <Html position={[0, 0.85, 0]} center distanceFactor={9} className="pointer-events-none select-none">
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-slate-300 shadow-sm whitespace-nowrap">
          <span className="font-mono text-xs font-bold text-slate-800">INDUSTRIAL SWITCH</span>
          <span className={`font-mono text-[10px] font-semibold ${isIsolated ? 'text-red-600' : 'text-slate-500'}`}>
            {isIsolated ? 'PORTS ISOLATED' : 'OT Layer 2/3'}
          </span>
        </div>
      </Html>
    </group>
  );
}
