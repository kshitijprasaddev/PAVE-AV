"use client";

import { motion } from "framer-motion";

type TrafficHeatLegendProps = {
  segmentCount: number;
  avgDelay: number;
  maxDelay: number;
};

export function TrafficHeatLegend({ segmentCount, avgDelay, maxDelay }: TrafficHeatLegendProps) {
  return (
    <div className="grid gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 to-red-500/10 p-5 backdrop-blur sm:grid-cols-3">
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">Segments tracked</div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-2 text-3xl font-bold text-white"
        >
          {segmentCount}
        </motion.div>
        <div className="mt-1 text-[11px] text-neutral-400">Live corridor readings</div>
      </div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">Avg slowdown</div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-3xl font-bold text-amber-400"
        >
          {avgDelay.toFixed(0)} km/h
        </motion.div>
        <div className="mt-1 text-[11px] text-neutral-400">Below speed limit</div>
      </div>
      <div>
        <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">Peak delay</div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-2 text-3xl font-bold text-rose-400"
        >
          {maxDelay.toFixed(0)} km/h
        </motion.div>
        <div className="mt-1 text-[11px] text-neutral-400">Worst corridor</div>
      </div>
    </div>
  );
}

