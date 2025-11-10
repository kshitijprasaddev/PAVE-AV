"use client";

import Link from "next/link";
import { motion } from "framer-motion";

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

  const links = [
    { href: "/vision", label: "Vision" },
    { href: "/concept", label: "Concept" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/rl-lab", label: "RL Lab" },
    { href: "/impact", label: "Impact" },
    { href: "/stakeholders", label: "Stakeholders" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-white transition hover:text-emerald-400"
        >
          AV Orchestrator
        </Link>
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 text-sm text-neutral-300 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <button
            onClick={onRun}
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-500"
          >
            Run Optimization
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
