"use client";

import { motion } from "framer-motion";

const layerConfig = [
  {
    label: "Telemetry inputs",
    nodes: 4,
    description: "Corridor delay, depot load, rider demand, weather",
    color: "rgba(74, 222, 128, 0.5)",
  },
  {
    label: "Policy cores",
    nodes: 6,
    description: "Two PPO hidden stacks sampling fleet actions",
    color: "rgba(56, 189, 248, 0.45)",
  },
  {
    label: "Action heads",
    nodes: 3,
    description: "Rebalance, charge, hold decisions per corridor",
    color: "rgba(192, 132, 252, 0.55)",
  },
];

const viewBoxWidth = 640;
const viewBoxHeight = 360;

function toViewBoxX(columnIndex: number, totalColumns: number) {
  if (totalColumns === 1) return viewBoxWidth / 2;
  const gutter = 80;
  if (totalColumns === 2) {
    return columnIndex === 0 ? gutter : viewBoxWidth - gutter;
  }
  const spacing = (viewBoxWidth - gutter * 2) / (totalColumns - 1);
  return gutter + columnIndex * spacing;
}

function toViewBoxY(nodeIndex: number, totalNodes: number) {
  if (totalNodes === 1) return viewBoxHeight / 2;
  const verticalPadding = 40;
  const spacing = (viewBoxHeight - verticalPadding * 2) / (totalNodes - 1);
  return verticalPadding + nodeIndex * spacing;
}

type Connection = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function buildConnections() {
  const edges: Connection[] = [];
  layerConfig.forEach((layer, layerIndex) => {
    if (layerIndex === layerConfig.length - 1) return;
    const nextLayer = layerConfig[layerIndex + 1];
    for (let i = 0; i < layer.nodes; i += 1) {
      for (let j = 0; j < nextLayer.nodes; j += 1) {
        edges.push({
          x1: toViewBoxX(layerIndex, layerConfig.length - 1),
          y1: toViewBoxY(i, layer.nodes),
          x2: toViewBoxX(layerIndex + 1, layerConfig.length - 1),
          y2: toViewBoxY(j, nextLayer.nodes),
        });
      }
    }
  });
  return edges;
}

export function NeuralNetworkViz() {
  const connections = buildConnections();
  const pulses = Array.from({ length: 4 }, (_, idx) => idx);

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-neutral-200/70 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black px-5 pb-6 pt-8 shadow-xl shadow-neutral-900/25 backdrop-blur dark:border-neutral-800/70">
      <div className="pointer-events-none absolute -left-28 top-14 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-20%] top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sky-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.42em] text-neutral-500 dark:text-neutral-400">Policy network</p>
          <h3 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            How the reinforcement learner transforms telemetry
          </h3>
        </div>
        <p className="max-w-sm text-sm text-neutral-400 sm:text-neutral-300">
          This is the PPO stack inside the Python service. Telemetry feeds the hidden layers, the policy proposes reroute,
          charge, or hold moves, and each pulse mirrors the optimiser streaming updates back into the twin.
        </p>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-white/5 bg-neutral-950/80 p-5 shadow-inner shadow-black/40">
        <motion.div
          className="absolute inset-x-0 top-6 h-1 rounded-full bg-gradient-to-r from-emerald-400/60 via-sky-400/60 to-violet-400/60 blur"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="h-[280px] w-full sm:h-[320px]"
          role="presentation"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          {connections.map((conn, index) => (
            <motion.line
              key={`edge-${index}`}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="url(#pulseGradient)"
              strokeWidth={6}
              strokeLinecap="round"
              initial={{ strokeOpacity: 0.12, pathLength: 0.4 }}
              animate={{ strokeOpacity: [0.12, 0.65, 0.12], pathLength: [0.4, 1, 0.4] }}
              transition={{ duration: 3, delay: (index % 8) * 0.14, repeat: Infinity, repeatType: "mirror" }}
              strokeDasharray="12 18"
              strokeDashoffset={index % 2 === 0 ? 0 : 10}
            />
          ))}

          {pulses.map((pulseIndex) => (
            <motion.circle
              key={`pulse-${pulseIndex}`}
              cx={-40}
              cy={pulseIndex * 90 + 60}
              r={10}
              fill="url(#pulseGradient)"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                cx: [toViewBoxX(0, layerConfig.length - 1), toViewBoxX(layerConfig.length - 1, layerConfig.length - 1) + 20],
                opacity: [0.2, 0.8, 0],
              }}
              transition={{ duration: 4 + pulseIndex * 0.4, repeat: Infinity, ease: "easeInOut", delay: pulseIndex * 0.8 }}
            />
          ))}

          {layerConfig.map((layer, layerIndex) => (
            <g key={layer.label}>
              {Array.from({ length: layer.nodes }).map((_, nodeIndex) => {
                const cx = toViewBoxX(layerIndex, layerConfig.length - 1);
                const cy = toViewBoxY(nodeIndex, layer.nodes);
                return (
                  <motion.circle
                    key={`${layer.label}-${nodeIndex}`}
                    cx={cx}
                    cy={cy}
                    r={34}
                    fill={layer.color}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={2}
                    initial={{ scale: 0.94, opacity: 0.7 }}
                    animate={{ scale: [0.94, 1.1, 0.94], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, delay: (nodeIndex + layerIndex) * 0.18, repeat: Infinity, repeatType: "mirror" }}
                  />
                );
              })}
            </g>
          ))}

          <defs>
            <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(74, 222, 128, 0.85)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.85)" />
              <stop offset="100%" stopColor="rgba(192, 132, 252, 0.85)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.28),_transparent_65%)]" />
        <motion.div
          className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80 backdrop-blur"
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          optimiser tick
        </motion.div>
      </div>

      <div className="relative z-10 grid gap-3 sm:grid-cols-3">
        {layerConfig.map((layer) => (
          <div
            key={layer.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white shadow-sm backdrop-blur"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">{layer.label}</p>
            <p className="mt-2 text-sm text-white/90">{layer.description}</p>
          </div>
        ))}
      </div>

      <div className="relative z-10 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/85 shadow-sm backdrop-blur sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">Training loop</p>
          <p className="mt-2">
            Each optimisation call streams telemetry into the PPO policy, rolls out 180 simulation steps, and feeds the best
            parameters back into the twin. The glowing pulses are synced with the same cadence.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200/70">Mobile friendly</p>
          <p className="mt-2">
            Shrinks gracefully on phones—swipe across the layers to follow how data, policy, and actions link together without
            leaving the main metrics in view.
          </p>
        </div>
      </div>
    </div>
  );
}


