"""Migration: Proposal Version History Schema (v2.0)

Creates:
- proposal_threads
- proposal_drafts
- proposal_versions
- proposal_version_scope
- proposal_version_milestones
- proposal_decisions
- proposal_change_sets

Run from backend directory:
    python migrations/20260816_proposal_version_schema.py
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

MIGRATION_NAME = "20260816_proposal_version_schema"

DDL_STATEMENTS = [
    # 1. proposal_threads
    """
    CREATE TABLE IF NOT EXISTS proposal_threads (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        enquiry_id      INTEGER NOT NULL UNIQUE REFERENCES enquiries(id),
        provider_id     TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'drafting' CHECK(status IN ('drafting','sent','revision_requested','accepted','rejected','expired')),
        source_requirement_version INTEGER NOT NULL,
        source_snapshot_id      INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
        current_draft_id        INTEGER,
        accepted_version_id     INTEGER,
        created_by            TEXT NOT NULL,
        created_at            INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at            INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pt_enquiry ON proposal_threads(enquiry_id);",
    "CREATE INDEX IF NOT EXISTS idx_pt_provider ON proposal_threads(provider_id);",
    "CREATE INDEX IF NOT EXISTS idx_pt_status ON proposal_threads(status);",

    # 2. proposal_drafts
    """
    CREATE TABLE IF NOT EXISTS proposal_drafts (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id       INTEGER NOT NULL REFERENCES proposal_threads(id),
        total_amount    REAL,
        currency        TEXT DEFAULT 'INR',
        rate_notes      TEXT,
        timeline_notes  TEXT,
        scope_summary   TEXT,
        provider_id     TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'drafting' CHECK(status IN ('drafting','validating','ready')),
        validation_errors TEXT,
        validation_warnings TEXT,
        last_edited_by  TEXT,
        last_edited_at  INTEGER,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 3. proposal_versions (immutable)
    """
    CREATE TABLE IF NOT EXISTS proposal_versions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id       INTEGER NOT NULL REFERENCES proposal_threads(id),
        version_number  INTEGER NOT NULL,
        total_amount    REAL NOT NULL,
        currency        TEXT NOT NULL DEFAULT 'INR',
        rate_notes      TEXT,
        timeline_notes  TEXT,
        scope_summary   TEXT,
        scope_covered_json TEXT,
        validity_period_days INTEGER DEFAULT 30,
        valid_until     INTEGER,
        prepared_by     TEXT NOT NULL,
        approved_by     TEXT,
        sent_at         INTEGER NOT NULL,
        source_requirement_version INTEGER NOT NULL,
        source_snapshot_id INTEGER NOT NULL,
        rendered_document_url TEXT,
        integrity_hash  TEXT NOT NULL,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_pv_thread_version ON proposal_versions(thread_id, version_number);",

    # 4. proposal_version_scope
    """
    CREATE TABLE IF NOT EXISTS proposal_version_scope (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        version_id      INTEGER NOT NULL REFERENCES proposal_versions(id),
        requirement_id  TEXT NOT NULL,
        requirement_name TEXT,
        coverage_status TEXT NOT NULL CHECK(coverage_status IN ('fully_covered','partially_covered','excluded','unresolved')),
        provider_notes  TEXT,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 5. proposal_version_milestones
    """
    CREATE TABLE IF NOT EXISTS proposal_version_milestones (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        version_id      INTEGER NOT NULL REFERENCES proposal_versions(id),
        milestone_name  TEXT NOT NULL,
        trigger_description TEXT NOT NULL,
        amount          REAL,
        percentage      REAL,
        due_condition   TEXT,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 6. proposal_decisions (immutable)
    """
    CREATE TABLE IF NOT EXISTS proposal_decisions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        version_id      INTEGER NOT NULL REFERENCES proposal_versions(id),
        decision        TEXT NOT NULL CHECK(decision IN ('accept','reject','revision_request','expired')),
        decided_by      TEXT NOT NULL,
        decided_by_role TEXT NOT NULL CHECK(decided_by_role IN ('client','client_decision_maker','system')),
        decided_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        rejection_reason  TEXT,
        revision_notes  TEXT,
        negotiation_notes TEXT,
        confirmation_summary TEXT,
        integrity_hash  TEXT NOT NULL,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pd_version ON proposal_decisions(version_id);",
    "CREATE INDEX IF NOT EXISTS idx_pd_decision ON proposal_decisions(decision);",

    # 7. proposal_change_sets
    """
    CREATE TABLE IF NOT EXISTS proposal_change_sets (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id       INTEGER NOT NULL REFERENCES proposal_threads(id),
        from_version_id INTEGER NOT NULL REFERENCES proposal_versions(id),
        to_version_id   INTEGER NOT NULL REFERENCES proposal_versions(id),
        change_summary  TEXT NOT NULL,
        diff_json       TEXT NOT NULL,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
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
