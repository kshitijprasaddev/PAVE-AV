"use client";

import React from "react";
import type { OrchestrationPlan } from "@/lib/orchestrator";
import type { RouteDetails } from "@/types/routes";

export function MetricsModal({ open, onClose, plan, routes }: { open: boolean; onClose: () => void; plan: OrchestrationPlan | null; routes: RouteDetails[] }) {
  if (!open || !plan) return null;
  const top = [...routes].sort((a, b) => (b.delayTime ?? 0) - (a.delayTime ?? 0))[0];
  const example = top ? {
    routeName: top.routeName,
    delayTime: top.delayTime ?? 0,
    typical: top.typicalTravelTime ?? 0,
    lengthKm: (top.routeLength ?? 0) / 1000,
  } : undefined;

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="pointer-events-auto absolute top-24 left-6 max-h-[70vh] w-full max-w-md overflow-auto rounded-2xl border border-neutral-200 bg-white/90 p-5 shadow-xl backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/85">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold">How metrics are calculated</h3>
          <button onClick={onClose} className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900">Close</button>
        </div>
        <div className="space-y-5 text-sm text-neutral-600 dark:text-neutral-200">
          <section>
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-100">City KPIs</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Service reliability</strong>: baseline stays around 65 percent, corridor reliability × 30 adds headroom, and the learned policy can contribute roughly 12 percent more.</li>
              <li><strong>Energy per ride</strong>: start at 9 kWh minus 2.5 times the energy penalty; shifting charge windows trims up to about 1.2 kWh per trip.</li>
              <li><strong>Grid stress index</strong>: 35 plus energy penalty × 40; off peak charging and V2G moments pull the score down by as much as 10 points.</li>
              <li><strong>Reward score</strong>: service reliability minus 0.6 × grid stress minus unmet demand penalty.</li>
            </ul>
          </section>
          <section>
            <h4 className="font-semibold text-neutral-800 dark:text-neutral-100">Corridor cards</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Delay cut</strong> = observed delay × efficiency boost (range 15 to 35 percent).</li>
              <li><strong>Time saved</strong> = delay cut ÷ 60 to get minutes per day.</li>
              <li><strong>CO₂ saved</strong> = length in km × 0.12 kg/km × recommended AVs × 5 days per week.</li>
              <li><strong>Recommended AVs</strong> scale with severity while keeping every district covered.</li>
            </ul>
          </section>
          {example && (
            <section>
              <h4 className="font-semibold text-neutral-800 dark:text-neutral-100">Example · {example.routeName}</h4>
              <div className="mt-2 grid gap-2 rounded-lg border border-neutral-200 bg-neutral-50/90 p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200">
                <div>Observed delay: {example.delayTime}s · Typical trip: {Math.round(example.typical / 60)} min · Length: {example.lengthKm.toFixed(2)} km</div>
                <div>Delay cut range: {example.delayTime}s × 0.15 to 0.35 ⇒ time saved {((example.delayTime * 0.15) / 60).toFixed(1)} to {((example.delayTime * 0.35) / 60).toFixed(1)} min each day.</div>
                <div>CO₂ saved formula: {example.lengthKm.toFixed(2)} km × 0.12 kg/km × recommended AVs × 5 days per week.</div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}


