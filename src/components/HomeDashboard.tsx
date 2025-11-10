"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIngolstadtRoutes } from "@/hooks/useIngolstadtRoutes";
import { useTrafficInsights } from "@/hooks/useTrafficInsights";
import { OperationalPanel } from "@/components/OperationalPanel";
import { MetricsModal } from "@/components/MetricsModal";
import { RLSidePanel } from "@/components/RLSidePanel";
import { TrafficInsights } from "@/components/TrafficInsights";
import { ExperienceStrip } from "@/components/ExperienceStrip";
import { NeuralNetworkViz } from "@/components/NeuralNetworkViz";
import {
  simulateEpisode,
  perturbParams,
  BASE_POLICY_PARAMS,
  cloneTimeline,
  type EpisodeMetrics,
  type PolicyParams,
  type StepInsight,
  AVERAGE_ENERGY_PRICE,
} from "@/lib/rlSimulation";
import { requestEpisode } from "@/lib/rlClient";
import type { RouteDetails } from "@/types/routes";
import { Reveal } from "@/components/Reveal";

const DynamicIngolstadtMap = dynamic(
  () => import("@/components/IngolstadtMap").then((mod) => mod.IngolstadtMap),
  { ssr: false }
);

const EPOCH_COUNT = 10;
const STEPS_PER_EPOCH = 180;

const EUROPE_ROADMAP = [
  {
    stage: "Testbed",
    headline: "Ingolstadt twin is up and streaming.",
    detail: "Four corridors, 120 AVs, and charging load already feed this layout—the exact setup the jury will see first.",
    stamp: "Now",
  },
  {
    stage: "Showcase",
    headline: "Public demos let anyone rerun the twin",
    detail: "Stakeholders can flip policies, re-run the optimizer, and watch the numbers update on the main screen in real time.",
    stamp: "20 Nov 2025",
  },
  {
    stage: "Expansion",
    headline: "Next cities plug in without redesign.",
    detail: "Drop in corridor and depot data from Antwerp, Lyon, or Hamburg and the same workflow highlights their fleet plan overnight.",
    stamp: "Q1 2026",
  },
];
export function HomeDashboard({ revealed }: { revealed?: boolean }) {
  const { routes, plan, fetchedAt, loading, error, refresh } = useIngolstadtRoutes(90000);
  const { data: trafficData, loading: trafficLoading, error: trafficError, refresh: refreshTraffic } = useTrafficInsights();
  const [isRunning, setIsRunning] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [reward, setReward] = useState(0);
  const [log, setLog] = useState("");
  const [lastRun, setLastRun] = useState<string | undefined>(undefined);
  const [showMetrics, setShowMetrics] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [rlMetrics, setRlMetrics] = useState<EpisodeMetrics | null>(null);
  const [epochHistory, setEpochHistory] = useState<EpisodeMetrics[]>([]);
  const [stepInsights, setStepInsights] = useState<StepInsight[] | null>(null);
  const [bestParams, setBestParams] = useState<PolicyParams>({ ...BASE_POLICY_PARAMS });
  const showMap = revealed ?? true;
  const optimizerPanelRef = useRef<HTMLDivElement | null>(null);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showOptimizerStatus, setShowOptimizerStatus] = useState(false);

  const scrollToOptimizer = useCallback(() => {
    if (optimizerPanelRef.current) {
      optimizerPanelRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const topRoutes = useMemo(() => {
    if (!routes.length) return [] as RouteDetails[];
    return [...routes].sort((a, b) => (b.delayTime ?? 0) - (a.delayTime ?? 0));
  }, [routes]);

  const bestParamsRef = useRef<PolicyParams>(BASE_POLICY_PARAMS);
  const bestRewardRef = useRef<number>(-Infinity);
  const cancelRef = useRef(false);
  const epochTimerRef = useRef<NodeJS.Timeout | null>(null);

  const trafficWeights = useMemo(() => {
    if (!trafficData?.topSegments?.length) return undefined;
    const weights: Record<string, number> = {};
    for (const segment of trafficData.topSegments) {
      if (typeof segment.delayIndex === "number") {
        weights[segment.id] = segment.delayIndex;
      }
    }
    return weights;
  }, [trafficData]);

  const trafficSegmentsForMap = useMemo(() => {
    if (!trafficData?.topSegments?.length) return [] as {
      id: string;
      coordinates: [number, number][];
      delayIndex: number | null;
      streetName: string;
    }[];
    return trafficData.topSegments
      .map((segment) => {
        const geometry = segment.geometry;
        if (!geometry || geometry.type !== "LineString" || !Array.isArray(geometry.coordinates)) return null;
        const coordinates = geometry.coordinates
          .map((coord) => {
            if (!Array.isArray(coord) || coord.length < 2) return null;
            const [lon, lat] = coord;
            return [lon, lat] as [number, number];
          })
          .filter((point): point is [number, number] => Boolean(point));
        if (!coordinates.length) return null;
        return {
          id: segment.id,
          coordinates,
          delayIndex: segment.delayIndex ?? null,
          streetName: segment.streetName ?? "Segment",
        };
      })
      .filter((feature): feature is {
        id: string;
        coordinates: [number, number][];
        delayIndex: number | null;
        streetName: string;
      } => Boolean(feature));
  }, [trafficData]);

  const onRun = useCallback(async () => {
    setEpoch(0);
    setReward(0);
    setLog("Fetching latest corridor telemetry…");
    await refresh();
    await refreshTraffic();
    setIsRunning(true);
    setShowMetrics(true);
    setHasRun(true);
    cancelRef.current = false;
    bestParamsRef.current = BASE_POLICY_PARAMS;
    bestRewardRef.current = -Infinity;
    setRlMetrics(null);
    setEpochHistory([]);
    setStepInsights(null);
    setBestParams({ ...BASE_POLICY_PARAMS });
    setShowOptimizerStatus(true);
    if (overlayTimerRef.current) {
      clearTimeout(overlayTimerRef.current);
      overlayTimerRef.current = null;
    }
    requestAnimationFrame(() => {
      scrollToOptimizer();
    });

    if (epochTimerRef.current) {
      clearTimeout(epochTimerRef.current);
      epochTimerRef.current = null;
    }

    if (!plan) {
      setIsRunning(false);
      setLog("Plan data still loading. Try again in a moment.");
      return;
    }

    const fleetSize = plan.recommendedFleetSize ?? 120;

    const runEpoch = async (index: number): Promise<void> => {
      if (cancelRef.current) return;
      const candidate = index === 0 ? BASE_POLICY_PARAMS : perturbParams(bestParamsRef.current);
      let result: EpisodeMetrics;
      try {
        result = await requestEpisode(candidate, {
          fleetSize,
          steps: STEPS_PER_EPOCH,
          captureSteps: index === 0 || index === EPOCH_COUNT - 1,
          retrain: index > 0,
        });
      } catch (error) {
        console.warn("RL service unavailable, using fallback", error);
        result = simulateEpisode(candidate, {
          fleetSize,
          steps: STEPS_PER_EPOCH,
          captureSteps: index === 0 || index === EPOCH_COUNT - 1,
        });
      }
      setRlMetrics(result);
      setEpochHistory((prev) => {
        const next = [...prev, result];
        return next.slice(-EPOCH_COUNT);
      });
      if (result.steps && result.steps.length > 0) {
        setStepInsights([...result.steps]);
      }

      const totalTrips = result.served + result.unmet;
      const reliability = totalTrips > 0 ? (result.served / totalTrips) * 100 : 0;
      setEpoch(index + 1);
      setReward(result.rewardAvg);
      setLog(
        [
          `Epoch ${index + 1} / ${EPOCH_COUNT}`,
          `reward_avg: ${result.rewardAvg.toFixed(2)}`,
          `served: ${result.served} · unmet: ${result.unmet}`,
          `energy_cost: €${result.energyCost.toFixed(2)}`,
          `reliability: ${reliability.toFixed(1)}%`,
        ].join("\n")
      );

      if (result.rewardTotal > bestRewardRef.current) {
        bestRewardRef.current = result.rewardTotal;
        bestParamsRef.current = candidate;
        setBestParams({ ...candidate });
      }

      if (index + 1 < EPOCH_COUNT && !cancelRef.current) {
        await new Promise<void>((resolve) => {
          epochTimerRef.current = setTimeout(() => resolve(), 300);
        });
        await runEpoch(index + 1);
      } else {
        setIsRunning(false);
        setLastRun(new Date().toISOString());
        const bestSummary = `Best reward_total: ${bestRewardRef.current.toFixed(2)} with demand_weight ${bestParamsRef.current.demandWeight.toFixed(2)}`;
        setLog((prev) => `${prev}\n${bestSummary}`);
        overlayTimerRef.current = setTimeout(() => {
          setShowOptimizerStatus(false);
          overlayTimerRef.current = null;
        }, 3200);
      }
    };

    void runEpoch(0);
  }, [refresh, refreshTraffic, plan, scrollToOptimizer]);

  useEffect(() => {
    const handler = () => onRun();
    window.addEventListener("run-optimization", handler);
    return () => window.removeEventListener("run-optimization", handler);
  }, [onRun]);

  useEffect(() => {
    let frameId: number | null = null;
    try {
      const flag = window.localStorage.getItem("amo:run");
      if (flag === "1") {
        window.localStorage.removeItem("amo:run");
        frameId = requestAnimationFrame(() => {
          void onRun();
        });
      }
    } catch (err) {
      console.warn("unable to read run flag", err);
    }
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [onRun]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
      if (epochTimerRef.current) clearTimeout(epochTimerRef.current);
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, []);

  const dynamicPlan = useMemo(() => {
    if (!plan) return null;
    if (!rlMetrics) return plan;

    const totalTrips = rlMetrics.served + rlMetrics.unmet;
    const reliability = totalTrips > 0 ? Number(((rlMetrics.served / totalTrips) * 100).toFixed(1)) : plan.serviceReliability;
    const baselineReliability = plan.serviceReliability ?? 75;
    const reliabilityBoost = reliability - baselineReliability;

    const baselineEnergyKwh = plan.energyPerRideKwh ?? 0.6;
    const energyPerRideKwh = rlMetrics.served
      ? Number(((rlMetrics.energyCost / Math.max(rlMetrics.served, 1)) / AVERAGE_ENERGY_PRICE).toFixed(2))
      : plan.energyPerRideKwh;

    const baselineGridStress = plan.gridStressIndex && plan.gridStressIndex > 0 ? plan.gridStressIndex : 38;
    const energyDelta = baselineEnergyKwh - (energyPerRideKwh ?? baselineEnergyKwh);
    const gridStressRaw = baselineGridStress - energyDelta * 24 - reliabilityBoost * 0.45;
    const gridStress = Number(Math.max(6, gridStressRaw).toFixed(1));
    const rewardScore = Number((reliability - 0.5 * gridStress - 0.25 * (100 - reliability)).toFixed(1));

    const redistributed = plan.hotspots.map((hotspot, index) => {
      const scale = 1 + (reliabilityBoost / 100) * (0.6 + index * 0.08);
      const recommendedAvs = Math.max(6, Math.round(hotspot.recommendedAvs * scale));
      const timeSaved = (hotspot.timeSavedMin ?? 0) + Math.max(0, Math.round(reliabilityBoost * 0.5));
      const co2SavedKgPerWeek = (hotspot.co2SavedKgPerWeek ?? 0) + Math.max(0, Math.round(rewardScore / 3));
      return {
        ...hotspot,
        recommendedAvs,
        timeSavedMin: timeSaved,
        co2SavedKgPerWeek,
      };
    });

    return {
      ...plan,
      serviceReliability: reliability,
      gridStressIndex: gridStress,
      energyPerRideKwh,
      rewardScore,
      hotspots: redistributed,
      demandTimeline: cloneTimeline(rlMetrics.timeline),
    };
  }, [plan, rlMetrics]);

  const rlSummary = useMemo(() => {
    if (!plan || !rlMetrics) return null;
    const totalTrips = rlMetrics.served + rlMetrics.unmet;
    const reliability = totalTrips > 0 ? (rlMetrics.served / totalTrips) * 100 : 0;
    const energyPerRide = rlMetrics.served
      ? (rlMetrics.energyCost / Math.max(rlMetrics.served, 1)) / AVERAGE_ENERGY_PRICE
      : plan.energyPerRideKwh;
    const baselineGridStress = plan.gridStressIndex && plan.gridStressIndex > 0 ? plan.gridStressIndex : 38;
    const currentStress = dynamicPlan?.gridStressIndex ?? baselineGridStress;
    const gridRelief = baselineGridStress - currentStress;
    return {
      reliability,
      energyPerRide,
      gridRelief,
      rewardAvg: rlMetrics.rewardAvg,
      served: rlMetrics.served,
      unmet: rlMetrics.unmet,
      energyCost: rlMetrics.energyCost,
      params: rlMetrics.params,
    };
  }, [plan, rlMetrics, dynamicPlan]);

  const headlineStats = useMemo(() => {
    const targetPlan = dynamicPlan ?? plan ?? null;
    if (!targetPlan) {
      return [] as {
        label: string;
        value: string;
        detail: string;
        delta?: string | null;
        mood?: "positive" | "negative" | "neutral";
      }[];
    }
    const cards: {
      label: string;
      value: string;
      detail: string;
      delta?: string | null;
      mood?: "positive" | "negative" | "neutral";
    }[] = [];
    const reliability = targetPlan.serviceReliability ?? 0;
    const gridStress = targetPlan.gridStressIndex ?? 0;
    const energy = targetPlan.energyPerRideKwh ?? 0;
    const rewardScore = targetPlan.rewardScore ?? 0;
    const baselineReliability = plan?.serviceReliability ?? reliability;
    const baselineEnergy = plan?.energyPerRideKwh ?? energy;
    const baselineStress = plan?.gridStressIndex ?? 38;
    const baselineReward = plan?.rewardScore ?? rewardScore;
    cards.push({
      label: "Reliability",
      value: `${reliability.toFixed(1)}%`,
      detail: "Share of rides served across the twin",
      delta: `${(reliability - baselineReliability).toFixed(1)}% vs baseline`,
      mood: reliability - baselineReliability >= 0 ? "positive" : "negative",
    });
    cards.push({
      label: "Energy per ride",
      value: `${energy.toFixed(2)} kWh`,
      detail: "Average energy draw per completed trip",
      delta: `${(baselineEnergy - energy).toFixed(2)} kWh saved`,
      mood: baselineEnergy - energy >= 0 ? "positive" : "negative",
    });
    cards.push({
      label: "Grid stress",
      value: `${gridStress.toFixed(1)} pts`,
      detail: "Composite feeder & depot loading index",
      delta: `${(baselineStress - gridStress).toFixed(1)} pts relieved`,
      mood: baselineStress - gridStress >= 0 ? "positive" : "negative",
    });
    cards.push({
      label: "Reward score",
      value: rewardScore.toFixed(1),
      detail: "Weighted reliability – energy – equity mix",
      delta: `${(rewardScore - baselineReward).toFixed(1)} uplift`,
      mood: "neutral",
    });
    return cards;
  }, [dynamicPlan, plan]);

  const blueprintStats = useMemo(() => {
    const sourcePlan = dynamicPlan ?? plan ?? null;
    if (!sourcePlan) return [] as { label: string; value: string; detail: string }[];
    const fleet = sourcePlan.recommendedFleetSize ?? plan?.recommendedFleetSize ?? 120;
    const corridors = Array.isArray(sourcePlan.hotspots) ? sourcePlan.hotspots.length : plan?.hotspots?.length ?? 0;
    const reliability = sourcePlan.serviceReliability ?? plan?.serviceReliability ?? 0;
    const energy = sourcePlan.energyPerRideKwh ?? plan?.energyPerRideKwh ?? 0.6;

    return [
      {
        label: "Fleet scale",
        value: `${fleet} AVs ready`,
        detail: "Right-sized for Ingolstadt and easy to adjust for the next city.",
      },
      {
        label: "Corridors mapped",
        value: `${corridors} priority lanes`,
        detail: "Each corridor connects to the optimizer with the same data hooks.",
      },
      {
        label: "Reliability",
        value: `${reliability.toFixed(1)}% served`,
        detail: "Trips the fleet handles after the optimizer settles in.",
      },
      {
        label: "Energy discipline",
        value: `${energy.toFixed(2)} kWh/ride`,
        detail: "Average energy draw per ride keeps the grid story believable.",
      },
    ];
  }, [dynamicPlan, plan]);

  const currentReliability = useMemo(() => {
    if (rlSummary) return rlSummary.reliability;
    if (dynamicPlan?.serviceReliability) return dynamicPlan.serviceReliability;
    if (plan?.serviceReliability) return plan.serviceReliability;
    return null;
  }, [rlSummary, dynamicPlan, plan]);

  const currentEnergyPerRide = useMemo(() => {
    if (rlSummary) return rlSummary.energyPerRide;
    if (dynamicPlan?.energyPerRideKwh) return dynamicPlan.energyPerRideKwh;
    if (plan?.energyPerRideKwh) return plan.energyPerRideKwh;
    return null;
  }, [rlSummary, dynamicPlan, plan]);

  const currentGridChange = useMemo(() => {
    if (typeof rlSummary?.gridRelief === "number") return rlSummary.gridRelief;
    return null;
  }, [rlSummary]);

  return (
    <div className="flex flex-col gap-12">
      {showOptimizerStatus && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pointer-events-auto fixed bottom-6 left-1/2 z-50 w-[min(340px,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-white/15 bg-neutral-950/85 p-5 text-white shadow-2xl shadow-emerald-500/20 backdrop-blur-lg sm:bottom-auto sm:left-auto sm:right-8 sm:top-28 sm:translate-x-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
            <span>{isRunning ? "Optimizer running" : "Optimizer summary"}</span>
            <span>
              Epoch {Math.min(epoch, EPOCH_COUNT)}/{EPOCH_COUNT}
            </span>
          </div>
          <div className="mt-3 space-y-2 text-sm text-white/85">
            {typeof currentReliability === "number" && (
              <div className="flex items-center justify-between">
                <span>Reliability</span>
                <span>{currentReliability.toFixed(1)}%</span>
              </div>
            )}
            {typeof currentEnergyPerRide === "number" && (
              <div className="flex items-center justify-between">
                <span>Energy / ride</span>
                <span>{currentEnergyPerRide.toFixed(2)} kWh</span>
              </div>
            )}
            {typeof currentGridChange === "number" && (
              <div className="flex items-center justify-between">
                <span>Grid change</span>
                <span className={currentGridChange >= 0 ? "text-emerald-200" : "text-rose-200"}>
                  {currentGridChange >= 0 ? "↓ " : "↑ "}
                  {Math.abs(currentGridChange).toFixed(1)} pts
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Reward avg</span>
              <span>{reward.toFixed(1)}</span>
            </div>
          </div>
          <button
            onClick={scrollToOptimizer}
            className="mt-4 w-full rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            Jump to live panel
          </button>
        </motion.div>
      )}

      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative mb-6 overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white/90 via-white/70 to-white/50 p-6 shadow-xl shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:from-neutral-950/90 dark:via-neutral-950/70 dark:to-neutral-950/50"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,90,70,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(70,100,255,0.18),_transparent_55%)]" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <Reveal className="text-xs uppercase tracking-[0.42em] text-neutral-500 dark:text-neutral-400">System overview</Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">Ingolstadt autonomy control room</h2>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
                  Everything is grouped for quick understanding: live map on the left, optimizer activity on the right, and headline metrics in the middle so anyone can follow the impact in seconds.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.22} className="flex flex-col items-start gap-3 text-xs text-neutral-500 dark:text-neutral-400 sm:flex-row sm:items-center">
              <button
                onClick={onRun}
                disabled={loading || isRunning}
                className="rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:opacity-60"
              >
                {isRunning ? "Optimizing…" : "Run the optimizer"}
              </button>
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <span>Updated {fetchedAt ? new Date(fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
                {lastRun && <span>Last run {new Date(lastRun).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
                {error && <span className="text-rose-500">API fallback: {error}</span>}
              </div>
            </Reveal>
          </div>
        </motion.div>

        <Reveal delay={0.32}>
          <ExperienceStrip className="mb-6" />
        </Reveal>

        <div className="flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 shadow-2xl shadow-neutral-900/30 dark:border-neutral-800"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_65%)]" />
            {(!showMap || loading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 text-neutral-500 animate-pulse dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-400">
                Preparing city twin…
              </div>
            )}
            {showMap && !loading && (
              <DynamicIngolstadtMap
                routes={routes}
                loading={loading}
                showLegend
                trafficWeights={trafficWeights}
                trafficSegments={trafficSegmentsForMap}
              />
            )}
          </motion.div>

          <motion.div
            ref={optimizerPanelRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
            transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]"
          >
            <div className="flex flex-col gap-5 rounded-3xl border border-neutral-200 bg-white/85 p-6 shadow-sm shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">City baseline</h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Reliability, energy, grid stress, and reward move here as soon as the optimizer runs.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {headlineStats.map((card, index) => (
                    <Reveal key={card.label} delay={0.08 * index}>
                      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-white via-white/90 to-white/70 p-4 shadow-sm dark:border-neutral-800 dark:from-neutral-900 dark:via-neutral-900/70 dark:to-neutral-900/60">
                        <div className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{card.label}</div>
                        <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{card.value}</div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">{card.detail}</div>
                        {card.delta && (
                          <div
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${
                              card.mood === "positive"
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200"
                                : card.mood === "negative"
                                  ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/10 dark:text-rose-200"
                                  : "bg-neutral-200/60 text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300"
                            }`}
                          >
                            {card.delta}
                          </div>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">Corridors in focus</h4>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">These are the three corridors with the highest delay right now.</p>
                <div className="mt-3 space-y-3">
                  {topRoutes.slice(0, 3).map((route, index) => (
                    <Reveal key={route.routeId} delay={0.08 * index}>
                      <div className="rounded-xl border border-neutral-200 bg-white/75 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/70">
                        <div className="flex items-center justify-between text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                          <span>{route.routeName}</span>
                          <span className="text-xs uppercase tracking-widest text-rose-500 dark:text-rose-300">Delay {(route.delayTime ?? 0).toFixed(0)}s</span>
                        </div>
                        {route.area && <p className="text-xs text-neutral-500 dark:text-neutral-400">{route.area}</p>}
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                          <span>Typical {Math.round((route.typicalTravelTime ?? 0) / 60)} min</span>
                          <span>Length {((route.routeLength ?? 0) / 1000).toFixed(1)} km</span>
                          <span>Speed gap {(((route.routeLength ?? 0) / Math.max(route.travelTime ?? 1, 1)) * 3.6).toFixed(1)} km/h</span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                  {topRoutes.length === 0 && (
                    <Reveal>
                      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400">
                        Corridor stats will load once the TomTom feed responds.
                      </div>
                    </Reveal>
                  )}
                </div>
              </div>
            </div>

            <RLSidePanel
              epoch={epoch}
              reward={reward}
              log={log}
              routes={routes}
              isRunning={isRunning}
              hasRun={hasRun}
              plan={dynamicPlan ?? plan ?? null}
              basePlan={plan}
              summary={rlSummary}
              timeline={dynamicPlan?.demandTimeline ?? rlMetrics?.timeline ?? null}
              params={bestParams}
              baselineParams={BASE_POLICY_PARAMS}
              steps={stepInsights}
              history={epochHistory}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
            transition={{ duration: 0.7, delay: 0.08, ease: "easeOut" }}
          >
            <NeuralNetworkViz />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
          className="mt-6"
        >
          <TrafficInsights
            data={trafficData}
            loading={trafficLoading}
            error={trafficError}
            refresh={refreshTraffic}
          />
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white/85 p-6 shadow-xl shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
      >
        <div className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-20%] top-10 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-neutral-500 dark:text-neutral-400">European rollout vision</p>
              <h3 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                From Ingolstadt sandbox to continental service
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">Swap the data feed for another city and the same layout updates—no slides to rebuild.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
              {blueprintStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-neutral-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/70"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">{item.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{item.value}</div>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {EUROPE_ROADMAP.map((milestone, idx) => (
              <motion.div
                key={milestone.stage}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-2xl border border-white/30 bg-gradient-to-br from-neutral-900/90 via-neutral-900/70 to-neutral-800/60 p-5 text-white shadow-lg shadow-neutral-900/40"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                  <span>{milestone.stage}</span>
                  <span>{milestone.stamp}</span>
                </div>
                <h4 className="mt-3 text-lg font-semibold text-white/95">{milestone.headline}</h4>
                <p className="mt-2 text-sm text-white/80">{milestone.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 40 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        <OperationalPanel
          plan={dynamicPlan ?? plan}
          basePlan={plan}
          routes={routes}
          timelineOverride={rlMetrics?.timeline ?? null}
        />
      </motion.section>

      <MetricsModal open={showMetrics} onClose={() => setShowMetrics(false)} plan={dynamicPlan ?? plan} routes={routes} />
    </div>
  );
}


