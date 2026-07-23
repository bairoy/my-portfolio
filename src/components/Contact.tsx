"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import Link from "next/link";

export default function Contact() {
  return (
    <section id="contact" className="w-full py-24 px-6 relative">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(59,130,246,0.3), rgba(139,92,246,0.3), transparent)" }} />

      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: CTA Content ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-8">
              LET&apos;S <span className="gradient-text">CONNECT</span>
            </h2>
            
            <div className="space-y-6 text-lg leading-relaxed mb-12 max-w-md" style={{ color: "var(--text-secondary)" }}>
              <p>
                I believe the best products are built together.
              </p>
              <p>
                Whether you&apos;re building something exciting, looking for a collaborator, exploring new opportunities, or simply want to exchange ideas, I&apos;d love to hear from you.
              </p>
            </div>

            {/* Social Links */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="https://www.linkedin.com/in/baiju-yadav-7127b72b4"
                target="_blank"
                className="flex items-center gap-4 glass-card rounded-2xl p-4 hover:border-slate-400/30 transition-all duration-300 group"
              >
                <div className="p-2.5 rounded-xl shrink-0 bg-blue-500/15">
                  <FaLinkedin className="h-5 w-5 text-blue-500" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold text-white mb-0.5">LinkedIn</div>
                  <div className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">Connect →</div>
                </div>
              </Link>

              <Link
                href="https://github.com/bairoy"
                target="_blank"
                className="flex items-center gap-4 glass-card rounded-2xl p-4 hover:border-slate-400/30 transition-all duration-300 group"
              >
                <div className="p-2.5 rounded-xl shrink-0 bg-white/10">
                  <FaGithub className="h-5 w-5 text-slate-300" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold text-white mb-0.5">GitHub</div>
                  <div className="text-xs font-medium text-slate-400 group-hover:text-white transition-colors">See my work →</div>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* ── Right: Contact Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-2xl p-8"
            style={{ borderColor: "rgba(59,130,246,0.1)" }}
          >
            <h3 className="text-xl font-bold text-white mb-6">Send a Message</h3>
            <form
              action="https://formspree.io/f/xbdnzlon"
              method="POST"
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors"
                    style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    required
                    className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors"
                    style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Project inquiry / Opportunity"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors"
                  style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>Message</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell me about your project..."
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors resize-none"
                  style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl px-4 py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group mt-2"
                style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)" }}
              >
                Send Message
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
