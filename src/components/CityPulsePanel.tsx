import { motion } from "framer-motion";
import type { TimelinePoint } from "@/lib/rlSimulation";
import type { OrchestrationPlan } from "@/lib/orchestrator";
import type { RouteDetails } from "@/types/routes";

type CityPulsePanelProps = {
  timeline: TimelinePoint[];
  selectedHour: number;
  onSelectHour: (hour: number) => void;
  plan?: OrchestrationPlan | null;
  routes: RouteDetails[];
};

export function CityPulsePanel({ timeline, selectedHour, onSelectHour, plan, routes }: CityPulsePanelProps) {
  const hasTimeline = timeline.length > 0;
  const maxValue = hasTimeline ? timeline.reduce((max, point) => Math.max(max, point.demand, point.supply), 1) : 1;
  const selectedPoint = hasTimeline
    ? timeline.find((point) => point.hour === selectedHour) ?? timeline[0] ?? null
    : null;
  const reliability = plan?.serviceReliability ?? 0;
  const energyPerRide = plan?.energyPerRideKwh ?? 0;
  const gridStress = plan?.gridStressIndex ?? 0;

  const focusRoutes = [...routes]
    .sort((a, b) => (b.delayTime ?? 0) - (a.delayTime ?? 0))
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="grid gap-6 rounded-3xl border border-neutral-200 bg-white/85 p-6 shadow-lg shadow-neutral-900/10 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">City pulse timeline</h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
            Demand (rose) vs. deployed supply (emerald) over the next 24 hours. Drag the slider to inspect any hour.
            {!hasTimeline && " Telemetry will populate once the optimiser or API feed loads."}
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white/75 p-4 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/70">
          <svg viewBox="0 0 680 220" className="h-52 w-[680px] text-neutral-400">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              className="text-rose-400"
              strokeLinecap="round"
              points={timeline
                .map((point, index) => {
                  const x = (index / Math.max(timeline.length - 1, 1)) * 680;
                  const y = 200 - (point.demand / Math.max(maxValue, 1)) * 170;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              className="text-emerald-400"
              strokeLinecap="round"
              points={timeline
                .map((point, index) => {
                  const x = (index / Math.max(timeline.length - 1, 1)) * 680;
                  const y = 200 - (point.supply / Math.max(maxValue, 1)) * 170;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            {selectedPoint && (
              <line
                x1={(selectedPoint.hour / 24) * 680}
                x2={(selectedPoint.hour / 24) * 680}
                y1={20}
                y2={200}
                stroke="rgba(59,130,246,0.4)"
                strokeWidth={2}
              />
            )}
          </svg>
        </div>
        <input
          type="range"
          min={0}
          max={23}
          value={selectedHour}
          onChange={(event) => onSelectHour(Number(event.target.value))}
          className="w-full accent-neutral-900 dark:accent-white"
          disabled={!hasTimeline}
        />
        {selectedPoint && (
          <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-300">
            <span className="rounded-full border border-neutral-200 bg-white/75 px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900/70">
              {selectedPoint.hour.toString().padStart(2, "0")}:00
            </span>
            <span className="rounded-full border border-rose-200 bg-rose-50/70 px-3 py-1 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
              Demand {selectedPoint.demand.toFixed(1)}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              Supply {selectedPoint.supply.toFixed(1)}
            </span>
            <span className="rounded-full border border-neutral-200 bg-white/75 px-3 py-1 dark:border-neutral-700 dark:bg-neutral-900/70">
              Gap {(selectedPoint.supply - selectedPoint.demand).toFixed(1)}
            </span>
          </div>
        )}
        {!hasTimeline && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No demand timeline available yet. Run the optimiser or wait for the corridor feed to update.</p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-neutral-200 bg-white/75 p-4 text-xs text-neutral-600 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-300">
          <div>
            <div className="font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Reliability</div>
            <div className="mt-1 text-xl font-semibold text-neutral-900 dark:text-neutral-50">{reliability.toFixed(1)}%</div>
            <p className="mt-1 text-[11px]">Share of rides served after optimisation.</p>
          </div>
          <div>
            <div className="font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Energy / ride</div>
            <div className="mt-1 text-xl font-semibold text-neutral-900 dark:text-neutral-50">{energyPerRide.toFixed(2)} kWh</div>
            <p className="mt-1 text-[11px]">Average consumption per completed AV trip.</p>
          </div>
          <div>
            <div className="font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Grid stress</div>
            <div className="mt-1 text-xl font-semibold text-neutral-900 dark:text-neutral-50">{gridStress.toFixed(1)}</div>
            <p className="mt-1 text-[11px]">Composite score: lower is better for the feeder.</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            <span>High-pressure corridors</span>
            <span className="text-xs uppercase tracking-widest text-neutral-400">tap to focus</span>
          </div>
          <div className="mt-3 grid gap-2">
            {focusRoutes.map((route) => (
              <div key={route.routeId} className="rounded-2xl border border-neutral-200 bg-white/70 p-3 text-sm shadow-sm dark:border-neutral-800 dark:bg-neutral-900/70">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-100">{route.routeName}</span>
                  <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400">+{route.delayTime.toFixed(0)}s delay</span>
                </div>
                {route.area && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{route.area}</p>}
              </div>
            ))}
            {focusRoutes.length === 0 && <p className="text-sm text-neutral-500 dark:text-neutral-400">Route telemetry will appear here once data loads.</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


