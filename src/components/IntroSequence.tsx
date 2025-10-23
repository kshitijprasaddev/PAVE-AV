"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "@/components/Hero";

type IntroSequenceProps = {
  onReveal: () => void;
  revealed: boolean;
};

export function IntroSequence({ onReveal, revealed }: IntroSequenceProps) {
  const [stage, setStage] = useState<"intro" | "hero">("intro");

  const showHero = stage === "hero";

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
                className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-400"
              >
                Continue
              </button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {showHero && <Hero onReveal={onReveal} revealed={revealed} />}
    </>
  );
}


