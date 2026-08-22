"""Add project_status column, proposals table, and team members table.

Run from the backend directory:
    python migrations/20260815_project_lifecycle.py
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

def main() -> None:
    load_dotenv(ENV_PATH)
    try:
        # Check if project_status column already exists
        check_result = pipeline(["PRAGMA table_info(projects)"])[0]
        columns = [col[1] for col in rows(check_result)]
        if "project_status" in columns:
            print("OK: project_status column already exists, skipping migration")
            return

        # Add project_status column
        pipeline(["ALTER TABLE projects ADD COLUMN project_status TEXT DEFAULT 'upcoming'"])
        print("OK: project_status column added")

        # Create tables one by one
        pipeline(["""CREATE TABLE IF NOT EXISTS project_proposals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            provider_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft',
            total_amount INTEGER,
            rate_notes TEXT,
            timeline_notes TEXT,
            scope_summary TEXT,
            rejection_reason TEXT,
            negotiation_notes TEXT,
            created_at INTEGER DEFAULT (strftime('%s','now')),
            updated_at INTEGER DEFAULT (strftime('%s','now')),
            sent_at INTEGER,
            responded_at INTEGER
        )"""])
        print("OK: project_proposals table created")

        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_proposals_project_id ON project_proposals(project_id)"])
        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_proposals_provider_id ON project_proposals(provider_id)"])
        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_proposals_status ON project_proposals(status)"])
        print("OK: proposal indexes created")

        pipeline(["""CREATE TABLE IF NOT EXISTS project_team_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            provider_id TEXT NOT NULL,
            assigned_by TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'subcontractor',
            status TEXT NOT NULL DEFAULT 'pending',
            assigned_at INTEGER DEFAULT (strftime('%s','now')),
            activated_at INTEGER,
            completed_at INTEGER,
            notes TEXT
        )"""])
        print("OK: project_team_members table created")

        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_team_members_project_id ON project_team_members(project_id)"])
        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_team_members_provider_id ON project_team_members(provider_id)"])
        print("OK: team member indexes created")

        pipeline(["""CREATE TABLE IF NOT EXISTS project_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            sender_type TEXT NOT NULL,
            sender_id TEXT NOT NULL,
            message_type TEXT NOT NULL DEFAULT 'general',
            content TEXT NOT NULL,
            created_at INTEGER DEFAULT (strftime('%s','now')),
            read_at INTEGER
        )"""])
        print("OK: project_messages table created")

        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id)"])
        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_messages_sender ON project_messages(sender_type, sender_id)"])
        print("OK: message indexes created")

        # Migrate existing projects
        pipeline(["UPDATE projects SET project_status = 'upcoming' WHERE project_character = 'pr'"])
        print("OK: existing projects migrated to upcoming status")

        # Verify
        verify = pipeline(["SELECT count(*) FROM sqlite_master WHERE type='table' AND name IN ('project_proposals', 'project_team_members', 'project_messages')"])[0]
        count = rows(verify)[0][0]
        print(f"VERIFY: {count}/3 new tables created")

        check2 = pipeline(["PRAGMA table_info(projects)"])[0]
        cols = [col[1] for col in rows(check2)]
        print(f"VERIFY: projects columns include project_status={('project_status' in cols)}")

    except Exception as e:
        print(f"ERROR: {e}")
        raise

if __name__ == "__main__":
    main()
