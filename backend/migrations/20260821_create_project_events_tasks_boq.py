"""Create or migrate project_events, project_tasks, project_milestones, boq_items tables safely.
Handles existing tables that may be missing columns from earlier migrations."""

import sys
import os
from pathlib import Path

from dotenv import load_dotenv

_backend_dir = Path(__file__).resolve().parent.parent
_env_path = _backend_dir / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

sys.path.insert(0, str(_backend_dir))
from turso_client import pipeline, rows

def _table_exists(name: str) -> bool:
    r = pipeline(["SELECT 1 FROM sqlite_master WHERE type='table' AND name=?"], [[name]])[0]
    return len(rows(r)) > 0

def _column_exists(table: str, col: str) -> bool:
    r = pipeline([f'PRAGMA table_info("{table}")'])[0]
    return any(row[1] == col for row in rows(r))

def run():
    # ── project_events ──
    if not _table_exists("project_events"):
        pipeline(["""
            CREATE TABLE project_events (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id  INTEGER NOT NULL,
                event_type  TEXT    NOT NULL,
                title       TEXT    NOT NULL,
                description TEXT,
                status      TEXT,
                due_date    TEXT,
                completed_at TEXT,
                actor_id    TEXT    NOT NULL,
                actor_name  TEXT,
                metadata    TEXT,
                parent_event_id INTEGER,
                sort_order  INTEGER DEFAULT 0,
                created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """])
    pipeline(["CREATE INDEX IF NOT EXISTS idx_proj_events_project ON project_events(project_id, sort_order, created_at)"])
    pipeline(["CREATE INDEX IF NOT EXISTS idx_proj_events_type ON project_events(event_type, project_id)"])

    # ── project_tasks ──
    if not _table_exists("project_tasks"):
        pipeline(["""
            CREATE TABLE project_tasks (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id  INTEGER NOT NULL,
                title       TEXT    NOT NULL,
                description TEXT,
                status      TEXT    NOT NULL DEFAULT 'pending',
                priority    TEXT    DEFAULT 'medium',
                assignee_id TEXT,
                assignee_name TEXT,
                due_date    TEXT,
                completed_at TEXT,
                phase       TEXT,
                estimated_hours REAL,
                actual_hours REAL,
                sort_order  INTEGER DEFAULT 0,
                created_by  TEXT    NOT NULL,
                created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
                updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """])
    else:
        # Add missing columns to existing table
        for col, defn in [
            ("assignee_id", "TEXT"),
            ("assignee_name", "TEXT"),
            ("due_date", "TEXT"),
            ("completed_at", "TEXT"),
            ("phase", "TEXT"),
            ("estimated_hours", "REAL"),
            ("actual_hours", "REAL"),
            ("sort_order", "INTEGER DEFAULT 0"),
        ]:
            if not _column_exists("project_tasks", col):
                pipeline([f'ALTER TABLE project_tasks ADD COLUMN {col} {defn}'])

    pipeline(["CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id, status, sort_order)"])
    pipeline(["CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON project_tasks(assignee_id, status)"])

    # ── project_milestones ──
    if not _table_exists("project_milestones"):
        pipeline(["""
            CREATE TABLE project_milestones (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id  INTEGER NOT NULL,
                title       TEXT    NOT NULL,
                description TEXT,
                status      TEXT    NOT NULL DEFAULT 'upcoming',
                due_date    TEXT,
                completed_at TEXT,
                approval_status TEXT,
                financial_impact REAL DEFAULT 0,
                actor_id    TEXT,
                actor_name  TEXT,
                sort_order  INTEGER DEFAULT 0,
                created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """])
    else:
        for col, defn in [
            ("approval_status", "TEXT"),
            ("financial_impact", "REAL DEFAULT 0"),
            ("actor_id", "TEXT"),
            ("actor_name", "TEXT"),
            ("sort_order", "INTEGER DEFAULT 0"),
        ]:
            if not _column_exists("project_milestones", col):
                pipeline([f'ALTER TABLE project_milestones ADD COLUMN {col} {defn}'])

    pipeline(["CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id, status, sort_order)"])

    # ── boq_items ──
    if not _table_exists("boq_items"):
        pipeline(["""
            CREATE TABLE boq_items (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id  INTEGER NOT NULL,
                category    TEXT    NOT NULL,
                item_code   TEXT,
                item_name   TEXT    NOT NULL,
                description TEXT,
                uom         TEXT,
                quantity    REAL    NOT NULL DEFAULT 0,
                rate        REAL    NOT NULL DEFAULT 0,
                total       REAL    NOT NULL DEFAULT 0,
                status      TEXT    NOT NULL DEFAULT 'draft',
                revision    INTEGER NOT NULL DEFAULT 1,
                vendor      TEXT,
                notes       TEXT,
                sort_order  INTEGER DEFAULT 0,
                created_by  TEXT    NOT NULL,
                created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
                updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
            )
        """])
    else:
        for col, defn in [
            ("item_code", "TEXT"),
            ("uom", "TEXT"),
            ("status", "TEXT NOT NULL DEFAULT 'draft'"),
            ("revision", "INTEGER NOT NULL DEFAULT 1"),
            ("vendor", "TEXT"),
            ("notes", "TEXT"),
            ("sort_order", "INTEGER DEFAULT 0"),
        ]:
            if not _column_exists("boq_items", col):
                pipeline([f'ALTER TABLE boq_items ADD COLUMN {col} {defn}'])

    pipeline(["CREATE INDEX IF NOT EXISTS idx_boq_project ON boq_items(project_id, category, status)"])
    pipeline(["CREATE INDEX IF NOT EXISTS idx_boq_revision ON boq_items(project_id, revision)"])

    print("OK: project_events, project_tasks, project_milestones, boq_items tables migrated")


if __name__ == "__main__":
    run()
