'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function Sentinel({ position = [0.5, 3.2, 0] }: { position?: [number, number, number] }) {
  const sentinelOnline = useSimulationStore((s) => s.sentinelOnline);
  const state = useSimulationStore((s) => s.state);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const actLedRef = useRef<THREE.Mesh>(null);

  const isHighlighted = activeHighlights.includes('SENTINEL');
  const isDetecting = state === 'ATTACK';
  const isDeceiving = state === 'DECEIVED';
  const isOffline = state === 'SENTINEL_OFFLINE';

  // Highlight metadata
  const highlightColor = isOffline ? '#f59e0b' : isDetecting ? '#ef4444' : '#8b5cf6';
  const highlightLabel = isOffline
    ? 'SENTINEL FAULT'
    : isDetecting
    ? 'SENTINEL DETECTED'
    : 'SENTINEL DECEIVING';
  const highlightDetail = isOffline
    ? 'Power Loss -> Heartbeat Dropped'
    : isDetecting
    ? 'Deep Packet Inspection Intercept'
    : 'Session Deflected to Honeypot';

  // Materials
  const materials = useMemo(() => {
    return {
      pcb: new THREE.MeshStandardMaterial({
        color: '#15803d',
        roughness: 0.35,
        metalness: 0.1,
      }),
      copperTraces: new THREE.MeshStandardMaterial({
        color: '#ca8a04',
        metalness: 0.8,
        roughness: 0.3,
      }),
      usbShield: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.9,
        roughness: 0.2,
      }),
      usb3Blue: new THREE.MeshStandardMaterial({
        color: '#0284c7',
        roughness: 0.4,
      }),
      usb2Black: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        roughness: 0.6,
      }),
      ethernetJack: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.85,
        roughness: 0.25,
      }),
      heatsink: new THREE.MeshStandardMaterial({
        color: '#64748b',
        metalness: 0.95,
        roughness: 0.15,
      }),
      chipBlack: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.4,
      }),
      goldPins: new THREE.MeshStandardMaterial({
        color: '#eab308',
        metalness: 0.9,
        roughness: 0.2,
      }),
      acrylicCase: new THREE.MeshPhysicalMaterial({
        color: '#f8fafc',
        transmission: 0.9,
        opacity: 0.3,
        transparent: true,
        roughness: 0.1,
        ior: 1.5,
      }),
      dinMount: new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.6,
      }),
      pedestal: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.4,
        roughness: 0.4,
      }),
    };
  }, []);

  useFrame((st, delta) => {
    if (pulseRingRef.current) {
      if (isDetecting || isDeceiving) {
        pulseRingRef.current.visible = true;
        pulseRingRef.current.scale.x += delta * 2.5;
        pulseRingRef.current.scale.y += delta * 2.5;
        if (pulseRingRef.current.scale.x > 3.0) {
          pulseRingRef.current.scale.set(1, 1, 1);
        }
      } else {
        pulseRingRef.current.visible = false;
      }
    }

    if (actLedRef.current && sentinelOnline) {
      const mat = actLedRef.current.material as THREE.MeshBasicMaterial;
      if (isDetecting) {
        mat.color.set('#ef4444');
      } else if (isDeceiving) {
        mat.color.set('#8b5cf6');
      } else {
        const flicker = (Math.sin(st.clock.elapsedTime * 6) + 1) * 0.5;
        mat.color.setRGB(0.1, 0.4 + flicker * 0.6, 0.2);
      }
    }
  });

  return (
    <group position={position} name="Sentinel_RaspberryPi4B">
      {/* 3D CAD Highlighting Component Box */}
      <ComponentHighlight
        active={isHighlighted}
        color={highlightColor}
        label={highlightLabel}
        changeDetail={highlightDetail}
        size={[1.8, 1.1, 1.5]}
        offsetY={0.3}
      />

      {/* Structural Mounting Pedestal */}
      <mesh position={[0, -1.6, 0]} material={materials.pedestal}>
        <cylinderGeometry args={[0.08, 0.1, 3.2, 16]} />
      </mesh>
      {/* Mounting Plate */}
      <mesh position={[0, -0.05, 0]} material={materials.dinMount}>
        <boxGeometry args={[1.5, 0.08, 1.2]} />
      </mesh>

      {/* Transparent Industrial Acrylic Enclosure Box */}
      <mesh position={[0, 0.35, 0]} material={materials.acrylicCase}>
        <boxGeometry args={[1.6, 0.75, 1.3]} />
      </mesh>

      {/* --- RASPBERRY PI 4B BOARD ASSEMBLY --- */}
      <group position={[0, 0.1, 0]}>
        {/* 1. Main Green PCB */}
        <mesh position={[0, 0, 0]} castShadow material={materials.pcb}>
          <boxGeometry args={[1.2, 0.04, 0.8]} />
        </mesh>

        {/* Mounting screw holes */}
        {[
          [-0.52, -0.32],
          [-0.52, 0.32],
          [0.46, -0.32],
          [0.46, 0.32],
        ].map(([hx, hz], i) => (
          <mesh key={`hole-${i}`} position={[hx, 0.021, hz]} material={materials.goldPins}>
            <cylinderGeometry args={[0.03, 0.03, 0.01, 12]} />
          </mesh>
        ))}

        {/* 2. Ethernet Jack */}
        <group position={[0.48, 0.12, 0.24]}>
          <mesh material={materials.ethernetJack}>
            <boxGeometry args={[0.26, 0.2, 0.22]} />
          </mesh>
          <mesh position={[0.131, 0, 0]}>
            <boxGeometry args={[0.01, 0.12, 0.14]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.132, 0.07, 0.06]}>
            <boxGeometry args={[0.005, 0.025, 0.025]} />
            <meshBasicMaterial color={sentinelOnline ? '#22c55e' : '#475569'} />
          </mesh>
          <mesh position={[0.132, 0.07, -0.06]}>
            <boxGeometry args={[0.005, 0.025, 0.025]} />
            <meshBasicMaterial color={sentinelOnline ? '#eab308' : '#475569'} />
          </mesh>
        </group>

        {/* 3. Dual USB 3.0 Ports */}
        <group position={[0.48, 0.12, -0.05]}>
          <mesh material={materials.usbShield}>
            <boxGeometry args={[0.24, 0.22, 0.2]} />
          </mesh>
          <mesh position={[0.121, 0.04, 0]} material={materials.usb3Blue}>
            <boxGeometry args={[0.01, 0.03, 0.14]} />
          </mesh>
          <mesh position={[0.121, -0.04, 0]} material={materials.usb3Blue}>
            <boxGeometry args={[0.01, 0.03, 0.14]} />
          </mesh>
        </group>

        {/* 4. Dual USB 2.0 Ports */}
        <group position={[0.48, 0.12, -0.28]}>
          <mesh material={materials.usbShield}>
            <boxGeometry args={[0.24, 0.22, 0.2]} />
          </mesh>
          <mesh position={[0.121, 0.04, 0]} material={materials.usb2Black}>
            <boxGeometry args={[0.01, 0.03, 0.14]} />
          </mesh>
          <mesh position={[0.121, -0.04, 0]} material={materials.usb2Black}>
            <boxGeometry args={[0.01, 0.03, 0.14]} />
          </mesh>
        </group>

        {/* 5. 40-Pin GPIO Header */}
        <group position={[-0.1, 0.06, -0.34]}>
          <mesh material={materials.usb2Black}>
            <boxGeometry args={[0.7, 0.07, 0.08]} />
          </mesh>
          <mesh position={[0, 0.05, 0]} material={materials.goldPins}>
            <boxGeometry args={[0.66, 0.06, 0.04]} />
          </mesh>
        </group>

        {/* 6. Broadcom BCM2711 SoC with Aluminum Finned Heatsink */}
        <group position={[-0.08, 0.03, 0.04]}>
          <mesh material={materials.chipBlack}>
            <boxGeometry args={[0.24, 0.02, 0.24]} />
          </mesh>
          <mesh position={[0, 0.03, 0]} material={materials.heatsink}>
            <boxGeometry args={[0.25, 0.04, 0.25]} />
          </mesh>
          {[-0.09, -0.045, 0, 0.045, 0.09].map((fx, i) => (
            <mesh key={`fin-${i}`} position={[fx, 0.08, 0]} material={materials.heatsink}>
              <boxGeometry args={[0.015, 0.07, 0.24]} />
            </mesh>
          ))}
        </group>

        {/* 7. LPDDR4 RAM IC Chip */}
        <mesh position={[-0.32, 0.025, 0.04]} material={materials.chipBlack}>
          <boxGeometry args={[0.16, 0.02, 0.16]} />
        </mesh>

        {/* 8. Micro-HDMI & USB-C Power Ports */}
        <group position={[-0.2, 0.04, 0.38]}>
          <mesh position={[-0.24, 0, 0]} material={materials.usbShield}>
            <boxGeometry args={[0.12, 0.06, 0.08]} />
          </mesh>
          <mesh position={[-0.04, 0, 0]} material={materials.usbShield}>
            <boxGeometry args={[0.09, 0.05, 0.06]} />
          </mesh>
          <mesh position={[0.12, 0, 0]} material={materials.usbShield}>
            <boxGeometry args={[0.09, 0.05, 0.06]} />
          </mesh>
        </group>

        {/* 9. Status & Power LEDs */}
        <mesh position={[-0.52, 0.03, 0.24]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshBasicMaterial color={sentinelOnline ? '#ef4444' : '#475569'} />
        </mesh>
        <mesh ref={actLedRef} position={[-0.52, 0.03, 0.28]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshBasicMaterial color={sentinelOnline ? '#22c55e' : '#475569'} />
        </mesh>

        {/* 10. Threat Warning Pulse Ring */}
        <mesh
          ref={pulseRingRef}
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.6, 0.68, 32]} />
          <meshBasicMaterial
            color={isDetecting ? '#ef4444' : '#8b5cf6'}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
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
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-slate-300 shadow-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                !sentinelOnline
                  ? 'bg-amber-500'
                  : isDetecting
                  ? 'bg-red-500 animate-ping'
                  : isDeceiving
                  ? 'bg-purple-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="font-mono text-xs font-bold tracking-wider text-slate-800">
              SENTINEL
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            {sentinelOnline ? 'Raspberry Pi 4B' : 'OFFLINE'}
          </span>
        </div>
      </Html>
    </group>
  );
}
