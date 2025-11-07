"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "@/components/Hero";

type IntroSequenceProps = {
  onReveal: () => void;
  revealed: boolean;
};

export function IntroSequence({ onReveal, revealed }: IntroSequenceProps) {
  const [stage, setStage] = useState<"intro" | "hero">("intro");

  const showHero = stage === "hero";

  useEffect(() => {
    if (revealed || stage !== "intro") return;
    const timer = setTimeout(() => setStage("hero"), 3400);
    return () => clearTimeout(timer);
  }, [revealed, stage]);

  return (
    <>
      <AnimatePresence>
        {!revealed && stage === "intro" && (
          <motion.section
            key="intro-stats"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-neutral-950"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "linear-gradient(to bottom, rgba(5,5,10,0.6), rgba(5,5,10,0.9)), url('/robin-pierre-dPgPoiUIiXk-unsplash.jpg')" }}
            />
            <div className="pointer-events-none absolute -left-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute right-[-10%] top-20 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
            <motion.div
              className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center text-white"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-xs uppercase tracking-[0.5em] text-white/70">Why autonomy matters</p>
              <div className="grid w-full gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <div className="text-sm uppercase tracking-widest text-white/70">Lives at stake</div>
                    <div className="mt-2 text-4xl font-bold">1.35 Million</div>
                    <p className="mt-2 text-sm text-white/80">People die every year in road crashes. Autonomous systems can cut a huge share of those losses.</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                    <div className="text-sm uppercase tracking-widest text-white/70">Hours lost driving</div>
                    <div className="mt-2 text-4xl font-bold">70+ Billion</div>
                    <p className="mt-2 text-sm text-white/80">Hours spent behind the wheel annually. Autonomy gives time back to people and local economies.</p>
                  </div>
                </div>
                <p className="text-sm text-white/85">
                  These two numbers pulled me into Autonomous Vehicle Engineering at Technische Hochschule Ingolstadt. Highly engineered AV fleets can save lives, return time, and reshape how cities plan mobility. This demo shows how a city twin can guide that rollout.
                </p>
              </div>
              <button
                onClick={() => setStage("hero")}
                className="rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white/85 transition hover:-translate-y-0.5 hover:border-white/70 hover:text-white"
              >
                Skip intro
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {showHero && <Hero onReveal={onReveal} revealed={revealed} />}
    </>
  );
}


