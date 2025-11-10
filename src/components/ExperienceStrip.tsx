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
        "relative overflow-hidden rounded-3xl border border-neutral-200 bg-white/70 p-6 shadow-lg shadow-neutral-900/5 backdrop-blur-lg dark:border-neutral-800 dark:bg-neutral-950/70",
        className
      )}
    >
      <div className="pointer-events-none absolute -top-32 left-1/2 z-0 h-64 w-[120%] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-400/20 via-transparent to-sky-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(90,90,170,0.25),_transparent_65%)]" />
      <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.42em] text-neutral-500 dark:text-neutral-400">Experience snapshot</p>
          <h3 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            How the twin is organised at a glance
          </h3>
        </div>
        <p className="max-w-md text-sm text-neutral-600 dark:text-neutral-300">
          Three views work together: live corridor telemetry, policy optimization, and deployment metrics. Each panel updates as the system learns.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {featureColumns.map((feature, idx) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-5 text-left shadow-sm shadow-neutral-900/10 dark:border-white/5 dark:bg-neutral-900/60"
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", feature.accent)} />
            <div className="relative z-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
                {feature.eyebrow}
              </span>
              <h4 className="mt-3 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{feature.title}</h4>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{feature.body}</p>
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


