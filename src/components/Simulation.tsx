"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AVEnv, SimplePolicyLearner } from "@/lib/rl";
import type { Scenario } from "@/lib/rl";
import { SCENARIOS } from "@/lib/scenarios";
import { CityGrid } from "./CityGrid";
import { KPIs } from "./KPIs";
import { Controls } from "./Controls";

export function Simulation() {
  const [fleetSize, setFleetSize] = useState(80);
  const [speed, setSpeed] = useState(10); // ticks/sec
  const [running, setRunning] = useState(false);

  const [tick, setTick] = useState(0);
  const [servedRides, setServedRides] = useState(0);
  const [unmetDemand, setUnmetDemand] = useState(0);
  const [energyCost, setEnergyCost] = useState(0);
  const [reward, setReward] = useState(0);
  const [energyPrice, setEnergyPrice] = useState(0);

  const envRef = useRef<AVEnv | null>(null);
  const learnerRef = useRef<SimplePolicyLearner | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastStepRef = useRef<number>(0);

  const scenarioNames = Object.keys(SCENARIOS);
  const [scenarioName, setScenarioName] = useState<string>(scenarioNames[0]);
  const scenario = useMemo<Scenario>(() => SCENARIOS[scenarioName](), [scenarioName]);

  const reset = () => {
    envRef.current = new AVEnv({ scenario, fleetSize });
    learnerRef.current = new SimplePolicyLearner(envRef.current);
    const st = envRef.current.getState();
    setTick(st.tick);
    setEnergyPrice(st.energyPriceEurPerKwh);
    setServedRides(0);
    setUnmetDemand(0);
    setEnergyCost(0);
    setReward(0);
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fleetSize, scenario.name]);

  const loop = (t: number) => {
    const desiredMs = 1000 / Math.max(1, speed);
    if (!lastStepRef.current) lastStepRef.current = t;
    if (t - lastStepRef.current >= desiredMs) {
      lastStepRef.current = t;
      if (learnerRef.current && envRef.current) {
        const res = learnerRef.current.step();
        setTick(res.nextState.tick);
        setEnergyPrice(res.nextState.energyPriceEurPerKwh);
        setServedRides((s) => s + res.info.servedRides);
        setUnmetDemand((s) => s + res.info.unmetDemand);
        setEnergyCost((s) => s + res.info.energyCost);
        setReward((s) => s + res.reward);
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed]);

  const state = envRef.current?.getState();

  return (
    <div className="flex flex-col gap-6">
      <Controls
        running={running}
        onStart={() => setRunning(true)}
        onPause={() => setRunning(false)}
        onStep={() => {
          if (!learnerRef.current || !envRef.current) return;
          const res = learnerRef.current.step();
          setTick(res.nextState.tick);
          setEnergyPrice(res.nextState.energyPriceEurPerKwh);
          setServedRides((s) => s + res.info.servedRides);
          setUnmetDemand((s) => s + res.info.unmetDemand);
          setEnergyCost((s) => s + res.info.energyCost);
          setReward((s) => s + res.reward);
        }}
        onReset={() => {
          setRunning(false);
          reset();
        }}
        speed={speed}
        onSpeedChange={setSpeed}
        fleetSize={fleetSize}
        onFleetChange={setFleetSize}
        scenarios={scenarioNames}
        scenario={scenarioName}
        onScenarioChange={(s) => {
          setScenarioName(s);
          setRunning(false);
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {state && (
            <CityGrid
              cells={scenario.cells.map(({ id, x, y, population }) => ({ id, x, y, population }))}
              demandByCell={state.demandByCell}
              vehicles={state.vehicles}
            />
          )}
        </div>
        <div>
          <KPIs
            tick={tick}
            servedRides={servedRides}
            unmetDemand={unmetDemand}
            energyCost={energyCost}
            reward={reward}
            energyPrice={energyPrice}
          />
        </div>
      </div>
    </div>
  );
}


