"""Add family member fields to the family_details table.

Each family_details row then holds one client family member: name, age,
job, phone, relation to the linked client, and a member image URL.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260814_family_details_members.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

COLUMNS = [
    "ADD COLUMN name TEXT",
    "ADD COLUMN age INTEGER",
    "ADD COLUMN job TEXT",
    "ADD COLUMN phone TEXT",
    "ADD COLUMN relation TEXT",
    "ADD COLUMN family_member_img_url TEXT",
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    for column in COLUMNS:
        statement = f"ALTER TABLE family_details {column}"
        try:
            pipeline([statement])
            print(f"OK: {statement}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    try:
        result = pipeline(
            ["SELECT name FROM pragma_table_info('family_details') ORDER BY cid"]
        )[0]
        print(f"VERIFY family_details cols: {[row[0] for row in result.get('rows', [])]}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()