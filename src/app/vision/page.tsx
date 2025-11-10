import { Reveal, RevealStack } from "@/components/Reveal";

export default function VisionPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Reveal>
        <h1 className="text-2xl font-bold">Vision</h1>
      </Reveal>
      <RevealStack
        initialDelay={0.08}
        items={[
          <p className="mt-4 text-neutral-700 dark:text-neutral-300" key="p1">
            Autonomous vehicles matter to me because they touch two huge numbers that refuse to leave my head: 1.35 million lives and more than 70 billion hours. Every year around the world, 1.35 million people die in road crashes and human drivers collectively spend tens of billions of hours sitting behind a steering wheel. If we build safe and reliable autonomous systems, we can save many of those lives and give back countless hours to families, workers, and cities.
          </p>,
          <p className="mt-4 text-neutral-700 dark:text-neutral-300" key="p2">
            I am studying Autonomous Vehicle Engineering at Technische Hochschule Ingolstadt because I want to contribute to that shift. The technology is not just about fancy shuttles; it is about infrastructure, energy, and public trust. Cities do not yet have an autonomous backbone. There is no shared playbook for where to stage vehicles, how to connect them to the grid, or how to explain the benefits to local councils. That gap is what motivated this project.
          </p>,
          <p className="mt-4 text-neutral-700 dark:text-neutral-300" key="p3">
            When I think about state or city deployments, the strongest use case is better public transport coverage. Autonomous fleets can offer reliable, electric, self-reliant rides that feel like an extension of transit rather than another ride-hailing app. To get there we need to answer a practical question for every city leader: where should we deploy first, and what does the payoff look like?
          </p>,
          <p className="mt-4 text-neutral-700 dark:text-neutral-300" key="p4">
            Ingolstadt is a good testbed. It mixes dense commuter flows, heavy industry, and existing charging hubs. By mapping TomTom corridor data onto a live twin, we can point to the exact places where autonomous shuttles cut delay, save energy, and reduce stress on the grid. Once a city can see those hotspots and the supporting metrics, it becomes much easier to plan the infrastructure rollout (micro depots, charge windows, and vehicle-to-grid buffers).
          </p>,
          <p className="mt-4 text-neutral-700 dark:text-neutral-300" key="p5">
            The longer-term vision is simple: build a repeatable process that any European city can borrow. Feed live telemetry into the twin, let the reinforcement learning policy suggest deployments, check the results against energy and equity targets, and hand local leaders a plan that is ready for real proposals. That is the kind of work that keeps me excited about autonomous mobility and why I am committed to keep pushing this prototype forward.
          </p>,
        ]}
      />
    </main>
  );
}

