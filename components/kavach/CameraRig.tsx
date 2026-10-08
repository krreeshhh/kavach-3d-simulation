'use client';

import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/simulation/simulationEngine';
import { CameraViewPreset } from '@/lib/simulation/types';

interface PresetConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

const PRESETS: Record<CameraViewPreset, PresetConfig> = {
  OVERVIEW: {
    position: new THREE.Vector3(0, 14, 18),
    target: new THREE.Vector3(0, 2.0, 0),
  },
  NETWORK: {
    position: new THREE.Vector3(-3.0, 6.5, 6.5),
    target: new THREE.Vector3(-3.0, 3.2, 0),
  },
  SENTINEL: {
    position: new THREE.Vector3(0.5, 4.5, 3.8),
    target: new THREE.Vector3(0.5, 3.2, 0),
  },
  LIFELINE: {
    position: new THREE.Vector3(4.0, 4.5, 3.8),
    target: new THREE.Vector3(4.0, 3.2, 0),
  },
  SAFETY: {
    position: new THREE.Vector3(7.0, 3.8, 3.2),
    target: new THREE.Vector3(7.0, 2.4, 0),
  },
  ATTACK_DECEPTION: {
    position: new THREE.Vector3(-1.0, 6.5, 6.0),
    target: new THREE.Vector3(-0.5, 3.2, -2.0),
  },
  ESP_NOW: {
    position: new THREE.Vector3(1.0, 9.5, 11.0),
    target: new THREE.Vector3(1.0, 4.5, -2.0),
  },
  PRODUCTION: {
    position: new THREE.Vector3(4.5, 3.5, 6.5),
    target: new THREE.Vector3(4.5, 1.2, 2.8),
  },
  TOP: {
    position: new THREE.Vector3(0, 24, 0.001),
    target: new THREE.Vector3(0, 0, 0),
  },
  ISOMETRIC: {
    position: new THREE.Vector3(14, 14, 14),
    target: new THREE.Vector3(0, 1.5, 0),
  },
  FRONT: {
    position: new THREE.Vector3(0, 4.0, 16.0),
    target: new THREE.Vector3(0, 2.0, 0),
  },
  SIDE: {
    position: new THREE.Vector3(-16.0, 4.0, 0),
    target: new THREE.Vector3(0, 2.0, 0),
  },
};

const TOUR_SEQUENCE: CameraViewPreset[] = [
  'OVERVIEW',
  'NETWORK',
  'SENTINEL',
  'LIFELINE',
  'SAFETY',
  'ATTACK_DECEPTION',
  'ESP_NOW',
  'PRODUCTION',
];

export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraPreset = useSimulationStore((s) => s.cameraPreset);
  const autoTour = useSimulationStore((s) => s.autoTour);
  const setCameraPreset = useSimulationStore((s) => s.setCameraPreset);
  const toggleAutoTour = useSimulationStore((s) => s.toggleAutoTour);
  const { camera, gl } = useThree();

  const tourIndex = useRef(0);
  const tourTimer = useRef(0);

  // Active smooth relocation interpolation state
  const isTransitioning = useRef(false);
  const desiredPos = useRef(new THREE.Vector3(0, 14, 18));
  const desiredTarget = useRef(new THREE.Vector3(0, 2.0, 0));

  // Trigger smooth transition when preset changes
  useEffect(() => {
    const preset = PRESETS[cameraPreset];
    if (preset) {
      desiredPos.current.copy(preset.position);
      desiredTarget.current.copy(preset.target);
      isTransitioning.current = true;
    }
  }, [cameraPreset]);

  // Support double-click to relocate view and orbit target to any clicked 3D surface point
  useEffect(() => {
    const domElement = gl.domElement;
    const handleDoubleClick = (event: MouseEvent) => {
      if (!controlsRef.current) return;

      const rect = domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Raycast against scene objects
      const intersects = raycaster.intersectObjects(
        camera.parent?.children || [],
        true
      );

      // Filter out helpers and particles
      const validHit = intersects.find(
        (hit) =>
          hit.point &&
          hit.object.type === 'Mesh' &&
          hit.object.name !== 'ContactShadows'
      );

      if (validHit) {
        const hitPt = validHit.point;
        desiredTarget.current.copy(hitPt);

        // Keep current view direction, but focus closer to the hit point
        const dir = camera.position.clone().sub(controlsRef.current.target).normalize();
        const dist = Math.min(Math.max(camera.position.distanceTo(controlsRef.current.target), 4), 10);
        desiredPos.current.copy(hitPt).add(dir.multiplyScalar(dist));

        isTransitioning.current = true;
      }
    };

    domElement.addEventListener('dblclick', handleDoubleClick);
    return () => {
      domElement.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [gl, camera]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // 1. Automatic tour timer logic
    if (autoTour) {
      tourTimer.current += delta;
      if (tourTimer.current > 7.0) {
        tourTimer.current = 0;
        tourIndex.current = (tourIndex.current + 1) % TOUR_SEQUENCE.length;
        setCameraPreset(TOUR_SEQUENCE[tourIndex.current]);
      }
    }

    // 2. Controlled camera relocation interpolation
    if (isTransitioning.current) {
      const lerpSpeed = delta * 4.0;
      camera.position.lerp(desiredPos.current, lerpSpeed);
      controlsRef.current.target.lerp(desiredTarget.current, lerpSpeed);
      controlsRef.current.update();

      // Check if camera has arrived at the desired relocated position
      const posDist = camera.position.distanceTo(desiredPos.current);
      const targetDist = controlsRef.current.target.distanceTo(desiredTarget.current);

      if (posDist < 0.05 && targetDist < 0.05) {
        // Complete transition: yield full unconstrained control back to OrbitControls
        camera.position.copy(desiredPos.current);
        controlsRef.current.target.copy(desiredTarget.current);
        isTransitioning.current = false;
      }
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.8}
        panSpeed={0.8}
        zoomSpeed={1.0}
        minDistance={2.5}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2 - 0.02} // Prevent camera going underneath the floor
        minPolarAngle={0.05}
        onStart={() => {
          // Immediately stop automated relocation when user interacts manually
          isTransitioning.current = false;
          if (autoTour) {
            toggleAutoTour();
          }
        }}
      />

      {/* Interactive 3D Orientation Gizmo in bottom-left */}
      <GizmoHelper
        alignment="bottom-left"
        margin={[80, 80]}
        onTarget={() => controlsRef.current?.target || desiredTarget.current}
        onUpdate={() => controlsRef.current?.update()}
      >
        <GizmoViewport
          axisColors={['#ef4444', '#10b981', '#0284c7']}
          labelColor="#0f172a"
        />
      </GizmoHelper>
    </>
  );
}
