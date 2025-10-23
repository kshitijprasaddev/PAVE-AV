"use client";

import type { TrafficResponse } from "@/hooks/useTrafficInsights";

type Props = {
  data: TrafficResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void> | void;
};

export function TrafficInsights({ data, loading, error, refresh }: Props) {
  const lastUpdated = data?.fetchedAt ? new Date(data.fetchedAt) : null;

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Traffic pressure</h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
          {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>}
          <button onClick={() => refresh()} className="rounded border border-neutral-200 px-2 py-0.5 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">Refresh</button>
        </div>
      </div>
      {loading && <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Loading TomTom traffic stats…</p>}
      {error && <p className="mt-4 text-sm text-rose-500">Traffic stats unavailable · {error}</p>}
      {!loading && !error && data && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.topSegments.slice(0, 6).map((segment) => {
            const slowDown = segment.delayIndex != null && segment.speedLimit != null
              ? Math.round(segment.delayIndex)
              : null;
            return (
              <div key={segment.id} className="rounded-2xl border border-neutral-200 bg-white/70 p-4 text-xs text-neutral-600 shadow-inner transition hover:shadow dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-300">
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                  <span>{segment.streetName}</span>
                  {slowDown != null && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">-{slowDown} km/h</span>}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">Peak delay corridor</div>
                <ul className="mt-2 space-y-1 text-[11px]">
                  <li>Speed limit: {segment.speedLimit ?? "—"} km/h · harmonic speed: {segment.harmonicAverageSpeed?.toFixed(1) ?? "—"} km/h</li>
                  <li>Distance: {segment.distance?.toFixed(1) ?? "—"} m · samples: {segment.sampleSize ?? "—"}</li>
                  <li>Average travel time: {segment.travelTimeSeconds?.toFixed(2) ?? "—"} s</li>
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
