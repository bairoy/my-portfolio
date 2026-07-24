# Baiju Yadav - AI Engineer Portfolio

Welcome to the source code for my personal portfolio! 🚀 
This is a modern, AI-powered portfolio built with a serverless architecture, 3D graphics, a headless CMS, and a custom Retrieval-Augmented Generation (RAG) chatbot that can answer questions about my experience.

## ✨ Key Features
- **Interactive 3D Tech Globe:** Built with React Three Fiber and WebGL.
- **Autonomous AI Chatbot:** A custom GPT-4o-mini chatbot integrated via a Next.js Serverless API, equipped with conversational memory and a Hybrid RAG pipeline (BM25 + Cosine Similarity) + Cohere Reranking.
- **Git-Based Headless CMS:** Content management via Decap CMS—zero database required. Publishing updates the AI's knowledge base automatically.
- **Zero-Cost Vector DB:** A fully automated script generates vector embeddings at build time, replacing expensive cloud vector databases with a highly optimized local JSON file.
- **Premium Glassmorphic UI:** Styled entirely with Tailwind CSS and animated using Framer Motion.

## 🛠 Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **AI & RAG:** OpenAI API, Cohere Rerank API, `wink-bm25-text-search`
- **CMS:** Decap CMS (Git-based)
- **Deployment:** Netlify

---

## 💻 Running the Project Locally

If you'd like to run this project on your own machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/bairoy/my-portfolio.git
cd my-portfolio
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root of the project and add your API keys:
```env
# Required for the AI chatbot and Vectorization pipeline
OPENAI_API_KEY="your-openai-api-key"
COHERE_API_KEY="your-cohere-api-key"
```

### 4. Run the CMS and Dev Server
To start both the Next.js development server and the Decap CMS local backend simultaneously, run:
```bash
npm run dev
```

- **Portfolio Website:** http://localhost:3000
- **CMS Dashboard:** http://localhost:3000/admin (When running locally, it saves files directly to your machine's `content/` folder instead of pushing to GitHub).

### 5. Vectorize the Content (Important!)
For the AI chatbot to work, you must generate the vector embeddings from the markdown files. Run the build script manually:
```bash
node scripts/generateVectors.mjs
```
*(This script also runs automatically when you deploy the site).*

## 📚 Learning Resources
If you want to learn exactly how this architecture was built, check out the `learning/` folder in this repository. It contains a full 5-part masterclass breaking down the frontend, 3D graphics, CMS, and AI RAG pipelines line-by-line.
