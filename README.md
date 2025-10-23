# AV Orchestrator for Sustainable Cities

A lightweight in-browser demo showing how autonomous vehicle fleets can be orchestrated to serve demand while minimizing energy cost and emissions. Built with Next.js (App Router), TypeScript, and Tailwind.

## Quick start (local)

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Environment variables

Create `.env.local` with the following:

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.···   # provided Mapbox token
TOMTOM_ROUTE_MONITOR_KEY=···      # TomTom Route Monitor API key
```

Without the TomTom key the app falls back to bundled sample telemetry.

## Deploy to Vercel

1. Create a new Git repository and push this folder.
2. In Vercel, import the repo. Framework Preset: Next.js.
3. Build command: `next build` (default). Output: `.next` (default).
4. Deploy. Your demo will be live in ~1 minute.

## What the demo shows

- Mapbox + deck.gl 3D twin of Ingolstadt with corridor demand extrusions
- Live TomTom route monitoring integration for Audi Forum ↔ Hauptbahnhof & Klinikum ↔ Nordbahnhof
- Agent-based recommendations for fleet deployment, charging windows, and energy KPIs
- Operational panel with service reliability, energy per ride, grid stress index, and demand timeline

## Project structure

- `src/lib/rl.ts`: Environment, reward, and a simple learning loop
- `src/lib/orchestrator.ts`: Heuristic planner producing fleet & charging recommendations
- `src/lib/scenarios.ts`: City presets (Ingolstadt, Oslo, Brussels)
- `src/hooks/useIngolstadtRoutes.ts`: Client hook fetching TomTom data & orchestration plan
- `src/components/IngolstadtMap.tsx`: deck.gl + Mapbox 3D twin
- `src/components/OperationalPanel.tsx`: KPI dashboard & recommendations
- `src/components/HomeDashboard.tsx`: Client wrapper stitching data, map, KPIs
- `src/app/*`: Pages (home with orchestration twin, concept, how-it-works, impact, stakeholders, submission)

## Notes

- This is a didactic, self-contained demo (no server, no data backend).
- The RL is a minimal stub to illustrate policy effects and KPIs.
- Extension ideas: real demand feeds, grid CO₂ signals, ride-pooling, equity constraints, V2G.
