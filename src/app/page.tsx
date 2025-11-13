"use client";

import { Hero } from "@/components/Hero";
import { HomeDashboard } from "@/components/HomeDashboard";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SafetyStory } from "@/components/SafetyStory";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Hero scrollTargetId="safety" />
        <div id="safety" className="mt-16 sm:mt-24">
          <SafetyStory />
        </div>
        <div id="dashboard" className="mt-16 sm:mt-24">
          <HomeDashboard revealed />
        </div>
      </main>
    </>
  );
}
 