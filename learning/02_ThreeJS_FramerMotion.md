# Module 2: 3D Graphics & Animations

This module covers how we turned a flat web page into a premium, interactive experience using **Three.js** and **Framer Motion**.

---

## 1. 3D Rendering with React Three Fiber
Writing pure WebGL or raw Three.js is incredibly verbose. To make it declarative (like standard React components), we used `@react-three/fiber` (R3F) and `@react-three/drei`.

### Core Concepts:
- **Canvas**: The `<Canvas>` component creates the WebGL context. Everything inside it is rendered on the GPU.
- **Geometries**: The shape of an object (e.g., `<sphereGeometry>`, `<torusGeometry>`).
- **Materials**: How the object reacts to light (e.g., `<meshPhysicalMaterial>`, `<meshBasicMaterial>`).
- **Lights**: Point lights, ambient lights, and directional lights illuminate the scene.

### Example: The Glass Globe Core
In `src/components/TechGlobe.tsx`, the center of our globe is a frosted glass sphere.

```tsx
<mesh>
  {/* A sphere with radius SPHERE_R, 64 segments for smoothness */}
  <sphereGeometry args={[SPHERE_R, 64, 64]} />
  
  {/* A highly realistic glass material */}
  <meshPhysicalMaterial 
    color="#000000"
    transmission={0.85} // Makes it act like glass
    roughness={0.1}     // Slightly frosted
    transparent={true}
  />
</mesh>
```
Because of `transmission`, light from the glowing data streams actually passes *through* the core, refracting the light like real glass!

## 2. Advanced Animations with Framer Motion
We used `framer-motion` for all 2D DOM animations (like elements fading in as you scroll, or the Chatbot opening).

### The `<motion.div>` Component
Framer Motion replaces standard HTML tags with `<motion.*>` tags. These tags accept animation props.

### Example: The Draggable Chatbot
In `src/components/Chatbot.tsx`, we wanted the chat window to scale up when opened, and be completely draggable.

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      drag // <--- Instantly makes the element draggable!
      dragConstraints={{ left: -1000, right: 100, top: -800, bottom: 100 }}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
    >
      {/* Chat UI */}
    </motion.div>
  )}
</AnimatePresence>
```
- `AnimatePresence`: Allows elements to animate *out* when they are removed from the DOM (the `exit` prop).
- `initial` -> `animate`: Defines the starting state and the final resting state.

## Summary: How to apply this yourself
1. When building complex UI components (like Modals or Drawers), wrap them in `<AnimatePresence>` and use `framer-motion` for buttery-smooth mount/unmount animations.
2. When you want to visualize data or create a "wow" factor hero section, use `@react-three/fiber`. Start by wrapping your components in a `<Canvas>` and experimenting with simple `<mesh>` objects.
