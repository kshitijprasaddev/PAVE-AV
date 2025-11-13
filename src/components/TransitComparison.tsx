"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const realINVGData = {
  fleet: 274, // buses
  drivers: 326,
  employees: 26,
  lines: 60,
  ridership: 15.5, // million per year
  distance: 6.318, // million km per year
  stops: 966,
  population: 255000, // service area
  avgDailyRiders: 42466, // ~15.5M / 365
};

const avScenario = {
  fleet: 120, // proposed AVs
  drivers: 0, // autonomous
  employees: 18, // reduced ops team
  lines: 12, // optimized core corridors
  ridership: 18.6, // million per year (20% increase)
  distance: 4.4, // million km per year (30% reduction through optimization)
  stops: 450, // dynamic pickup zones
  population: 255000, // same area
  avgDailyRiders: 50959, // 20% increase
};

const comparisons = [
  {
    metric: "Fleet Size",
    invg: "274 buses",
    av: "120 AVs",
    improvement: "56% fewer vehicles",
    explanation: "AVs operate 18+ hours/day vs 12-hour bus shifts. Better utilization means fewer vehicles needed for same (or better) service.",
    color: "emerald",
  },
  {
    metric: "Annual Ridership",
    invg: "15.5M passengers",
    av: "18.6M passengers",
    improvement: "+20% more served",
    explanation: "Shorter wait times and dynamic routing attract riders who currently drive or walk. INVG's ridership has stagnated since 2011 (49,908 daily riders).",
    color: "sky",
  },
  {
    metric: "Operating Distance",
    invg: "6.32M km/year",
    av: "4.4M km/year",
    improvement: "30% less driving",
    explanation: "RL optimizer minimizes empty runs and deadheading. Vehicles reposition only when high-value rides are predicted, unlike fixed bus routes that run empty during off-peak.",
    color: "violet",
  },
  {
    metric: "Workforce",
    invg: "326 drivers + 26 staff",
    av: "0 drivers + 18 staff",
    improvement: "95% labor reduction",
    explanation: "Main cost savings come from eliminating driver wages (€35-45K/year each). Remaining staff handle fleet monitoring, maintenance coordination, and customer service.",
    color: "amber",
  },
];

export function TransitComparison() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-neutral-950/80 p-8 shadow-2xl backdrop-blur sm:p-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-emerald-400/80">Real Data Comparison</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          INVG Today vs Optimized AV Fleet
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          Ingolstadt's current public transit (INVG) operates 274 buses serving 15.5M annual riders. Here's how an optimized autonomous fleet would compare using real 2019 INVG operational data.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {comparisons.map((comp, idx) => {
          const isExpanded = expandedCard === idx;
          const colorClasses = {
            emerald: "border-emerald-500/30 bg-emerald-500/5",
            sky: "border-sky-500/30 bg-sky-500/5",
            violet: "border-violet-500/30 bg-violet-500/5",
            amber: "border-amber-500/30 bg-amber-500/5",
          };
          const badgeColors = {
            emerald: "bg-emerald-500/20 text-emerald-300",
            sky: "bg-sky-500/20 text-sky-300",
            violet: "bg-violet-500/20 text-violet-300",
            amber: "bg-amber-500/20 text-amber-300",
          };

          return (
            <motion.div
              key={comp.metric}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`card-hover overflow-hidden rounded-2xl border backdrop-blur ${colorClasses[comp.color as keyof typeof colorClasses]}`}
            >
              <button
                onClick={() => setExpandedCard(isExpanded ? null : idx)}
                className="w-full p-6 text-left transition hover:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{comp.metric}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-neutral-500">INVG Current</div>
                        <div className="mt-1 font-semibold text-neutral-300">{comp.invg}</div>
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500">AV Optimized</div>
                        <div className="mt-1 font-semibold text-white">{comp.av}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeColors[comp.color as keyof typeof badgeColors]}`}>
                      {comp.improvement}
                    </span>
                    <motion.svg
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="h-5 w-5 text-neutral-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </div>
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{ height: isExpanded ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/10 p-6">
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {comp.explanation}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-8 rounded-xl border border-sky-500/30 bg-sky-500/10 p-6 backdrop-blur"
      >
        <div className="flex items-start gap-4">
          <svg className="h-6 w-6 flex-shrink-0 text-sky-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h4 className="text-lg font-semibold text-sky-300">Data Source: INVG 2019 Annual Report</h4>
            <p className="mt-2 text-sm leading-relaxed text-sky-200/90">
              All INVG figures (274 buses, 15.5M annual riders, 6.32M km traveled) are from official Ingolstädter Verkehrsgesellschaft public records. AV scenario projections based on RL optimizer results shown in this platform, scaled to match INVG's service area (255K population across Ingolstadt + 16 surrounding municipalities).
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 backdrop-blur"
      >
        <div className="flex items-start gap-4">
          <svg className="h-6 w-6 flex-shrink-0 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-amber-300">Important Limitation</h4>
            <p className="mt-2 text-xs leading-relaxed text-amber-200/90">
              The AV scenario is a projection, not a deployed system. The 20% ridership increase assumes AVs attract new riders through better service (shorter wait times, dynamic routing). The 30% distance reduction comes from this platform's RL optimizer eliminating empty bus runs. These are estimates, not guarantees.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

