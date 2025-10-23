"use client";

import { useState } from "react";
import { HomeDashboard } from "@/components/HomeDashboard";
import { IntroSequence } from "@/components/IntroSequence";

export default function Home() {
  const [revealed, setRevealed] = useState(false);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16">
      <IntroSequence onReveal={() => setRevealed(true)} revealed={revealed} />
      <div id="dashboard" className={`transition-all duration-700 ${revealed ? "mt-16 opacity-100" : "mt-[60vh] opacity-0"}`}>
        <HomeDashboard revealed={revealed} />
      </div>
    </main>
  );
}
