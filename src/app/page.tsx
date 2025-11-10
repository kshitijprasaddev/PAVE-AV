"use client";

import { Hero } from "@/components/Hero";
import { HomeDashboard } from "@/components/HomeDashboard";
import { ScrollProgress } from "@/components/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Hero scrollTargetId="dashboard" />
        <div id="dashboard" className="mt-14 transition-all duration-700 sm:mt-20">
          <HomeDashboard revealed />
        </div>
      </main>
    </>
  );
}
 