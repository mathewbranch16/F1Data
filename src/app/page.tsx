"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const FEATURES = [
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Performance Analysis",
    desc: "Track lap-by-lap pace evolution with smooth Bezier-curve visualizations. Instantly spot where time was gained or lost.",
    visual: [40, 70, 45, 90, 65, 85, 40, 75, 80, 50, 95, 60],
  },
  {
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "Sector Breakdown",
    desc: "Analyze three-sector splits to pinpoint exactly where a driver gains or hemorrhages time on every lap.",
    visual: [60, 80, 55],
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Race Strategy",
    desc: "Visualize tyre compound usage, pit-stop windows, and compound degradation across the full race distance.",
    visual: [30, 25, 20],
  },
  {
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    title: "AI Insights",
    desc: "Get automated, human-readable performance explanations — understand what happened without interpreting raw graphs.",
    visual: [],
  },
];

const STEPS = [
  { num: "01", title: "Select Race", desc: "Choose the year and Grand Prix from the dashboard controls." },
  { num: "02", title: "Select Driver", desc: "Pick any driver from the grid to deep-dive into their race data." },
  { num: "03", title: "View Insights", desc: "Instantly receive visual analytics and AI-generated explanations." },
];

/* ─── FEATURE CARD WITH BUILT-IN VISUAL ─── */
function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.6]);

  return (
    <motion.div ref={ref} style={{ y, opacity }} className="group">
      <div className="relative rounded-2xl bg-white/[0.015] backdrop-blur-3xl p-8 transition-all duration-700 overflow-hidden hover:bg-white/[0.03] hover:shadow-[0_0_40px_var(--primary)] border-none shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
        {/* Signal line */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-primary opacity-60 shadow-[0_0_20px_currentColor]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <svg className="w-6 h-6 text-primary drop-shadow-[0_0_8px_currentColor]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
            </svg>
          </div>
          <h3 className="font-display text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
          <p className="text-sm text-white/50 font-light leading-relaxed mb-6">{feature.desc}</p>

          {/* Mini visual */}
          {feature.visual.length > 3 && (
            <div className="h-16 flex items-end gap-[3px] opacity-60 group-hover:opacity-100 transition-opacity">
              {feature.visual.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-t-[2px]"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true, amount: 0.5 }}
                />
              ))}
            </div>
          )}
          {feature.visual.length === 3 && (
            <div className="flex gap-3">
              {["S1", "S2", "S3"].map((s, i) => (
                <motion.div
                  key={s}
                  className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: i === 0 ? "#ff9100" : i === 1 ? "#00D2BE" : "#fff" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${feature.visual[i]}%` }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true }}
                  />
                </motion.div>
              ))}
            </div>
          )}
          {feature.visual.length === 0 && (
            <motion.div
              className="font-mono text-xs text-primary/60 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
            >
              <TypewriterText text="// Analyzing race data... Performance drop in S2 detected. Likely tyre degradation." />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── TYPEWRITER EFFECT ─── */
function TypewriterText({ text }: { text: string }) {
  return (
    <motion.span>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: i * 0.02, duration: 0.05 }}
          viewport={{ once: true }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ─── MAIN LANDING PAGE ─── */
export default function Home() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  // Hero scroll transforms
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6, 1], [1, 0.8, 0]);
  const heroY = useTransform(heroProgress, [0, 1], [0, -80]);
  const bgY = useTransform(heroProgress, [0, 1], [0, 150]); // parallax — bg moves slower
  const gridOpacity = useTransform(heroProgress, [0, 0.5, 1], [0.4, 0.2, 0]);

  return (
    <div ref={containerRef} className="relative bg-[#0e0e0e] overflow-x-hidden" style={{ scrollBehavior: "smooth" }}>

      {/* ═══════════════════════════════════════════
          HERO SECTION — FULL-VIEWPORT IMMERSIVE
      ═══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[120vh] flex items-center justify-center overflow-hidden">
        {/* Parallax Background Layer (moves slower) */}
        <motion.div className="absolute inset-0 z-0 pointer-events-none" style={{ y: bgY }}>
          {/* Neon diagonal streaks */}
          <div className="absolute top-[28%] left-[-25%] w-[160%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 shadow-[0_0_100px_8px_currentColor] -rotate-12" />
          <div className="absolute top-[58%] right-[-15%] w-[110%] h-[2px] bg-gradient-to-l from-transparent via-[#ff0b00] to-transparent opacity-30 shadow-[0_0_80px_4px_currentColor] -rotate-6" />

          {/* Volumetric light orbs */}
          <div className="absolute bottom-[-15%] left-[15%] w-[50vw] h-[50vw] bg-primary rounded-full blur-[250px] opacity-[0.07] animate-glow-pulse" />
          <div className="absolute top-[-15%] right-[10%] w-[55vw] h-[55vw] bg-[#ff0b00] rounded-full blur-[300px] opacity-[0.04]" />

          {/* Matrix grid */}
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_10%,transparent_100%)]"
            style={{ opacity: gridOpacity }}
          />
        </motion.div>

        {/* Foreground Content (moves with scale + zoom) */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto text-center px-6"
          style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
        >
          <motion.p
            className="label-sm text-primary mb-8 drop-shadow-[0_0_10px_currentColor] tracking-[0.5em]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            KINETIC TELEMETRY SYSTEM // v3.0
          </motion.p>

          <motion.h1
            className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-[-0.04em] leading-[0.92] text-white mb-10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            Formula 1 Race
            <br />
            <span className="text-primary drop-shadow-[0_0_30px_currentColor]">
              Intelligence Platform
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/45 font-light max-w-2xl mx-auto leading-relaxed mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            Analyze driver performance using real race telemetry, visual insights, and AI-generated explanations.
            Select any season. Any Grand Prix. Any driver.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/dashboard">
              <Button variant="primary" className="w-full sm:w-auto h-16 px-14 text-base shadow-[0_0_40px_currentColor] font-bold tracking-widest">
                START ANALYSIS
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" className="w-full sm:w-auto h-16 px-14 text-base shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-3xl bg-white/[0.02] font-bold tracking-widest">
                EXPLORE DASHBOARD
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-light">Scroll to explore</span>
          <motion.div
            className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-2"
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="w-1 h-2 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES — SCROLL-DRIVEN REVEALS
      ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-32">
        <PageContainer>
          <SectionHeader label="CAPABILITIES" title="What You Can Analyze" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} feature={f} index={i} />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ═══════════════════════════════════════════
          HOW IT WORKS — STEPS WITH STAGGER
      ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-32">
        <PageContainer>
          <SectionHeader label="WORKFLOW" title="How It Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-4xl mx-auto mt-16">
            {STEPS.map((s, i) => (
              <StepCard key={i} step={s} index={i} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA — IMMERSIVE ENTRY
      ═══════════════════════════════════════════ */}
      <section className="relative z-10 py-40 overflow-hidden">
        {/* Converging glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-primary rounded-full blur-[350px] opacity-[0.06] animate-glow-pulse" />
        </div>

        <PageContainer className="relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="label-sm text-primary mb-6 drop-shadow-[0_0_8px_currentColor] tracking-[0.4em]">READY</p>
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-white mb-8 leading-[0.95]">
              Enter the
              <span className="text-primary drop-shadow-[0_0_25px_currentColor]"> Intelligence Grid</span>
            </h2>
            <p className="text-lg text-white/40 font-light mb-14 max-w-xl mx-auto leading-relaxed">
              Select a race, pick a driver, and receive instant visual analytics powered by real session telemetry.
            </p>
            <Link href="/dashboard">
              <Button variant="primary" className="h-16 px-16 text-base shadow-[0_0_40px_currentColor] font-bold tracking-widest">
                ENTER DASHBOARD →
              </Button>
            </Link>
          </motion.div>
        </PageContainer>
      </section>
    </div>
  );
}

/* ─── STEP CARD (extracted to avoid hooks-in-loop) ─── */
function StepCard({ step, index, isLast }: { step: typeof STEPS[0]; index: number; isLast: boolean }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  return (
    <motion.div ref={ref} style={{ y, opacity }} className="text-center">
      <div className="font-display text-7xl font-black text-primary/15 mb-6 drop-shadow-[0_0_20px_currentColor] transition-colors">{step.num}</div>
      <h3 className="font-display text-2xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
      <p className="text-sm text-white/45 font-light leading-relaxed">{step.desc}</p>
      {!isLast && (
        <div className="hidden md:block mt-10 mx-auto w-16 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      )}
    </motion.div>
  );
}

/* ─── REUSABLE SECTION HEADER ─── */
function SectionHeader({ label, title }: { label: string; title: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div ref={ref} style={{ y, opacity }} className="text-center">
      <p className="label-sm text-primary mb-4 drop-shadow-[0_0_5px_currentColor] tracking-[0.3em]">{label}</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter text-white">{title}</h2>
    </motion.div>
  );
}
