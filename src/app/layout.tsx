import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Chatbot from "@/components/Chatbot";
import CommandPalette from "@/components/CommandPalette";

export const metadata: Metadata = {
  title: "Baiju Yadav Portfolio",
  description: "Computer Science student specializing in Multi-Agent AI Systems, RAG Pipelines, and scalable backend infrastructure. Available for internships and full-time roles.",
  keywords: ["AI Engineer", "LangGraph", "LangChain", "Next.js", "RAG", "Multi-Agent"],
  openGraph: {
    title: "Baiju Yadav Portfolio",
    description: "Building intelligent systems and autonomous agents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <Navbar />
        <CommandPalette />
        <Chatbot />
        {children}
      </body>
    </html>
  );
}
