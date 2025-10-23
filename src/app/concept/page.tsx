export default function ConceptPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Concept: AV Orchestrator for Sustainable Cities</h1>
      <p className="mt-3 text-neutral-700 dark:text-neutral-300">
        The concept is a city-scale orchestration layer for autonomous vehicles that balances three goals: serve people fairly, cut energy and emissions, and use streets more efficiently. The system forecasts demand block by block and coordinates AV fleets to reposition, pool rides, and charge when electricity is cleaner and cheaper.
      </p>
      <p className="mt-4 text-neutral-700 dark:text-neutral-300">
        The Ingolstadt pilot blends TomTom Route Monitoring telemetry with a deck.gl twin. Corridors with high delay glow, charging depots pulse according to the agent, and the map gives a live, grounded view of where to stage AVs, calm traffic, and shift energy loads.
      </p>
      <ul className="mt-6 list-disc pl-6 text-neutral-700 dark:text-neutral-300">
        <li><span className="font-semibold">Demand aware operations</span>: Predict and balance supply where and when it is needed so streets are not oversupplied.</li>
        <li><span className="font-semibold">Energy conscious charging</span>: Shift charging to off peak, high renewable periods and avoid local grid stress.</li>
        <li><span className="font-semibold">Ride pooling by default</span>: Incentivize pooled trips and micro transit to cut vehicle kilometres traveled.</li>
        <li><span className="font-semibold">Public transport first</span>: Integrate with transit for first and last mile links rather than replacing buses or rail.</li>
      </ul>
      <p className="mt-6 text-neutral-700 dark:text-neutral-300">
        The live demo renders the concept on top of a real city map. Corridors glow according to latency, the heatmap encodes accumulated demand, and depot markers highlight charging capacity. The orchestration agent publishes plain language recommendations so teams know how many AVs to stage per corridor and when to synchronise with the grid.
      </p>
      <section id="why-ingolstadt" className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-xl font-semibold">Why Ingolstadt?</h2>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
          Ingolstadt is a tidy test bed: commuter demand spikes around Audi Forum, Klinikum, and Nordbahnhof, while industrial depots already host megawatt-scale charging. That mix forces the orchestrator to juggle commuters, night shift logistics, and tight grid constraints.
        </p>
        <p className="mt-3 text-neutral-700 dark:text-neutral-300">
          TomTom monitoring feeds the live map, the reinforcement learning loop proposes deployment moves, and the orchestration layer turns those moves into explainable KPIs. The city becomes a proving ground for the playbook we can reuse across other European regions once the pilot lands.
        </p>
      </section>
    </main>
  );
}


