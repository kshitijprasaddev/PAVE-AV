"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type HeroProps = {
  onReveal: () => void;
  revealed: boolean;
};

const shards = [
  { rotate: -4, x: "-35%", y: "-10%" },
  { rotate: 3, x: "10%", y: "-20%" },
  { rotate: -8, x: "-5%", y: "20%" },
  { rotate: 6, x: "30%", y: "15%" },
  { rotate: 0, x: "0%", y: "-5%" },
];

export function Hero({ onReveal, revealed }: HeroProps) {
  const [play, setPlay] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerReveal = ({ run, targetId, href }: { run: boolean; targetId?: string; href?: string }) => {
    if (play) return;
    setPlay(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onReveal();
      if (run) window.dispatchEvent(new CustomEvent("run-optimization"));
      if (href) {
        window.location.href = href;
      } else {
        const target = targetId ? document.getElementById(targetId) : document.getElementById("dashboard");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    }, run ? 1100 : 600);
  };

  const handleReveal = () => {
    triggerReveal({ run: false, targetId: "dashboard" });
  };

  const handleWhy = () => {
    triggerReveal({ run: false, href: "/concept#why-ingolstadt" });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {!revealed && (
        <motion.section
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-neutral-950"
          initial={{ opacity: 1 }}
          animate={{ opacity: play ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(to bottom, rgba(5,5,10,0.55), rgba(5,5,10,0.75)), url('/hero-investor.jpg')",
            }}
          />
          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Autonomous Mobility Orchestrator
            </motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-4 text-sm text-white/80 sm:text-base"
            >
              This demo blends live corridor telemetry, reinforcement learning, and energy-aware scheduling so Ingolstadt can field a clear autonomous mobility plan.
            </motion.p>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-3 text-sm text-white/70"
            >
              Run the twin to align city teams, energy partners, and operators on the corridors, fleet sizes, and charging windows that move the needle.
            </motion.p>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <button
                onClick={handleReveal}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:scale-105 hover:bg-emerald-400"
              >
                Reveal the AV twin
              </button>
              <button
                onClick={handleWhy}
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Why Ingolstadt?
              </button>
            </motion.div>
          </div>

          {shards.map((shard, idx) => (
            <motion.div
              key={idx}
              className="absolute h-[140vh] w-[70vw] bg-white/4 backdrop-blur-sm"
              style={{
                left: shard.x,
                top: shard.y,
                rotate: `${shard.rotate}deg`,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: play ? 0 : 0.6, scale: play ? 1.4 : 1 }}
              exit={{ opacity: 0, scale: 1.6 }}
              transition={{ duration: 1, delay: 0.05 * idx, ease: "easeInOut" }}
            />
          ))}
        </motion.section>
      )}
    </AnimatePresence>
  );
}


