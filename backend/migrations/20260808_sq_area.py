"""Add the sq_area column to the projects table.

SQLite/libSQL has no native ALTER for adding an optional column without a
constant default, so the column is added as nullable TEXT and then backfilled
with dummy built-up area values for the existing projects.

Run from the backend directory:

    python migrations/20260808_sq_area.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

DUMMY_SQ_AREA: dict[int, str] = {
    1: "2,950 sq ft",
    2: "3,100 sq ft",
    3: "1,850 sq ft",
    4: "1,240 sq ft",
    5: "2,400 sq ft",
    6: "8,500 sq ft",
    7: "2,600 sq ft",
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    exists = pipeline(
        [
            "SELECT name FROM pragma_table_info('projects') WHERE name = 'sq_area'"
        ]
    )[0]
    if rows(exists):
        print("sq_area column already exists; skipping ALTER")
    else:
        pipeline(["ALTER TABLE projects ADD COLUMN sq_area TEXT DEFAULT NULL"])
        print("ALTER TABLE projects ADD COLUMN sq_area TEXT DEFAULT NULL")

    result = pipeline(["SELECT id FROM projects ORDER BY id"])[0]
    project_ids = [row[0] for row in rows(result)]
    updated = 0
    for project_id in project_ids:
        sql = "UPDATE projects SET sq_area = ? WHERE id = ?"
        sq_area = DUMMY_SQ_AREA.get(project_id)
        pipeline([sql], [[sq_area, project_id]])
        updated += 1
        print(f"project {project_id}: sq_area = {sq_area}")

    verify = pipeline(
        ["SELECT id, project_name, sq_area FROM projects ORDER BY id"]
    )[0]
    for row in rows(verify):
        print(f"VERIFY project {row[0]} ({row[1]}): sq_area={row[2]}")


if __name__ == "__main__":
    main()