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

    table_list = pipeline(
        [
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
        ]
    )[0]
    table_names = [row[0] for row in rows(table_list)]

    statements: list[str] = []
    for name in table_names:
        statements.append(f'PRAGMA table_info("{name}")')
        statements.append(f'PRAGMA foreign_key_list("{name}")')
        statements.append(f'SELECT count(*) FROM "{name}"')

    details = pipeline(statements)

    tables: list[dict[str, Any]] = []
    for index, name in enumerate(table_names):
        column_rows = rows(details[index * 3])
        fk_rows = rows(details[index * 3 + 1])
        count_rows = rows(details[index * 3 + 2])

        columns = [
            {
                "name": row[1],
                "type": row[2],
                "notNull": bool(row[3]),
                "pk": int(row[5] or 0),
                "defaultValue": row[4],
            }
            for row in column_rows
        ]
        foreign_keys = [
            {
                "id": int(row[0]),
                "column": row[3],
                "refTable": row[2],
                "refColumn": row[4],
                "onUpdate": row[5],
                "onDelete": row[6],
            }
            for row in fk_rows
        ]
        row_count = count_rows[0][0] if count_rows else 0

        tables.append(
            {
                "name": name,
                "columns": columns,
                "foreignKeys": foreign_keys,
                "rowCount": row_count,
            }
        )

    return {
        "ok": True,
        "connected": True,
        "host": base_url,
        "fetchedAt": _iso_now(),
        "tables": tables,
    }


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


# ── Database diagnostics (protected; developers only) ────────────────

@app.get("/api/database/schema")
@require_provider
def database_schema(sp_id: str):
    try:
        return jsonify(_schema_snapshot())
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.get("/api/database/tables")
@require_provider
def database_tables(sp_id: str):
    try:
        snapshot = _schema_snapshot()
        return jsonify({"tables": snapshot["tables"]})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


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


def _enrich_and_filter_projects(raw_projects: list[dict[str, Any]], allowed_ids: list[int]) -> list[dict[str, Any]]:
    """Filter projects to allowed ids and enrich with related data."""
    projects = [p for p in raw_projects if p["id"] in allowed_ids]

    # site images
    for project in projects:
        project["site_images"] = _parse_site_images(project.get("site_img_url"))
        project.pop("site_img_url", None)
        project["provider_ids"] = _parse_string_list(project.get("provider_id"))
        project.pop("provider_id", None)

    # inspiration images
    try:
        image_result = pipeline(
            [
                "SELECT ii.project_id, ii.image_url, ii.alt_text "
                "FROM inspiration_img ii "
                "ORDER BY ii.project_id, ii.sort_order, ii.id"
            ]
        )[0]
        images_by_project: dict[int, list[dict[str, str | None]]] = {}
        for row in rows(image_result):
            pid = row[0]
            images_by_project.setdefault(pid, []).append({"url": row[1], "alt": row[2]})
    except Exception:  # noqa: BLE001
        images_by_project = {}

    # docs
    try:
        doc_result = pipeline(
            [
                "SELECT pd.project_id, pd.id, pd.doc_name, pd.doc_img_url, "
                "pd.DOC_type, pd.status, pd.updated_at "
                "FROM project_DOC pd "
                "ORDER BY pd.project_id, pd.sort_order, pd.id"
            ]
        )[0]
        docs_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(doc_result):
            pid = row[0]
            docs_by_project.setdefault(pid, []).append(
                {
                    "id": row[1],
                    "name": row[2],
                    "doc_img_url": row[3],
                    "doc_type": row[4],
                    "status": bool(row[5]),
                    "updated_at": row[6],
                }
            )
    except Exception:  # noqa: BLE001
        docs_by_project = {}

    # scopes
    try:
        scope_result = pipeline(
            [
                "SELECT ps.id, ps.project_id, ps.scope_name "
                "FROM project_scope ps "
                "ORDER BY ps.project_id, ps.sort_order, ps.id"
            ]
        )[0]
        scope_item_result = pipeline(
            [
                "SELECT si.scope_id, si.item_name "
                "FROM project_scope_item si "
                "ORDER BY si.scope_id, si.sort_order, si.id"
            ]
        )[0]
        items_by_scope: dict[int, list[str]] = {}
        for row in rows(scope_item_result):
            items_by_scope.setdefault(row[0], []).append(row[1])
        scopes_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(scope_result):
            sid, pid, name = row
            scopes_by_project.setdefault(pid, []).append(
                {"id": sid, "scope_name": name, "items": items_by_scope.get(sid, [])}
            )
    except Exception:  # noqa: BLE001
        scopes_by_project = {}

    for project in projects:
        project["inspiration_images"] = images_by_project.get(project["id"], [])
        project["project_docs"] = docs_by_project.get(project["id"], [])
        project["project_scopes"] = scopes_by_project.get(project["id"], [])

    # requirements
    try:
        req_result = pipeline(
            [
                "SELECT id, project_id, requirement_name FROM requirements "
                "ORDER BY project_id, sort_order, id"
            ]
        )[0]
        req_item_result = pipeline(
            [
                "SELECT requirement_id, item_value, details, status "
                "FROM requirement_items "
                "ORDER BY requirement_id, sort_order, id"
            ]
        )[0]
        items_by_req: dict[str, list[str]] = {}
        details_by_req: dict[str, list[list[str]]] = {}
        statuses_by_req: dict[str, list[bool | None]] = {}
        for row in rows(req_item_result):
            rid, value, details, status = row
            items_by_req.setdefault(rid, []).append(value)
            details_by_req.setdefault(rid, []).append(_parse_string_list(details))
            normalized_status: bool | None = None
            if status is not None:
                normalized_status = bool(status)
            statuses_by_req.setdefault(rid, []).append(normalized_status)
        reqs_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(req_result):
            rid, pid, name = row
            reqs_by_project.setdefault(pid, []).append(
                {
                    "id": rid,
                    "requirement_name": name,
                    "items": items_by_req.get(rid, []),
                    "item_details": details_by_req.get(rid, []),
                    "statuses": statuses_by_req.get(rid, []),
                }
            )
    except Exception:  # noqa: BLE001
        reqs_by_project = {}

    for project in projects:
        project["requirements"] = reqs_by_project.get(project["id"], [])

    # priorities
    try:
        prio_result = pipeline(
            [
                "SELECT id, project_id, priority_name "
                "FROM clientcontext_priorities "
                "ORDER BY project_id, sort_order, id"
            ]
        )[0]
        prio_detail_result = pipeline(
            [
                "SELECT priority_id, detail_value, status, tags "
                "FROM priority_details "
                "ORDER BY priority_id, sort_order, id"
            ]
        )[0]
        details_by_prio: dict[str, list[str]] = {}
        statuses_by_prio: dict[str, list[bool | None]] = {}
        tags_by_prio: dict[str, list[list[str]]] = {}
        for row in rows(prio_detail_result):
            pid, detail, status, tags = row
            details_by_prio.setdefault(pid, []).append(detail)
            normalized_status: bool | None = None
            if status is not None:
                normalized_status = bool(status)
            statuses_by_prio.setdefault(pid, []).append(normalized_status)
            tags_by_prio.setdefault(pid, []).append(_parse_string_list(tags))
        prios_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(prio_result):
            rid, pid, name = row
            prios_by_project.setdefault(pid, []).append(
                {
                    "id": rid,
                    "priority_name": name,
                    "details": details_by_prio.get(rid, []),
                    "statuses": statuses_by_prio.get(rid, []),
                    "tags": tags_by_prio.get(rid, []),
                }
            )
    except Exception:  # noqa: BLE001
        prios_by_project = {}

    for project in projects:
        project["priorities"] = prios_by_project.get(project["id"], [])

    # family members
    try:
        family_result = pipeline(
            [
                "SELECT cd.project_id, fd.family_id, fd.client_id, fd.name, "
                "fd.age, fd.job, fd.phone, fd.relation, fd.family_member_img_url, "
                "fd.description "
                "FROM family_details fd "
                "LEFT JOIN client_details cd ON cd.client_id = fd.client_id "
                "WHERE cd.project_id IS NOT NULL "
                "ORDER BY cd.project_id"
            ]
        )[0]
        family_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(family_result):
            (
                pid,
                family_id,
                client_id,
                name,
                age,
                job,
                phone,
                relation,
                img_url,
                description,
            ) = row
            family_by_project.setdefault(pid, []).append(
                {
                    "family_id": family_id,
                    "client_id": client_id,
                    "name": name,
                    "age": age,
                    "job": job,
                    "phone": phone,
                    "relation": relation,
                    "family_member_img_url": img_url,
                    "description": description,
                }
            )
    except Exception:  # noqa: BLE001
        family_by_project = {}

    for project in projects:
        project["family_members"] = family_by_project.get(project["id"], [])

    # Extended project data (clients, lifestyle, approval, communication, technical, regulatory, outdoor, spaces, timeline)
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
    for tbl, cols in ext_tables.items():
        try:
            col_str = ",".join(cols)
            ext_result = pipeline([f"SELECT project_id,{col_str} FROM {tbl}"])[0]
            ext_by_project: dict[int, dict[str, Any]] = {}
            for row in rows(ext_result):
                pid = row[0]
                ext_by_project[pid] = {cols[i]: row[i + 1] for i in range(len(cols))}
            for project in projects:
                project[tbl] = ext_by_project.get(project["id"], None)
        except Exception:  # noqa: BLE001
            for project in projects:
                project[tbl] = None

    # project_spaces is a list, not a single row
    try:
        spaces_result = pipeline(
            ["SELECT project_id,space_name,required,priority,approx_area_size,quantity,adjacency_notes FROM project_spaces"]
        )[0]
        spaces_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(spaces_result):
            pid, space_name, required, priority, approx_area, quantity, adjacency = row
            spaces_by_project.setdefault(pid, []).append(
                {
                    "space_name": space_name,
                    "required": required,
                    "priority": priority,
                    "approx_area_size": approx_area,
                    "quantity": quantity,
                    "adjacency_notes": adjacency,
                }
            )
        for project in projects:
            project["project_spaces"] = spaces_by_project.get(project["id"], [])
    except Exception:  # noqa: BLE001
        for project in projects:
            project["project_spaces"] = []

    # Proposals (one per project + provider)
    try:
        prop_result = pipeline(
            ["SELECT project_id,provider_id,id,status,total_amount,rate_notes,timeline_notes,scope_summary,rejection_reason,negotiation_notes,sent_at,responded_at FROM project_proposals"]
        )[0]
        prop_by_project: dict[int, dict[str, Any]] = {}
        for row in rows(prop_result):
            (
                pid, prov_id, prop_id, status, total_amount, rate_notes,
                timeline_notes, scope_summary, rejection_reason,
                negotiation_notes, sent_at, responded_at,
            ) = row
            prop_by_project[pid] = {
                "id": prop_id,
                "provider_id": prov_id,
                "status": status,
                "total_amount": total_amount,
                "rate_notes": rate_notes,
                "timeline_notes": timeline_notes,
                "scope_summary": scope_summary,
                "rejection_reason": rejection_reason,
                "negotiation_notes": negotiation_notes,
                "sent_at": sent_at,
                "responded_at": responded_at,
            }
        for project in projects:
            project["proposal"] = prop_by_project.get(project["id"], None)
    except Exception:  # noqa: BLE001
        for project in projects:
            project["proposal"] = None

    # Team members (sub-provider assignments)
    try:
        team_result = pipeline(
            ["SELECT project_id,provider_id,role,status,notes FROM project_team_members"]
        )[0]
        team_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(team_result):
            pid, prov_id, role, status, notes = row
            team_by_project.setdefault(pid, []).append(
                {
                    "provider_id": prov_id,
                    "role": role,
                    "status": status,
                    "notes": notes,
                }
            )
        for project in projects:
            project["team_members"] = team_by_project.get(project["id"], [])
    except Exception:  # noqa: BLE001
        for project in projects:
            project["team_members"] = []

    # Messages (provider-client communication)
    try:
        msg_result = pipeline(
            ["SELECT project_id,sender_type,sender_id,message_type,content,created_at FROM project_messages"]
        )[0]
        msg_by_project: dict[int, list[dict[str, Any]]] = {}
        for row in rows(msg_result):
            pid, sender_type, sender_id, msg_type, content, created_at = row
            msg_by_project.setdefault(pid, []).append(
                {
                    "sender_type": sender_type,
                    "sender_id": sender_id,
                    "message_type": msg_type,
                    "content": content,
                    "created_at": created_at,
                }
            )
        for project in projects:
            project["messages"] = msg_by_project.get(project["id"], [])
    except Exception:  # noqa: BLE001
        for project in projects:
            project["messages"] = []

    return projects


@app.get("/api/projects")
@require_provider
def list_projects(sp_id: str):
    """Return projects scoped to the authenticated provider.

    Optionally filtered by character (read-only) and project_status.
    Each project row is enriched with its linked client name
    (client_details via the project_id link) and site place (project_site).
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

    projects = _enrich_and_filter_projects(raw_projects, allowed_ids)
    return jsonify({"status": "ok", "projects": projects})


@app.get("/api/projects/<int:project_id>")
@require_provider
def get_project(project_id: int, sp_id: str):
    """Return a single project enriched with extended data."""
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        sql = (
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
            "WHERE p.id = ?"
        )
        result = pipeline([sql], [[project_id]])[0]
        column_names = [col["name"] for col in result.get("cols", [])]
        raw_projects = [
            {column_names[i]: row[i] for i in range(len(column_names))}
            for row in rows(result)
        ]
        if not raw_projects:
            return jsonify({"status": "error", "message": "Project not found"}), 404
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    projects = _enrich_and_filter_projects(raw_projects, [project_id])
    return jsonify({"status": "ok", "project": projects[0]})


def _ensure_project_owned(project_id: int, sp_id: str):
    """Return None if the provider owns the project, otherwise return a
    Flask (response, status) tuple for the caller to return."""
    allowed = get_provider_project_ids(sp_id)
    if project_id not in allowed:
        return jsonify(
            {"status": "error", "message": "Project not found or access denied"}
        ), 403
    return None


@app.post("/api/projects/<int:project_id>/view")
@require_provider
def mark_project_viewed(project_id: int, sp_id: str):
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        result = pipeline(
            [
                "UPDATE enquiry_details SET view = 1, "
                "updated_at = strftime('%s','now') WHERE project_id = ?"
            ],
            [[project_id]],
        )[0]
        if (result.get("affected_row_count") or 0) == 0:
            return jsonify({"status": "error", "message": "Enquiry not found"}), 404
        return jsonify({"status": "ok", "project_id": project_id, "view": 1})
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

    Body: { total_amount, rate_notes, timeline_notes, scope_summary }
    Status defaults to 'draft'. On first creation the proposal is saved as draft.
    """
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    total_amount = data.get("total_amount")
    rate_notes = data.get("rate_notes", "")
    timeline_notes = data.get("timeline_notes", "")
    scope_summary = data.get("scope_summary", "")

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
        # Insert new draft
        result = pipeline(
            [
                "INSERT INTO project_proposals (project_id, provider_id, status, total_amount, rate_notes, timeline_notes, scope_summary) "
                "VALUES (?, ?, 'draft', ?, ?, ?, ?)"
            ],
            [[project_id, sp_id, total_amount, rate_notes, timeline_notes, scope_summary]],
        )[0]
        prop_id = result.get("last_insert_rowid") or 0
        return jsonify({"status": "ok", "proposal_id": prop_id, "action": "created"})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/proposal/send")
@require_provider
def send_proposal(project_id: int, sp_id: str):
    """Send a draft proposal to the client. Updates status to 'sent' and records sent_at.

    Also inserts a system message for tracking.
    """
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
                [[project_id, f"Proposal rejected: {reason}"]],
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


# ─── Sub-provider Discovery & Assignment ───────────────────────────────────

@app.get("/api/providers/nearby")
@require_provider
def list_nearby_providers(sp_id: str):
    """List other service providers filtered by location.

    Query params: location (partial match on project_providers.location)
    Returns: list of providers with their SP_ids, location, and specialization.
    """
    location = request.args.get("location", type=str) or ""
    try:
        # Get the current provider's location for reference
        my_loc = pipeline(
            ["SELECT location FROM service_provider_details WHERE SP_id = ?"],
            [[sp_id]],
        )[0]
        my_loc_rows = rows(my_loc)
        current_location = my_loc_rows[0][0] if my_loc_rows else ""

        # Find other providers, optionally filtered by location
        if location:
            where_clause = "sp.SP_id != ? AND (sp.location LIKE ? OR pp.location LIKE ?)"
            params = [sp_id, f"%{location}%", f"%{location}%"]
        else:
            where_clause = "sp.SP_id != ? AND (sp.location = ? OR pp.location = ?)"
            params = [sp_id, current_location, current_location]

        sql = (
            f"SELECT DISTINCT sp.SP_id, sp.name, sp.specialization, sp.company_name, "
            f"sp.location, sp.phone, sp.email "
            f"FROM service_provider_details sp "
            f"LEFT JOIN project_providers pp ON pp.provider_id = sp.SP_id "
            f"WHERE {where_clause}"
        )
        result = pipeline([sql], [params])[0]
        providers = []
        for row in rows(result):
            providers.append({
                "sp_id": row[0],
                "name": row[1],
                "specialization": row[2],
                "company_name": row[3],
                "location": row[4],
                "phone": row[5],
                "email": row[6],
            })
        return jsonify({"status": "ok", "providers": providers, "current_location": current_location})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/team")
@require_provider
def assign_team_member(project_id: int, sp_id: str):
    """Assign a sub-provider (team member) to a project.

    Body: { provider_id: string, role: string, notes: string }
    """
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    assignee_id = data.get("provider_id")
    role = data.get("role", "subcontractor")
    notes = data.get("notes", "")

    if not assignee_id:
        return jsonify({"status": "error", "message": "provider_id is required"}), 400

    try:
        # Insert team member assignment
        pipeline(
            [
                "INSERT INTO project_team_members (project_id, provider_id, assigned_by, role, status, notes) "
                "VALUES (?, ?, ?, ?, 'pending', ?)"
            ],
            [[project_id, assignee_id, sp_id, role, notes]],
        )
        # Record system message
        pipeline(
            [
                "INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content) "
                "VALUES (?, 'system', ?, 'general', ?)"
            ],
            [[project_id, sp_id, f"Provider {assignee_id} assigned as {role}"]],
        )
        return jsonify({"status": "ok", "project_id": project_id, "assigned_provider": assignee_id, "role": role})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/team/<provider_id>/activate")
@require_provider
def activate_team_member(project_id: int, sp_id: str, provider_id: str):
    """Mark a team member as active (they accepted or started work)."""
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        result = pipeline(
            [
                "UPDATE project_team_members SET status = 'active', activated_at = strftime('%s','now') "
                "WHERE project_id = ? AND provider_id = ?"
            ],
            [[project_id, provider_id]],
        )[0]
        if (result.get("affected_row_count") or 0) == 0:
            return jsonify({"status": "error", "message": "Team member not found"}), 404
        return jsonify({"status": "ok", "project_id": project_id, "provider_id": provider_id, "status": "active"})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/team/<provider_id>/remove")
@require_provider
def remove_team_member(project_id: int, sp_id: str, provider_id: str):
    """Remove a team member from a project."""
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    try:
        pipeline(
            [
                "UPDATE project_team_members SET status = 'removed' WHERE project_id = ? AND provider_id = ?"
            ],
            [[project_id, provider_id]],
        )
        return jsonify({"status": "ok", "project_id": project_id, "provider_id": provider_id})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.post("/api/projects/<int:project_id>/message")
@require_provider
def send_project_message(project_id: int, sp_id: str):
    """Send a message on a project thread (provider to client or team)."""
    err = _ensure_project_owned(project_id, sp_id)
    if err:
        return err
    data = request.get_json(silent=True) or {}
    content = data.get("content", "").strip()
    message_type = data.get("message_type", "general")
    if not content:
        return jsonify({"status": "error", "message": "content is required"}), 400
    try:
        result = pipeline(
            [
                "INSERT INTO project_messages (project_id, sender_type, sender_id, message_type, content) "
                "VALUES (?, 'provider', ?, ?, ?)"
            ],
            [[project_id, sp_id, message_type, content]],
        )[0]
        msg_id = result.get("last_insert_rowid") or 0
        return jsonify({"status": "ok", "message_id": msg_id, "project_id": project_id})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


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
                "/api/database/tables",
                "/api/database/query",
                "/api/projects",
                "/api/projects/<id>",
            ],
        }
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=True)
