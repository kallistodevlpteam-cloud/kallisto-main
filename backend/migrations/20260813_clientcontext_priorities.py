"""Create clientcontext_priorities and its priority_details sub-table.

Parent table: clientcontext_priorities (one row per project priority
group, UUID primary key, linked to projects and enquiry_details).
Sub table: priority_details (UUID primary key, links back to the main
table id, carries a boolean status per detail row: 1 = confirmed,
0 = pending).

Design mirrors the requirements / requirement_items pattern already used
in the codebase.

Run from the backend directory:

    python migrations/20260813_clientcontext_priorities.py
"""

from __future__ import annotations

import sys
from pathlib import Path

import uuid  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(errors="replace")
    except ValueError:
        pass

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

PRIORITIES_DDL = """
CREATE TABLE IF NOT EXISTS clientcontext_priorities (
    id            TEXT PRIMARY KEY,
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    enq_id        TEXT REFERENCES enquiry_details(enq_id) ON DELETE CASCADE,
    priority_name TEXT NOT NULL,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at    INTEGER NOT NULL DEFAULT (strftime('%s','now'))
)
"""

PRIORITY_DETAILS_DDL = """
CREATE TABLE IF NOT EXISTS priority_details (
    id           TEXT PRIMARY KEY,
    priority_id  TEXT NOT NULL REFERENCES clientcontext_priorities(id) ON DELETE CASCADE,
    detail_value TEXT NOT NULL,
    status       INTEGER NOT NULL DEFAULT 0,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now'))
)
"""

# priority_name -> detail_text for the default seeded set.
# status is a boolean stored as 0/1: 1 = confirmed, 0 = pending.
SEED_PRIORITIES: dict[str, list[tuple[str, int]]] = {
    "Natural light & cross ventilation": [
        ("High priority placed on natural light, cross ventilation, and direct garden view access.", 1),
    ],
    "Teak joinery & premium finishes": [
        ("Low-maintenance finishes specifying local teak joinery and high-durability floor materials.", 1),
    ],
    "Dedicated home office & study": [
        ("Regular work-from-home use requires a quiet, private workspace.", 1),
    ],
    "Budget sensitivity & control": [
        ("Client prioritizes staying within the target ₹40L–₹60L range.", 1),
    ],
    "Energy efficiency & sustainability": [
        ("Client shows a strong preference for energy-efficient design and reduced long-term operating costs.", 0),
    ],
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    for ddl in (PRIORITIES_DDL, PRIORITY_DETAILS_DDL):
        try:
            pipeline([ddl])
            table_name = ddl.strip().splitlines()[0].replace(
                "CREATE TABLE IF NOT EXISTS ", ""
            )
            print(f"OK: created {table_name}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    try:
        tables = pipeline(
            [
                "SELECT name FROM sqlite_master "
                "WHERE type = 'table' AND name IN "
                "('clientcontext_priorities', 'priority_details') "
                "ORDER BY name"
            ]
        )[0]
        print(f"VERIFY tables: {[row[0] for row in rows(tables)]}")

        cols = pipeline(["PRAGMA table_info(priority_details)"])[0]
        col_names = [row[1] for row in rows(cols)]
        print(f"VERIFY priority_details columns: {col_names}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")

    # Seed only when empty (rerunnable-safe).
    count = pipeline(["SELECT count(*) FROM clientcontext_priorities"])[0]
    if rows(count)[0][0] > 0:
        print("clientcontext_priorities already seeded; skipping seed")
        return

    try:
        projects = pipeline(["SELECT id FROM projects ORDER BY id"])[0]
        project_ids = [row[0] for row in rows(projects)]
        enq_map_result = pipeline(["SELECT enq_id, project_id FROM enquiry_details"])[0]
        enq_map = {project_id: enq_id for enq_id, project_id in rows(enq_map_result)}
    except Exception as error:  # noqa: BLE001
        print(f"ERR: reading projects: {str(error)[:120]}")
        return

    seeded_priorities = 0
    seeded_details = 0
    for project_id in project_ids:
        for sort_order, (priority_name, details) in enumerate(SEED_PRIORITIES.items()):
            priority_key = str(uuid.uuid4())
            pipeline(
                [
                    "INSERT INTO clientcontext_priorities "
                    "(id, project_id, enq_id, priority_name, sort_order) "
                    "VALUES (?, ?, ?, ?, ?)"
                ],
                [[priority_key, project_id, enq_map.get(project_id), priority_name, sort_order]],
            )
            seeded_priorities += 1
            for detail_order, (detail_value, status) in enumerate(details):
                pipeline(
                    [
                        "INSERT INTO priority_details "
                        "(id, priority_id, detail_value, status, sort_order) "
                        "VALUES (?, ?, ?, ?, ?)"
                    ],
                    [[str(uuid.uuid4()), priority_key, detail_value, status, detail_order]],
                )
                seeded_details += 1
    print(
        f"OK: seeded {seeded_priorities} priorities, "
        f"{seeded_details} priority details"
    )


if __name__ == "__main__":
    main()
