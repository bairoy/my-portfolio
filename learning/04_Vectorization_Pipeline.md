# Module 4: The Zero-Cost Vectorization Pipeline

This module explains how we built a Retrieval-Augmented Generation (RAG) system entirely for free by bypassing expensive cloud vector databases (like Pinecone or Weaviate).

---

## 1. The Core Problem
For an AI to answer questions about your projects, it needs context. Large Language Models (LLMs) cannot read your entire codebase on every request—it's too slow and expensive. 

Normally, you would upload your data to a paid Cloud Vector Database. When a user asks a question, the server queries the database, retrieves the most relevant paragraphs, and sends them to the LLM.

## 2. Our Solution: Build-Time Vectorization
Because your portfolio data changes very rarely (only when you push a new project), we don't need a live database! We can generate the database **once** during the build process, and save it as a simple JSON file.

### The Pipeline (`scripts/generateVectors.mjs`):
Before Next.js builds the HTML, Netlify runs `npm run prebuild`, which triggers this script.

**Step 1: Read the Markdown files**
Using Node.js's native `fs` (File System) module, the script reads every Markdown file in `content/projects` and `content/identity`.

**Step 2: Parse the Frontmatter**
We use the `gray-matter` library to split the Markdown files into `metadata` (like the Title) and `body` (the text content).

**Step 3: Generate the Vector Embeddings**
```javascript
const searchContext = `Project Title: ${metadata.title}\nDetails: ${body}`;

// Send the text to OpenAI to get an "Embedding" (a massive array of numbers)
const embeddingRes = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: searchContext,
});
const embedding = embeddingRes.data[0].embedding;
```
An embedding is a mathematical representation of the text's meaning.

**Step 4: Save to a JSON File**
We push all the metadata, text content, and vector arrays into one large array, and write it to disk:
```javascript
fs.writeFileSync(
  "data/vector_store.json",
  JSON.stringify({ documents })
);
```

## 3. Why this is brilliant
When a user visits your site and uses the AI Chatbot, the Next.js server just reads `data/vector_store.json` directly from its local disk! 
- **Zero latency:** Disk reads take microseconds. No network requests to a cloud database!
- **Zero cost:** You are not paying a monthly subscription for a database.
- **Perfect sync:** Because it runs on every GitHub push, your AI is always perfectly synced with your latest CMS changes.

## Summary: How to apply this yourself
1. When building AI apps with static or slow-changing data (like documentation, company wikis, or portfolios), do NOT pay for a vector database.
2. Build a script to generate the embeddings yourself, save them to a `.json` file, and ship the file directly with your backend code!
