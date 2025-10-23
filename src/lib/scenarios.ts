import { Scenario, CityCell } from "@/lib/rl";

function makeGrid(width: number, height: number, popFn: (x: number, y: number) => number, chargeFn?: (x: number, y: number) => number) {
  const cells: CityCell[] = [];
  let id = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({
        id: id++,
        x,
        y,
        population: Math.max(50, Math.round(popFn(x, y))),
        chargingCapacityKw: Math.max(5, Math.round((chargeFn?.(x, y) ?? 11))),
      });
    }
  }
  const neighbors: Record<number, number[]> = {};
  for (const c of cells) {
    const n: number[] = [];
    const idx = (xx: number, yy: number) => cells.find((k) => k.x === xx && k.y === yy)?.id;
    const candidates = [
      [c.x - 1, c.y],
      [c.x + 1, c.y],
      [c.x, c.y - 1],
      [c.x, c.y + 1],
    ];
    for (const [xx, yy] of candidates) {
      const id = idx(xx, yy);
      if (id != null) n.push(id);
    }
    neighbors[c.id] = n;
  }
  return { cells, neighbors };
}

export function scenarioIngolstadt(): Scenario {
  const width = 6, height = 6;
  const centerX = (width - 1) / 2, centerY = (height - 1) / 2;
  const { cells, neighbors } = makeGrid(
    width,
    height,
    (x, y) => 120 + 250 * (1 - (Math.abs(x - centerX) + Math.abs(y - centerY)) / (width + height)) + 40 * Math.random(),
    () => 11 + 11 * Math.random()
  );
  const baseEnergyPrice = 0.25;
  const demandFn = (tick: number, cell: CityCell) => {
    const hour = Math.floor((tick % 1440) / 60);
    const peak = hour >= 7 && hour <= 9 ? 1.4 : hour >= 16 && hour <= 19 ? 1.6 : 1.0;
    const weekend = ((tick / 1440) | 0) % 7 >= 5 ? 0.8 : 1.0;
    const noise = 0.7 + Math.random() * 0.6;
    return (cell.population / 200) * peak * weekend * noise;
  };
  return { name: "Ingolstadt", cells, neighbors, baseEnergyPrice, demandFn };
}

export function scenarioOslo(): Scenario {
  const width = 7, height = 5;
  const { cells, neighbors } = makeGrid(
    width,
    height,
    (x, y) => 100 + 220 * Math.exp(-((x - 2.5) ** 2 + (y - 2) ** 2) / 6) + 30 * Math.random(),
    (x, y) => (y <= 1 ? 22 : 11) // more fast chargers near waterfront corridor
  );
  const baseEnergyPrice = 0.20;
  const demandFn = (tick: number, cell: CityCell) => {
    const hour = Math.floor((tick % 1440) / 60);
    const peak = hour >= 7 && hour <= 9 ? 1.5 : hour >= 15 && hour <= 18 ? 1.5 : 0.9;
    const renewablesBoost = hour >= 1 && hour <= 5 ? 0.9 : 1.0; // proxy
    const noise = 0.7 + Math.random() * 0.6;
    return (cell.population / 210) * peak * renewablesBoost * noise;
  };
  return { name: "Oslo", cells, neighbors, baseEnergyPrice, demandFn };
}

export function scenarioBrussels(): Scenario {
  const width = 8, height = 6;
  const { cells, neighbors } = makeGrid(
    width,
    height,
    (x, y) => 140 + 260 * Math.max(0, 1 - Math.abs(x - 3) / 4) + 20 * Math.cos(y) + 40 * Math.random(),
    (x, y) => (x % 2 === 0 ? 16 : 8) + (y % 3 === 0 ? 2 : 0)
  );
  const baseEnergyPrice = 0.27;
  const demandFn = (tick: number, cell: CityCell) => {
    const hour = Math.floor((tick % 1440) / 60);
    const institutional = hour >= 8 && hour <= 17 ? 1.3 : 0.9;
    const weekend = ((tick / 1440) | 0) % 7 >= 5 ? 0.9 : 1.0;
    const noise = 0.7 + Math.random() * 0.6;
    return (cell.population / 220) * institutional * weekend * noise;
  };
  return { name: "Brussels", cells, neighbors, baseEnergyPrice, demandFn };
}

export const SCENARIOS: Record<string, () => Scenario> = {
  Ingolstadt: scenarioIngolstadt,
  Oslo: scenarioOslo,
  Brussels: scenarioBrussels,
};


