"""Add a boolean status column to requirement_items.

status = 1 (true) marks a client-confirmed requirement (shown as
"confirmed"); status = 0 (false) marks an AI-derived requirement (shown
as "AI-Derived"). Existing dummy rows are backfilled to confirmed, with a
few clearly AI-enhanced rows marked as derived for demonstration.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260814_requirement_items_status.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# item_value -> status 0 (AI-derived) for existing dummy rows
AI_DERIVED_ITEMS = [
    "2 Executive Cabins",
    "Glass acoustic partitions",
    "Commercial carpet flooring",
    "5kW Rooftop solar PV & rainwater harvesting",
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(["ALTER TABLE requirement_items ADD COLUMN status INTEGER"])
        print("OK: ALTER TABLE requirement_items ADD COLUMN status INTEGER")
    except Exception as error:  # noqa: BLE001
        print(f"SKIP: {str(error)[:120]}")

    statements: list[str] = []
    args_list: list[list[object]] = []
    statements.append("UPDATE requirement_items SET status = 1 WHERE status IS NULL")
    args_list.append([])
    for item_value in AI_DERIVED_ITEMS:
        statements.append("UPDATE requirement_items SET status = 0 WHERE item_value = ?")
        args_list.append([item_value])
    try:
        pipeline(statements, args_list)
        print(f"OK: backfilled status for {len(statements)} statements")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: {str(error)[:200]}")

    try:
        result = pipeline(
            ["SELECT status, COUNT(*) FROM requirement_items GROUP BY status"]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()