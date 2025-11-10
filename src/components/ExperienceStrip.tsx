"use client";

import { motion } from "framer-motion";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const featureColumns = [
  {
    eyebrow: "Live map",
    title: "Delay, demand, and charging load arrive in under two minutes.",
    body: "As soon as you refresh, the map lights up with real traffic slowdowns, depot dwell times, and rider hotspots (no placeholder data).",
    accent: "from-emerald-400/25 via-cyan-300/15 to-transparent",
  },
  {
    eyebrow: "Policy levers",
    title: "Every slider shows its impact in plain numbers.",
    body: "Demand weight, charge threshold, and exploration instantly update the reliability, wait times, and energy cards so anyone can follow along.",
    accent: "from-sky-400/25 via-indigo-300/15 to-transparent",
  },
  {
    eyebrow: "Rollout plan",
    title: "Ingolstadt is the example, not the limit.",
    body: "Drop in data from Antwerp, Lyon, or Hamburg and the same loop highlights new corridors, depots, and fleet counts overnight.",
    accent: "from-violet-400/25 via-fuchsia-300/15 to-transparent",
  },
];

export function ExperienceStrip({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/40 via-neutral-950/60 to-black/80 p-8 shadow-2xl backdrop-blur-lg",
        className
      )}
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 z-0 h-64 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400/15 via-sky-400/10 to-violet-400/15 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-400/80">Key Features</p>
          <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Three integrated views
          </h3>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-neutral-300">
          Corridor telemetry, optimization engine, and deployment metrics update together. No technical background required.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {featureColumns.map((feature, idx) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="card-hover group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 text-left shadow-xl backdrop-blur"
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", feature.accent)} />
            <div className="relative z-10">
              <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-400/70">
                {feature.eyebrow}
              </span>
              <h4 className="mt-4 text-lg font-semibold leading-snug text-white group-hover:text-emerald-300 transition-colors">{feature.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors">{feature.body}</p>
            </div>
            <motion.div
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl dark:bg-white/10"
              animate={{ rotate: [0, 12, -6, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.article>
        ))}
      </div>
    </section>
  );
}


