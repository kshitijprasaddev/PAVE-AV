"use client";

import { Hero } from "@/components/Hero";
import { HomeDashboard } from "@/components/HomeDashboard";
import { ScrollProgress } from "@/components/ScrollProgress";
import { ImpactStory } from "@/components/ImpactStory";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main className="relative mx-auto max-w-7xl px-4 pb-32 sm:px-6">
        <Hero scrollTargetId="impact" />
        
        {/* Breathing room after hero */}
        <div className="h-24 sm:h-32" />
        
        <div id="impact" className="space-y-24 sm:space-y-32">
          <ImpactStory />
        </div>
        
        {/* Major section break */}
        <div className="h-32 sm:h-40" />
        
        <div id="dashboard">
          <HomeDashboard revealed />
        </div>
      </main>
    </>
  );
}
 