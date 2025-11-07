import { NextRequest, NextResponse } from "next/server";
import { simulateEpisode, type EpisodeMetrics, type PolicyParams } from "@/lib/rlSimulation";

type RemoteOptions = {
  fleetSize: number;
  steps: number;
  captureSteps?: boolean;
  retrain?: boolean;
};

type RequestPayload = {
  params: PolicyParams;
  options?: Partial<RemoteOptions>;
};

const DEFAULT_OPTIONS: RemoteOptions = {
  fleetSize: 120,
  steps: 180,
  captureSteps: false,
  retrain: false,
};

async function callPythonService(params: PolicyParams, options: RemoteOptions): Promise<EpisodeMetrics | null> {
  const baseUrl = process.env.RL_BACKEND_URL;
  if (!baseUrl) return null;

  const payload = {
    params: {
      demand_weight: params.demandWeight,
      energy_weight: params.energyWeight,
      charge_threshold: params.chargeThreshold,
      exploration: params.exploration,
    },
    steps: options.steps,
    fleet_size: options.fleetSize,
    capture_steps: options.captureSteps ?? false,
    retrain: options.retrain ?? false,
  };

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Python RL service responded with ${response.status}`);
  }

  const data = await response.json();
  if (!data) return null;
  const metrics: EpisodeMetrics | undefined = data.metrics ?? data;
  return metrics ?? null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestPayload;
    const params = body.params;
    const options: RemoteOptions = { ...DEFAULT_OPTIONS, ...(body.options ?? {}) };

    if (!params) {
      return NextResponse.json({ error: "Missing policy params" }, { status: 400 });
    }

    try {
      const metrics = await callPythonService(params, options);
      if (metrics) {
        return NextResponse.json({ metrics });
      }
    } catch (error) {
      console.error("Python RL service error", error);
    }

    const fallbackMetrics = simulateEpisode(params, {
      fleetSize: options.fleetSize,
      steps: options.steps,
      captureSteps: options.captureSteps,
    });
    return NextResponse.json({ metrics: fallbackMetrics, fallback: true });
  } catch (error) {
    console.error("RL simulate route error", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}


