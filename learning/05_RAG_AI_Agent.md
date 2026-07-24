# Module 5: The Autonomous RAG AI Chatbot

This module explains how we took the Vector Database from Module 4, retrieved the most relevant data, and gave the AI short-term memory inside a Stateless Next.js API Route.

---

## 1. The Stateless API Architecture
Our backend lives in `src/app/api/chat/route.ts`. Because we host on Netlify, this code doesn't run on a dedicated server 24/7. It is deployed as a "Serverless Function". 

When a user sends a message, Netlify spins up the function, executes the code, and instantly kills it. This is highly scalable but means **the server has no memory**.

### Creating Memory
To give the AI memory, the *Frontend* (`Chatbot.tsx`) must track the conversation history using React `useState`. Every time the user sends a new message, the Frontend sends the *entire* conversation history array to the backend.

```typescript
// Chatbot.tsx
const res = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ 
    message: userMessage, // The current question
    history: messages     // The entire past conversation
  })
});
```

## 2. Hybrid Search (RAG)
When the backend receives the `message`, it must figure out what context the AI needs to answer it. We use a powerful "Hybrid Search" approach.

### Step A: Dense Retrieval (Meaning Search)
1. We send the user's `message` to OpenAI to get its Vector Embedding.
2. We run a mathematical function called **Cosine Similarity** to compare the user's vector against all the vectors in our local `vector_store.json`.
3. This finds documents that share the same *meaning* as the question, even if they don't use the same exact words.

### Step B: Sparse Retrieval (Keyword Search)
Sometimes users ask for exact names, like "Did he use PostgreSQL?". Vector math can struggle with specific keywords. 
1. We use a library called `wink-bm25-text-search`.
2. This algorithm counts word frequencies. It ensures documents containing the exact keyword "PostgreSQL" rank highly.

### Step C: Reranking
We combine the results from Step A and Step B (e.g., top 10 documents) and send them to the **Cohere Rerank API**. Cohere's dedicated AI model reads the 10 documents, scores them based on how perfectly they answer the user's exact question, and returns the absolute best 3.

## 3. The Final Prompt
Now that we have the 3 best documents, we inject them into the system prompt for the OpenAI Chat model.

```typescript
// route.ts
const chatCompletion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `Answer the user's questions based ONLY on the provided Context below:
      
      Context:
      ${contextStr}` // <--- The 3 best documents!
    },
    ...history,      // <--- Inject the conversation memory
    {
      role: "user",
      content: message
    }
  ],
});
```

## Summary: How to apply this yourself
1. When building Serverless AI apps, always keep the backend stateless. Manage conversation state (memory) entirely on the client side.
2. For production-grade RAG, never rely on Vector Search alone. Always implement a Hybrid search (Dense Vectors + BM25 Keywords) followed by a Reranker like Cohere to guarantee high-quality context retrieval.
