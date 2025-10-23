export default function StakeholdersPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Stakeholders</h1>
      <ul className="mt-4 list-disc pl-6 text-neutral-700 dark:text-neutral-300">
        <li><span className="font-semibold">City authorities</span>: set equity and safety constraints; grant curb and charging access.</li>
        <li><span className="font-semibold">Public transport agencies</span>: integrate timetables, ticketing, and first/last‑mile services.</li>
        <li><span className="font-semibold">AV operators and OEMs</span>: expose APIs for fleet state and controls; ensure safety cases.</li>
        <li><span className="font-semibold">DSOs/TSOs and energy retailers</span>: provide price, capacity, and CO₂ intensity signals; pilot V2G.</li>
        <li><span className="font-semibold">Communities and riders</span>: co‑design service zones, accessibility features, and privacy safeguards.</li>
        <li><span className="font-semibold">Academia</span>: method validation, independent evaluation, and fairness audits.</li>
      </ul>
    </main>
  );
}


