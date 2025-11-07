"use client";

import type { EpisodeMetrics, PolicyParams } from "@/lib/rlSimulation";

type RemoteOptions = {
  fleetSize: number;
  steps: number;
  captureSteps?: boolean;
  retrain?: boolean;
};

const DEFAULT_OPTIONS: RemoteOptions = {
  fleetSize: 120,
  steps: 180,
  captureSteps: false,
  retrain: false,
};

export async function requestEpisode(params: PolicyParams, options: Partial<RemoteOptions> = {}): Promise<EpisodeMetrics> {
  const body = {
    params,
    options: { ...DEFAULT_OPTIONS, ...options },
  };

  const response = await fetch("/api/rl/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RL service error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { metrics: EpisodeMetrics } | EpisodeMetrics;
  return "metrics" in data ? data.metrics : data;
}


