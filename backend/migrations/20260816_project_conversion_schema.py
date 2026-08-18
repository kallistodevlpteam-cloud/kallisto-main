"""Migration: Project Conversion and Workspace Bootstrap Schema (v2.0)

Creates:
- project_contexts
- project_scope_baselines
- project_deliverables
- project_milestones
- project_teams
- project_communication_channels
- project_drive_folders
- project_tasks
- project_risk_register
- project_decision_log
- project_bootstrap_status

Run from backend directory:
    python migrations/20260816_project_conversion_schema.py
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

MIGRATION_NAME = "20260816_project_conversion_schema"

DDL_STATEMENTS = [
    # 1. project_contexts
    """
    CREATE TABLE IF NOT EXISTS project_contexts (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        enquiry_id          INTEGER NOT NULL UNIQUE REFERENCES enquiries(id),
        proposal_thread_id  INTEGER NOT NULL REFERENCES proposal_threads(id),
        accepted_version_id INTEGER NOT NULL REFERENCES proposal_versions(id),
        project_code        TEXT NOT NULL UNIQUE,
        project_name        TEXT NOT NULL,
        client_id           TEXT NOT NULL,
        provider_id         TEXT NOT NULL,
        status              TEXT NOT NULL DEFAULT 'bootstrapping' CHECK(status IN ('bootstrapping','active','on_hold','completed','cancelled')),
        total_contract_value REAL NOT NULL,
        currency            TEXT NOT NULL DEFAULT 'INR',
        contract_valid_from INTEGER,
        contract_valid_until INTEGER,
        planned_start_date  INTEGER,
        planned_end_date    INTEGER,
        bootstrap_completed INTEGER NOT NULL DEFAULT 0,
        bootstrap_started_at INTEGER,
        bootstrap_completed_at INTEGER,
        idempotency_key     TEXT UNIQUE,
        converted_by        TEXT NOT NULL,
        converted_at        INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at          INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at          INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pc_client ON project_contexts(client_id);",
    "CREATE INDEX IF NOT EXISTS idx_pc_provider ON project_contexts(provider_id);",
    "CREATE INDEX IF NOT EXISTS idx_pc_status ON project_contexts(status);",

    # 2. project_scope_baselines (immutable)
    """
    CREATE TABLE IF NOT EXISTS project_scope_baselines (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        requirement_id  TEXT NOT NULL,
        requirement_name TEXT,
        coverage_status TEXT NOT NULL,
        provider_notes  TEXT,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 3. project_deliverables
    """
    CREATE TABLE IF NOT EXISTS project_deliverables (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        deliverable_name TEXT NOT NULL,
        description     TEXT,
        format          TEXT,
        quantity        INTEGER DEFAULT 1,
        revision_terms  TEXT,
        acceptance_responsibility TEXT,
        due_milestone_id INTEGER,
        status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','submitted','approved','rejected')),
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 4. project_milestones
    """
    CREATE TABLE IF NOT EXISTS project_milestones (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        milestone_name  TEXT NOT NULL,
        trigger_description TEXT NOT NULL,
        planned_amount  REAL,
        planned_percentage REAL,
        actual_amount   REAL,
        due_condition   TEXT,
        planned_date    INTEGER,
        actual_date     INTEGER,
        status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','triggered','invoiced','paid','delayed')),
        approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending','approved','rejected')),
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pm_project ON project_milestones(project_id);",

    # 5. project_teams
    """
    CREATE TABLE IF NOT EXISTS project_teams (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        provider_id     TEXT NOT NULL,
        role            TEXT NOT NULL,
        status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','completed','removed')),
        assigned_by     TEXT NOT NULL,
        assigned_at     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        activated_at    INTEGER,
        completed_at    INTEGER,
        notes           TEXT,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pt_project ON project_teams(project_id);",

    # 6. project_communication_channels
    """
    CREATE TABLE IF NOT EXISTS project_communication_channels (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        channel_type    TEXT NOT NULL CHECK(channel_type IN ('general','milestone','deliverable','issue','decision')),
        channel_name    TEXT NOT NULL,
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 7. project_drive_folders
    """
    CREATE TABLE IF NOT EXISTS project_drive_folders (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        folder_name     TEXT NOT NULL,
        parent_folder_id INTEGER REFERENCES project_drive_folders(id),
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 8. project_tasks
    """
    CREATE TABLE IF NOT EXISTS project_tasks (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        task_name       TEXT NOT NULL,
        description     TEXT,
        assigned_to     TEXT,
        phase           TEXT,
        dependencies    TEXT,
        planned_start   INTEGER,
        planned_end     INTEGER,
        actual_start    INTEGER,
        actual_end      INTEGER,
        status          TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','in_progress','blocked','completed','cancelled')),
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_ptask_project ON project_tasks(project_id);",

    # 9. project_risk_register
    """
    CREATE TABLE IF NOT EXISTS project_risk_register (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        risk_description TEXT NOT NULL,
        probability     TEXT CHECK(probability IN ('low','medium','high')),
        impact          TEXT CHECK(impact IN ('low','medium','high')),
        mitigation      TEXT,
        owner           TEXT,
        status          TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','mitigated','accepted','transferred','closed')),
        sort_order      INTEGER NOT NULL DEFAULT 0,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,

    # 10. project_decision_log (immutable)
    """
    CREATE TABLE IF NOT EXISTS project_decision_log (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
        decision_type   TEXT NOT NULL CHECK(decision_type IN ('scope_change','timeline_change','budget_change','team_change','milestone_approval','deliverable_approval','bootstrap_approval')),
        decision        TEXT NOT NULL CHECK(decision IN ('approved','rejected','deferred')),
        proposed_by     TEXT NOT NULL,
        decided_by      TEXT NOT NULL,
        decided_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        proposal_json   TEXT,
        decision_json   TEXT,
        rejection_reason TEXT,
        source_event_id TEXT,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_pdl_project ON project_decision_log(project_id);",

    # 11. project_bootstrap_status
    """
    CREATE TABLE IF NOT EXISTS project_bootstrap_status (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL UNIQUE REFERENCES project_contexts(id),
        workspace_created      INTEGER NOT NULL DEFAULT 0,
        relationship_linked    INTEGER NOT NULL DEFAULT 0,
        scope_baseline_created INTEGER NOT NULL DEFAULT 0,
        deliverables_created   INTEGER NOT NULL DEFAULT 0,
        milestones_created     INTEGER NOT NULL DEFAULT 0,
        team_placeholders_created INTEGER NOT NULL DEFAULT 0,
        communication_channels_created INTEGER NOT NULL DEFAULT 0,
        drive_folders_created  INTEGER NOT NULL DEFAULT 0,
        tasks_created          INTEGER NOT NULL DEFAULT 0,
        risk_register_created  INTEGER NOT NULL DEFAULT 0,
        decision_log_created   INTEGER NOT NULL DEFAULT 0,
        total_steps            INTEGER NOT NULL DEFAULT 11,
        completed_steps        INTEGER NOT NULL DEFAULT 0,
        status                 TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress','completed','failed','partial')),
        failure_reason         TEXT,
        created_at             INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at             INTEGER NOT NULL DEFAULT (strftime('%s','now'))
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
