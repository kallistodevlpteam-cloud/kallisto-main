"""Turso (libSQL) client for the Kallisto backend.

Talks to the database through the libSQL HTTP API (/v2/pipeline).
The database URL and auth token are read from the server environment.
"""

from __future__ import annotations

import os
import re
from typing import Any

import requests

HTTP_TIMEOUT_SECONDS = 30
READ_ONLY_START = re.compile(r"^\s*(select|with|pragma|explain)\b", re.IGNORECASE)


def get_turso_config() -> tuple[str, str]:
    url = os.getenv("TURSO_DATABASE_URL", "")
    token = os.getenv("TURSO_DATABASE_TOKEN", "")

    if not url or not token:
        raise RuntimeError(
            "TURSO_DATABASE_URL and TURSO_DATABASE_TOKEN must be configured "
            "in the backend server environment."
        )

    base_url = url.replace("libsql://", "https://").rstrip("/")
    return base_url, token


def _typed_value(value: Any) -> dict[str, Any]:
    if isinstance(value, bool):
        return {"type": "integer", "value": "1" if value else "0"}
    if isinstance(value, int):
        return {"type": "integer", "value": str(value)}
    if isinstance(value, float):
        return {"type": "float", "value": str(value)}
    return {"type": "text", "value": str(value) if value is not None else None}


def _value_cell(cell: dict[str, Any]) -> Any:
    if not isinstance(cell, dict):
        return cell
    value = cell.get("value")
    cell_type = cell.get("type")
    if value is None:
        return None
    if cell_type == "integer":
        try:
            return int(value)
        except (TypeError, ValueError):
            return value
    if cell_type == "float":
        try:
            return float(value)
        except (TypeError, ValueError):
            return value
    return value


def rows(result: dict[str, Any]) -> list[list[Any]]:
    """Return plain python values for each row of a pipeline result."""
    row_list: list[list[Any]] = result.get("rows", [])
    return [[_value_cell(cell) for cell in row] for row in row_list]


def pipeline(
    sql_statements: list[str],
    args_list: list[list[Any]] | None = None,
) -> list[dict[str, Any]]:
    """Run one or more statements through the libSQL v2 pipeline.

    Each statement may carry a matching positional ``args`` list. When
    ``args_list`` is omitted, every statement runs without parameters.
    """
    base_url, token = get_turso_config()
    if args_list is None:
        args_list = [[] for _ in sql_statements]
    requests_list: list[dict[str, Any]] = []
    for index, sql in enumerate(sql_statements):
        args = args_list[index] if index < len(args_list) else []
        stmt: dict[str, Any] = {"sql": sql}
        if args:
            stmt["args"] = [_typed_value(arg) for arg in args]
        requests_list.append({"type": "execute", "stmt": stmt})
    payload: dict[str, Any] = {"requests": requests_list}
    response = requests.post(
        f"{base_url}/v2/pipeline",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
        timeout=HTTP_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    body = response.json()
    results = body.get("results", [])
    executed = []
    for step in results:
        if step.get("type") == "error":
            error = step.get("error", {})
            raise RuntimeError(
                f"Turso statement failed: {error.get('code', 'unknown')} "
                f"{error.get('message', '')}"
            )
        executed.append(step.get("response", {}).get("result", {}))
    return executed


def is_read_only(sql: str) -> bool:
    return READ_ONLY_START.match(sql.strip()) is not None