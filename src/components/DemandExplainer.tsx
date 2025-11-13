"use client";

import { motion } from "framer-motion";

export function DemandExplainer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-6 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/20">
          <svg className="h-6 w-6 text-sky-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-sky-300">What is "Demand Density"?</h4>
          <p className="mt-2 text-sm leading-relaxed text-sky-200/90">
            The <strong className="text-sky-300">blue heat patches</strong> on the map show inferred rider demand, not live traffic. We calculate this by combining:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-sky-200/80">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sky-400">•</span>
              <span><strong className="text-sky-300">Traffic delay patterns</strong> from TomTom (high congestion = more people trying to move)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sky-400">•</span>
              <span><strong className="text-sky-300">Population density</strong> from census data (more residents = higher potential ridership)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sky-400">•</span>
              <span><strong className="text-sky-300">Land use types</strong> (transit stations, shopping, offices attract more riders)</span>
            </li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-sky-200/90">
            <strong className="text-sky-300">Why not live ride requests?</strong> In the early stages of AV deployment, there's no historical ride data yet. So we use proven proxies (congestion + demographics) to predict where people will need rides once AVs are available. Once the fleet launches, you'd replace this with actual booking data.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

