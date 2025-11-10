"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

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

type Vehicle = {
  id: string;
  cellId: number;
  action: "idle" | "move" | "charge";
};

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
  const vehicles = useMemo(() => {
    const result: Vehicle[] = [];
    topCells.forEach((cell, index) => {
      const count = coverageForRank(index);
      for (let i = 0; i < count; i++) {
        result.push({
          id: `${cell.id}-${i}`,
          cellId: cell.id,
          action: i % 3 === 0 ? "charge" : i % 2 === 0 ? "move" : "idle",
        });
      }
    });
    return result;
  }, [topCells, coverageForRank]);

  const depotCells = useMemo(() => [cells[0], cells[5], cells[Math.floor(cells.length / 2)]], [cells]);

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
          const cellVehicles = vehicles.filter((v) => v.cellId === cell.id);

          return (
            <motion.div
              key={cell.id}
              onMouseEnter={() => isHotspot && onCellHover(cell.id)}
              className="relative flex items-center justify-center overflow-hidden rounded-lg transition-all"
              style={{
                backgroundColor: isDepot
                  ? "rgba(16, 185, 129, 0.15)"
                  : `rgba(59, 130, 246, ${0.08 + intensity * 0.35})`,
                border: isActive
                  ? "2px solid rgba(16, 185, 129, 0.9)"
                  : isHotspot
                    ? "2px solid rgba(16, 185, 129, 0.4)"
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
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M7 7h10v10H7z" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </motion.div>
              )}

              {isHotspot && demandPercent > 30 && (
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
                      "radial-gradient(circle, rgba(59,130,246,0) 0%, transparent 70%)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <AnimatePresence>
                {cellVehicles.slice(0, 2).map((vehicle, idx) => (
                  <motion.div
                    key={vehicle.id}
                    className="absolute"
                    style={{
                      left: `${20 + idx * 30}%`,
                      top: `${30 + idx * 25}%`,
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0.8, 1, 0.8],
                      opacity: [0.7, 1, 0.7],
                      rotate: vehicle.action === "move" ? [0, 360] : 0,
                    }}
                    transition={{
                      duration: vehicle.action === "move" ? 3 : 2,
                      delay: idx * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={vehicle.action === "charge" ? "#10b981" : "#3b82f6"}
                      opacity={0.9}
                    >
                      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                    </svg>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isHotspot && (
                <div className="pointer-events-none absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1 rounded bg-black/40 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur">
                  <span>{demandPercent}%</span>
                  <span>{avCount} AVs</span>
                </div>
              )}

              {isActive && (
                <motion.div
                  className="pointer-events-none absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[8px] font-bold text-white shadow"
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

      <div className="mt-4 grid gap-2 rounded-xl border border-neutral-200/70 bg-white/80 p-3 text-[11px] text-neutral-600 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-300 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
          </svg>
          <span>Blue = repositioning</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#10b981">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z" />
          </svg>
          <span>Green = charging</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M12 2v20M7 7h10v10H7z" />
            <circle cx="12" cy="12" r="2" fill="#10b981" />
          </svg>
          <span>Depot location</span>
        </div>
      </div>
    </div>
  );
}

