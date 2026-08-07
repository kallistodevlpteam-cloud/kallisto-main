"""Create service_provider_details, project_providers and their links.

Links:
  - project_providers.SP_id    -> service_provider_details.SP_id
  - projects.provider_id       -> project_providers.provider_id

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260807_service_providers.py
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
        CREATE TABLE IF NOT EXISTS service_provider_details (
            SP_id TEXT PRIMARY KEY,
            provider_name TEXT NOT NULL,
            type TEXT,
            phone TEXT,
            email TEXT,
            company TEXT,
            specialization TEXT,
            notes TEXT,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS project_providers (
            provider_id TEXT PRIMARY KEY,
            SP_id TEXT REFERENCES service_provider_details(SP_id),
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        )
        """,
        "ALTER TABLE projects ADD COLUMN provider_id TEXT REFERENCES project_providers(provider_id)",
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