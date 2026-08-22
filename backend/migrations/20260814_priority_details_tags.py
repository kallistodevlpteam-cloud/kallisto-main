"""Add priority_details.tags (a list of tag strings per detail row).

Each priority_details row stores its tags as a JSON-encoded list of
strings (mirrors the project_site.site_img_url JSON-list pattern already
used in the codebase). Missing or unparsable values fall back to an empty
list. Re-runnable: the column is added only when absent, and backfill
only touches rows that still have an empty tag list.

Run from the backend directory:

    python migrations/20260814_priority_details_tags.py
"""

from __future__ import annotations

import json
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

# priority_name -> tags for every seeded priority detail row.
TAGS_BY_PRIORITY: dict[str, list[str]] = {
    "Natural light & cross ventilation": ["Ergonomics", "Daylight"],
    "Teak joinery & premium finishes": ["Finishes", "Teak Joinery"],
    "Dedicated home office & study": ["Workspace", "Acoustics"],
    "Budget sensitivity & control": ["Budget", "Cost Control"],
    "Energy efficiency & sustainability": ["Sustainability", "Energy"],
}

BACKFILL_SQL = """
UPDATE priority_details
SET tags = ?
WHERE priority_id IN (
    SELECT id FROM clientcontext_priorities WHERE priority_name = ?
)
  AND (tags IS NULL OR tags = '[]')
"""


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    cols = pipeline(["PRAGMA table_info(priority_details)"])[0]
    col_names = [row[1] for row in rows(cols)]
    if "tags" not in col_names:
        try:
            pipeline(["ALTER TABLE priority_details ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'"])
            print("OK: ALTER TABLE priority_details ADD COLUMN tags TEXT")
        except Exception as error:  # noqa: BLE001
            print(f"ERR: adding tags column failed: {str(error)[:200]}")
            return
    else:
        print("INFO: priority_details.tags already exists; skipping ALTER")

    backfilled = 0
    for priority_name, tag_list in TAGS_BY_PRIORITY.items():
        try:
            pipeline([BACKFILL_SQL], [[json.dumps(tag_list), priority_name]])
            backfilled += 1
        except Exception as error:  # noqa: BLE001
            print(f"ERR: backfill {priority_name!r} failed: {str(error)[:200]}")

    final_cols = pipeline(["PRAGMA table_info(priority_details)"])[0]
    final_defs = [tuple(row[1:3]) for row in rows(final_cols)]
    print(f"VERIFY priority_details definitions: {final_defs}")

    sample = pipeline(
        [
            "SELECT cp.priority_name, pd.tags "
            "FROM priority_details pd "
            "JOIN clientcontext_priorities cp ON cp.id = pd.priority_id "
            "ORDER BY pd.sort_order LIMIT 8"
        ]
    )[0]
    for priority_name, tags in rows(sample):
        print(f"VERIFY {priority_name}: {tags}")

    print(f"OK: backfilled tags for {backfilled} priority groups")


if __name__ == "__main__":
    main()
