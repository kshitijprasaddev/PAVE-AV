"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const metrics = [
  {
    id: "reliability",
    name: "Reliability",
    baseline: "75.0%",
    explanation: "The **baseline** represents a hypothetical starting point: if Ingolstadt deployed AVs today with no optimization, the system would serve about 75% of ride requests successfully (similar to current bus reliability). This is the benchmark. When the RL optimizer runs, it tests different fleet sizes and routing strategies. If reliability increases to 91.7%, that's a **16.7% improvement**, meaning the optimized AV fleet serves more riders than a naive deployment. **Note:** If reliability drops (shows negative %), the RL policy is exploring a trade-off, sacrificing some reliability to save energy or reduce grid stress. This is intentional. The agent tests whether serving 5% fewer riders but cutting energy costs by 20% delivers better overall value.",
    howItWorks: "The RL agent learns which corridors have high demand and positions vehicles proactively. It minimizes wait times by predicting where riders will be, not just reacting to requests. During training, it deliberately tests bad policies to learn what doesn't work.",
  },
  {
    id: "energy",
    name: "Energy per Ride",
    baseline: "0.60 kWh",
    explanation: "The **baseline** is the estimated energy cost per passenger trip if AVs were deployed without optimization. At 0.60 kWh, this represents a naive strategy (charge anytime, route reactively). The RL optimizer tests when to charge vehicles (off-peak vs peak hours) and how to route them efficiently to minimize empty miles. If energy drops to 0.48 kWh, the platform saves **0.12 kWh per ride**, which scales to millions in annual savings across a city fleet.",
    howItWorks: "The agent avoids peak electricity pricing by charging at night and coordinates routes to minimize empty deadheading (driving without passengers). It balances energy costs against service reliability.",
  },
  {
    id: "grid",
    name: "Grid Stress",
    baseline: "38.0 pts",
    explanation: "The **baseline** is the current peak load on the city's electrical grid when all depot chargers run simultaneously. At 38 points, this represents stress on transformers and feeders. The RL optimizer spreads charging across time and depots. If grid stress drops to 28 points, that's **10 points of relief**, meaning you avoid expensive grid upgrades ($5M-20M per substation).",
    howItWorks: "The agent staggers vehicle charging so not all AVs plug in at 6 PM (peak demand). It uses time-of-use pricing signals and depot capacity constraints to flatten the load curve, reducing infrastructure costs.",
  },
  {
    id: "reward",
    name: "Reward Score",
    baseline: "50.0",
    explanation: "The **baseline** is a composite score combining reliability, energy efficiency, and equity. At 50 points, this represents the current system's overall performance. The RL optimizer maximizes this reward by finding the optimal trade-off. A score of 72 means the new policy is **44% better** at balancing all three objectives (serve more riders, use less energy, distribute service fairly).",
    howItWorks: "The reward function penalizes unserved riders, high energy costs, and unequal service across neighborhoods. The RL agent explores thousands of policy combinations per training epoch to find the strategy that maximizes this weighted score.",
  },
];

export function BaselineExplainer() {
  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-violet-600/5 p-8 shadow-2xl backdrop-blur sm:p-10"
    >
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <svg className="h-8 w-8 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h3 className="text-2xl font-bold text-white">Understanding the Metrics</h3>
            <p className="mt-1 text-sm text-neutral-400">What "baseline" means and how RL improves each metric</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, idx) => {
          const isActive = activeMetric === metric.id;
          
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] shadow-lg backdrop-blur"
            >
              <button
                onClick={() => setActiveMetric(isActive ? null : metric.id)}
                className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20">
                    <span className="text-lg font-bold text-violet-300">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{metric.name}</h4>
                    <p className="mt-1 text-sm text-neutral-400">Baseline: <span className="font-semibold text-violet-300">{metric.baseline}</span></p>
                  </div>
                </div>
                <motion.svg
                  animate={{ rotate: isActive ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-6 w-6 flex-shrink-0 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <motion.div
                initial={false}
                animate={{ height: isActive ? "auto" : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-4 border-t border-white/10 p-6">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-1 w-8 rounded-full bg-gradient-to-r from-sky-400 to-sky-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">What is Baseline?</span>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {metric.explanation.split("**").map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                      )}
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-1 w-8 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">How RL Improves It</span>
                    </div>
                    <p className="text-sm leading-relaxed text-neutral-300">
                      {metric.howItWorks.split("**").map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                      )}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 flex-shrink-0 text-violet-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs leading-relaxed text-violet-200/90">
                        <strong className="text-violet-300">How baseline was set:</strong> Based on typical public transit reliability benchmarks (70-80% for European cities) and standard AV energy consumption estimates from published pilot studies (Waymo, Cruise, EasyMile). Grid stress calibrated to Ingolstadt's transformer capacity.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 backdrop-blur">
        <div className="flex items-start gap-4">
          <svg className="h-6 w-6 flex-shrink-0 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <div>
            <h4 className="text-lg font-semibold text-emerald-300">The Key Insight</h4>
            <p className="mt-2 text-sm leading-relaxed text-emerald-200/90">
              The RL optimizer doesn't just improve one metric. It finds the optimal balance across all four. Sometimes it sacrifices a bit of energy efficiency to serve 10% more riders, or delays charging by an hour to avoid peak grid stress. That's the power of reinforcement learning: it learns trade-offs that humans can't calculate manually.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

