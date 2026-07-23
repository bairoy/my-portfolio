"use client";

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grid-pattern">

      {/* ── PHOTO ──────────────────────────────────────────────────────
          The grey studio background is neutralised with a CSS mask:
          an ellipse centred on the face keeps it sharp while the
          grey edges dissolve to transparent. No heavy gradient stacking.
      ─────────────────────────────────────────────────────────────── */}
      <div
        className="absolute top-24 bottom-0 hidden lg:block pointer-events-none"
        style={{
          left: "44%",
          right: "max(0.75rem, calc((100vw - 80rem) / 2 + 1.5rem))",
        }}
      >
        {/* image wrapper */}
        <div className="relative w-full h-full">
          <Image
            src="/avatar.png"
            alt="Baiju Yadav"
            fill
            sizes="56vw"
            className="object-cover"
            style={{ objectPosition: "80% 8%" }}
            priority
          />

          {/* Edge dissolve overlays - perfectly matched to background color */}
          {/* Right edge - Strong */}
          <div
            className="absolute inset-y-0 right-0 w-32 md:w-48"
            style={{ background: "linear-gradient(to left, #030712 0%, rgba(3,7,18,0) 100%)" }}
          />
          {/* Top edge - Strong */}
          <div
            className="absolute inset-x-0 top-0 h-24 md:h-32"
            style={{ background: "linear-gradient(to bottom, #030712 0%, rgba(3,7,18,0) 100%)" }}
          />
          {/* Left edge - Subtle */}
          <div
            className="absolute inset-y-0 left-0 w-16 md:w-24"
            style={{ background: "linear-gradient(to right, #030712 0%, rgba(3,7,18,0) 100%)" }}
          />
          {/* Bottom edge - Subtle */}
          <div
            className="absolute inset-x-0 bottom-0 h-16 md:h-24"
            style={{ background: "linear-gradient(to top, #030712 0%, rgba(3,7,18,0) 100%)" }}
          />
        </div>
      </div>

      {/* ── TEXT ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-12 pt-28 pb-20">
        <div className="max-w-xl">

          <motion.h1
            custom={1} initial="hidden" animate="show" variants={fadeUp}
            className="font-black tracking-tight text-white leading-[1.06]"
            style={{ fontSize: "clamp(2.8rem, 4vw, 4.8rem)" }}
          >
            Hi, I&apos;m{" "}
            <span className="gradient-text">Baiju</span>
            <span style={{ color: "var(--text-muted)" }}>.</span>
          </motion.h1>

          <motion.h2
            custom={2} initial="hidden" animate="show" variants={fadeUp}
            className="mt-4 font-light text-white/90 leading-tight"
            style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.2rem)" }}
          >
            Ideas deserve to exist. I build software that brings them to life.
          </motion.h2>

          <motion.p
            custom={3} initial="hidden" animate="show" variants={fadeUp}
            className="mt-6 text-base leading-relaxed max-w-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Curious by nature and driven by impact, I believe great software is built where creativity meets engineering. That&apos;s the philosophy behind everything I build.
          </motion.p>

        </div>
      </div>
    </section>
  );
}
