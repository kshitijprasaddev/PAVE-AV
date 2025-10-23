"use client";

import React from "react";

export function Controls(props: {
  running: boolean;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (v: number) => void;
  fleetSize: number;
  onFleetChange: (v: number) => void;
  scenarios?: string[];
  scenario?: string;
  onScenarioChange?: (name: string) => void;
}) {
  const { running, onStart, onPause, onStep, onReset, speed, onSpeedChange, fleetSize, onFleetChange, scenarios = [], scenario, onScenarioChange } = props;
  return (
    <div className="flex flex-col gap-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        {!running ? (
          <button onClick={onStart} className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700">Start</button>
        ) : (
          <button onClick={onPause} className="rounded-md bg-neutral-700 px-3 py-1.5 text-white hover:bg-neutral-800">Pause</button>
        )}
        <button onClick={onStep} className="rounded-md border px-3 py-1.5 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">Step</button>
        <button onClick={onReset} className="rounded-md border px-3 py-1.5 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900">Reset</button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {scenarios.length > 0 && (
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Scenario</span>
            <select
              className="rounded-md border px-2 py-1 text-sm dark:border-neutral-700"
              value={scenario}
              onChange={(e) => onScenarioChange?.(e.target.value)}
            >
              {scenarios.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Speed (ticks/sec)</span>
          <input
            type="range"
            min={1}
            max={60}
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value))}
          />
          <span className="w-10 text-right text-sm">{speed}</span>
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Fleet size</span>
          <input
            type="range"
            min={10}
            max={200}
            value={fleetSize}
            onChange={(e) => onFleetChange(parseInt(e.target.value))}
          />
          <span className="w-10 text-right text-sm">{fleetSize}</span>
        </label>
      </div>
    </div>
  );
}


