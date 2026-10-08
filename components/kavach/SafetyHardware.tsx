'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function SafetyHardware({ position = [7.0, 2.4, 0] }: { position?: [number, number, number] }) {
  const relayClosed = useSimulationStore((s) => s.relayClosed);
  const sirenActive = useSimulationStore((s) => s.sirenActive);
  const eStopPushed = useSimulationStore((s) => s.eStopPushed);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);

  const isRelayHighlit = activeHighlights.includes('RELAY');
  const isSirenHighlit = activeHighlights.includes('SIREN');
  const isEstopHighlit = activeHighlights.includes('ESTOP');

  // Animation refs
  const armatureRef = useRef<THREE.Group>(null);
  const sirenRotatorRef = useRef<THREE.Group>(null);
  const sirenLightRef = useRef<THREE.PointLight>(null);
  const eStopButtonRef = useRef<THREE.Mesh>(null);

  const materials = useMemo(() => {
    return {
      dinRail: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.85,
        roughness: 0.2,
      }),
      mountingPlate: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.4,
      }),
      relayPcb: new THREE.MeshStandardMaterial({
        color: '#0284c7',
        roughness: 0.3,
      }),
      relayBox: new THREE.MeshStandardMaterial({
        color: '#2563eb',
        roughness: 0.4,
      }),
      terminals: new THREE.MeshStandardMaterial({
        color: '#15803d',
        roughness: 0.5,
      }),
      screws: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.9,
        roughness: 0.2,
      }),
      copperArmature: new THREE.MeshStandardMaterial({
        color: '#ca8a04',
        metalness: 0.9,
        roughness: 0.2,
      }),
      sirenHousing: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.5,
      }),
      sirenDome: new THREE.MeshPhysicalMaterial({
        color: '#ef4444',
        transmission: 0.8,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
      }),
      sirenReflector: new THREE.MeshStandardMaterial({
        color: '#f1f5f9',
        metalness: 0.95,
        roughness: 0.1,
      }),
      estopYellow: new THREE.MeshStandardMaterial({
        color: '#eab308',
        roughness: 0.3,
      }),
      estopRed: new THREE.MeshStandardMaterial({
        color: '#dc2626',
        roughness: 0.3,
      }),
      pilotChrome: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        metalness: 0.9,
        roughness: 0.1,
      }),
      wireInsulation: new THREE.MeshStandardMaterial({
        color: '#3b82f6',
        roughness: 0.6,
      }),
    };
  }, []);

  useFrame((_, delta) => {
    // 1. Relay mechanical contact motion
    if (armatureRef.current) {
      const targetRot = relayClosed ? 0 : 0.35;
      armatureRef.current.rotation.z = THREE.MathUtils.lerp(
        armatureRef.current.rotation.z,
        targetRot,
        delta * 12
      );
    }

    // 2. Siren rotating beacon animation
    if (sirenRotatorRef.current) {
      if (sirenActive) {
        sirenRotatorRef.current.rotation.y += delta * 15;
      }
    }
    if (sirenLightRef.current) {
      sirenLightRef.current.intensity = sirenActive ? 2.5 : 0;
    }

    // 3. E-stop button depression
    if (eStopButtonRef.current) {
      const targetY = eStopPushed ? 0.08 : 0.16;
      eStopButtonRef.current.position.y = THREE.MathUtils.lerp(
        eStopButtonRef.current.position.y,
        targetY,
        delta * 10
      );
    }
  });

  return (
    <group position={position} name="Physical_Safety_Hardware">
      {/* Structural Industrial DIN Panel Mounting Plate */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow material={materials.mountingPlate}>
        <boxGeometry args={[3.2, 0.08, 2.2]} />
      </mesh>
      {/* Aluminum DIN Rails */}
      <mesh position={[0, 0.06, 0.5]} material={materials.dinRail}>
        <boxGeometry args={[3.0, 0.04, 0.12]} />
      </mesh>
      <mesh position={[0, 0.06, -0.5]} material={materials.dinRail}>
        <boxGeometry args={[3.0, 0.04, 0.12]} />
      </mesh>
      {/* Pedestal Stand from floor */}
      <mesh position={[0, -1.2, 0]} material={materials.dinRail}>
        <cylinderGeometry args={[0.08, 0.1, 2.4, 16]} />
      </mesh>

      {/* ==================================================== */}
      {/* 1. OPTOCOUPLED SAFETY RELAY MODULE                  */}
      {/* ==================================================== */}
      <group position={[-0.9, 0.1, 0.5]}>
        {/* Component Highlight */}
        <ComponentHighlight
          active={isRelayHighlit}
          color="#ef4444"
          label="RELAY TRIPPED"
          changeDetail="Contacts: MECHANICAL OPEN"
          size={[1.1, 0.8, 0.9]}
          offsetY={0.2}
        />

        {/* PCB Board */}
        <mesh material={materials.relayPcb}>
          <boxGeometry args={[0.9, 0.04, 0.7]} />
        </mesh>
        {/* Blue Sealed Relay Block */}
        <mesh position={[0, 0.16, -0.05]} material={materials.relayBox}>
          <boxGeometry args={[0.5, 0.28, 0.35]} />
        </mesh>

        {/* Moving Contact Armature Indicator */}
        <group ref={armatureRef} position={[0, 0.32, -0.05]}>
          <mesh position={[0.08, 0.02, 0]} material={materials.copperArmature}>
            <boxGeometry args={[0.16, 0.02, 0.04]} />
          </mesh>
        </group>

        {/* Optocoupler Chip */}
        <mesh position={[-0.3, 0.04, -0.1]} material={materials.sirenHousing}>
          <boxGeometry args={[0.12, 0.04, 0.1]} />
        </mesh>

        {/* 3-pin Green Screw Terminal Block */}
        <mesh position={[0, 0.08, 0.24]} material={materials.terminals}>
          <boxGeometry args={[0.6, 0.12, 0.14]} />
        </mesh>
        {[-0.18, 0, 0.18].map((sx, i) => (
          <mesh key={`screw-${i}`} position={[sx, 0.15, 0.24]} material={materials.screws}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
          </mesh>
        ))}

        {/* Relay Contact Status LED */}
        <mesh position={[0.3, 0.04, -0.2]}>
          <boxGeometry args={[0.04, 0.04, 0.04]} />
          <meshBasicMaterial color={relayClosed ? '#22c55e' : '#ef4444'} />
        </mesh>

        {/* ASD-STE100 Tag */}
        <Html position={[0, 0.5, 0.2]} center distanceFactor={8} className="pointer-events-none select-none">
          <div className="flex flex-col items-center bg-white/95 px-2 py-0.5 rounded border border-slate-300 shadow-sm text-center">
            <span className="font-mono text-[11px] font-bold text-slate-800">RELAY</span>
            <span className={`font-mono text-[9px] font-semibold ${relayClosed ? 'text-emerald-600' : 'text-red-600'}`}>
              {relayClosed ? 'CLOSED' : 'OPEN'}
            </span>
          </div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 2. INDUSTRIAL WARNING SIREN / ROTATING BEACON        */}
      {/* ==================================================== */}
      <group position={[0.9, 0.1, 0.5]}>
        {/* Component Highlight */}
        <ComponentHighlight
          active={isSirenHighlit}
          color="#ef4444"
          label="SIREN ACTIVE"
          changeDetail="Emergency Alarm Beacon On"
          size={[0.9, 1.0, 0.9]}
          offsetY={0.3}
        />

        {/* Base bracket */}
        <mesh position={[0, 0.06, 0]} material={materials.sirenHousing}>
          <cylinderGeometry args={[0.22, 0.26, 0.12, 24]} />
        </mesh>
        {/* Transparent Red Lens Dome */}
        <mesh position={[0, 0.28, 0]} material={materials.sirenDome}>
          <cylinderGeometry args={[0.2, 0.22, 0.32, 24]} />
        </mesh>
        {/* Internal Rotating Reflector Mirror */}
        <group ref={sirenRotatorRef} position={[0, 0.28, 0]}>
          <mesh position={[0, 0, 0.06]} material={materials.sirenReflector}>
            <boxGeometry args={[0.12, 0.2, 0.04]} />
          </mesh>
          <mesh material={materials.copperArmature}>
            <sphereGeometry args={[0.04, 12, 12]} />
          </mesh>
        </group>
        {/* Pulsing Light */}
        <pointLight
          ref={sirenLightRef}
          position={[0, 0.35, 0]}
          color="#ef4444"
          distance={4}
          intensity={0}
        />

        {/* ASD-STE100 Tag */}
        <Html position={[0, 0.6, 0]} center distanceFactor={8} className="pointer-events-none select-none">
          <div className="flex flex-col items-center bg-white/95 px-2 py-0.5 rounded border border-slate-300 shadow-sm text-center">
            <span className="font-mono text-[11px] font-bold text-slate-800">SIREN</span>
            <span className={`font-mono text-[9px] font-semibold ${sirenActive ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
              {sirenActive ? 'ALARM ON' : 'STANDBY'}
            </span>
          </div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 3. INDUSTRIAL EMERGENCY STOP (E-STOP)               */}
      {/* ==================================================== */}
      <group position={[-0.9, 0.1, -0.5]}>
        {/* Component Highlight */}
        <ComponentHighlight
          active={isEstopHighlit}
          color="#ef4444"
          label="E-STOP TRIPPED"
          changeDetail="Hardware Circuit Interrupted"
          size={[0.9, 0.8, 0.9]}
          offsetY={0.2}
        />

        {/* Cast housing box */}
        <mesh position={[0, 0.06, 0]} material={materials.sirenHousing}>
          <boxGeometry args={[0.45, 0.12, 0.45]} />
        </mesh>
        {/* Yellow Safety Bezel Dial */}
        <mesh position={[0, 0.125, 0]} material={materials.estopYellow}>
          <cylinderGeometry args={[0.22, 0.22, 0.015, 24]} />
        </mesh>
        {/* Red Mushroom Button Head */}
        <mesh
          ref={eStopButtonRef}
          position={[0, 0.16, 0]}
          material={materials.estopRed}
        >
          <cylinderGeometry args={[0.18, 0.14, 0.1, 24]} />
        </mesh>

        {/* ASD-STE100 Tag */}
        <Html position={[0, 0.45, 0]} center distanceFactor={8} className="pointer-events-none select-none">
          <div className="flex flex-col items-center bg-white/95 px-2 py-0.5 rounded border border-slate-300 shadow-sm text-center">
            <span className="font-mono text-[11px] font-bold text-slate-800">E-STOP</span>
            <span className={`font-mono text-[9px] font-semibold ${eStopPushed ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
              {eStopPushed ? 'TRIPPED' : 'ARMED'}
            </span>
          </div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 4. INDUSTRIAL STATUS LED (22mm Pilot Lamp)           */}
      {/* ==================================================== */}
      <group position={[0.9, 0.1, -0.5]}>
        <mesh position={[0, 0.04, 0]} material={materials.pilotChrome}>
          <cylinderGeometry args={[0.16, 0.18, 0.08, 20]} />
        </mesh>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
          <meshBasicMaterial color={relayClosed ? '#22c55e' : '#ef4444'} />
        </mesh>

        {/* ASD-STE100 Tag */}
        <Html position={[0, 0.35, 0]} center distanceFactor={8} className="pointer-events-none select-none">
          <div className="flex flex-col items-center bg-white/95 px-2 py-0.5 rounded border border-slate-300 shadow-sm text-center">
            <span className="font-mono text-[11px] font-bold text-slate-800">SAFETY LED</span>
            <span className={`font-mono text-[9px] font-semibold ${relayClosed ? 'text-emerald-600' : 'text-red-600'}`}>
              {relayClosed ? 'OK' : 'FAULT'}
            </span>
          </div>
        </Html>
      </group>

      {/* ==================================================== */}
      {/* 5. PHYSICAL WIRING HARNESS                           */}
      {/* ==================================================== */}
      <group position={[-1.6, 0.4, 0]}>
        <mesh position={[-0.4, 0, 0]} material={materials.wireInsulation}>
          <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        </mesh>
      </group>
    </group>
  );
}
