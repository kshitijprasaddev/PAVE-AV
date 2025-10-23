"use client";

import React from "react";

export function KPIs(props: {
  tick: number;
  servedRides: number;
  unmetDemand: number;
  energyCost: number;
  reward: number;
  energyPrice: number;
}) {
  const { tick, servedRides, unmetDemand, energyCost, reward, energyPrice } = props;
  const items = [
    { label: "Tick", value: tick.toString() },
    { label: "Served rides", value: servedRides.toFixed(0) },
    { label: "Unmet demand", value: unmetDemand.toFixed(0) },
    { label: "Energy cost (EUR)", value: energyCost.toFixed(2) },
    { label: "Reward", value: reward.toFixed(2) },
    { label: "Energy price (EUR/kWh)", value: energyPrice.toFixed(3) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((i) => (
        <div key={i.label} className="rounded-md border border-neutral-200 p-3 text-sm dark:border-neutral-800">
          <div className="text-neutral-500 dark:text-neutral-400">{i.label}</div>
          <div className="text-lg font-semibold">{i.value}</div>
        </div>
      ))}
    </div>
  );
}


