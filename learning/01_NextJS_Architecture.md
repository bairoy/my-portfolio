# Module 1: Modern Frontend Architecture

This module explains the foundational frontend architecture of your portfolio website. We used **Next.js 14+ (App Router)** and **Tailwind CSS**.

---

## 1. The Next.js App Router
Traditional React apps are "Single Page Applications" (SPAs) where the browser downloads an empty HTML file and a massive JavaScript bundle to render the site. This is slow and terrible for SEO.

We used the **Next.js App Router**. Next.js renders your React components on the server *before* they are sent to the browser.
- **Routing:** In the App Router, folders dictate your URLs. Our main website lives inside `src/app/page.tsx`.
- **API Routes:** Backend endpoints live inside `src/app/api/`. For example, `src/app/api/chat/route.ts` creates the `/api/chat` URL.

## 2. Server Components vs. Client Components
By default, all components in Next.js App Router are **Server Components**.
This means they run entirely on the server. They never ship JavaScript to the user's browser, making the site incredibly fast.

However, you cannot use browser APIs (like `onClick`, `useState`, or `window`) in a Server Component.

### When to use `"use client"`
Whenever you need interactivity, you must declare the file as a Client Component by putting `"use client";` at the very top of the file.

**Example from our Codebase:**
In `src/components/Chatbot.tsx`, we need to track what the user types (using `useState`) and open/close the chat window. 

```typescript
"use client"; // <--- Crucial! Tells Next.js this runs in the browser.

import { useState } from "react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

**Architectural Decision:**
We kept `src/app/page.tsx` as a Server Component. It fetches data (like reading the vector database from the filesystem) server-side, and then passes that data *down* as props into Client Components like `<Projects projects={projects} />`. This is the perfect Next.js pattern: fetch data on the server, pass it to interactive client components.

## 3. Tailwind CSS & Glassmorphism
We didn't write a single line of standard CSS. Instead, we used Tailwind CSS utility classes to build a "Glassmorphic" design system.

### How Glassmorphism Works
Glassmorphism relies on semi-transparent backgrounds mixed with a background blur.

**Example from our Chatbot:**
```html
<div className="bg-[#030712]/80 backdrop-blur-2xl border border-blue-500/30">
  ...
</div>
```
- `bg-[#030712]/80`: Gives it a very dark blue background, but with 80% opacity so you can see through it.
- `backdrop-blur-2xl`: Blurs whatever is *behind* the element, creating the frosted glass effect.
- `border-blue-500/30`: Adds a glowing edge to simulate light hitting the glass.

## Summary: How to apply this yourself
1. Always default to building Server Components (don't use `"use client"`).
2. If you need a button click, an animation, or state (`useState`), extract just that specific piece into a new file and add `"use client"`.
3. Use Tailwind's `/` syntax for opacity (e.g. `bg-black/50`) combined with `backdrop-blur-md` for instant premium UI.
