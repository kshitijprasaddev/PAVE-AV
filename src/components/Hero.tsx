"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const orbs = [
  {
    className: "top-[-15%] left-[-5%] h-64 w-64 bg-gradient-to-br from-emerald-400/40 via-transparent to-transparent",
    animation: { duration: 14, delay: 0.2 },
  },
  {
    className: "bottom-[-10%] right-[5%] h-72 w-72 bg-gradient-to-br from-sky-400/35 via-transparent to-transparent",
    animation: { duration: 16, delay: 0.6 },
  },
  {
    className: "top-1/3 right-1/2 h-56 w-56 bg-gradient-to-br from-violet-400/30 via-transparent to-transparent",
    animation: { duration: 18, delay: 1 },
  },
];

export function Hero({ onReveal, revealed }: HeroProps) {
  const [play, setPlay] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToTarget = useCallback((targetId?: string) => {
    const scrollOnce = () => {
      const target = targetId ? document.getElementById(targetId) : document.getElementById("dashboard");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    scrollOnce();
    window.setTimeout(scrollOnce, 320);
  }, []);

  const triggerReveal = ({ run, targetId, href }: { run: boolean; targetId?: string; href?: string }) => {
    if (play) return;
    setPlay(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    onReveal();
    const delay = run ? 900 : 350;
    timerRef.current = setTimeout(() => {
      if (run) window.dispatchEvent(new CustomEvent("run-optimization"));
      if (href) {
        window.location.href = href;
      } else {
        scrollToTarget(targetId);
      }
    }, delay);
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
                "linear-gradient(135deg, rgba(5,5,15,0.9), rgba(10,45,68,0.75)), url('/hero-investor.jpg')",
            }}
          />
          {orbs.map((orb, idx) => (
            <motion.div
              key={idx}
              className={`pointer-events-none absolute rounded-full blur-3xl ${orb.className}`}
              initial={{ opacity: 0.2, scale: 0.9 }}
              animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.05, 0.92] }}
              transition={{ duration: orb.animation.duration, delay: orb.animation.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-10 px-6 text-white">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-semibold tracking-tight sm:text-[44px]"
            >
              Autonomous Mobility Orchestrator · Ingolstadt City Twin
            </motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="max-w-3xl text-[13px] text-white/80 sm:text-[15px]"
            >
              I built a real-time autonomous mobility twin so I can stand on stage in Brussels and show exactly how many lives, hours, and kilowatts a student-designed AV fleet can save.
            </motion.p>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="text-[12px] text-white/70 sm:text-[14px]"
            >
              Live corridor telemetry, reinforcement planning, and energy-aware scheduling come together here—it&apos;s the same demo I will defend in front of the PAVE Europe jury.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-xl backdrop-blur-sm sm:grid-cols-3"
            >
              {[ 
                { value: "1.35M", label: "lives lost each year", note: "AV-first streets can protect thousands" },
                { value: "70B", label: "hours spent driving", note: "Autonomy gives this time back to citizens" },
                { value: "0.3 kWh", label: "energy per AV ride", note: "My twin balances fleet load with the grid" },
              ].map((item, idx) => (
                <motion.div
                  key={item.value}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + idx * 0.15, duration: 0.55 }}
                  className="rounded-2xl bg-white/5 p-4"
                >
                  <div className="text-3xl font-semibold text-white sm:text-4xl">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.3em] text-lime-200/80">{item.label}</div>
                  <p className="mt-2 text-xs text-white/70">{item.note}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="flex flex-col items-start gap-3 sm:flex-row"
            >
              <button
                onClick={handleReveal}
                className="rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Enter the city twin
              </button>
              <button
                onClick={handleWhy}
                className="rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                Why Ingolstadt?
              </button>
            </motion.div>
            <motion.button
              type="button"
              onClick={handleReveal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="group flex flex-col items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/70 transition hover:text-white"
            >
              <span>Scroll to launch</span>
              <motion.span
                className="h-12 w-px bg-gradient-to-b from-transparent via-white/70 to-transparent"
                animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
            </motion.button>
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


