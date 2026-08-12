"""Kallisto backend server.

Owns the Turso database connection. The Next.js frontend talks only to
this server; it never reads the database environment directly.
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


def _load_dotenv() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)


_load_dotenv()

app = Flask(__name__)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_site_images(raw: Any) -> list[str]:
    """Parse the project_site.site_img_url JSON list into an array.

    A missing, null, or unparsable value returns an empty list so the
    endpoint never fails on malformed legacy data.
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


@app.get("/api/database/schema")
def database_schema():
    try:
        return jsonify(_schema_snapshot())
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


@app.get("/api/database/tables")
def database_tables():
    try:
        snapshot = _schema_snapshot()
        return jsonify({"tables": snapshot["tables"]})
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503


PROJECT_ENQ_CHARACTER = "enq"


@app.get("/api/projects")
def list_projects():
    """Return projects, optionally filtered by character (read-only).

    Each project row is enriched with its linked client name
    (client_details via the project_id link) and site place (project_site).
    """
    character = request.args.get("character", type=str)
    clause = " WHERE p.project_character = ?" if character else ""
    params: list[str] = [character] if character else []
    sql = (
        f"SELECT p.id, p.project_name, p.project_type, p.building_type, "
        f"p.project_character, p.new_construction_or_renovation, "
        f"p.purpose_of_project, p.brief_description, p.cover_image_url, "
        f"p.sq_area, p.client_expected_timeline, p.created_at, p.updated_at, "
        f"cd.client_name, ps.place, ps.site_img_url, "
        f"pb.estimated_overall_budget, ed.view "
        f"FROM projects p "
        f"LEFT JOIN client_details cd ON cd.project_id = p.id "
        f"LEFT JOIN project_site ps ON ps.project_id = p.id "
        f"LEFT JOIN project_budget pb ON pb.project_id = p.id "
        f"LEFT JOIN enquiry_details ed ON ed.project_id = p.id "
        f"{clause} ORDER BY p.id ASC"
    )
    try:
        result = pipeline([sql], [params])[0]
        column_names = [col["name"] for col in result.get("cols", [])]
        projects = [
            {column_names[i]: row[i] for i in range(len(column_names))}
            for row in rows(result)
        ]
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    # site_img_url is a JSON-encoded list of image URLs. A missing or
    # unparsable value yields an empty list (strictly backend-sourced).
    for project in projects:
        project["site_images"] = _parse_site_images(project.get("site_img_url"))
        project.pop("site_img_url", None)

    # Inspiration gallery: strictly backend-sourced, ordered list of
    # images per project (inspiration_img rows).
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
            project_id = row[0]
            images_by_project.setdefault(project_id, []).append(
                {"url": row[1], "alt": row[2]}
            )
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    # Project documents: strictly backend-sourced, ordered list of
    # document image previews per project (project_DOC rows).
    try:
        doc_result = pipeline(
            [
                "SELECT pd.project_id, pd.id, pd.doc_name, pd.doc_img_url "
                "FROM project_DOC pd "
                "ORDER BY pd.project_id, pd.sort_order, pd.id"
            ]
        )[0]
        docs_by_project: dict[int, list[dict[str, str | int | None]]] = {}
        for row in rows(doc_result):
            project_id = row[0]
            docs_by_project.setdefault(project_id, []).append(
                {"id": row[1], "name": row[2], "doc_img_url": row[3]}
            )
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    # Project scopes: strictly backend-sourced list with nested sub-lists
    # (project_scope rows with their project_scope_item children).
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
        scopes_by_project: dict[int, list[dict[str, object]]] = {}
        for row in rows(scope_result):
            scope_id, project_id, scope_name = row
            scopes_by_project.setdefault(project_id, []).append(
                {
                    "id": scope_id,
                    "scope_name": scope_name,
                    "items": items_by_scope.get(scope_id, []),
                }
            )
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    for project in projects:
        project["inspiration_images"] = images_by_project.get(project["id"], [])
        project["project_docs"] = docs_by_project.get(project["id"], [])
        project["project_scopes"] = scopes_by_project.get(project["id"], [])

    # Project requirements: strictly backend-sourced list (requirements rows
    # with their requirement_items children as item_value sub-lists).
    try:
        req_result = pipeline(
            [
                "SELECT id, project_id, requirement_name FROM requirements "
                "ORDER BY project_id, sort_order, id"
            ]
        )[0]
        req_item_result = pipeline(
            [
                "SELECT requirement_id, item_value FROM requirement_items "
                "ORDER BY requirement_id, sort_order, id"
            ]
        )[0]
        items_by_requirement: dict[str, list[str]] = {}
        for row in rows(req_item_result):
            items_by_requirement.setdefault(row[0], []).append(row[1])
        requirements_by_project: dict[int, list[dict[str, object]]] = {}
        for row in rows(req_result):
            requirement_id, project_id, requirement_name = row
            requirements_by_project.setdefault(project_id, []).append(
                {
                    "id": requirement_id,
                    "requirement_name": requirement_name,
                    "items": items_by_requirement.get(requirement_id, []),
                }
            )
    except Exception as error:  # noqa: BLE001
        return jsonify({"status": "error", "message": str(error)}), 503

    for project in projects:
        project["requirements"] = requirements_by_project.get(project["id"], [])

    return jsonify({"status": "ok", "projects": projects})


@app.post("/api/projects/<int:project_id>/view")
def mark_project_viewed(project_id: int):
    """Mark an enquiry as viewed (fire-and-forget from the detail page).

    Only touches the enquiry_details row; the projects table never
    changes. Repeated calls are idempotent.
    """
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
def accept_project(project_id: int):
    """Accept an enquiry: transition the project character enq -> pr.

    Only a project currently in the enquiry character ('enq') is
    transitioned. Already-accepted projects ('pr') return ok unchanged,
    so repeated calls are idempotent (duplicate-submission safe).
    """
    try:
        result = pipeline(
            [
                "UPDATE projects SET project_character = 'pr', "
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


@app.post("/api/database/query")
def database_query():
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


@app.get("/")
def index():
    return jsonify(
        {
            "service": "kallisto-backend",
            "endpoints": [
                "/api/health",
                "/api/database/schema",
                "/api/database/tables",
                "/api/database/query",
                "/api/projects",
            ],
        }
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=True)