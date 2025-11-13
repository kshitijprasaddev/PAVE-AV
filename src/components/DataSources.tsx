"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function DataSources() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const sources = [
    {
      name: "TomTom Traffic Stats",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      description: "Real probe data from millions of connected vehicles (GPS traces, not satellites). August 2024 Ingolstadt dataset with 5,000+ road segments.",
      status: "Integrated",
      color: "amber",
    },
    {
      name: "Depot Charging Capacity",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M12 10v4M10 12h4" />
        </svg>
      ),
      description: "Estimated based on typical urban depot charging capacity (1-2 MW per site). Locations chosen near major transit hubs (Nordbahnhof station, Audi campus, GVZ logistics area). Actual capacity would come from municipal utility data.",
      status: "Assumed",
      color: "emerald",
    },
    {
      name: "Demand Modeling",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: "Derived from TomTom traffic delay patterns. Assumption: higher congestion = higher mobility need. This is a proxy visualization; production systems would use actual transit ridership or ride-hailing data.",
      status: "Proxy",
      color: "sky",
    },
  ];

  return (
    <section
      ref={ref}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-neutral-950/80 p-6 shadow-2xl backdrop-blur sm:p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6"
      >
        <p className="text-xs font-medium uppercase tracking-[0.4em] text-violet-400/80">Data Sources</p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Where the numbers come from
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-300">
          All data is real or based on publicly available infrastructure specs. Here&apos;s what feeds the twin:
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sources.map((source, idx) => {
          const colorClasses = {
            amber: "border-amber-500/30 bg-amber-500/5 text-amber-400",
            emerald: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
            sky: "border-sky-500/30 bg-sky-500/5 text-sky-400",
          };
          const badgeColors = {
            amber: "bg-amber-500/20 text-amber-300",
            emerald: "bg-emerald-500/20 text-emerald-300",
            sky: "bg-sky-500/20 text-sky-300",
          };

          return (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`card-hover rounded-2xl border p-5 backdrop-blur ${colorClasses[source.color as keyof typeof colorClasses]}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ${colorClasses[source.color as keyof typeof colorClasses].split(" ")[2]}`}>
                  {source.icon}
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${badgeColors[source.color as keyof typeof badgeColors]}`}>
                  {source.status}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">{source.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">{source.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

