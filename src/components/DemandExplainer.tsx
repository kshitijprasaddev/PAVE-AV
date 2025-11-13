"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function DemandExplainer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="rounded-2xl border border-sky-500/30 bg-sky-500/10 backdrop-blur"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-6 text-left transition hover:bg-sky-500/5"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
            <svg className="h-6 w-6 text-sky-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-sky-300">What is "Demand Density"?</h4>
        </div>
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="h-6 w-6 flex-shrink-0 text-sky-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isExpanded ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="space-y-4 border-t border-sky-500/30 p-6">
          <p className="text-sm leading-relaxed text-sky-200/90">
            <strong className="text-sky-300">Blue heat patches</strong> visualize inferred rider demand based on where traffic congestion is worst.
          </p>
          <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-300">How It's Calculated:</div>
            <div className="mt-2 space-y-1.5 text-xs text-sky-200/80">
              <div>• Corridors with <strong className="text-sky-300">high delay</strong> (from TomTom traffic) get brighter blue</div>
              <div>• Corridors with <strong className="text-sky-300">more route segments</strong> show higher density</div>
              <div>• <strong className="text-sky-300">Logic:</strong> High congestion = more people trying to move = higher ride demand</div>
            </div>
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-xs leading-relaxed text-amber-200/90">
              <strong className="text-amber-300">Limitation:</strong> This is a proxy, not real ride booking data. In production, cities would feed actual transit ridership or ride-hailing patterns. For this demo, traffic delay serves as a reasonable demand indicator.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
