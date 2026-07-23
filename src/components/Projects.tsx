"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitBranch, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

// Pure CMS-driven project rendering
interface Project {
  title: string;
  description: string;
  subtitle?: string;
  emoji?: string;
  tech?: string | string[];
  githubUrl?: string;
  liveUrl?: string;
  imagePath?: string;
}

interface TiltCardProps {
  project: Project;
  index: number;
}

function TiltCard({ project, index }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const tiltX = ((e.clientY - centerY) / (rect.height / 2)) * -8;
    const tiltY = ((e.clientX - centerX) / (rect.width / 2)) * 8;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const meta = {
    accent: "from-blue-500 to-purple-500",
    bg: "from-blue-900/20 to-purple-900/10",
    border: "border-blue-500/20",
    emoji: project.emoji || null,
  };

  const description = project.description;
  const subtitle = project.subtitle || "Software Project";
  
  let tags: string[] = [];
  if (Array.isArray(project.tech)) {
    // Handle case where it was saved as an array of 1 string with commas
    if (project.tech.length === 1 && project.tech[0].includes(",")) {
      tags = project.tech[0].split(",").map(t => t.trim());
    } else {
      tags = project.tech;
    }
  } else if (typeof project.tech === "string") {
    tags = project.tech.split(",").map(t => t.trim());
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: isHovered ? "transform 0.1s ease" : "transform 0.5s ease",
      }}
      className={`relative group glass-card rounded-2xl overflow-hidden bg-gradient-to-br ${meta.bg} border ${meta.border} cursor-default`}
    >
      {/* Top glowing accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${meta.accent}`} />

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at 50% 0%, rgba(59,130,246,0.06), transparent 60%)`
        }}
      />

      <div className="flex flex-col h-full relative z-10 p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {meta.emoji && <span className="text-3xl">{meta.emoji}</span>}
            <h3 className="text-2xl font-bold text-white capitalize tracking-tight">
              {project.title}
            </h3>
          </div>
          <p className="text-sm font-semibold tracking-wide" style={{ color: "var(--aurora-blue)" }}>
            {subtitle}
          </p>
        </div>

        {/* Description */}
        <p className="text-base leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>

        {/* Project Image */}
        <div className="relative w-full h-56 sm:h-72 rounded-xl border border-white/10 overflow-hidden bg-slate-900 mb-8 shrink-0">
           {/* Fallback gradient if no image */}
           <div className={`absolute inset-0 bg-gradient-to-br ${meta.bg} opacity-50`} />
           
           {project.imagePath ? (
             <img src={project.imagePath} alt={project.title} className="w-full h-full object-cover" />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
               {meta.emoji}
             </div>
           )}
        </div>

        {/* Footer: Tags and Links */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          {/* Tags */}
          <div className="flex flex-wrap gap-4">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className="text-[13px] font-medium text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex gap-4 shrink-0 pl-4">
            {project.githubUrl && (
              <Link
                href={project.githubUrl}
                target="_blank"
                className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                GitHub <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
            {project.liveUrl && (
              <Link
                href={project.liveUrl}
                target="_blank"
                className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Live <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="w-full py-24 px-6 relative">
      <div className="mx-auto max-w-7xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            What I&apos;ve <span className="gradient-text">Built</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Every project tells a story of curiosity, experimentation, and the pursuit of building software that&apos;s thoughtful, reliable, and genuinely useful.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {projects.map((project: Project, index: number) => (
            <TiltCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
