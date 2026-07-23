"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  SiPython, SiLangchain, SiOpenaigym, SiNextdotjs, SiFastapi,
  SiPostgresql, SiDocker, SiTypescript, SiReact, SiVercel,
  SiGit, SiLinux, SiTailwindcss, SiNodedotjs, SiRedis,
} from "react-icons/si";
import { TbBrain, TbApi } from "react-icons/tb";

interface Skill {
  name: string;
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
  color: string;
}

const skills: Skill[] = [
  { name: "Python",      Icon: SiPython,      color: "#3b82f6" },
  { name: "LangChain",   Icon: SiLangchain,   color: "#10b981" },
  { name: "OpenAI",      Icon: SiOpenaigym,   color: "#a78bfa" },
  { name: "Next.js",     Icon: SiNextdotjs,   color: "#e2e8f0" },
  { name: "FastAPI",     Icon: SiFastapi,     color: "#06b6d4" },
  { name: "PostgreSQL",  Icon: SiPostgresql,  color: "#60a5fa" },
  { name: "Docker",      Icon: SiDocker,      color: "#38bdf8" },
  { name: "TypeScript",  Icon: SiTypescript,  color: "#818cf8" },
  { name: "React",       Icon: SiReact,       color: "#22d3ee" },
  { name: "Vercel",      Icon: SiVercel,      color: "#f8fafc" },
  { name: "Node.js",     Icon: SiNodedotjs,   color: "#4ade80" },
  { name: "Tailwind",    Icon: SiTailwindcss, color: "#38bdf8" },
  { name: "Git",         Icon: SiGit,         color: "#fb923c" },
  { name: "Linux",       Icon: SiLinux,       color: "#fbbf24" },
  { name: "Redis",       Icon: SiRedis,       color: "#f87171" },
  { name: "LangGraph",   Icon: SiLangchain,   color: "#c084fc" },
  { name: "RAG",         Icon: TbBrain,       color: "#e879f9" },
  { name: "API Design",  Icon: TbApi,         color: "#34d399" },
];

/** Evenly distributes N points on a sphere surface using Fibonacci spiral */
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius));
  }
  return pts;
}

const SPHERE_R = 2.4;
const skillPositions = fibonacciSphere(skills.length, SPHERE_R);

// ── Glowing point at each skill's surface position ──
function SkillDot({ position, color }: { position: THREE.Vector3; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2 + position.x) * 0.25);
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.045, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// ── HTML tag floating at each skill position ──
function SkillLabel({ position, skill, index }: { position: THREE.Vector3; skill: Skill; index: number }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const opacityRef = useRef(1);

  useFrame(() => {
    if (!groupRef.current) return;
    // World position of this label
    const worldPos = groupRef.current.getWorldPosition(new THREE.Vector3());
    // Camera direction
    const camDir = camera.position.clone().normalize();
    const dotProduct = worldPos.clone().normalize().dot(camDir);
    // Front-facing = more visible; back = hidden
    opacityRef.current = THREE.MathUtils.clamp(0.08 + (dotProduct + 1) * 0.46, 0.08, 1);
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        distanceFactor={6}
        style={{ pointerEvents: "none" }}
        occlude={false}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "9999px",
            background: "rgba(10, 15, 30, 0.85)",
            border: `1px solid ${skill.color}45`,
            boxShadow: `0 0 10px ${skill.color}25`,
            whiteSpace: "nowrap",
            fontSize: "11px",
            fontWeight: 600,
            color: skill.color,
            fontFamily: "Inter, sans-serif",
            backdropFilter: "blur(8px)",
            transition: "opacity 0.2s",
          }}
        >
          <skill.Icon style={{ width: 12, height: 12, flexShrink: 0 }} />
          {skill.name}
        </div>
      </Html>
    </group>
  );
}

// ── Wireframe sphere (lat/lon grid lines) ──
function GlobeWireframe() {
  const linesRef = useRef<THREE.Group>(null!);

  const geometry = useMemo(() => {
    const group = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: "#1e40af", transparent: true, opacity: 0.18 });

    // Latitude rings
    const latCount = 10;
    for (let i = 1; i < latCount; i++) {
      const phi = (Math.PI * i) / latCount;
      const r = SPHERE_R * Math.sin(phi);
      const y = SPHERE_R * Math.cos(phi);
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const theta = (2 * Math.PI * j) / 64;
        pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, mat));
    }

    // Longitude lines
    const lonCount = 12;
    for (let i = 0; i < lonCount; i++) {
      const theta = (2 * Math.PI * i) / lonCount;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const phi = (Math.PI * j) / 64;
        pts.push(new THREE.Vector3(
          SPHERE_R * Math.sin(phi) * Math.cos(theta),
          SPHERE_R * Math.cos(phi),
          SPHERE_R * Math.sin(phi) * Math.sin(theta)
        ));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, mat));
    }

    return group;
  }, []);

  return <primitive ref={linesRef} object={geometry} />;
}

// ── Faint connection lines between nearest neighbors ──
function ConnectionLines() {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const maxDist = 2.0;
    for (let i = 0; i < skillPositions.length; i++) {
      for (let j = i + 1; j < skillPositions.length; j++) {
        if (skillPositions[i].distanceTo(skillPositions[j]) < maxDist) {
          pts.push(skillPositions[i], skillPositions[j]);
        }
      }
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.07} />
    </lineSegments>
  );
}

// ── Ambient particle cloud ──
function Particles() {
  const count = 120;
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.2 + Math.random() * 1.4;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#60a5fa" size={0.025} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ── The full rotating group ──
function GlobeScene() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.28;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.1;
  });

  return (
    <>
      {/* Soft ambient glow — done via a large emissive sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#1d4ed8" transparent opacity={0.04} />
      </mesh>

      <group ref={groupRef}>
        <GlobeWireframe />
        <ConnectionLines />
        <Particles />
        {skills.map((skill, i) => (
          <group key={skill.name}>
            <SkillDot position={skillPositions[i]} color={skill.color} />
            <SkillLabel position={skillPositions[i]} skill={skill} index={i} />
          </group>
        ))}
      </group>
    </>
  );
}

export default function TechGlobe() {
  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{ height: 560 }}
    >
      {/* Radial glow behind globe */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(59,130,246,0.1) 0%, transparent 70%)",
        }}
      />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7.5], fov: 42 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.6} color="#60a5fa" />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#a78bfa" />

        <GlobeScene />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.25}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
    </div>
  );
}
