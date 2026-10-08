'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

export function ProductionLine({ position = [4.5, 0, 2.8] }: { position?: [number, number, number] }) {
  const productionActive = useSimulationStore((s) => s.productionActive);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);

  const isHighlighted = activeHighlights.includes('PRODUCTION');

  // Animation references
  const robotBaseRef = useRef<THREE.Group>(null);
  const robotArm1Ref = useRef<THREE.Group>(null);
  const robotArm2Ref = useRef<THREE.Group>(null);
  const workpiecesGroupRef = useRef<THREE.Group>(null);
  const motorFanRef = useRef<THREE.Mesh>(null);

  const materials = useMemo(() => {
    return {
      machineGrey: new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.4,
        metalness: 0.5,
      }),
      robotOrange: new THREE.MeshStandardMaterial({
        color: '#ea580c',
        roughness: 0.3,
        metalness: 0.2,
      }),
      robotJoint: new THREE.MeshStandardMaterial({
        color: '#0f172a',
        metalness: 0.8,
        roughness: 0.2,
      }),
      beltBlack: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.8,
      }),
      rollers: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.9,
        roughness: 0.2,
      }),
      workpieceMetal: new THREE.MeshStandardMaterial({
        color: '#38bdf8',
        roughness: 0.2,
        metalness: 0.4,
      }),
      motorTeal: new THREE.MeshStandardMaterial({
        color: '#0f766e',
        roughness: 0.5,
      }),
      pipeChrome: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.85,
        roughness: 0.2,
      }),
    };
  }, []);

  useFrame((st, delta) => {
    if (!productionActive) return;

    // 1. Robotic arm articulation
    const t = st.clock.elapsedTime * 1.5;
    if (robotBaseRef.current) {
      robotBaseRef.current.rotation.y = Math.sin(t * 0.7) * 0.6;
    }
    if (robotArm1Ref.current) {
      robotArm1Ref.current.rotation.z = 0.3 + Math.sin(t) * 0.25;
    }
    if (robotArm2Ref.current) {
      robotArm2Ref.current.rotation.z = -0.5 + Math.cos(t) * 0.3;
    }

    // 2. Conveyor belt workpieces moving along X axis
    if (workpiecesGroupRef.current) {
      workpiecesGroupRef.current.children.forEach((child) => {
        child.position.x += delta * 1.2;
        if (child.position.x > 3.2) {
          child.position.x = -3.2;
        }
      });
    }

    // 3. Motor cooling fan spinning
    if (motorFanRef.current) {
      motorFanRef.current.rotation.x += delta * 25;
    }
  });

  return (
    <group position={position} name="Physical_Production_Line">
      {/* 3D CAD Highlighting Component Box */}
      <ComponentHighlight
        active={isHighlighted}
        color="#ef4444"
        label="PRODUCTION HALTED"
        changeDetail="Interlock Tripped -> Conveyor & Robot Frozen"
        size={[7.2, 2.2, 3.2]}
        offsetY={1.0}
      />

      {/* ==================================================== */}
      {/* 1. INDUSTRIAL CONVEYOR BELT                          */}
      {/* ==================================================== */}
      <group position={[0, 0.6, 0]}>
        <mesh position={[0, 0, 0]} castShadow material={materials.machineGrey}>
          <boxGeometry args={[6.8, 0.2, 0.9]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} material={materials.beltBlack}>
          <boxGeometry args={[6.6, 0.04, 0.75]} />
        </mesh>
        {[-3.0, -1.0, 1.0, 3.0].map((lx) => (
          <group key={`cleg-${lx}`} position={[lx, -0.4, 0]}>
            <mesh position={[0, 0, 0.4]} material={materials.machineGrey}>
              <boxGeometry args={[0.08, 0.6, 0.08]} />
            </mesh>
            <mesh position={[0, 0, -0.4]} material={materials.machineGrey}>
              <boxGeometry args={[0.08, 0.6, 0.08]} />
            </mesh>
          </group>
        ))}

        {/* Moving Industrial Workpieces */}
        <group ref={workpiecesGroupRef} position={[0, 0.2, 0]}>
          {[-2.8, -1.4, 0, 1.4, 2.8].map((initX, i) => (
            <mesh key={`wp-${i}`} position={[initX, 0, 0]} castShadow material={materials.workpieceMetal}>
              <cylinderGeometry args={[0.15, 0.15, 0.14, 16]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ==================================================== */}
      {/* 2. INDUSTRIAL 6-AXIS ROBOTIC ARM                     */}
      {/* ==================================================== */}
      <group position={[0, 0, -1.3]}>
        <mesh position={[0, 0.2, 0]} material={materials.robotJoint}>
          <cylinderGeometry args={[0.45, 0.5, 0.4, 24]} />
        </mesh>

        <group ref={robotBaseRef} position={[0, 0.4, 0]}>
          <mesh position={[0, 0.2, 0]} material={materials.robotOrange}>
            <cylinderGeometry args={[0.35, 0.4, 0.4, 24]} />
          </mesh>

          <group ref={robotArm1Ref} position={[0, 0.4, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.robotJoint}>
              <cylinderGeometry args={[0.2, 0.2, 0.35, 20]} />
            </mesh>
            <mesh position={[0, 0.6, 0]} material={materials.robotOrange}>
              <boxGeometry args={[0.2, 1.2, 0.25]} />
            </mesh>

            <group ref={robotArm2Ref} position={[0, 1.2, 0]}>
              <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.robotJoint}>
                <cylinderGeometry args={[0.16, 0.16, 0.3, 20]} />
              </mesh>
              <mesh position={[0.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={materials.robotOrange}>
                <boxGeometry args={[0.16, 0.8, 0.2]} />
              </mesh>
              <mesh position={[0.85, 0, 0]} material={materials.robotJoint}>
                <boxGeometry args={[0.1, 0.18, 0.18]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* ==================================================== */}
      {/* 3. INDUSTRIAL DRIVE MOTOR & PUMP ASSEMBLY            */}
      {/* ==================================================== */}
      <group position={[-2.8, 0.35, 0.9]}>
        <mesh rotation={[0, 0, Math.PI / 2]} material={materials.motorTeal}>
          <cylinderGeometry args={[0.25, 0.25, 0.6, 20]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} material={materials.machineGrey}>
          <boxGeometry args={[0.2, 0.12, 0.2]} />
        </mesh>
        <mesh ref={motorFanRef} position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.machineGrey}>
          <cylinderGeometry args={[0.22, 0.22, 0.08, 12]} />
        </mesh>
        <mesh position={[0.4, 0, 0]} material={materials.machineGrey}>
          <cylinderGeometry args={[0.3, 0.3, 0.25, 20]} />
        </mesh>
        <mesh position={[0.4, 0.5, 0]} material={materials.pipeChrome}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        </mesh>
      </group>

      {/* Label */}
      <Html position={[0, 1.8, 0]} center distanceFactor={9} className="pointer-events-none select-none">
        <div className="flex flex-col items-center bg-white/95 backdrop-blur-md px-2.5 py-1 rounded border border-slate-300 shadow-sm whitespace-nowrap">
          <span className="font-mono text-xs font-bold text-slate-800">PRODUCTION CELL</span>
          <span className={`font-mono text-[10px] font-semibold ${productionActive ? 'text-emerald-600' : 'text-red-600'}`}>
            {productionActive ? 'RUNNING' : 'MACHINE STOPPED'}
          </span>
        </div>
      </Html>
    </group>
  );
}
