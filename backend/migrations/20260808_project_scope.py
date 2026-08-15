"""Create project_scope and project_scope_item (list + sublist per scope).

project_scope  ── parent list: one row per scope, linked to projects.id
                 and to enquiry_details.enq_id (when the project has an
                 enquiry row).
project_scope_item ── child sub-list: one row per sub-item inside a
                 scope (the "a has t/y/z" hierarchy).

Both are relational (not JSON) so sub-lists are queryable and validated,
matching the existing inspiration_img / project_DOC pattern. Dummy scopes
are seeded for every project.

Run from the backend directory:

    python migrations/20260808_project_scope.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

SCOPES_BY_PROJECT: dict[int, list[tuple[str, list[str]]]] = {
    1: [
        ("Architecture", ["Concept design", "Working drawings", "Permit submission"]),
        ("Interiors", ["Space planning", "Material selection", "Furniture layout"]),
        ("MEP", ["Electrical layout", "Plumbing schematic", "HVAC design"]),
    ],
    2: [
        ("Architecture", ["Concept design", "Working drawings"]),
        ("Interiors", ["Space planning", "Lighting design"]),
        ("Landscaping", ["Garden design", "Hardscape"]),
    ],
    3: [
        ("Architecture", ["Concept design", "Working drawings", "Permit submission"]),
        ("Interiors", ["Material selection", "Furniture layout"]),
    ],
    4: [
        ("Interiors", ["Space planning", "Material selection", "Lighting design"]),
        ("MEP", ["Electrical layout", "Plumbing schematic"]),
        ("Furniture", ["Built-in joinery", "Loose furniture"]),
    ],
    5: [
        ("Architecture", ["Concept design", "Working drawings", "Permit submission"]),
        ("Landscaping", ["Garden design", "Hardscape", "Outdoor lighting"]),
    ],
    6: [
        ("Commercial Fit-out", ["Open-plan layout", "Reception zone", "Meeting rooms"]),
        ("MEP", ["Electrical layout", "HVAC design", "Fire safety"]),
        ("FF&E", ["Workstations", "Acoustic panels", "Branding graphics"]),
    ],
    7: [
        ("Architecture", ["Concept design", "Working drawings"]),
        ("Interiors", ["Space planning", "Material selection"]),
    ],
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    scope_ddl = """
    CREATE TABLE IF NOT EXISTS project_scope (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        enq_id     TEXT REFERENCES enquiry_details(enq_id) ON DELETE CASCADE,
        scope_name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """
    item_ddl = """
    CREATE TABLE IF NOT EXISTS project_scope_item (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        scope_id   INTEGER NOT NULL REFERENCES project_scope(id) ON DELETE CASCADE,
        item_name  TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """
    for ddl in (scope_ddl, item_ddl):
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
    count = pipeline(["SELECT count(*) FROM project_scope"])[0]
    if rows(count)[0][0] > 0:
        print("project_scope already seeded; skipping seed")
    else:
        seeded_scopes = 0
        seeded_items = 0
        for project_id, scopes in SCOPES_BY_PROJECT.items():
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

    # Verify the hierarchy per project.
    scopes = pipeline(
        [
            "SELECT ps.id, ps.project_id, ps.enq_id, ps.scope_name "
            "FROM project_scope ps ORDER BY ps.project_id, ps.sort_order"
        ]
    )[0]
    items = pipeline(
        [
            "SELECT scope_id, item_name FROM project_scope_item ORDER BY scope_id, sort_order"
        ]
    )[0]
    items_by_scope = {}
    for scope_id, item_name in rows(items):
        items_by_scope.setdefault(scope_id, []).append(item_name)
    for scope_id, project_id, enq_id, scope_name in rows(scopes):
        sub = items_by_scope.get(scope_id, [])
        print(f"VERIFY project {project_id} (enq={enq_id}) scope '{scope_name}' -> sublist {sub}")


if __name__ == "__main__":
    main()