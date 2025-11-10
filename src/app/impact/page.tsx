import Image from "next/image";
import { Reveal, RevealStack } from "@/components/Reveal";

export default function ImpactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Reveal>
        <h1 className="text-2xl font-bold">Impact</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <figure className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 shadow-sm dark:border-neutral-800">
          <Image
            src="/media/av-roundabout.jpg"
            alt="Autonomous vehicles coordinating at a roundabout"
            width={1591}
            height={751}
            className="h-auto w-full object-cover"
          />
          <figcaption className="bg-neutral-50 px-4 py-2 text-sm text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
            Coordinated AV movements smooth conflict points and free capacity for buses and micro-mobility.
          </figcaption>
        </figure>
      </Reveal>
      <RevealStack
        initialDelay={0.18}
        items={[
          <div key="env">
            <h2 className="mt-6 text-lg font-semibold">Environmental</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              By shifting charging to cleaner, off-peak hours and prioritising pooled trips, the orchestrator can lower operational emissions and reduce vehicle-kilometres travelled. In the Ingolstadt twin, the recommended schedule cuts peak charging load by ~28% while sustaining service reliability above 80%, translating to more rides per kWh consumed.
            </p>
          </div>,
          <div key="soc">
            <h2 className="mt-6 text-lg font-semibold">Social</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              The system can enforce equity rules: minimum service levels in low-income districts, wheelchair-accessible vehicle targets, and geofenced slow zones around schools. Corridor severity scoring makes these trade-offs visible on the map, turning AVs into a public-good layer that complements buses and rail.
            </p>
          </div>,
          <div key="econ">
            <h2 className="mt-6 text-lg font-semibold">Economic</h2>
            <p className="mt-2 text-neutral-700 dark:text-neutral-300">
              Smart charging and pooling decrease cost per ride. Partnerships with public transport and energy utilities (for demand response or vehicle-to-grid pilots) can create new revenue while stabilising the grid. The orchestrator’s charging plan explicitly earmarks V2G capacity at GVZ Ingolstadt to monetise idle fleet energy.
            </p>
          </div>,
          <div key="watch">
            <h2 className="mt-6 text-lg font-semibold">What to watch in the demo</h2>
            <ul className="mt-2 list-disc pl-6 text-neutral-700 dark:text-neutral-300">
              <li>Hex extrusions rising/falling as corridor delay changes.</li>
              <li>Route colour shifting with live TomTom congestion ratios.</li>
              <li>Operational KPIs updating as the allocator rebalances fleet and charging windows.</li>
            </ul>
          </div>,
        ]}
      />
    </main>
  );
}


