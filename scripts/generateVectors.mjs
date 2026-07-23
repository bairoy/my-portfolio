import fs from "fs";
import path from "path";
import matter from "gray-matter"; // Parses the Frontmatter ---
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");
const OUTPUT_FILE = path.join(process.cwd(), "data", "vector_store.json");

async function generateVectors() {
  console.log("🚀 Starting Build-Time Vectorization...");
  
  if (!fs.existsSync(CONTENT_DIR)) {
    console.log("No projects found. Exiting.");
    return;
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith(".md"));
  const documents = [];

  for (const file of files) {
    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    
    // gray-matter parses the metadata and the main body text separately!
    const { data: metadata, content: body } = matter(fileContent);

    // Combine everything into one giant string for the AI to "read"
    const searchContext = `Project Title: ${metadata.title}\nDescription: ${metadata.description}\nDetails: ${body}`;

    console.log(`Generating embedding for: ${metadata.title}...`);
    
    // Call OpenAI to turn the text into mathematical vectors
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: searchContext,
    });

    documents.push({
      id: file, 
      content: searchContext,
      embedding: embeddingRes.data[0].embedding,
      metadata: {
        type: "project",
        ...metadata 
      }
    });
  }

  // Save the massive vector array into our Zero-Cost JSON Database!
  const db = { documents };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(db, null, 2));
  
  console.log(`✅ Successfully vectorized ${documents.length} projects into data/vector_store.json!`);
}

generateVectors().catch(console.error);
