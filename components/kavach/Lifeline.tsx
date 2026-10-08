'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function Lifeline({ position = [4.0, 3.2, 0] }: { position?: [number, number, number] }) {
  const state = useSimulationStore((s) => s.state);
  const lifelineOnline = useSimulationStore((s) => s.lifelineOnline);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);
  const rgbLedRef = useRef<THREE.Mesh>(null);
  const haloRingRef = useRef<THREE.Mesh>(null);

  const isHighlighted = activeHighlights.includes('LIFELINE');
  const isAutonomous = state === 'AUTONOMOUS';
  const isIsolate = state === 'ISOLATE';

  const highlightColor = isIsolate ? '#ef4444' : isAutonomous ? '#06b6d4' : '#0284c7';
  const highlightLabel = isIsolate
    ? 'LIFELINE TRIPPED'
    : isAutonomous
    ? 'LIFELINE AUTONOMOUS'
    : 'LIFELINE ACTIVE';
  const highlightDetail = isIsolate
    ? 'Triggered Hardware Interlock Trip'
    : isAutonomous
    ? 'Watchdog Failover -> Direct Supervision'
    : 'Monitoring Sentinel Heartbeat';

  const materials = useMemo(() => {
    return {
      pcbBlack: new THREE.MeshStandardMaterial({
        color: '#18181b',
        roughness: 0.4,
      }),
      rfShield: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.9,
        roughness: 0.2,
      }),
      antennaCopper: new THREE.MeshStandardMaterial({
        color: '#ca8a04',
        metalness: 0.85,
        roughness: 0.2,
      }),
      headersBlack: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.7,
      }),
      goldPins: new THREE.MeshStandardMaterial({
        color: '#eab308',
        metalness: 0.9,
        roughness: 0.15,
      }),
      usbMetal: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.9,
        roughness: 0.2,
      }),
      buttonCap: new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.5,
      }),
      pedestal: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.4,
        roughness: 0.4,
      }),
      dinMount: new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.6,
      }),
    };
  }, []);

  useFrame((st) => {
    if (rgbLedRef.current && lifelineOnline) {
      const mat = rgbLedRef.current.material as THREE.MeshBasicMaterial;
      if (isIsolate) {
        const flash = Math.sin(st.clock.elapsedTime * 14) > 0;
        mat.color.set(flash ? '#ef4444' : '#7f1d1d');
      } else if (isAutonomous) {
        const t = (Math.sin(st.clock.elapsedTime * 4) + 1) * 0.5;
        mat.color.setRGB(0.1 + t * 0.8, 0.6 + t * 0.2, 0.1);
      } else {
        mat.color.set('#06b6d4');
      }
    }

    if (haloRingRef.current) {
      haloRingRef.current.visible = isAutonomous || isIsolate;
      if (isAutonomous) {
        haloRingRef.current.scale.setScalar(1 + (Math.sin(st.clock.elapsedTime * 5) + 1) * 0.1);
      }
    }
  });

  return (
    <group position={position} name="Lifeline_ESP32S3">
      {/* 3D CAD Highlighting Component Box */}
      <ComponentHighlight
        active={isHighlighted}
        color={highlightColor}
        label={highlightLabel}
        changeDetail={highlightDetail}
        size={[1.5, 1.0, 1.2]}
        offsetY={0.2}
      />

      {/* Structural Pedestal */}
      <mesh position={[0, -1.6, 0]} material={materials.pedestal}>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 16]} />
      </mesh>
      {/* DIN Rail mounting adapter plate */}
      <mesh position={[0, -0.05, 0]} material={materials.dinMount}>
        <boxGeometry args={[1.3, 0.08, 0.9]} />
      </mesh>

      {/* --- ESP32-S3 DEVELOPMENT BOARD ASSEMBLY --- */}
      <group position={[0, 0.05, 0]}>
        {/* 1. Black PCB */}
        <mesh position={[0, 0, 0]} castShadow material={materials.pcbBlack}>
          <boxGeometry args={[1.1, 0.035, 0.55]} />
        </mesh>

        {/* 2. Metal RF Shielding Can */}
        <mesh position={[-0.1, 0.03, 0]} material={materials.rfShield}>
          <boxGeometry args={[0.42, 0.045, 0.38]} />
        </mesh>

        {/* 3. Meandering PCB Trace Antenna */}
        <group position={[-0.42, 0.02, 0]}>
          <mesh material={materials.antennaCopper}>
            <boxGeometry args={[0.16, 0.005, 0.34]} />
          </mesh>
          {[-0.1, 0, 0.1].map((az, i) => (
            <mesh key={`slot-${i}`} position={[0, 0.003, az]} material={materials.pcbBlack}>
              <boxGeometry args={[0.12, 0.006, 0.04]} />
            </mesh>
          ))}
        </group>

        {/* 4. Dual 2x22 Pin Header Rails */}
        <group position={[0, 0.04, 0.23]}>
          <mesh material={materials.headersBlack}>
            <boxGeometry args={[0.92, 0.05, 0.05]} />
          </mesh>
          <mesh position={[0, 0.04, 0]} material={materials.goldPins}>
            <boxGeometry args={[0.88, 0.04, 0.02]} />
          </mesh>
        </group>
        <group position={[0, 0.04, -0.23]}>
          <mesh material={materials.headersBlack}>
            <boxGeometry args={[0.92, 0.05, 0.05]} />
          </mesh>
          <mesh position={[0, 0.04, 0]} material={materials.goldPins}>
            <boxGeometry args={[0.88, 0.04, 0.02]} />
          </mesh>
        </group>

        {/* 5. USB Type-C Receptacle */}
        <mesh position={[0.48, 0.035, 0]} material={materials.usbMetal}>
          <boxGeometry args={[0.14, 0.06, 0.16]} />
        </mesh>

        {/* 6. Push Buttons */}
        <mesh position={[0.32, 0.025, 0.12]} material={materials.buttonCap}>
          <boxGeometry args={[0.06, 0.03, 0.06]} />
        </mesh>
        <mesh position={[0.32, 0.025, -0.12]} material={materials.buttonCap}>
          <boxGeometry args={[0.06, 0.03, 0.06]} />
        </mesh>

        {/* 7. WS2812 RGB Addressable Status LED */}
        <mesh ref={rgbLedRef} position={[0.18, 0.03, 0]}>
          <boxGeometry args={[0.05, 0.025, 0.05]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>

        {/* 8. Autonomous Safety Active Halo Ring */}
        <mesh
          ref={haloRingRef}
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.55, 0.62, 32]} />
          <meshBasicMaterial
            color={isIsolate ? '#ef4444' : '#06b6d4'}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ASD-STE100 Technical Tag */}
      <Html
        position={[0, 0.8, 0]}
        center
        distanceFactor={9}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-slate-300 shadow-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isIsolate
                  ? 'bg-red-500 animate-ping'
                  : isAutonomous
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-cyan-500'
              }`}
            />
            <span className="font-mono text-xs font-bold tracking-wider text-slate-800">
              LIFELINE
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            {isIsolate ? 'ISOLATING' : isAutonomous ? 'AUTONOMOUS ACTIVE' : 'ESP32-S3'}
          </span>
        </div>
      </Html>
    </group>
  );
}
