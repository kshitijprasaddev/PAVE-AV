from __future__ import annotations

import math
from typing import Dict, Tuple

import gymnasium as gym
import numpy as np
from gymnasium import spaces


PolicyWeights = Dict[str, float]


class IngolstadtEnv(gym.Env):
    """Coarse Ingolstadt mobility grid used for the RL demo.

    Observation encodes the normalised demand and supply for each corridor plus
    the current energy price and hour of day. The single discrete action selects
    a corridor to receive extra fleet capacity during this minute.
    """

    metadata = {"render_modes": []}

    def __init__(self, seed: int | None = None) -> None:
        super().__init__()
        self.n_corridors = 12
        self.max_steps = 180
        self.base_fleet = 8.0
        self.extra_supply = 5.0
        self.random = np.random.default_rng(seed)

        self.action_space = spaces.Discrete(self.n_corridors)
        obs_length = self.n_corridors * 2 + 3
        self.observation_space = spaces.Box(low=0.0, high=1.0, shape=(obs_length,), dtype=np.float32)

        self.weights: PolicyWeights = {
            "demand_weight": 1.1,
            "energy_weight": 0.25,
            "charge_threshold": 0.35,
            "exploration": 0.08,
        }

        self.set_fleet_scale(120)
        self._episode_reset()

    def set_fleet_scale(self, fleet_size: float) -> None:
        scale = max(60.0, float(fleet_size)) / (self.n_corridors * 6.0)
        self.base_fleet = np.clip(6.0 * scale, 4.0, 14.0)
        self.extra_supply = max(3.0, self.base_fleet * 0.75)

    def seed(self, seed: int | None = None) -> None:
        self.random = np.random.default_rng(seed)

    def set_reward_weights(self, weights: PolicyWeights) -> None:
        self.weights.update(weights)

    def _episode_reset(self) -> None:
        self.step_count = 0
        self.hour = 6
        self.demand = self._initial_demand()
        self.supply = np.full(self.n_corridors, self.base_fleet, dtype=np.float32)
        self.battery = np.full(self.n_corridors, 1.0, dtype=np.float32)
        self.total_served = 0.0
        self.total_unmet = 0.0
        self.total_energy = 0.0
        self.timeline = np.zeros((24, 3), dtype=np.float32)

    def reset(self, *, seed: int | None = None, options: dict | None = None) -> Tuple[np.ndarray, dict]:
        if seed is not None:
            self.seed(seed)
        self._episode_reset()
        return self._get_obs(), {}

    def step(self, action: int):
        action = int(action)
        demand_weight = self.weights["demand_weight"]
        energy_weight = self.weights["energy_weight"]
        exploration = self.weights["exploration"]

        energy_price = self._energy_price()

        boosted_supply = self.supply.copy()
        boosted_supply[action] += self.extra_supply

        served = np.minimum(self.demand, boosted_supply)
        unmet = np.maximum(self.demand - boosted_supply, 0.0)

        energy_cost = (boosted_supply * energy_price * 0.085).sum()
        served_total = served.sum()
        unmet_total = unmet.sum()

        self.total_served += served_total
        self.total_unmet += unmet_total
        self.total_energy += energy_cost

        self.timeline[self.hour, 0] += served_total
        self.timeline[self.hour, 1] += served_total + unmet_total
        self.timeline[self.hour, 2] += 1

        wait_penalty = unmet_total * 0.6
        reward = demand_weight * served_total - energy_weight * energy_cost - wait_penalty

        # Update fleet state
        depletion = served / np.maximum(self.base_fleet, 1.0)
        self.battery = np.clip(self.battery - depletion * 0.3, 0.0, 1.0)

        charge_rate = np.where(self.battery < self.weights["charge_threshold"], 0.25 + exploration * 0.5, 0.12)
        self.battery = np.clip(self.battery + charge_rate, 0.0, 1.0)
        self.supply = np.clip(self.base_fleet * self.battery * (1.0 + exploration * 0.8), 1.5, self.base_fleet * 1.8)

        self.demand = self._next_demand(action)

        self.step_count += 1
        self.hour = (self.hour + 1) % 24
        terminated = self.step_count >= self.max_steps
        truncated = False

        obs = self._get_obs()
        info = {
            "served": float(served_total),
            "unmet": float(unmet_total),
            "energy_cost": float(energy_cost),
            "hour": self.hour,
            "energy_price": float(energy_price),
        }
        return obs, float(reward), terminated, truncated, info

    # Observation helpers
    def _get_obs(self) -> np.ndarray:
        demand_norm = (self.demand / 30.0).clip(0.0, 1.0)
        supply_norm = (self.supply / (self.base_fleet * 1.8)).clip(0.0, 1.0)
        energy_price = self._energy_price() / 0.6
        hour_norm = self.hour / 24.0
        battery_avg = float(self.battery.mean())
        return np.concatenate([demand_norm, supply_norm, [energy_price, hour_norm, battery_avg]]).astype(np.float32)

    def _initial_demand(self) -> np.ndarray:
        base = np.linspace(0.5, 1.0, self.n_corridors)
        noise = self.random.normal(0, 0.05, size=self.n_corridors)
        return (base + noise) * 15.0

    def _next_demand(self, action: int) -> np.ndarray:
        hour_factor = 1.2 if 7 <= self.hour <= 9 or 16 <= self.hour <= 19 else 0.75 if 1 <= self.hour <= 4 else 1.0
        trend = 0.6 * self.demand + 0.4 * self._initial_demand()
        pressure = np.zeros(self.n_corridors)
        pressure[action] += 4.0
        exploration_boost = self.weights["exploration"] * self.random.normal(0, 1.5, size=self.n_corridors)
        demand = trend + pressure + exploration_boost
        demand = np.clip(demand * hour_factor, 5.0, 45.0)
        return demand

    def _energy_price(self) -> float:
        base = 0.22 + 0.08 * math.sin((self.hour / 24.0) * math.tau)
        return float(np.clip(base, 0.12, 0.6))

    def episode_metrics(self) -> Dict[str, float]:
        return {
            "served": float(self.total_served),
            "unmet": float(self.total_unmet),
            "energy_cost": float(self.total_energy),
        }


