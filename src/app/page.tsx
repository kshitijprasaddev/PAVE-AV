"use client";

import { useState } from "react";
import { HomeDashboard } from "@/components/HomeDashboard";
import { IntroSequence } from "@/components/IntroSequence";

export default function Home() {
  const [revealed, setRevealed] = useState(false);

  return (
    <main className="relative mx-auto max-w-7xl px-6 pb-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] -translate-y-10 rounded-b-[80px] bg-gradient-to-b from-emerald-400/15 via-transparent to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-40 z-0 h-[320px] rounded-[80px] bg-gradient-to-r from-sky-400/10 via-transparent to-violet-400/10 blur-3xl" />
      <IntroSequence onReveal={() => setRevealed(true)} revealed={revealed} />
      <div id="dashboard" className={`transition-all duration-700 ${revealed ? "mt-16 opacity-100" : "mt-[60vh] opacity-0"}`}>
        <HomeDashboard revealed={revealed} />
      </div>
    </main>
  );
}
