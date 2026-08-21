"""Cross-feature flow utilities for the Kallisto backend.

Handles actions that span multiple domain areas:
- Accept enquiry → set active, create timeline event, tasks, milestones, audit
- Reject enquiry → set rejected, create timeline event, audit
- Convert project → create tasks/milestones/BOQ scaffold, audit
- Send proposal → create proposal record + timeline event + audit
- Respond proposal → update proposal + timeline event + audit
"""

import json
from typing import Any
from datetime import datetime, timezone

from turso_client import pipeline, rows
from audit import audit_log


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_project_event(
    project_id: int,
    event_type: str,
    title: str,
    description: str | None = None,
    status: str | None = None,
    due_date: str | None = None,
    actor_id: str = "system",
    actor_name: str = "System",
    metadata: dict[str, Any] | None = None,
    parent_event_id: int | None = None,
    sort_order: int = 0,
) -> int:
    """Create a project timeline event and return its id."""
    r = pipeline(
        [
            "INSERT INTO project_events (project_id, event_type, title, description, status, due_date, actor_id, actor_name, metadata, parent_event_id, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ],
        [
            [
                project_id,
                event_type,
                title,
                description,
                status,
                due_date,
                actor_id,
                actor_name,
                json.dumps(metadata, ensure_ascii=False) if metadata else None,
                parent_event_id,
                sort_order,
                _iso_now(),
            ]
        ],
    )[0]
    # Turso returns last_insert_rowid in the result metadata for batched inserts when using libsql
    # If not available, query for max id
    row_ids = rows(r)
    if row_ids and row_ids[0]:
        return int(row_ids[0][0])
    # fallback query
    res = pipeline(["SELECT last_insert_rowid()"])[0]
    rid = rows(res)
    return int(rid[0][0]) if rid else 0


def create_project_task(
    project_id: int,
    title: str,
    description: str | None = None,
    phase: str = "Feasibility & Kickoff",
    status: str = "pending",
    priority: str = "medium",
    assignee_id: str | None = None,
    assignee_name: str | None = None,
    due_date: str | None = None,
    estimated_hours: float | None = None,
    sort_order: int = 0,
    created_by: str = "system",
) -> int:
    """Create a project task and return its id."""
    now = _iso_now()
    r = pipeline(
        [
            "INSERT INTO project_tasks (project_id, title, description, phase, status, priority, assignee_id, assignee_name, due_date, estimated_hours, sort_order, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ],
        [
            [
                project_id, title, description, phase, status, priority,
                assignee_id, assignee_name, due_date, estimated_hours,
                sort_order, created_by, now, now,
            ]
        ],
    )[0]
    rid = rows(r)
    if rid and rid[0]:
        return int(rid[0][0])
    res = pipeline(["SELECT last_insert_rowid()"])[0]
    rid2 = rows(res)
    return int(rid2[0][0]) if rid2 else 0


def create_project_milestone(
    project_id: int,
    title: str,
    description: str | None = None,
    status: str = "upcoming",
    due_date: str | None = None,
    financial_impact: float = 0,
    actor_id: str = "system",
    actor_name: str = "System",
    sort_order: int = 0,
) -> int:
    """Create a project milestone and return its id."""
    r = pipeline(
        [
            "INSERT INTO project_milestones (project_id, title, description, status, due_date, financial_impact, actor_id, actor_name, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ],
        [
            [
                project_id, title, description, status, due_date,
                financial_impact, actor_id, actor_name, sort_order, _iso_now(),
            ]
        ],
    )[0]
    rid = rows(r)
    if rid and rid[0]:
        return int(rid[0][0])
    res = pipeline(["SELECT last_insert_rowid()"])[0]
    rid2 = rows(res)
    return int(rid2[0][0]) if rid2 else 0


def create_boq_scaffold(project_id: int, created_by: str = "system") -> None:
    """Seed a default BOQ scaffold for a newly converted/accepted project."""
    categories = [
        ("Civil", [
            ("Site Preparation & Demolition", "sqft", 1, 0),
            ("Foundation Work", "sqft", 1, 0),
            ("Structural Framing", "sqft", 1, 0),
        ]),
        ("Electrical", [
            ("Electrical Wiring", "sqft", 1, 0),
            ("Lighting Fixtures", "nos", 1, 0),
            ("Switch & Socket Points", "nos", 1, 0),
        ]),
        ("Plumbing", [
            ("Water Supply Lines", "ft", 1, 0),
            ("Drainage & Sewer Lines", "ft", 1, 0),
            ("Sanitary Fixtures", "nos", 1, 0),
        ]),
        ("Interior", [
            ("Flooring", "sqft", 1, 0),
            ("Wall Treatment & Paint", "sqft", 1, 0),
            ("False Ceiling", "sqft", 1, 0),
            ("Modular Kitchen", "lumpsum", 1, 0),
        ]),
        ("Finishing", [
            ("Doors & Windows", "nos", 1, 0),
            ("Hardware & Fittings", "nos", 1, 0),
            ("Glass & Aluminium Work", "sqft", 1, 0),
        ]),
    ]
    now = _iso_now()
    for cat_idx, (cat, items) in enumerate(categories):
        for item_idx, (name, uom, qty, rate) in enumerate(items):
            pipeline(
                [
                    "INSERT INTO boq_items (project_id, category, item_name, uom, quantity, rate, total, status, sort_order, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                ],
                [
                    [
                        project_id, cat, name, uom, qty, rate, qty * rate,
                        "draft", (cat_idx * 100) + item_idx, created_by, now, now,
                    ]
                ],
            )


def accept_enquiry_flow(
    project_id: int,
    actor_id: str,
    actor_name: str = "Provider",
) -> None:
    """Full accept-enquiry cross-feature flow:
    1. Update project_status = 'active'
    2. Create timeline event
    3. Create default tasks (Feasibility & Kickoff phase)
    4. Create default milestones
    5. Create BOQ scaffold
    6. Write audit record
    """
    now = _iso_now()

    # 1. Update status
    pipeline(
        ["UPDATE projects SET project_status = ?, project_character = ?, updated_at = ? WHERE id = ?"],
        [["active", "act", now, project_id]],
    )

    # 2. Timeline event
    event_id = create_project_event(
        project_id=project_id,
        event_type="conversion",
        title="Project Activated",
        description=f"Enquiry accepted by {actor_name}. Project moved to active execution phase.",
        status="completed",
        actor_id=actor_id,
        actor_name=actor_name,
        metadata={"from_status": "enq", "to_status": "active", "action": "accept"},
        sort_order=0,
    )

    # 3. Default tasks
    default_tasks = [
        ("Site Feasibility Report", "pending", "high", "Feasibility & Kickoff", 7),
        ("Initial Client Meeting & Briefing", "pending", "high", "Feasibility & Kickoff", 3),
        ("Concept Design & Mood Board", "pending", "medium", "Concept", 14),
        ("Space Planning & Layout", "pending", "medium", "Concept", 14),
        ("Material & Finish Selection", "pending", "low", "Design Development", 21),
        ("Working Drawings & Details", "pending", "medium", "Design Development", 21),
        ("BOQ Preparation", "pending", "high", "Design Development", 14),
        ("Contractor Procurement", "pending", "medium", "Execution", 30),
        ("Site Supervision & Quality Checks", "pending", "high", "Execution", 90),
        ("Final Handover & Snag List", "pending", "high", "Post-handover", 7),
    ]
    for idx, (title, status, priority, phase, days) in enumerate(default_tasks):
        due = (datetime.fromisoformat(now.replace("Z", "+00:00")) if now.endswith("Z") else datetime.fromisoformat(now))
        due_str = (due + __import__("datetime").timedelta(days=days)).isoformat()
        create_project_task(
            project_id=project_id,
            title=title,
            phase=phase,
            status=status,
            priority=priority,
            assignee_id=actor_id,
            assignee_name=actor_name,
            due_date=due_str,
            sort_order=idx,
            created_by=actor_id,
        )

    # 4. Default milestones
    milestones = [
        ("Concept Approval", "upcoming", 14, 0),
        ("Design Development Complete", "upcoming", 45, 0),
        ("Tender & Contractor Selection", "upcoming", 60, 0),
        ("Construction Start", "upcoming", 75, 0),
        ("MEP Rough-in Complete", "upcoming", 120, 0),
        ("Final Handover", "upcoming", 180, 0),
    ]
    for idx, (title, status, days, financial) in enumerate(milestones):
        due = (datetime.fromisoformat(now.replace("Z", "+00:00")) if now.endswith("Z") else datetime.fromisoformat(now))
        due_str = (due + __import__("datetime").timedelta(days=days)).isoformat()
        create_project_milestone(
            project_id=project_id,
            title=title,
            status=status,
            due_date=due_str,
            financial_impact=financial,
            actor_id=actor_id,
            actor_name=actor_name,
            sort_order=idx,
        )

    # 5. BOQ scaffold
    create_boq_scaffold(project_id, created_by=actor_id)

    # 6. Audit
    audit_log(
        entity_type="project",
        entity_id=project_id,
        action="ACCEPT",
        actor_id=actor_id,
        actor_type="provider",
        metadata={"event_id": event_id, "tasks_created": len(default_tasks), "milestones_created": len(milestones)},
    )


def reject_enquiry_flow(
    project_id: int,
    actor_id: str,
    reason: str | None = None,
    actor_name: str = "Provider",
) -> None:
    """Full reject-enquiry cross-feature flow:
    1. Update project_status = 'rejected'
    2. Create timeline event with reason
    3. Write audit record
    """
    now = _iso_now()
    pipeline(
        ["UPDATE projects SET project_status = ?, project_character = ?, updated_at = ? WHERE id = ?"],
        [["rejected", "rej", now, project_id]],
    )

    event_id = create_project_event(
        project_id=project_id,
        event_type="rejection",
        title="Enquiry Rejected",
        description=f"Rejected by {actor_name}. Reason: {reason or 'Not specified'}.",
        status="completed",
        actor_id=actor_id,
        actor_name=actor_name,
        metadata={"from_status": "enq", "to_status": "rejected", "reason": reason},
        sort_order=0,
    )

    audit_log(
        entity_type="project",
        entity_id=project_id,
        action="REJECT",
        actor_id=actor_id,
        actor_type="provider",
        metadata={"event_id": event_id, "reason": reason},
    )


def convert_project_flow(
    project_id: int,
    actor_id: str,
    actor_name: str = "Provider",
) -> None:
    """Full convert-to-project cross-feature flow:
    1. Update project_character = 'act', project_status = 'active'
    2. Create timeline event
    3. Create default tasks
    4. Create milestones
    5. Create BOQ scaffold
    6. Write audit record
    """
    now = _iso_now()
    pipeline(
        ["UPDATE projects SET project_status = ?, project_character = ?, updated_at = ? WHERE id = ?"],
        [["active", "act", now, project_id]],
    )

    event_id = create_project_event(
        project_id=project_id,
        event_type="conversion",
        title="Enquiry Converted to Project",
        description=f"Converted by {actor_name}. Full project lifecycle initiated.",
        status="completed",
        actor_id=actor_id,
        actor_name=actor_name,
        metadata={"from_status": "enq", "to_status": "active", "action": "convert"},
        sort_order=0,
    )

    # Reuse same scaffold as accept
    default_tasks = [
        ("Site Feasibility Report", "pending", "high", "Feasibility & Kickoff", 7),
        ("Initial Client Meeting & Briefing", "pending", "high", "Feasibility & Kickoff", 3),
        ("Concept Design & Mood Board", "pending", "medium", "Concept", 14),
        ("Space Planning & Layout", "pending", "medium", "Concept", 14),
        ("Material & Finish Selection", "pending", "low", "Design Development", 21),
        ("Working Drawings & Details", "pending", "medium", "Design Development", 21),
        ("BOQ Preparation", "pending", "high", "Design Development", 14),
        ("Contractor Procurement", "pending", "medium", "Execution", 30),
        ("Site Supervision & Quality Checks", "pending", "high", "Execution", 90),
        ("Final Handover & Snag List", "pending", "high", "Post-handover", 7),
    ]
    for idx, (title, status, priority, phase, days) in enumerate(default_tasks):
        due = (datetime.fromisoformat(now.replace("Z", "+00:00")) if now.endswith("Z") else datetime.fromisoformat(now))
        due_str = (due + __import__("datetime").timedelta(days=days)).isoformat()
        create_project_task(
            project_id=project_id, title=title, phase=phase,
            status=status, priority=priority,
            assignee_id=actor_id, assignee_name=actor_name,
            due_date=due_str, sort_order=idx, created_by=actor_id,
        )

    milestones = [
        ("Concept Approval", "upcoming", 14, 0),
        ("Design Development Complete", "upcoming", 45, 0),
        ("Tender & Contractor Selection", "upcoming", 60, 0),
        ("Construction Start", "upcoming", 75, 0),
        ("MEP Rough-in Complete", "upcoming", 120, 0),
        ("Final Handover", "upcoming", 180, 0),
    ]
    for idx, (title, status, days, financial) in enumerate(milestones):
        due = (datetime.fromisoformat(now.replace("Z", "+00:00")) if now.endswith("Z") else datetime.fromisoformat(now))
        due_str = (due + __import__("datetime").timedelta(days=days)).isoformat()
        create_project_milestone(
            project_id=project_id, title=title, status=status,
            due_date=due_str, financial_impact=financial,
            actor_id=actor_id, actor_name=actor_name, sort_order=idx,
        )

    create_boq_scaffold(project_id, created_by=actor_id)

    audit_log(
        entity_type="project",
        entity_id=project_id,
        action="CONVERT",
        actor_id=actor_id,
        actor_type="provider",
        metadata={"event_id": event_id, "tasks_created": len(default_tasks), "milestones_created": len(milestones)},
    )


def send_proposal_flow(
    project_id: int,
    actor_id: str,
    proposal_data: dict[str, Any],
    actor_name: str = "Provider",
) -> None:
    """Record proposal sent and create timeline event + audit."""
    event_id = create_project_event(
        project_id=project_id,
        event_type="proposal_sent",
        title="Proposal Sent to Client",
        description=f"Proposal sent by {actor_name}.",
        status="completed",
        actor_id=actor_id,
        actor_name=actor_name,
        metadata={"proposal": proposal_data},
        sort_order=0,
    )
    audit_log(
        entity_type="proposal",
        entity_id=project_id,
        action="SEND",
        actor_id=actor_id,
        actor_type="provider",
        metadata={"event_id": event_id, "proposal": proposal_data},
    )


def respond_proposal_flow(
    project_id: int,
    actor_id: str,
    decision: str,  # 'approved', 'rejected', 'revision_requested'
    actor_name: str = "Client",
    reason: str | None = None,
) -> None:
    """Record proposal response and create timeline event + audit."""
    event_id = create_project_event(
        project_id=project_id,
        event_type="proposal_responded",
        title=f"Proposal {decision.title()}",
        description=f"Proposal {decision} by {actor_name}. Reason: {reason or 'N/A'}",
        status="completed",
        actor_id=actor_id,
        actor_name=actor_name,
        metadata={"decision": decision, "reason": reason},
        sort_order=0,
    )
    audit_log(
        entity_type="proposal",
        entity_id=project_id,
        action=decision.upper(),
        actor_id=actor_id,
        actor_type="client",
        metadata={"event_id": event_id, "reason": reason},
    )
