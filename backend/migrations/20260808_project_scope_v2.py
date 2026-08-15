"""Replace project scope names and items with fresh test data.

Deletes the existing project_scope / project_scope_item rows and seeds
new, per-project scope names with their sub-lists. Extra scopes are added
so each project shows 3-4 categories for testing.

Run from the backend directory:

    python migrations/20260808_project_scope_v2.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# project_id -> list of (scope_name, [item_name, ...])
SCOPES_V2: dict[int, list[tuple[str, list[str]]]] = {
    1: [
        ("Concept & Schematic Design", ["Concept design", "3D massing model", "Design brief validation"]),
        ("Working Drawings", ["Architectural drawings", "Structural detailing", "Construction documents"]),
        ("Permits & Approvals", ["Building permit", "Fire NOC", "Environmental clearance"]),
        ("Interior Fit-out", ["Space planning", "Material palette", "Furniture layout"]),
    ],
    2: [
        ("Concept & Schematic Design", ["Concept design", "Design brief validation"]),
        ("Working Drawings", ["Architectural drawings", "MEP coordination"]),
        ("Construction Supervision", ["Site quality checks", "Progress reviews", "Contractor coordination"]),
        ("Landscape Design", ["Garden design", "Irrigation plan", "Outdoor lighting"]),
    ],
    3: [
        ("Concept & Schematic Design", ["Concept design", "3D massing model"]),
        ("Working Drawings", ["Architectural drawings", "Structural detailing"]),
        ("Smart Home Integration", ["AV cabling", "Access control", "Home automation"]),
    ],
    4: [
        ("Interior Fit-out", ["Space planning", "Material palette", "Lighting design"]),
        ("MEP Engineering", ["Electrical layout", "Plumbing schematic", "HVAC zoning"]),
        ("Furniture & FF&E", ["Built-in joinery", "Loose furniture", "Upholstery selection"]),
        ("Sustainability", ["Energy modelling", "Rainwater harvesting"]),
    ],
    5: [
        ("Concept & Schematic Design", ["Concept design", "Design brief validation"]),
        ("Working Drawings", ["Architectural drawings", "Structural detailing", "MEP coordination"]),
        ("Landscape Design", ["Garden design", "Hardscape", "Outdoor lighting", "Water feature"]),
    ],
    6: [
        ("Commercial Fit-out", ["Open-plan layout", "Reception zone", "Meeting rooms", "Cafeteria zone"]),
        ("MEP Engineering", ["Electrical layout", "HVAC design", "Fire safety", "BMS integration"]),
        ("FF&E Procurement", ["Workstations", "Acoustic panels", "Branding graphics", "Signage"]),
        ("Phased Handover", ["Phase-wise handover plan", "Snag list management"]),
    ],
    7: [
        ("Concept & Schematic Design", ["Concept design", "Design brief validation"]),
        ("Interior Fit-out", ["Space planning", "Material palette"]),
        ("Lighting Design", ["Ambient lighting", "Task lighting"]),
    ],
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # Clear existing scope rows (children first because of the FK).
    try:
        pipeline(["DELETE FROM project_scope_item"])
        pipeline(["DELETE FROM project_scope"])
        print("OK: cleared old scope rows")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: clearing scopes: {str(error)[:120]}")
        return

    # project_id -> enq_id map (enq projects only).
    enq_map = {}
    r = pipeline(["SELECT enq_id, project_id FROM enquiry_details"])[0]
    for enq_id, project_id in rows(r):
        enq_map[project_id] = enq_id

    seeded_scopes = 0
    seeded_items = 0
    for project_id, scopes in SCOPES_V2.items():
        enq_id = enq_map.get(project_id)
        for sort_order, (scope_name, items) in enumerate(scopes):
            scope = pipeline(
                [
                    "INSERT INTO project_scope (project_id, enq_id, scope_name, sort_order) "
                    "VALUES (?, ?, ?, ?) RETURNING id"
                ],
                [[project_id, enq_id, scope_name, sort_order]],
            )[0]
            scope_id = rows(scope)[0][0]
            seeded_scopes += 1
            for item_order, item_name in enumerate(items):
                pipeline(
                    [
                        "INSERT INTO project_scope_item (scope_id, item_name, sort_order) "
                        "VALUES (?, ?, ?)"
                    ],
                    [[scope_id, item_name, item_order]],
                )
                seeded_items += 1
    print(f"OK: seeded {seeded_scopes} scopes, {seeded_items} scope items")

    # Verify hierarchy per project.
    scopes = pipeline(
        [
            "SELECT ps.id, ps.project_id, ps.scope_name "
            "FROM project_scope ps ORDER BY ps.project_id, ps.sort_order, ps.id"
        ]
    )[0]
    items = pipeline(
        [
            "SELECT scope_id, item_name FROM project_scope_item "
            "ORDER BY scope_id, sort_order, id"
        ]
    )[0]
    items_by_scope = {}
    for scope_id, item_name in rows(items):
        items_by_scope.setdefault(scope_id, []).append(item_name)
    for scope_id, project_id, scope_name in rows(scopes):
        print(f"VERIFY project {project_id} scope '{scope_name}' -> {items_by_scope.get(scope_id, [])}")


if __name__ == "__main__":
    main()