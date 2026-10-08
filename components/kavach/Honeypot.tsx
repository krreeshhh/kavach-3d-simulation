'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function Honeypot({ position = [-0.5, 3.2, -4.5] }: { position?: [number, number, number] }) {
  const state = useSimulationStore((s) => s.state);
  const honeypotActive = useSimulationStore((s) => s.honeypotActive);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);
  const trapGlowRef = useRef<THREE.Mesh>(null);
  const ledsRef = useRef<THREE.Group>(null);

  const isHighlighted = activeHighlights.includes('HONEYPOT');
  const isDeceiving = state === 'DECEIVED' || honeypotActive;

  const materials = useMemo(() => {
    return {
      plcHousing: new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.35,
        metalness: 0.3,
      }),
      deceptionPurple: new THREE.MeshStandardMaterial({
        color: '#7c3aed',
        roughness: 0.4,
      }),
      terminalStrip: new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.6,
      }),
      pedestal: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.4,
        roughness: 0.4,
      }),
      glassWindow: new THREE.MeshPhysicalMaterial({
        color: '#c084fc',
        transmission: 0.7,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      }),
    };
  }, []);

  useFrame((st) => {
    if (trapGlowRef.current) {
      if (isDeceiving) {
        trapGlowRef.current.visible = true;
        const s = 1 + (Math.sin(st.clock.elapsedTime * 8) + 1) * 0.1;
        trapGlowRef.current.scale.set(s, s, s);
      } else {
        trapGlowRef.current.visible = false;
      }
    }
  });

  return (
    <group position={position} name="Synthetic_Honeypot">
      {/* 3D CAD Highlighting Component Box */}
      <ComponentHighlight
        active={isHighlighted}
        color="#8b5cf6"
        label="HONEYPOT DECEPTION"
        changeDetail="Synthetic PLC Absorbing Exploit Payload"
        size={[1.8, 1.2, 1.4]}
        offsetY={0.3}
      />

      {/* Structural Stand */}
      <mesh position={[0, -1.6, 0]} material={materials.pedestal}>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 16]} />
      </mesh>
      {/* Mounting Backplate */}
      <mesh position={[0, -0.05, 0]} material={materials.plcHousing}>
        <boxGeometry args={[1.6, 0.08, 1.2]} />
      </mesh>

      {/* --- SYNTHETIC PLC CHASSIS ASSEMBLY --- */}
      <group position={[0, 0.35, 0]}>
        {/* Main Modular Body */}
        <mesh castShadow material={materials.plcHousing}>
          <boxGeometry args={[1.4, 0.7, 0.8]} />
        </mesh>

        {/* Purple Deception Identifier Stripe */}
        <mesh position={[0, 0.15, 0.405]} material={materials.deceptionPurple}>
          <boxGeometry args={[1.38, 0.1, 0.02]} />
        </mesh>

        {/* Emulated Virtual CPU Section */}
        <mesh position={[-0.35, 0, 0.41]} material={materials.glassWindow}>
          <boxGeometry args={[0.5, 0.45, 0.02]} />
        </mesh>

        {/* Status Activity LEDs */}
        <group ref={ledsRef} position={[-0.35, 0.18, 0.425]}>
          {[-0.15, -0.05, 0.05, 0.15].map((lx, i) => (
            <mesh key={`led-${i}`} position={[lx, 0, 0]}>
              <boxGeometry args={[0.04, 0.03, 0.01]} />
              <meshBasicMaterial
                color={isDeceiving ? (i % 2 === 0 ? '#a855f7' : '#c084fc') : '#475569'}
              />
            </mesh>
          ))}
        </group>

        {/* Emulated Virtual I/O Terminal Blocks */}
        <group position={[0.35, 0, 0.41]}>
          <mesh material={materials.terminalStrip}>
            <boxGeometry args={[0.5, 0.48, 0.04]} />
          </mesh>
          {[-0.15, -0.05, 0.05, 0.15].map((tx, idx) => (
            <mesh key={`term-${idx}`} position={[tx, -0.1, 0.025]}>
              <cylinderGeometry args={[0.025, 0.025, 0.02, 8]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
          ))}
        </group>

        {/* Trap Pulse Field */}
        <mesh
          ref={trapGlowRef}
          position={[0, 0, 0]}
          visible={false}
        >
          <boxGeometry args={[1.6, 0.9, 1.0]} />
          <meshBasicMaterial
            color="#8b5cf6"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {/* ASD-STE100 Tag */}
      <Html
        position={[0, 0.9, 0]}
        center
        distanceFactor={9}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-purple-200 shadow-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDeceiving ? 'bg-purple-600 animate-ping' : 'bg-purple-400'
              }`}
            />
            <span className="font-mono text-xs font-bold tracking-wider text-purple-900">
              HONEYPOT
            </span>
          </div>
          <span className="font-mono text-[10px] text-purple-600">
            {isDeceiving ? 'ABSORBING THREAT' : 'Synthetic PLC'}
          </span>
        </div>
      </Html>
    </group>
  );
}
