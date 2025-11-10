"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BASE_POLICY_PARAMS,
  perturbParams,
  simulateEpisode,
  type EpisodeMetrics,
  type PolicyParams,
} from "@/lib/rlSimulation";
import { useIngolstadtRoutes } from "@/hooks/useIngolstadtRoutes";
import { useTrafficInsights } from "@/hooks/useTrafficInsights";
import { scenarioIngolstadt } from "@/lib/scenarios";
import type { RouteDetails } from "@/types/routes";
import { requestEpisode } from "@/lib/rlClient";
import { CityGridSimulation } from "@/components/CityGridSimulation";

const DynamicIngolstadtMap = dynamic(
  () => import("@/components/IngolstadtMap").then((mod) => mod.IngolstadtMap),
  { ssr: false }
);

const FLEET_SIZE = 120;
const EPISODE_STEPS = 180;

type VariantOption = {
  id: string;
  label: string;
  tagline: string;
  params: PolicyParams;
};

const VARIANT_OPTIONS: VariantOption[] = [
  {
    id: "baseline",
    label: "Baseline blend",
    tagline: "Balances reliability, grid load, and modest exploration.",
    params: BASE_POLICY_PARAMS,
  },
  {
    id: "explore",
    label: "Explorer mode",
    tagline: "Cranks up exploration to discover fresh demand pockets.",
    params: {
      ...BASE_POLICY_PARAMS,
      exploration: Math.min(0.24, BASE_POLICY_PARAMS.exploration + 0.14),
      demandWeight: BASE_POLICY_PARAMS.demandWeight + 0.05,
    },
  },
  {
    id: "energy",
    label: "Energy saver",
    tagline: "Prioritises cheap charging windows and tighter charge thresholds.",
    params: {
      ...BASE_POLICY_PARAMS,
      energyWeight: BASE_POLICY_PARAMS.energyWeight + 0.18,
      chargeThreshold: BASE_POLICY_PARAMS.chargeThreshold + 0.1,
      exploration: Math.max(0.02, BASE_POLICY_PARAMS.exploration - 0.03),
    },
  },
  {
    id: "demand",
    label: "Demand chaser",
    tagline: "Aggressive repositioning to hold reliability during surges.",
    params: perturbParams({
      ...BASE_POLICY_PARAMS,
      demandWeight: BASE_POLICY_PARAMS.demandWeight + 0.2,
      exploration: BASE_POLICY_PARAMS.exploration + 0.04,
    }),
  },
];

type ScenarioMode = {
  id: string;
  label: string;
  hour: number;
  explainer: string;
  routeRank: number;
};

const SCENARIO_MODES: ScenarioMode[] = [
  {
    id: "morning",
    label: "Morning surge",
    hour: 8,
    explainer: "Audi Forum ↔ Nordbahnhof commuters spike demand around 08:00.",
    routeRank: 0,
  },
  {
    id: "shift",
    label: "Shift change",
    hour: 17,
    explainer: "Industrial belt shift changes raise delay and energy price sensitivity.",
    routeRank: 1,
  },
  {
    id: "overnight",
    label: "Overnight charge",
    hour: 2,
    explainer: "Low demand allows deep charging windows and grid stress relief.",
    routeRank: 2,
  },
];

function formatDelta(value: number, suffix = "") {
  const rounded = value.toFixed(1);
  return `${value >= 0 ? "+" : ""}${rounded}${suffix}`;
}

function reliabilityFromMetrics(metrics: EpisodeMetrics | undefined) {
  if (!metrics) return 0;
  const trips = metrics.served + metrics.unmet;
  if (trips <= 0) return 0;
  return (metrics.served / trips) * 100;
}

function buildTrafficWeights(data: ReturnType<typeof useTrafficInsights>["data"]) {
  if (!data?.topSegments?.length) return undefined;
  const weights: Record<string, number> = {};
  for (const segment of data.topSegments) {
    if (typeof segment.delayIndex === "number") {
      weights[segment.id] = segment.delayIndex;
    }
  }
  return weights;
}

export default function RLLabPage() {
  const { routes, loading: routesLoading } = useIngolstadtRoutes(90000);
  const { data: trafficData, loading: trafficLoading } = useTrafficInsights();
  const trafficWeights = useMemo(() => buildTrafficWeights(trafficData), [trafficData]);

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

  const [variantResults, setVariantResults] = useState<Record<string, EpisodeMetrics> | null>(null);
  const [variantLoading, setVariantLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const loadVariants = async () => {
      setVariantLoading(true);
      try {
        const entries = await Promise.all(
          VARIANT_OPTIONS.map(async (option) => {
            try {
              const metrics = await requestEpisode(option.params, {
                fleetSize: FLEET_SIZE,
                steps: EPISODE_STEPS,
              });
              return [option.id, metrics] as const;
            } catch (error) {
              console.warn("RL service variant fallback", error);
              const fallback = simulateEpisode(option.params, {
                fleetSize: FLEET_SIZE,
                steps: EPISODE_STEPS,
              });
              return [option.id, fallback] as const;
            }
          })
        );
        if (!cancelled) {
          setVariantResults(Object.fromEntries(entries));
        }
      } finally {
        if (!cancelled) {
          setVariantLoading(false);
        }
      }
    };

    void loadVariants();
    return () => {
      cancelled = true;
    };
  }, []);

  const baselineMetrics = variantResults?.["baseline"] ?? null;

  const [selectedVariantId, setSelectedVariantId] = useState<string>(VARIANT_OPTIONS[0].id);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SCENARIO_MODES[0].id);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState<number>(SCENARIO_MODES[0].hour);
  const [customParams, setCustomParams] = useState<PolicyParams>({ ...BASE_POLICY_PARAMS });

  const selectedVariant = VARIANT_OPTIONS.find((option) => option.id === selectedVariantId) ?? VARIANT_OPTIONS[0];
  const selectedMetrics = variantResults?.[selectedVariant.id] ?? null;
  const scenarioMode = SCENARIO_MODES.find((mode) => mode.id === selectedScenarioId) ?? SCENARIO_MODES[0];

  const topRoutes = useMemo(() => {
    if (!routes.length) return [] as RouteDetails[];
    return [...routes].sort((a, b) => (b.delayTime ?? 0) - (a.delayTime ?? 0));
  }, [routes]);

  const calmerRoutes = useMemo(() => {
    if (!routes.length) return [] as RouteDetails[];
    return [...routes].sort((a, b) => (a.delayTime ?? 0) - (b.delayTime ?? 0));
  }, [routes]);

  const handleScenarioSelect = (mode: ScenarioMode) => {
    setSelectedScenarioId(mode.id);
    setSelectedHour(mode.hour);
    const target = topRoutes[mode.routeRank] ?? topRoutes[0] ?? null;
    if (target) {
      setSelectedRouteId(target.routeId);
    }
  };

  const resolvedSelectedRouteId = useMemo(() => {
    if (selectedRouteId && topRoutes.some((route) => route.routeId === selectedRouteId)) {
      return selectedRouteId;
    }
    const fallback = topRoutes[scenarioMode.routeRank] ?? topRoutes[0];
    return fallback?.routeId ?? null;
  }, [selectedRouteId, topRoutes, scenarioMode]);

  const timeline = selectedMetrics?.timeline ?? [];
  const maxTimelineValue = timeline.length
    ? timeline.reduce((max, point) => Math.max(max, point.demand, point.supply), 1)
    : 1;
  const activePoint = timeline.find((point) => point.hour === selectedHour) ?? (timeline.length ? timeline[0] : null);
  const activeIndex = timeline.findIndex((point) => point.hour === (activePoint?.hour ?? -1));

  const variantComparisons = useMemo(() => {
    if (!variantResults) return [] as {
      option: VariantOption;
      metrics: EpisodeMetrics | null;
      reliability: number;
      baselineReliability: number;
    }[];
    return VARIANT_OPTIONS.map((option) => {
      const metrics = variantResults[option.id];
      const reliability = reliabilityFromMetrics(metrics);
      const baselineReliability = reliabilityFromMetrics(baselineMetrics ?? undefined);
      return {
        option,
        metrics,
        reliability,
        baselineReliability,
      };
    });
  }, [baselineMetrics, variantResults]);

  const [customResult, setCustomResult] = useState<EpisodeMetrics | null>(null);
  const [customPending, setCustomPending] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setCustomPending(true);
      try {
        const metrics = await requestEpisode(customParams, {
          fleetSize: FLEET_SIZE,
          steps: EPISODE_STEPS,
          captureSteps: true,
          retrain: true,
        });
        if (!cancelled) setCustomResult(metrics);
      } catch (error) {
        console.warn("RL service slider fallback", error);
        const fallback = simulateEpisode(customParams, {
          fleetSize: FLEET_SIZE,
          steps: EPISODE_STEPS,
          captureSteps: true,
        });
        if (!cancelled) setCustomResult(fallback);
      } finally {
        if (!cancelled) setCustomPending(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [customParams]);

  const customReliability = reliabilityFromMetrics(customResult ?? undefined);
  const baselineReliability = reliabilityFromMetrics(baselineMetrics ?? undefined);

  const scenarioFrame = useMemo(() => scenarioIngolstadt(), []);
  const gridWidth = useMemo(() => Math.max(...scenarioFrame.cells.map((cell) => cell.x)) + 1, [scenarioFrame]);
  const gridHeight = useMemo(() => Math.max(...scenarioFrame.cells.map((cell) => cell.y)) + 1, [scenarioFrame]);
  const maxPopulation = useMemo(() => Math.max(...scenarioFrame.cells.map((cell) => cell.population)), [scenarioFrame]);
  const topCells = useMemo(
    () => [...scenarioFrame.cells].sort((a, b) => b.population - a.population).slice(0, 6),
    [scenarioFrame]
  );

  const [activeHotspotIndex, setActiveHotspotIndex] = useState(0);
  const hotspotIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!topCells.length) return;
    if (hotspotIntervalRef.current) clearInterval(hotspotIntervalRef.current);
    hotspotIntervalRef.current = setInterval(() => {
      setActiveHotspotIndex((prev) => (prev + 1) % topCells.length);
    }, 3600);
    return () => {
      if (hotspotIntervalRef.current) clearInterval(hotspotIntervalRef.current);
    };
  }, [topCells]);

  const activeHotspotId = topCells[activeHotspotIndex]?.id ?? null;

  const coverageByRank = useMemo(() => {
    if (!topCells.length) return [] as number[];
    const highest = topCells[0]?.population ?? 1;
    return topCells.map((cell, index) => {
      const ratio = cell.population / Math.max(highest, 1);
      if (index === 0) return 8;
      if (ratio >= 0.75) return 6;
      if (ratio >= 0.55) return 5;
      if (ratio >= 0.35) return 4;
      if (ratio >= 0.2) return 3;
      return 2;
    });
  }, [topCells]);
  const coverageForRank = useCallback((rank: number) => coverageByRank[rank] ?? 2, [coverageByRank]);

  const highTrafficRoutes = topRoutes.slice(0, 3);
  const recoveryRoutes = calmerRoutes.slice(0, 3);

  const processStages = [
    {
      title: "Ingest",
      icon: "🛰️",
      text: "Pull TomTom corridor delays, stop-level demand priors, and grid availability.",
    },
    {
      title: "Simulate",
      icon: "🧠",
      text: "Run 180 reinforcement-learning ticks across three policy variants and the baseline to compare reward and reliability.",
    },
    {
      title: "Deploy",
      icon: "🚐",
      text: "Write the updated hotspot plan, highlighting charging windows and spare capacity for the pitch deck.",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl border border-neutral-200 bg-white/85 p-8 shadow-lg shadow-neutral-900/5 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/75"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">RL Lab</h1>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300">
              This lab opens the policy black box. Every optimisation run spins the Ingolstadt twin for 180 simulated minutes, perturbs four weights, and keeps whichever mix beats the baseline without breaching grid guardrails. Pick a policy profile, scrub the demand timeline, then tune the weights yourself to see how the reinforcement learner responds.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {SCENARIO_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleScenarioSelect(mode)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  mode.id === selectedScenarioId
                    ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/30 dark:bg-white dark:text-neutral-900"
                    : "bg-white/70 text-neutral-500 hover:text-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300 dark:hover:text-neutral-50"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">{scenarioMode.explainer}</p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mt-8 grid gap-4 rounded-3xl border border-neutral-200 bg-white/85 p-6 shadow-sm shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 sm:grid-cols-3"
      >
        {processStages.map((stage) => (
          <div key={stage.title} className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
            <span className="text-2xl" aria-hidden>{stage.icon}</span>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{stage.title}</h3>
            <p>{stage.text}</p>
          </div>
        ))}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.07 }}
        className="mt-6 rounded-3xl border border-neutral-200 bg-white/80 p-6 text-sm text-neutral-600 shadow-sm shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 dark:text-neutral-300"
      >
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">What powers this reinforcement learner?</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Gymnasium environment</h3>
            <p className="mt-1">A Python `IngolstadtEnv` recreates corridor demand, tariffs, and depot capacity. FastAPI exposes it to the Next.js frontend.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Stable Baselines3 PPO</h3>
            <p className="mt-1">A PPO agent trains on startup and fine-tunes whenever you request `retrain`, so weight tweaks come back with stronger reactions.</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Instant feedback</h3>
            <p className="mt-1">The Next.js API proxies the Python service; if it is offline the TypeScript simulator kicks in as a fallback so the UI never stalls.</p>
          </div>
        </div>
      </motion.section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white/80 shadow-xl shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
        >
          <div className="absolute left-5 top-5 z-10 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500 shadow dark:bg-neutral-900/80 dark:text-neutral-300">
            Policy playground
          </div>
          <div className="absolute left-5 bottom-5 z-10 flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-300">
            <span className="rounded-full bg-neutral-900/80 px-3 py-1 font-semibold text-white shadow dark:bg-white/90 dark:text-neutral-900">
              {selectedVariant.label}
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 font-medium dark:bg-neutral-900/70">{selectedVariant.tagline}</span>
            {activePoint && (
              <span className="rounded-full bg-emerald-500/80 px-3 py-1 font-semibold text-white">
                {activePoint.hour.toString().padStart(2, "0")}:00 · demand {activePoint.demand.toFixed(1)} · supply {activePoint.supply.toFixed(1)}
              </span>
            )}
          </div>
          <div className="pointer-events-none absolute bottom-5 right-5 z-10 flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white/80 p-3 text-[11px] uppercase tracking-widest text-neutral-500 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300">
            <span className="font-semibold">Legend</span>
            <div className="flex items-center gap-2"><span className="h-2 w-4 rounded-full bg-rose-400/90" /> Demand heat</div>
            <div className="flex items-center gap-2"><span className="h-2 w-4 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600" /> Congestion line</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Depots</div>
            <div className="flex items-center gap-2"><span className="h-1 w-5 rounded-full bg-white" /> Selected route</div>
          </div>
          <div className="aspect-[16/9]">
            <DynamicIngolstadtMap
              routes={routes}
              loading={routesLoading || trafficLoading}
              showLegend={false}
              trafficWeights={trafficWeights}
              trafficSegments={trafficSegmentsForMap}
              selectedRouteId={resolvedSelectedRouteId}
              onRouteSelect={(route) => setSelectedRouteId(route?.routeId ?? null)}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Policy profiles</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Compare each reinforcement learning setting against the baseline blend. These averages come straight from the simulated 180-minute episodes.
          </p>
          <div className="mt-4 space-y-3">
            {variantLoading && (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-400">
                Fetching RL episodes from the backend…
              </div>
            )}
            {!variantLoading &&
              variantComparisons.map(({ option, metrics, reliability, baselineReliability }) => (
              <button
                key={option.id}
                onClick={() => setSelectedVariantId(option.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  option.id === selectedVariantId
                    ? "border-emerald-300 bg-emerald-50/80 shadow-md dark:border-emerald-500/50 dark:bg-emerald-900/30"
                    : "border-neutral-200 bg-white/75 hover:-translate-y-0.5 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/70"
                }`}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">{option.label}</span>
                  <span>
                    Reward {metrics ? metrics.rewardAvg.toFixed(2) : "--"}
                    {metrics && ` (${formatDelta(metrics.rewardAvg - (baselineMetrics?.rewardAvg ?? 0))})`}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-neutral-700 dark:text-neutral-200">
                  <div>
                    Reliability {reliability.toFixed(1)}%
                    {Number.isFinite(baselineReliability) && (
                      <span className={`ml-2 text-xs ${reliability - baselineReliability >= 0 ? "text-emerald-500" : "text-rose-400"}`}>
                        {formatDelta(reliability - baselineReliability, "%")}
                      </span>
                    )}
                  </div>
                  <div>
                    Energy spend €{metrics ? metrics.energyCost.toFixed(2) : "--"}
                    {metrics && (
                      <span className={`ml-2 text-xs ${metrics.energyCost - (baselineMetrics?.energyCost ?? 0) <= 0 ? "text-emerald-500" : "text-rose-400"}`}>
                        {formatDelta((baselineMetrics?.energyCost ?? 0) - metrics.energyCost)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Demand {option.params.demandWeight.toFixed(2)}</span>
                  <span>Energy {option.params.energyWeight.toFixed(2)}</span>
                  <span>Charge {option.params.chargeThreshold.toFixed(2)}</span>
                  <span>Explore {option.params.exploration.toFixed(2)}</span>
                </div>
              </button>
              ))}
          </div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="mt-10 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Demand vs supply timeline</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Scrub across the 24-hour loop to see how the chosen policy handles peaks. The vertical bar marks the currently selected scenario hour.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-300">
            <span className="flex items-center gap-2"><span className="h-2 w-4 rounded-full bg-rose-400" /> Demand</span>
            <span className="flex items-center gap-2"><span className="h-2 w-4 rounded-full bg-emerald-400" /> Supply</span>
            <span className="flex items-center gap-2"><span className="h-[18px] w-px bg-sky-400" /> Scenario focus</span>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <svg viewBox="0 0 720 220" className="h-52 w-[720px] text-neutral-400">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              className="text-rose-400"
              strokeLinecap="round"
              points={timeline
                .map((point, index) => {
                  const x = (index / Math.max(timeline.length - 1, 1)) * 720;
                  const y = 200 - (point.demand / maxTimelineValue) * 170;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              className="text-emerald-400"
              strokeLinecap="round"
              points={timeline
                .map((point, index) => {
                  const x = (index / Math.max(timeline.length - 1, 1)) * 720;
                  const y = 200 - (point.supply / maxTimelineValue) * 170;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            {activeIndex >= 0 && (
              <line
                x1={(activeIndex / Math.max(timeline.length - 1, 1)) * 720}
                x2={(activeIndex / Math.max(timeline.length - 1, 1)) * 720}
                y1={20}
                y2={200}
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth={2}
              />
            )}
          </svg>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="range"
            min={0}
            max={23}
            value={selectedHour}
            onChange={(event) => setSelectedHour(Number(event.target.value))}
            className="w-full accent-neutral-900 dark:accent-white"
          />
          {activePoint && (
            <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-300">
              <span className="rounded-full border border-neutral-200 bg-white/70 px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900/70">
                Hour {activePoint.hour.toString().padStart(2, "0")}
              </span>
              <span className="rounded-full border border-rose-200 bg-rose-50/70 px-3 py-1 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                Demand {activePoint.demand.toFixed(1)}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                Supply {activePoint.supply.toFixed(1)}
              </span>
              <span className="rounded-full border border-neutral-200 bg-white/70 px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900/70">
                Gap {formatDelta(activePoint.supply - activePoint.demand)}
              </span>
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.14 }}
        className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
      >
        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Tune the policy</h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Adjust individual levers to see how reward, reliability, and energy spend react. The chart re-simulates on every tweak.</p>
            </div>
            <button
              onClick={() => setCustomParams({ ...BASE_POLICY_PARAMS })}
              className="self-start rounded-full border border-neutral-200 px-4 py-1.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900/60"
            >
              Reset to baseline
            </button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {([
              {
                key: "demandWeight" as const,
                label: "Demand weight",
                min: 0.4,
                max: 2.2,
                step: 0.02,
                hint: "Higher values chase hotspots faster but risk empty batteries elsewhere.",
              },
              {
                key: "energyWeight" as const,
                label: "Energy penalty",
                min: 0.05,
                max: 1.2,
                step: 0.02,
                hint: "Penalise charging when tariffs peak to protect the grid.",
              },
              {
                key: "chargeThreshold" as const,
                label: "Charge threshold",
                min: 0.1,
                max: 0.9,
                step: 0.01,
                hint: "Battery ratio that triggers a charging decision.",
              },
              {
                key: "exploration" as const,
                label: "Exploration",
                min: 0,
                max: 0.6,
                step: 0.02,
                hint: "Probability of trying a different neighbour to learn new patterns.",
              },
            ]).map((slider) => (
              <div key={slider.key} className="rounded-2xl border border-neutral-200 bg-white/70 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  <span>{slider.label}</span>
                  <span>{customParams[slider.key].toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={customParams[slider.key]}
                  onChange={(event) =>
                    setCustomParams((prev) => ({
                      ...prev,
                      [slider.key]: Number(event.target.value),
                    }))
                  }
                  className="mt-3 w-full accent-neutral-900 dark:accent-white"
                />
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{slider.hint}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 rounded-2xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-700 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-200 md:grid-cols-4">
            {customResult ? (
              <>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Reward avg</div>
                  <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{customResult.rewardAvg.toFixed(2)}</div>
                  <div className={`text-xs ${customResult.rewardAvg - (baselineMetrics?.rewardAvg ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatDelta(customResult.rewardAvg - (baselineMetrics?.rewardAvg ?? 0))} vs baseline
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Reliability</div>
                  <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{customReliability.toFixed(1)}%</div>
                  <div className={`text-xs ${customReliability - baselineReliability >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatDelta(customReliability - baselineReliability, "%")} vs baseline
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Served rides</div>
                  <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{customResult.served}</div>
                  <div className={`text-xs ${customResult.served - (baselineMetrics?.served ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatDelta(customResult.served - (baselineMetrics?.served ?? 0))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Energy spend</div>
                  <div className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">€{customResult.energyCost.toFixed(2)}</div>
                  <div className={`text-xs ${customResult.energyCost - (baselineMetrics?.energyCost ?? 0) <= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {formatDelta((baselineMetrics?.energyCost ?? 0) - customResult.energyCost)}
                  </div>
                </div>
              </>
            ) : (
              <div className="md:col-span-4 text-neutral-500 dark:text-neutral-400">
                Adjust the sliders to fetch a fresh episode from the RL backend.
              </div>
            )}
          </div>
          {customPending && (
            <div className="mt-2 text-xs uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Updating episode…</div>
          )}

          {customResult && customResult.steps && customResult.steps.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Latest ticks</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {customResult.steps.slice(-4).reverse().map((step) => (
                  <div key={step.index} className="rounded-2xl border border-neutral-200 bg-white/75 p-4 text-xs text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                      <span>Tick {step.index + 1}</span>
                      <span>{step.hour.toString().padStart(2, "0")}:00</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <span>Served {step.served}</span>
                      <span>Unmet {step.unmet}</span>
                      <span>Energy €{step.energyCost.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 grid grid-cols-3 gap-2 text-neutral-500 dark:text-neutral-400">
                      <span>Move {step.actionMix.move}</span>
                      <span>Charge {step.actionMix.charge}</span>
                      <span>Idle {step.actionMix.idle}</span>
                    </div>
                    {step.notes.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-neutral-500 dark:text-neutral-400">
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

        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Traffic callouts</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Route taps highlight the map above.</p>

          <div className="mt-4">
            <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">High pressure corridors</div>
            <div className="mt-2 flex flex-col gap-2">
              {highTrafficRoutes.map((route) => (
                <button
                  key={route.routeId}
                  onClick={() => setSelectedRouteId(route.routeId)}
                  className={`rounded-xl border px-4 py-2 text-left text-sm transition ${
                    resolvedSelectedRouteId === route.routeId
                      ? "border-rose-400 bg-rose-50/70 text-rose-600 dark:border-rose-500/40 dark:bg-rose-900/30 dark:text-rose-200"
                      : "border-neutral-200 bg-white/70 text-neutral-600 hover:-translate-y-0.5 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{route.routeName}</span>
                    <span className="text-xs uppercase tracking-widest">Delay {(route.delayTime ?? 0).toFixed(0)}s</span>
                  </div>
                  {route.area && <p className="text-xs text-neutral-500 dark:text-neutral-400">{route.area}</p>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Recovery corridors</div>
            <div className="mt-2 flex flex-col gap-2">
              {recoveryRoutes.map((route) => (
                <button
                  key={route.routeId}
                  onClick={() => setSelectedRouteId(route.routeId)}
                  className={`rounded-xl border px-4 py-2 text-left text-sm transition ${
                    resolvedSelectedRouteId === route.routeId
                      ? "border-emerald-400 bg-emerald-50/70 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-200"
                      : "border-neutral-200 bg-white/70 text-neutral-600 hover:-translate-y-0.5 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{route.routeName}</span>
                    <span className="text-xs uppercase tracking-widest">Delay {(route.delayTime ?? 0).toFixed(0)}s</span>
                  </div>
                  {route.area && <p className="text-xs text-neutral-500 dark:text-neutral-400">{route.area}</p>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16 }}
        className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Live hotspot overlay</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">The map below shows where the policy stages AVs. Glowing cells are the top demand zones.</p>
          <div className="mt-4 aspect-[16/9]">
            <DynamicIngolstadtMap
              routes={routes}
              loading={routesLoading || trafficLoading}
              showLegend={false}
              trafficWeights={trafficWeights}
              trafficSegments={trafficSegmentsForMap}
              selectedRouteId={resolvedSelectedRouteId}
              onRouteSelect={(route) => setSelectedRouteId(route?.routeId ?? null)}
            />
          </div>
          <div className="mt-3 rounded-2xl border border-neutral-200 bg-white/70 p-3 text-xs text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-4 rounded-full bg-gradient-to-r from-blue-100 via-blue-400 to-blue-700" />
                <span>Demand heat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-red-600" />
                <span>Congestion</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" />
                <span>Depots</span>
              </div>
            </div>
          </div>
          <h3 className="mt-6 text-base font-semibold text-neutral-900 dark:text-neutral-100">Simplified grid view</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Animated vehicles show policy actions in real time. Hover hotspot cards to highlight zones.</p>
          <CityGridSimulation
            cells={scenarioFrame.cells}
            gridWidth={gridWidth}
            gridHeight={gridHeight}
            maxPopulation={maxPopulation}
            activeHotspotId={activeHotspotId}
            topCells={topCells}
            onCellHover={(cellId) => {
              const idx = topCells.findIndex((c) => c.id === cellId);
              if (idx !== -1) setActiveHotspotIndex(idx);
            }}
            coverageForRank={coverageForRank}
          />
        </div>

        <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-md shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Top hotspots</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Hover to highlight zones on the grid.</p>
          </div>
          {topCells.slice(0, 3).map((cell, index) => {
            const isActive = cell.id === activeHotspotId;
            return (
              <motion.div
                key={cell.id}
                onMouseEnter={() => setActiveHotspotIndex(index)}
                className="rounded-2xl border p-4 shadow-sm transition hover:-translate-y-1"
                animate={{
                  backgroundColor: isActive ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.7)",
                  borderColor: isActive ? "rgba(16,185,129,0.5)" : "rgba(226,232,240,0.7)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  <span>Cell {cell.id}</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-600">Rank {index + 1}</span>
                </div>
                <div className="mt-2 flex items-baseline gap-3 text-sm text-neutral-700 dark:text-neutral-200">
                  <span><strong>{cell.population.toFixed(0)}</strong> pop</span>
                  <span><strong>{coverageForRank(index)}</strong> AVs</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

    </main>
  );
}
