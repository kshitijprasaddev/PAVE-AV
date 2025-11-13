import type { RouteDetails } from "@/types/routes";

export type HotspotAllocation = {
  corridor: string;
  severity: "High" | "Medium" | "Support";
  recommendedAvs: number;
  coverageWindow: string;
  notes: string;
  efficiencyBoostPct?: number; // % delay reduction target
  timeSavedMin?: number; // per day estimate
  co2SavedKgPerWeek?: number; // proxy
};

export type ChargingInstruction = {
  window: string;
  action: string;
  rationale: string;
};

export type OrchestrationPlan = {
  recommendedFleetSize: number;
  serviceReliability: number; // 0 - 100
  energyPerRideKwh: number;
  gridStressIndex: number; // 0 - 100
  rewardScore: number;
  hotspots: HotspotAllocation[];
  chargingPlan: ChargingInstruction[];
  demandTimeline: { hour: number; demand: number; supply: number }[];
};

const BASE_FLEET = 120;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function classifySeverity(score: number): HotspotAllocation["severity"] {
  if (score > 0.6) return "High";
  if (score > 0.35) return "Medium";
  return "Support";
}

export function buildOrchestrationPlan(routes: RouteDetails[]): OrchestrationPlan {
  if (!routes.length) {
    return {
      recommendedFleetSize: BASE_FLEET,
      serviceReliability: 0,
      energyPerRideKwh: 0,
      gridStressIndex: 0,
      rewardScore: 0,
      hotspots: [],
      chargingPlan: [],
      demandTimeline: Array.from({ length: 24 }).map((_, hour) => ({
        hour,
        demand: 0,
        supply: 0,
      })),
    };
  }

  const severityScores = routes.map((route) => {
    const delayRatio = route.typicalTravelTime > 0 ? route.delayTime / route.typicalTravelTime : 0;
    const averageSegmentDelay = route.segments.length
      ? route.segments.reduce((acc, seg) => acc + seg.delaySeconds, 0) / route.segments.length
      : 0;
    const avgSpeedPenalty = route.segments.length
      ? route.segments.reduce((acc, seg) => {
          const typical = seg.typicalSpeed || seg.averageSpeed || 1;
          if (typical === 0) return acc;
          const penalty = Math.max(0, 1 - (seg.averageSpeed || typical) / typical);
          return acc + penalty;
        }, 0) / route.segments.length
      : 0;
    const completenessPenalty = 1 - (route.completeness ?? 100) / 100;
    const score = clamp(
      0.45 * delayRatio + 0.25 * (averageSegmentDelay / 60) + 0.2 * avgSpeedPenalty + 0.1 * completenessPenalty,
      0,
      1
    );
    return score;
  });

  const totalSeverity = severityScores.reduce((acc, cur) => acc + cur, 0) || routes.length;

  const weightedShares = routes.map((route, idx) => {
    const severityScore = severityScores[idx];
    const severity = classifySeverity(severityScore);
    const routeLengthKm = Math.max((route.routeLength ?? 1500) / 1000, 0.4);
    const minShare = severity === "High" ? 0.18 : severity === "Medium" ? 0.12 : 0.08;
    return {
      route,
      severityScore,
      severity,
      weight: routeLengthKm * (0.6 + severityScore) + minShare,
    };
  });

  const weightSum = weightedShares.reduce((acc, item) => acc + item.weight, 0) || 1;

  const provisional = weightedShares.map((item) => {
    const baseRaw = (item.weight / weightSum) * BASE_FLEET;
    const minVehicles = item.severity === "High" ? 14 : item.severity === "Medium" ? 9 : 5;
    const maxVehicles = item.severity === "High" ? Math.round(BASE_FLEET * 0.28) : item.severity === "Medium" ? Math.round(BASE_FLEET * 0.2) : Math.round(BASE_FLEET * 0.14);
    const clipped = clamp(Math.round(baseRaw), minVehicles, Math.max(minVehicles, maxVehicles));
    return {
      ...item,
      raw: baseRaw,
      recommendedAvs: clipped,
      remainder: baseRaw - Math.floor(baseRaw),
    };
  });

  const currentTotal = provisional.reduce((acc, item) => acc + item.recommendedAvs, 0);
  let diff = BASE_FLEET - currentTotal;

  const adjustOrder = [...provisional].sort((a, b) => b.severityScore - a.severityScore || b.raw - a.raw);
  let idxAdjust = 0;
  while (diff !== 0 && adjustOrder.length > 0) {
    const target = adjustOrder[idxAdjust % adjustOrder.length];
    if (diff > 0) {
      target.recommendedAvs += 1;
      diff -= 1;
    } else if (diff < 0) {
      const minVehicles = target.severity === "High" ? 14 : target.severity === "Medium" ? 9 : 5;
      if (target.recommendedAvs > minVehicles) {
        target.recommendedAvs -= 1;
        diff += 1;
      }
    }

    idxAdjust += 1;
    if (idxAdjust > adjustOrder.length * 6) break;
  }

  const hotspots: HotspotAllocation[] = provisional.map((item) => {
    const { route, severity, severityScore, recommendedAvs } = item;
    const peakMessage = severity === "High" ? "07:00 to 09:30 & 16:30 to 19:00" : severity === "Medium" ? "07:00 to 09:00" : "Off peak flex";
    const efficiencyBoost = clamp(0.15 + severityScore * 0.2, 0.15, 0.35);
    const timeSavedMin = Math.round((route.delayTime ?? 0) * efficiencyBoost / 60);
    const co2SavedKgPerWeek = Number(((route.routeLength / 1000) * 0.12 * recommendedAvs * 5).toFixed(1));
    const sharePct = Math.round((recommendedAvs / BASE_FLEET) * 100);
    const notes = `Cut delay ~${Math.round(efficiencyBoost * 100)}% (~${timeSavedMin} min/day). CO₂ ↓ ${co2SavedKgPerWeek} kg/week. Fleet staging: ${recommendedAvs} AVs (~${sharePct}% of the active pool).`;
    return {
      corridor: route.routeName,
      severity,
      recommendedAvs,
      coverageWindow: peakMessage,
      notes,
      efficiencyBoostPct: Math.round(efficiencyBoost * 100),
      timeSavedMin,
      co2SavedKgPerWeek,
    };
  });

  const averageReliability = severityScores.length
    ? severityScores.reduce((acc, score) => acc + (1 - score), 0) / severityScores.length
    : 0;
  const serviceReliability = clamp(65 + averageReliability * 30, 65, 98);

  const avgEnergyPenalty = severityScores.reduce((acc, score) => acc + score, 0) / severityScores.length;
  const energyPerRideKwh = Number((9 - 2.5 * avgEnergyPenalty).toFixed(2));

  const gridStressIndex = clamp(35 + avgEnergyPenalty * 40, 20, 95);

  const rewardScore = Number((serviceReliability - 0.6 * gridStressIndex - avgEnergyPenalty * 20).toFixed(1));

  const demandTimeline = Array.from({ length: 24 }).map((_, hour) => {
    const baseDemand = hour >= 6 && hour <= 9 ? 1.4 : hour >= 16 && hour <= 19 ? 1.5 : hour >= 11 && hour <= 13 ? 1.2 : 0.8;
    const severityBoost = 1 + totalSeverity / routes.length;
    const demand = Number((45 * baseDemand * severityBoost).toFixed(1));
    const supply = Number((BASE_FLEET * (serviceReliability / 100) * (baseDemand / 1.6)).toFixed(1));
    return { hour, demand, supply };
  });

  const chargingPlan: ChargingInstruction[] = [
    {
      window: "22:00 to 05:00",
      action: "Stage 45% of fleet at Nordbahnhof and Audi Forum depots for overnight charging (11 kW mix).",
      rationale: "Nighttime tariffs in Bavaria average 0.17 €/kWh; grid load is low.",
    },
    {
      window: "11:30 to 13:30",
      action: "Rotate 15% of vehicles through Klinikum micro-depot using 60 kW DC top-up (max 20 min dwell).",
      rationale: "Midday solar generation peaks on Ingolstadt rooftops; demand valley enables opportunity charging.",
    },
    {
      window: "01:00 to 04:00",
      action: "Offer 2 MW vehicle-to-grid buffer using idle fleet at GVZ Ingolstadt logistics hub.",
      rationale: "Supports municipal grid load balancing; vehicles remain above 70% state-of-charge by 05:30.",
    },
  ];

  return {
    recommendedFleetSize: BASE_FLEET,
    serviceReliability: Number(serviceReliability.toFixed(1)),
    energyPerRideKwh,
    gridStressIndex: Number(gridStressIndex.toFixed(1)),
    rewardScore,
    hotspots,
    chargingPlan,
    demandTimeline,
  };
}


