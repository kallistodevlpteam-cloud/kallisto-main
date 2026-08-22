"""Convert priority_details.status from TEXT to a boolean (INTEGER 0/1).

SQLite cannot alter a column type in place, so the table is rebuilt:
legacy text statuses ('confirmed'/'true'/'1' -> 1, anything else -> 0)
are mapped to the boolean column. 1 = confirmed, 0 = pending. Re-runnable
(no-op when the column is already INTEGER).

Run from the backend directory:

    python migrations/20260814_priority_details_status_boolean.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(errors="replace")
    except ValueError:
        pass

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

REBUILD_DDL = """
CREATE TABLE priority_details_bool (
    id           TEXT PRIMARY KEY,
    priority_id  TEXT NOT NULL REFERENCES clientcontext_priorities(id) ON DELETE CASCADE,
    detail_value TEXT NOT NULL,
    status       INTEGER NOT NULL DEFAULT 0,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now'))
)
"""

COPY_SQL = """
INSERT INTO priority_details_bool
    (id, priority_id, detail_value, status, sort_order, created_at)
SELECT
    id,
    priority_id,
    detail_value,
    CASE
        WHEN lower(trim(status)) IN ('confirmed', 'true', '1') THEN 1
        ELSE 0
    END,
    sort_order,
    created_at
FROM priority_details
"""


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    cols = pipeline(["PRAGMA table_info(priority_details)"])[0]
    col_names = [row[1] for row in rows(cols)]
    if "status" in col_names and "priority_details_bool" not in col_names:
        type_by_name = dict(zip(col_names, [row[2] for row in rows(cols)]))
        print(f"INFO: current status column type: {type_by_name.get('status')}")
        if str(type_by_name.get("status", "")).upper() != "INTEGER":
            try:
                pipeline([REBUILD_DDL])
                pipeline([COPY_SQL])
                pipeline(["DROP TABLE priority_details"])
                pipeline(
                    ["ALTER TABLE priority_details_bool RENAME TO priority_details"]
                )
                print("OK: priority_details.status converted to INTEGER (0/1)")
            except Exception as error:  # noqa: BLE001
                print(f"ERR: rebuild failed: {str(error)[:200]}")
                return
        else:
            print("INFO: priority_details.status is already INTEGER; skipping")

    final_cols = pipeline(["PRAGMA table_info(priority_details)"])[0]
    final_defs = [tuple(row[1:3]) for row in rows(final_cols)]
    print(f"VERIFY priority_details definitions: {final_defs}")

    sample = pipeline(
        ["SELECT status, count(*) FROM priority_details GROUP BY status ORDER BY status"]
    )[0]
    print(f"VERIFY status distribution: {rows(sample)}")


if __name__ == "__main__":
    main()