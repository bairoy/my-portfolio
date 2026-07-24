# 🚀 Complete Build Log: Baiju Yadav's Portfolio

> This is the full, chronological build log of the portfolio — every decision, every command, every bug, and every fix — from a blank folder to a fully deployed, AI-powered portfolio.

---

## 🗺️ Project Architecture Overview

Before diving into steps, here is the complete architecture of what we built:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FINAL ARCHITECTURE                               │
│                                                                         │
│  USER'S BROWSER          NETLIFY SERVER          EXTERNAL APIS          │
│  ─────────────           ──────────────          ─────────────          │
│  React Components   ←→   Next.js App Router  →   OpenAI (Embeddings +  │
│  Chatbot (state)    ←→   /api/chat (Serverless)   GPT-4o-mini)         │
│  3D Globe (WebGL)        vector_store.json    →   Cohere (Rerank)       │
│  Framer Motion           Markdown Files                                 │
│                          ↑ Written by CMS                               │
│                                                                         │
│  GITHUB REPO             DECAP CMS (/admin)                             │
│  ─────────────           ──────────────────                             │
│  content/projects/  ←    Publish button commits markdown               │
│  content/identity/       to GitHub, Netlify auto-deploys                │
│                                                                         │
│  TECH STACK:                                                            │
│  Frontend:   Next.js 14, TypeScript, Tailwind CSS, Framer Motion        │
│  3D:         Three.js (via @react-three/fiber + @react-three/drei)      │
│  AI/RAG:     OpenAI (embeddings + GPT-4o-mini), Cohere (rerank)        │
│  Search:     BM25 (wink-bm25-text-search) + Cosine Similarity          │
│  CMS:        Decap CMS (git-based, no database)                         │
│  Hosting:    Netlify (free tier, auto-deploy on push)                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Phase 1: Foundation & Setup

### Step 1: Initialize Next.js Project

```bash
# Created project in current directory (my-portfolio/)
npx create-next-app@latest .
```

**Settings chosen:**
| Setting | Choice | Reason |
|---|---|---|
| TypeScript | Yes | Type safety, better autocomplete |
| ESLint | Yes | Catches bugs early |
| Tailwind CSS | Yes | Utility-first styling, no CSS files |
| `src/` directory | Yes | Keeps code clean from config files |
| App Router | Yes | Modern Next.js — Server Components, better performance |

---

### Step 2: Clean Up Boilerplate & Set Up Theme

Removed all Next.js default styles and defined a custom design token system.

**`src/app/globals.css`** — The central theme file:
```css
/* Custom CSS variables — used throughout the entire app */
:root {
  --bg-primary: #030712;           /* Deep navy/black background */
  --text-primary: #f1f5f9;         /* Near-white text */
  --text-secondary: #94a3b8;       /* Muted gray text */
  --text-muted: #64748b;           /* Very muted text */
  --aurora-blue: #60a5fa;          /* Primary accent (blue) */
  --aurora-purple: #a78bfa;        /* Secondary accent (purple) */
  --aurora-indigo: #818cf8;        /* Tertiary accent (indigo) */
}

/* The animated aurora background — the full-page gradient blob */
.aurora-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59,130,246,0.07), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, rgba(167,139,250,0.07), transparent),
    #030712;
  pointer-events: none;
}

/* Gradient text: used on headings like "What I've Built" */
.gradient-text {
  background: linear-gradient(135deg, var(--aurora-blue), var(--aurora-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glass card: used on project cards, skill cards */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

---

### Step 3: Install Core Dependencies

```bash
npm install framer-motion lucide-react clsx tailwind-merge
npm install @react-three/fiber @react-three/drei three
npm install react-icons
```

| Package | Purpose |
|---|---|
| `framer-motion` | Premium animations, gestures, drag |
| `lucide-react` | Clean SVG icon library |
| `clsx` + `tailwind-merge` | Safely merge Tailwind classes without conflicts |
| `@react-three/fiber` | React renderer for Three.js (3D) |
| `@react-three/drei` | Helpers for R3F (OrbitControls, etc.) |
| `three` | The core 3D library |
| `react-icons` | Large icon pack (for tech logos in the globe) |

---

## ✅ Phase 2: Core UI Components

### Step 4: Build the Sticky Navbar

**`src/components/Navbar.tsx`** — A glassmorphic fixed navbar:
```tsx
"use client"; // Needs client for potential scroll events

import Link from "next/link";

export default function Navbar() {
  return (
    // fixed + backdrop-blur = sticky, frosted-glass navbar
    <header className="fixed top-0 w-full z-50 border-b border-white/5 
                       bg-black/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-white font-semibold tracking-tighter text-lg">
          baiju.dev
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="#about">About</Link>
          <Link href="#skills">Skills</Link>
          <Link href="#projects">Projects</Link>
          <Link href="#contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
```

**`src/app/layout.tsx`** — Injects Navbar + Chatbot globally (they persist across all pages):
```tsx
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <Navbar />
        {children}
        <Chatbot />  {/* Floating — renders above all page content */}
      </body>
    </html>
  );
}
```

---

### Step 5: Build the Hero Section

**Key decision:** Used `framer-motion` staggered animations (each element fades in 100ms after the previous one), giving the page a "waterfall" reveal effect on load.

```tsx
// src/components/Hero.tsx
"use client";
import { motion } from "framer-motion";

// Each child gets a slightly larger delay, creating a stagger effect
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }
});

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="aurora-bg" />  {/* Full-page gradient background */}
      
      <motion.div {...fadeUp(0)}>    {/* Badge — appears first */}
        <span>🎓 Final Year @ VIT Vellore</span>
      </motion.div>
      
      <motion.h1 {...fadeUp(0.1)}>  {/* Headline — appears 100ms later */}
        Building Intelligent <span className="gradient-text">Systems</span>
      </motion.h1>
      
      <motion.p {...fadeUp(0.2)}>   {/* Subtext — 200ms later */}
        I'm Baiju Yadav...
      </motion.p>
      
      <motion.div {...fadeUp(0.3)}> {/* Buttons — 300ms later */}
        ...
      </motion.div>
    </section>
  );
}
```

---

### Step 6: Build the Projects Section (with Mock Data)

Built the UI first with hardcoded mock data. The "real" data from CMS comes in Phase 3.

**Key feature:** 3D tilt effect on hover — the card physically rotates in 3D space following the mouse cursor.

```tsx
// The tilt calculation — maps mouse position to rotation degrees
const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const tiltX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -8;
  const tiltY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 8;
  setTilt({ x: tiltX, y: tiltY });
};

// Applied as a CSS transform
style={{
  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
}}
```

---

### Step 7: Build the 3D Tech Globe (TechGlobe.tsx)

This was the most technically complex component. Built with `@react-three/fiber`.

**Architecture of the Globe:**
```
<Canvas> (WebGL context)
  ├── <ambientLight />      — Soft fill light
  ├── <pointLight />        — Bright directional light  
  ├── <GlassCore />         — Frosted glass center sphere (MeshPhysicalMaterial)
  ├── <TechRings />         — 3 orbiting blue/purple rings (torusGeometry)
  ├── <DataStreams />        — Bezier curve lines connecting poles
  ├── <TechNodes />         — Skill icons floating on the sphere surface
  ├── <ParticleField />     — 200 floating background particles
  └── <OrbitControls />     — Mouse drag to rotate globe
```

**Critical bug fixed:** The rings originally looked "cut" because `torusGeometry` was using `Math.PI` (half circle) instead of `Math.PI * 2` (full circle). Fixing this made the rings complete loops.

```tsx
// ❌ WRONG — creates a half-ring with a straight flat edge across the globe
<torusGeometry args={[2.0, 0.005, 16, 100, Math.PI]} />

// ✅ CORRECT — creates a full closed ring
<torusGeometry args={[2.0, 0.005, 16, 100, Math.PI * 2]} />
```

**The glass core material:**
```tsx
<meshPhysicalMaterial
  color="#000000"
  transmission={0.85}  // Glass transparency
  roughness={0.1}      // Frosted glass texture
  transparent={true}
/>
```

**Animation with `useFrame` (runs 60x per second):**
```tsx
useFrame((state, delta) => {
  // delta = time since last frame (~0.016s at 60fps)
  // Always multiply by delta — ensures same speed at any frame rate
  globeGroup.current.rotation.y += 0.1 * delta;
  ring1.current.rotation.y += 0.2 * delta;
  ring2.current.rotation.x += 0.15 * delta;
});
```

---

### Step 8: Build the Skills Section

Used `react-icons` to display hundreds of tech skill logos categorized by domain (AI/ML, Backend, Frontend, Cloud, etc.).

Each skill category renders as a glassmorphic card with an icon grid inside.

---

### Step 9: Build the About & Contact Sections

- **AboutStats:** Animated counters (3+ projects, 2+ years experience) using Framer Motion's `whileInView`.
- **Contact:** A mailto-linked contact form with social links.

---

## ✅ Phase 3: CMS Integration (Decap CMS)

### Step 10: Set Up Decap CMS

**Why no database?** Decap CMS is a Git-based CMS. When you publish content, it commits Markdown files to your GitHub repository. No database server required, no database bill, no data loss risk.

**Files created:**

`public/admin/index.html` — The CMS entry point (loads a React app from CDN):
```html
<!DOCTYPE html>
<html>
  <head><title>Content Manager</title></head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

`public/admin/config.yml` — Defines all CMS collections and fields:
```yaml
backend:
  name: git-gateway   # In production: uses Netlify Identity to commit to GitHub
  branch: main

local_backend: true   # In development: saves to local filesystem instead of GitHub

media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  # Projects Collection: creates content/projects/*.md files
  - name: "projects"
    label: "Projects"
    folder: "content/projects"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Title",        name: "title",       widget: "string"}
      - {label: "Subtitle",     name: "subtitle",    widget: "string", required: false}
      - {label: "Description",  name: "description", widget: "text"}
      - {label: "Technologies", name: "tech",        widget: "list"}
      - {label: "GitHub URL",   name: "githubUrl",   widget: "string", required: false}
      - {label: "Live URL",     name: "liveUrl",     widget: "string", required: false}
      - {label: "Preview Image",name: "imagePath",   widget: "image",  required: false}
      - {label: "Body",         name: "body",        widget: "markdown"}

  # Identity Collection: edits content/identity/profile.md (fixed file, not new ones)
  - name: "identity"
    label: "Identity & Persona"
    files:
      - label: "My Profile"
        name: "profile"
        file: "content/identity/profile.md"
        fields:
          - {label: "Name",       name: "title",    widget: "string"}
          - {label: "Role",       name: "role",     widget: "string"}
          - {label: "LinkedIn",   name: "linkedin", widget: "string", required: false}
          - {label: "GitHub",     name: "github",   widget: "string", required: false}
          - {label: "Bio & AI Instructions", name: "body", widget: "markdown"}
```

**`package.json` dev script** — runs both Next.js and the CMS local backend at the same time:
```json
"dev": "concurrently \"next dev\" \"npx decap-server\""
```

---

### Step 11: Create the AI Identity Profile

`content/identity/profile.md` — The file that controls your AI chatbot's personality:

```markdown
---
title: Baiju Yadav
role: Software Developer & AI Engineer
linkedin: https://www.linkedin.com/in/baiju-yadav-7127b72b4
github: https://github.com/bairoy
---

I am a Computer Science student at VIT Vellore...

### Technical Expertise
- **AI & Machine Learning:** LangChain, LangGraph, RAG, Autonomous Agents, LLMs
- **Backend Engineering:** Java, Python, Node.js, Spring Boot, FastAPI
- **Frontend Development:** TypeScript, React, Next.js, Tailwind CSS
- **Database & Cloud:** PostgreSQL, Redis, Docker, AWS

## AI Assistant Instructions
- If asked who Baiju is: explain he is a CS student at VIT Vellore.
- When discussing projects: provide detailed explanations.
- Proving skill knowledge: cite real project usage and specific challenges solved.
- For contact: direct to LinkedIn and GitHub only. Never invent an email.
```

---

## ✅ Phase 4: AI & RAG Pipeline

### Step 12: Install AI Dependencies

```bash
npm install openai cohere-ai wink-bm25-text-search wink-nlp-utils gray-matter dotenv
```

| Package | Purpose |
|---|---|
| `openai` | Embeddings + GPT-4o-mini chat |
| `cohere-ai` | Rerank API (quality filter for search results) |
| `wink-bm25-text-search` | BM25 sparse keyword search |
| `wink-nlp-utils` | Text pre-processing (tokenize, stem, stopwords) |
| `gray-matter` | Parse frontmatter from Markdown files |
| `dotenv` | Load `.env.local` API keys in scripts |

`.env.local` — API keys (never commit this to GitHub):
```bash
OPENAI_API_KEY=sk-...
COHERE_API_KEY=...
```

---

### Step 13: Build the Vectorization Script

`scripts/generateVectors.mjs` — Runs before every build. Reads Markdown → generates embeddings → saves JSON:

```javascript
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const documents = [];
  const contentDirs = [
    path.join(process.cwd(), "content", "projects"),
    path.join(process.cwd(), "content", "identity"),
  ];

  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      
      const rawContent = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data: metadata, content: body } = matter(rawContent);
      
      // Build the text we'll embed (combine all searchable text)
      let searchContext = metadata.role
        ? `Identity: ${metadata.title}\nRole: ${metadata.role}\n${body}`
        : `Project: ${metadata.title}\nDescription: ${metadata.description}\n${body}`;

      // Get vector from OpenAI
      const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: searchContext,
      });
      
      documents.push({
        metadata,
        content: searchContext,
        embedding: res.data[0].embedding, // 1536-dimensional vector
      });
    }
  }

  // Save the database to disk
  const outputPath = path.join(process.cwd(), "data", "vector_store.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify({ documents }, null, 2));
  console.log(`✅ Vectorized ${documents.length} documents`);
}

main();
```

**`package.json`** — Makes it run automatically before every build:
```json
"prebuild": "node scripts/generateVectors.mjs",
"build": "next build"
```

---

### Step 14: Build the RAG API Route

`src/app/api/chat/route.ts` — The serverless AI backend. Full pipeline:

```
1. SAFETY: OpenAI Moderation API checks for harmful content
2. LOAD: Read vector_store.json from disk
3. EMBED: Convert user question to a vector
4. DENSE SEARCH: Cosine Similarity → top 5 by meaning
5. SPARSE SEARCH: BM25 keyword matching → top 5 by exact words
6. MERGE: Combine + deduplicate → 10 candidates
7. RERANK: Cohere reads all 10, returns best 3
8. GENERATE: GPT-4o-mini answers using those 3 documents
9. MEMORY: Injects past conversation messages for context
```

**Why Hybrid Search?**
- Dense (vectors) alone misses exact keywords like "Spring Boot" or "FarmSense"
- Sparse (BM25) alone misses semantic meaning ("plant health" ≠ "crop disease")
- Combined: you get both meaning AND exact keyword matching

**Key bug encountered and fixed:** `wink-bm25` requires minimum 3 documents to compute IDF statistics. Fixed by ensuring 3 projects are always published in the CMS.

---

### Step 15: Build the Chatbot UI

`src/components/Chatbot.tsx` — The floating chat widget:

**Features:**
1. **Draggable** — using Framer Motion's `drag` prop with `dragConstraints`
2. **Markdown rendering** — using `react-markdown` so AI responses render bold, lists, links
3. **Conversation memory** — `messages` state is sent to API on every request
4. **Themed** — blue/purple glassmorphic design matching the site theme

```tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm **Baiju AI**. Ask me anything!" }
  ]);

  async function sendMessage(e) {
    e.preventDefault();
    // ... append user message to state
    
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ 
        message: userMessage,
        history: messages   // ← Send entire conversation for memory
      }),
    });
    // ... append AI response to state
  }

  return (
    <>
      {/* Glowing animated button to open chat */}
      <button className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 
                         to-purple-600 animate-pulse rounded-full p-4">
        <MessageCircle />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag                          {/* ← Makes it draggable anywhere */}
            dragConstraints={{ left: -1000, right: 100, top: -800, bottom: 100 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[400px] h-[500px] 
                       bg-[#030712]/80 backdrop-blur-2xl 
                       border border-blue-500/30 rounded-2xl"
          >
            {/* Messages rendered with ReactMarkdown for proper formatting */}
            {messages.map(msg => (
              msg.role === "user" ? (
                <div className="bg-gradient-to-br from-blue-500 to-purple-600">
                  {msg.text}
                </div>
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## ✅ Phase 5: Dynamic Data (CMS → Frontend)

### Step 16: Connect CMS Data to the Frontend

Updated `src/app/page.tsx` (Server Component) to read projects from `vector_store.json` and pass them to the `<Projects />` component:

```tsx
// src/app/page.tsx
import fs from "fs";
import path from "path";

export default async function Home() {
  const vectorStorePath = path.join(process.cwd(), "data", "vector_store.json");
  const data = JSON.parse(fs.readFileSync(vectorStorePath, "utf-8"));
  
  // IMPORTANT: Filter out the AI Identity profile
  // Identity docs have a "role" field; project docs do not
  const projects = data.documents
    .map(doc => doc.metadata)
    .filter(meta => !meta.role);  // ← This prevents identity from showing as a project card

  return (
    <main>
      <Projects projects={projects} />
    </main>
  );
}
```

**Bug we fixed:** Before adding the `.filter()`, the AI Identity profile was being rendered as a 4th project card on the UI because both projects AND identity were stored in the same `vector_store.json`. The filter uses the presence of the `role` field (which only identity files have) to exclude it.

---

## ✅ Phase 6: Deployment (Netlify)

### Step 17: Deploy to Netlify

1. Pushed code to GitHub: `git push origin main`
2. Logged into netlify.com → "Add new site" → "Import from GitHub"
3. Connected the `my-portfolio` repository
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Environment variables** — Added in Netlify dashboard:
   - `OPENAI_API_KEY`
   - `COHERE_API_KEY`

**Netlify auto-deploy pipeline:**
```
You push to GitHub
    ↓
Netlify detects commit via webhook
    ↓
Runs: npm run prebuild (generateVectors.mjs)
    ↓
Runs: npm run build (Next.js)
    ↓
Deploys to global CDN
    ↓
Site is live with updated AI knowledge!
```

---

### Step 18: Set Up Netlify Identity (CMS Authentication)

1. Netlify Dashboard → Site → Identity → Enable
2. Changed registration to **"Invite only"** (prevents strangers from registering)
3. Invited your own email address
4. Enabled **Git Gateway** (allows CMS to commit to your GitHub on your behalf)

---

### Step 19: Fix TypeScript Build Errors

The production build was stricter than local dev. Fixed several TypeScript errors:

**Common error: SVG JSX import conflict**
```tsx
// ❌ Error: 'SVGElement' used as type and value
import SVG from "./icon.svg"; // Next.js SVG imports clash with Three.js types

// ✅ Fix: Use react-icons or inline SVGs instead of imported SVG files
import { FaReact } from "react-icons/fa";
```

---

### Step 20: Fix Git Push Rejection

**Error encountered:**
```bash
! [rejected] main -> main (fetch first)
```

**Why it happened:** The CMS published a project and committed directly to GitHub. The local machine was now behind by 1 commit.

**Fix:**
```bash
git pull --rebase && git push
```

This downloads the CMS commit, rebases your local changes on top of it, and pushes cleanly.

---

## ✅ Phase 7: Polish & Extras

### Step 21: Add Conversation Memory to Chatbot

The AI originally didn't remember past messages in the same session. Fixed by:
1. Sending the full `messages` array from React state to the API
2. The API maps this history into OpenAI's message format and injects it before the current question

**Memory is stateless** — the server stores NOTHING. The browser holds all history in `useState` and sends it on every request. Zero server RAM used.

---

### Step 22: Add Markdown Rendering

Without `react-markdown`, AI responses with `**bold**` and `- bullets` appeared as raw asterisks and hyphens.

```bash
npm install react-markdown
```

Integrated into Chatbot with custom component overrides for proper Tailwind styling.

---

### Step 23: Create Learning Documentation

Created a `learning/` folder with 5 detailed masterclass files:

```
learning/
├── 01_NextJS_Architecture.md    — Server/Client components, routing, Tailwind
├── 02_ThreeJS_FramerMotion.md   — 3D globe, animations, drag physics
├── 03_Decap_CMS.md              — Git-based CMS, config.yml, authentication
├── 04_Vectorization_Pipeline.md — Embeddings, build-time JSON database
└── 05_RAG_AI_Agent.md           — Hybrid search, reranking, stateless memory
```

These files are in `learning/` (not inside `src/` or `public/`) so they are safely ignored by Next.js and never affect the deployed site.

---

## 🐛 All Bugs Encountered & Fixed

| Bug | Root Cause | Fix |
|---|---|---|
| Globe rings looked "cut" | `Math.PI` arc = half-ring | Changed to `Math.PI * 2` for full ring |
| AI Identity showing as project card | `vector_store.json` contains both projects + identity | Filter by `!meta.role` in `page.tsx` |
| BM25 "collection too small" error | BM25 needs min 3 docs for IDF calculation | Ensure 3 projects published in CMS |
| TypeScript SVG import conflict | Next.js SVG and Three.js types clash | Use `react-icons` instead of SVG imports |
| Git push rejected | CMS committed to GitHub while local was behind | `git pull --rebase && git push` |
| Chat responses showed raw markdown | `msg.text` rendered as plain text | Installed `react-markdown` |
| Chatbot was black, not themed | Default bg-black/neutral colors | Replaced with `bg-[#030712]/80`, `border-blue-500/30` |

---

## 📦 Final Package List

```json
{
  "dependencies": {
    "@react-three/drei": "^10.x",
    "@react-three/fiber": "^9.x",
    "cohere-ai": "^8.x",
    "dotenv": "^17.x",
    "framer-motion": "^12.x",
    "gray-matter": "^4.x",
    "lucide-react": "^1.x",
    "next": "16.x",
    "openai": "^6.x",
    "react": "19.x",
    "react-icons": "^5.x",
    "react-markdown": "^9.x",
    "three": "^0.185.x",
    "wink-bm25-text-search": "^3.x",
    "wink-nlp-utils": "^2.x"
  },
  "scripts": {
    "dev": "concurrently \"next dev\" \"npx decap-server\"",
    "prebuild": "node scripts/generateVectors.mjs",
    "build": "next build",
    "start": "next start"
  }
}
```
