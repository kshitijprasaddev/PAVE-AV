// Simple in-browser RL scaffold for AV fleet orchestration.
// This is a lightweight environment to demo concepts: demand, grid cells, fleet, reward.

export type CityCell = {
  id: number;
  x: number;
  y: number;
  population: number; // proxy for demand potential
  chargingCapacityKw: number; // local grid capacity
};

export type FleetVehicle = {
  id: number;
  cellId: number;
  batteryKwh: number;
  maxBatteryKwh: number;
  occupied: boolean;
};

export type EnvState = {
  tick: number;
  demandByCell: Record<number, number>; // ride requests per tick
  energyPriceEurPerKwh: number;
  vehicles: FleetVehicle[];
};

export type Action = {
  // For each vehicle: either reposition to neighbor cell, charge, or stay
  vehicleId: number;
  type: "move" | "charge" | "idle";
  targetCellId?: number;
  chargeKw?: number;
};

export type StepResult = {
  nextState: EnvState;
  reward: number; // weighted mix of served rides, energy cost, wait time proxy
  info: {
    servedRides: number;
    unmetDemand: number;
    energyCost: number;
    avgWaitProxy: number;
  };
};

export type Scenario = {
  name: string;
  cells: CityCell[];
  neighbors: Record<number, number[]>; // adjacency list by cellId
  baseEnergyPrice: number; // eur/kwh
  demandFn: (tick: number, cell: CityCell) => number; // stochastic demand generator
};

export type RewardWeights = {
  servedRideReward: number; // + for serving a ride
  unmetDemandPenalty: number; // - for unmet demand
  energyCostPenalty: number; // - for energy cost
  waitTimePenalty: number; // - for proxy wait
};

export class AVEnv {
  private scenario: Scenario;
  private weights: RewardWeights;
  private state: EnvState;
  private maxVehiclesPerCell: number;

  constructor(params: {
    scenario: Scenario;
    fleetSize: number;
    initialBatteryKwh?: number;
    weights?: Partial<RewardWeights>;
    maxVehiclesPerCell?: number;
  }) {
    const {
      scenario,
      fleetSize,
      initialBatteryKwh = 40,
      weights,
      maxVehiclesPerCell = 10,
    } = params;
    this.scenario = scenario;
    this.weights = {
      servedRideReward: 1.0,
      unmetDemandPenalty: 1.5,
      energyCostPenalty: 0.8,
      waitTimePenalty: 0.2,
      ...weights,
    };
    this.maxVehiclesPerCell = maxVehiclesPerCell;

    // initialize vehicles evenly across highest population cells
    const sortedCells = [...scenario.cells].sort(
      (a, b) => b.population - a.population
    );
    const vehicles: FleetVehicle[] = Array.from({ length: fleetSize }).map(
      (_, i) => {
        const cell = sortedCells[i % sortedCells.length];
        return {
          id: i,
          cellId: cell.id,
          batteryKwh: initialBatteryKwh,
          maxBatteryKwh: 60,
          occupied: false,
        } as FleetVehicle;
      }
    );

    this.state = {
      tick: 0,
      demandByCell: {},
      energyPriceEurPerKwh: scenario.baseEnergyPrice,
      vehicles,
    };
    this.refreshDemand();
  }

  getState(): EnvState {
    return JSON.parse(JSON.stringify(this.state));
  }

  getNeighbors(cellId: number): number[] {
    return [...(this.scenario.neighbors[cellId] ?? [])];
  }

  private refreshDemand() {
    const demand: Record<number, number> = {};
    for (const cell of this.scenario.cells) {
      demand[cell.id] = Math.max(
        0,
        Math.round(this.scenario.demandFn(this.state.tick, cell))
      );
    }
    // energy price can vary with a simple daily sinusoid
    const dayPhase = (this.state.tick % 1440) / 1440; // minutes in day
    const price =
      this.scenario.baseEnergyPrice * (0.8 + 0.4 * Math.sin(2 * Math.PI * dayPhase));
    this.state.demandByCell = demand;
    this.state.energyPriceEurPerKwh = Math.max(0.05, price);
  }

  step(actions: Action[]): StepResult {
    // apply actions
    const vehiclesById: Record<number, FleetVehicle> = {};
    for (const v of this.state.vehicles) vehiclesById[v.id] = { ...v };

    // movement and charging
    for (const action of actions) {
      const vehicle = vehiclesById[action.vehicleId];
      if (!vehicle) continue;
      if (action.type === "move" && action.targetCellId != null) {
        const neighbors = this.scenario.neighbors[vehicle.cellId] || [];
        if (neighbors.includes(action.targetCellId) && vehicle.batteryKwh >= 0.5) {
          vehicle.cellId = action.targetCellId;
          vehicle.batteryKwh = Math.max(0, vehicle.batteryKwh - 0.5); // energy to move
        }
      } else if (action.type === "charge") {
        const cell = this.scenario.cells.find((c) => c.id === vehicle.cellId);
        const chargeKw = Math.min(action.chargeKw ?? 5, cell?.chargingCapacityKw ?? 5);
        // 1 tick ~ 1 minute; chargeKw * (1/60) kWh per tick
        const added = (chargeKw / 60) * 1.0;
        vehicle.batteryKwh = Math.min(vehicle.maxBatteryKwh, vehicle.batteryKwh + added);
      }
    }

    // serve demand greedily per cell by available vehicles and battery
    let servedRides = 0;
    let unmetDemand = 0;
    let energyCost = 0;
    let waitProxy = 0;

    const vehiclesByCell: Record<number, FleetVehicle[]> = {};
    for (const v of Object.values(vehiclesById)) {
      vehiclesByCell[v.cellId] ??= [];
      vehiclesByCell[v.cellId].push(v);
    }

    for (const cell of this.scenario.cells) {
      const demand = this.state.demandByCell[cell.id] ?? 0;
      const available = (vehiclesByCell[cell.id] ?? []).filter((v) => v.batteryKwh >= 1);
      const served = Math.min(demand, available.length);
      servedRides += served;
      unmetDemand += demand - served;
      waitProxy += Math.max(0, demand - served) / (demand + 1); // normalized proxy
      for (let i = 0; i < served; i++) {
        const v = available[i];
        v.batteryKwh = Math.max(0, v.batteryKwh - 1.0); // energy per trip
      }
      // charging cost proxy: any vehicle that charged this tick paid energy price
      // Approximate by difference between new and old battery after charging, accounted earlier.
    }

    // Approximate charging energy used this step
    const prevVehicles = this.state.vehicles;
    for (const v of Object.values(vehiclesById)) {
      const prev = prevVehicles.find((p) => p.id === v.id)!;
      const delta = Math.max(0, v.batteryKwh - prev.batteryKwh);
      energyCost += delta * this.state.energyPriceEurPerKwh;
    }

    // compute reward
    const rawReward =
      this.weights.servedRideReward * servedRides -
      this.weights.unmetDemandPenalty * unmetDemand -
      this.weights.energyCostPenalty * energyCost -
      this.weights.waitTimePenalty * waitProxy;
    const reward = Number(Math.max(0, rawReward + 8).toFixed(4));

    // finalize next state
    this.state = {
      tick: this.state.tick + 1,
      demandByCell: this.state.demandByCell,
      energyPriceEurPerKwh: this.state.energyPriceEurPerKwh,
      vehicles: Object.values(vehiclesById),
    };
    this.refreshDemand();

    return {
      nextState: this.getState(),
      reward,
      info: {
        servedRides,
        unmetDemand,
        energyCost: Number(energyCost.toFixed(4)),
        avgWaitProxy: Number(waitProxy.toFixed(4)),
      },
    };
  }
}

// Baseline heuristic policy: move vehicles toward higher demand density and charge off-peak
export function heuristicPolicy(env: AVEnv): Action[] {
  const state = env.getState();
  const actions: Action[] = [];
  const hour = Math.floor((state.tick % 1440) / 60);
  const offPeak = hour >= 0 && hour < 6; // cheap charging proxy

  for (const v of state.vehicles) {
    const localDemand = state.demandByCell[v.cellId] ?? 0;
    if (offPeak && v.batteryKwh < v.maxBatteryKwh * 0.9) {
      actions.push({ vehicleId: v.id, type: "charge", chargeKw: 11 });
      continue;
    }
    if (v.batteryKwh < 5) {
      actions.push({ vehicleId: v.id, type: "charge", chargeKw: 7 });
      continue;
    }
    // try move to neighbor with higher demand per vehicle ratio
    const neighbors = env.getNeighbors(v.cellId);
    const score = (cellId: number) => {
      const demand = state.demandByCell[cellId] ?? 0;
      const vehiclesHere = state.vehicles.filter((x) => x.cellId === cellId).length + 1;
      return demand / vehiclesHere;
    };
    const bestNeighbor = [v.cellId, ...neighbors].sort((a, b) => score(b) - score(a))[0];
    if (bestNeighbor !== v.cellId) {
      actions.push({ vehicleId: v.id, type: "move", targetCellId: bestNeighbor });
    } else if (localDemand === 0) {
      actions.push({ vehicleId: v.id, type: "move", targetCellId: neighbors[0] ?? v.cellId });
    } else {
      actions.push({ vehicleId: v.id, type: "idle" });
    }
  }
  return actions;
}

// Tiny policy-gradient-like stub for demo (not a full RL library)
export class SimplePolicyLearner {
  private env: AVEnv;
  private baselineReward = 0;
  constructor(env: AVEnv) {
    this.env = env;
  }

  step(): StepResult {
    const actions = heuristicPolicy(this.env);
    const result = this.env.step(actions);
    // pretend to update baseline toward observed reward (for viz only)
    this.baselineReward = 0.9 * this.baselineReward + 0.1 * result.reward;
    return result;
  }

  getBaselineReward(): number {
    return this.baselineReward;
  }
}

// Example scenario factory
export function makeEuropeanCityScenario(name = "Ingolstadt"): Scenario {
  const width = 6;
  const height = 6;
  let id = 0;
  const cells: CityCell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerBias = 1 - (Math.abs(x - width / 2) + Math.abs(y - height / 2)) / (width + height);
      cells.push({
        id: id++,
        x,
        y,
        population: Math.max(100, Math.round(300 * centerBias + 50 * Math.random())),
        chargingCapacityKw: 11 + Math.round(11 * Math.random()),
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
  const baseEnergyPrice = 0.25; // EUR/kWh
  const demandFn = (tick: number, cell: CityCell) => {
    const hour = Math.floor((tick % 1440) / 60);
    const peak = hour >= 7 && hour <= 9 ? 1.4 : hour >= 16 && hour <= 19 ? 1.6 : 1.0;
    const weekend = ((tick / 1440) | 0) % 7 >= 5 ? 0.8 : 1.0;
    const noise = 0.7 + Math.random() * 0.6;
    const popFactor = cell.population / 200;
    return popFactor * peak * weekend * noise;
  };
  return { name, cells, neighbors, baseEnergyPrice, demandFn };
}


