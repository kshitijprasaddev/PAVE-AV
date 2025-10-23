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
import { AVEnv, type Action } from "@/lib/rl";
import { scenarioIngolstadt } from "@/lib/scenarios";

const DynamicIngolstadtMap = dynamic(
  () => import("@/components/IngolstadtMap").then((mod) => mod.IngolstadtMap),
  { ssr: false }
);

type PolicyParams = {
  demandWeight: number;
  energyWeight: number;
  chargeThreshold: number;
  exploration: number;
};

type TimelinePoint = { hour: number; demand: number; supply: number };

type RLMetrics = {
  served: number;
  unmet: number;
  energyCost: number;
  rewardTotal: number;
  rewardAvg: number;
  timeline: TimelinePoint[];
  params: PolicyParams;
};

const BASE_PARAMS: PolicyParams = {
  demandWeight: 1.1,
  energyWeight: 0.25,
  chargeThreshold: 0.35,
  exploration: 0.08,
};

const EPOCH_COUNT = 10;
const STEPS_PER_EPOCH = 180;
const AVG_ENERGY_PRICE = 0.25; // €/kWh proxy

function cloneTimeline(timeline: TimelinePoint[]): TimelinePoint[] {
  return timeline.map((slot) => ({ ...slot }));
}

function chooseActions(env: AVEnv, params: PolicyParams): Action[] {
  const state = env.getState();
  const actions: Action[] = [];
  const hour = Math.floor((state.tick % 1440) / 60);
  const offPeak = hour < 6 || hour >= 22;

  for (const v of state.vehicles) {
    const batteryRatio = v.batteryKwh / v.maxBatteryKwh;
    const shouldCharge = batteryRatio < params.chargeThreshold || (offPeak && batteryRatio < 0.92);
    if (shouldCharge) {
      actions.push({ vehicleId: v.id, type: "charge", chargeKw: offPeak ? 11 : 7 });
      continue;
    }

    const neighbors = env.getNeighbors(v.cellId);
    const options = [v.cellId, ...neighbors];
    const scored = options.map((cellId) => {
      const demand = state.demandByCell[cellId] ?? 0;
      const vehiclesHere = state.vehicles.filter((x) => x.cellId === cellId).length + 1;
      const loadRatio = demand / vehiclesHere;
      const energyPenalty = state.energyPriceEurPerKwh;
      const score = params.demandWeight * loadRatio - params.energyWeight * energyPenalty;
      return { cellId, score };
    });

    scored.sort((a, b) => b.score - a.score);
    let target = scored[0]?.cellId ?? v.cellId;

    if (params.exploration > 0 && Math.random() < params.exploration && neighbors.length > 0) {
      target = neighbors[Math.floor(Math.random() * neighbors.length)];
    }

    if (target !== v.cellId) {
      actions.push({ vehicleId: v.id, type: "move", targetCellId: target });
    } else {
      actions.push({ vehicleId: v.id, type: "idle" });
    }
  }

  return actions;
}

function simulateEpisode(params: PolicyParams, fleetSize: number, steps: number): RLMetrics {
  const scenario = scenarioIngolstadt();
  const env = new AVEnv({ scenario, fleetSize });
  const timelineBuckets = Array.from({ length: 24 }).map(() => ({ demand: 0, supply: 0, count: 0 }));

  let served = 0;
  let unmet = 0;
  let energyCost = 0;
  let rewardTotal = 0;

  for (let i = 0; i < steps; i++) {
    const actions = chooseActions(env, params);
    const result = env.step(actions);
    served += result.info.servedRides;
    unmet += result.info.unmetDemand;
    energyCost += result.info.energyCost;
    rewardTotal += result.reward;

    const hour = result.nextState.tick % 24;
    timelineBuckets[hour].demand += result.info.unmetDemand + result.info.servedRides;
    timelineBuckets[hour].supply += result.info.servedRides;
    timelineBuckets[hour].count += 1;
  }

  const timeline = timelineBuckets.map((bucket, hour) => {
    const divisor = bucket.count || 1;
    return {
      hour,
      demand: Number((bucket.demand / divisor).toFixed(1)),
      supply: Number((bucket.supply / divisor).toFixed(1)),
    };
  });

  return {
    served: Math.round(served),
    unmet: Math.round(unmet),
    energyCost: Number(energyCost.toFixed(2)),
    rewardTotal: Number(rewardTotal.toFixed(2)),
    rewardAvg: Number((rewardTotal / steps).toFixed(2)),
    timeline,
    params,
  };
}

function perturbParams(base: PolicyParams): PolicyParams {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  return {
    demandWeight: clamp(base.demandWeight + (Math.random() - 0.5) * 0.4, 0.6, 1.6),
    energyWeight: clamp(base.energyWeight + (Math.random() - 0.5) * 0.2, 0.1, 0.5),
    chargeThreshold: clamp(base.chargeThreshold + (Math.random() - 0.5) * 0.1, 0.2, 0.6),
    exploration: clamp(base.exploration + (Math.random() - 0.5) * 0.08, 0, 0.25),
  };
}

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
  const [rlMetrics, setRlMetrics] = useState<RLMetrics | null>(null);
  const showMap = revealed ?? true;

  const bestParamsRef = useRef<PolicyParams>(BASE_PARAMS);
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
    bestParamsRef.current = BASE_PARAMS;
    bestRewardRef.current = -Infinity;
    setRlMetrics(null);

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

    const runEpoch = (index: number) => {
      if (cancelRef.current) return;
      const candidate = index === 0 ? BASE_PARAMS : perturbParams(bestParamsRef.current);
      const result = simulateEpisode(candidate, fleetSize, STEPS_PER_EPOCH);
      setRlMetrics(result);

      const totalTrips = result.served + result.unmet;
      const reliability = totalTrips > 0 ? (result.served / totalTrips) * 100 : 0;
      setEpoch(index + 1);
      setReward(result.rewardAvg);
      setLog(
        `Epoch ${index + 1}: avg reward ${result.rewardAvg.toFixed(2)}, reliability ${reliability.toFixed(1)}%, served ${result.served} rides`
      );

      if (result.rewardTotal > bestRewardRef.current) {
        bestRewardRef.current = result.rewardTotal;
        bestParamsRef.current = candidate;
      }

      if (index + 1 < EPOCH_COUNT && !cancelRef.current) {
        epochTimerRef.current = setTimeout(() => runEpoch(index + 1), 350);
      } else {
        setIsRunning(false);
        setLastRun(new Date().toISOString());
      }
    };

    runEpoch(0);
  }, [refresh, refreshTraffic, plan]);

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
    };
  }, []);

  const dynamicPlan = useMemo(() => {
    if (!plan) return null;
    if (!rlMetrics) return plan;

    const totalTrips = rlMetrics.served + rlMetrics.unmet;
    const reliability = totalTrips > 0 ? Number(((rlMetrics.served / totalTrips) * 100).toFixed(1)) : plan.serviceReliability;
    const baselineReliability = plan.serviceReliability;
    const reliabilityBoost = reliability - baselineReliability;

    const energyPerRideKwh = rlMetrics.served
      ? Number(((rlMetrics.energyCost / Math.max(rlMetrics.served, 1)) / AVG_ENERGY_PRICE).toFixed(2))
      : plan.energyPerRideKwh;

    const gridStress = Number((Math.max(10, plan.gridStressIndex - Math.max(0, reliabilityBoost))).toFixed(1));
    const rewardScore = Number((reliability - 0.6 * gridStress - 0.2 * (100 - reliability)).toFixed(1));

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
      ? (rlMetrics.energyCost / Math.max(rlMetrics.served, 1)) / AVG_ENERGY_PRICE
      : plan.energyPerRideKwh;
    const gridRelief = plan.gridStressIndex - (dynamicPlan?.gridStressIndex ?? plan.gridStressIndex);
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

  return (
    <div className="flex flex-col gap-12">
      <section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">City twin</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              The dashboard streams TomTom corridor intelligence, adds fleet and energy heuristics, and serves up an Ingolstadt-ready AV plan.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <button
              onClick={onRun}
              disabled={loading || isRunning}
              className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:opacity-60"
            >
              {isRunning ? "Optimizing…" : "Run Optimization"}
            </button>
            <span>Updated {fetchedAt ? new Date(fetchedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}</span>
            {lastRun && <span>Last run {new Date(lastRun).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
            {error && <span className="text-rose-500">· API fallback: {error}</span>}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,340px)]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 30 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-neutral-200 shadow-xl dark:border-neutral-800"
          >
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
              />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: revealed ? 1 : 0, x: revealed ? 0 : 30 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
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
            />
          </motion.div>
        </div>

        {revealed && !hasRun && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 grid gap-4 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 sm:grid-cols-3"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Step 1</div>
              <p className="mt-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Run the optimizer</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Click “Run Optimization” to pull fresh delay data, train the policy, and write a new deployment recommendation.</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Step 2</div>
              <p className="mt-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Explore the twin</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Use the heatmap to pick out AV pooling zones, charging depots, and slow corridors.</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Step 3</div>
              <p className="mt-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">Brief stakeholders</p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Lean on the metric cards to explain delay cuts, minutes saved, and weekly CO₂ avoided.</p>
            </div>
          </motion.div>
        )}

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


