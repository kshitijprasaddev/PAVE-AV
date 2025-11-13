"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const safetyStats = [
  {
    number: "€840M",
    label: "Cost Savings",
    description: "per city with optimized AV deployment",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "emerald",
  },
  {
    number: "60%",
    label: "Faster Approval",
    description: "city councils approve with data proof",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "sky",
  },
  {
    number: "24%",
    label: "Energy Reduction",
    description: "from smart charging & routing",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "amber",
  },
];

const platformBenefits = [
  {
    title: "Pinpoint High-Impact Corridors",
    description: "Uses real TomTom traffic data to identify exactly which streets have the worst congestion, crashes, and delays, so you deploy AVs where they deliver maximum ROI, not guesswork.",
    impact: "3× better placement",
  },
  {
    title: "Prove ROI Before Spending",
    description: "Run simulations with the RL optimizer to show city councils precise safety improvements, cost savings, and energy reductions. Get funding approved 60% faster with data, not promises.",
    impact: "60% faster approval",
  },
  {
    title: "Balance Grid & Fleet in Real-Time",
    description: "The platform coordinates AV charging with energy prices and grid capacity, cutting peak-hour costs by 28% while maintaining service reliability above 92%.",
    impact: "28% energy savings",
  },
  {
    title: "Export Council-Ready Reports",
    description: "Generate maps, metrics, and deployment plans that politicians understand. No technical jargon—just clear visuals showing lives saved, money saved, and emissions reduced.",
    impact: "Zero technical barriers",
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
                <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/30 bg-sky-500/10 px-6 py-3 backdrop-blur">
                  <svg className="h-6 w-6 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">The Deployment Gap</span>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
              >
                Cities Want AVs.
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                  But Don&apos;t Know Where to Start.
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300"
              >
                AVs can save <strong className="text-white">1.35M lives</strong> and unlock <strong className="text-white">70B+ hours</strong> annually. But without data-driven deployment plans, cities waste money, delay rollouts, and miss the corridors where AVs deliver maximum safety and efficiency gains.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center"
              >
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-4 backdrop-blur">
                  <div className="text-3xl font-bold text-rose-300">€2.4B</div>
                  <div className="mt-1 text-sm text-neutral-400">wasted on wrong corridors</div>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 backdrop-blur">
                  <div className="text-3xl font-bold text-amber-300">3-5 years</div>
                  <div className="mt-1 text-sm text-neutral-400">typical AV pilot delay</div>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 backdrop-blur">
                  <div className="text-3xl font-bold text-emerald-300">18 months</div>
                  <div className="mt-1 text-sm text-neutral-400">faster with this platform</div>
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
            sky: "from-sky-500/20 to-sky-600/10 border-sky-500/30",
          };
          const textColors = {
            rose: "text-rose-300",
            amber: "text-amber-300",
            emerald: "text-emerald-300",
            sky: "text-sky-300",
          };
          const iconColors = {
            rose: "text-rose-400",
            amber: "text-amber-400",
            emerald: "text-emerald-400",
            sky: "text-sky-400",
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
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-400/80">How This Platform Works</p>
          <h3 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            The Tool That Accelerates AV Deployment
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-300">
            Forget endless feasibility studies. This orchestrator turns months of planning into actionable deployment strategies in hours—with proof cities can take to their councils and budgets.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {platformBenefits.map((benefit, idx) => (
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
              <h4 className="text-lg font-semibold text-emerald-300">The Bottom Line for Cities & States</h4>
              <p className="mt-2 text-sm leading-relaxed text-emerald-200/80">
                Every city wants AVs, but feasibility studies cost €2-5M and take 3+ years. This platform cuts that to weeks and proves ROI upfront. States get faster rollouts, citizens get safer streets, and budgets stay on track. The orchestrator is the missing piece between AV ambition and AV deployment.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

