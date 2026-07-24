import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import AboutStats from "@/components/AboutStats";
import Contact from "@/components/Contact";
import fs from "fs";
import path from "path";

export default async function Home() {
  // Load projects server-side from the vector store
  const vectorStorePath = path.join(process.cwd(), "data", "vector_store.json");
  let projects: any[] = [];

  try {
    const fileContents = fs.readFileSync(vectorStorePath, "utf-8");
    const data = JSON.parse(fileContents);
    projects = data.documents
      .map((doc: any) => doc.metadata)
      .filter((meta: any) => !meta.role); // Filter out the AI Identity profile
  } catch (error) {
    console.error("Failed to load projects from vector store:", error);
  }

  return (
    <main className="flex min-h-screen flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Full-page atmospheric aurora background */}
      <div className="aurora-bg" />

      <Hero />
      <AboutStats />
      <Skills />
      <Projects projects={projects} />
      <Contact />

      {/* Footer */}
      <footer className="w-full py-8 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-sm font-medium tracking-wide" style={{ color: "var(--text-muted)" }}>
            © 2026 Baiju Yadav. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}