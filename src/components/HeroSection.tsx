"use client";

import React from "react";

export function HeroSection() {
  const onRun = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("run-optimization"));
    const target = document.getElementById("dashboard");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
      <div
        className="relative h-[320px] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.55)), url('/runkai-zhang-Uf4Lx8kosc4-unsplash.jpg')",
        }}
      >
        <div className="absolute inset-0 flex flex-col items-start justify-end gap-4 p-8 text-white">
          <h1 className="text-3xl font-bold tracking-tight">Ingolstadt AV Orchestrator</h1>
          <p className="max-w-3xl text-sm opacity-90">
            A planning twin that turns live corridor telemetry into council‑ready AV deployment plans. Run the optimization to see which routes benefit most, how many AVs to stage, and how charging shifts cut costs and CO₂.
          </p>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={onRun} className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
              Run Optimization
            </button>
            <a
              href="/concept"
              className="rounded-md border border-white/30 px-4 py-2 hover:bg-white/10"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


