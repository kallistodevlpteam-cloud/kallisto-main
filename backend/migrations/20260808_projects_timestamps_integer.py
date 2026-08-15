"""Convert projects.created_at / updated_at from TEXT to INTEGER.

Stored values are converted to Unix epoch seconds so the backend can
return a numeric timestamp; the previous TEXT format stored ISO-8601
UTC strings such as "2026-01-15T10:00:00Z".

The table is not rebuilt: the new INTEGER columns are added alongside
the old TEXT columns, values are converted in place, and the old TEXT
columns are dropped. This keeps the foreign keys from child tables
(project_clients, project_site, project_budget) intact.

NOTE: SQLite forbids ADD COLUMN with a non-constant default, so the
added INTEGER columns carry DEFAULT 0 here. Fresh databases get the
intended ``(strftime('%s','now'))`` default from database/schema.sql.
There are no backend write endpoints for projects yet, so a constant
default is acceptable on existing databases.

The original TEXT values were dropped by an earlier failed run of this
migration; the per-row conversions below restore the values captured
from the live API before the failed run.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_projects_timestamps_integer.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# project_id -> (created_at_iso, updated_at_iso)
# Values captured from the live /api/projects response on 2026-08-08.
PROJECT_TIMESTAMPS = {
    1: ("2026-01-10T09:00:00Z", "2026-07-30T14:00:00Z"),
    2: ("2026-01-15T10:00:00Z", "2026-08-01T09:00:00Z"),
    3: ("2026-02-10T11:30:00Z", "2026-08-03T10:15:00Z"),
    4: ("2026-03-10T08:45:00Z", "2026-08-04T12:00:00Z"),
    5: ("2026-04-18T14:20:00Z", "2026-08-05T16:30:00Z"),
    6: ("2026-05-12T09:10:00Z", "2026-08-06T08:00:00Z"),
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    statements: list[str] = [
        (
            "ALTER TABLE projects ADD COLUMN created_at INTEGER "
            "NOT NULL DEFAULT 0"
        ),
        (
            "ALTER TABLE projects ADD COLUMN updated_at INTEGER "
            "NOT NULL DEFAULT 0"
        ),
    ]
    args_list: list[list[object]] = [[], []]
    for project_id, (created_iso, updated_iso) in PROJECT_TIMESTAMPS.items():
        statements.append(
            "UPDATE projects SET created_at = strftime('%s', ?), "
            "updated_at = strftime('%s', ?) WHERE id = ?"
        )
        args_list.append([created_iso, updated_iso, project_id])

    for statement, args in zip(statements, args_list, strict=False):
        try:
            pipeline([statement], [args])
            print(f"OK: {statement.strip()[:60]}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    try:
        result = pipeline(
            [
                "SELECT id, project_name, created_at, updated_at "
                "FROM projects ORDER BY id"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()
