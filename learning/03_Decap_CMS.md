# 📝 Module 3: The Git-Based CMS (Decap CMS)
> **Goal:** Understand how we built a fully dynamic, database-free content management system that is completely free, version-controlled, and auto-deploys on every publish.

---

## 🧠 The Core Mental Model: CMS Without a Database

Before this, every dynamic website you think of needs a database. Let's compare:

```
TRADITIONAL CMS (e.g., WordPress):
  You write content → Saved to MySQL Database
  User visits site → Server queries database → Server renders page
  Problem: Need to pay for: Database server + Application server + CDN
           Complex to maintain. Database can be hacked. Scaling is expensive.

DECAP CMS (What We Built):
  You write content → Saved as a Markdown file → Committed to GitHub
  Netlify sees commit → Rebuilds site → Deploys static HTML globally
  Benefit: No database to hack. No database bill. Version-controlled content.
           If you delete a project, you can "undo" it with git revert!
```

**The insight:** Your content IS your code. They live together in the same GitHub repository.

---

## 📐 Architecture Diagram: The Full CMS Workflow

```
┌───────────────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL MACHINE                                 │
│  npm run dev                                                          │
│  → starts Next.js dev server                                          │
│  → starts Decap local proxy server (allows local editing)             │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                   yoursite.com/admin                                  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  DECAP CMS DASHBOARD (A React App in public/admin/)             │  │
│  │                                                                 │  │
│  │  Collections:          Fields (from config.yml):               │  │
│  │  ├── Projects   →      Title, Description, Tech, GitHub        │  │
│  │  └── Identity   →      Name, Role, LinkedIn, GitHub, Bio       │  │
│  │                                                                 │  │
│  │  [Publish Button] ─────────────────────────────────────────┐   │  │
│  └────────────────────────────────────────────────────────────┼───┘  │
│                                                               │       │
└───────────────────────────────────────────────────────────────┼───────┘
                                                                │
                         Authenticates via Netlify Identity
                         and pushes a git commit
                                                                │
                                                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                       GITHUB REPOSITORY                               │
│                                                                       │
│  content/                                                             │
│  ├── projects/                                                        │
│  │   ├── farmsense.md     ← Created/edited by CMS                    │
│  │   ├── finconnect.md    ← Created/edited by CMS                    │
│  │   └── futureedge.md    ← Created/edited by CMS                    │
│  └── identity/                                                        │
│      └── profile.md       ← Your AI persona file                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                │
                    Netlify webhook fires (detects commit)
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                      NETLIFY BUILD SERVER                             │
│                                                                       │
│  1. npm run prebuild → scripts/generateVectors.mjs                   │
│     (reads all .md files and generates vector_store.json)            │
│                                                                       │
│  2. npm run build → Next.js compiles site into static HTML           │
│                                                                       │
│  3. Deploys to Netlify CDN globally                                  │
│     (your site goes live in ~60 seconds!)                            │
└───────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ The Config File: `public/admin/config.yml`

This single YAML file is the brain of your entire CMS. Every field you see in your admin dashboard is generated from it.

```yaml
# public/admin/config.yml

backend:
  name: git-gateway       # Authentication method: Netlify Identity
  branch: main            # Which git branch to commit to

# Where uploaded images are stored inside your public/ folder
media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  # COLLECTION 1: Projects
  # Each entry in this collection = one Markdown file in content/projects/
  - name: "projects"        # Internal ID (used in code)
    label: "Projects"       # Display name in the dashboard
    folder: "content/projects"   # Where to save the .md files
    create: true            # Users can create NEW project entries
    
    # The "slug" defines the filename: {{title}} → "farmsense.md"
    slug: "{{slug}}"
    
    # Every field here becomes one input in the CMS form
    fields:
      - {label: "Title", name: "title", widget: "string"}
      
      - {label: "Short Description", name: "description", widget: "text"}
      
      # The "list" widget creates a multi-value input for tags
      - {label: "Technologies", name: "tech", widget: "list"}
      
      - {label: "GitHub URL", name: "githubUrl", widget: "string", required: false}
      - {label: "Live URL", name: "liveUrl", widget: "string", required: false}
      
      # The "image" widget shows an image uploader in the CMS
      - {label: "Preview Image", name: "imagePath", widget: "image", required: false}
      
      # The "markdown" widget gives a rich text editor for the Body
      - {label: "Detailed Write-up", name: "body", widget: "markdown"}

  # COLLECTION 2: Identity (a "File Collection" — fixed files, not new ones)
  - name: "identity"
    label: "Identity & Persona"
    files:
      - label: "My Profile"
        name: "profile"
        file: "content/identity/profile.md"  # Fixed file path, always the same file
        fields:
          - {label: "Name", name: "title", widget: "string"}
          - {label: "Role", name: "role", widget: "string"}
          - {label: "LinkedIn URL", name: "linkedin", widget: "string", required: false}
          - {label: "GitHub URL", name: "github", widget: "string", required: false}
          - {label: "Bio & AI Instructions", name: "body", widget: "markdown"}
```

### Two Types of Collections (Critical Difference)

| Folder Collection | File Collection |
|---|---|
| For **multiple items** (like a list of projects) | For **single, unique pages** (like About Me, Identity) |
| Users can CREATE new entries | Fixed to specific files |
| Each entry = new `.md` file | Always edits the same file |
| `folder: "content/projects"` | `files: [{file: "content/identity/profile.md"}]` |

---

## 📄 What a Generated Markdown File Looks Like

When you publish a project in the CMS, Decap creates a file exactly like this:

```markdown
---
title: FarmSense
description: An intelligent farm management platform...
subtitle: AI-Powered Precision Agriculture Platform
tech:
  - Artificial Intelligence
  - Computer Vision
  - LangChain
githubUrl: https://github.com/bairoy/farmsense
imagePath: /uploads/farmsense-preview.png
---

## The Problem
Traditional farmers rely on intuition and manual scouting...

## The Solution
FarmSense uses computer vision to detect diseases early...
```

The `---` delimiters separate the **frontmatter** (structured key-value data) from the **body** (freeform Markdown content). This is the standard format used by almost all static site generators.

---

## 🔍 How We Read These Files in Code

```typescript
// scripts/generateVectors.mjs — uses "gray-matter" library
import matter from "gray-matter";
import fs from "fs";

const fileContent = fs.readFileSync("content/projects/farmsense.md", "utf-8");
const { data: metadata, content: body } = matter(fileContent);

// After parsing:
// metadata = {
//   title: "FarmSense",
//   description: "An intelligent farm management platform...",
//   tech: ["Artificial Intelligence", "Computer Vision", "LangChain"],
//   githubUrl: "https://github.com/bairoy/farmsense",
//   imagePath: "/uploads/farmsense-preview.png"
// }

// body = "## The Problem\nTraditional farmers rely on intuition..."
```

---

## 🔐 Authentication: Netlify Identity

The CMS dashboard needs to be secure. You don't want anyone to publish to your site. We use **Netlify Identity** for this.

```
How it works:
1. Netlify Identity = a user authentication system built into Netlify
2. You set it to "Invite Only" in your Netlify dashboard
3. Only email addresses YOU invite can log into /admin
4. The CMS authenticates with GitHub using a "Git Gateway" token
   → This token is securely stored in Netlify, never exposed to the browser
5. When you hit Publish → Netlify Identity creates the GitHub commit on your behalf
```

**Why this is secure:** Your GitHub access token is never in your frontend code. Netlify acts as a secure middleman between the CMS dashboard and your GitHub repository.

---

## 🎯 Things To Remember For Your Next Project

1. **Git-based CMS is perfect for portfolios, blogs, and documentation.** Use it whenever content changes rarely and you want zero database maintenance.
2. **"Folder Collection" = dynamic list. "File Collection" = single editable page.** Know which one to use.
3. **`gray-matter` is the standard library for parsing frontmatter.** Learn it. You'll use it in every static site project.
4. **Set Netlify Identity to "Invite Only"** before going live. Default is "Open" which means anyone can register!
5. **Your `config.yml` is your single source of truth** for the entire CMS structure. If you add a field here, it appears in the dashboard AND the `.md` file automatically.
