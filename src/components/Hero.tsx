"use client";

import Image from "next/image";
import { useCallback } from "react";
import { motion } from "framer-motion";

type HeroProps = {
  scrollTargetId?: string;
};

export function Hero({ scrollTargetId = "dashboard" }: HeroProps) {
  const scrollToTarget = useCallback(() => {
    const target = document.getElementById(scrollTargetId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollTargetId]);

  const handleLaunch = useCallback(() => {
    window.dispatchEvent(new CustomEvent("run-optimization"));
    scrollToTarget();
  }, [scrollToTarget]);

  return (
    <section className="relative -mx-4 -mt-20 flex min-h-screen items-center justify-center overflow-hidden sm:-mx-6">
      <div className="absolute inset-0">
        <Image
          src="/media/hero-ingolstadt.jpg"
          alt="Ingolstadt cityscape"
          fill
          className="object-cover"
          priority
          quality={95}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/60 via-neutral-950/50 to-neutral-950/80" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-white/70">Autonomous Mobility Twin</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Ingolstadt Autonomous Orchestrator
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-2xl text-base text-white/85 sm:text-lg"
        >
          Real-time corridor telemetry, reinforcement learning policy, and energy-aware fleet scheduling converge in a single control room.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center"
        >
          <button
            onClick={handleLaunch}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-1 hover:bg-emerald-400"
          >
            Launch the twin
          </button>
          <button
            onClick={scrollToTarget}
            className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-8 py-4 text-sm font-semibold text-white transition hover:-translate-y-1 hover:border-white/50 hover:bg-white/10"
          >
            Explore below
          </button>
        </motion.div>

        <motion.button
          type="button"
          onClick={scrollToTarget}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="group mt-8 flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/60 transition hover:text-white"
        >
          <span>Scroll to begin</span>
          <motion.span
            className="h-12 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent"
            animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.button>
      </div>
    </section>
  );
}
