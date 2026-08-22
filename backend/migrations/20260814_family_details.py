"""Create the family_details table and link client_details to it.

Each family_details row stores one client family with a UUID primary key,
the linked client (client_details.client_id), and a free-text description.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260814_family_details.py
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
        """
        CREATE TABLE IF NOT EXISTS family_details (
            family_id TEXT PRIMARY KEY,
            client_id TEXT REFERENCES client_details(client_id),
            description TEXT,
            created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        )
        """,
        "ALTER TABLE client_details ADD COLUMN family_id TEXT REFERENCES family_details(family_id)",
    ]

    for statement in statements:
        try:
            pipeline([statement])
            label = statement.strip().split("\n")[0].rstrip(",")
            print(f"OK: {label[:60]}…")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    try:
        result = pipeline(
            ["SELECT name FROM pragma_table_info('family_details') ORDER BY cid"]
        )[0]
        print(f"VERIFY family_details cols: {[row[0] for row in result.get('rows', [])]}")
        result = pipeline(
            ["SELECT name FROM pragma_table_info('client_details') ORDER BY cid"]
        )[0]
        print(f"VERIFY client_details cols: {[row[0] for row in result.get('rows', [])]}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()