"use client";

import { Hero } from "@/components/Hero";
import { HomeDashboard } from "@/components/HomeDashboard";

export default function Home() {
  return (
    <main className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[360px] -translate-y-10 rounded-b-[80px] bg-gradient-to-b from-emerald-400/15 via-transparent to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-40 z-0 h-[280px] rounded-[80px] bg-gradient-to-r from-sky-400/10 via-transparent to-violet-400/10 blur-3xl" />
      <Hero scrollTargetId="dashboard" />
      <div id="dashboard" className="mt-14 transition-all duration-700 sm:mt-20">
        <HomeDashboard revealed />
      </div>
    </main>
  );
}
