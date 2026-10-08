'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export function Factory() {
  // Memoized materials for performance
  const materials = useMemo(() => {
    return {
      floor: new THREE.MeshStandardMaterial({
        color: '#f1f5f9',
        roughness: 0.25,
        metalness: 0.1,
      }),
      floorMarking: new THREE.MeshStandardMaterial({
        color: '#e2e8f0',
        roughness: 0.4,
      }),
      hazardYellow: new THREE.MeshStandardMaterial({
        color: '#facc15',
        roughness: 0.5,
      }),
      hazardBlack: new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.5,
      }),
      steelColumn: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.7,
        roughness: 0.3,
      }),
      trussSteel: new THREE.MeshStandardMaterial({
        color: '#cbd5e1',
        metalness: 0.6,
        roughness: 0.4,
      }),
      railingYellow: new THREE.MeshStandardMaterial({
        color: '#f59e0b',
        roughness: 0.3,
      }),
      concreteBase: new THREE.MeshStandardMaterial({
        color: '#64748b',
        roughness: 0.8,
      }),
      cableTray: new THREE.MeshStandardMaterial({
        color: '#94a3b8',
        metalness: 0.4,
        roughness: 0.5,
      }),
      windowGlass: new THREE.MeshPhysicalMaterial({
        color: '#e0f2fe',
        transmission: 0.85,
        opacity: 0.35,
        transparent: true,
        roughness: 0.1,
        ior: 1.4,
      }),
      wallLight: new THREE.MeshStandardMaterial({
        color: '#f8fafc',
        roughness: 0.9,
      }),
    };
  }, []);

  return (
    <group name="Factory_Environment">
      {/* 1. Main Factory Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        material={materials.floor}
      >
        <planeGeometry args={[36, 26]} />
      </mesh>

      {/* Grid Floor Tiles Overlay */}
      <gridHelper
        args={[36, 36, '#cbd5e1', '#e2e8f0']}
        position={[0, 0.001, 0]}
      />

      {/* 2. Safety Hazard Strips (Yellow / Black Boundaries) */}
      {/* Production Zone Border */}
      <group position={[3.5, 0.005, 2.5]}>
        {/* Outer safety line */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[9.5, 5.5]} />
          <meshBasicMaterial color="#f1f5f9" />
        </mesh>
        {/* Rectangular boundary border */}
        <mesh position={[0, 0.002, 2.8]} rotation={[-Math.PI / 2, 0, 0]} material={materials.hazardYellow}>
          <planeGeometry args={[9.5, 0.15]} />
        </mesh>
        <mesh position={[0, 0.002, -2.8]} rotation={[-Math.PI / 2, 0, 0]} material={materials.hazardYellow}>
          <planeGeometry args={[9.5, 0.15]} />
        </mesh>
        <mesh position={[-4.75, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.hazardYellow}>
          <planeGeometry args={[0.15, 5.75]} />
        </mesh>
        <mesh position={[4.75, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.hazardYellow}>
          <planeGeometry args={[0.15, 5.75]} />
        </mesh>
      </group>

      {/* Cyber Security & KAVACH Zone Border */}
      <group position={[2.0, 0.005, -2.0]}>
        <mesh position={[0, 0.002, 3.2]} rotation={[-Math.PI / 2, 0, 0]} material={materials.floorMarking}>
          <planeGeometry args={[12.5, 0.1]} />
        </mesh>
        <mesh position={[0, 0.002, -3.2]} rotation={[-Math.PI / 2, 0, 0]} material={materials.floorMarking}>
          <planeGeometry args={[12.5, 0.1]} />
        </mesh>
        <mesh position={[-6.25, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.floorMarking}>
          <planeGeometry args={[0.1, 6.5]} />
        </mesh>
        <mesh position={[6.25, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.floorMarking}>
          <planeGeometry args={[0.1, 6.5]} />
        </mesh>
      </group>

      {/* 3. Structural Columns with footings */}
      {[
        [-11, -8],
        [-11, 8],
        [-2, -8],
        [-2, 8],
        [8, -8],
        [8, 8],
      ].map(([x, z], idx) => (
        <group key={`column-${idx}`} position={[x, 0, z]}>
          {/* Concrete Footing */}
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow material={materials.concreteBase}>
            <boxGeometry args={[0.9, 0.5, 0.9]} />
          </mesh>
          {/* Main H-beam / Column */}
          <mesh position={[0, 3.75, 0]} castShadow material={materials.steelColumn}>
            <boxGeometry args={[0.4, 6.5, 0.4]} />
          </mesh>
          {/* Top bracket */}
          <mesh position={[0, 6.8, 0]} material={materials.trussSteel}>
            <boxGeometry args={[0.7, 0.4, 0.7]} />
          </mesh>
        </group>
      ))}

      {/* 4. Overhead Roof Trusses */}
      {[-8, 8].map((z, i) => (
        <group key={`truss-${i}`} position={[0, 7.0, z]}>
          <mesh material={materials.trussSteel}>
            <boxGeometry args={[26, 0.25, 0.25]} />
          </mesh>
          {/* Diagonal struts */}
          {[-8, -4, 0, 4, 8].map((x) => (
            <mesh key={`strut-${x}`} position={[x, -0.4, 0]} material={materials.trussSteel}>
              <cylinderGeometry args={[0.04, 0.04, 1.2, 6]} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Cross beams connecting trusses */}
      {[-11, -2, 8].map((x, i) => (
        <mesh key={`crossbeam-${i}`} position={[x, 7.0, 0]} material={materials.trussSteel}>
          <boxGeometry args={[0.25, 0.25, 16.5]} />
        </mesh>
      ))}

      {/* 5. Overhead Cable Trays */}
      <group position={[0, 5.0, 0]}>
        <mesh material={materials.cableTray}>
          <boxGeometry args={[18, 0.08, 0.4]} />
        </mesh>
        {/* Tray hangers from roof */}
        {[-8, -3, 2, 7].map((x) => (
          <mesh key={`hanger-${x}`} position={[x, 1.0, 0]} material={materials.trussSteel}>
            <cylinderGeometry args={[0.02, 0.02, 2.0, 6]} />
          </mesh>
        ))}
      </group>

      {/* 6. Perimeter Industrial Rear Wall & Windows */}
      <group position={[0, 3.5, -11]}>
        {/* Lower solid concrete wall */}
        <mesh position={[0, -1.75, 0]} receiveShadow material={materials.wallLight}>
          <boxGeometry args={[32, 3.5, 0.4]} />
        </mesh>
        {/* Upper architectural glass window frames */}
        {[-10, -5, 0, 5, 10].map((x, i) => (
          <group key={`win-${i}`} position={[x, 1.2, 0]}>
            <mesh material={materials.windowGlass}>
              <boxGeometry args={[4.2, 2.4, 0.1]} />
            </mesh>
            {/* Window Mullions */}
            <mesh position={[0, 0, 0.05]} material={materials.steelColumn}>
              <boxGeometry args={[4.4, 0.08, 0.05]} />
            </mesh>
            <mesh position={[0, 0, 0.05]} material={materials.steelColumn}>
              <boxGeometry args={[0.08, 2.5, 0.05]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 7. Safety Railings along perimeter */}
      {[-7, -3, 1, 5].map((x) => (
        <group key={`rail-${x}`} position={[x, 0, 6.0]}>
          <mesh position={[0, 0.5, 0]} material={materials.railingYellow}>
            <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
          </mesh>
          <mesh position={[0, 0.95, 0.5]} rotation={[0, 0, Math.PI / 2]} material={materials.railingYellow}>
            <cylinderGeometry args={[0.03, 0.03, 1.0, 8]} />
          </mesh>
          <mesh position={[0, 0.5, 0.5]} rotation={[0, 0, Math.PI / 2]} material={materials.railingYellow}>
            <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
          </mesh>
        </group>
      ))}

      {/* 8. Outside Perimeter Boundary Separator (where Rogue Attacker sits) */}
      <group position={[-8.5, 0, 0]}>
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]} material={materials.hazardYellow}>
          <planeGeometry args={[0.2, 14]} />
        </mesh>
        <mesh position={[0, 0.6, 0]} material={materials.steelColumn}>
          <boxGeometry args={[0.05, 1.2, 12]} />
        </mesh>
      </group>
    </group>
  );
}
