"""Kallisto backend server.

Owns the Turso database connection. The Next.js frontend talks only to
this server; it never reads the database environment directly.

Authentication uses stateless JWT tokens (Bearer scheme). Every protected
endpoint expects an `Authorization: Bearer <token>` header. The token is
issued by POST /api/auth/login and carries the provider's SP_id.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from flask import Flask, jsonify, request

from turso_client import get_turso_config, is_read_only, pipeline, rows

from auth import (  # noqa: E402
    authenticate_provider,
    get_auth_sp_id,
    get_provider_project_ids,
    require_provider,
)


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    alt_env_path = Path(__file__).resolve().parent / "env"
    if alt_env_path.exists():
        load_dotenv(alt_env_path)


_load_dotenv()

app = Flask(__name__)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_site_images(raw: Any) -> list[str]:
    """Parse the project_site.site_img_url JSON list into an array.

    A missing, null, or unparsable value returns an empty list so the
    endpoint never fails on malformed legacy data.
    """
    return _parse_string_list(raw)


def _parse_string_list(raw: Any) -> list[str]:
    """Parse a JSON-encoded list of strings into an array.

    A missing, null, or unparsable value returns an empty list so the
    endpoint never fails on malformed legacy data. Shared by site images
    and requirement item details.
    """
    if isinstance(raw, list):
        return [item for item in raw if isinstance(item, str)]
    if not isinstance(raw, str) or not raw.strip():
        return []
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return []
    if not isinstance(parsed, list):
        return []
    return [item for item in parsed if isinstance(item, str)]


def _schema_snapshot() -> dict[str, Any]:
    base_url, _ = get_turso_config()
    return {
        "status": "ok",
        "connected": True,
        "database_url": base_url,
        "tables": _list_tables(),
    }


def _list_tables() -> list[str]:
    try:
        result = pipeline(
            [
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            ]
        )[0]
        return [row[0] for row in rows(result)]
    except Exception:  # noqa: BLE001
        return []


# ── Auth helpers ─────────────────────────────────────────────────────


def _ensure_project_owned(project_id: int, sp_id: str):
    """Return an error response tuple if the provider does not own the project."""
    allowed = get_provider_project_ids(sp_id)
    allowed_str = [str(a) for a in allowed]
    if str(project_id) not in allowed_str:
        return jsonify({"status": "error", "message": "Forbidden"}), 403
    return None


# ── Public routes ────────────────────────────────────────────────────


@app.get("/")
def index():
    return jsonify(
        {
            "service": "kallisto-backend",
            "endpoints": [
                "/api/health",
                "/api/auth/login",
                "/api/auth/me",
                "/api/database/schema",
                "/api/database/query",
                "/api/projects",
                "/api/projects/<id>",
                "/api/projects/<id>/accept",
                "/api/projects/<id>/reject",
                "/api/projects/<id>/convert",
                "/api/projects/<id>/view",
                "/api/projects/<id>/proposal",
                "/api/projects/<id>/proposal/send",
                "/api/projects/<id>/proposal/respond",
            ],
        }
    )


@app.get("/api/health")
def health():
    try:
        pipeline(["SELECT 1"])
        return jsonify({"status": "ok", "database": "connected"})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "database": "unreachable", "message": str(error)}), 503


# ── Auth endpoints (public) ──────────────────────────────────────────

@app.post("/api/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    if not email or not password:
        return jsonify({"status": "error", "message": "email and password are required"}), 400
    sp_id, token = authenticate_provider(email, password)
    if sp_id is None:
        return jsonify({"status": "error", "message": token}), 401
    return jsonify({"status": "ok", "token": token, "sp_id": sp_id})


@app.get("/api/auth/me")
@require_provider
def auth_me(sp_id: str):
    try:
        result = pipeline(
            [
                "SELECT email, provider_name FROM provider_auth WHERE sp_id = ?"
            ],
            [[sp_id]],
        )[0]
        row_data = rows(result)
        if not row_data:
            return jsonify({"status": "error", "message": "Provider not found"}), 404
        email, name = row_data[0]
        return jsonify({"status": "ok", "sp_id": sp_id, "email": email, "provider_name": name})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


# ── Database introspection (protected) ───────────────────────────────

@app.get("/api/database/schema")
@require_provider
def database_schema(sp_id: str):
    return jsonify(_schema_snapshot())


@app.post("/api/database/query")
@require_provider
def database_query(sp_id: str):
    body = request.get_json(silent=True) or {}
    sql = str(body.get("sql", "")).strip()
    if not sql:
        return jsonify({"status": "error", "message": "sql is required"}), 400
    if not is_read_only(sql):
        return jsonify({"status": "error", "message": "Only read-only queries are allowed."}), 403

    try:
        result = pipeline([sql])[0]
        return jsonify(
            {
                "status": "ok",
                "cols": [col["name"] for col in result.get("cols", [])],
                "rows": rows(result),
            }
        )
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


# ── Projects (provider-scoped) ─────────────────────────────────────

PROJECT_ENQ_CHARACTER = "enq"


# ---------------------------------------------------------------------------
# Optimised enrichment – batches independent queries into a single Turso
# pipeline call and only fetches heavy relation data on the detail view.
# ---------------------------------------------------------------------------

def _enrich_list_projects(projects: list[dict[str, Any]], project_ids: list[int]) -> list[dict[str, Any]]:
    """Lightweight enrichment for list views.

    Only fetches: inspiration images, docs, scopes (without items),
    requirements (without items), priorities (without details), proposals,
    team members, messages, project_spaces, and the 8 ext tables.
    Heavy item/detail tables are skipped to keep latency low.
    """
    if not projects:
        return []

    id_placeholders = ",".join("?" for _ in project_ids)

    # --- Batch 1: All independent single-table queries -------------------
    batch_sqls: list[str] = []
    batch_args: list[list[Any]] = []

    # 0. inspiration images
    batch_sqls.append(
        f"SELECT project_id, image_url, alt_text FROM inspiration_img "
        f"WHERE project_id IN ({id_placeholders}) ORDER BY project_id, sort_order, id"
    )
    batch_args.append(project_ids)

    # 1. project docs
    batch_sqls.append(
        f"SELECT project_id, id, doc_name, doc_img_url, DOC_type, status, updated_at "
        f"FROM project_DOC WHERE project_id IN ({id_placeholders}) "
        f"ORDER BY project_id, sort_order, id"
    )
    batch_args.append(project_ids)

    # 2. project scopes (parent rows only – no items)
    batch_sqls.append(
        f"SELECT id, project_id, scope_name FROM project_scope "
        f"WHERE project_id IN ({id_placeholders}) ORDER BY project_id, sort_order, id"
    )
    batch_args.append(project_ids)

    # 3. requirements (parent rows only – no items)
    batch_sqls.append(
        f"SELECT id, project_id, requirement_name FROM requirements "
        f"WHERE project_id IN ({id_placeholders}) ORDER BY project_id, sort_order, id"
    )
    batch_args.append(project_ids)

    # 4. priorities (parent rows only – no details)
    batch_sqls.append(
        f"SELECT id, project_id, priority_name FROM clientcontext_priorities "
        f"WHERE project_id IN ({id_placeholders}) ORDER BY project_id, sort_order, id"
    )
    batch_args.append(project_ids)

    # 5. family members
    batch_sqls.append(
        f"SELECT cd.project_id, fd.family_id, fd.client_id, fd.name, fd.age, fd.job, "
        f"fd.phone, fd.relation, fd.family_member_img_url, fd.description "
        f"FROM family_details fd LEFT JOIN client_details cd ON cd.client_id = fd.client_id "
        f"WHERE cd.project_id IN ({id_placeholders}) ORDER BY cd.project_id"
    )
    batch_args.append(project_ids)

    # 6-13. Extended tables (8 tables)
    ext_tables = {
        "project_clients": ["about_client", "building_users", "family_or_team_size", "elderly_members", "children", "pets", "work_from_home", "accessibility_requirements"],
        "project_lifestyle": ["daily_routine", "entertain_guests", "host_parties", "relaxation_place", "morning_coffee_location", "outdoor_activities", "hobbies", "privacy_importance"],
        "project_approval_process": ["primary_decision_maker", "other_approval_stakeholders", "expected_revision_rounds", "design_review_method", "approval_turnaround_time"],
        "project_communication": ["preferred_contact", "communication_channel", "meeting_frequency", "best_time_to_reach", "special_instructions"],
        "project_technical": ["energy_efficient_design", "solar_panels", "rainwater_harvesting", "smart_home_automation", "hvac_preference", "backup_power", "water_storage_borewell", "security_system_requirements", "preferred_material_techs"],
        "project_regulatory": ["zoning_restrictions", "height_restrictions", "home_owner_association_rules", "permits_obtained", "land_disputes_encumbrances", "setback_requirements"],
        "project_outdoor": ["garden", "swimming_pool", "outdoor_deck_patio", "bbq_area", "parking", "driveway_gate_notes", "landscape_boundary_fencing", "outdoor_lighting", "play_area_children", "pet_friendly_outdoor"],
        "project_timeline": ["desired_start_date", "desired_completion_date", "fixed_deadline_notes", "phased", "phases_description", "urgency_level"],
    }
    ext_table_names = list(ext_tables.keys())
    for tbl, cols in ext_tables.items():
        col_str = ",".join(cols)
        batch_sqls.append(
            f"SELECT project_id,{col_str} FROM {tbl} WHERE project_id IN ({id_placeholders})"
        )
        batch_args.append(project_ids)

    # 14. project_spaces
    batch_sqls.append(
        f"SELECT project_id, space_name, required, priority, approx_area_size, quantity, adjacency_notes "
        f"FROM project_spaces WHERE project_id IN ({id_placeholders})"
    )
    batch_args.append(project_ids)

    # 15. proposals
    batch_sqls.append(
        f"SELECT project_id, provider_id, id, status, total_amount, rate_notes, timeline_notes, "
        f"scope_summary, rejection_reason, negotiation_notes, sent_at, responded_at "
        f"FROM project_proposals WHERE project_id IN ({id_placeholders}) ORDER BY project_id, id"
    )
    batch_args.append(project_ids)

    # 16. team members
    batch_sqls.append(
        f"SELECT project_id, provider_id, role, status, notes FROM project_team_members "
        f"WHERE project_id IN ({id_placeholders})"
    )
    batch_args.append(project_ids)

    # 17. messages
    batch_sqls.append(
        f"SELECT project_id, sender_type, sender_id, message_type, content, created_at "
        f"FROM project_messages WHERE project_id IN ({id_placeholders})"
    )
    batch_args.append(project_ids)

    # Execute batch
    try:
        batch_results = pipeline(batch_sqls, batch_args)
    except Exception:  # noqa: BLE001
        # If batch fails, degrade gracefully – return projects without enrichment
        return projects

    # Parse batch results by index
    # idx 0: inspiration images
    images_by_project: dict[int, list[dict[str, str | None]]] = {}
    for row in rows(batch_results[0]):
        images_by_project.setdefault(row[0], []).append({"url": row[1], "alt": row[2]})

    # idx 1: docs
    docs_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[1]):
        docs_by_project.setdefault(row[0], []).append({
            "id": row[1], "name": row[2], "doc_img_url": row[3],
            "doc_type": row[4], "status": bool(row[5]), "updated_at": row[6],
        })

    # idx 2: scopes (parent only)
    scopes_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[2]):
        scopes_by_project.setdefault(row[1], []).append({"id": row[0], "scope_name": row[2], "items": []})

    # idx 3: requirements (parent only)
    reqs_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[3]):
        reqs_by_project.setdefault(row[1], []).append({"id": row[0], "requirement_name": row[2], "items": [], "item_details": [], "statuses": []})

    # idx 4: priorities (parent only)
    prios_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[4]):
        prios_by_project.setdefault(row[1], []).append({"id": row[0], "priority_name": row[2], "details": [], "statuses": [], "tags": []})

    # idx 5: family members
    family_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[5]):
        family_by_project.setdefault(row[0], []).append({
            "family_id": row[1], "client_id": row[2], "name": row[3],
            "age": row[4], "job": row[5], "phone": row[6],
            "relation": row[7], "family_member_img_url": row[8], "description": row[9],
        })

    # idx 6-13: extended tables
    ext_by_project: dict[str, dict[int, dict[str, Any]]] = {}
    for t_idx, tbl in enumerate(ext_table_names):
        r_idx = 6 + t_idx
        cols = ext_tables[tbl]
        tbl_data: dict[int, dict[str, Any]] = {}
        for row in rows(batch_results[r_idx]):
            pid = row[0]
            tbl_data[pid] = {cols[i]: row[i + 1] for i in range(len(cols))}
        ext_by_project[tbl] = tbl_data

    # idx 14: project_spaces
    spaces_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[14]):
        spaces_by_project.setdefault(row[0], []).append({
            "space_name": row[1], "required": row[2], "priority": row[3],
            "approx_area_size": row[4], "quantity": row[5], "adjacency_notes": row[6],
        })

    # idx 15: proposals
    prop_by_project: dict[int, dict[str, Any]] = {}
    for row in rows(batch_results[15]):
        prop_by_project[row[0]] = {
            "id": row[2], "provider_id": row[1], "status": row[3],
            "total_amount": row[4], "rate_notes": row[5], "timeline_notes": row[6],
            "scope_summary": row[7], "rejection_reason": row[8],
            "negotiation_notes": row[9], "sent_at": row[10], "responded_at": row[11],
        }

    # idx 16: team members
    team_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[16]):
        team_by_project.setdefault(row[0], []).append({
            "provider_id": row[1], "role": row[2], "status": row[3], "notes": row[4],
        })

    # idx 17: messages
    msg_by_project: dict[int, list[dict[str, Any]]] = {}
    for row in rows(batch_results[17]):
        msg_by_project.setdefault(row[0], []).append({
            "sender_type": row[1], "sender_id": row[2], "message_type": row[3],
            "content": row[4], "created_at": row[5],
        })

    # Assemble
    for project in projects:
        pid = project["id"]
        project["site_images"] = _parse_site_images(project.get("site_img_url"))
        project.pop("site_img_url", None)
        project["provider_ids"] = _parse_string_list(project.get("provider_id"))
        project.pop("provider_id", None)
        project["inspiration_images"] = images_by_project.get(pid, [])
        project["project_docs"] = docs_by_project.get(pid, [])
        project["project_scopes"] = scopes_by_project.get(pid, [])
        project["requirements"] = reqs_by_project.get(pid, [])
        project["priorities"] = prios_by_project.get(pid, [])
        project["family_members"] = family_by_project.get(pid, [])
        for tbl in ext_table_names:
            project[tbl] = ext_by_project[tbl].get(pid, None)
        project["project_spaces"] = spaces_by_project.get(pid, [])
        project["proposal"] = prop_by_project.get(pid, None)
        project["team_members"] = team_by_project.get(pid, [])
        project["messages"] = msg_by_project.get(pid, [])

    return projects


def _enrich_detail_project(project: dict[str, Any]) -> dict[str, Any]:
    """Full enrichment for a single project detail view.

    Fetches scope items, requirement items, and priority details that are
    skipped in the lightweight list enrichment.
    """
    pid = project["id"]
    id_placeholders = "?"
    project_ids = [pid]

    # Scope items
    try:
        scope_result = pipeline(
            [f"SELECT id, project_id, scope_name FROM project_scope WHERE project_id IN ({id_placeholders}) ORDER BY project_id, sort_order, id"],
            [project_ids],
        )[0]
        scope_ids = [row[0] for row in rows(scope_result)]
        if scope_ids:
            sidp = ",".join("?" for _ in scope_ids)
            item_result = pipeline(
                [f"SELECT scope_id, item_name FROM project_scope_item WHERE scope_id IN ({sidp}) ORDER BY scope_id, sort_order, id"],
                [scope_ids],
            )[0]
            items_by_scope: dict[int, list[str]] = {}
            for row in rows(item_result):
                items_by_scope.setdefault(row[0], []).append(row[1])
            scopes = []
            for row in rows(scope_result):
                scopes.append({"id": row[0], "scope_name": row[2], "items": items_by_scope.get(row[0], [])})
            project["project_scopes"] = scopes
    except Exception:  # noqa: BLE001
        pass

    # Requirement items
    try:
        req_result = pipeline(
            [f"SELECT id, project_id, requirement_name FROM requirements WHERE project_id IN ({id_placeholders}) ORDER BY project_id, sort_order, id"],
            [project_ids],
        )[0]
        req_ids = [row[0] for row in rows(req_result)]
        if req_ids:
            ridp = ",".join("?" for _ in req_ids)
            item_result = pipeline(
                [f"SELECT requirement_id, item_value, details, status FROM requirement_items WHERE requirement_id IN ({ridp}) ORDER BY requirement_id, sort_order, id"],
                [req_ids],
            )[0]
            items_by_req: dict[str, list[str]] = {}
            details_by_req: dict[str, list[list[str]]] = {}
            statuses_by_req: dict[str, list[bool | None]] = {}
            for row in rows(item_result):
                rid, value, details, status = row
                items_by_req.setdefault(rid, []).append(value)
                details_by_req.setdefault(rid, []).append(_parse_string_list(details))
                statuses_by_req.setdefault(rid, []).append(bool(status) if status is not None else None)
            reqs = []
            for row in rows(req_result):
                rid = row[0]
                reqs.append({
                    "id": rid, "requirement_name": row[2],
                    "items": items_by_req.get(rid, []),
                    "item_details": details_by_req.get(rid, []),
                    "statuses": statuses_by_req.get(rid, []),
                })
            project["requirements"] = reqs
    except Exception:  # noqa: BLE001
        pass

    # Priority details
    try:
        prio_result = pipeline(
            [f"SELECT id, project_id, priority_name FROM clientcontext_priorities WHERE project_id IN ({id_placeholders}) ORDER BY project_id, sort_order, id"],
            [project_ids],
        )[0]
        prio_ids = [row[0] for row in rows(prio_result)]
        if prio_ids:
            pidp = ",".join("?" for _ in prio_ids)
            detail_result = pipeline(
                [f"SELECT priority_id, detail_value, status, tags FROM priority_details WHERE priority_id IN ({pidp}) ORDER BY priority_id, sort_order, id"],
                [prio_ids],
            )[0]
            details_by_prio: dict[str, list[str]] = {}
            statuses_by_prio: dict[str, list[bool | None]] = {}
            tags_by_prio: dict[str, list[list[str]]] = {}
            for row in rows(detail_result):
                prid, detail, status, tags = row
                details_by_prio.setdefault(prid, []).append(detail)
                statuses_by_prio.setdefault(prid, []).append(bool(status) if status is not None else None)
                tags_by_prio.setdefault(prid, []).append(_parse_string_list(tags))
            prios = []
            for row in rows(prio_result):
                rid = row[0]
                prios.append({
                    "id": rid, "priority_name": row[2],
                    "details": details_by_prio.get(rid, []),
                    "statuses": statuses_by_prio.get(rid, []),
                    "tags": tags_by_prio.get(rid, []),
                })
            project["priorities"] = prios
    except Exception:  # noqa: BLE001
        pass

    return project


@app.get("/api/projects")
@require_provider
def list_projects(sp_id: str):
    """Return projects scoped to the authenticated provider.

    Optionally filtered by character (read-only) and project_status.
    Uses lightweight enrichment (single batched pipeline call).
    """
    allowed_ids = get_provider_project_ids(sp_id)
    if not allowed_ids:
        return jsonify({"status": "ok", "projects": []})

    character = request.args.get("character", type=str)
    status = request.args.get("status", type=str)
    filters: list[str] = []
    params: list[Any] = []
    if character:
        filters.append("p.project_character = ?")
        params.append(character)
    if status:
        filters.append("p.project_status = ?")
        params.append(status)
    where_extra = " AND " + " AND ".join(filters) if filters else ""

    id_placeholders = ",".join("?" for _ in allowed_ids)
    sql = (
        f"SELECT p.id, p.project_name, p.project_type, p.building_type, "
        f"p.project_character, p.new_construction_or_renovation, "
        f"p.purpose_of_project, p.brief_description, p.cover_image_url, "
        f"p.sq_area, p.client_expected_timeline, p.over_view, p.provider_id, "
        f"p.created_at, p.updated_at, p.project_status, "
        f"cd.client_name, ps.place, ps.site_img_url, "
        f"pb.estimated_overall_budget, ed.view "
        f"FROM projects p "
        f"LEFT JOIN client_details cd ON cd.project_id = p.id "
        f"LEFT JOIN project_site ps ON ps.project_id = p.id "
        f"LEFT JOIN project_budget pb ON pb.project_id = p.id "
        f"LEFT JOIN enquiry_details ed ON ed.project_id = p.id "
        f"WHERE p.id IN ({id_placeholders}){where_extra} ORDER BY p.id ASC"
    )
    try:
        result = pipeline([sql], [allowed_ids + params])[0]
        column_names = [col["name"] for col in result.get("cols", [])]
        raw_projects = [
            {column_names[i]: row[i] for i in range(len(column_names))}
            for row in rows(result)
        ]
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    projects = _enrich_list_projects(raw_projects, [p["id"] for p in raw_projects])
    return jsonify({"status": "ok", "projects": projects})


@app.get("/api/projects/<int:project_id>")
@require_provider
def get_project(project_id: int, sp_id: str):
    """Return a single project enriched with extended data."""
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        result = pipeline(
            [
                "SELECT p.id, p.project_name, p.project_type, p.building_type, "
                "p.project_character, p.new_construction_or_renovation, "
                "p.purpose_of_project, p.brief_description, p.cover_image_url, "
                "p.sq_area, p.client_expected_timeline, p.over_view, p.provider_id, "
                "p.created_at, p.updated_at, p.project_status, "
                "cd.client_name, ps.place, ps.site_img_url, "
                "pb.estimated_overall_budget, ed.view "
                "FROM projects p "
                "LEFT JOIN client_details cd ON cd.project_id = p.id "
                "LEFT JOIN project_site ps ON ps.project_id = p.id "
                "LEFT JOIN project_budget pb ON pb.project_id = p.id "
                "LEFT JOIN enquiry_details ed ON ed.project_id = p.id "
                "WHERE p.id = ?",
            ],
            [[project_id]],
        )[0]
        column_names = [col["name"] for col in result.get("cols", [])]
        row_data = rows(result)
        if not row_data:
            return jsonify({"status": "error", "message": "Project not found"}), 404
        project = {column_names[i]: row_data[0][i] for i in range(len(column_names))}
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    # Lightweight list enrichment first
    projects = _enrich_list_projects([project], [project_id])
    if projects:
        project = _enrich_detail_project(projects[0])
    return jsonify({"status": "ok", "project": project})


@app.post("/api/projects/<int:project_id>/view")
@require_provider
def mark_project_viewed(project_id: int, sp_id: str):
    """Mark a project as viewed (idempotent)."""
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        pipeline(
            [
                "UPDATE projects SET view = COALESCE(view, 0) + 1, updated_at = strftime('%s','now') WHERE id = ?"
            ],
            [[project_id]],
        )
        return jsonify({"status": "ok", "project_id": project_id})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/accept")
@require_provider
def accept_project(project_id: int, sp_id: str):
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        result = pipeline(
            [
                "UPDATE projects SET project_character = 'pr', "
                "project_status = 'active', "
                "updated_at = strftime('%s','now') "
                "WHERE id = ? AND project_character = 'enq'"
            ],
            [[project_id]],
        )[0]
        if (result.get("affected_row_count") or 0) == 0:
            current = pipeline(
                ["SELECT project_character FROM projects WHERE id = ?"],
                [[project_id]],
            )[0]
            current_rows = rows(current)
            if not current_rows or current_rows[0][0] is None:
                return jsonify({"status": "error", "message": "Project not found"}), 404
            character = current_rows[0][0]
            if character == "pr":
                return jsonify({"status": "ok", "project_id": project_id, "project_character": "pr"})
            if character != "enq":
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": f"Project character '{character}' cannot be accepted",
                        }
                    ),
                    409,
                )
        return jsonify({"status": "ok", "project_id": project_id, "project_character": "pr"})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/reject")
@require_provider
def reject_project(project_id: int, sp_id: str):
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    rejection_reason = str(data.get("rejection_reason", "")).strip()
    notes = str(data.get("notes", "")).strip()

    try:
        result = pipeline(
            [
                "UPDATE projects SET project_character = 'rej', "
                "provider_id = '[]', "
                "updated_at = strftime('%s','now') "
                "WHERE id = ? AND project_character = 'enq'"
            ],
            [[project_id]],
        )[0]
        # Store structured rejection in project_messages for audit
        if rejection_reason or notes:
            pipeline(
                [
                    "INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content) "
                    "VALUES (?, 'provider', ?, 'rejection', ?)"
                ],
                [[project_id, sp_id, rejection_reason or notes or "Enquiry rejected by provider"]],
            )
        if (result.get("affected_row_count") or 0) == 0:
            current = pipeline(
                ["SELECT project_character, provider_id FROM projects WHERE id = ?"],
                [[project_id]],
            )[0]
            current_rows = rows(current)
            if not current_rows or current_rows[0][0] is None:
                return jsonify({"status": "error", "message": "Project not found"}), 404
            character = current_rows[0][0]
            if character == "rej":
                provider_list = current_rows[0][1]
                if provider_list is not None and str(provider_list).strip() != "[]":
                    pipeline(
                        [
                            "UPDATE projects SET provider_id = '[]', "
                            "updated_at = strftime('%s','now') "
                            "WHERE id = ? AND project_character = 'rej'"
                        ],
                        [[project_id]],
                    )
                return (
                    jsonify(
                        {"status": "ok", "project_id": project_id, "project_character": "rej"}
                    ),
                    200,
                )
            if character != "enq":
                return (
                    jsonify(
                        {
                            "status": "error",
                            "message": f"Project character '{character}' cannot be rejected",
                        }
                    ),
                    409,
                )
        return jsonify({"status": "ok", "project_id": project_id, "project_character": "rej"})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/convert")
@require_provider
def convert_project(project_id: int, sp_id: str):
    """Convert an accepted proposal into an operational project.

    Idempotent: repeated calls return the same project context.
    Requires the project to have an accepted proposal.
    """
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        # Verify an accepted proposal exists
        prop_result = pipeline(
            [
                "SELECT id, provider_id FROM project_proposals "
                "WHERE project_id = ? AND status = 'accepted'"
            ],
            [[project_id]],
        )[0]
        prop_rows = rows(prop_result)
        if not prop_rows:
            return jsonify(
                {"status": "error", "message": "No accepted proposal found for conversion"}
            ), 409
        prop_id, prop_provider_id = prop_rows[0]

        # Verify current character is 'pr' (accepted enquiry)
        current = pipeline(
            ["SELECT project_character, project_status FROM projects WHERE id = ?"],
            [[project_id]],
        )[0]
        current_rows = rows(current)
        if not current_rows:
            return jsonify({"status": "error", "message": "Project not found"}), 404
        character, status_val = current_rows[0]
        if character != "pr":
            return jsonify(
                {
                    "status": "error",
                    "message": f"Project character '{character}' cannot be converted. Must be 'pr'.",
                }
            ), 409

        # Idempotent conversion
        if status_val == "converted":
            return jsonify(
                {
                    "status": "ok",
                    "project_id": project_id,
                    "project_status": "converted",
                    "converted": False,
                    "message": "Project already converted",
                }
            )

        pipeline(
            [
                "UPDATE projects SET project_status = 'converted', "
                "updated_at = strftime('%s','now') "
                "WHERE id = ? AND project_character = 'pr'"
            ],
            [[project_id]],
        )
        # Record system message for audit trail
        pipeline(
            [
                "INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content) "
                "VALUES (?, 'system', 'system', 'approval', 'Project converted from accepted proposal')"
            ],
            [[project_id]],
        )
        return jsonify(
            {
                "status": "ok",
                "project_id": project_id,
                "project_status": "converted",
                "proposal_id": prop_id,
                "provider_id": prop_provider_id,
                "converted": True,
            }
        )
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


# ─── Proposal / Rates Flow ───────────────────────────────────────────────────

@app.post("/api/projects/<int:project_id>/proposal")
@require_provider
def create_proposal(project_id: int, sp_id: str):
    """Create or update a proposal for a project.

    Status defaults to 'draft'. On first creation the proposal is saved as draft.
    """
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    total_amount = data.get("total_amount")
    rate_notes = str(data.get("rate_notes", "")).strip()
    timeline_notes = str(data.get("timeline_notes", "")).strip()
    scope_summary = str(data.get("scope_summary", "")).strip()

    try:
        # Check if a draft proposal already exists for this project + provider
        existing = pipeline(
            ["SELECT id FROM project_proposals WHERE project_id = ? AND provider_id = ? AND status = 'draft'"],
            [[project_id, sp_id]],
        )[0]
        existing_rows = rows(existing)
        if existing_rows:
            prop_id = existing_rows[0][0]
            pipeline(
                [
                    "UPDATE project_proposals SET total_amount = ?, rate_notes = ?, "
                    "timeline_notes = ?, scope_summary = ?, updated_at = strftime('%s','now') "
                    "WHERE id = ?"
                ],
                [[total_amount, rate_notes, timeline_notes, scope_summary, prop_id]],
            )
            return jsonify({"status": "ok", "proposal_id": prop_id, "action": "updated"})

        result = pipeline(
            [
                "INSERT INTO project_proposals (project_id, provider_id, status, total_amount, rate_notes, timeline_notes, scope_summary) "
                "VALUES (?, ?, 'draft', ?, ?, ?, ?)"
            ],
            [[project_id, sp_id, total_amount, rate_notes, timeline_notes, scope_summary]],
        )[0]
        prop_id = result.get("last_insert_rowid")
        return jsonify({"status": "ok", "proposal_id": prop_id, "action": "created"})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/proposal/send")
@require_provider
def send_proposal(project_id: int, sp_id: str):
    """Send a draft proposal to the client. Updates status to 'sent' and records sent_at."""
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        result = pipeline(
            [
                "UPDATE project_proposals SET status = 'sent', sent_at = strftime('%s','now'), "
                "updated_at = strftime('%s','now') "
                "WHERE project_id = ? AND provider_id = ? AND status = 'draft'"
            ],
            [[project_id, sp_id]],
        )[0]
        if (result.get("affected_row_count") or 0) == 0:
            return jsonify({"status": "error", "message": "No draft proposal found to send"}), 409
        # Record system message
        pipeline(
            [
                "INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content) "
                "VALUES (?, 'system', 'system', 'proposal', 'Proposal sent to client')"
            ],
            [[project_id]],
        )
        return jsonify({"status": "ok", "project_id": project_id, "proposal_status": "sent"})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/proposal/respond")
def respond_to_proposal(project_id: int):
    """Client accepts or rejects a proposal.

    Body: { decision: 'accept' | 'reject', reason?: string, negotiation_notes?: string }
    No auth required here (client-facing endpoint).
    """
    data = request.get_json(silent=True) or {}
    decision = data.get("decision")
    reason = data.get("reason", "")
    negotiation_notes = data.get("negotiation_notes", "")

    if decision not in ("accept", "reject"):
        return jsonify({"status": "error", "message": "Decision must be 'accept' or 'reject'"}), 400

    try:
        # Find the sent proposal for this project
        prop_result = pipeline(
            ["SELECT id, provider_id FROM project_proposals WHERE project_id = ? AND status = 'sent'"],
            [[project_id]],
        )[0]
        prop_rows = rows(prop_result)
        if not prop_rows:
            return jsonify({"status": "error", "message": "No sent proposal found for this project"}), 404
        prop_id = prop_rows[0][0]
        prop_provider_id = prop_rows[0][1]

        if decision == "accept":
            # Update proposal to accepted
            pipeline(
                [
                    "UPDATE project_proposals SET status = 'accepted', responded_at = strftime('%s','now'), "
                    "updated_at = strftime('%s','now') WHERE id = ?"
                ],
                [[prop_id]],
            )
            # Update project to active
            pipeline(
                [
                    "UPDATE projects SET project_status = 'active', updated_at = strftime('%s','now') "
                    "WHERE id = ?"
                ],
                [[project_id]],
            )
            # Record approval message
            pipeline(
                [
                    "INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content) "
                    "VALUES (?, 'client', 'client', 'approval', 'Proposal accepted')"
                ],
                [[project_id]],
            )
            return jsonify({"status": "ok", "project_id": project_id, "proposal_status": "accepted", "project_status": "active"})
        else:
            # Rejection with reason and negotiation
            pipeline(
                [
                    "UPDATE project_proposals SET status = 'rejected', rejection_reason = ?, "
                    "negotiation_notes = ?, responded_at = strftime('%s','now'), "
                    "updated_at = strftime('%s','now') WHERE id = ?"
                ],
                [[reason, negotiation_notes, prop_id]],
            )
            # Record rejection message
            pipeline(
                [
                    "INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content) "
                    "VALUES (?, 'client', 'client', 'rejection', ?)"
                ],
                [[project_id, reason or "Proposal rejected by client"]],
            )
            return jsonify({
                "status": "ok",
                "project_id": project_id,
                "proposal_status": "rejected",
                "rejection_reason": reason,
                "negotiation_notes": negotiation_notes,
            })
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8000")), debug=True)
