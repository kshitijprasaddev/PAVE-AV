"use client";

import { motion } from "framer-motion";
import type { EpisodeMetrics, PolicyParams, StepInsight, TimelinePoint } from "@/lib/rlSimulation";
import { BASE_POLICY_PARAMS } from "@/lib/rlSimulation";
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
  timeline,
  params,
  baselineParams,
  steps,
  history,
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
  timeline?: TimelinePoint[] | null;
  params?: PolicyParams | null;
  baselineParams?: PolicyParams | null;
  steps?: StepInsight[] | null;
  history?: EpisodeMetrics[] | null;
  gridRelief?: number | null;
}) {
  const best = [...routes].sort((a, b) => (b.delayTime ?? 0) - (a.delayTime ?? 0))[0];
  const second = [...routes].sort((a, b) => (b.delayTime ?? 0) - (a.delayTime ?? 0))[1];
  const reliability = summary ? Number(summary.reliability.toFixed(1)) : plan ? Number(plan.serviceReliability.toFixed(1)) : 0;
  const energyPerRide = summary ? Number(summary.energyPerRide.toFixed(2)) : plan?.energyPerRideKwh ?? 0;
  const gridReliefRaw = summary ? summary.gridRelief : plan && basePlan ? basePlan.gridStressIndex - plan.gridStressIndex : 0;
  const gridReliefValue = gridRelief != null ? gridRelief : Number(Math.max(0, gridReliefRaw).toFixed(1));
  const rewardAvg = summary ? summary.rewardAvg : reward;

  const baseline = baselineParams ?? BASE_POLICY_PARAMS;
  const tuned = params ?? baseline;

  const paramDiagnostics = [
    {
      label: "Demand weight",
      value: tuned.demandWeight,
      baseline: baseline.demandWeight,
      hint: "Influences how strongly the policy chases new ride requests.",
    },
    {
      label: "Energy weight",
      value: tuned.energyWeight,
      baseline: baseline.energyWeight,
      hint: "Penalises charging in high tariff windows.",
    },
    {
      label: "Charge threshold",
      value: tuned.chargeThreshold,
      baseline: baseline.chargeThreshold,
      hint: "Minimum battery ratio before we prioritise charging.",
    },
    {
      label: "Exploration",
      value: tuned.exploration,
      baseline: baseline.exploration,
      hint: "Probability of trying a neighbouring cell rather than the top score.",
    },
  ];

  const timelinePreview = (timeline ?? []).filter((_, index) => index % 3 === 0).slice(0, 6);
  const recentSteps = steps ? steps.slice(-4).reverse() : [];
  const historyPreview = history ? history.slice(-3).reverse() : [];

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
          Ten simulated hours run each time you hit optimize. Each episode adjusts the weights below, then we keep the best reward to update the deployment plan.
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

        <div className="mt-6 space-y-3">
          {best && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/20 dark:text-emerald-200">
              <div className="font-semibold">Focus corridor: {best.routeName}</div>
              {best.area && <p className="mt-1">Area: {best.area}</p>}
              <p>Delay: +{best.delayTime}s · Typical time: {Math.round((best.typicalTravelTime ?? 0) / 60)} min · Length: {((best.routeLength ?? 0) / 1000).toFixed(1)} km</p>
            </div>
          )}
          {second && (
            <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3 text-xs text-sky-900 dark:border-sky-500/40 dark:bg-sky-900/20 dark:text-sky-200">
              <div className="font-semibold">Next corridor: {second.routeName}</div>
              {second.area && <p className="mt-1">Area: {second.area}</p>}
              <p>Delay: +{second.delayTime}s · Typical time: {Math.round((second.typicalTravelTime ?? 0) / 60)} min</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white/60 p-3 text-xs text-neutral-600 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
          <div className="flex items-center justify-between font-semibold text-neutral-700 dark:text-neutral-200">
            <span>Policy levers</span>
            <span className="text-[10px] uppercase text-neutral-400">baseline vs tuned</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {paramDiagnostics.map((row) => {
              const delta = row.value - row.baseline;
              const deltaBadge = delta === 0 ? "neutral" : delta > 0 ? "positive" : "negative";
              return (
                <div key={row.label} className="rounded-md border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-900/60">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{row.label}</div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{row.value.toFixed(2)}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Baseline {row.baseline.toFixed(2)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium text-[10px] uppercase ${
                        deltaBadge === "neutral"
                          ? "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                          : deltaBadge === "positive"
                            ? "bg-emerald-200/80 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200"
                            : "bg-amber-200/80 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                      }`}
                    >
                      {delta >= 0 ? "+" : ""}{delta.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">{row.hint}</p>
                </div>
              );
            })}
          </div>
        </div>

        {timelinePreview.length > 0 && (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white/60 p-3 text-xs text-neutral-600 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
            <div className="flex items-center justify-between font-semibold text-neutral-700 dark:text-neutral-200">
              <span>Demand vs supply</span>
              <span className="text-[10px] uppercase text-neutral-400">hourly sample</span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {timelinePreview.map((point) => {
                const gap = Number((point.supply - point.demand).toFixed(1));
                return (
                  <div key={point.hour} className="rounded-md border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-900/60">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{point.hour.toString().padStart(2, "0")}:00</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{point.demand.toFixed(1)}</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">demand</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-200">{point.supply.toFixed(1)}</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">supply</span>
                    </div>
                    <div className={`mt-2 text-[11px] font-semibold ${gap >= 0 ? "text-emerald-600 dark:text-emerald-200" : "text-amber-600 dark:text-amber-200"}`}>
                      Gap {gap >= 0 ? "+" : ""}{gap.toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {historyPreview.length > 0 && (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white/60 p-3 text-xs text-neutral-600 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
            <div className="flex items-center justify-between font-semibold text-neutral-700 dark:text-neutral-200">
              <span>Episode ledger</span>
              <span className="text-[10px] uppercase text-neutral-400">latest {historyPreview.length}</span>
            </div>
            <div className="mt-2 space-y-2">
              {historyPreview.map((entry, idx) => {
                const totalTrips = entry.served + entry.unmet;
                const reliabilityEntry = totalTrips > 0 ? (entry.served / totalTrips) * 100 : 0;
                const epochNumber = (history?.length ?? 0) - idx;
                return (
                  <div key={idx} className="rounded-md border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-900/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      <span>Epoch {epochNumber}</span>
                      <span>Reward {entry.rewardAvg.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span>Served {entry.served}</span>
                      <span>Unmet {entry.unmet}</span>
                      <span>Reliability {reliabilityEntry.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentSteps.length > 0 && (
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white/60 p-3 text-xs text-neutral-600 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300">
            <div className="flex items-center justify-between font-semibold text-neutral-700 dark:text-neutral-200">
              <span>Last episode ticks</span>
              <span className="text-[10px] uppercase text-neutral-400">latest {recentSteps.length}</span>
            </div>
            <div className="mt-2 space-y-2">
              {recentSteps.map((step) => (
                <div key={step.index} className="rounded-md border border-neutral-200/70 bg-white/70 p-3 dark:border-neutral-700 dark:bg-neutral-900/60">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    <span>Tick {step.index + 1}</span>
                    <span>{step.hour.toString().padStart(2, "0")}:00</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Served {step.served}</span>
                    <span>Unmet {step.unmet}</span>
                    <span>Reward {step.reward.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 grid grid-cols-3 gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span>Move {step.actionMix.move}</span>
                    <span>Charge {step.actionMix.charge}</span>
                    <span>Idle {step.actionMix.idle}</span>
                  </div>
                  {step.notes.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                      {step.notes.map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
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


