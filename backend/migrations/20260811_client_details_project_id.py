"""Add project_id to client_details and backfill it from project_clients.

Each client_details row represents the client linked to a project via
project_clients. Storing project_id on client_details makes the project
association readable without the join table.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260811_client_details_project_id.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    statements: list[str] = [
        "ALTER TABLE client_details ADD COLUMN project_id INTEGER DEFAULT NULL",
        (
            "UPDATE client_details SET project_id = ("
            "  SELECT pc.project_id FROM project_clients pc "
            "  WHERE pc.client_id = client_details.client_id LIMIT 1"
            ")"
        ),
    ]
    for statement in statements:
        try:
            pipeline([statement])
            print(f"OK: {statement.strip()[:80]}…")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    try:
        result = pipeline(
            [
                "SELECT client_id, client_name, project_id "
                "FROM client_details ORDER BY client_id"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()