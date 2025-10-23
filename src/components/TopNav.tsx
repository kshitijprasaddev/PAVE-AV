"use client";

import Link from "next/link";

export function TopNav() {
  const onRun = () => {
    if (window.location.pathname !== "/") {
      try {
        window.localStorage.setItem("amo:run", "1");
      } catch (err) {
        console.warn("could not set run flag", err);
      }
      window.location.href = "/#dashboard";
      return;
    }
    window.dispatchEvent(new CustomEvent("run-optimization"));
    const el = document.getElementById("dashboard");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/40 dark:border-neutral-800/60 dark:bg-neutral-950/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          AV Orchestrator
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <a className="hover:underline underline-offset-4" href="/vision">Vision</a>
          <a className="hover:underline underline-offset-4" href="/concept">Concept</a>
          <a className="hover:underline underline-offset-4" href="/how-it-works">How it works</a>
          <a className="hover:underline underline-offset-4" href="/impact">Impact</a>
          <a className="hover:underline underline-offset-4" href="/stakeholders">Stakeholders</a>
          <button onClick={onRun} className="rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white transition hover:bg-emerald-700">
            Run Optimization
          </button>
        </div>
      </div>
    </div>
  );
}


