"use client";

import { motion } from "framer-motion";
import { Briefcase, Code2, GraduationCap, Trophy } from "lucide-react";

const experiences = [
  {
    type: "Freelance / Consulting",
    title: "AI Engineer & Developer",
    date: "2024 - Present",
    description: "Building custom AI solutions, RAG pipelines, and automated workflows for various clients. Focusing on delivering scalable architectures and integrating LLMs into existing business processes.",
    Icon: Briefcase,
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
  },
  {
    type: "Open Source",
    title: "Contributor",
    date: "2023 - Present",
    description: "Actively contributing to open-source AI tooling and frameworks. Focused on improving documentation, fixing bugs, and adding features to libraries in the LangChain ecosystem.",
    Icon: Code2,
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
  },
  {
    type: "Research",
    title: "Independent Researcher",
    date: "2024 - Present",
    description: "Exploring multi-agent orchestration patterns and AI alignment. Translating complex research papers into practical, working software implementations.",
    Icon: GraduationCap,
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
  },
  {
    type: "Hackathons & Leadership",
    title: "Tech Lead & Participant",
    date: "2023 - 2024",
    description: "Led teams in multiple hackathons to build AI-driven prototypes. Organized workshops on introductory machine learning and web development for junior students.",
    Icon: Trophy,
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="w-full py-24 px-6 relative">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            My <span className="gradient-text">Experience</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            A track record of building, researching, and leading.
          </p>
        </motion.div>

        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start relative overflow-hidden group"
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${exp.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className={`p-4 rounded-xl glass-card flex-shrink-0 ${exp.iconColor} relative z-10`}>
                <exp.Icon className="h-6 w-6" />
              </div>

              <div className="flex-1 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                      {exp.type}
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {exp.title}
                    </h3>
                  </div>
                  <span className="text-sm font-medium px-3 py-1 rounded-full glass-card whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                    {exp.date}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--text-secondary)" }}>
                  {exp.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
