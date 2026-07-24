"use client";

import { useRef, useMemo, useState } from "react";
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
    meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3 + position.x) * 0.4);
  });
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={0.5} distance={2} />
    </mesh>
  );
}

// ── HTML tag floating at each skill position ──
function SkillLabel({ position, skill, hovered, setHovered }: { position: THREE.Vector3; skill: Skill; hovered: string | null; setHovered: (v: string | null) => void }) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null!);
  const opacityRef = useRef(1);

  const isHovered = hovered === skill.name;
  const isOthersHovered = hovered !== null && !isHovered;

  useFrame(() => {
    if (!groupRef.current) return;
    const worldPos = groupRef.current.getWorldPosition(new THREE.Vector3());
    const camDir = camera.position.clone().normalize();
    const dotProduct = worldPos.clone().normalize().dot(camDir);
    
    // Front-facing = more visible; back = hidden
    let targetOpacity = THREE.MathUtils.clamp(0.08 + (dotProduct + 1) * 0.46, 0.08, 1);
    
    if (isHovered) targetOpacity = 1;
    if (isOthersHovered) targetOpacity *= 0.3;

    opacityRef.current += (targetOpacity - opacityRef.current) * 0.1;
    
    if (groupRef.current.children[0] && (groupRef.current.children[0] as any).element) {
        (groupRef.current.children[0] as any).element.style.opacity = opacityRef.current.toString();
        (groupRef.current.children[0] as any).element.style.transform = `scale(${isHovered ? 1.2 : 1})`;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Html
        center
        distanceFactor={6}
        style={{ pointerEvents: "auto", transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }}
        occlude={false}
      >
        <div
          onMouseEnter={() => setHovered(skill.name)}
          onMouseLeave={() => setHovered(null)}
          className="cursor-pointer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "9999px",
            background: isHovered ? `rgba(10, 15, 30, 0.95)` : "rgba(10, 15, 30, 0.65)",
            border: `1px solid ${isHovered ? skill.color : skill.color + '45'}`,
            boxShadow: isHovered ? `0 0 20px ${skill.color}80` : `0 0 10px ${skill.color}25`,
            whiteSpace: "nowrap",
            fontSize: "12px",
            fontWeight: 600,
            color: skill.color,
            fontFamily: "Inter, sans-serif",
            backdropFilter: "blur(12px)",
            transition: "all 0.3s",
            opacity: 1 // managed by useFrame
          }}
        >
          <skill.Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
          {skill.name}
        </div>
      </Html>
    </group>
  );
}

// ── Solid Glass Core ──
function GlassCore() {
  return (
    <mesh>
      <sphereGeometry args={[SPHERE_R * 0.95, 64, 64]} />
      <meshPhysicalMaterial
        color="#1e3a8a"
        emissive="#000000"
        roughness={0.2}
        metalness={0.5}
        transmission={0.85}
        transparent={true}
        opacity={1}
        thickness={2}
        envMapIntensity={2}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

// ── Wireframe sphere (lat/lon grid lines) ──
function GlobeWireframe() {
  const linesRef = useRef<THREE.Group>(null!);
  
  useFrame(({ clock }) => {
    linesRef.current.rotation.y = clock.getElapsedTime() * -0.05;
  });

  const geometry = useMemo(() => {
    const group = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: "#3b82f6", transparent: true, opacity: 0.15 });

    // Latitude rings
    const latCount = 12;
    for (let i = 1; i < latCount; i++) {
      const phi = (Math.PI * i) / latCount;
      const r = SPHERE_R * Math.sin(phi);
      const y = SPHERE_R * Math.cos(phi);
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const theta = (2 * Math.PI * j) / 64;
        pts.push(new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
      }
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }

    // Longitude lines
    const lonCount = 16;
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
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }

    return group;
  }, []);

  return <primitive ref={linesRef} object={geometry} />;
}

// ── Outer Tech Rings ──
function TechRings() {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ring1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.2;
    ring1.current.rotation.y = t * 0.3;
    
    ring2.current.rotation.x = Math.PI / 4 + Math.cos(t * 0.15) * 0.2;
    ring2.current.rotation.y = -t * 0.2;
    
    ring3.current.rotation.x = -Math.PI / 3;
    ring3.current.rotation.y = t * 0.4;
  });

  return (
    <>
      <mesh ref={ring1}>
        <torusGeometry args={[SPHERE_R * 1.3, 0.005, 16, 100, Math.PI * 2]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2}>
        <torusGeometry args={[SPHERE_R * 1.45, 0.008, 16, 100, Math.PI * 2]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.4} />
      </mesh>
      <mesh ref={ring3}>
        <torusGeometry args={[SPHERE_R * 1.6, 0.003, 16, 100, Math.PI * 2]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
      </mesh>
    </>
  );
}

// ── Faint connection lines between nearest neighbors ──
function ConnectionLines({ hovered }: { hovered: string | null }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const maxDist = 2.2;
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
      <lineBasicMaterial color="#3b82f6" transparent opacity={hovered ? 0.03 : 0.15} />
    </lineSegments>
  );
}

// ── Active Data Streams (Arcs between random points) ──
function DataStreams() {
  const maxLines = 5;
  const groupRef = useRef<THREE.Group>(null!);
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Line) {
        // Pulse opacity based on sine wave with offset
        (child.material as THREE.LineBasicMaterial).opacity = Math.pow(Math.sin(t * 3 + i * 1.5), 4) * 0.8;
      }
    });
  });

  const lines = useMemo(() => {
    const arr = [];
    for (let i = 0; i < maxLines; i++) {
      const p1 = skillPositions[Math.floor(Math.random() * skillPositions.length)];
      const p2 = skillPositions[Math.floor(Math.random() * skillPositions.length)];
      
      // Create a bezier curve between p1 and p2, arching outward
      const mid = p1.clone().add(p2).multiplyScalar(0.5).normalize().multiplyScalar(SPHERE_R * 1.2);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(20);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      
      const color = skills[Math.floor(Math.random() * skills.length)].color;
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });
      arr.push(<line key={i} geometry={geo} material={mat} />);
    }
    return arr;
  }, []);

  return <group ref={groupRef}>{lines}</group>;
}

// ── Ambient particle cloud with independent movement ──
function Particles() {
  const count = 300;
  const pointsRef = useRef<THREE.Points>(null!);
  const initialPos = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = SPHERE_R + 0.5 + Math.random() * 2.5;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(initialPos.slice(), 3));
    return g;
  }, [initialPos]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.1;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Gently orbit particles
      const x = initialPos[i3];
      const z = initialPos[i3 + 2];
      const angle = t * (i % 2 === 0 ? 1 : -1);
      positions[i3] = x * Math.cos(angle) - z * Math.sin(angle);
      positions[i3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);
      // Bob up and down
      positions[i3 + 1] = initialPos[i3 + 1] + Math.sin(t * 10 + i) * 0.1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geo}>
      <pointsMaterial color="#60a5fa" size={0.03} transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ── The full rotating group ──
function GlobeScene() {
  const groupRef = useRef<THREE.Group>(null!);
  const { mouse, viewport } = useThree();
  const [hovered, setHovered] = useState<string | null>(null);

  useFrame((_, delta) => {
    // Base auto-rotation
    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.1;

    // Mouse parallax effect (tilt towards mouse)
    const targetX = (mouse.y * viewport.height) / 100;
    const targetY = (mouse.x * viewport.width) / 100;
    
    groupRef.current.rotation.x += 0.05 * (targetX - groupRef.current.rotation.x);
    // don't override the continuous y rotation, just add a slight tilt to Z
    groupRef.current.rotation.z += 0.05 * (-targetY - groupRef.current.rotation.z);
  });

  return (
    <>
      <group ref={groupRef}>
        <GlassCore />
        <GlobeWireframe />
        <TechRings />
        <ConnectionLines hovered={hovered} />
        <DataStreams />
        <Particles />
        {skills.map((skill, i) => (
          <group key={skill.name}>
            <SkillDot position={skillPositions[i]} color={skill.color} />
            <SkillLabel position={skillPositions[i]} skill={skill} index={i} hovered={hovered} setHovered={setHovered} />
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
      style={{ height: 600 }}
    >
      {/* Radial glow behind globe */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.15) 0%, rgba(10,15,30,0) 60%)",
        }}
      />

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#60a5fa" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a78bfa" />
        
        {/* Environment map lighting for the glass core */}
        <directionalLight position={[0, 5, -5]} intensity={0.5} color="#38bdf8" />

        <GlobeScene />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
        />
      </Canvas>
    </div>
  );
}
