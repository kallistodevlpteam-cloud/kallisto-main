"""Temporary test seed: insert one new enq project with view=false.

Creates a fresh project and its enquiry_details row so the viewed-flag
lifecycle can be verified end to end:

    1. GET  /api/projects?character=enq   -> view = 0 (false)
    2. POST /api/projects/<id>/view       -> sets view = 1
    3. GET  /api/projects?character=enq   -> view = 1 (true)

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_test_view_flag.py
"""

from __future__ import annotations

import sys
import uuid
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
            "INSERT INTO projects (project_name, project_type, building_type, "
            "project_character, created_at, updated_at) "
            "VALUES ('Test View Flag Villa', 'Residential', 'Villa', 'enq', "
            "strftime('%s','now'), strftime('%s','now'))"
        ),
    ]
    try:
        result = pipeline(statements)[0]
        project_id = result.get("last_insert_rowid")
        print(f"OK: inserted project id={project_id}")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: inserting project: {str(error)[:120]}")
        return

    try:
        enq_id = str(uuid.uuid4())
        pipeline(
            [
                "INSERT INTO enquiry_details (enq_id, project_id, view) "
                "VALUES (?, ?, 0)"
            ],
            [[enq_id, project_id]],
        )
        print(f"OK: inserted enquiry_details enq_id={enq_id} view=0")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: inserting enquiry_details: {str(error)[:120]}")
        return

    try:
        result = pipeline(
            [
                "SELECT e.enq_id, e.project_id, e.view, p.project_name "
                "FROM enquiry_details e JOIN projects p ON p.id = e.project_id "
                "WHERE e.project_id = ?"
            ],
            [[project_id]],
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()