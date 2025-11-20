"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { href: "/how-it-works", label: "How it works" },
    { href: "/rl-lab", label: "RL Lab" },
    { href: "/stakeholders", label: "Stakeholders" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-white transition hover:text-emerald-400"
        >
          AV Orchestrator
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Desktop nav */}
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

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 text-sm text-neutral-300 lg:hidden"
            aria-label="Toggle menu"
          >
            <span>Menu</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          <button
            onClick={onRun}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 sm:px-5"
          >
            Run Optimization
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/5 bg-black/80 backdrop-blur-xl lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-col gap-3">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
