"use client";

import type { TrafficResponse } from "@/hooks/useTrafficInsights";
import { TrafficHeatLegend } from "@/components/TrafficHeatLegend";
import { motion } from "framer-motion";
import { useMemo } from "react";

type Props = {
  data: TrafficResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void> | void;
};

export function TrafficInsights({ data, loading, error, refresh }: Props) {
  const lastUpdated = data?.fetchedAt ? new Date(data.fetchedAt) : null;

  const stats = useMemo(() => {
    if (!data?.topSegments?.length) return { avg: 0, max: 0, count: 0 };
    const delays = data.topSegments.map((s) => s.delayIndex ?? 0);
    return {
      count: data.topSegments.length,
      avg: delays.reduce((sum, d) => sum + d, 0) / delays.length,
      max: Math.max(...delays),
    };
  }, [data]);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-neutral-950/80 p-6 shadow-2xl backdrop-blur sm:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-amber-400/80">Live Traffic</p>
          <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">Corridor congestion data</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button onClick={() => refresh()} className="rounded-full border border-white/20 bg-white/5 px-4 py-2 font-medium text-neutral-300 hover:bg-white/10">Refresh</button>
        </div>
      </div>
      
      {loading && <p className="text-sm text-neutral-400">Loading TomTom traffic stats…</p>}
      {error && <p className="text-sm text-rose-400">Traffic stats unavailable: {error}</p>}
      {!loading && !error && data && (
        <>
          <TrafficHeatLegend segmentCount={stats.count} avgDelay={stats.avg} maxDelay={stats.max} />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.topSegments.slice(0, 6).map((segment, idx) => {
                const slowDown = segment.delayIndex != null ? Math.round(segment.delayIndex) : 0;
                const severity = slowDown > 60 ? "critical" : slowDown > 30 ? "high" : "moderate";
                const barWidth = Math.min(100, (slowDown / 100) * 100);
                
                return (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                    className="card-hover group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 shadow-lg backdrop-blur"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{segment.streetName}</div>
                        <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                          {severity === "critical" ? "Critical delay" : severity === "high" ? "High congestion" : "Moderate delay"}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          severity === "critical" ? "bg-rose-500/20 text-rose-400" :
                          severity === "high" ? "bg-amber-500/20 text-amber-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          -{slowDown}
                        </span>
                        <span className="text-[10px] text-neutral-500">km/h</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400">
                        <span>Delay intensity</span>
                        <span>{slowDown} km/h below limit</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 + 0.3, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            severity === "critical" ? "bg-gradient-to-r from-rose-500 to-rose-600" :
                            severity === "high" ? "bg-gradient-to-r from-amber-500 to-amber-600" :
                            "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                      <div>
                        <span className="text-neutral-500">Limit:</span> {segment.speedLimit ?? "..."} km/h
                      </div>
                      <div>
                        <span className="text-neutral-500">Actual:</span> {segment.harmonicAverageSpeed?.toFixed(0) ?? "..."} km/h
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}

