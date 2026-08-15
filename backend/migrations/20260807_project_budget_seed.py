"""Seed estimated_overall_budget values into project_budget for enq projects.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260807_project_budget_seed.py

Dummy values are development/test data so the enquiries list can render
backend-sourced budgets while real client data is not yet captured.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# project_id -> (estimated_overall_budget, budget_flexibility)
# Values in whole rupees; flexibility: 0 = Fixed, 1 = Flexible.
SEED = [
    (2, 25_000_000, 1),  # Sunrise Villa
    (3, 11_000_000, 0),  # Lakeview Residence
    (4, 45_000_000, 1),  # Harbor Heights
    (5, 18_500_000, 0),  # Stoneacre Bungalow
    (6, 7_200_000, 1),   # Veranda Court
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    statements: list[str] = []
    args_list: list[list[object]] = []
    for project_id, budget, flexibility in SEED:
        statements.append(
            "INSERT INTO project_budget (project_id, estimated_overall_budget, "
            "budget_flexibility) VALUES (?, ?, ?)"
        )
        args_list.append([project_id, budget, flexibility])

    try:
        pipeline(statements, args_list)
        print(f"OK: seeded estimated_overall_budget for {len(SEED)} projects")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: {str(error)[:200]}")


if __name__ == "__main__":
    main()
