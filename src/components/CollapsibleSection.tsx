"use client";

import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
};

export function CollapsibleSection({ title, subtitle, children, defaultOpen = false, badge }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/60 to-neutral-950/80 shadow-xl backdrop-blur">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/5 sm:p-8"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white sm:text-2xl">{title}</h3>
            {badge && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
          )}
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="h-6 w-6 flex-shrink-0 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div className="border-t border-white/10 p-6 sm:p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

