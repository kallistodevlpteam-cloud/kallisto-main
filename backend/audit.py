"""Audit logging utilities for the Kallisto backend.

Every state-changing operation should call `audit_log()` to record
an immutable event. Reads are NOT logged unless they are security-sensitive.
"""

import json
from typing import Any

from turso_client import pipeline


def audit_log(
    entity_type: str,  # 'project', 'enquiry', 'proposal', 'boq', 'task', 'milestone', 'user', 'system'
    entity_id: str | int,
    action: str,         # 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'CONVERT', 'SEND', 'RESPOND', 'ASSIGN', 'PHASE_TRANSITION', etc.
    actor_id: str,
    actor_type: str = "provider",
    metadata: dict[str, Any] | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> None:
    """Write an immutable audit record to the audit_log table."""
    pipeline(
        [
            "INSERT INTO audit_log (entity_type, entity_id, action, actor_type, actor_id, metadata, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ],
        [
            [
                entity_type,
                str(entity_id),
                action,
                actor_type,
                actor_id,
                json.dumps(metadata, ensure_ascii=False) if metadata else None,
                ip_address,
                user_agent,
            ]
        ],
    )
