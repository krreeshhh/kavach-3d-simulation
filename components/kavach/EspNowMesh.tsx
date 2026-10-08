'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { ComponentHighlight } from './ComponentHighlight';

interface NodePos {
  id: number;
  pos: [number, number, number];
  name: string;
}

export function EspNowMesh() {
  const espNowAlert = useSimulationStore((s) => s.espNowAlert);
  const state = useSimulationStore((s) => s.state);
  const activeHighlights = useSimulationStore((s) => s.activeHighlights);

  const isHighlighted = activeHighlights.includes('ESPNOW');
  const isAlerting = espNowAlert || state === 'DECEIVED';

  // 4 distributed peer nodes positioned elevated around the facility
  const peerNodes: NodePos[] = useMemo(
    () => [
      { id: 1, pos: [-4.0, 5.2, -6.0], name: 'PEER-01' },
      { id: 2, pos: [3.0, 5.2, -6.0], name: 'PEER-02' },
      { id: 3, pos: [6.5, 5.2, -3.0], name: 'PEER-03' },
      { id: 4, pos: [7.5, 5.2, 3.5], name: 'PEER-04' },
    ],
    []
  );

  const lifelinePos: [number, number, number] = [4.0, 3.2, 0];

  const materials = useMemo(() => {
    return {
      nodeCase: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.4,
      }),
      nodeAntenna: new THREE.MeshStandardMaterial({
        color: '#ca8a04',
        metalness: 0.8,
        roughness: 0.3,
      }),
      wireHanger: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.6,
        roughness: 0.3,
      }),
    };
  }, []);

  const curves = useMemo(() => {
    return peerNodes.map((node) => {
      const p1 = new THREE.Vector3(...lifelinePos);
      const p2 = new THREE.Vector3(...node.pos);
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      mid.y += 1.2;
      return new THREE.QuadraticBezierCurve3(p1, mid, p2);
    });
  }, [peerNodes]);

  const ringRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.children.forEach((mesh) => {
        mesh.scale.x += delta * 1.8;
        mesh.scale.y += delta * 1.8;
        if (mesh.scale.x > 2.2) {
          mesh.scale.set(0.2, 0.2, 0.2);
        }
      });
    }
  });

  return (
    <group name="EspNow_Mesh_Network">
      {/* 3D CAD Highlighting Component Box around the primary peer node */}
      <group position={peerNodes[0].pos}>
        <ComponentHighlight
          active={isHighlighted}
          color="#0284c7"
          label="ESP-NOW BROADCAST"
          changeDetail="Encrypted Peer Defense Alert Synced"
          size={[1.0, 0.8, 1.0]}
          offsetY={0.1}
        />
      </group>

      {/* Wireless Arcs between Lifeline and Peer Nodes */}
      {curves.map((curve, idx) => {
        const points = curve.getPoints(24);
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <primitive key={`esp-line-${idx}`} object={new THREE.Line(
            lineGeo,
            new THREE.LineDashedMaterial({
              color: isAlerting ? '#0284c7' : '#94a3b8',
              dashSize: 0.3,
              gapSize: 0.15,
              transparent: true,
              opacity: isAlerting ? 0.85 : 0.45,
            })
          )} />
        );
      })}

      {/* Ripple Rings around Lifeline when broadcasting */}
      <group ref={ringRef} position={lifelinePos}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={`ring-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={isAlerting}
          >
            <ringGeometry args={[0.6, 0.68, 32]} />
            <meshBasicMaterial
              color="#0284c7"
              transparent
              opacity={0.6 - i * 0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Distributed ESP32-S3 Peer Nodes */}
      {peerNodes.map((node) => (
        <group key={`peer-${node.id}`} position={node.pos}>
          {/* Ceiling Suspension Rod */}
          <mesh position={[0, 0.8, 0]} material={materials.wireHanger}>
            <cylinderGeometry args={[0.015, 0.015, 1.6, 8]} />
          </mesh>

          {/* Compact Enclosure */}
          <mesh material={materials.nodeCase}>
            <boxGeometry args={[0.45, 0.22, 0.35]} />
          </mesh>

          {/* External Dipole Antenna */}
          <mesh position={[0.2, 0.18, 0]} material={materials.nodeAntenna}>
            <cylinderGeometry args={[0.01, 0.01, 0.25, 8]} />
          </mesh>

          {/* Wireless LED */}
          <mesh position={[0, 0.115, 0.12]}>
            <boxGeometry args={[0.04, 0.02, 0.04]} />
            <meshBasicMaterial
              color={isAlerting ? '#0284c7' : '#10b981'}
            />
          </mesh>

          {/* Minimal Label */}
          <Html position={[0, 0.45, 0]} center distanceFactor={10} className="pointer-events-none select-none">
            <div className="flex flex-col items-center bg-white/95 px-2 py-0.5 rounded border border-slate-300 shadow-sm text-center">
              <span className="font-mono text-[9px] font-bold text-slate-700">ESP-NOW</span>
              <span className="font-mono text-[8px] text-slate-500">{node.name}</span>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}
