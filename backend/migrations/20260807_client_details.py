"""Create the client_details table and link project_clients to it.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260807_client_details.py
"""

from __future__ import annotations

import os
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
        CREATE TABLE IF NOT EXISTS client_details (
            client_id TEXT PRIMARY KEY,
            client_name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            company TEXT,
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        )
        """,
        "ALTER TABLE project_clients ADD COLUMN client_id TEXT REFERENCES client_details(client_id)",
    ]

    for statement in statements:
        try:
            pipeline([statement])
            label = statement.strip().split("\n")[0].rstrip(",")
            print(f"OK: {label[:60]}…")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")


if __name__ == "__main__":
    main()
