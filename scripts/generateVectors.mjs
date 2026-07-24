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

const PROJECT_DIR = path.join(process.cwd(), "content", "projects");
const IDENTITY_DIR = path.join(process.cwd(), "content", "identity");
const OUTPUT_FILE = path.join(process.cwd(), "data", "vector_store.json");

async function generateVectors() {
  console.log("🚀 Starting Build-Time Vectorization...");
  
  const documents = [];
  const directoriesToScan = [PROJECT_DIR, IDENTITY_DIR];

  for (const dir of directoriesToScan) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(file => file.endsWith(".md"));
    for (const file of files) {
      const filePath = path.join(dir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      
      const { data: metadata, content: body } = matter(fileContent);

      // We use a general search context, incorporating all metadata
      let searchContext = "";
      if (metadata.role) {
        // It's the identity file
        searchContext = `Identity Profile for ${metadata.title}\nRole: ${metadata.role}\nEmail: ${metadata.email}\nBiography & Skills: ${body}`;
      } else {
        // It's a project
        searchContext = `Project Title: ${metadata.title}\nDescription: ${metadata.description || ""}\nDetails: ${body}`;
      }

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
  }

  // Save the massive vector array into our Zero-Cost JSON Database!
  const db = { documents };
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(db, null, 2));
  
  console.log(`✅ Successfully vectorized ${documents.length} projects into data/vector_store.json!`);
}

generateVectors().catch(console.error);
