"""Link project_budget to projects via a project_id foreign key.

The table currently has a bare project_id INTEGER with no REFERENCES
clause. It is rebuilt with the FK constraint (ON DELETE CASCADE) in a
single pipeline call: the PRAGMA foreign_keys = OFF persists only within
that one call (libSQL HTTP pipeline = one connection), so the DROP TABLE
cannot cascade-delete rows from linked tables.

Run from the backend directory:

    python migrations/20260808_project_budget_fk.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

CREATE_PROJECT_BUDGET_NEW = """
CREATE TABLE project_budget_new (
    project_id             INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    estimated_overall_budget INTEGER,
    budget_flexibility       INTEGER,
    budget_priority          INTEGER,
    willing_to_spend_more    INTEGER,
    areas_to_save            INTEGER,
    interior_included        INTEGER,
    financing_arranged       INTEGER
)
"""


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # Bail if already linked.
    fk = pipeline(
        [
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='project_budget'"
        ]
    )[0]
    ddl = rows(fk)[0][0] if rows(fk) else ""
    if "REFERENCES projects" in ddl:
        print("project_budget already linked to projects; nothing to do")
        return

    statements = [
        "PRAGMA foreign_keys = OFF",
        CREATE_PROJECT_BUDGET_NEW,
        "INSERT INTO project_budget_new SELECT * FROM project_budget",
        "DROP TABLE project_budget",
        "ALTER TABLE project_budget_new RENAME TO project_budget",
        "PRAGMA foreign_keys = ON",
    ]
    try:
        pipeline(statements)
        print("OK: project_budget rebuilt with FK\n" + CREATE_PROJECT_BUDGET_NEW.strip())
    except Exception as error:  # noqa: BLE001
        print(f"FAIL: {str(error)[:200]}")
        try:
            pipeline(["PRAGMA foreign_keys = ON"])
        except Exception:  # noqa: BLE001
            pass
        return

    verify = pipeline(
        [
            "SELECT sql FROM sqlite_master WHERE type='table' AND name='project_budget'"
        ]
    )[0]
    for row in rows(verify):
        print("VERIFY DDL:\n" + row[0])

    # Every budget row must resolve to a project (FK integrity).
    orphans = pipeline(
        [
            "SELECT count(*) FROM project_budget pb "
            "LEFT JOIN projects p ON p.id = pb.project_id WHERE p.id IS NULL"
        ]
    )[0]
    print("VERIFY orphans:", rows(orphans)[0][0])

    data = pipeline(
        [
            "SELECT pb.project_id, p.project_name, pb.estimated_overall_budget "
            "FROM project_budget pb JOIN projects p ON p.id = pb.project_id "
            "ORDER BY pb.project_id"
        ]
    )[0]
    for row in rows(data):
        print(f"VERIFY link: project {row[0]} ({row[1]}) -> budget {row[2]}")


if __name__ == "__main__":
    main()