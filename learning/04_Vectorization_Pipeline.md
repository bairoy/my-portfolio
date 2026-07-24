# 🧮 Module 4: The Zero-Cost Vector Database (Vectorization Pipeline)
> **Goal:** Understand what Vector Embeddings are, how they work, and how we replaced a $70/month Pinecone subscription with a 100-line Node.js script.

---

## 🧠 The Core Mental Model: How AI Understands Text

Computers only understand numbers. Text like "FarmSense uses computer vision" means nothing to a machine. To make AI search work, we need to convert text into numbers.

**A Vector Embedding converts text into a long list of decimal numbers:**

```
"FarmSense uses computer vision"
            ↓  (OpenAI Embedding Model)
[0.024, -0.891, 0.453, 0.012, -0.334, 0.771, ... 1536 numbers total]
```

This list of 1536 numbers is called a **vector**. The mathematical magic is:
- **Similar meaning** → **Similar numbers** → **Vectors "point" in the same direction**
- **Different meaning** → **Different numbers** → **Vectors "point" in different directions**

### Real Example:

```
"crop disease detection"          → [0.02, -0.89, 0.45, 0.76, ...]  ← Points this way
"agricultural plant health AI"    → [0.03, -0.87, 0.44, 0.74, ...]  ← Points almost the same way!
"stock market trading algorithm"  → [0.91, 0.12, -0.67, 0.03, ...]  ← Points completely differently

When user asks: "Does Baiju know about plant disease detection?"
                         ↓
We embed this question:  [0.025, -0.88, 0.46, 0.75, ...]

Compare against stored vectors...
→ "FarmSense crop disease detection" is VERY SIMILAR (close vectors)!
→ "stock market trading" is NOT similar (different direction)
```

---

## 💰 The Cost Problem (Why We Didn't Use Pinecone)

Standard RAG tutorials tell you to use a Vector Database like Pinecone, Weaviate, or Chroma. Here's why we didn't:

```
CLOUD VECTOR DATABASE APPROACH:
  ┌─────────────────────────────────────┐
  │  Pinecone Free Tier                 │
  │  → Limited to 100K vectors          │
  │  → Paid plan: $70/month minimum     │
  │  → Network call on every AI query   │
  │  → Another service that can go down │
  └─────────────────────────────────────┘

OUR APPROACH (Build-Time JSON Database):
  ┌─────────────────────────────────────┐
  │  Local JSON File                    │
  │  → Unlimited size (it's just JSON)  │
  │  → $0/month                         │
  │  → Disk read: microseconds          │
  │  → Travels WITH your deployment     │
  └─────────────────────────────────────┘
```

**The insight:** Your portfolio data changes VERY rarely (only when you add projects). You don't need a live database. Just regenerate the vectors during every build!

---

## 📐 Architecture Diagram: The Vectorization Pipeline

```
TRIGGER: git push (Netlify detects commit)
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│  npm run prebuild                                               │
│  → scripts/generateVectors.mjs                                  │
│                                                                 │
│  STEP 1: Scan directories for Markdown files                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  fs.readdirSync("content/projects")  → [farmsense.md,    │   │
│  │                                          finconnect.md,  │   │
│  │                                          futureedge.md]  │   │
│  │  fs.readdirSync("content/identity")  → [profile.md]     │   │
│  └───────────────────────────────────────┬──────────────────┘   │
│                                          │                      │
│  STEP 2: Parse each file with gray-matter│                      │
│  ┌──────────────────────────────────────-▼──────────────────┐   │
│  │  farmsense.md → { title, tech, desc } + body text        │   │
│  └───────────────────────────────────────┬──────────────────┘   │
│                                          │                      │
│  STEP 3: Send text to OpenAI Embeddings  │                      │
│  ┌───────────────────────────────────────▼──────────────────┐   │
│  │  "FarmSense: AI farm platform..."                        │   │
│  │       → OpenAI API → [0.024, -0.891, 0.453, ... x1536]  │   │
│  └───────────────────────────────────────┬──────────────────┘   │
│                                          │                      │
│  STEP 4: Store everything in JSON file   │                      │
│  ┌───────────────────────────────────────▼──────────────────┐   │
│  │  data/vector_store.json:                                 │   │
│  │  {                                                       │   │
│  │    documents: [                                          │   │
│  │      { metadata: {...}, content: "...", embedding: [...] │   │
│  │    ]                                                     │   │
│  │  }                                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                │
                ▼
  npm run build → Next.js bundles site WITH vector_store.json
                │
                ▼
  DEPLOYED → vector_store.json lives on the server disk
             API Route reads it in microseconds
```

---

## 📜 The Script: `scripts/generateVectors.mjs` — Line by Line

```javascript
// generateVectors.mjs
// The .mjs extension = ES Module (allows import/export syntax in Node.js)

import OpenAI from "openai";
import fs from "fs";         // Built-in Node.js: file system operations
import path from "path";     // Built-in Node.js: cross-platform file paths
import matter from "gray-matter"; // npm package: parses frontmatter from markdown
import "dotenv/config";      // Loads .env.local into process.env

// 1. Initialize OpenAI client with your API key from environment variables
//    NEVER hardcode API keys in source code!
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  console.log("🚀 Starting Build-Time Vectorization...");
  const documents = [];

  // 2. Define which directories to scan for content
  const contentDirs = [
    path.join(process.cwd(), "content", "projects"),  // project files
    path.join(process.cwd(), "content", "identity"),  // identity/AI persona file
  ];

  for (const dir of contentDirs) {

    // 3. Safety check: Skip if directory doesn't exist
    if (!fs.existsSync(dir)) continue;

    // 4. Read all files in this directory
    const files = fs.readdirSync(dir);

    for (const file of files) {

      // 5. Skip non-markdown files (like .DS_Store on Mac)
      if (!file.endsWith(".md")) continue;

      // 6. Read the raw file content (the entire .md file as a string)
      const fullPath = path.join(dir, file);
      const rawContent = fs.readFileSync(fullPath, "utf-8");

      // 7. Parse the frontmatter and body using gray-matter
      //    { data } = frontmatter key-value pairs
      //    { content } = everything after the --- separator
      const { data: metadata, content: body } = matter(rawContent);

      // 8. Build the search context string
      //    This is the actual text we send to OpenAI for embedding.
      //    We combine metadata + body for maximum searchability.
      let searchContext = "";
      if (metadata.role) {
        // Identity file: embed name, role, and full bio/instructions
        searchContext = `Identity Profile for ${metadata.title}
Role: ${metadata.role}
LinkedIn: ${metadata.linkedin}
GitHub: ${metadata.github}
Biography & Instructions: ${body}`;
      } else {
        // Project file: embed title, description, and detailed write-up
        searchContext = `Project Title: ${metadata.title}
Description: ${metadata.description || ""}
Details: ${body}`;
      }

      console.log(`Generating embedding for: ${metadata.title}...`);

      // 9. Send the text to OpenAI and get back a 1536-dimensional vector
      const embeddingRes = await openai.embeddings.create({
        model: "text-embedding-3-small",  // Cost-effective embedding model
        input: searchContext,
      });

      // 10. Extract the embedding array from the response
      const embedding = embeddingRes.data[0].embedding; // Array of 1536 numbers

      // 11. Push the complete document record into our array
      documents.push({
        metadata,          // { title, tech, github, ... } from frontmatter
        content: searchContext, // The full text we embedded
        embedding,         // [0.024, -0.891, 0.453, ... x1536]
      });
    }
  }

  // 12. Serialize the entire array to JSON and write to disk
  //     This is our "database" — a simple JSON file!
  const outputPath = path.join(process.cwd(), "data", "vector_store.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true }); // Create /data if not exists
  fs.writeFileSync(outputPath, JSON.stringify({ documents }, null, 2));

  console.log(`✅ Successfully vectorized ${documents.length} documents into ${outputPath}`);
}

main();
```

---

## 📦 The Output: `data/vector_store.json`

After the script runs, a file like this is created:

```json
{
  "documents": [
    {
      "metadata": {
        "title": "FarmSense",
        "description": "An intelligent farm management platform...",
        "tech": ["LangChain", "Computer Vision", "FastAPI"],
        "githubUrl": "https://github.com/bairoy/farmsense"
      },
      "content": "Project Title: FarmSense\nDescription: An intelligent farm...\nDetails: ## The Problem...",
      "embedding": [0.0241, -0.8912, 0.4532, 0.0121, -0.3344, 0.7711, ... 1536 numbers]
    },
    {
      "metadata": {
        "title": "Baiju Yadav",
        "role": "Software Developer & AI Engineer",
        "linkedin": "https://linkedin.com/in/...",
        "github": "https://github.com/bairoy"
      },
      "content": "Identity Profile for Baiju Yadav\nRole: Software Developer...",
      "embedding": [0.0912, 0.3321, -0.5543, 0.1102, ... 1536 numbers]
    }
  ]
}
```

---

## ⚡ How the Build Script Triggers Automatically

```json
// package.json — "prebuild" runs BEFORE "build" automatically
{
  "scripts": {
    "prebuild": "node scripts/generateVectors.mjs",  // ← Runs first
    "build": "next build"                            // ← Runs second
  }
}
```

**This is npm's lifecycle system.** Any script prefixed with `pre` (like `prebuild`, `prestart`) runs automatically before its counterpart. You don't call it manually.

---

## 🎯 Things To Remember For Your Next Project

1. **Text → Embeddings = Numbers that carry meaning.** Similar text produces mathematically similar vectors. This is the foundation of semantic search.
2. **The `text-embedding-3-small` model produces 1536-dimensional vectors.** This model is the sweet spot of cost vs. quality. It costs a fraction of a cent per embedding call.
3. **`prebuild` in package.json runs before every build automatically.** Use this pattern for any script that generates data needed at build time.
4. **Build-time vectorization beats a paid vector database** when your data changes rarely. You save money and add zero latency.
5. **Always use environment variables for API keys.** Access them via `process.env.YOUR_KEY_NAME`. Never hardcode them.
