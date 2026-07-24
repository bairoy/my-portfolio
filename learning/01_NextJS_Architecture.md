# 🏗️ Module 1: Modern Frontend Architecture with Next.js
> **Goal:** Understand how your portfolio is structured, why it loads so fast, and how to replicate this architecture in any future project.

---

## 🧠 The Core Mental Model: Server vs. Browser

Before touching code, burn this mental model into your brain:

```
WITHOUT Next.js (Old React SPA):
  User visits site → Browser downloads EMPTY html + HUGE JS bundle
                   → JS runs in browser → Page renders
  Problem: Slow first load, Google can't index your content (bad SEO)

WITH Next.js (Our Approach):
  User visits site → Netlify server runs your React code instantly
                   → Sends FULLY RENDERED html to browser
                   → Browser shows page immediately
  Result: Near-instant load, perfect SEO, Google loves it
```

---

## 🗂️ The Project File Structure (What Goes Where & Why)

```
my-portfolio/
├── src/
│   ├── app/                    ← The "App Router" (Next.js 14+)
│   │   ├── page.tsx            ← Your homepage (Server Component)
│   │   ├── layout.tsx          ← Wraps every page (fonts, metadata)
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts    ← Your AI backend endpoint
│   └── components/             ← Reusable UI pieces
│       ├── Hero.tsx            ← Client Component (animations)
│       ├── Chatbot.tsx         ← Client Component (state, user input)
│       └── Projects.tsx        ← Client Component (hover effects)
├── public/                     ← Static files (images, admin CMS)
├── content/                    ← Markdown files from CMS
├── data/                       ← Generated vector database
├── scripts/                    ← Build-time scripts
└── learning/                   ← YOU ARE HERE (safe, ignored by Next.js)
```

**🔑 Key Rule:** Next.js ONLY builds what is inside `src/` and `public/`. The `learning/` folder is invisible to the build process.

---

## 📐 Architecture Diagram: The Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                     NETLIFY SERVER                              │
│                                                                 │
│  1. User visits baijuyadav.com                                  │
│                                                                 │
│  2. Server runs page.tsx (Server Component)                     │
│     ┌─────────────────────────────────────────┐                 │
│     │  // Reads vector_store.json from disk   │                 │
│     │  const projects = getProjectsFromFS()   │                 │
│     └───────────────────┬─────────────────────┘                 │
│                         │                                       │
│  3. Server renders COMPLETE HTML with real data                 │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Sends fully rendered HTML
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                               │
│                                                                 │
│  4. Page displays IMMEDIATELY (no loading spinner!)             │
│                                                                 │
│  5. React "hydrates" — attaches event listeners to HTML         │
│     (buttons start working, animations start, chatbot loads)    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Server Components vs Client Components: The Critical Distinction

This is the single most important concept in modern Next.js. Get this wrong, and your app breaks or runs slowly.

### Server Components (Default - No directive needed)

```typescript
// src/app/page.tsx
// No "use client" at the top = this is a Server Component

import fs from "fs";       // ✅ CAN use Node.js APIs (filesystem, databases)
import path from "path";
import Projects from "@/components/Projects";

export default async function Home() {

  // ✅ CAN read from the server's filesystem directly
  // ✅ CAN be async (await database calls, file reads)
  // ✅ This code NEVER runs in the user's browser = zero JS cost
  const vectorStorePath = path.join(process.cwd(), "data", "vector_store.json");
  const fileContents = fs.readFileSync(vectorStorePath, "utf-8");
  const data = JSON.parse(fileContents);

  // Filter: only show projects, not the AI identity profile
  const projects = data.documents
    .map((doc: any) => doc.metadata)
    .filter((meta: any) => !meta.role); // identity docs have a "role" field

  // ✅ CAN pass data DOWN to client components as props
  return (
    <main>
      <Projects projects={projects} />
    </main>
  );
}
```

### Client Components (Only when you need interactivity)

```typescript
// src/components/Chatbot.tsx
"use client"; // ← This single line changes everything

// ✅ CAN use React hooks
import { useState, useRef } from "react";
// ✅ CAN handle user events (onClick, onChange, onSubmit)
// ✅ CAN access browser APIs (window, document, localStorage)

// ❌ CANNOT use Node.js APIs (fs, path)
// ❌ CANNOT be async at the component level
// ❌ CANNOT read from the filesystem directly

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);       // Browser state
  const [messages, setMessages] = useState([]);       // Chat history
  const [isLoading, setIsLoading] = useState(false);

  // This function runs IN THE BROWSER when user clicks send
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    // Calls our backend API route - the bridge between client and server
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message: input, history: messages })
    });
    // ...
  }
}
```

### 🎯 Decision Rule: Which one do I use?

| You need this...                      | Use this...       |
|---------------------------------------|-------------------|
| Read a file or database               | Server Component  |
| Call an external API at build time    | Server Component  |
| A button that does something          | Client Component  |
| `useState`, `useEffect`, `useRef`     | Client Component  |
| Animations (Framer Motion)            | Client Component  |
| Access `window` or `localStorage`     | Client Component  |

---

## 🛣️ API Routes: Your Backend Inside Next.js

You don't need a separate Express.js server. Next.js gives you a backend for free.

```typescript
// src/app/api/chat/route.ts
// This file creates the URL: /api/chat
// Netlify deploys this as a Serverless Function (Lambda)

import { NextResponse } from "next/server";

// The function name MUST match the HTTP method
export async function POST(req: Request) {
  // Parse the request body from the frontend
  const { message, history = [] } = await req.json();

  // --- Your logic here (RAG, database calls, etc.) ---

  // Return a JSON response to the browser
  return NextResponse.json({ response: "Hello!" });
}

// You can also export GET, PUT, DELETE etc.
export async function GET(req: Request) {
  return NextResponse.json({ status: "ok" });
}
```

**🔑 Key Insight:** This is a Serverless Function. Netlify spins up a fresh Node.js process for every single request, executes the code, returns the response, and shuts down. This means:
- ✅ Infinitely scalable (Netlify handles all the server management)
- ✅ You pay per invocation, not per hour of server time
- ❌ The function has NO persistent memory between requests (solved in Module 5)

---

## 🎨 Tailwind CSS: Building Premium UI Without Writing CSS

Tailwind is not just a styling framework. It's a design system philosophy.

### Standard CSS (What you're avoiding):
```css
/* myStyles.css - messy, hard to maintain */
.chatbot-window {
  background: rgba(3, 7, 18, 0.8);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 0 50px rgba(59, 130, 246, 0.25);
}
```

### Tailwind CSS (What we used):
```tsx
// Everything inline, co-located with the component - easy to read and modify
<motion.div className="
  bg-[#030712]/80     /* Custom hex color at 80% opacity */
  backdrop-blur-2xl   /* Frosted glass blur effect */
  border              /* Default 1px border */
  border-blue-500/30  /* Blue border at 30% opacity */
  rounded-2xl         /* Large border radius */
  shadow-[0_0_50px_rgba(59,130,246,0.25)]  /* Custom glow shadow */
">
```

### The Glassmorphism Recipe (Remember These 3 Lines):
```tsx
// These 3 classes create the glassmorphism effect used everywhere on your site
className="
  bg-black/60          /* Step 1: Semi-transparent dark background */
  backdrop-blur-2xl    /* Step 2: Blur everything BEHIND this element */
  border border-white/10  /* Step 3: Subtle white border (the 'edge of glass') */
"
```

### The Gradient Text Recipe:
```tsx
// Used for the "Baiju Yadav" heading in Hero
className="
  bg-gradient-to-r from-blue-400 to-purple-500  /* Blue to purple gradient */
  bg-clip-text          /* Clip the gradient to the text shape */
  text-transparent      /* Make text itself transparent (shows gradient through) */
"
```

---

## 🧱 Component Architecture: How Your UI Is Assembled

```
page.tsx (Server Component — fetches data)
  │
  ├── <Hero />            (Client — animations, typing effect)
  ├── <AboutStats />      (Client — animated counters)
  ├── <Skills />          (Client — globe, skill cards)
  ├── <Projects          (Client — tilt cards, hover effects)
  │     projects={projectsFromServer} />  ← Data passed as props
  ├── <Contact />         (Client — form submission)
  └── <Chatbot />         (Client — AI chat, full state management)
```

**🔑 Key Pattern:** The Server Component (`page.tsx`) is the "brain" that fetches data. It passes this data to Client Components which handle visual interactivity. Data only flows **downward** through props.

---

## 🎯 Things To Remember For Your Next Project

1. **Default to Server Components.** Only add `"use client"` when you absolutely need `useState` or browser events.
2. **Keep Server Components "thin."** Use them to fetch data and pass it down, not to do heavy logic.
3. **Never import server-only code (fs, database) into a Client Component.** It will crash at runtime in the browser.
4. **Co-locate API routes with your app.** You don't need a separate Express backend. Use `src/app/api/`.
5. **Tailwind classes are your design system.** Create consistent gradients, blur effects, and typography classes so your UI looks unified.
