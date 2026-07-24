import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { CohereClient } from "cohere-ai";
import bm25 from "wink-bm25-text-search";
import nlp from "wink-nlp-utils";

// 1. Initialize SDKs
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || "",
});

// Helper: Cosine Similarity Math (Dense Search)
function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 2. Guardrails (OpenAI Moderation API)
    // Instantly intercepts bad queries and saves us money/embarrassment
    const moderation = await openai.moderations.create({ input: message });
    if (moderation.results[0].flagged) {
      return NextResponse.json({
        response: "I'm sorry, but I cannot answer that kind of question. Let's keep the conversation focused on Baiju's portfolio and professional experience."
      });
    }

    // 3. Load Vector Store (Zero-cost Database)
    const filePath = path.join(process.cwd(), "data", "vector_store.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    const db = JSON.parse(fileData);
    const documents = db.documents;

    // 4. Generate Embedding for User Query
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryEmbedding = embeddingRes.data[0].embedding;

    // 5. Initialize BM25 (Sparse Keyword Search)
    const engine = bm25();
    engine.defineConfig({ fldWeights: { content: 1 } });
    engine.definePrepTasks([
      nlp.string.lowerCase,
      nlp.string.removeExtraSpaces,
      nlp.string.tokenize0,
      nlp.tokens.removeWords,
      nlp.tokens.stem
    ]);

    // Load all documents into the BM25 Engine
    documents.forEach((doc: any) => {
      engine.addDoc({ content: doc.content }, doc.id);
    });
    engine.consolidate();

    // 6. Hybrid Search (Dense + Sparse Fusion)
    const bm25Results = engine.search(message);
    // Find the highest BM25 score so we can normalize it between 0 and 1
    const maxBm25Score = bm25Results.length > 0 ? bm25Results[0][1] : 1;

    const hybridResults = documents.map((doc: any) => {
      // A) Dense Score (Vector meaning)
      const denseScore = cosineSimilarity(queryEmbedding, doc.embedding);

      // B) Sparse Score (BM25 keyword match)
      const sparseMatch = bm25Results.find((res: any) => res[0] === doc.id);
      const rawSparseScore = sparseMatch ? sparseMatch[1] : 0;
      const normalizedSparseScore = maxBm25Score > 0 ? rawSparseScore / maxBm25Score : 0;

      // C) Combine (50% Dense, 50% Sparse)
      const alpha = 0.5;
      const combinedScore = (alpha * denseScore) + ((1 - alpha) * normalizedSparseScore);

      return {
        ...doc,
        score: combinedScore
      };
    });

    // 7. Sort and get Top 10 for Reranking
    hybridResults.sort((a: any, b: any) => b.score - a.score);
    const top10 = hybridResults.slice(0, 10);

    // 8. Proper Reranking (Cohere Cross-Encoder)
    const rerankedRes = await cohere.rerank({
      model: 'rerank-english-v3.0',
      query: message,
      documents: top10.map((doc: any) => doc.content),
      topN: 3
    });

    // Extract the absolute pristine Top 3 texts
    const finalDocs = rerankedRes.results.map(res => top10[res.index].content);
    const contextStr = finalDocs.join("\n\n");

    // 9. Generate Final Response
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional, friendly, and highly intelligent AI assistant representing Baiju Yadav on his personal portfolio website. 

Answer the user's questions based ONLY on the provided Context below (which contains Baiju's identity profile and his projects).
If the context does not contain the answer, politely say you don't know but direct them to contact Baiju. Do not invent information.

Context:
${contextStr}`
        },
        // Inject conversation history (filtering out the initial intro message to save tokens)
        ...history
          .filter((msg: any) => !msg.text.includes("Hi! I'm **Baiju AI**"))
          .map((msg: any) => ({
            role: msg.role === "ai" ? "assistant" : "user",
            content: msg.text
          })),
        {
          role: "user",
          content: message
        }
      ],
    });

    return NextResponse.json({ response: chatCompletion.choices[0].message.content });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
