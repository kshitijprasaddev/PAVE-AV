import { Reveal } from "@/components/Reveal";

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Reveal>
        <h1 className="text-2xl font-bold">How it works</h1>
      </Reveal>
      <Reveal delay={0.12}>
        <h2 className="mt-6 text-lg font-semibold">System overview</h2>
      </Reveal>
      <Reveal delay={0.2}>
        <ol className="mt-3 list-decimal pl-6 text-neutral-700 dark:text-neutral-300">
          <li>
            <span className="font-semibold">City digital twin</span>: We stream TomTom Route Monitoring telemetry for key corridors (Audi Forum to Hauptbahnhof, Klinikum to Nordbahnhof) and fuse it with municipal charging assets.
          </li>
          <li>
            <span className="font-semibold">Demand inference</span>: Corridor delay, travel time variance, and land-use priors feed a demand surface rendered as 3D extrusions in deck.gl.
          </li>
          <li>
            <span className="font-semibold">Fleet agent</span>: A constrained heuristic assigns AV blocks to hotspots, guaranteeing minimum coverage and reserving capacity for first/last-mile connections.
          </li>
          <li>
            <span className="font-semibold">Energy co-optimisation</span>: Charging windows align with Stadtwerke load curves and rooftop solar peaks; the model recommends V2G buffer opportunities.
          </li>
        </ol>
      </Reveal>
      <Reveal delay={0.34}>
        <h2 className="mt-6 text-lg font-semibold">Reward design</h2>
      </Reveal>
      <Reveal delay={0.42}>
        <p className="mt-2 text-neutral-700 dark:text-neutral-300">
          The orchestrator balances served demand, delay reduction, energy cost, and neighbourhood equity. KPIs remain non-negative: we report reliability (0 to 100), energy per ride (kWh), grid stress (0 to 100), and a composite reward score. Human operators can trace each recommendation back to the data that triggered it.
        </p>
      </Reveal>
      <Reveal delay={0.5}>
        <h2 className="mt-6 text-lg font-semibold">From demo to deployment</h2>
      </Reveal>
      <Reveal delay={0.58}>
        <ul className="mt-3 list-disc pl-6 text-neutral-700 dark:text-neutral-300">
          <li>Extend corridor coverage with additional TomTom monitor IDs, micromobility feeds, and city sensors.</li>
          <li>Plug in grid signals (day-ahead prices, CO₂ intensity, feeder limits) for more granular charging optimisation.</li>
          <li>Layer in civic constraints: pedestrian zones, school buffers, accessible vehicle targets, and policy-defined service floors.</li>
          <li>Run city-in-the-loop pilots starting with Audi’s factory shuttle, then scale across public transport interchanges.</li>
        </ul>
      </Reveal>
    </main>
  );
}


