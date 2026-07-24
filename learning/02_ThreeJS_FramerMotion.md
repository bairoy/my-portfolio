# 🎨 Module 2: 3D Graphics & Fluid Animations
> **Goal:** Understand how to build interactive 3D scenes and buttery-smooth UI animations, and when to use each tool.

---

## 🧠 The Mental Model: Two Separate Animation Systems

Your portfolio uses two completely different animation libraries. Never confuse them:

```
FRAMER MOTION  →  For HTML/DOM elements (divs, buttons, text)
               →  Chatbot open/close, scroll-in animations, hover effects
               →  Lives in the "normal" web world

REACT THREE FIBER →  For 3D scenes rendered on the GPU
               →  The Tech Skills Globe, particles, data streams
               →  Lives inside a <Canvas> (a completely separate rendering context)
```

Think of `<Canvas>` as a "portal" in your webpage. Inside the portal, normal HTML doesn't exist. Inside it, you create 3D objects made of Geometry + Material + Light.

---

## 🌐 React Three Fiber: The 3D Rendering Pipeline

### How WebGL/Three.js Works (The Concept)

Every 3D scene has exactly 3 required ingredients:

```
SCENE = GEOMETRY + MATERIAL + LIGHT

GEOMETRY = The shape (sphere, cube, torus, custom)
MATERIAL = How light reacts with the surface (glass, metal, glow, matte)
LIGHT    = The light source illuminating the scene
```

Without a light source, everything appears black (except materials with their own glow like `meshBasicMaterial`).

### The Architecture of Our Tech Globe

```
<Canvas>                          ← WebGL rendering context (like an <img> tag but 3D)
  │
  ├── <ambientLight />            ← Soft, fills everything (like a cloudy day)
  ├── <pointLight />              ← A single bright point (like a lamp)
  │
  ├── <TechGlobe />               ← Our main component (contains everything below)
  │     │
  │     ├── <GlassCore />         ← The frosted glass center sphere
  │     ├── <TechRings />         ← Orbiting blue rings
  │     ├── <DataStreams />        ← Bezier curve lines connecting nodes
  │     ├── <TechNodes />         ← Glowing dot + Icon at each skill point
  │     └── <ParticleField />     ← Background floating dust particles
  │
  └── <OrbitControls />           ← Lets user rotate globe with mouse (from @react-three/drei)
```

### Anatomy of a 3D Object

```tsx
// Every 3D object in Three.js follows this exact pattern:
<mesh>                          {/* Container: position, rotation, scale */}
  <sphereGeometry               {/* WHAT SHAPE */}
    args={[
      1,    // radius
      64,   // widthSegments (more = smoother sphere)
      64    // heightSegments (more = smoother sphere)
    ]}
  />
  <meshPhysicalMaterial         {/* HOW IT LOOKS */}
    color="#000000"             // Base color
    transmission={0.85}         // 0=opaque, 1=fully transparent (like real glass)
    roughness={0.1}             // 0=mirror smooth, 1=chalk rough
    metalness={0.0}             // 0=plastic, 1=metal
    transparent={true}          // Must be true when using opacity or transmission
  />
</mesh>
```

### The Glass Globe Core — Line by Line

```tsx
// src/components/TechGlobe.tsx — The center frosted glass sphere
function GlassCore() {
  const SPHERE_R = 1.5; // radius constant, used consistently across all components

  return (
    <mesh>
      {/* A sphere with radius 1.5, high segment count for smoothness */}
      <sphereGeometry args={[SPHERE_R, 64, 64]} />
      
      <meshPhysicalMaterial
        color="#000000"
        transmission={0.85}   // KEY: Makes it act like real glass
        roughness={0.1}       // Slightly frosted (not a perfect mirror)
        thickness={1.0}       // Thickness of the glass for refraction
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
}
```

### The Animation Loop: `useFrame`

In Three.js, you don't use `setInterval` or `setTimeout` for animations. You use `useFrame`, which runs your code once per rendered frame (typically 60 times per second).

```tsx
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function TechRings() {
  // useRef holds a reference to the actual 3D object
  // It doesn't cause re-renders when it changes (unlike useState)
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);

  // This function runs 60 TIMES PER SECOND
  useFrame((state, delta) => {
    if (!ring1.current || !ring2.current) return;

    // delta = time since last frame (in seconds, ~0.016 for 60fps)
    // Always multiply rotations by delta to ensure consistent speed
    // across different monitor refresh rates (60Hz vs 144Hz)
    ring1.current.rotation.y += 0.2 * delta;  // Rotate around Y axis
    ring2.current.rotation.x += 0.15 * delta; // Rotate around X axis
  });

  return (
    <>
      {/* A full circle ring (Math.PI * 2 = 360 degrees) */}
      <mesh ref={ring1}>
        <torusGeometry args={[
          2.0,          // Ring radius
          0.005,        // Tube thickness
          16,           // Tube segments
          100,          // Ring segments (more = smoother circle)
          Math.PI * 2   // ARC LENGTH: MUST be Math.PI * 2 for a FULL ring
                        // ⚠️ Math.PI alone = half ring with a flat cut edge!
        ]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
      </mesh>

      <mesh ref={ring2}>
        <torusGeometry args={[2.2, 0.005, 16, 100, Math.PI * 2]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.3} />
      </mesh>
    </>
  );
}
```

### Drawing Lines with Bezier Curves (`DataStreams`)

```tsx
import { useMemo } from "react";
import * as THREE from "three";

function DataStreams() {
  // useMemo = compute this only once, not on every render
  const lines = useMemo(() => {
    const result = [];

    for (let i = 0; i < 8; i++) {
      // Random start and end points on the sphere surface
      const startPhi = Math.random() * Math.PI;       // Vertical angle
      const startTheta = Math.random() * Math.PI * 2; // Horizontal angle

      // Convert spherical coordinates to X,Y,Z on the sphere surface
      const start = new THREE.Vector3(
        R * Math.sin(startPhi) * Math.cos(startTheta),
        R * Math.cos(startPhi),
        R * Math.sin(startPhi) * Math.sin(startTheta)
      );

      // A Bezier curve: start → control point (arcs outward) → end
      // This is the formula for the smooth curved lines you see on the globe
      const curve = new THREE.QuadraticBezierCurve3(
        start,
        new THREE.Vector3(0, R * 1.5, 0), // Control point (the "peak" of the arc)
        end
      );

      // Sample 50 points along the curve to create a smooth line
      result.push(curve.getPoints(50));
    }
    return result;
  }, []); // Empty array = compute once when component mounts

  return (
    <>
      {lines.map((points, i) => (
        <line key={i}>
          {/* BufferGeometry = efficient way to pass raw point data to GPU */}
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#60a5fa" transparent opacity={0.15} />
        </line>
      ))}
    </>
  );
}
```

---

## 🎭 Framer Motion: Fluid 2D Animations

Framer Motion handles all the normal HTML animations. Think of it as CSS animations on steroids, with physics.

### Core Concept: `initial` → `animate` → `exit`

```tsx
import { motion, AnimatePresence } from "framer-motion";

// Every motion element has 3 lifecycle states:
<motion.div
  initial={{ opacity: 0, y: 50, scale: 0.9 }}  // ← Where it STARTS (before visible)
  animate={{ opacity: 1, y: 0,  scale: 1.0 }}  // ← Where it ENDS (resting state)
  exit={{    opacity: 0, y: 50, scale: 0.9 }}  // ← Where it goes when REMOVED
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  Content
</motion.div>
```

### AnimatePresence: Animating Out Before Unmounting

Without `AnimatePresence`, when `isOpen` becomes `false`, React immediately removes the component from the DOM. The exit animation never plays.

```tsx
// ❌ WITHOUT AnimatePresence - component disappears instantly (no exit animation)
{isOpen && <motion.div exit={{ opacity: 0 }}>Chat Window</motion.div>}

// ✅ WITH AnimatePresence - component plays exit animation THEN gets removed
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}    // ← This NOW WORKS because of AnimatePresence
    >
      Chat Window
    </motion.div>
  )}
</AnimatePresence>
```

### Making Elements Draggable

This is the most impressive feature with the least code:

```tsx
<motion.div
  drag                    // ← Enables dragging in ALL directions
  
  // Constrains how far the user can drag (in pixels from starting position)
  dragConstraints={{
    left: -1000,   // Can drag 1000px to the left
    right: 100,    // Can drag 100px to the right
    top: -800,     // Can drag 800px up
    bottom: 100    // Can drag 100px down
  }}

  // Framer Motion adds spring physics by default
  // The element snaps back elastically if released outside constraints
>
  Draggable Chatbot Window
</motion.div>
```

### Scroll-Triggered Animations

```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}  // ← Triggers when element enters viewport
  viewport={{ once: true }}            // ← Only animate once (not every time user scrolls)
  transition={{ delay: index * 0.12, duration: 0.6 }}
>
  Project Card (fades in when scrolled to)
</motion.div>
```

### 3D Tilt Card Effect (Used on Project Cards)

```tsx
function TiltCard({ project }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculate cursor position relative to card center (-1 to +1)
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Map cursor position to rotation degrees
    const tiltX = ((e.clientY - centerY) / (rect.height / 2)) * -8; // Max 8 degrees
    const tiltY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        // CSS 3D transform using the calculated tilt values
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.1s ease", // Fast follow while moving
      }}
    >
      {project.title}
    </motion.div>
  );
}
```

---

## 📐 Animation Decision Diagram

```
Is the element a 3D object?
        │
   YES  │                           NO
        ▼                           ▼
Use React Three Fiber        Is it HTML/DOM?
• mesh, geometry, material          │
• useFrame for animation      YES   ▼
• useRef to access object    Use Framer Motion
                             • motion.div, motion.span
                             • initial/animate/exit
                             • drag for draggable UI
                             • whileInView for scroll reveals
```

---

## 🎯 Things To Remember For Your Next Project

1. **`useFrame` replaces `setInterval` inside 3D.** Always multiply rotation speed by `delta` to ensure consistency at different frame rates.
2. **`Math.PI * 2` = full circle.** Using just `Math.PI` for `torusGeometry` arc will give you a half-ring with ugly flat caps.
3. **`useMemo` for geometry.** Always wrap expensive computations (like generating Bezier curve points) in `useMemo` so they don't recalculate on every render.
4. **Wrap conditional components in `<AnimatePresence>`.** Without it, exit animations are silently ignored.
5. **`whileInView` + `viewport={{ once: true }}`** is the standard pattern for scroll-triggered reveals. Never build this from scratch.
