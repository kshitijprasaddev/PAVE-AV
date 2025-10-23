export default function ImpactPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Impact</h1>
      <h2 className="mt-6 text-lg font-semibold">Environmental</h2>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">
        By shifting charging to cleaner, off-peak hours and prioritising pooled trips, the orchestrator can lower operational emissions and reduce vehicle-kilometres travelled. In the Ingolstadt twin, the recommended schedule cuts peak charging load by ~28% while sustaining service reliability above 80%, translating to more rides per kWh consumed.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Social</h2>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">
        The system can enforce equity rules: minimum service levels in low-income districts, wheelchair-accessible vehicle targets, and geofenced slow zones around schools. Corridor severity scoring makes these trade-offs visible on the map, turning AVs into a public-good layer that complements buses and rail.
      </p>
      <h2 className="mt-6 text-lg font-semibold">Economic</h2>
      <p className="mt-2 text-neutral-700 dark:text-neutral-300">
        Smart charging and pooling decrease cost per ride. Partnerships with public transport and energy utilities (for demand response or vehicle-to-grid pilots) can create new revenue while stabilising the grid. The orchestrator’s charging plan explicitly earmarks V2G capacity at GVZ Ingolstadt to monetise idle fleet energy.
      </p>
      <h2 className="mt-6 text-lg font-semibold">What to watch in the demo</h2>
      <ul className="mt-2 list-disc pl-6 text-neutral-700 dark:text-neutral-300">
        <li>Hex extrusions rising/falling as corridor delay changes.</li>
        <li>Route colour shifting with live TomTom congestion ratios.</li>
        <li>Operational KPIs updating as the allocator rebalances fleet and charging windows.</li>
      </ul>
    </main>
  );
}


