"""Migration: Immutable Enquiry Snapshot Schema (v2.0)

Creates the complete enquiry snapshot architecture:
- enquiries (lifecycle header)
- enquiry_snapshots (immutable frozen payload)
- enquiry_snapshot_requirements + items
- enquiry_snapshot_scope + items
- enquiry_snapshot_files
- enquiry_matches

Run from backend directory:
    python migrations/20260816_enquiry_snapshot_schema.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402
from turso_client import pipeline  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)

MIGRATION_NAME = "20260816_enquiry_snapshot_schema"

DDL_STATEMENTS = [
    # 1. enquiries — lifecycle header
    """
    CREATE TABLE IF NOT EXISTS enquiries (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES projects(id),
        provider_id     TEXT NOT NULL REFERENCES service_provider_details(SP_id),
        snapshot_id     INTEGER UNIQUE REFERENCES enquiry_snapshots(id),
        status          TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','opened','under_review','needs_clarification','accepted','rejected','expired','archived')),
        stage           TEXT NOT NULL DEFAULT 'lead' CHECK(stage IN ('lead','contacted','meeting_scheduled','proposal_submitted','won','lost')),
        submitted_by    TEXT,
        submitted_at    INTEGER,
        opened_at       INTEGER,
        accepted_at     INTEGER,
        rejected_at     INTEGER,
        rejected_reason TEXT,
        match_rationale TEXT,
        idempotency_key TEXT UNIQUE,
        integrity_hash  TEXT,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_enquiries_project ON enquiries(project_id);",
    "CREATE INDEX IF NOT EXISTS idx_enquiries_provider ON enquiries(provider_id);",
    "CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);",

    # 2. enquiry_snapshots — immutable frozen payload
    """
    CREATE TABLE IF NOT EXISTS enquiry_snapshots (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        requirement_id      INTEGER NOT NULL,
        requirement_version INTEGER NOT NULL,
        payload_json        TEXT NOT NULL,
        client_name         TEXT,
        client_email        TEXT,
        client_phone        TEXT,
        project_name        TEXT,
        project_type        TEXT,
        building_type         TEXT,
        new_construction_or_renovation TEXT,
        purpose_of_project   TEXT,
        brief_description    TEXT,
        over_view            TEXT,
        sq_area              REAL,
        client_expected_timeline TEXT,
        place                TEXT,
        estimated_overall_budget REAL,
        plot_address         TEXT,
        plot_size            TEXT,
        plot_orientation     TEXT,
        existing_structures  TEXT,
        topography           TEXT,
        soil_type            TEXT,
        climate_considerations TEXT,
        neighbouring_context TEXT,
        preferred_views      TEXT,
        views_to_avoid       TEXT,
        preserve_features    TEXT,
        utility_access       TEXT,
        site_img_urls        TEXT,
        submitted_by_actor   TEXT NOT NULL,
        submitted_at       INTEGER NOT NULL,
        integrity_hash     TEXT NOT NULL,
        created_at         INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 3. enquiry_snapshot_requirements
    """
    CREATE TABLE IF NOT EXISTS enquiry_snapshot_requirements (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_id     INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
        requirement_id  TEXT NOT NULL,
        requirement_name TEXT NOT NULL,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_esr_snapshot ON enquiry_snapshot_requirements(snapshot_id);",

    # 4. enquiry_snapshot_requirement_items
    """
    CREATE TABLE IF NOT EXISTS enquiry_snapshot_requirement_items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_req_id INTEGER NOT NULL REFERENCES enquiry_snapshot_requirements(id),
        item_value      TEXT NOT NULL,
        item_details    TEXT,
        status          INTEGER,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 5. enquiry_snapshot_scope
    """
    CREATE TABLE IF NOT EXISTS enquiry_snapshot_scope (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_id     INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
        scope_name      TEXT NOT NULL,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 6. enquiry_snapshot_scope_items
    """
    CREATE TABLE IF NOT EXISTS enquiry_snapshot_scope_items (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_scope_id INTEGER NOT NULL REFERENCES enquiry_snapshot_scope(id),
        item_name       TEXT NOT NULL,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 7. enquiry_snapshot_files
    """
    CREATE TABLE IF NOT EXISTS enquiry_snapshot_files (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        snapshot_id     INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
        file_type       TEXT NOT NULL CHECK(file_type IN ('image','document','drawing','reference')),
        file_url        TEXT NOT NULL,
        file_name       TEXT,
        description     TEXT,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 8. enquiry_matches — match rationale before submission
    """
    CREATE TABLE IF NOT EXISTS enquiry_matches (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        enquiry_id      INTEGER NOT NULL REFERENCES enquiries(id),
        provider_id     TEXT NOT NULL,
        fit_score       REAL,
        reasons_json    TEXT,
        limitations_json TEXT,
        risks_json      TEXT,
        availability_confidence TEXT,
        matched_by      TEXT NOT NULL,
        matched_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        client_consented INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_em_enquiry ON enquiry_matches(enquiry_id);",
]


def main():
    print(f"Running {MIGRATION_NAME}...")
    for sql in DDL_STATEMENTS:
        try:
            pipeline([sql])
            print(f"  OK: {sql.strip()[:60]}...")
        except Exception as error:
            print(f"  ERR: {str(error)[:200]}")
    print(f"{MIGRATION_NAME} complete.")


if __name__ == "__main__":
    main()
