# 🤖 Module 5: The Autonomous RAG AI Chatbot
> **Goal:** Understand the full pipeline — from a user typing a message to an AI responding — including Hybrid Search, Reranking, Stateless Memory, and Serverless Architecture.

---

## 🧠 The Core Mental Model: RAG vs. Pure ChatGPT

```
PURE CHATGPT (Naive approach):
  User: "What is Baiju's most impressive project?"
  You tell GPT: "You are an AI assistant for Baiju. His projects are X, Y, Z..."
  Problem: - Hardcoded. GPT makes things up (hallucination).
           - Context window is limited and expensive.
           - You must manually update the prompt every time you add a project.

RAG (What we built):
  User: "What is Baiju's most impressive project?"
  1. RETRIEVE: Search the vector database for relevant project documents.
  2. AUGMENT:  Inject those documents as context into the GPT prompt.
  3. GENERATE: GPT answers ONLY using the provided documents.
  
  Result: - Always up-to-date (rebuilds with every CMS publish).
          - Factually grounded (can only use documents you gave it).
          - Efficient (only sends relevant context, not everything).
```

---

## 📐 The Full RAG Pipeline Architecture

```
USER types: "how does farmsense detect crop diseases?"
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CHATBOT.TSX (Browser — React Client Component)                      │
│                                                                      │
│  State: messages = [                                                 │
│    { role: "ai",   text: "Hi! I'm Baiju AI..." },                   │
│    { role: "user", text: "tell me about farmsense" },               │
│    { role: "ai",   text: "FarmSense is a platform..." },            │
│    { role: "user", text: "how does it detect crop diseases?" }  ← New│
│  ]                                                                   │
│                                                                      │
│  Sends to /api/chat:                                                 │
│  { message: "how does it detect...", history: [all above messages] } │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │  HTTP POST
                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│  /api/chat/route.ts (Serverless Function — Node.js)                  │
│                                                                      │
│  STEP 1: Moderation (Safety check via OpenAI)                        │
│  STEP 2: Load vector_store.json from disk                           │
│  STEP 3: Embed user message → query vector                          │
│  STEP 4: DENSE SEARCH (Cosine Similarity) → top 5 semantic matches  │
│  STEP 5: SPARSE SEARCH (BM25 keyword) → top 5 keyword matches       │
│  STEP 6: Combine → deduplicate → 10 candidate documents             │
│  STEP 7: RERANK (Cohere AI) → best 3 documents                     │
│  STEP 8: Build prompt: [system + context + history + question]      │
│  STEP 9: Call OpenAI GPT-4o-mini with full prompt                   │
│  STEP 10: Return response JSON                                       │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │  { response: "FarmSense uses..." }
                                     ▼
┌──────────────────────────────────────────────────────────────────────┐
│  CHATBOT.TSX receives response                                       │
│  → Appends { role: "ai", text: response } to messages state         │
│  → ReactMarkdown renders bold, bullets, links properly              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Step by Step: `src/app/api/chat/route.ts`

### Step 1: Moderation — The Safety Gate

```typescript
// Before doing anything, check if the user's message violates OpenAI policies
// This saves us money and avoids embarrassing outputs on your public portfolio
const moderation = await openai.moderations.create({ input: message });

if (moderation.results[0].flagged) {
  // Short-circuit: return immediately WITHOUT calling GPT (saves money)
  return NextResponse.json({
    response: "I'm sorry, but I cannot answer that kind of question."
  });
}
// The flagged property is true for: hate speech, violence, adult content, self-harm
```

### Step 2: Load the Vector Database

```typescript
// Read the vector_store.json file generated during the build
// path.join(process.cwd(), "data", "vector_store.json")
// process.cwd() = the root directory of your Next.js project on the server

const filePath = path.join(process.cwd(), "data", "vector_store.json");
const fileData = fs.readFileSync(filePath, "utf-8");  // Synchronous read (fast, disk is local)
const db = JSON.parse(fileData);
const documents = db.documents; // Array of { metadata, content, embedding }
```

### Step 3: Embed the User's Question

```typescript
// Convert the user's question into a vector
// We MUST use the same model as we used during vectorization (text-embedding-3-small)
// If you use different models, the vectors are incomparable!
const embeddingRes = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: message,
});
const queryEmbedding = embeddingRes.data[0].embedding; // [0.023, -0.891, ...]
```

### Step 4: Dense Retrieval — Cosine Similarity (Meaning Search)

```typescript
// Cosine Similarity: Measures the angle between two vectors
// Result ranges from -1 (opposite meaning) to +1 (same meaning)

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;  // Sum of (A[i] × B[i]) for all dimensions
  let normA = 0;       // Magnitude of vector A
  let normB = 0;       // Magnitude of vector B

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];  // Multiply corresponding numbers
    normA += vecA[i] * vecA[i];        // Square each number
    normB += vecB[i] * vecB[i];
  }

  // Formula: cos(θ) = (A · B) / (|A| × |B|)
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Score every document against the query vector
const scored = documents.map((doc) => ({
  ...doc,
  score: cosineSimilarity(queryEmbedding, doc.embedding),
}));

// Sort descending (highest similarity first), take top 5
const top5Dense = scored
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
```

### Step 5: Sparse Retrieval — BM25 (Keyword Search)

```typescript
// BM25 = Best Match 25, an advanced version of TF-IDF
// It counts word frequencies weighted by document length and rarity
// GREAT for exact keyword matches like "PostgreSQL", "Spring Boot", "FarmSense"

import bm25 from "wink-bm25-text-search";
import nlp from "wink-nlp-utils";

const engine = bm25();

// Configure text processing: lowercase, tokenize, remove stopwords
engine.defineConfig({ fldWeights: { content: 1 } });
engine.definePrepTasks([
  nlp.string.lowerCase,        // "FarmSense" → "farmsense"
  nlp.string.tokenize0,        // "crop disease" → ["crop", "disease"]
  nlp.tokens.removeWords,      // Remove "the", "a", "is", "and" etc.
  nlp.tokens.stem,             // "running" → "run", "crops" → "crop"
]);

// Add all documents to the BM25 index
engine.addDoc({ content: doc.content }, index); // for each document

// Finalize the index (makes it searchable)
engine.consolidate();

// Search!
const bm25Results = engine.search(message); // Returns [{ref: 0, score: 2.41}, ...]
const top5Sparse = bm25Results.slice(0, 5).map(r => documents[r.ref]);
```

### Step 6: Merge and Deduplicate

```typescript
// Combine both lists. Some documents may appear in both!
const combined = [...top5Dense, ...top5Sparse];

// Deduplicate by content (use a Set to track seen content strings)
const seen = new Set<string>();
const top10 = combined.filter(doc => {
  if (seen.has(doc.content)) return false; // Already in list
  seen.add(doc.content);
  return true;
}).slice(0, 10); // Maximum 10 candidates for the reranker
```

### Step 7: Reranking — The AI Quality Gate

```typescript
// Cohere's Rerank model reads BOTH the query AND each candidate document.
// It understands context, not just word overlap.
// It returns a ranked list: which document BEST answers this specific question?

const rerankedRes = await cohere.rerank({
  model: "rerank-english-v3.0",
  query: message,                          // The user's actual question
  documents: top10.map(doc => doc.content), // The 10 candidate texts
  topN: 3,                                  // Return only the best 3
});

// Map the reranked results back to our document objects
const finalDocs = rerankedRes.results.map(res => top10[res.index].content);
const contextStr = finalDocs.join("\n\n"); // Join them with line breaks
```

### Step 8: Build the Final Prompt and Call GPT

```typescript
const chatCompletion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    // 1. SYSTEM PROMPT: Sets the AI's persona and constraints
    {
      role: "system",
      content: `You are a professional AI assistant for Baiju Yadav.
      
Answer ONLY using the provided Context below.
Do not invent information.

Context:
${contextStr}`          // ← The 3 best documents injected here
    },

    // 2. CONVERSATION HISTORY: Gives the AI memory of past messages
    // Filter out the opening greeting to save tokens
    ...history
      .filter((msg: any) => !msg.text.includes("Hi! I'm **Baiju AI**"))
      .map((msg: any) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text
      })),

    // 3. CURRENT QUESTION: The user's new message
    {
      role: "user",
      content: message
    }
  ],
});

return NextResponse.json({
  response: chatCompletion.choices[0].message.content
});
```

---

## 🧠 The Stateless Memory Model

This is the most elegant architectural decision in the entire project.

```
STATEFUL (Traditional approach — uses server RAM):
  Browser sends: { message: "what did I ask first?" }
  Server looks up: user_sessions["user123"].history  ← Stored in RAM
  Problem: Server stores state. RAM is limited. Can't scale.

STATELESS (What we built):
  Browser stores: messages = [{ role: "user", text: "..." }, ...]  ← In React useState
  Browser sends:  { message: "what did I ask first?", history: messages }
  Server does:    Reads history from request body, uses it, forgets it.
  
  Result: Zero RAM used between requests. Infinitely scalable.
          10,000 concurrent users = same server RAM as 1 user.
```

```
REQUEST LIFECYCLE:
  
  t=0ms   User sends message + history
  t=200ms Netlify spins up serverless function
  t=201ms Function reads request (history is in memory only during this call)
  t=500ms Function calls OpenAI, gets response
  t=501ms Function sends response to browser
  t=502ms Function TERMINATES. All memory freed.
  
  Next request starts fresh at t=0ms
```

---

## 🎨 Frontend: Rendering Markdown Properly (ReactMarkdown)

The AI's response contains Markdown syntax (`**bold**`, `- bullets`, `## headers`).
Without a parser, users see raw asterisks. With `react-markdown`, it renders beautifully.

```tsx
// src/components/Chatbot.tsx
import ReactMarkdown from "react-markdown";

{msg.role === "user" ? (
  // User messages: plain text (users don't type markdown)
  msg.text
) : (
  // AI responses: parse and render markdown
  <ReactMarkdown
    components={{
      // Override default HTML elements with custom-styled versions
      p: ({ ...props }) => (
        <p className="mb-2 last:mb-0" {...props} />     // Paragraph spacing
      ),
      ul: ({ ...props }) => (
        <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />  // Bullet list
      ),
      ol: ({ ...props }) => (
        <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />  // Numbered list
      ),
      strong: ({ ...props }) => (
        <strong className="font-bold text-white" {...props} />  // Bold text
      ),
      a: ({ ...props }) => (
        <a
          className="text-blue-400 hover:underline"
          target="_blank"          // Opens in new tab
          rel="noopener noreferrer" // Security: prevents target page from accessing your window
          {...props}
        />
      ),
    }}
  >
    {msg.text}  {/* Raw markdown string from the AI */}
  </ReactMarkdown>
)}
```

---

## 🔄 Why Hybrid Search + Reranking Beats Single Approach

```
User asks: "Did Baiju use Spring Boot in FinConnect?"

DENSE SEARCH ALONE (Vector Similarity):
→ Finds "FinConnect" (close match ✅)
→ Finds "Backend engineering" (close match ✅)
→ MISSES: Documents with exact "Spring Boot" mention (different vector space ❌)

BM25 ALONE (Keyword Search):
→ Finds "Spring Boot" occurrences ✅
→ Finds "FinConnect" occurrences ✅
→ MISSES: Conceptually related content about "Java backend framework" ❌

HYBRID + RERANK:
→ Dense finds the semantically related content
→ BM25 finds the exact keyword matches
→ Cohere Rerank reads ALL 10 results and picks the 3 that actually answer the question
→ Result: Near-perfect retrieval every time ✅✅✅
```

---

## 🎯 Things To Remember For Your Next Project

1. **RAG = Retrieve → Augment → Generate.** Always retrieve context BEFORE calling the LLM. Never rely on the model's training data alone for factual answers.
2. **Hybrid search = Dense (embeddings) + Sparse (BM25).** Use Dense for meaning. Use BM25 for exact keywords. Combine for best results.
3. **Always Rerank.** Vector similarity gives you candidates. A Reranker gives you the true best answer. Cohere's free tier is sufficient for most personal projects.
4. **Make your API routes stateless.** Store conversation history in the browser (`useState`), not on the server. This makes your app infinitely scalable and reduces RAM to zero.
5. **Use `rel="noopener noreferrer"` on all `target="_blank"` links.** It's a security best practice that prevents the opened tab from controlling your page via `window.opener`.
