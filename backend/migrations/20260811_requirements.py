"""Create requirements and requirement_items (list + sublist per requirement).

requirements ── parent list: one row per requirement, linked to projects.id
                 and to enquiry_details.enq_id (when the project has an
                 enquiry row). The requirement's key is a UUID (TEXT).
requirement_items ── child sub-list: one row per value inside a requirement
                 (the "requirement has t/y/z values" hierarchy). Each item
                 has its own UUID key and carries the parent requirement key
                 as requirement_id, so the two tables are directly linked.

Both are relational (not JSON) so sub-lists are queryable and validated,
matching the existing project_scope / project_scope_item pattern. Dummy
requirement rows are seeded for every project.

Run from the backend directory:

    python migrations/20260811_requirements.py
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Windows consoles default to cp1252 which cannot print non-Latin glyphs
# (e.g. the rupee sign); fall back to a lossless stdout instead of crashing.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(errors="replace")
    except ValueError:
        pass

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# project_id -> list of (requirement_name, [item names/values, ...])
REQUIREMENTS_BY_PROJECT: dict[int, list[tuple[str, list[str]]]] = {
    1: [
        ("Building & Project Type", ["Residential, Ground + 1 Floor", "Design + Build scope"]),
        ("Target Built-up Area", ["2,200 sq ft", "Car porch + Courtyard included"]),
        ("Architectural & Interior Style", ["Warm Contemporary Minimalist", "Natural teak accents", "Microcement finishes"]),
        ("Timeline", ["Housing loan approval in place", "Move-in within 10 months"]),
    ],
    2: [
        ("Building & Project Type", ["Residential Fit-out", "Single detached house"]),
        ("Target Built-up Area", ["3,000 sq ft", "Two storeys"]),
        ("Client / User Profile", ["Family of 4", "Elderly parents visiting"]),
        ("Timeline", ["Completion within 8 months"]),
    ],
    3: [
        ("Building & Project Type", ["Residential Renovation", "Existing structure"]),
        ("Target Built-up Area", ["1,800 sq ft", "First floor only"]),
        ("Architectural & Interior Style", ["Contemporary with Italian marble"]),
        ("Budget & Commercial", ["₹60L – ₹80L", "Incl. contingencies"]),
    ],
    4: [
        ("Building & Project Type", ["Apartment, Rental", "Premium tower"]),
        ("Target Built-up Area", ["1,450 sq ft", "3BHK"]),
        ("Architectural & Interior Style", ["Modern with skyline views"]),
        ("Smart Home & Technical", ["Rooftop lounge", "Fitness center"]),
    ],
    5: [
        ("Building & Project Type", ["Residential, Ground + 1", "Warm Contemporary Minimalist"]),
        ("Target Built-up Area", ["2,800 – 3,200 sq ft", "Courtyard cutout"]),
        ("Client / User Profile", ["Family of 4", "School-age children", "Elderly grandparents visiting"]),
        ("Architectural & Interior Style", ["Natural teak accents", "Microcement finishes", "Soft terracotta accents"]),
        ("Timeline", ["Six-month target", "Budget ₹40L – ₹60L"]),
    ],
    6: [
        ("Building & Project Type", ["Commercial Fit-out", "Office, 50+ capacity"]),
        ("Target Built-up Area", ["8,500 sq ft", "2 Executive Cabins"]),
        ("Architectural & Interior Style", ["Glass acoustic partitions", "Commercial carpet flooring"]),
        ("Smart Home & Technical", ["Data cabling", "Server room trunking"]),
    ],
    7: [
        ("Building & Project Type", ["Residential", "View flag test project"]),
        ("Target Built-up Area", ["2,400 sq ft", "Three bedrooms"]),
        ("Architectural & Interior Style", ["Contemporary design"]),
        ("Timeline", ["Within 6 months"]),
    ],
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    requirement_ddl = """
    CREATE TABLE IF NOT EXISTS requirements (
        id             TEXT PRIMARY KEY,
        project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        enq_id         TEXT REFERENCES enquiry_details(enq_id) ON DELETE CASCADE,
        requirement_name TEXT NOT NULL,
        sort_order     INTEGER NOT NULL DEFAULT 0,
        created_at     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at     INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """
    item_ddl = """
    CREATE TABLE IF NOT EXISTS requirement_items (
        id             TEXT PRIMARY KEY,
        requirement_id TEXT NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
        item_value     TEXT NOT NULL,
        sort_order     INTEGER NOT NULL DEFAULT 0,
        created_at     INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """
    for ddl in (requirement_ddl, item_ddl):
        try:
            pipeline([ddl])
            print(f"OK: created {ddl.strip().splitlines()[0].replace('CREATE TABLE IF NOT EXISTS ', '')}…")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: {str(error)[:120]}")

    # project_id -> enq_id map (only enq projects have enquiry rows).
    enq_map = {}
    try:
        r = pipeline(["SELECT enq_id, project_id FROM enquiry_details"])[0]
        for enq_id, project_id in rows(r):
            enq_map[project_id] = enq_id
    except Exception as error:  # noqa: BLE001
        print(f"ERR: reading enquiry_details: {str(error)[:120]}")

    # Seed only when empty (rerunnable-safe).
    count = pipeline(["SELECT count(*) FROM requirements"])[0]
    if rows(count)[0][0] > 0:
        print("requirements already seeded; skipping seed")
    else:
        seeded_requirements = 0
        seeded_items = 0
        for project_id, reqs in REQUIREMENTS_BY_PROJECT.items():
            enq_id = enq_map.get(project_id)
            for sort_order, (requirement_name, item_values) in enumerate(reqs):
                requirement_key = str(uuid.uuid4())
                pipeline(
                    [
                        "INSERT INTO requirements (id, project_id, enq_id, requirement_name, sort_order) "
                        "VALUES (?, ?, ?, ?, ?)"
                    ],
                    [[requirement_key, project_id, enq_id, requirement_name, sort_order]],
                )
                seeded_requirements += 1
                for item_order, item_value in enumerate(item_values):
                    pipeline(
                        [
                            "INSERT INTO requirement_items (id, requirement_id, item_value, sort_order) "
                            "VALUES (?, ?, ?, ?)"
                        ],
                        [[str(uuid.uuid4()), requirement_key, item_value, item_order]],
                    )
                    seeded_items += 1
        print(f"OK: seeded {seeded_requirements} requirements, {seeded_items} requirement items")

    # Verify the parent -> child link per project.
    requirements = pipeline(
        [
            "SELECT id, project_id, requirement_name FROM requirements "
            "ORDER BY project_id, sort_order, id"
        ]
    )[0]
    items = pipeline(
        [
            "SELECT requirement_id, item_value FROM requirement_items "
            "ORDER BY requirement_id, sort_order, id"
        ]
    )[0]
    items_by_requirement = {}
    for requirement_id, item_value in rows(items):
        items_by_requirement.setdefault(requirement_id, []).append(item_value)
    for requirement_id, project_id, requirement_name in rows(requirements):
        print(
            f"VERIFY project {project_id} requirement '{requirement_name}' "
            f"-> {items_by_requirement.get(requirement_id, [])}"
        )


if __name__ == "__main__":
    main()