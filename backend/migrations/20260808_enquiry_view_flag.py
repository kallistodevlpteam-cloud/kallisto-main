"""Add the viewed flag to enquiry_details.

New enquiries are stored with view = 0 (false). The list shows a green
indicator for unviewed enquiries; opening an enquiry sets it to 1.

Booleans are stored as INTEGER 0/1 following the existing schema
convention. The default is a constant, so ALTER TABLE is allowed.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_enquiry_view_flag.py
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
        (
            "ALTER TABLE enquiry_details ADD COLUMN view INTEGER "
            "NOT NULL DEFAULT 0"
        ),
    ]
    for statement in statements:
        try:
            pipeline([statement])
            print(f"OK: {statement.strip()[:70]}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    try:
        result = pipeline(
            [
                "SELECT name, type, dflt_value FROM pragma_table_info('enquiry_details') "
                "WHERE name = 'view'"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()