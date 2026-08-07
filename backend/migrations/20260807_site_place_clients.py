"""Add a place column to project_site and seed client/place data for enq projects.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260807_site_place_clients.py
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# project_id -> (client_name, place)
SEED = [
    (2, "Rahul Menon", "Kochi"),
    (3, "Priya Sharma", "Bengaluru"),
    (4, "Arun Kumar", "Mumbai"),
    (5, "Meera Iyer", "Trivandrum"),
    (6, "Dev Nair", "Hyderabad"),
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(["ALTER TABLE project_site ADD COLUMN place TEXT"])
        print("OK: ALTER TABLE project_site ADD COLUMN place TEXT")
    except Exception as error:  # noqa: BLE001
        print(f"SKIP: {str(error)[:120]}")

    statements: list[str] = []
    args_list: list[list[object]] = []
    for project_id, client_name, place in SEED:
        client_id = str(uuid.uuid4())
        statements.append(
            "INSERT INTO client_details (client_id, client_name) VALUES (?, ?)"
        )
        args_list.append([client_id, client_name])
        statements.append("DELETE FROM project_clients WHERE project_id = ?")
        args_list.append([project_id])
        statements.append(
            "INSERT INTO project_clients (project_id, client_id) VALUES (?, ?)"
        )
        args_list.append([project_id, client_id])
        statements.append("DELETE FROM project_site WHERE project_id = ?")
        args_list.append([project_id])
        statements.append("INSERT INTO project_site (project_id, place) VALUES (?, ?)")
        args_list.append([project_id, place])

    try:
        pipeline(statements, args_list)
        print(f"OK: seeded {len(SEED)} clients and places")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: {str(error)[:200]}")


if __name__ == "__main__":
    main()