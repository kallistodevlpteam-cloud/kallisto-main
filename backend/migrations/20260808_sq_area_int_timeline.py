"""Change projects.sq_area to INTEGER and add client_expected_timeline.

The projects table is rebuilt (SQLite cannot alter a column type) with
foreign-key enforcement disabled for the rebuild so the ON DELETE CASCADE
children (project_site, project_DOC, inspiration_img, enquiry_details,
project_clients, ...) are NOT cascade-deleted. The rebuild runs inside a
single pipeline call so the pragma applies to all statements.

Existing sq_area TEXT values like "4,200 sq ft" are converted to the
integer 4200. client_expected_timeline is seeded with dummy values.

Run from the backend directory:

    python migrations/20260808_sq_area_int_timeline.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

CLIENT_EXPECTED_TIMELINE: dict[int, str] = {
    1: "9-12 months",
    2: "6-9 months",
    3: "3-6 months",
    4: "6-9 months",
    5: "9-12 months",
    6: "12-18 months",
    7: "6-9 months",
}

CREATE_PROJECTS_NEW = """
CREATE TABLE projects_new (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name            TEXT NOT NULL,
  project_type            TEXT CHECK (project_type IN ('Residential','Commercial','Office','Industrial','Mixed Use')),
  building_type           TEXT,
  new_construction_or_renovation TEXT,
  purpose_of_project      TEXT,
  brief_description       TEXT,
  project_character       TEXT,
  cover_image_url         TEXT,
  sq_area                 INTEGER,
  client_expected_timeline TEXT,
  provider_id             TEXT REFERENCES project_providers(provider_id),
  created_at              INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at              INTEGER NOT NULL DEFAULT (strftime('%s','now'))
)
"""

COPY_PROJECTS = """
INSERT INTO projects_new (
  id, project_name, project_type, building_type,
  new_construction_or_renovation, purpose_of_project, brief_description,
  project_character, cover_image_url, sq_area, client_expected_timeline,
  provider_id, created_at, updated_at
)
SELECT
  id, project_name, project_type, building_type,
  new_construction_or_renovation, purpose_of_project, brief_description,
  project_character, cover_image_url,
  CAST(REPLACE(REPLACE(COALESCE(sq_area, ''), ',', ''), ' sq ft', '') AS INTEGER),
  NULL,
  provider_id, created_at, updated_at
FROM projects
"""


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # Bail if already migrated (sq_area already INTEGER).
    col = pipeline(
        ["SELECT name, type FROM pragma_table_info('projects') WHERE name = 'sq_area'"]
    )[0]
    for row in rows(col):
        if row[1] == "INTEGER":
            print("sq_area already INTEGER; skipping rebuild")
            return

    statements = [
        "PRAGMA foreign_keys = OFF",
        "BEGIN",
        CREATE_PROJECTS_NEW,
        COPY_PROJECTS,
        "DROP TABLE projects",
        "ALTER TABLE projects_new RENAME TO projects",
        "COMMIT",
        "PRAGMA foreign_keys = ON",
    ]
    for index, statement in enumerate(statements):
        try:
            pipeline([statement])
            print(f"OK: {statement.strip()[:60]}…")
        except Exception as error:  # noqa: BLE001
            print(f"FAIL at step {index}: {str(error)[:160]}")
            try:
                pipeline(["ROLLBACK"])
                pipeline(["PRAGMA foreign_keys = ON"])
            except Exception:  # noqa: BLE001
                pass
            return

    for project_id, timeline in sorted(CLIENT_EXPECTED_TIMELINE.items()):
        pipeline(
            ["UPDATE projects SET client_expected_timeline = ? WHERE id = ?"],
            [[timeline, project_id]],
        )
        print(f"project {project_id}: client_expected_timeline -> {timeline}")

    verify = pipeline(
        [
            "SELECT id, project_name, sq_area, client_expected_timeline, "
            "created_at, provider_id "
            "FROM projects ORDER BY id"
        ]
    )[0]
    for row in rows(verify):
        print(f"VERIFY project {row[0]} ({row[1]}): sq_area={row[2]!r} "
              f"({type(row[2]).__name__}), timeline={row[3]!r}")

    # Confirm the cascade children still exist with data.
    for table, key in [
        ("project_site", "count(*)"),
        ("project_DOC", "count(*)"),
        ("inspiration_img", "count(*)"),
        ("enquiry_details", "count(*)"),
    ]:
        child = pipeline([f"SELECT {key} FROM {table}"])[0]
        print(f"CHILD {table}: {rows(child)}")


if __name__ == "__main__":
    main()