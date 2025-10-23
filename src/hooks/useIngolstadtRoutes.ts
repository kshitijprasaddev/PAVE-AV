import { useCallback, useEffect, useMemo, useState } from "react";
import type { RouteDetails, RouteResponse } from "@/types/routes";
import { buildOrchestrationPlan, type OrchestrationPlan } from "@/lib/orchestrator";

type State = {
  routes: RouteDetails[];
  plan: OrchestrationPlan | null;
  fetchedAt?: string;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
};

export function useIngolstadtRoutes(pollIntervalMs = 60000): State {
  const [routes, setRoutes] = useState<RouteDetails[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ingolstadt/routes", { cache: "no-store" });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = (await response.json()) as RouteResponse;
      setRoutes(data.routes);
      setFetchedAt(data.fetchedAt);
      setError(undefined);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout | null = null;

    fetchData();
    if (pollIntervalMs) {
      timer = setInterval(() => {
        if (!active) return;
        fetchData();
      }, pollIntervalMs);
    }

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [pollIntervalMs, fetchData]);

  const plan = useMemo(() => {
    if (!routes.length) return null;
    return buildOrchestrationPlan(routes);
  }, [routes]);

  return { routes, plan, fetchedAt, loading, error, refresh: fetchData };
}


