"use client";

import { motion } from "framer-motion";
import type { OrchestrationPlan } from "@/lib/orchestrator";
import type { RouteDetails } from "@/types/routes";

export function RLSidePanel({
  epoch,
  reward,
  log,
  routes,
  isRunning,
  hasRun,
  plan,
  basePlan,
  summary,
  gridRelief,
}: {
  epoch: number;
  reward: number;
  log: string;
  routes: RouteDetails[];
  isRunning: boolean;
  hasRun: boolean;
  plan: OrchestrationPlan | null;
  basePlan?: OrchestrationPlan | null;
  summary?: {
    reliability: number;
    energyPerRide: number;
    gridRelief: number;
    rewardAvg: number;
    served: number;
    unmet: number;
    energyCost: number;
  } | null;
  gridRelief?: number | null;
}) {
  const best = [...routes].sort((a, b) => (b.delayTime ?? 0) - (a.delayTime ?? 0))[0];
  const reliability = summary ? Number(summary.reliability.toFixed(1)) : plan ? Number(plan.serviceReliability.toFixed(1)) : 0;
  const energyPerRide = summary ? Number(summary.energyPerRide.toFixed(2)) : plan?.energyPerRideKwh ?? 0;
  const gridReliefRaw = summary ? summary.gridRelief : plan && basePlan ? basePlan.gridStressIndex - plan.gridStressIndex : 0;
  const gridReliefValue = gridRelief != null ? gridRelief : Number(Math.max(0, gridReliefRaw).toFixed(1));
  const rewardAvg = summary ? summary.rewardAvg : reward;

  const metrics = [
    {
      label: "Reliability",
      value: reliability,
      max: 100,
      detail: "Served rides as share of total demand",
      unit: " %",
    },
    {
      label: "Energy per ride",
      value: energyPerRide,
      max: Math.max(12, energyPerRide + 2),
      detail: "Average kWh required per completed trip",
      unit: " kWh",
    },
    {
      label: "Grid relief",
      value: gridReliefValue,
      max: 20,
      detail: "Points shaved from grid stress baseline",
      unit: " pts",
    },
    {
      label: "Reward avg",
      value: rewardAvg,
      max: 100,
      detail: "Average reward per step across the latest episode",
      unit: "",
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">RL policy studio</h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Ten simulated hours run each time the optimizer runs. Each episode adjusts the weights below, then the system keeps the best reward to update the deployment plan.
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Epoch</span>
            <span>{epoch}/10</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(epoch / 10) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
            />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>{metric.label}</span>
                <span>
                  {metric.value.toFixed(1)}{metric.unit}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (metric.value / metric.max) * 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-sky-400"
                />
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{metric.detail}</div>
            </div>
          ))}
        </div>

        {best && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/20 dark:text-emerald-200">
            <div className="font-semibold">Focus: {best.routeName}</div>
            <p className="mt-1">Delay +{best.delayTime}s · {((best.routeLength ?? 0) / 1000).toFixed(1)} km</p>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white/60 p-3 text-xs text-neutral-600 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
        <div className="flex items-center justify-between font-semibold text-neutral-700 dark:text-neutral-200">
          <span>Live log</span>
          <span className={`text-[10px] uppercase ${isRunning ? "text-emerald-500" : "text-neutral-400"}`}>
            {isRunning ? "training" : hasRun ? "idle" : "standby"}
          </span>
        </div>
        {summary && (
          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
            <div>Served: {summary.served}</div>
            <div>Unmet: {summary.unmet}</div>
            <div>Energy €: {summary.energyCost.toFixed(2)}</div>
          </div>
        )}
        <motion.p key={log} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 whitespace-pre-line space-y-1">
          {hasRun ? (log || "Awaiting optimization…") : (
            <span>
              Click <b>Run Optimization</b> to let the policy re-balance supply, energy windows, and equity guardrails. Updates will appear in this log.
            </span>
          )}
        </motion.p>
      </div>
    </div>
  );
}


