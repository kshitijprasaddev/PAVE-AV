"use client";

import Image from "next/image";
import { useCallback } from "react";
import { Reveal, RevealStack } from "@/components/Reveal";

type HeroProps = {
  scrollTargetId?: string;
};

const heroStats = [
  { label: "Reliability uplift", value: "+18%", detail: "Average gain versus legacy bus schedules" },
  { label: "Energy saved", value: "22%", detail: "Fewer peak-tariff charges across the fleet" },
  { label: "Fewer vehicles", value: "-31", detail: "Route redesign lets AVs replace peak buses" },
] as const;

const heroGallery = [
  {
    src: "/media/av-intersection.jpg",
    alt: "Autonomous shuttles negotiating a connected intersection",
    caption: "Intersections become choreographed lanes once telemetry feeds the orchestrator.",
  },
  {
    src: "/media/av-fleet.jpg",
    alt: "Autonomous fleet coverage illustrated across a busy avenue",
    caption: "Halos highlight how the learner balances hotspots with standby vehicles.",
  },
  {
    src: "/media/av-roundabout.jpg",
    alt: "Autonomous vehicles coordinating at a roundabout",
    caption: "Roundabouts calm when AVs share intent—grid stress drops alongside delay.",
  },
] as const;

export function Hero({ scrollTargetId = "dashboard" }: HeroProps) {
  const scrollToTarget = useCallback(() => {
    const target = document.getElementById(scrollTargetId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [scrollTargetId]);

  const handleLaunch = useCallback(() => {
    window.dispatchEvent(new CustomEvent("run-optimization"));
    scrollToTarget();
  }, [scrollToTarget]);

  const handleExplore = useCallback(() => {
    scrollToTarget();
  }, [scrollToTarget]);

  const handleRLLab = useCallback(() => {
    window.location.href = "/rl-lab";
  }, []);

  return (
    <section className="relative z-10 mt-12 flex flex-col gap-10 rounded-[32px] border border-neutral-200 bg-white/85 px-6 py-14 shadow-[0_40px_120px_-60px_rgba(16,24,40,0.6)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80 dark:shadow-[0_40px_120px_-60px_rgba(15,23,42,0.8)] sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10%] top-10 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="flex flex-col gap-6">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.42em] text-neutral-500 dark:text-neutral-400">Autonomous city twin</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="text-3xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-4xl">
              Ingolstadt orchestrator: explainable reinforcement learning for city corridors
            </h1>
          </Reveal>
          <RevealStack
            initialDelay={0.14}
            items={[
              <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base" key="intro">
                The homepage now drops you straight into the experience: live city telemetry, a reinforcement learner tuning in the background,
                and graphics that make the strategy obvious on any screen. No gimmicks—just the knobs you can turn and the proof that they work.
              </p>,
            ]}
          />
          <Reveal delay={0.24}>
            <div className="grid gap-3 rounded-3xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 sm:grid-cols-3">
              {heroStats.map((stat, index) => (
                <Reveal key={stat.label} delay={0.04 * index} className="rounded-2xl border border-neutral-200/70 bg-white/80 p-4 dark:border-neutral-700 dark:bg-neutral-900/70">
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">{stat.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">{stat.value}</div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{stat.detail}</p>
                </Reveal>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.34} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleLaunch}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              Run the optimizer now
            </button>
            <button
              onClick={handleExplore}
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold text-neutral-700 transition hover:-translate-y-0.5 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-200 dark:hover:border-neutral-500"
            >
              Scroll to launch
            </button>
            <button
              onClick={handleRLLab}
              className="inline-flex items-center justify-center rounded-full border border-transparent px-7 py-3 text-sm font-semibold text-emerald-700 hover:-translate-y-0.5 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              Explore the RL lab
            </button>
          </Reveal>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal className="col-span-2">
            <figure className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-800/10 shadow-lg shadow-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:shadow-neutral-900/40">
              <Image
                src="/media/av-corridor.jpg"
                alt="Autonomous vehicles cruising through a connected corridor in Ingolstadt"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 90vw, 540px"
                priority
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-transparent px-5 pb-4 pt-16 text-sm text-white">
                Live telemetry shows how the orchestrator stages AVs along Ingolstadt’s busiest corridor.
              </figcaption>
            </figure>
          </Reveal>
          {heroGallery.map((image, index) => (
            <Reveal key={image.src} delay={0.1 * (index + 1)}>
              <figure className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-neutral-200/80 bg-neutral-800/10 shadow-lg shadow-neutral-900/20 dark:border-neutral-700 dark:bg-neutral-900/60 dark:shadow-neutral-900/40">
                <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="260px" />
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-transparent px-4 pb-3 pt-10 text-[11px] text-white">
                  {image.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
