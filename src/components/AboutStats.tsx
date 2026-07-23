"use client";

import { motion } from "framer-motion";

const timeline = [
  {
    year: "2023",
    title: "Started B.Tech in CSE",
    description: "Vellore Institute of Technology",
  }
];

export default function AboutStats() {
  return (
    <section id="about" className="w-full py-32 px-6 relative">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start"
        >
          {/* ── LEFT: Text ── */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8 tracking-tight">
              Beyond the <span className="gradient-text">Code</span>
            </h2>
            <div className="space-y-6 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <p>
                Programming, for me, has never been just about writing code—it&apos;s about bringing ideas to life. I love the journey of starting with a simple thought, breaking down complex problems, and turning them into software that people can use and appreciate. Every project challenges me to think differently, explore unfamiliar ideas, and create something better than what existed before.
              </p>
              <p>
                What keeps me inspired is the endless opportunity to learn and improve. I&apos;m fascinated by the way thoughtful engineering, creativity, and attention to detail come together to build products that feel simple, yet solve complex problems. Every line of code I write is part of a bigger goal: creating technology that is useful, reliable, and built to make a real difference.
              </p>
            </div>
          </div>

          {/* ── RIGHT: Timeline ── */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/20 to-transparent" />
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className="relative pl-12"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-slate-700 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  </div>
                  
                  <div>
                    <span className="text-sm font-bold text-blue-400 mb-1 block">
                      {item.year}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
