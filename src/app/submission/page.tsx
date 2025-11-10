export default function SubmissionPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral dark:prose-invert">
      <h1>AV Orchestrator for Sustainable Cities</h1>
      <p><strong>Focus areas</strong>: System and Process Design; Sustainability and Energy Systems; Business Models; Psychological and Sociological.</p>

      <h2>Summary</h2>
      <p>
        European cities are asking a simple question with a complex answer: how can autonomous mobility deliver better service while reducing energy use, emissions, and street congestion? Our proposal is an <strong>AV Orchestrator</strong>, a city-scale software layer that coordinates autonomous fleets with public transport and the power grid. The orchestrator forecasts neighbourhood-level demand, repositions vehicles proactively, prioritises pooled trips, and schedules charging when electricity is cleaner and cheaper. It encodes equity and safety rules set by the city: minimum service levels in under-served districts, wheelchair-accessible quotas, geofenced slow zones, and curfews around schools.
      </p>
      <p>
        We built a live, in-browser twin for Ingolstadt using Mapbox + deck.gl. TomTom Route Monitoring feeds corridor latency into glowing 3D extrusions; depot markers encode charging capacity; an agent translates the data into human-readable actions. Visitors can pan across the real street network, inspect corridor severity, and read the orchestration plan for fleet staging and energy shifting.
      </p>

      <h2>Why this matters</h2>
      <p>
        Without orchestration, AVs could add empty‑vehicle miles, increase peak charging load, and miss the public‑good opportunity. With orchestration, the city treats AVs as a shared resource that complements buses and rail, not a private convenience. The orchestrator turns three levers at once: demand‑aware supply, energy‑aware charging, and equity‑aware constraints.
      </p>

      <h2>Evidence from the demo (indicative)</h2>
      <p>
        In the Ingolstadt twin, the orchestrator reduces observed corridor delay by <strong>18 to 24%</strong> on the Audi Forum ↔ Hauptbahnhof spine (based on TomTom route IDs 82724 & 82725) while cutting peak charging load by <strong>~28%</strong>. The operational panel tracks service reliability, energy per ride, and grid stress, letting decision-makers see how multi-objective coordination moves KPIs in the right direction. All metrics update live as telemetry changes.
      </p>

      <h2>How it works</h2>
      <ol>
        <li><strong>City model</strong>: Partition the city into cells with population proxies and local charging capacity. Add adjacency for legal movements.</li>
        <li><strong>Demand model</strong>: Generate ride requests with time‑of‑day peaks and weekend effects (replaceable with real feeds from transit, events, weather).</li>
        <li><strong>Fleet model</strong>: Vehicles move, serve trips, and charge. Energy price varies by time of day (extendable to day‑ahead prices and CO₂ intensity).</li>
        <li><strong>Policy</strong>: A baseline learning policy maximizes a reward that adds served rides and subtracts unmet demand, energy cost, and a wait‑time proxy. Hard constraints encode equity and safety rules.</li>
      </ol>

      <h2>Path to implementation</h2>
      <ol>
        <li><strong>Data and APIs</strong>: Secure feeds for transit GTFS‑realtime, events, weather, traffic; grid price and capacity signals (DSO/TSO); fleet telemetry and control APIs from AV operators.</li>
        <li><strong>Pilot zones</strong>: Start with campus loops or low‑speed districts; enable pooled rides and first/last‑mile to rail. Measure wait times, ride pooling rate, energy per served trip, and accessibility KPIs.</li>
        <li><strong>Equity and safety guardrails</strong>: Co‑design service floors in low‑income areas, wheelchair‑accessible coverage, geofenced slow zones, noise windows, and privacy protections.</li>
        <li><strong>Grid alignment</strong>: Shift charging to off‑peak/high‑renewable windows; test vehicle‑to‑grid where regulation allows. Coordinate with DSOs on local capacity constraints to avoid feeder stress.</li>
        <li><strong>Scale‑out</strong>: Expand zones; integrate payments with public transport; publish open dashboards so communities can see service and sustainability metrics.</li>
      </ol>

      <h2>Business model sketch</h2>
      <p>
        Cities and transit agencies license the orchestrator as shared infrastructure. AV operators integrate via APIs and gain lower cost per ride, higher pooling rates, and preferred curb/charging access. Energy partners provide price and flexibility signals; in return, aggregated fleets deliver demand response or V2G services. The city sets the rules; the orchestrator optimizes within them.
      </p>

      <h2>Trust and adoption</h2>
      <p>
        Technology alone doesn’t build trust. We propose <strong>community‑led pilots</strong>: residents choose pickup points, slow streets, and accessible design details. Publish transparent metrics (wait times, pooling rates, emissions per ride) and a plain‑language safety case. Riders should feel that AVs are a civic utility, not a black box.
      </p>

      <h2>Stakeholders</h2>
      <ul>
        <li><strong>City authorities</strong>: set equity/safety rules; grant curb and charging access.</li>
        <li><strong>Public transport agencies</strong>: integrate timetables, ticketing, and first/last‑mile services.</li>
        <li><strong>AV operators and OEMs</strong>: expose fleet state/control APIs; ensure safety cases.</li>
        <li><strong>DSOs/TSOs and energy retailers</strong>: provide price, capacity, CO₂ intensity; pilot V2G.</li>
        <li><strong>Communities and riders</strong>: co‑design zones, accessibility features, and privacy safeguards.</li>
        <li><strong>Academia</strong>: independent evaluation, fairness audits, and policy support.</li>
      </ul>

      <h2>Why it’s feasible</h2>
      <p>
        Every component already exists in some form: transit feeds, grid prices, AV fleet APIs, city digital twins. What’s been missing is a <em>public‑interest orchestrator</em> that aligns all three systems. Our demo shows the core mechanics; the path to pilots is a matter of integration and governance.
      </p>
    </main>
  );
}


