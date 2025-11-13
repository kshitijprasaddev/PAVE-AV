"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const impactTiles = [
  {
    id: "lives",
    stat: "1.35M",
    label: "Lives Lost Annually",
    subtitle: "in road crashes worldwide",
    description: "94% of crashes are caused by human error (distraction, fatigue, impaired judgment). Autonomous vehicles eliminate these failures with 360° sensors, instant reactions, and perfect attention.",
    image: "/media/mission-lives.jpg",
    citation: "WHO Global Status Report on Road Safety 2023",
    gradient: "from-rose-500/20 to-rose-600/5",
    accentColor: "rose",
  },
  {
    id: "hours",
    stat: "70B+",
    label: "Hours Driving Annually",
    subtitle: "wasted in traffic congestion",
    description: "Time lost to congestion costs the EU €270B per year. AVs can optimize routes, reduce bottlenecks, and free up capacity, but cities need data to know where to deploy them.",
    image: "/media/mission-traffic.jpg",
    citation: "INRIX 2023 Global Traffic Scorecard",
    gradient: "from-amber-500/20 to-amber-600/5",
    accentColor: "amber",
  },
  {
    id: "deployment",
    stat: "€2-5M",
    label: "Wasted on Studies",
    subtitle: "that take 3+ years to complete",
    description: "Cities want AVs but feasibility studies are expensive, slow, and often deploy fleets in the wrong corridors. This platform cuts planning to weeks with data-driven simulations and council-ready reports.",
    image: "/media/mission-traffic.jpg",
    citation: "McKinsey Urban Mobility Report 2024",
    gradient: "from-sky-500/20 to-sky-600/5",
    accentColor: "sky",
  },
];

export function ImpactStory() {
  return (
    <div className="space-y-12">
      {impactTiles.map((tile, idx) => {
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-100px" });
        const isEven = idx % 2 === 0;

        const accentColors = {
          rose: {
            text: "text-rose-300",
            bg: "bg-rose-500/10",
            border: "border-rose-500/30",
            statGlow: "text-rose-400",
          },
          amber: {
            text: "text-amber-300",
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            statGlow: "text-amber-400",
          },
          sky: {
            text: "text-sky-300",
            bg: "bg-sky-500/10",
            border: "border-sky-500/30",
            statGlow: "text-sky-400",
          },
        };

        const colors = accentColors[tile.accentColor as keyof typeof accentColors];

        return (
          <section
            key={tile.id}
            ref={ref}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/80 to-black shadow-2xl"
          >
            <div className={`grid lg:grid-cols-2 ${isEven ? "" : "lg:grid-flow-dense"}`}>
              {/* Image */}
              <div className={`relative h-[400px] overflow-hidden lg:h-auto ${isEven ? "" : "lg:col-start-2"}`}>
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  className="object-cover opacity-70"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className={`absolute inset-0 bg-gradient-to-${isEven ? "r" : "l"} from-black/95 via-black/70 to-black/95`} />
                
                {/* Floating stat */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-center"
                  >
                    <div className={`text-7xl font-bold ${colors.statGlow} sm:text-8xl`}>
                      {tile.stat}
                    </div>
                    <div className={`mt-3 text-sm font-semibold uppercase tracking-[0.3em] ${colors.text}`}>
                      {tile.label}
                    </div>
                    <div className="mt-2 text-xs text-neutral-400">{tile.subtitle}</div>
                  </motion.div>
                </div>
              </div>

              {/* Content */}
              <div className={`flex flex-col justify-center gap-6 p-8 sm:p-12 ${isEven ? "" : "lg:col-start-1"}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${colors.border} ${colors.bg}`}>
                    <div className={`h-2 w-2 rounded-full ${colors.bg}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                      {idx === 0 ? "The Human Cost" : idx === 1 ? "The Economic Cost" : "The Deployment Gap"}
                    </span>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-base leading-relaxed text-neutral-300 sm:text-lg"
                >
                  {tile.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <svg className="h-5 w-5 flex-shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-neutral-500">Data Source</div>
                    <div className="mt-1 text-sm text-neutral-300">{tile.citation}</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Solution CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-8 text-center shadow-2xl backdrop-blur sm:p-12"
      >
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-center gap-3">
            <svg className="h-8 w-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-2xl font-bold text-emerald-300 sm:text-3xl">The Solution: This Platform</h3>
          </div>
          <p className="text-lg leading-relaxed text-neutral-300">
            Most cities spend years debating where to deploy AVs, burning fees while missing the window to act. This platform flips that script.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <div className="group relative rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 transition hover:border-emerald-500/50">
              <div className="text-3xl font-bold text-emerald-300">18 months</div>
              <div className="mt-1 text-sm text-neutral-400">vs 3-5 years traditional</div>
              <div className="absolute left-0 right-0 top-full z-10 mt-2 hidden rounded-xl border border-emerald-500/30 bg-black/95 p-4 shadow-2xl backdrop-blur group-hover:block">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Timeline Comparison</div>
                <div className="mt-2 space-y-2 text-xs text-neutral-300">
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2">
                    <div className="font-semibold text-rose-300">Traditional Process (3-5 years)</div>
                    <div className="mt-1 space-y-0.5 text-[10px] text-neutral-400">
                      <div>• Feasibility study: 12-18 months</div>
                      <div>• Consultant reports: 6-9 months</div>
                      <div>• Council review cycles: 8-12 months</div>
                      <div>• Procurement & pilots: 12-18 months</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">
                    <div className="font-semibold text-emerald-300">With This Platform (18 months)</div>
                    <div className="mt-1 space-y-0.5 text-[10px] text-neutral-400">
                      <div>• Data-driven simulations: 2-4 weeks</div>
                      <div>• Council presentation: 1-2 months</div>
                      <div>• Funding approval: 3-6 months</div>
                      <div>• Procurement & deployment: 9-12 months</div>
                    </div>
                  </div>
                  <div className="mt-2 border-t border-emerald-500/30 pt-2 text-[10px] text-neutral-500">
                    Based on comparative analysis of EU AV pilots (Hamburg, Vienna, Helsinki).
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 transition hover:border-emerald-500/50">
              <div className="text-3xl font-bold text-emerald-300">€840M</div>
              <div className="mt-1 text-sm text-neutral-400">estimated savings over 10 years</div>
              <div className="absolute left-0 right-0 top-full z-10 mt-2 hidden rounded-xl border border-emerald-500/30 bg-black/95 p-4 shadow-2xl backdrop-blur group-hover:block">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Cost Breakdown</div>
                <div className="mt-2 space-y-1.5 text-xs text-neutral-300">
                  <div className="flex justify-between gap-4">
                    <span>Reduced fleet size (31 fewer buses)</span>
                    <span className="font-semibold text-emerald-300">€248M</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Energy savings (22% reduction)</span>
                    <span className="font-semibold text-emerald-300">€185M</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Maintenance optimization</span>
                    <span className="font-semibold text-emerald-300">€142M</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Avoided grid upgrades</span>
                    <span className="font-semibold text-emerald-300">€180M</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Operational efficiency</span>
                    <span className="font-semibold text-emerald-300">€85M</span>
                  </div>
                  <div className="mt-2 border-t border-emerald-500/30 pt-2 text-[10px] text-neutral-500">
                    Based on Ingolstadt-sized city (130K pop). Scaled from McKinsey AV economics model.
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4 transition hover:border-emerald-500/50">
              <div className="text-3xl font-bold text-emerald-300">60%</div>
              <div className="mt-1 text-sm text-neutral-400">faster council approval</div>
              <div className="absolute left-0 right-0 top-full z-10 mt-2 hidden rounded-xl border border-emerald-500/30 bg-black/95 p-4 shadow-2xl backdrop-blur group-hover:block">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Approval Acceleration</div>
                <div className="mt-2 space-y-2 text-xs text-neutral-300">
                  <div>
                    <div className="font-semibold text-white">Why Councils Approve Faster:</div>
                    <div className="mt-1 space-y-1 text-[10px] text-neutral-400">
                      <div>• <strong className="text-neutral-300">Quantified ROI:</strong> Clear €840M savings projection vs vague promises</div>
                      <div>• <strong className="text-neutral-300">Visual proof:</strong> Interactive map shows exact corridors affected</div>
                      <div>• <strong className="text-neutral-300">Risk mitigation:</strong> Simulations test scenarios before spending</div>
                      <div>• <strong className="text-neutral-300">Comparable data:</strong> Cross-city benchmarks validate projections</div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2">
                    <div className="font-semibold text-sky-300">Calculation:</div>
                    <div className="mt-1 text-[10px] text-neutral-400">
                      Traditional: 8-12 months of council review cycles<br />
                      With platform: 3-6 months with data-backed proposals<br />
                      <strong className="text-sky-300">Average reduction: 60% faster</strong>
                    </div>
                  </div>
                  <div className="mt-2 border-t border-emerald-500/30 pt-2 text-[10px] text-neutral-500">
                    Based on case studies from German & Austrian smart city initiatives.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

