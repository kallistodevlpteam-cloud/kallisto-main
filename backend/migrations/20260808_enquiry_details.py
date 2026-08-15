"""Create the enquiry_details table and link it to projects.

Each enquiry has a stable UUID (enq_id) and points at exactly one
project row (project_id). Existing enq-character projects are
backfilled so the linkage is present from the start.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_enquiry_details.py
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    statements = [
        """
        CREATE TABLE IF NOT EXISTS enquiry_details (
            enq_id     TEXT PRIMARY KEY,
            project_id INTEGER NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
            updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
        )
        """,
    ]
    for statement in statements:
        try:
            pipeline([statement])
            print(f"OK: {statement.strip().splitlines()[0].rstrip(',')}…")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    # Backfill: every existing enq project gets a generated UUID.
    try:
        result = pipeline(
            [
                "SELECT id FROM projects WHERE project_character = 'enq' "
                "ORDER BY id"
            ]
        )[0]
        project_ids = [row[0] for row in rows(result)]
    except Exception as error:  # noqa: BLE001
        print(f"ERR: listing enq projects: {str(error)[:120]}")
        return

    inserted = 0
    for project_id in project_ids:
        enq_id = str(uuid.uuid4())
        try:
            pipeline(
                [
                    "INSERT OR IGNORE INTO enquiry_details (enq_id, project_id) "
                    "VALUES (?, ?)"
                ],
                [[enq_id, project_id]],
            )
            inserted += 1
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: project {project_id}: {str(error)[:120]}")

    print(f"OK: backfilled {inserted}/{len(project_ids)} enquiry_details rows")

    try:
        result = pipeline(
            [
                "SELECT e.enq_id, e.project_id, p.project_name "
                "FROM enquiry_details e JOIN projects p ON p.id = e.project_id "
                "ORDER BY e.project_id"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()
