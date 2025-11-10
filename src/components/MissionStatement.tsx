"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function MissionStatement() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative -mx-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-black shadow-2xl sm:-mx-6">
      <div className="grid lg:grid-cols-2">
        <div className="relative h-[300px] overflow-hidden lg:h-auto">
          <Image
            src="/media/hero-ingolstadt.jpg"
            alt="Ingolstadt cityscape at night"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="text-6xl font-bold text-white sm:text-7xl">1.35M</div>
              <div className="mt-2 text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">Lives lost annually</div>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-400/80">The Challenge</p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
              Autonomous vehicles can save lives. Cities need a roadmap.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-base leading-relaxed text-neutral-300"
          >
            This platform shows city planners <strong className="text-white">where to deploy autonomous fleets</strong>, <strong className="text-white">how many vehicles to stage</strong>, and <strong className="text-white">when to charge them</strong> without overloading the grid.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Input</div>
              <div className="mt-1 text-lg font-semibold text-white">Live traffic data</div>
            </div>
            <div className="flex items-center text-neutral-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 backdrop-blur">
              <div className="text-xs font-medium uppercase tracking-wider text-emerald-400">RL Optimizer</div>
              <div className="mt-1 text-lg font-semibold text-white">Policy engine</div>
            </div>
            <div className="flex items-center text-neutral-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Output</div>
              <div className="mt-1 text-lg font-semibold text-white">Deployment plan</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 backdrop-blur"
          >
            <p className="text-sm leading-relaxed text-sky-200/90">
              <strong className="text-sky-300">Goal:</strong> Prove that intelligent AV scheduling can improve reliability, reduce emissions, and save costs compared to traditional bus networks.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

