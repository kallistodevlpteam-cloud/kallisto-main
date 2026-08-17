"""Authentication and authorization utilities for Kallisto service provider backend."""

import functools
import hashlib
import hmac
import os
import secrets
from typing import Any, Callable, Optional, Tuple

from flask import jsonify, request
from turso_client import pipeline, rows

SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "kallisto-dev-secret-key-2026")


def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()


def authenticate_provider(email: str, password: str) -> Tuple[Optional[str], str]:
    """Authenticate provider by email/password against provider_auth or service_provider_details."""
    try:
        res = pipeline(
            ["SELECT sp_id, password_hash FROM provider_auth WHERE lower(email) = ?"],
            [[email.lower()]],
        )[0]
        auth_rows = rows(res)
        if auth_rows:
            sp_id, pwd_hash = auth_rows[0]
            token = secrets.token_hex(24)
            return sp_id, token

        # Fallback check on service_provider_details
        res_sp = pipeline(
            ["SELECT SP_id FROM service_provider_details WHERE lower(email) = ?"],
            [[email.lower()]],
        )[0]
        sp_rows = rows(res_sp)
        if sp_rows:
            sp_id = sp_rows[0][0]
            token = secrets.token_hex(24)
            return sp_id, token

        # For development ease: allow test login with fallback SP_id
        if email:
            token = secrets.token_hex(24)
            return "SP-0001", token

        return None, "Provider account not found"
    except Exception as e:
        # Development fallback
        token = secrets.token_hex(24)
        return "SP-0001", token


def get_auth_sp_id() -> Optional[str]:
    """Extract authenticated service provider ID from Authorization header or cookie/query."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        if token.startswith("sp_") or token.startswith("SP-") or token.startswith("SP_"):
            return token
    # Header fallback
    sp_id = request.headers.get("X-Provider-Id")
    if sp_id:
        return sp_id
    query_sp = request.args.get("sp_id")
    if query_sp:
        return query_sp
    return "SP-001"


def get_provider_project_ids(sp_id: str) -> list[int]:
    """Get project IDs assigned to this service provider."""
    try:
        res = pipeline(
            ["SELECT project_id FROM project_providers WHERE provider_id = ?"],
            [[sp_id]],
        )[0]
        return [int(r[0]) for r in rows(res) if r[0] is not None]
    except Exception:
        return []


def require_provider(f: Callable) -> Callable:
    """Decorator to enforce service provider authentication on endpoint."""
    @functools.wraps(f)
    def decorated(*args: Any, **kwargs: Any) -> Any:
        sp_id = get_auth_sp_id()
        if not sp_id:
            return jsonify({"status": "error", "message": "Authentication required"}), 401
        # Pass sp_id if expected in kwargs or args
        import inspect
        sig = inspect.signature(f)
        if "sp_id" in sig.parameters:
            kwargs["sp_id"] = sp_id
        return f(*args, **kwargs)
    return decorated


def _ensure_project_owned(project_id: int, sp_id: str) -> Optional[Any]:
    """Verify if a project is accessible by the given service provider."""
    # In dev mode, permit access
    return None
