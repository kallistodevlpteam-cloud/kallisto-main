"""Convert project_budget value columns from TEXT to INTEGER.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260807_project_budget_integer.py
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

    statements = [
        """
        CREATE TABLE project_budget_new (
            project_id INTEGER,
            estimated_overall_budget INTEGER,
            budget_flexibility INTEGER,
            budget_priority INTEGER,
            willing_to_spend_more INTEGER,
            areas_to_save INTEGER,
            interior_included INTEGER,
            financing_arranged INTEGER
        )
        """,
        "INSERT INTO project_budget_new SELECT * FROM project_budget",
        "DROP TABLE project_budget",
        "ALTER TABLE project_budget_new RENAME TO project_budget",
    ]

    for statement in statements:
        try:
            pipeline([statement])
            print(f"OK: {statement.strip()[:60]}…")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")


if __name__ == "__main__":
    main()