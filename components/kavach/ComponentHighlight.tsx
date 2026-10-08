'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface ComponentHighlightProps {
  active: boolean;
  color: string;
  label?: string;
  changeDetail?: string;
  size?: [number, number, number];
  offsetY?: number;
}

export function ComponentHighlight({
  active,
  color = '#ef4444',
  label,
  changeDetail,
  size = [1.6, 1.2, 1.2],
  offsetY = 0,
}: ComponentHighlightProps) {
  const [w, h, d] = size;
  const boxRef = useRef<THREE.Group>(null);
  const scanPlaneRef = useRef<THREE.Mesh>(null);

  // Generate corner bracket lines for industrial CAD aesthetic
  const cornerLines = useMemo(() => {
    const hw = w / 2;
    const hh = h / 2;
    const hd = d / 2;
    const arm = Math.min(w, h, d) * 0.22;

    const points: THREE.Vector3[] = [];
    const corners = [
      [-hw, -hh, -hd],
      [hw, -hh, -hd],
      [-hw, hh, -hd],
      [hw, hh, -hd],
      [-hw, -hh, hd],
      [hw, -hh, hd],
      [-hw, hh, hd],
      [hw, hh, hd],
    ];

    corners.forEach(([cx, cy, cz]) => {
      const c = new THREE.Vector3(cx, cy, cz);
      const sx = cx > 0 ? -arm : arm;
      const sy = cy > 0 ? -arm : arm;
      const sz = cz > 0 ? -arm : arm;

      // X arm
      points.push(c.clone(), new THREE.Vector3(cx + sx, cy, cz));
      // Y arm
      points.push(c.clone(), new THREE.Vector3(cx, cy + sy, cz));
      // Z arm
      points.push(c.clone(), new THREE.Vector3(cx, cy, cz + sz));
    });

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [w, h, d]);

  useFrame((st, delta) => {
    if (!active) return;

    if (scanPlaneRef.current) {
      scanPlaneRef.current.position.y += delta * 1.5;
      if (scanPlaneRef.current.position.y > h / 2) {
        scanPlaneRef.current.position.y = -h / 2;
      }
    }

    if (boxRef.current) {
      const pulse = 1 + (Math.sin(st.clock.elapsedTime * 6) + 1) * 0.02;
      boxRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  if (!active) return null;

  return (
    <group position={[0, offsetY, 0]} name="Component_Highlighter">
      {/* 1. Animated CAD Corner Brackets */}
      <group ref={boxRef}>
        <primitive
          object={
            new THREE.LineSegments(
              cornerLines,
              new THREE.LineBasicMaterial({
                color,
                linewidth: 2,
                transparent: true,
                opacity: 0.9,
              })
            )
          }
        />

        {/* 2. Semi-transparent Wireframe Bounding Box */}
        <mesh>
          <boxGeometry args={[w, h, d]} />
          <meshBasicMaterial
            color={color}
            wireframe
            transparent
            opacity={0.15}
          />
        </mesh>
      </group>

      {/* 3. Sweeping Laser Scan Line */}
      <mesh ref={scanPlaneRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -h / 2, 0]}>
        <planeGeometry args={[w * 0.98, d * 0.98]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 4. High-Visibility Change Badge */}
      {label && changeDetail && (
        <Html
          position={[0, h / 2 + 0.4, 0]}
          center
          distanceFactor={9}
          className="pointer-events-none select-none z-30"
        >
          <div
            className="flex flex-col items-center px-2.5 py-1.5 rounded-md border shadow-xl backdrop-blur-md animate-bounce"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              borderColor: color,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: color }}
              />
              <span
                className="font-mono text-xs font-black tracking-wider uppercase"
                style={{ color }}
              >
                {label}
              </span>
            </div>
            <span className="font-mono text-[10px] font-semibold text-slate-800 whitespace-nowrap mt-0.5">
              {changeDetail}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}
