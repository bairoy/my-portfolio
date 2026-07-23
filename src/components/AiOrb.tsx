"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Environment } from "@react-three/drei";
import * as THREE from "three";

function OrbMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.3;
    meshRef.current.rotation.y = t * 0.15;
    // Subtle breathing scale animation
    meshRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.04);
  });

  return (
    <Sphere ref={meshRef} args={[1.6, 128, 128]}>
      <MeshDistortMaterial
        color="#1e40af"
        attach="material"
        distort={0.45}
        speed={2.5}
        roughness={0.05}
        metalness={0.9}
        emissive="#1d4ed8"
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}

export default function AiOrb() {
  return (
    <div className="relative w-full h-full">
      {/* Glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-blue-600/20 blur-[80px]" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full bg-purple-600/15 blur-[60px]" />
      </div>

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#60a5fa" />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#a78bfa" />
        <pointLight position={[0, 3, 2]} intensity={1} color="#38bdf8" />
        <Environment preset="city" />
        <OrbMesh />
      </Canvas>
    </div>
  );
}
