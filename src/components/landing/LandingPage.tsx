"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, X, ChevronDown, Zap, GitBranch, Key, Globe, RefreshCw, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/useTheme";

/* ─── Helpers ────────────────────────────────────────────────────── */

const E = [0.16, 1, 0.3, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
  y = 22,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: E }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Canvas Mockup — always dark (shows the product UI) ─────────── */

function CanvasMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-white/8 ${compact ? "aspect-[4/3]" : "aspect-video shadow-[0_40px_100px_rgba(0,0,0,0.75)]"}`}
      style={{
        background: "#09080a",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 h-7 bg-[#0c0a0d]/90 border-b border-white/5 flex items-center px-3 gap-2 z-10">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/8" />
          ))}
        </div>
        <div className="flex-1 text-center text-[8px] text-white/20 font-medium">
          buildr — Research Canvas
        </div>
      </div>

      {/* Glow */}
      <motion.div
        className="absolute w-72 h-36 bg-accent/10 rounded-full blur-3xl pointer-events-none"
        style={{ left: "25%", top: "35%" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Connections SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 450" preserveAspectRatio="none">
        <motion.path
          d="M 248 120 C 320 120 280 235 310 235"
          stroke="#c0341d" strokeWidth="1.5" fill="none" strokeOpacity={0.7}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
        />
        <motion.path
          d="M 510 235 C 590 235 560 330 585 340"
          stroke="#c0341d" strokeWidth="1.5" fill="none" strokeOpacity={0.7}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5, ease: "easeInOut" }}
        />
        {[
          { cx: 248, cy: 120, d: 0.6 },
          { cx: 310, cy: 235, d: 1.2 },
          { cx: 510, cy: 235, d: 1.2 },
          { cx: 585, cy: 340, d: 1.9 },
        ].map(({ cx, cy, d }, i) => (
          <motion.circle key={i} cx={cx} cy={cy} r={3} fill="#c0341d"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.85 }}
            transition={{ delay: d, duration: 0.3 }}
          />
        ))}
      </svg>

      {/* Node 1 */}
      <motion.div
        className="absolute bg-[#0f0d10] border border-white/10 rounded-xl p-3 w-52"
        style={{ left: "4%", top: "20%" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: E }}
      >
        <div className="h-px mb-2 bg-linear-to-r from-transparent via-white/12 to-transparent" />
        <p className="text-[8px] font-semibold uppercase tracking-widest text-white/25 mb-1.5">Research Chat · GPT-4o</p>
        <div className="space-y-1">
          <div className="text-[8px] bg-white/5 rounded px-1.5 py-1 text-white/40 border border-white/5">What is quantum entanglement?</div>
          <p className="text-[8px] text-white/28 leading-relaxed">A phenomenon where particles become correlated such that the state of one...</p>
        </div>
      </motion.div>

      {/* Node 2 */}
      <motion.div
        className="absolute bg-[#0f0d10] border border-white/10 rounded-xl p-3 w-52"
        style={{ left: "38%", top: "44%" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0, ease: E }}
      >
        <div className="h-px mb-2 bg-linear-to-r from-transparent via-white/10 to-transparent" />
        <p className="text-[8px] font-semibold uppercase tracking-widest text-white/25 mb-1.5">Branch · Claude</p>
        <div className="space-y-1">
          <div className="text-[8px] bg-white/5 rounded px-1.5 py-1 text-white/40 border border-white/5">How does this apply to qubits?</div>
          <p className="text-[8px] text-white/28 leading-relaxed">Entanglement enables quantum bits to process multiple states simultaneously...</p>
        </div>
      </motion.div>

      {/* Node 3 - accent */}
      <motion.div
        className="absolute bg-[#0f0d10] border border-accent/22 rounded-xl p-3 w-52 shadow-[0_0_20px_rgba(192,52,29,0.1)]"
        style={{ right: "5%", bottom: "16%" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.7, ease: E }}
      >
        <div className="h-px mb-2 bg-linear-to-r from-transparent via-accent/45 to-transparent" />
        <p className="text-[8px] font-semibold uppercase tracking-widest text-accent/60 mb-1.5">Branch · Gemini</p>
        <div className="space-y-1">
          <div className="text-[8px] bg-accent/8 rounded px-1.5 py-1 text-white/45 border border-accent/12">Applications in cryptography?</div>
          <p className="text-[8px] text-white/28 leading-relaxed">Quantum key distribution uses entanglement to detect any eavesdropping...</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Model Chips Visual ─────────────────────────────────────────── */

function ModelChips() {
  const models = [
    { name: "Claude", color: "#c96442" },
    { name: "GPT-4o", color: "#19c37d" },
    { name: "Gemini", color: "#4285f4" },
    { name: "Groq", color: "#f55036" },
  ];
  return (
    <div className="flex flex-wrap gap-2 justify-center py-2">
      {models.map((m, i) => (
        <motion.div
          key={m.name}
          className="px-3 py-1.5 rounded-full border text-[11px] font-semibold"
          style={{ borderColor: `${m.color}30`, color: m.color, background: `${m.color}10` }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 * i + 0.3, duration: 0.4, ease: E }}
        >
          {m.name}
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Feature Bento ───────────────────────────────────────────────── */

function FeatureBento() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20" id="features">
      <Reveal className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.16em] text-accent/70 mb-3 font-semibold">05 — Features</p>
        <h2 className="text-[38px] sm:text-[48px] font-bold tracking-[-0.025em] text-text">
          Everything you need.
          <br />
          <span className="text-muted">Nothing you don&apos;t.</span>
        </h2>
        <p className="text-[14px] text-muted mt-3">Built lean. Shipped fast. Every feature earns its place.</p>
      </Reveal>

      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left column: 3 stacked small cards */}
        <div className="col-span-1 flex flex-col gap-4">
          <Reveal delay={0.05}>
            <div className="group bg-surface border border-border hover:border-accent/18 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/60 mb-3">Multi-Model</p>
              <ModelChips />
              <h3 className="text-[13px] font-semibold text-text mt-3 mb-1.5">
                Claude · GPT-4o · Gemini · Groq
              </h3>
              <p className="text-[11px] text-muted leading-relaxed">
                All four models. One workspace. Switch mid-conversation without losing a word of context.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="group bg-surface border border-border hover:border-accent/18 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/60 mb-3">Ownership</p>
              <div className="flex items-center justify-center py-3">
                <div className="w-14 h-14 rounded-2xl bg-accent/8 border border-accent/15 flex items-center justify-center group-hover:bg-accent/14 transition-colors duration-200">
                  <Key size={24} className="text-accent/70" />
                </div>
              </div>
              <h3 className="text-[13px] font-semibold text-text mt-2 mb-1.5">Bring Your Own Keys</h3>
              <p className="text-[11px] text-muted leading-relaxed">
                Your keys. Your usage. Zero per-message fees, zero markup. Pay your AI provider directly.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="group bg-surface border border-border hover:border-accent/18 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/60 mb-3">Accessibility</p>
              <div className="rounded-lg bg-surface-2 border border-border px-3 py-2 mb-3 font-mono text-[10px] text-muted flex items-center gap-2">
                <Globe size={10} className="text-subtle shrink-0" />
                <span>buildr.app</span>
                <span className="ml-auto text-accent/50">●</span>
              </div>
              <h3 className="text-[13px] font-semibold text-text mb-1.5">No Download. No Install. Ever.</h3>
              <p className="text-[11px] text-muted leading-relaxed">
                Open a browser. Start working. Mac, Windows, Linux — any machine.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Right: Large canvas card spanning 3 rows */}
        <Reveal delay={0} className="col-span-2 col-start-2 row-start-1 row-span-3">
          <div className="group h-full bg-surface border border-border hover:border-accent/18 rounded-2xl p-5 transition-all duration-200 hover:shadow-[0_12px_48px_rgba(0,0,0,0.12)] flex flex-col">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/60 mb-3">Core</p>
            <div className="flex-1 rounded-xl overflow-hidden mb-4">
              <CanvasMockup compact />
            </div>
            <h3 className="text-[16px] font-bold text-text mb-2">Infinite Canvas + Branching</h3>
            <p className="text-[13px] text-muted leading-relaxed">
              Every conversation is a node. Branch when ideas fork, collapse when they resolve. Spatial thinking for non-linear minds — finally an AI workspace that works like your brain.
            </p>
          </div>
        </Reveal>

        {/* Bottom row: 3 equal cards */}
        <Reveal delay={0.1}>
          <div className="group bg-surface border border-border hover:border-accent/18 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/60 mb-3">Sync</p>
            <div className="flex items-center justify-center gap-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
                <Globe size={14} className="text-subtle" />
              </div>
              <RefreshCw size={12} className="text-accent/50" />
              <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
                <Globe size={14} className="text-subtle" />
              </div>
            </div>
            <h3 className="text-[13px] font-semibold text-text mb-1.5">Free Cloud Sync. Actually Free.</h3>
            <p className="text-[11px] text-muted leading-relaxed">Syncs across all devices. Typing Mind charges extra. We don&apos;t.</p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="group bg-surface border border-border hover:border-accent/18 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/60 mb-3">History</p>
            <div className="space-y-1 mb-3">
              {["Quantum Research · 3 nodes", "Writing Project · 7 nodes", "Interview Prep · 5 nodes"].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] text-subtle bg-surface-2 rounded px-2 py-1 border border-border">
                  <GitBranch size={8} className="text-accent/40 shrink-0" />
                  {t}
                </div>
              ))}
            </div>
            <h3 className="text-[13px] font-semibold text-text mb-1.5">Thread History — Saved & Named</h3>
            <p className="text-[11px] text-muted leading-relaxed">Every canvas auto-saved. Every node searchable. Your work never vanishes.</p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="group bg-surface border border-border hover:border-accent/18 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-accent/60 mb-3">Clarity</p>
            <div className="bg-canvas border border-border rounded-xl p-3 mb-3">
              <div className="h-px mb-2 bg-linear-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] text-subtle">Chat node</span>
                <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold" style={{ background: "#19c37d20", color: "#19c37d" }}>GPT-4o</span>
              </div>
              <div className="text-[8px] text-muted">The answer is...</div>
            </div>
            <h3 className="text-[13px] font-semibold text-text mb-1.5">Model Labels on Every Node</h3>
            <p className="text-[11px] text-muted leading-relaxed">Always know which AI said what. No more &ldquo;which model gave me that answer?&rdquo;</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── Comparison Table ───────────────────────────────────────────── */

function Comparison() {
  const rows = [
    { feature: "Canvas / Branching", tm: false, rh: true, buildr: true },
    { feature: "Web App — No Download", tm: true, rh: false, buildr: true },
    { feature: "Free Cloud Sync", tm: "Paid Extra", rh: "Local Only", buildr: "✓ FREE" },
    { feature: "Multi-Model BYOK", tm: true, rh: true, buildr: true },
    { feature: "Mobile Ready", tm: false, rh: false, buildr: "V2" },
  ];

  function Cell({ val }: { val: boolean | string }) {
    if (val === true) return <Check size={15} className="text-muted mx-auto" />;
    if (val === false) return <X size={15} className="text-subtle mx-auto" />;
    if (val === "✓ FREE") return <span className="text-accent font-bold text-[12px]">{val}</span>;
    if (val === "V2") return <span className="text-muted text-[11px] font-medium">{val}</span>;
    return <span className="text-subtle text-[11px]">{val}</span>;
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <Reveal className="text-center mb-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-accent/70 mb-3 font-semibold">06 — Competitive Comparison</p>
        <h2 className="text-[34px] sm:text-[44px] font-bold tracking-[-0.025em] text-text">
          Why not just use what exists?
        </h2>
        <p className="text-[14px] text-muted mt-3">Simple. Nothing that exists does all of this. And they know it.</p>
      </Reveal>

      <Reveal>
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-[12px] font-medium text-muted">Feature</th>
                <th className="px-4 py-4 text-[12px] font-medium text-muted">Typing Mind</th>
                <th className="px-4 py-4 text-[12px] font-medium text-muted">Rabbit Holes AI</th>
                <th className="px-4 py-4 text-[12px] font-bold text-accent bg-accent/5">buildr ← You</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} className={`border-b border-border ${i % 2 === 0 ? "" : "bg-surface-2/40"}`}>
                  <td className="px-6 py-3.5 text-[13px] text-muted">{row.feature}</td>
                  <td className="px-4 py-3.5 text-center"><Cell val={row.tm} /></td>
                  <td className="px-4 py-3.5 text-center"><Cell val={row.rh} /></td>
                  <td className="px-4 py-3.5 text-center bg-accent/4"><Cell val={row.buildr} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 rounded-xl border border-accent/15 bg-accent/5 px-5 py-4">
          <p className="text-[13px] text-muted leading-relaxed">
            Typing Mind has no canvas. Rabbit Holes requires a download and charges for sync.{" "}
            <span className="text-accent font-medium">
              Buildr is the only tool that does all three — canvas, web-first, and free sync — in one place.
            </span>
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ─── Who It's For ───────────────────────────────────────────────── */

const ICP_TABS = [
  {
    id: "researchers",
    label: "Researchers",
    heading: "Stop losing the thread every time you switch sources.",
    body: "Branch your literature review into parallel nodes — one per source, one per model. Pressure-test conclusions with Claude while GPT-4o synthesizes. Your entire investigation lives in one canvas. No context ever dies.",
  },
  {
    id: "students",
    label: "Students",
    heading: "Go deeper than any single AI lets you.",
    body: "Use Gemini to explain, Claude to challenge your thinking, GPT-4o to draft — all in the same canvas, the same session. No tab switching. No starting over. Just depth.",
  },
  {
    id: "builders",
    label: "Builders",
    heading: "AI as a real thinking partner. Not a fancy autocomplete.",
    body: "You're shipping fast, pivoting hard, iterating constantly. Branch your problem-solving canvas per feature, per decision, per direction — and switch models as your needs change. Buildr keeps up with you.",
  },
  {
    id: "polymaths",
    label: "Polymaths",
    heading: "Finally — a tool as non-linear as your mind.",
    body: "You follow ideas wherever they go. Across disciplines. Across models. Across days. Buildr's canvas doesn't force you into a single thread — it expands with your curiosity.",
  },
  {
    id: "power",
    label: "Power AI Users",
    heading: "You've outgrown every chat interface. So have we.",
    body: "You already know the models. You already have the keys. What you've been missing is a spatial environment that treats AI as infrastructure, not a product. Buildr is that environment.",
  },
];

function WhoItsFor() {
  const [active, setActive] = useState("builders");
  const current = ICP_TABS.find((t) => t.id === active)!;

  return (
    <section className="max-w-5xl mx-auto px-6 py-16">
      <Reveal className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.16em] text-accent/70 mb-3 font-semibold">07 — Who It&apos;s For</p>
        <h2 className="text-[34px] sm:text-[44px] font-bold tracking-[-0.025em] text-text">
          Why <span className="text-accent">Power Users</span>
          <br />Choose Buildr.
        </h2>
        <p className="text-[14px] text-muted mt-3 max-w-lg mx-auto">
          Buildr isn&apos;t built for everyone. It&apos;s built for people who actually push AI to its limits.
        </p>
      </Reveal>

      <Reveal>
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ICP_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-150 ${
                active === tab.id
                  ? "bg-accent text-white shadow-[0_4px_12px_rgba(192,52,29,0.3)]"
                  : "bg-surface-2 text-muted hover:text-text hover:bg-surface border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: E }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-surface border border-border rounded-2xl p-8">
              <p className="text-[10px] uppercase tracking-[0.15em] text-accent/60 mb-4 font-bold">
                {ICP_TABS.find((t) => t.id === active)?.label}
              </p>
              <h3 className="text-[20px] font-bold text-text leading-tight mb-4">
                {current.heading}
              </h3>
              <p className="text-[13px] text-muted leading-relaxed">{current.body}</p>
            </div>

            <div className="bg-surface border border-accent/12 rounded-2xl p-8 flex flex-col justify-between">
              <div className="h-px mb-6 bg-linear-to-r from-transparent via-accent/30 to-transparent" />
              <div className="text-center py-6">
                <p className="text-[32px] font-bold text-muted leading-tight mb-2">
                  &quot;If you&apos;ve ever copy-pasted your own thoughts between AI tabs and thought{" "}
                  <span className="text-accent italic">&apos;this is insane&apos;</span>
                  &nbsp;—&nbsp;Buildr was built for you.&quot;
                </p>
              </div>
              <div className="h-px mt-6 bg-linear-to-r from-transparent via-accent/30 to-transparent" />
            </div>
          </motion.div>
        </AnimatePresence>
      </Reveal>
    </section>
  );
}

/* ─── Pricing ─────────────────────────────────────────────────────── */

function Pricing() {
  const plans = [
    {
      tier: "FREE FOREVER",
      price: "$0",
      period: "No card required",
      desc: "Start exploring, no card needed.",
      features: ["3 canvases", "2 models", "Cloud sync included"],
      missing: ["Unlimited canvases", "All 4 models"],
      cta: "Start Free",
      href: "/login",
      featured: false,
      badge: null,
    },
    {
      tier: "FOUNDING MEMBER",
      price: "$19",
      period: "One-time · Lifetime · No subscription",
      desc: "100 founding spots only. Price goes to $39 after.",
      features: [
        "Unlimited canvases",
        "All 4 models",
        "BYOK · unlimited usage",
        "Free cloud sync · all devices",
        "Full thread history",
        "Direct line to the builder",
      ],
      missing: [],
      cta: "Get Founding Access — $19",
      href: "/login",
      featured: true,
      badge: "⚡ FOUNDING MEMBER · 100 SPOTS ONLY",
    },
    {
      tier: "EARLY ADOPTER",
      price: "$39",
      period: "One-time · After first 100 users",
      desc: "Everything in Founding, same price after launch.",
      features: ["Unlimited canvases", "All 4 models", "BYOK · unlimited usage", "Free cloud sync", "Full thread history"],
      missing: ["Direct builder access"],
      cta: "Coming After 100 Users",
      href: "#",
      featured: false,
      badge: null,
    },
  ];

  return (
    <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
      <Reveal className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.16em] text-accent/70 mb-3 font-semibold">09 — Pricing</p>
        <h2 className="text-[38px] sm:text-[48px] font-bold tracking-[-0.025em] text-text">
          Simple. One-time.
          <br />
          <span className="text-muted">No tricks.</span>
        </h2>
        <p className="text-[14px] text-muted mt-3 max-w-lg mx-auto">
          Your ICP is already spending $40/month across tools. $19 lifetime is a no-brainer — if the product delivers. We think it does.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <Reveal key={plan.tier} delay={i * 0.08}>
            <div className={`relative flex flex-col h-full rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
              plan.featured
                ? "bg-surface border-accent/30 shadow-[0_0_0_1px_rgba(192,52,29,0.1),0_20px_60px_rgba(192,52,29,0.12)]"
                : "bg-canvas border-border hover:border-border-focus"
            }`}>
              {plan.featured && (
                <>
                  <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-accent text-white text-[9px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </div>
                </>
              )}

              <div className="p-6 pt-8 flex-1 flex flex-col">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-subtle mb-3">{plan.tier}</p>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-[40px] font-bold text-text leading-none">{plan.price}</span>
                </div>
                <p className="text-[11px] text-subtle mb-1.5">{plan.period}</p>
                <p className="text-[12px] text-muted mb-6">{plan.desc}</p>

                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[12px] text-muted">
                      <Check size={12} className={plan.featured ? "text-accent shrink-0" : "text-muted shrink-0"} />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[12px] text-subtle">
                      <X size={12} className="text-subtle shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.featured && (
                  <p className="text-[10px] text-accent/60 text-center mb-3 font-medium">
                    [87/100 spots remaining]
                  </p>
                )}

                <Link
                  href={plan.href}
                  className={`block text-center text-[13px] font-bold py-3 rounded-xl transition-all duration-150 active:scale-[0.97] ${
                    plan.featured
                      ? "bg-accent hover:bg-accent-hover text-white shadow-[0_4px_16px_rgba(192,52,29,0.35)] hover:shadow-[0_6px_24px_rgba(192,52,29,0.5)]"
                      : plan.href === "#"
                      ? "bg-surface-2 text-subtle border border-border cursor-not-allowed"
                      : "bg-surface-2 hover:bg-surface text-muted hover:text-text border border-border"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-6 text-center">
        <p className="text-[11px] text-subtle">
          After 500 users → $15/month subscription only. LTD tiers disappear permanently.
        </p>
      </Reveal>
    </section>
  );
}

/* ─── FAQ ─────────────────────────────────────────────────────────── */

const FAQS = [
  {
    q: "What is BYOK and why does Buildr require it?",
    a: 'BYOK means "Bring Your Own API Keys." You connect your own OpenAI, Anthropic, or Google API keys directly — Buildr never touches your quota or charges a per-message fee. You pay your AI provider at cost. We never mark it up. This is how it should work.',
  },
  {
    q: "Is the $19 actually a one-time payment? No subscription later?",
    a: 'Yes. One payment. Lifetime access. No "just kidding" email in 6 months. Founding members lock in lifetime access permanently — we move to $15/month subscription for new users after 500 members. Your price never changes.',
  },
  {
    q: "What models are supported at launch?",
    a: "Claude (Anthropic), GPT-4o (OpenAI), Gemini (Google), and Groq at launch. Additional models are on the V2 roadmap. Founding members get early access to new integrations and direct input on what ships next.",
  },
  {
    q: "Can I use Buildr without my own API keys?",
    a: "The free plan gives you access to 2 models with your own keys. BYOK is required because it's the only way to give you genuinely unlimited usage — no caps, no throttling, no surprise bills from us. Your keys, your control.",
  },
  {
    q: "Why is cloud sync free when competitors charge for it?",
    a: "Because charging for cloud sync is a cash-grab on something that costs us cents per user. Typing Mind charges extra. Rabbit Holes keeps you local. We made a decision: sync is a feature, not a revenue stream. It's included on every plan — including free.",
  },
  {
    q: "Who built this?",
    a: "A solo builder who got tired of tab-switching between four AI tools every single day. Buildr is dogfooded daily — every feature exists because the builder needed it. Founding members get a direct line. Real feedback. Real responses.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-16">
      <Reveal className="text-center mb-12">
        <p className="text-[10px] uppercase tracking-[0.16em] text-accent/70 mb-3 font-semibold">10 — FAQ</p>
        <h2 className="text-[34px] sm:text-[44px] font-bold tracking-[-0.025em] text-text">
          Frequently Asked Questions.
        </h2>
      </Reveal>

      <div className="space-y-1">
        {FAQS.map((faq, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <div className="border-b border-border">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group"
              >
                <span className="text-[14px] font-medium text-muted group-hover:text-text transition-colors duration-150">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={15} className="text-subtle" />
                </motion.div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: E }}
                    className="overflow-hidden"
                  >
                    <p className="text-[13px] text-muted leading-relaxed pb-5">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─── Main export ─────────────────────────────────────────────────── */

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-text antialiased overflow-x-hidden">
      {/* ── Nav ────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 px-6 h-14 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "bg-canvas/88 backdrop-blur-xl border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold tracking-tight">buildr</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        </div>

        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="text-[13px] text-subtle hover:text-muted transition-colors duration-150">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-1.5 rounded-md text-subtle hover:text-muted hover:bg-surface-2 transition-all duration-150"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-[12px] font-bold px-4 py-2 rounded-lg transition-all duration-150 shadow-[0_4px_12px_rgba(192,52,29,0.25)] hover:shadow-[0_4px_18px_rgba(192,52,29,0.4)] active:scale-[0.97]"
          >
            Get Founding Deal — $19
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/6 rounded-full blur-[120px] pointer-events-none" />
        <motion.div
          className="absolute top-48 left-[12%] w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-32 right-[10%] w-48 h-48 bg-accent/4 rounded-full blur-[60px] pointer-events-none"
          animate={{ y: [12, -12, 12] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: E }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/22 text-[11px] text-accent/80 font-medium mb-10 uppercase tracking-wider"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Canvas-first AI Workspace · BYOK · Free Cloud Sync
        </motion.div>

        {/* H1 */}
        <div className="mb-6 max-w-4xl">
          {[
            { text: "All Your AI Models.", delay: 0.08 },
            { text: "One Infinite Canvas.", delay: 0.18 },
            { text: "No More Tab Chaos.", accent: true, delay: 0.28 },
          ].map(({ text, accent, delay }) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay, ease: E }}
            >
              <h1
                className={`text-[56px] sm:text-[72px] md:text-[88px] font-black tracking-[-0.035em] leading-[1.0] ${
                  accent ? "text-accent" : "text-text"
                }`}
              >
                {text}
              </h1>
            </motion.div>
          ))}
        </div>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38, ease: E }}
          className="text-[16px] sm:text-[18px] text-muted max-w-2xl leading-relaxed mb-2"
        >
          Stop juggling ChatGPT, Claude, Gemini, and Groq across five open tabs. Buildr puts every model on a single visual canvas — branch any conversation, switch any model mid-thought, and carry your full context wherever the idea goes.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="text-[12px] text-subtle mb-10"
        >
          Bring your own API keys. No limits. No per-message fees. No nonsense.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42, ease: E }}
          className="flex flex-wrap items-center justify-center gap-3 mb-4"
        >
          <Link
            href="/login"
            className="group flex items-center gap-2.5 bg-accent hover:bg-accent-hover text-white text-[15px] font-bold px-8 py-4 rounded-xl transition-all duration-150 shadow-[0_6px_28px_rgba(192,52,29,0.4)] hover:shadow-[0_8px_36px_rgba(192,52,29,0.56)] active:scale-[0.97]"
          >
            Get Founding Member Access — $19
            <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-[15px] font-medium text-muted hover:text-text transition-colors duration-150 px-5 py-4 rounded-xl border border-border hover:border-border-focus hover:bg-surface-2"
          >
            Try Free — No Card Needed
          </Link>
        </motion.div>

        {/* Scarcity */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-[11px] text-subtle mb-14 flex items-center gap-1.5"
        >
          <Zap size={10} className="text-accent/60" />
          100 founding spots · Lifetime access · Price goes to $39 after · No subscription ever
        </motion.p>

        {/* Canvas Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55, ease: E }}
          className="w-full max-w-5xl mx-auto"
        >
          <CanvasMockup />
        </motion.div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <Reveal className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.16em] text-accent/70 mb-5 font-semibold">03 — The Problem</p>
          <h2 className="text-[34px] sm:text-[44px] font-bold tracking-[-0.025em] text-text leading-tight mb-3">
            Your current AI workflow is broken.
          </h2>
          <p className="text-[28px] sm:text-[36px] font-bold tracking-[-0.02em] text-muted">
            You just got used to it.
          </p>
        </Reveal>

        {/* Terminal block */}
        <Reveal delay={0.1}>
          <div className="rounded-2xl bg-canvas border border-border overflow-hidden mb-8">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-surface-2" />)}
              <span className="ml-2 text-[10px] text-subtle font-mono">your-ai-workflow.sh</span>
            </div>
            <div className="p-5 space-y-3 font-mono text-[13px]">
              {[
                { tab: "Tab 1", label: "ChatGPT", text: "for the big picture. Good start.", ok: true },
                { tab: "Tab 2", label: "Claude", text: "to refine the reasoning. Better.", ok: true },
                { tab: "Tab 3", label: "Gemini", text: "to pressure-test it. Smart.", ok: true },
                { tab: "Tab 4", label: "Back to ChatGPT", text: "— thread is gone. Context is gone. Starting over. Again.", ok: false },
                { tab: "Tab 5", label: "Your notes app", text: ". Frantically copy-pasting your own thoughts to yourself.", ok: false },
              ].map((row) => (
                <div key={row.tab} className="flex gap-3 items-start">
                  <span className="text-accent/70 shrink-0 tabular-nums">{row.tab} →</span>
                  <span className={row.ok ? "text-muted" : "text-subtle"}>
                    <span className={row.ok ? "text-text font-medium" : "line-through text-subtle/50"}>{row.label}</span>
                    {` ${row.text}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="text-[15px] text-muted leading-relaxed mb-6">
            Every model switch is a <strong className="text-text">context reset</strong>. Every tab switch is a <strong className="text-text">productivity tax</strong>. And rebuilding your mental state from scratch — multiple times per session — is a silent drain nobody talks about.
          </p>

          <div className="rounded-xl border border-accent/18 bg-accent/6 px-6 py-5 mb-6">
            <p className="text-[14px] text-muted leading-relaxed font-medium">
              You&apos;re not bad at using AI. The tools are{" "}
              <span className="text-accent">architecturally broken</span>{" "}
              for the way serious thinkers actually work.
            </p>
          </div>

          <p className="text-[14px] text-muted leading-relaxed">
            The problem isn&apos;t which model you pick. It&apos;s that no tool lets you hold an entire multi-model investigation in one place, branch when ideas diverge, and return without losing everything. Until now.
          </p>
        </Reveal>
      </section>

      {/* ── Experience ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <Reveal className="text-center mb-14">
          <p className="text-[10px] uppercase tracking-[0.16em] text-accent/70 mb-3 font-semibold">04 — The Buildr Experience</p>
          <h2 className="text-[34px] sm:text-[44px] font-bold tracking-[-0.025em] text-text">
            The Canvas AI Experience.
            <br />
            <span className="text-muted">Built for how you actually think.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { num: "①", title: "Start a Canvas", desc: "Open Buildr. Name your workspace. Add your first node. You're already working — no setup, no install." },
            { num: "②", title: "Branch When Ideas Split", desc: "Hit a fork? Branch the conversation. Both threads stay alive. You explore both — nothing dies." },
            { num: "③", title: "Switch Models Mid-Thought", desc: "Move from Claude to GPT-4o in one click. Context travels with you. No copy-paste. No reset." },
            { num: "④", title: "Come Back Anytime", desc: "Close the tab. Open it tomorrow on a different device. Every node, every branch, exactly where you left it." },
          ].map((step, i) => (
            <Reveal key={step.num} delay={i * 0.08}>
              <div className="group bg-surface border border-border hover:border-accent/18 rounded-2xl p-6 h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <span className="text-[28px] font-bold text-accent/35 block mb-4">{step.num}</span>
                <h3 className="text-[15px] font-bold text-text mb-2">{step.title}</h3>
                <p className="text-[13px] text-muted leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features Bento */}
      <FeatureBento />

      {/* Comparison */}
      <Comparison />

      {/* Who It's For */}
      <WhoItsFor />

      {/* Pricing */}
      <Pricing />

      {/* FAQ */}
      <FAQ />

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <Reveal>
          <div className="relative rounded-2xl border border-border bg-surface p-14 text-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-accent/20 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-accent/6 rounded-full blur-3xl pointer-events-none" />

            <p className="text-[10px] uppercase tracking-[0.16em] text-accent/60 mb-6 font-semibold">11 — Final CTA</p>
            <h2 className="text-[34px] sm:text-[44px] font-black tracking-[-0.03em] text-text mb-3 leading-tight">
              Stop paying $40/month
              <br />
              across four broken tabs.
            </h2>
            <p className="text-[14px] text-muted mb-8">Pay $19 once. Think in one place. Keep it forever.</p>

            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 bg-accent hover:bg-accent-hover text-white text-[15px] font-bold px-8 py-4 rounded-xl transition-all duration-150 shadow-[0_6px_24px_rgba(192,52,29,0.35)] hover:shadow-[0_8px_32px_rgba(192,52,29,0.52)] active:scale-[0.97]"
            >
              Get Founding Member Access — $19
              <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>

            <p className="mt-5 text-[11px] text-subtle flex items-center justify-center gap-1.5">
              <Zap size={10} className="text-accent/50" />
              100 founding spots · Lifetime access · Price goes to $39 after · No subscription ever
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-muted">buildr</span>
            <div className="w-1 h-1 rounded-full bg-accent/50" />
          </div>
          <p className="text-[11px] text-subtle">© 2025 buildr. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[
              { label: "Sign in", href: "/login" },
              { label: "Features", href: "#features" },
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-[11px] text-subtle hover:text-muted transition-colors duration-150">
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
