"use client";

import type { OrchestrationPlan } from "@/lib/orchestrator";
import type { RouteDetails } from "@/types/routes";
import { InfoPopover } from "@/components/InfoPopover";

const ACCENT_CLASSES: Record<string, { light: string; dark: string }> = {
  emerald: { light: "text-emerald-600", dark: "dark:text-emerald-400" },
  sky: { light: "text-sky-600", dark: "dark:text-sky-400" },
  amber: { light: "text-amber-600", dark: "dark:text-amber-400" },
  violet: { light: "text-violet-600", dark: "dark:text-violet-400" },
  cyan: { light: "text-cyan-600", dark: "dark:text-cyan-400" },
};

function Gauge({ label, value, unit, accent, explain }: { label: string; value: number; unit?: string; accent: keyof typeof ACCENT_CLASSES; explain?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400">
        <span>{label}</span>
        {explain ? <InfoPopover title={label}>{explain}</InfoPopover> : null}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-2xl font-semibold ${ACCENT_CLASSES[accent].light} ${ACCENT_CLASSES[accent].dark}`}>{value}</span>
        {unit ? <span className="text-sm text-neutral-500 dark:text-neutral-400">{unit}</span> : null}
      </div>
    </div>
  );
}

function Sparkline({ plan, timeline }: { plan: OrchestrationPlan; timeline?: { hour: number; demand: number; supply: number }[] }) {
  const data = timeline ?? plan.demandTimeline;
  const maxDemand = Math.max(...data.map((p) => p.demand), 1);
  const maxSupply = Math.max(...data.map((p) => p.supply), 1);
  const maxValue = Math.max(maxDemand, maxSupply, 1);
  const count = data.length;
  const denominator = Math.max(1, count - 1);
  const pointsDemand = data
    .map((d, idx) => `${(idx / denominator) * 100},${100 - (d.demand / maxValue) * 100}`)
    .join(" ");
  const pointsSupply = data
    .map((d, idx) => `${(idx / denominator) * 100},${100 - (d.supply / maxValue) * 100}`)
    .join(" ");
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
        <span>Demand vs supply (24h)</span>
        <span>Max: {Math.round(maxValue)}</span>
      </div>
      <svg className="mt-3 h-24 w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points={pointsDemand} fill="none" stroke="rgba(239,68,68,0.85)" strokeWidth={1.5} />
        <polyline points={pointsSupply} fill="none" stroke="rgba(34,197,94,0.85)" strokeWidth={1.5} />
      </svg>
      <div className="flex justify-between text-[11px] uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>24h</span>
      </div>
      <div className="mt-2 space-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
        <div><span className="text-emerald-500">▇</span> Supply model after policy updates</div>
        <div><span className="text-rose-500">▇</span> Observed demand profile (weekdays)</div>
        <div>Morning and evening peaks show where AV pooling unlocks the biggest impact.</div>
      </div>
    </div>
  );
}

export function OperationalPanel({
  plan,
  basePlan,
  routes,
  timelineOverride,
}: {
  plan: OrchestrationPlan | null;
  basePlan?: OrchestrationPlan | null;
  routes?: RouteDetails[];
  timelineOverride?: { hour: number; demand: number; supply: number }[] | null;
}) {
  if (!plan) return null;
  const base = basePlan ?? plan;
  const reliabilityDelta = Number((plan.serviceReliability - (base?.serviceReliability ?? plan.serviceReliability)).toFixed(1));
  const gridDelta = Number(((base?.gridStressIndex ?? plan.gridStressIndex) - plan.gridStressIndex).toFixed(1));
  const energyDelta = Number(((base?.energyPerRideKwh ?? plan.energyPerRideKwh) - plan.energyPerRideKwh).toFixed(2));
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <Gauge
        label="Service reliability"
        value={plan.serviceReliability}
        unit="%"
        accent="emerald"
        explain={
          <ul className="list-disc pl-4">
            <li>Base reliability sits near {base?.serviceReliability ?? plan.serviceReliability}%.</li>
            <li>Policy updates add about {reliabilityDelta}% by rebalancing supply.</li>
          </ul>
        }
      />
      <Gauge
        label="Energy per ride"
        value={plan.energyPerRideKwh}
        unit="kWh"
        accent="sky"
        explain={
          <ul className="list-disc pl-4">
            <li>Base demand is around {(base?.energyPerRideKwh ?? plan.energyPerRideKwh).toFixed(2)} kWh.</li>
            <li>Shifting charging off peak saves roughly {energyDelta.toFixed(2)} kWh per ride.</li>
          </ul>
        }
      />
      <Gauge
        label="Grid stress index"
        value={plan.gridStressIndex}
        unit="/100"
        accent="amber"
        explain={
          <ul className="list-disc pl-4">
            <li>Base stress is about {(base?.gridStressIndex ?? plan.gridStressIndex).toFixed(1)}.</li>
            <li>Revised charging alignment drops roughly {gridDelta.toFixed(1)} pts.</li>
          </ul>
        }
      />
      <Gauge
        label="Reward score"
        value={plan.rewardScore}
        unit=""
        accent="violet"
        explain={<span>reward = service reliability − 0.6 × grid stress − unmet demand penalty</span>}
      />
      <Gauge
        label="Fleet ready"
        value={plan.recommendedFleetSize}
        unit="AVs"
        accent="cyan"
        explain={<span>Fleet that can be staged for the coming week.</span>}
      />
      <Sparkline plan={plan} timeline={timelineOverride ?? undefined} />

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 lg:col-span-2 xl:col-span-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Dynamic deployment priorities
        </h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {plan.hotspots.map((hotspot) => {
            const routeMeta = routes?.find((r) => r.routeName === hotspot.corridor);
            return (
              <div key={hotspot.corridor} className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm shadow-sm transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-100">{hotspot.corridor}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                      hotspot.severity === "High"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                        : hotspot.severity === "Medium"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                    }`}
                  >
                    {hotspot.severity}
                  </span>
                </div>
                <div className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Deploy <span className="font-semibold">{hotspot.recommendedAvs} AVs</span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{hotspot.coverageWindow}</div>
                {routeMeta?.area && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Area: {routeMeta.area}</p>}
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">{hotspot.notes}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  {typeof hotspot.efficiencyBoostPct === "number" && (
                    <div className="rounded bg-white/50 p-1 dark:bg-neutral-800/50">Delay ↓ {hotspot.efficiencyBoostPct}%</div>
                  )}
                  {typeof hotspot.timeSavedMin === 'number' && (
                    <div className="rounded bg-white/50 p-1 dark:bg-neutral-800/50">Time saved ~{hotspot.timeSavedMin}m/day</div>
                  )}
                  {typeof hotspot.co2SavedKgPerWeek === 'number' && (
                    <div className="rounded bg-white/50 p-1 dark:bg-neutral-800/50">CO₂ ↓ {hotspot.co2SavedKgPerWeek} kg/wk</div>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <InfoPopover title="How this card is calculated">
                    <ul className="list-disc pl-4">
                      <li>Delay cut = delay × efficiency boost (15 to 35 percent).</li>
                      <li>Time saved = delay cut ÷ 60.</li>
                      <li>CO₂ saved = length in km × 0.12 kg/km × AVs × 5 days per week.</li>
                    </ul>
                  </InfoPopover>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950 lg:col-span-2 xl:col-span-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Charging & grid strategy
        </h3>
        <ol className="mt-3 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
          {plan.chargingPlan.map((item) => (
            <li key={item.window} className="rounded-md border border-dashed border-neutral-200 p-3 dark:border-neutral-800">
              <div className="font-semibold text-neutral-800 dark:text-neutral-100">{item.window}</div>
              <div>{item.action}</div>
              <div className="text-xs text-neutral-400 dark:text-neutral-500">{item.rationale}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}


