"use client";

import { useState } from "react";

export function InfoPopover({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        aria-label={`Explain ${title}`}
        onClick={() => setOpen((o) => !o)}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-300 text-[11px] leading-none text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900"
      >
        i
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-md border border-neutral-200 bg-white p-3 text-xs shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mb-1 font-medium">{title}</div>
          <div className="text-neutral-600 dark:text-neutral-300">{children}</div>
        </div>
      )}
    </div>
  );
}


