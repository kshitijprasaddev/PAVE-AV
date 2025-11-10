"use client";

import { useCallback, useEffect, useState } from "react";

type TrafficSegment = {
  id: string;
  streetName: string;
  distance: number | null;
  speedLimit: number | null;
  harmonicAverageSpeed: number | null;
  averageSpeed: number | null;
  travelTimeSeconds: number | null;
  sampleSize: number | null;
  delayIndex: number | null;
  percentiles: number[];
  geometry?: {
    type: string;
    coordinates?: Array<[number, number]>;
  } | null;
};

export type TrafficResponse = {
  fetchedAt: string;
  network: unknown;
  sampleSize: number;
  topSegments: TrafficSegment[];
  allSegments?: TrafficSegment[];
};

export function useTrafficInsights() {
  const [data, setData] = useState<TrafficResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ingolstadt/traffic", { cache: "no-store" });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = (await res.json()) as TrafficResponse;
      setData(json);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => {
      refresh().catch(() => null);
    };
    window.addEventListener("run-optimization", handler);
    return () => window.removeEventListener("run-optimization", handler);
  }, [refresh]);

  return { data, loading, error, refresh };
}
