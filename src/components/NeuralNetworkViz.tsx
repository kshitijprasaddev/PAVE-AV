"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const NETWORK_ARCHITECTURE = [
  { label: "Inputs", count: 6, color: "#10b981", description: "Delay · Demand · Energy · Battery · Time · Weather" },
  { label: "Hidden 1", count: 8, color: "#3b82f6", description: "First encoding layer" },
  { label: "Hidden 2", count: 8, color: "#6366f1", description: "Policy representation" },
  { label: "Actions", count: 3, color: "#8b5cf6", description: "Move · Charge · Hold" },
];

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 400;
const LAYER_SPACING = CANVAS_WIDTH / (NETWORK_ARCHITECTURE.length + 1);

type NodePosition = { x: number; y: number; layer: number; index: number };
type EdgeDefinition = { from: NodePosition; to: NodePosition; id: string };

function computeLayout(): { nodes: NodePosition[]; edges: EdgeDefinition[] } {
  const nodes: NodePosition[] = [];
  const edges: EdgeDefinition[] = [];

  NETWORK_ARCHITECTURE.forEach((layer, layerIndex) => {
    const x = LAYER_SPACING * (layerIndex + 1);
    const verticalSpacing = CANVAS_HEIGHT / (layer.count + 1);
    for (let i = 0; i < layer.count; i++) {
      const y = verticalSpacing * (i + 1);
      nodes.push({ x, y, layer: layerIndex, index: i });
    }
  });

  nodes.forEach((node) => {
    if (node.layer === NETWORK_ARCHITECTURE.length - 1) return;
    const nextLayerNodes = nodes.filter((n) => n.layer === node.layer + 1);
    nextLayerNodes.forEach((target) => {
      edges.push({
        from: node,
        to: target,
        id: `${node.layer}-${node.index}-${target.layer}-${target.index}`,
      });
    });
  });

  return { nodes, edges };
}

export function NeuralNetworkViz() {
  const { nodes, edges } = useMemo(() => computeLayout(), []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-200/50 bg-gradient-to-br from-slate-950 via-slate-900 to-neutral-950 shadow-2xl dark:border-neutral-800/50">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 p-8 sm:p-12">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-emerald-400/80">Reinforcement Learning Architecture</p>
            <h3 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              Policy network pipeline
            </h3>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-neutral-300">
            Proximal Policy Optimization (PPO) processes live telemetry through two hidden layers, then outputs fleet actions: move, charge, or hold.
          </p>
        </div>

        <div className="relative mx-auto aspect-[9/4] w-full max-w-5xl overflow-visible rounded-2xl border border-white/5 bg-gradient-to-br from-neutral-900/80 via-slate-950/90 to-black/95 p-6 shadow-2xl shadow-black/60 backdrop-blur sm:p-10">
          <svg
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.6)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 0.5)" />
                <stop offset="100%" stopColor="rgba(139, 92, 246, 0.6)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <radialGradient id="nodeGlow">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </radialGradient>
            </defs>

            {edges.map((edge, idx) => {
              const delay = (idx % 12) * 0.08;

              return (
                <motion.line
                  key={edge.id}
                  x1={edge.from.x}
                  y1={edge.from.y}
                  x2={edge.to.x}
                  y2={edge.to.y}
                  stroke="url(#edgeGradient)"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  initial={{ opacity: 0.15, pathLength: 0 }}
                  animate={{
                    opacity: [0.15, 0.5, 0.15],
                    pathLength: [0, 1, 0.95],
                  }}
                  transition={{
                    duration: 3.5,
                    delay,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                  }}
                />
              );
            })}

            {edges.slice(0, 8).map((edge, idx) => {
              const midX = (edge.from.x + edge.to.x) / 2;
              const midY = (edge.from.y + edge.to.y) / 2;
              return (
                <motion.circle
                  key={`pulse-${edge.id}`}
                  cx={midX}
                  cy={midY}
                  r={3}
                  fill="rgba(56, 189, 248, 0.9)"
                  filter="url(#glow)"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: idx * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              );
            })}

            {nodes.map((node) => {
              const layerConfig = NETWORK_ARCHITECTURE[node.layer];
              const baseRadius = node.layer === 0 || node.layer === NETWORK_ARCHITECTURE.length - 1 ? 18 : 16;

              return (
                <g key={`node-${node.layer}-${node.index}`}>
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={baseRadius + 6}
                    fill="url(#nodeGlow)"
                    opacity={0.2}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.1, 0.8] }}
                    transition={{
                      duration: 3,
                      delay: node.index * 0.15 + node.layer * 0.1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.circle
                    cx={node.x}
                    cy={node.y}
                    r={baseRadius}
                    fill={layerConfig.color}
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth={2}
                    filter="url(#glow)"
                    initial={{ opacity: 0.7, scale: 0.9 }}
                    animate={{
                      opacity: [0.7, 1, 0.7],
                      scale: [0.9, 1, 0.9],
                    }}
                    transition={{
                      duration: 2.5,
                      delay: node.index * 0.12 + node.layer * 0.08,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.08),_transparent_70%)]" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {NETWORK_ARCHITECTURE.map((layer, idx) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + idx * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur"
            >
              <div
                className="mx-auto mb-3 h-3 w-3 rounded-full shadow-lg"
                style={{ backgroundColor: layer.color, boxShadow: `0 0 16px ${layer.color}` }}
              />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/90">{layer.label}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/60">{layer.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur">
          <div className="grid gap-4 text-sm text-white/80 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Training cadence</p>
              <p className="mt-2 leading-relaxed">
                The Python backend runs 8,000 PPO timesteps on startup, then fine-tunes for 2,000 steps each time you adjust policy weights (balancing speed with responsiveness).
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/80">Real-time inference</p>
              <p className="mt-2 leading-relaxed">
                Every optimizer tick feeds fresh telemetry through this network, produces a fleet action distribution, and returns metrics to the dashboard in under 300ms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
