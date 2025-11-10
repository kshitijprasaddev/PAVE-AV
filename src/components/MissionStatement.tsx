"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function MissionStatement() {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const isInView1 = useInView(ref1, { once: true, margin: "-100px" });
  const isInView2 = useInView(ref2, { once: true, margin: "-100px" });

  return (
    <div className="space-y-8">
      {/* First panel: Lives lost */}
      <section ref={ref1} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-black shadow-2xl">
        <div className="grid lg:grid-cols-2">
          <div className="relative h-[320px] overflow-hidden lg:h-auto">
            <Image
              src="/media/mission-lives.jpg"
              alt="Urban Ingolstadt street scene"
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/95" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={isInView1 ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-white sm:text-7xl">1.35M</div>
                <div className="mt-3 text-sm font-medium uppercase tracking-[0.3em] text-rose-400">Lives lost annually</div>
                <div className="mt-2 text-xs text-neutral-400">in road crashes worldwide</div>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6 p-8 sm:p-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-rose-400/80">The Problem</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Human-driven vehicles fail. Autonomous systems can save lives.
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-base leading-relaxed text-neutral-300"
            >
              But cities don&apos;t know <strong className="text-white">where to deploy AVs</strong>, <strong className="text-white">how many to stage</strong>, or <strong className="text-white">when to charge them</strong> without overloading the grid. That&apos;s the gap this platform fills.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView1 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 backdrop-blur"
            >
              <p className="text-sm leading-relaxed text-rose-200/90">
                <strong className="text-rose-300">Our mission:</strong> Give planners a live twin that turns traffic data into actionable AV deployment plans—proving autonomous fleets can improve safety while reducing costs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Second panel: Hours wasted */}
      <section ref={ref2} className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-black shadow-2xl">
        <div className="grid lg:grid-cols-2">
          <div className="order-2 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-xs font-medium uppercase tracking-[0.4em] text-amber-400/80">The Opportunity</p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                70+ billion hours spent driving every year
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-base leading-relaxed text-neutral-300"
            >
              Congestion wastes time, fuel, and money. This platform uses <strong className="text-white">live traffic telemetry</strong> and <strong className="text-white">reinforcement learning</strong> to show cities exactly where autonomous shuttles can replace inefficient routes, cut delays, and free up capacity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Input</div>
                <div className="mt-1 text-base font-semibold text-white">Traffic data</div>
              </div>
              <div className="flex items-center text-neutral-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 backdrop-blur">
                <div className="text-xs font-medium uppercase tracking-wider text-emerald-400">RL Engine</div>
                <div className="mt-1 text-base font-semibold text-white">Optimization</div>
              </div>
              <div className="flex items-center text-neutral-600">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Output</div>
                <div className="mt-1 text-base font-semibold text-white">Fleet plan</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 backdrop-blur"
            >
              <p className="text-sm leading-relaxed text-sky-200/90">
                <strong className="text-sky-300">What you&apos;ll see below:</strong> A live Ingolstadt map with traffic overlays, an RL optimizer that learns in real time, and deployment recommendations you can export for city councils.
              </p>
            </motion.div>
          </div>

          <div className="order-1 relative h-[320px] overflow-hidden lg:order-2 lg:h-auto">
            <Image
              src="/media/mission-traffic.jpg"
              alt="Night traffic congestion"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-black/95" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={isInView2 ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-white sm:text-7xl">70B+</div>
                <div className="mt-3 text-sm font-medium uppercase tracking-[0.3em] text-amber-400">Hours driving</div>
                <div className="mt-2 text-xs text-neutral-400">wasted in traffic annually</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
