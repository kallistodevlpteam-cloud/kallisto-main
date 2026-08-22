"""Add projects.over_view (free-text project overview paragraph).

The over_view column carries the authoritative brief paragraph shown in
the ODIN Project Brief card on the enquiry detail page. It mirrors the
summary the intelligence module previously synthesized client-side; with
this column the paragraph is strictly backend-sourced. Re-runnable:
the column is added only when absent, and backfill only touches rows
whose over_view is NULL or empty.

Run from the backend directory:

    python migrations/20260814_projects_over_view.py
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

# project id -> authoritative overview paragraph.
OVERVIEW_BY_PROJECT: dict[int, str] = {
    1: (
        "The client is seeking a residential fit-out for approximately "
        "4,200 sq ft. The current requirement covers space planning, "
        "interior fit-out and MEP coordination with a ₹380 Lakhs budget "
        "and a nine-to-twelve-month target. The project is suitable for "
        "review, but budget coverage and expected deliverables should be "
        "clarified before proposal preparation."
    ),
    2: (
        "Rahul Menon is seeking a residential fit-out for approximately "
        "3,600 sq ft in Kochi. The current requirement covers space "
        "planning, interior fit-out and MEP coordination with a ₹285 "
        "Lakhs budget and a six-to-nine-month target. The project is "
        "suitable for review, but budget coverage and expected "
        "deliverables should be clarified before proposal preparation."
    ),
    3: (
        "Priya Sharma is seeking a residential fit-out for approximately "
        "2,150 sq ft in Bengaluru. The current requirement covers space "
        "planning, interior fit-out and MEP coordination with a ₹145 "
        "Lakhs budget and a three-to-six-month target. The project is "
        "suitable for review, but budget coverage and expected "
        "deliverables should be clarified before proposal preparation."
    ),
    4: (
        "Arun Kumar is seeking a residential fit-out for approximately "
        "1,480 sq ft in Mumbai. The current requirement covers space "
        "planning, interior fit-out and MEP coordination with a ₹320 "
        "Lakhs budget and a six-to-nine-month target. The project is "
        "suitable for review, but budget coverage and expected "
        "deliverables should be clarified before proposal preparation."
    ),
    5: (
        "Meera Iyer is seeking a residential fit-out for approximately "
        "2,750 sq ft in Trivandrum. The current requirement covers space "
        "planning, interior fit-out and MEP coordination with a ₹195 "
        "Lakhs budget and a six-month target. The project is suitable for "
        "review, but budget coverage and expected deliverables should be "
        "clarified before proposal preparation."
    ),
    6: (
        "Dev Nair is seeking a commercial fit-out for approximately "
        "12,000 sq ft in Hyderabad. The current requirement covers space "
        "planning, interior fit-out and MEP coordination with a ₹850 "
        "Lakhs budget and a twelve-to-eighteen-month target. The project "
        "is suitable for review, but budget coverage and expected "
        "deliverables should be clarified before proposal preparation."
    ),
    7: (
        "The client is seeking a residential fit-out for approximately "
        "2,300 sq ft. The current requirement covers space planning, "
        "interior fit-out and MEP coordination with a ₹160 Lakhs budget "
        "and a six-to-nine-month target. The project is suitable for "
        "review, but budget coverage and expected deliverables should be "
        "clarified before proposal preparation."
    ),
}

BACKFILL_SQL = """
UPDATE projects
SET over_view = ?
WHERE id = ?
  AND (over_view IS NULL OR trim(over_view) = '')
"""


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    cols = pipeline(["PRAGMA table_info(projects)"])[0]
    col_names = [row[1] for row in rows(cols)]
    if "over_view" not in col_names:
        try:
            pipeline(["ALTER TABLE projects ADD COLUMN over_view TEXT"])
            print("OK: ALTER TABLE projects ADD COLUMN over_view TEXT")
        except Exception as error:  # noqa: BLE001
            print(f"ERR: adding over_view column failed: {str(error)[:200]}")
            return
    else:
        print("INFO: projects.over_view already exists; skipping ALTER")

    backfilled = 0
    for project_id, overview in OVERVIEW_BY_PROJECT.items():
        try:
            pipeline([BACKFILL_SQL], [[overview, project_id]])
            backfilled += 1
        except Exception as error:  # noqa: BLE001
            print(f"ERR: backfill project {project_id} failed: {str(error)[:200]}")

    final_cols = pipeline(["PRAGMA table_info(projects)"])[0]
    final_defs = [tuple(row[1:3]) for row in rows(final_cols)]
    print(f"VERIFY projects definitions: {final_defs}")

    sample = pipeline(
        ["SELECT id, project_name, substr(over_view, 1, 60) FROM projects ORDER BY id"]
    )[0]
    for project_id, project_name, snippet in rows(sample):
        print(f"VERIFY {project_id} {project_name}: {snippet}...")

    print(f"OK: backfilled over_view for {backfilled} projects")


if __name__ == "__main__":
    main()