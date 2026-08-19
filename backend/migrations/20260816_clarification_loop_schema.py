"""Migration: Clarification Loop and Requirement Versioning Schema (v2.0)

Creates:
- clarification_threads
- clarification_questions
- clarification_answers
- clarification_change_proposals
- requirement_versions

Run from backend directory:
    python migrations/20260816_clarification_loop_schema.py
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

MIGRATION_NAME = "20260816_clarification_loop_schema"

DDL_STATEMENTS = [
    # 1. clarification_threads
    """
    CREATE TABLE IF NOT EXISTS clarification_threads (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        enquiry_id      INTEGER NOT NULL REFERENCES enquiries(id),
        status          TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','merged','closed','expired')),
        opened_by       TEXT NOT NULL,
        opened_at       INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        resolved_at     INTEGER,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_clar_threads_enquiry ON clarification_threads(enquiry_id);",

    # 2. clarification_questions
    """
    CREATE TABLE IF NOT EXISTS clarification_questions (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id           INTEGER NOT NULL REFERENCES clarification_threads(id),
        question_text       TEXT NOT NULL,
        question_type       TEXT NOT NULL DEFAULT 'text' CHECK(question_type IN ('text','choice','file','measurement','budget','timeline')),
        target_fields       TEXT,
        asked_by            TEXT NOT NULL,
        asked_at            INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        assisted_by_agent   TEXT,
        answer_id           INTEGER,
        status              TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','answered','superseded')),
        created_at          INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_clq_thread ON clarification_questions(thread_id);",
    "CREATE INDEX IF NOT EXISTS idx_clq_status ON clarification_questions(status);",

    # 3. clarification_answers
    """
    CREATE TABLE IF NOT EXISTS clarification_answers (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id     INTEGER NOT NULL UNIQUE REFERENCES clarification_questions(id),
        answer_text     TEXT NOT NULL,
        answer_type     TEXT NOT NULL DEFAULT 'text' CHECK(answer_type IN ('text','choice','file','confirmation')),
        attachments     TEXT,
        answered_by     TEXT NOT NULL,
        answered_at     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        merged_into_requirement_version INTEGER,
        merge_status    TEXT DEFAULT 'pending' CHECK(merge_status IN ('pending','approved','rejected','auto_merged')),
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_cla_question ON clarification_answers(question_id);",

    # 4. clarification_change_proposals
    """
    CREATE TABLE IF NOT EXISTS clarification_change_proposals (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id       INTEGER NOT NULL REFERENCES clarification_threads(id),
        answer_id       INTEGER NOT NULL REFERENCES clarification_answers(id),
        requirement_id  TEXT NOT NULL,
        proposed_field  TEXT NOT NULL,
        current_value   TEXT,
        proposed_value  TEXT NOT NULL,
        confidence      REAL,
        status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','auto_merged')),
        approved_by     TEXT,
        approved_at     INTEGER,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_ccp_thread ON clarification_change_proposals(thread_id);",

    # 5. requirement_versions
    """
    CREATE TABLE IF NOT EXISTS requirement_versions (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id      INTEGER NOT NULL REFERENCES projects(id),
        version_number  INTEGER NOT NULL,
        triggered_by    TEXT NOT NULL CHECK(triggered_by IN ('client_edit','clarification_merge','system_correction','manual_override')),
        triggered_by_clarification_answer_id INTEGER REFERENCES clarification_answers(id),
        payload_json    TEXT NOT NULL,
        readiness_score REAL,
        readiness_status TEXT CHECK(readiness_status IN ('draft','reviewable','provider_ready','blocked')),
        blocker_summary TEXT,
        created_by      TEXT NOT NULL,
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        integrity_hash  TEXT NOT NULL
    )
    """,
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_req_ver_project ON requirement_versions(project_id, version_number);",
    "CREATE INDEX IF NOT EXISTS idx_req_ver_project_latest ON requirement_versions(project_id, version_number DESC);",
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
