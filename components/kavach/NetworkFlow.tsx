'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';

interface FlowParticle {
  progress: number;
  speed: number;
  meshIndex: number;
}

export function NetworkFlow() {
  const state = useSimulationStore((s) => s.state);
  const sentinelOnline = useSimulationStore((s) => s.sentinelOnline);
  const simulationSpeed = useSimulationStore((s) => s.simulationSpeed);

  const isIsolated = state === 'ISOLATE';

  // Key system node positions
  const nodes = useMemo(() => {
    return {
      attacker: new THREE.Vector3(-10.5, 1.4, 0),
      scada: new THREE.Vector3(-5.5, 2.8, -3.5),
      hmi: new THREE.Vector3(-5.5, 2.4, 2.5),
      sw: new THREE.Vector3(-3.0, 3.2, 0),
      sentinel: new THREE.Vector3(0.5, 3.3, 0),
      honeypot: new THREE.Vector3(-0.5, 3.3, -4.5),
      lifeline: new THREE.Vector3(4.0, 3.2, 0),
      safety: new THREE.Vector3(7.0, 2.5, 0),
      plc: new THREE.Vector3(0.5, 2.2, 2.5),
      conveyor: new THREE.Vector3(4.5, 1.0, 2.8),
    };
  }, []);

  // Defined curves for network paths
  const curves = useMemo(() => {
    const scadaToSw = new THREE.QuadraticBezierCurve3(
      nodes.scada,
      new THREE.Vector3(-4.5, 3.8, -1.8),
      nodes.sw
    );
    const hmiToSw = new THREE.QuadraticBezierCurve3(
      nodes.hmi,
      new THREE.Vector3(-4.5, 3.6, 1.2),
      nodes.sw
    );
    const swToSentinel = new THREE.LineCurve3(nodes.sw, nodes.sentinel);
    const swToPlc = new THREE.QuadraticBezierCurve3(
      nodes.sw,
      new THREE.Vector3(-1.2, 3.5, 1.5),
      nodes.plc
    );
    const attackerToSw = new THREE.QuadraticBezierCurve3(
      nodes.attacker,
      new THREE.Vector3(-7.0, 3.4, 0),
      nodes.sw
    );
    const sentinelToHoneypot = new THREE.QuadraticBezierCurve3(
      nodes.sentinel,
      new THREE.Vector3(0.2, 3.8, -2.5),
      nodes.honeypot
    );
    const sentinelToLifeline = new THREE.LineCurve3(nodes.sentinel, nodes.lifeline);
    const lifelineToSafety = new THREE.QuadraticBezierCurve3(
      nodes.lifeline,
      new THREE.Vector3(5.5, 3.4, 0),
      nodes.safety
    );
    const safetyToMachine = new THREE.QuadraticBezierCurve3(
      nodes.safety,
      new THREE.Vector3(6.5, 1.8, 1.5),
      nodes.conveyor
    );

    return {
      scadaToSw,
      hmiToSw,
      swToSentinel,
      swToPlc,
      attackerToSw,
      sentinelToHoneypot,
      sentinelToLifeline,
      lifelineToSafety,
      safetyToMachine,
    };
  }, [nodes]);

  // Particle instances setup
  const normalParticles = useRef<FlowParticle[]>([
    { progress: 0.1, speed: 0.45, meshIndex: 0 },
    { progress: 0.5, speed: 0.45, meshIndex: 1 },
    { progress: 0.8, speed: 0.45, meshIndex: 2 },
    { progress: 0.3, speed: 0.4, meshIndex: 3 },
    { progress: 0.7, speed: 0.4, meshIndex: 4 },
  ]);

  const attackParticle = useRef<{ progress: number; stage: 'ATTACK' | 'DECEIVED'; pos: THREE.Vector3 }>({
    progress: 0,
    stage: 'ATTACK',
    pos: new THREE.Vector3(),
  });

  const heartbeatRef = useRef<{ progress: number }>({ progress: 0 });

  // Mesh refs for animated particle dots
  const normalInstancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const attackMeshRef = useRef<THREE.Mesh>(null);
  const heartbeatMeshRef = useRef<THREE.Mesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Frame update loop
  useFrame((_, delta) => {
    // If ISOLATED, completely stop and hide all network packet motion!
    if (isIsolated) {
      if (normalInstancedMeshRef.current) normalInstancedMeshRef.current.visible = false;
      if (attackMeshRef.current) attackMeshRef.current.visible = false;
      if (heartbeatMeshRef.current) heartbeatMeshRef.current.visible = false;
      return;
    }

    const effectiveDelta = delta * simulationSpeed;

    // 1. Normal traffic particles (SCADA -> Switch -> PLC)
    if (normalInstancedMeshRef.current) {
      normalInstancedMeshRef.current.visible = true;
      normalParticles.current.forEach((p, idx) => {
        p.progress = (p.progress + p.speed * effectiveDelta) % 1.0;

        let pt = new THREE.Vector3();
        if (idx < 2) {
          pt = curves.scadaToSw.getPoint(p.progress);
        } else if (idx < 4) {
          pt = curves.hmiToSw.getPoint(p.progress);
        } else {
          pt = curves.swToPlc.getPoint(p.progress);
        }

        dummy.position.copy(pt);
        dummy.scale.setScalar(0.065);
        dummy.updateMatrix();
        normalInstancedMeshRef.current!.setMatrixAt(idx, dummy.matrix);
      });
      normalInstancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Attack & Deception Particle Flow
    if (attackMeshRef.current) {
      if (state === 'ATTACK') {
        attackMeshRef.current.visible = true;
        (attackMeshRef.current.material as THREE.MeshBasicMaterial).color.set('#ef4444');

        attackParticle.current.progress += effectiveDelta * 0.75;
        if (attackParticle.current.progress > 1) attackParticle.current.progress = 1;

        if (attackParticle.current.progress < 0.6) {
          const subP = attackParticle.current.progress / 0.6;
          const pt = curves.attackerToSw.getPoint(subP);
          attackMeshRef.current.position.copy(pt);
        } else {
          const subP = (attackParticle.current.progress - 0.6) / 0.4;
          const pt = curves.swToSentinel.getPoint(subP);
          attackMeshRef.current.position.copy(pt);
        }
      } else if (state === 'DECEIVED') {
        attackMeshRef.current.visible = true;
        (attackMeshRef.current.material as THREE.MeshBasicMaterial).color.set('#8b5cf6');

        attackParticle.current.progress = (attackParticle.current.progress + effectiveDelta * 0.8) % 1.0;
        const pt = curves.sentinelToHoneypot.getPoint(attackParticle.current.progress);
        attackMeshRef.current.position.copy(pt);
      } else {
        attackMeshRef.current.visible = false;
        attackParticle.current.progress = 0;
      }
    }

    // 3. Heartbeat Pulse (Sentinel -> Lifeline)
    if (heartbeatMeshRef.current) {
      if (sentinelOnline && state !== 'SENTINEL_OFFLINE') {
        heartbeatMeshRef.current.visible = true;
        heartbeatRef.current.progress = (heartbeatRef.current.progress + effectiveDelta * 1.0) % 1.0;
        const pt = curves.sentinelToLifeline.getPoint(heartbeatRef.current.progress);
        heartbeatMeshRef.current.position.copy(pt);
      } else {
        heartbeatMeshRef.current.visible = false;
      }
    }
  });

  // Helper to render static path line
  const renderPathLine = (curve: THREE.Curve<THREE.Vector3>, color: string, dashed = false, opacity = 0.5) => {
    const points = curve.getPoints(32);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // If isolated, shift lines to red dashed disconnect
    const effectiveColor = isIsolated ? '#ef4444' : color;
    const effectiveDashed = isIsolated ? true : dashed;
    const effectiveOpacity = isIsolated ? 0.35 : opacity;

    return (
      <primitive
        object={
          new THREE.Line(
            geometry,
            effectiveDashed
              ? new THREE.LineDashedMaterial({
                  color: effectiveColor,
                  dashSize: isIsolated ? 0.4 : 0.2,
                  gapSize: isIsolated ? 0.3 : 0.1,
                  transparent: true,
                  opacity: effectiveOpacity,
                })
              : new THREE.LineBasicMaterial({
                  color: effectiveColor,
                  transparent: true,
                  opacity: effectiveOpacity,
                })
          )
        }
      />
    );
  };

  return (
    <group name="Network_Logical_Layer">
      {/* 1. Network Bus Cables (turn dashed red when isolated) */}
      {renderPathLine(curves.scadaToSw, '#0284c7', false, 0.4)}
      {renderPathLine(curves.hmiToSw, '#0284c7', false, 0.4)}
      {renderPathLine(curves.swToSentinel, '#10b981', false, 0.6)}
      {renderPathLine(curves.swToPlc, '#0284c7', false, 0.4)}
      {renderPathLine(curves.sentinelToHoneypot, '#8b5cf6', true, state === 'DECEIVED' ? 0.9 : 0.25)}
      {renderPathLine(curves.sentinelToLifeline, '#06b6d4', false, sentinelOnline ? 0.7 : 0.2)}
      {renderPathLine(curves.lifelineToSafety, '#0284c7', false, 0.6)}
      {renderPathLine(curves.safetyToMachine, '#64748b', true, 0.4)}
      {renderPathLine(curves.attackerToSw, '#ef4444', true, state === 'ATTACK' ? 0.8 : 0.25)}

      {/* 2. Normal Traffic Particles */}
      <instancedMesh
        ref={normalInstancedMeshRef}
        args={[undefined, undefined, 5]}
        visible={!isIsolated}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#0284c7" />
      </instancedMesh>

      {/* 3. Attack / Deceived Packet */}
      <mesh ref={attackMeshRef} visible={false}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* 4. Heartbeat Pulse Packet */}
      <mesh ref={heartbeatMeshRef} visible={!isIsolated && sentinelOnline}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* 5. Visual "NETWORK ISOLATED / SEVERED" Callout in 3D */}
      {isIsolated && (
        <group position={[-1.2, 3.6, 0]}>
          <Html center distanceFactor={8} className="pointer-events-none select-none">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-mono font-bold rounded shadow-xl border border-red-400 uppercase tracking-widest animate-pulse whitespace-nowrap">
              <span>✕</span>
              <span>NETWORK SEVERED</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
