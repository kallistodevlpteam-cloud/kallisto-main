"""Kallisto backend server.

Owns the Turso database connection. The Next.js frontend talks only to
this server; it never reads the database environment directly.
"""

from __future__ import annotations

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
    alt_env_path = Path(__file__).resolve().parent / "env"
    if alt_env_path.exists():
        load_dotenv(alt_env_path)


_load_dotenv()

app = Flask(__name__)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


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
    (client_details via project_clients) and site place (project_site).
    """
    character = request.args.get("character", type=str)
    clause = " WHERE p.project_character = ?" if character else ""
    params: list[str] = [character] if character else []
    sql = (
        f"SELECT p.id, p.project_name, p.project_type, p.building_type, "
        f"p.project_character, p.new_construction_or_renovation, "
        f"p.purpose_of_project, p.brief_description, p.cover_image_url, "
        f"NULL as created_at, NULL as updated_at, cd.client_name, ps.place "
        f"FROM projects p "
        f"LEFT JOIN project_clients pc ON pc.project_id = p.id "
        f"LEFT JOIN client_details cd ON cd.client_id = pc.client_id "
        f"LEFT JOIN project_site ps ON ps.project_id = p.id "
        f"{clause} ORDER BY p.id ASC"
    )
    try:
        result = pipeline([sql], [params])[0]
        column_names = [col["name"] for col in result.get("cols", [])]
        projects = [
            {column_names[i]: row[i] for i in range(len(column_names))}
            for row in rows(result)
        ]
        return jsonify({"status": "ok", "projects": projects})
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