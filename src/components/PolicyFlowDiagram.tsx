"use client";

import { motion } from "framer-motion";
import type { PolicyParams } from "@/lib/rlSimulation";

type PolicyFlowDiagramProps = {
  params: PolicyParams;
  baseline: PolicyParams;
  reliability?: number | null;
  energyPerRide?: number | null;
  gridChange?: number | null;
  reward?: number | null;
};

const PARAM_META: Array<{ key: keyof PolicyParams; label: string; description: string; suffix?: string }> = [
  {
    key: "demandWeight",
    label: "Demand weight",
    description: "How hard the policy chases outstanding ride requests.",
  },
  {
    key: "energyWeight",
    label: "Energy weight",
    description: "Penalty applied to expensive charging windows.",
  },
  {
    key: "chargeThreshold",
    label: "Charge threshold",
    description: "Battery level that triggers a charging detour.",
  },
  {
    key: "exploration",
    label: "Exploration",
    description: "Probability of trying a different corridor than the top score.",
  },
];

function formatDiff(current: number, baseline: number, fractionDigits = 2) {
  const delta = current - baseline;
  if (Math.abs(delta) < 0.005) return "±0.00";
  const prefix = delta > 0 ? "+" : "-";
  return `${prefix}${Math.abs(delta).toFixed(fractionDigits)}`;
}

export function PolicyFlowDiagram({ params, baseline, reliability, energyPerRide, gridChange, reward }: PolicyFlowDiagramProps) {
  const nodes = [
    {
      id: "telemetry",
      title: "Telemetry",
      value: typeof reliability === "number" ? `${reliability.toFixed(1)}% reliability` : "Reliability updating…",
      detail: "Demand pulses, depot load, grid tariffs",
      x: 12,
      y: 30,
    },
    {
      id: "encoder",
      title: "Feature encoder",
      value: "Graph + temporal context",
      detail: "Normalises 24h demand, corridor speed, weather",
      x: 33,
      y: 30,
    },
    {
      id: "policy",
      title: "Policy network",
      value: `DW ${params.demandWeight.toFixed(2)} · EW ${params.energyWeight.toFixed(2)}`,
      detail: "Dense layers weight service vs. energy cost",
      x: 56,
      y: 18,
    },
    {
      id: "explore",
      title: "Exploration head",
      value: `Explore ${params.exploration.toFixed(2)}`,
      detail: "Adds stochasticity so new moves stay on the table",
      x: 56,
      y: 60,
    },
    {
      id: "actions",
      title: "Actions",
      value: "Dispatch · Charge · Hold",
      detail: typeof energyPerRide === "number" ? `${energyPerRide.toFixed(2)} kWh / ride after update` : "Adjusting fleet load…",
      x: 82,
      y: 30,
    },
    {
      id: "reward",
      title: "Reward feedback",
      value: typeof reward === "number" ? `${reward.toFixed(1)} avg reward` : "Collecting reward…",
      detail:
        typeof gridChange === "number"
          ? `${gridChange >= 0 ? "Grid relief" : "Grid stress"} ${gridChange >= 0 ? "↓" : "↑"} ${Math.abs(gridChange).toFixed(1)} pts`
          : "Reliability – grid – equity blend",
      x: 33,
      y: 75,
    },
  ];

  const nodeIndex = Object.fromEntries(nodes.map((node, index) => [node.id, index] as const));

  const edges: Array<[string, string]> = [
    ["telemetry", "encoder"],
    ["encoder", "policy"],
    ["encoder", "explore"],
    ["policy", "actions"],
    ["explore", "actions"],
    ["actions", "reward"],
    ["reward", "policy"],
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-900/90 p-6 text-white shadow-xl shadow-neutral-900/40 backdrop-blur dark:border-neutral-800">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-60 w-[120%] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.2),_transparent_65%)]" />

      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-semibold uppercase tracking-[0.35em] text-emerald-200/80">Policy loop</h3>
          <p className="mt-2 max-w-xl text-sm text-neutral-200">
            This diagram shows how the reinforcement learner turns live telemetry into actions. Nodes pulse as weights shift; the feedback arrow feeds the reward back into the policy network after every epoch.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-300">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          <span>Live inputs updating every optimisation run</span>
        </div>
      </div>

      <div className="relative z-10 mt-6 h-[320px] w-full sm:h-[360px]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(16,185,129,0.2)" />
              <stop offset="50%" stopColor="rgba(94,234,212,0.4)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.5)" />
            </linearGradient>
            <linearGradient id="feedback-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
              <stop offset="100%" stopColor="rgba(236,72,153,0.4)" />
            </linearGradient>
          </defs>
          {edges.map(([from, to], index) => {
            const source = nodes[nodeIndex[from]];
            const target = nodes[nodeIndex[to]];
            const gradient = from === "reward" && to === "policy" ? "url(#feedback-gradient)" : "url(#flow-gradient)";
            return (
              <motion.line
                key={`${from}-${to}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={gradient}
                strokeWidth={1.2}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: index * 0.12, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            className="absolute flex w-[170px] max-w-[45vw] flex-col gap-1 rounded-2xl border border-white/10 bg-white/10 p-4 text-left shadow-md shadow-black/20 backdrop-blur"
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.08 }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-emerald-200/80">{node.title}</span>
            <span className="text-sm font-semibold leading-tight text-white">{node.value}</span>
            <span className="text-[11px] text-neutral-200/80">{node.detail}</span>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PARAM_META.map((meta) => {
          const current = params[meta.key];
          const base = baseline[meta.key];
          const diff = formatDiff(current, base);
          return (
            <div
              key={meta.key}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left shadow-sm shadow-black/10 backdrop-blur"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.35em] text-neutral-300/80">{meta.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-white">{current.toFixed(2)}</span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                    diff.startsWith("+")
                      ? "bg-emerald-500/20 text-emerald-200"
                      : diff.startsWith("-")
                        ? "bg-rose-500/20 text-rose-200"
                        : "bg-white/10 text-white/70"
                  }`}
                >
                  {diff}
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-300/80">{meta.description}</p>
              <p className="mt-1 text-[11px] text-neutral-400/80">Baseline {base.toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


