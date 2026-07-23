"use client";

import { motion } from "framer-motion";
import { SiReact, SiDocker } from "react-icons/si";
import { TbBrain, TbApi, TbDatabase } from "react-icons/tb";
import dynamic from "next/dynamic";

// R3F cannot run server-side
const TechGlobe = dynamic(() => import("./TechGlobe"), { ssr: false });

const bentoSkills = [
  {
    title: "AI Engineering",
    description: "Building intelligent applications, agents, and LLM workflows.",
    Icon: TbBrain,
    color: "from-blue-600/10 to-purple-600/10",
    borderColor: "border-blue-500/20",
    glowRgb: "59, 130, 246",
    tags: ["LangChain", "LangGraph", "RAG", "Agents", "Transformers", "LLM Fine-tuning"],
  },
  {
    title: "Backend Engineering",
    description: "Designing scalable APIs and services.",
    Icon: TbApi,
    color: "from-emerald-600/10 to-teal-600/10",
    borderColor: "border-emerald-500/20",
    glowRgb: "16, 185, 129",
    tags: ["FastAPI", "Spring Boot", "Node.js", "Express"],
  },
  {
    title: "Frontend Development",
    description: "Crafting modern user experiences.",
    Icon: SiReact,
    color: "from-cyan-600/10 to-blue-600/10",
    borderColor: "border-cyan-500/20",
    glowRgb: "6, 182, 212",
    tags: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    title: "Data & Storage",
    description: "Managing reliable, scalable data.",
    Icon: TbDatabase,
    color: "from-pink-600/10 to-rose-600/10",
    borderColor: "border-pink-500/20",
    glowRgb: "236, 72, 153",
    tags: ["PostgreSQL", "MongoDB", "Redis", "Supabase"],
  },
  {
    title: "Cloud Infrastructure",
    description: "Deploying and operating production systems.",
    Icon: SiDocker,
    color: "from-orange-600/10 to-yellow-600/10",
    borderColor: "border-orange-500/20",
    glowRgb: "249, 115, 22",
    tags: ["Docker", "AWS", "GitHub Actions"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="w-full py-24 px-6 relative">
      <div className="mx-auto max-w-7xl">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
            The Tools I <span className="gradient-text">Build With</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Every idea deserves the right foundation. These are the technologies I use to design, build, and deploy intelligent software.
          </p>
        </motion.div>

        {/* ── Interactive 3D Globe ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <TechGlobe />
        </motion.div>

        {/* ── Bento Skill Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {bentoSkills.map((skill, i) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`spotlight-card glass-card rounded-2xl p-6 bg-gradient-to-br ${skill.color} border ${skill.borderColor} group cursor-default relative overflow-hidden`}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none opacity-40"
                style={{ background: `radial-gradient(circle, rgba(${skill.glowRgb},0.4), transparent 70%)` }} />
              <div className="inline-flex p-3 rounded-xl mb-4"
                style={{ background: `rgba(${skill.glowRgb}, 0.1)`, border: `1px solid rgba(${skill.glowRgb}, 0.2)` }}>
                <skill.Icon className="h-6 w-6" style={{ color: `rgba(${skill.glowRgb}, 1)` }} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{skill.title}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                {skill.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {skill.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: `rgba(${skill.glowRgb}, 0.08)`,
                      color: `rgba(${skill.glowRgb}, 0.9)`,
                      border: `1px solid rgba(${skill.glowRgb}, 0.15)`
                    }}>
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
