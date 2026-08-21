"""Create audit_log table for immutable audit trail of all project and system events."""

import sys
import os
from pathlib import Path

from dotenv import load_dotenv

# Load backend env before importing turso_client
_backend_dir = Path(__file__).resolve().parent.parent
_env_path = _backend_dir / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

sys.path.insert(0, str(_backend_dir))
from turso_client import pipeline

SQL = """
CREATE TABLE IF NOT EXISTS audit_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT    NOT NULL,                       -- 'project', 'enquiry', 'proposal', 'boq', 'task', 'milestone', 'user', 'system'
    entity_id   TEXT    NOT NULL,                       -- the PK of the entity being acted upon
    action      TEXT    NOT NULL,                       -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'CONVERT', 'SEND', 'ASSIGN', etc.
    actor_type  TEXT    NOT NULL,                       -- 'provider', 'client', 'system', 'admin'
    actor_id    TEXT    NOT NULL,                       -- the SP_id or user_id who performed the action
    metadata    TEXT,                                 -- JSON blob with before/after state, reason, etc.
    ip_address  TEXT,
    user_agent  TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor  ON audit_log(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);
"""

if __name__ == "__main__":
    for stmt in SQL.strip().split(";"):
        stmt = stmt.strip()
        if stmt:
            pipeline([stmt])
    print("OK: audit_log table + indexes created/verified")
