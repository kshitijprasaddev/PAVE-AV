# RL Backend Service

This lightweight FastAPI service exposes a Stable Baselines3 agent trained on a custom Ingolstadt reinforcement-learning environment. The Next.js frontend calls this service to generate episode metrics when you tweak policy sliders.

## Getting Started

```bash
cd python/rl_service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Set `RL_BACKEND_URL=http://127.0.0.1:8001` in your `.env.local` so the Next.js API can reach the Python service.

## Endpoints

`POST /simulate`

```json
{
  "params": {
    "demand_weight": 1.2,
    "energy_weight": 0.35,
    "charge_threshold": 0.4,
    "exploration": 0.12
  },
  "steps": 180,
  "fleet_size": 120,
  "capture_steps": true,
  "retrain": false
}
```

The response mirrors the TypeScript `EpisodeMetrics` type, so the UI can drop it straight into charts and cards.

## Architecture Notes

- `ingolstadt_env.py` recreates a coarse 6×6 city grid as a Gymnasium environment.
- `main.py` trains a PPO agent on startup and fine-tunes it when you request `retrain=true`.
- The service keeps metrics such as served rides, unmet demand, and energy spend so the front-end charts will react strongly to parameter changes.

