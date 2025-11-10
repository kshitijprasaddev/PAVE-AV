"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function CongestionStory() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      label: "Traffic builds up",
      description: "Corridors like Audi Forum ↔ Hauptbahnhof see 90+ km/h slowdowns during peak hours.",
      color: "rose",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      label: "RL learns patterns",
      description: "The policy analyzes when demand spikes, where delays hurt most, and which zones need more coverage.",
      color: "sky",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path d="M9 12h6m-6 4h6" />
        </svg>
      ),
      label: "Deploy smarter",
      description: "Platform recommends exact AV counts per corridor, charging windows that avoid grid stress, and service hours.",
      color: "emerald",
    },
  ];

  return (
    <section
      ref={ref}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-neutral-950/80 p-8 shadow-2xl backdrop-blur sm:p-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-amber-400/80">How it works</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
          From congestion data to deployment plan
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-300">
          The reinforcement learning engine doesn&apos;t just show traffic—it solves it. Watch how raw delay data becomes a concrete AV rollout strategy.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => {
          const colorClasses = {
            rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
            sky: "from-sky-500/20 to-sky-600/10 border-sky-500/30 text-sky-400",
            emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
          };
          const colorClass = colorClasses[step.color as keyof typeof colorClasses];

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-lg backdrop-blur ${colorClass.split(" ").slice(0, 3).join(" ")}`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ${colorClass.split(" ")[3]}`}>
                {step.icon}
              </div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-white">{idx + 1}</span>
                <h3 className="text-lg font-semibold text-white">{step.label}</h3>
              </div>
              <p className="text-sm leading-relaxed text-neutral-300">{step.description}</p>
              {idx < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                  <svg className="h-6 w-6 text-neutral-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 backdrop-blur"
      >
        <p className="text-sm font-semibold text-violet-300">Reading the map below:</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-violet-200/80">
          <li>• <strong>Yellow/red glowing lines</strong> = congested corridors (the thicker the line, the worse the delay)</li>
          <li>• <strong>Blue heat patches</strong> = high rider demand zones (where people are waiting)</li>
          <li>• <strong>Green depot markers</strong> = charging hubs the RL policy uses to balance energy costs</li>
          <li>• <strong>White highlighted path</strong> = selected corridor you clicked in the traffic cards</li>
        </ul>
      </motion.div>
    </section>
  );
}

