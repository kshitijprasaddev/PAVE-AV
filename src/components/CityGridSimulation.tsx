"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

type Cell = {
  id: number;
  x: number;
  y: number;
  population: number;
};

type CityGridSimulationProps = {
  cells: Cell[];
  gridWidth: number;
  gridHeight: number;
  maxPopulation: number;
  activeHotspotId: number | null;
  topCells: Cell[];
  onCellHover: (cellId: number) => void;
  coverageForRank: (rank: number) => number;
};

type VehicleState = {
  id: string;
  currentCell: number;
  targetCell: number;
  action: "serving" | "moving-to-charge" | "charging" | "returning";
  progress: number;
};

const FIXED_DEPOTS = [
  { x: 1, y: 1 }, // Top-left (Audi Forum analogue)
  { x: 4, y: 2 }, // Top-right (Nordbahnhof analogue)
  { x: 2, y: 4 }, // Bottom-center (GVZ analogue)
];

export function CityGridSimulation({
  cells,
  gridWidth,
  gridHeight,
  maxPopulation,
  activeHotspotId,
  topCells,
  onCellHover,
  coverageForRank,
}: CityGridSimulationProps) {
  const depotCells = useMemo(() => {
    return cells.filter((cell) => FIXED_DEPOTS.some((d) => d.x === cell.x && d.y === cell.y));
  }, [cells]);

  const [vehicles, setVehicles] = useState<VehicleState[]>([]);

  useEffect(() => {
    const fleet: VehicleState[] = [];
    let vehicleId = 0;

    topCells.slice(0, 3).forEach((hotspot, index) => {
      const count = coverageForRank(index);
      for (let i = 0; i < count; i++) {
        const needsCharge = i % 3 === 0;
        const nearestDepot = depotCells.reduce((closest, depot) => {
          const distToCurrent = Math.abs(hotspot.x - closest.x) + Math.abs(hotspot.y - closest.y);
          const distToDepot = Math.abs(hotspot.x - depot.x) + Math.abs(hotspot.y - depot.y);
          return distToDepot < distToCurrent ? depot : closest;
        }, depotCells[0] ?? hotspot);

        fleet.push({
          id: `v-${vehicleId++}`,
          currentCell: hotspot.id,
          targetCell: needsCharge ? nearestDepot.id : hotspot.id,
          action: needsCharge ? "moving-to-charge" : "serving",
          progress: 0,
        });
      }
    });

    setVehicles(fleet);

    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          const newProgress = (v.progress + 0.015) % 1;
          let newAction = v.action;
          let newTarget = v.targetCell;
          let newCurrent = v.currentCell;

          if (v.action === "moving-to-charge" && newProgress > 0.95) {
            newAction = "charging";
            newCurrent = v.targetCell;
          } else if (v.action === "charging" && newProgress > 0.95) {
            const homeHotspot = topCells.find((h) => 
              Math.abs(h.x - (cells.find((c) => c.id === v.currentCell)?.x ?? 0)) < 2 &&
              Math.abs(h.y - (cells.find((c) => c.id === v.currentCell)?.y ?? 0)) < 2
            ) ?? topCells[0];
            newAction = "returning";
            newTarget = homeHotspot.id;
          } else if (v.action === "returning" && newProgress > 0.95) {
            newAction = "serving";
            newCurrent = v.targetCell;
          } else if (v.action === "serving" && newProgress > 0.95) {
            const nearestDepot = depotCells.reduce((closest, depot) => {
              const currentCell = cells.find((c) => c.id === v.currentCell);
              if (!currentCell) return closest;
              const distToCurrent = Math.abs(currentCell.x - closest.x) + Math.abs(currentCell.y - closest.y);
              const distToDepot = Math.abs(currentCell.x - depot.x) + Math.abs(currentCell.y - depot.y);
              return distToDepot < distToCurrent ? depot : closest;
            }, depotCells[0]);
            newAction = "moving-to-charge";
            newTarget = nearestDepot.id;
          }

          return {
            ...v,
            progress: newProgress,
            action: newAction,
            targetCell: newTarget,
            currentCell: newCurrent,
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [cells, topCells, depotCells, coverageForRank]);

  const vehiclesByCellId = useMemo(() => {
    const map = new Map<number, VehicleState[]>();
    vehicles.forEach((v) => {
      const existing = map.get(v.currentCell) ?? [];
      existing.push(v);
      map.set(v.currentCell, existing);
    });
    return map;
  }, [vehicles]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-slate-50 via-neutral-50 to-slate-100 p-6 shadow-inner dark:border-neutral-800 dark:from-neutral-900/60 dark:via-slate-950/80 dark:to-neutral-900/70">
      <div
        className="relative grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridHeight}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => {
          const intensity = cell.population / Math.max(maxPopulation, 1);
          const highlightIndex = topCells.findIndex((top) => top.id === cell.id);
          const isHotspot = highlightIndex !== -1;
          const isActive = isHotspot && activeHotspotId === cell.id;
          const isDepot = depotCells.some((d) => d.id === cell.id);
          const demandPercent = Math.round((cell.population / Math.max(maxPopulation, 1)) * 100);
          const avCount = isHotspot ? coverageForRank(highlightIndex) : 0;
          const cellVehicles = vehiclesByCellId.get(cell.id) ?? [];

          return (
            <motion.div
              key={cell.id}
              onMouseEnter={() => isHotspot && onCellHover(cell.id)}
              className="relative flex items-center justify-center overflow-hidden rounded-lg transition-all"
              style={{
                backgroundColor: isDepot
                  ? "rgba(16, 185, 129, 0.2)"
                  : `rgba(59, 130, 246, ${0.08 + intensity * 0.35})`,
                border: isActive
                  ? "2px solid rgba(16, 185, 129, 0.9)"
                  : isHotspot
                    ? "2px solid rgba(16, 185, 129, 0.4)"
                    : isDepot
                      ? "2px solid rgba(16, 185, 129, 0.3)"
                      : "1px solid rgba(148, 163, 184, 0.15)",
                aspectRatio: "1 / 1",
                cursor: isHotspot ? "pointer" : "default",
              }}
              animate={{
                scale: isActive ? 1.05 : 1,
                boxShadow: isActive
                  ? "0 0 24px rgba(16, 185, 129, 0.4)"
                  : isHotspot
                    ? "0 0 8px rgba(16, 185, 129, 0.15)"
                    : "none",
              }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {isDepot && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-emerald-600 dark:text-emerald-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                    <path d="M12 10v4M10 12h4" />
                  </svg>
                </motion.div>
              )}

              {isHotspot && demandPercent > 30 && !isDepot && (
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 65%)",
                      "radial-gradient(circle, rgba(59,130,246,0) 0%, transparent 65%)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <AnimatePresence>
                {cellVehicles.slice(0, 3).map((vehicle, idx) => {
                  const isCharging = vehicle.action === "charging";
                  const isMoving = vehicle.action === "moving-to-charge" || vehicle.action === "returning";
                  return (
                    <motion.div
                      key={vehicle.id}
                      className="absolute"
                      style={{
                        left: `${15 + (idx % 2) * 35}%`,
                        top: `${25 + Math.floor(idx / 2) * 35}%`,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: isCharging ? [0.9, 1.1, 0.9] : [0.95, 1, 0.95],
                        opacity: isCharging ? [0.6, 1, 0.6] : [0.8, 1, 0.8],
                        rotate: isMoving ? [0, 15, 0, -15, 0] : 0,
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        duration: isCharging ? 1.5 : 2,
                        delay: idx * 0.15,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isCharging ? "#10b981" : "#3b82f6"}
                        opacity={0.95}
                      >
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                      </svg>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isHotspot && !isDepot && (
                <div className="pointer-events-none absolute bottom-1 left-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-center text-[9px] font-semibold text-white backdrop-blur">
                  {demandPercent}% · {avCount} AVs
                </div>
              )}

              {isDepot && (
                <div className="pointer-events-none absolute bottom-1 left-1 right-1 rounded bg-emerald-900/60 px-1.5 py-0.5 text-center text-[9px] font-semibold text-white backdrop-blur">
                  Charging hub
                </div>
              )}

              {isActive && (
                <motion.div
                  className="pointer-events-none absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-2 rounded-xl border border-neutral-200/70 bg-white/90 p-3 text-[11px] text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-300 sm:grid-cols-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
          </svg>
          <span>Blue = serving</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
          </svg>
          <span>Green = charging</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <rect x="6" y="6" width="12" height="12" rx="2" />
            <path d="M12 10v4M10 12h4" />
          </svg>
          <span>Depot station</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-4 rounded bg-gradient-to-r from-blue-300 to-blue-600" />
          <span>Demand intensity</span>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-sky-200/60 bg-sky-50/40 p-3 text-xs text-sky-900 dark:border-sky-500/30 dark:bg-sky-900/20 dark:text-sky-200">
        <p className="font-semibold">Simulation logic:</p>
        <p className="mt-1 leading-relaxed">
          Vehicles serve high-demand zones (top 3 ranked cells). When battery drops, they route to the nearest depot (green background), charge, then return to their zone. This mirrors real fleet operations.
        </p>
      </div>
    </div>
  );
}
