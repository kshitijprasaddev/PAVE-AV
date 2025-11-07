from __future__ import annotations

from typing import List

import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel
from stable_baselines3 import PPO

from ingolstadt_env import IngolstadtEnv


class PolicyParams(BaseModel):
    demand_weight: float
    energy_weight: float
    charge_threshold: float
    exploration: float


class SimulationRequest(BaseModel):
    params: PolicyParams
    steps: int = 180
    fleet_size: int = 120
    capture_steps: bool = False
    retrain: bool = False


app = FastAPI(title="Ingolstadt RL Service")

env = IngolstadtEnv()
model = PPO("MlpPolicy", env, verbose=0, seed=42)
model.learn(total_timesteps=8000)


def run_episode(request: SimulationRequest):
    env.set_reward_weights(request.params.dict())
    env.set_fleet_scale(request.fleet_size)

    if request.retrain:
        model.set_env(env)
        model.learn(total_timesteps=2000, reset_num_timesteps=False)

    obs, _ = env.reset()
    total_reward = 0.0
    steps_log: List[dict] = []

    for step in range(request.steps):
        action, _state = model.predict(obs, deterministic=True)
        obs, reward, terminated, truncated, info = env.step(action)
        total_reward += reward

        if request.capture_steps:
            notes = []
            if info["unmet"] > 10:
                notes.append("Unmet demand surge")
            if info["energy_cost"] > 2.0:
                notes.append("Energy spike")
            steps_log.append(
                {
                    "index": step,
                    "hour": info["hour"],
                    "minuteOfDay": int(info["hour"] * 60 + (step % 60)),
                    "served": round(info["served"], 2),
                    "unmet": round(info["unmet"], 2),
                    "energyCost": round(info["energy_cost"], 3),
                    "reward": round(reward, 3),
                    "actionMix": {
                        "move": 1,
                        "charge": 1 if info["energy_cost"] > 0.5 else 0,
                        "idle": 0,
                    },
                    "notes": notes,
                }
            )

        if terminated or truncated:
            obs, _ = env.reset()

    metrics = env.episode_metrics()
    timeline = []
    for hour, row in enumerate(env.timeline):
        count = max(row[2], 1.0)
        demand = (row[1] / count).item()
        supply = (row[0] / count).item()
        timeline.append(
            {
                "hour": hour,
                "demand": round(demand, 2),
                "supply": round(supply, 2),
            }
        )

    return {
        "served": round(metrics["served"], 2),
        "unmet": round(metrics["unmet"], 2),
        "energyCost": round(metrics["energy_cost"], 3),
        "rewardTotal": round(total_reward, 3),
        "rewardAvg": round(total_reward / max(request.steps, 1), 3),
        "timeline": timeline,
        "params": {
            "demandWeight": request.params.demand_weight,
            "energyWeight": request.params.energy_weight,
            "chargeThreshold": request.params.charge_threshold,
            "exploration": request.params.exploration,
        },
        "steps": steps_log if request.capture_steps else None,
    }


@app.post("/simulate")
def simulate(request: SimulationRequest):
    metrics = run_episode(request)
    return {"metrics": metrics}


@app.get("/")
def healthcheck():
    return {"status": "ok", "model_timesteps": int(model.num_timesteps)}


