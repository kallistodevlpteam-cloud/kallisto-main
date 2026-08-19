"""Minimal auth module for the Kallisto backend.

Provides JWT-based authentication for service providers using the
provider_auth table in Turso. This is a development placeholder that
can be replaced with production-grade auth later.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone, timedelta
from functools import wraps
from typing import Any

import jwt
from flask import request

from turso_client import pipeline, rows


JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_token(sp_id: str) -> str:
    payload = {
        "sp_id": sp_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _decode_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        return None


def _verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash.

    Attempts bcrypt first (production), falls back to plaintext
    comparison for development if bcrypt is unavailable or fails.
    """
    # Try bcrypt first if it looks like a bcrypt hash
    if stored_hash.startswith(("$2b$", "$2a$", "$2y$")):
        try:
            import bcrypt
            return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))
        except Exception:
            # bcrypt not available or hash malformed; fall through
            pass
    # Fallback: plaintext comparison (dev only — do not use in production)
    return stored_hash == password


def authenticate_provider(email: str, password: str):
    """Authenticate a provider and return (sp_id, token).

    On failure returns (None, error_message).
    """
    try:
        result = pipeline(
            [
                "SELECT sp_id, password_hash FROM provider_auth WHERE email = ?",
            ],
            [[email]],
        )[0]
        row_data = rows(result)
        if not row_data:
            return None, "Invalid email or password"
        sp_id, stored_hash = row_data[0]
        if not _verify_password(password, stored_hash):
            return None, "Invalid email or password"
        token = _make_token(sp_id)
        return sp_id, token
    except Exception as error:
        return None, str(error)


def get_auth_sp_id() -> str | None:
    """Extract sp_id from the Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    payload = _decode_token(token)
    if not payload:
        return None
    return payload.get("sp_id")


def get_provider_project_ids(sp_id: str) -> list[str]:
    """Return the list of project IDs visible to the provider."""
    try:
        result = pipeline(
            [
                "SELECT project_id FROM project_team WHERE sp_id = ?",
            ],
            [[sp_id]],
        )[0]
        return [row[0] for row in rows(result) if row]
    except Exception:
        return []


def require_provider(f):
    """Decorator to protect routes with provider Bearer token auth."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        sp_id = get_auth_sp_id()
        if sp_id is None:
            return {"status": "error", "message": "Unauthorized"}, 401
        kwargs["sp_id"] = sp_id
        return f(*args, **kwargs)
    return wrapper
