'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Factory } from './Factory';
import { IndustrialSwitch } from './IndustrialSwitch';
import { ScadaServer } from './ScadaServer';
import { HMI } from './HMI';
import { Sentinel } from './Sentinel';
import { Lifeline } from './Lifeline';
import { SafetyHardware } from './SafetyHardware';
import { Honeypot } from './Honeypot';
import { AttackerNode } from './AttackerNode';
import { EspNowMesh } from './EspNowMesh';
import { SiemensPLC } from './SiemensPLC';
import { ProductionLine } from './ProductionLine';
import { NetworkFlow } from './NetworkFlow';
import { StatusDisplay } from './StatusDisplay';
import { CameraRig } from './CameraRig';

export function KavachScene() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#f8fafc]">
      <Canvas
        camera={{ position: [0, 14, 18], fov: 42 }}
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#f8fafc']} />

        {/* Industrial Engineering Soft Lighting */}
        <ambientLight intensity={0.8} />
        <hemisphereLight
          args={['#ffffff', '#e2e8f0', 0.6]}
          position={[0, 50, 0]}
        />
        <directionalLight
          position={[12, 22, 14]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-12, 12, -10]} intensity={0.4} />

        {/* Subtle ground contact shadow */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.35}
          scale={38}
          blur={1.5}
          far={10}
        />

        <Suspense fallback={null}>
          {/* Camera Controller & View Rig */}
          <CameraRig />

          {/* 1. Factory Architectural Environment */}
          <Factory />

          {/* 2. Cyber OT Network Layer Devices */}
          <IndustrialSwitch position={[-3.0, 3.2, 0]} />
          <ScadaServer position={[-5.5, 2.5, -3.5]} />
          <HMI position={[-5.5, 2.0, 2.5]} />

          {/* 3. KAVACH Core Hardware */}
          <Sentinel position={[0.5, 3.2, 0]} />
          <Lifeline position={[4.0, 3.2, 0]} />

          {/* 4. Physical Safety Hardware Layer */}
          <SafetyHardware position={[7.0, 2.4, 0]} />

          {/* 5. Synthetic Honeypot Deception Node */}
          <Honeypot position={[-0.5, 3.2, -4.5]} />

          {/* 6. Rogue Client Attacker Workstation */}
          <AttackerNode position={[-10.5, 1.0, 0]} />

          {/* 7. ESP-NOW Mesh Peer Defense */}
          <EspNowMesh />

          {/* 8. Physical Industrial Production */}
          <SiemensPLC position={[0.5, 2.0, 2.5]} />
          <ProductionLine position={[4.5, 0, 2.8]} />

          {/* 9. Data Paths and Particle Network Flow */}
          <NetworkFlow />

          {/* 10. 3D Floating Industrial CAD Status Monitor */}
          <StatusDisplay position={[1.8, 4.8, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
