"use client";

import React from "react";

type Cell = {
  id: number;
  x: number;
  y: number;
  population: number;
};

type Vehicle = {
  id: number;
  cellId: number;
  batteryKwh: number;
  maxBatteryKwh: number;
};

export function CityGrid(props: {
  cells: Cell[];
  demandByCell: Record<number, number>;
  vehicles: Vehicle[];
}) {
  const { cells, demandByCell, vehicles } = props;
  if (!cells || cells.length === 0) return null;
  const width = Math.max(...cells.map((c) => c.x)) + 1;
  const maxDemand = Math.max(1, ...Object.values(demandByCell));

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` }}
    >
      {cells
        .sort((a, b) => a.y - b.y || a.x - b.x)
        .map((cell) => {
          const demand = demandByCell[cell.id] ?? 0;
          const intensity = demand / maxDemand; // 0..1
          const bg = `rgba(34,197,94,${0.15 + 0.65 * intensity})`; // green shades
          const vehiclesHere = vehicles.filter((v) => v.cellId === cell.id);
          return (
            <div
              key={cell.id}
              className="relative aspect-square rounded-sm border border-neutral-200 dark:border-neutral-800"
              style={{ backgroundColor: bg }}
              title={`Cell ${cell.id}\nDemand: ${demand.toFixed(0)}\nPopulation: ${cell.population}`}
            >
              <div className="absolute inset-1 flex flex-wrap items-start gap-1">
                {vehiclesHere.slice(0, 8).map((v) => {
                  const soc = v.batteryKwh / v.maxBatteryKwh; // 0..1
                  const color = soc > 0.66 ? "bg-emerald-500" : soc > 0.33 ? "bg-yellow-400" : "bg-red-500";
                  return <span key={v.id} className={`h-2 w-2 rounded-full ${color}`}></span>;
                })}
                {vehiclesHere.length > 8 && (
                  <span className="text-[10px] text-neutral-700 dark:text-neutral-300">+{vehiclesHere.length - 8}</span>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}


