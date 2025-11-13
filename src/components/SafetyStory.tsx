"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const safetyStats = [
  {
    number: "94%",
    label: "Human Error",
    description: "of crashes caused by driver mistakes",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: "rose",
  },
  {
    number: "40%",
    label: "Pedestrian Deaths",
    description: "happen at intersections and crossings",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: "amber",
  },
  {
    number: "99.9%",
    label: "AV Accuracy",
    description: "in detecting pedestrians and obstacles",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "emerald",
  },
];

const avBenefits = [
  {
    title: "360° Sensor Coverage",
    description: "AVs use lidar, radar, and cameras to detect pedestrians from all angles, eliminating blind spots that plague human drivers.",
    impact: "3× better detection range",
  },
  {
    title: "Instant Reaction Time",
    description: "Autonomous systems react in milliseconds compared to 1.5 seconds for human drivers, critical for preventing pedestrian strikes.",
    impact: "10× faster response",
  },
  {
    title: "Predictive Path Planning",
    description: "AI predicts pedestrian movement patterns and adjusts speed/trajectory proactively, not reactively.",
    impact: "85% fewer close calls",
  },
  {
    title: "Always Alert",
    description: "No fatigue, distraction, or impairment. AVs maintain perfect vigilance 24/7, especially in school zones and crosswalks.",
    impact: "Zero attention lapses",
  },
];

export function SafetyStory() {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const benefitsRef = useRef(null);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const isStatsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const isBenefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });

  return (
    <div className="space-y-12">
      {/* Hero Section with Traffic Image */}
      <section ref={heroRef} className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-neutral-900/80 to-black shadow-2xl">
        <div className="relative h-[500px] w-full">
          <Image
            src="/media/mission-traffic.jpg"
            alt="Urban traffic at night"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={isHeroInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-rose-500/30 bg-rose-500/10 px-6 py-3 backdrop-blur">
                  <svg className="h-6 w-6 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-300">Critical Challenge</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
              >
                Every Day, Pedestrians Pay
                <br />
                <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-amber-400 bg-clip-text text-transparent">
                  The Price of Human Error
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300"
              >
                <strong className="text-white">3,700 pedestrians</strong> die daily in traffic crashes. Autonomous vehicles can change this. With perfect attention, instant reactions, and 360° awareness, AVs eliminate the human errors that cause 94% of crashes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center"
              >
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 backdrop-blur">
                  <div className="text-3xl font-bold text-rose-300">1.35M</div>
                  <div className="mt-1 text-sm text-neutral-400">deaths per year globally</div>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 backdrop-blur">
                  <div className="text-3xl font-bold text-amber-300">50M+</div>
                  <div className="mt-1 text-sm text-neutral-400">injuries and trauma</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 backdrop-blur">
                  <div className="text-3xl font-bold text-emerald-300">90%</div>
                  <div className="mt-1 text-sm text-neutral-400">could be prevented by AVs</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section ref={statsRef} className="grid gap-6 sm:grid-cols-3">
        {safetyStats.map((stat, idx) => {
          const colorClasses = {
            rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30",
            amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
            emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
          };
          const textColors = {
            rose: "text-rose-300",
            amber: "text-amber-300",
            emerald: "text-emerald-300",
          };
          const iconColors = {
            rose: "text-rose-400",
            amber: "text-amber-400",
            emerald: "text-emerald-400",
          };

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              className={`card-hover group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-xl backdrop-blur ${colorClasses[stat.color as keyof typeof colorClasses]}`}
            >
              <div className="relative z-10">
                <div className={`mb-4 ${iconColors[stat.color as keyof typeof iconColors]}`}>
                  {stat.icon}
                </div>
                <div className={`text-4xl font-bold ${textColors[stat.color as keyof typeof textColors]}`}>
                  {stat.number}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{stat.label}</div>
                <div className="mt-1 text-xs text-neutral-400">{stat.description}</div>
              </div>
              <motion.div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          );
        })}
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-neutral-900/60 to-neutral-950/80 p-8 shadow-2xl backdrop-blur sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-400/80">How AVs Save Lives</p>
          <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            Technology That Protects Pedestrians
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-300">
            Autonomous vehicles don&apos;t just drive differently—they see, think, and react in ways that make streets fundamentally safer for everyone.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {avBenefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
              onMouseEnter={() => setActiveCard(idx)}
              onMouseLeave={() => setActiveCard(null)}
              className={`card-hover group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 ${
                activeCard === idx ? "scale-[1.02] border-emerald-500/30 shadow-2xl shadow-emerald-500/20" : ""
              }`}
            >
              <div className="relative z-10">
                <div className="mb-3 flex items-start justify-between">
                  <h4 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors">
                    {benefit.title}
                  </h4>
                  <div className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    {benefit.impact}
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  {benefit.description}
                </p>
              </div>
              <motion.div
                className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl"
                animate={activeCard === idx ? { scale: 1.5, opacity: 0.4 } : { scale: 1, opacity: 0.2 }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 backdrop-blur"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-emerald-300">The Bottom Line</h4>
              <p className="mt-2 text-sm leading-relaxed text-emerald-200/80">
                This platform helps cities deploy AVs where they&apos;ll have the biggest safety impact. By analyzing traffic patterns, pedestrian hotspots, and crash data, we identify the corridors where autonomous shuttles can replace human drivers and save lives today.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

