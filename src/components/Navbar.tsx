"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { href: "#about",    label: "About"    },
  { href: "#skills",   label: "Skills"   },
  { href: "#projects", label: "Projects" },
  { href: "#contact",  label: "Contact"  },
];

export default function Navbar() {
  const [scrolled, setScrolled]           = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection("#" + entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ["about", "skills", "projects", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ── Top Static Bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: scrolled ? 0 : 1, y: scrolled ? -20 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 w-full z-50 pointer-events-none"
        style={{ pointerEvents: scrolled ? "none" : "auto" }}
      >


        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link href="/" className="pointer-events-auto group flex items-center gap-0.5">
            <span
              className="text-xl font-black tracking-tighter"
              style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Baiju
            </span>
            <span className="text-xl font-black tracking-tighter text-slate-500">.dev</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 pointer-events-auto"
                style={{ color: activeSection === link.href ? "white" : "var(--text-muted)" }}
              >
                {link.label}
                {activeSection === link.href && (
                  <motion.span
                    layoutId="top-indicator"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                      border: "1px solid rgba(139,92,246,0.25)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 38 }}
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>
      </motion.header>

      {/* ── Floating Pill (on scroll) ── */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="flex items-center gap-0.5 px-2 py-2 rounded-full"
              style={{
                background: "rgba(6, 10, 22, 0.85)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: [
                  "0 0 0 1px rgba(59,130,246,0.12)",
                  "0 8px 32px rgba(0,0,0,0.5)",
                  "0 0 30px rgba(59,130,246,0.06)",
                  "inset 0 1px 0 rgba(255,255,255,0.05)",
                ].join(", "),
              }}
            >
              {/* Logo pill */}
              <Link
                href="/"
                className="px-3.5 py-1.5 mr-1 rounded-full text-sm font-black"
                style={{
                  background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(139,92,246,0.2)",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  B.
                </span>
              </Link>

              {/* Nav items */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    color: activeSection === link.href ? "white" : "var(--text-muted)",
                  }}
                >
                  {activeSection === link.href && (
                    <motion.span
                      layoutId="pill-indicator"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))",
                        border: "1px solid rgba(139,92,246,0.3)",
                        boxShadow: "0 0 12px rgba(139,92,246,0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
