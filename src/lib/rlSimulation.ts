import { AVEnv, type Action, type Scenario } from "@/lib/rl";
import { scenarioIngolstadt } from "@/lib/scenarios";

export type PolicyParams = {
  demandWeight: number;
  energyWeight: number;
  chargeThreshold: number;
  exploration: number;
};

export type TimelinePoint = { hour: number; demand: number; supply: number };

export type StepInsight = {
  index: number;
  hour: number;
  minuteOfDay: number;
  served: number;
  unmet: number;
  energyCost: number;
  reward: number;
  actionMix: {
    move: number;
    charge: number;
    idle: number;
  };
  notes: string[];
};

export type EpisodeMetrics = {
  served: number;
  unmet: number;
  energyCost: number;
  rewardTotal: number;
  rewardAvg: number;
  timeline: TimelinePoint[];
  params: PolicyParams;
  steps?: StepInsight[];
};

export type SimulationOptions = {
  scenario?: Scenario;
  scenarioFactory?: () => Scenario;
  fleetSize: number;
  steps: number;
  captureSteps?: boolean;
  random?: () => number;
};

export const BASE_POLICY_PARAMS: PolicyParams = {
  demandWeight: 1.1,
  energyWeight: 0.25,
  chargeThreshold: 0.35,
  exploration: 0.08,
};

export const AVERAGE_ENERGY_PRICE = 0.25; // € / kWh proxy

export function chooseActions(env: AVEnv, params: PolicyParams, random: () => number = Math.random): Action[] {
  const state = env.getState();
  const actions: Action[] = [];
  const hour = Math.floor((state.tick % 1440) / 60);
  const offPeak = hour < 6 || hour >= 22;

  for (const v of state.vehicles) {
    const batteryRatio = v.batteryKwh / v.maxBatteryKwh;
    const shouldCharge = batteryRatio < params.chargeThreshold || (offPeak && batteryRatio < Math.min(0.98, params.chargeThreshold + 0.35));
    if (shouldCharge) {
      actions.push({ vehicleId: v.id, type: "charge", chargeKw: offPeak ? 11 : 7 + params.energyWeight * 6 });
      continue;
    }

    const neighbors = env.getNeighbors(v.cellId);
    const options = [v.cellId, ...neighbors];
    const scored = options.map((cellId) => {
      const demand = state.demandByCell[cellId] ?? 0;
      const vehiclesHere = state.vehicles.filter((x) => x.cellId === cellId).length + 1;
      const loadRatio = demand / vehiclesHere;
      const energyPenalty = state.energyPriceEurPerKwh * (0.8 + params.energyWeight * 1.6);
      const score = (1 + params.demandWeight) * loadRatio - energyPenalty;
      return { cellId, score };
    });

    scored.sort((a, b) => b.score - a.score);
    let target = scored[0]?.cellId ?? v.cellId;

    if (params.exploration > 0 && random() < Math.min(0.9, params.exploration + 0.05) && neighbors.length > 0) {
      target = neighbors[Math.floor(random() * neighbors.length)];
    }

    if (target !== v.cellId) {
      actions.push({ vehicleId: v.id, type: "move", targetCellId: target });
    } else {
      actions.push({ vehicleId: v.id, type: "idle" });
    }
  }

  return actions;
}

export function perturbParams(base: PolicyParams, random: () => number = Math.random): PolicyParams {
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const delta = () => random() - 0.5;
  return {
    demandWeight: clamp(base.demandWeight + delta() * 0.6, 0.4, 2.0),
    energyWeight: clamp(base.energyWeight + delta() * 0.4, 0.05, 1.0),
    chargeThreshold: clamp(base.chargeThreshold + delta() * 0.2, 0.1, 0.9),
    exploration: clamp(base.exploration + delta() * 0.16, 0, 0.5),
  };
}

export function simulateEpisode(params: PolicyParams, options: SimulationOptions): EpisodeMetrics {
  const {
    fleetSize,
    steps,
    captureSteps = false,
    random = Math.random,
  } = options;
  const scenario = options.scenario ?? options.scenarioFactory?.() ?? scenarioIngolstadt();
  const env = new AVEnv({ scenario, fleetSize });
  const timelineBuckets = Array.from({ length: 24 }).map(() => ({ demand: 0, supply: 0, count: 0 }));

  let served = 0;
  let unmet = 0;
  let energyCost = 0;
  let rewardTotal = 0;

  const stepsLog: StepInsight[] = [];

  for (let i = 0; i < steps; i++) {
    const actions = chooseActions(env, params, random);
    const result = env.step(actions);
    served += result.info.servedRides;
    unmet += result.info.unmetDemand;
    energyCost += result.info.energyCost;
    rewardTotal += result.reward;

    const hourSlot = result.nextState.tick % 24;
    timelineBuckets[hourSlot].demand += result.info.unmetDemand + result.info.servedRides;
    timelineBuckets[hourSlot].supply += result.info.servedRides;
    timelineBuckets[hourSlot].count += 1;

    if (captureSteps) {
      const moves = actions.filter((action) => action.type === "move").length;
      const charges = actions.filter((action) => action.type === "charge").length;
      const idles = actions.filter((action) => action.type === "idle").length;
      const notes: string[] = [];
      if (result.info.unmetDemand > 0) notes.push("Unserved requests remaining");
      if (charges > 0 && result.nextState.energyPriceEurPerKwh > 0.3) notes.push("Charging under higher tariff");
      if (moves > charges && result.reward > 0) notes.push("Repositioning dominated this tick");
      stepsLog.push({
        index: i,
        hour: Math.floor((result.nextState.tick % 1440) / 60),
        minuteOfDay: result.nextState.tick % 1440,
        served: result.info.servedRides,
        unmet: result.info.unmetDemand,
        energyCost: Number(result.info.energyCost.toFixed(3)),
        reward: Number(result.reward.toFixed(3)),
        actionMix: { move: moves, charge: charges, idle: idles },
        notes,
      });
    }
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
    steps: captureSteps ? stepsLog : undefined,
  };
}

export function cloneTimeline(timeline: TimelinePoint[]): TimelinePoint[] {
  return timeline.map((slot) => ({ ...slot }));
}


