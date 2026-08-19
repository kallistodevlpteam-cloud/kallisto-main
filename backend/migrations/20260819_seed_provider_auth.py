"""Seed minimal auth and team data for local development testing.

Creates one test provider (via service_provider_details + provider_auth)
and links them to existing projects.

Run from the backend directory:
    python migrations/20260819_seed_provider_auth.py
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402
from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

SEED_PROVIDER = {
    "sp_id": "sp-dev-001",
    "email": "dev@kallisto.in",
    "provider_name": "Dev Provider",
    "password_hash": "devpass123",
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # Ensure project_team table exists
    try:
        pipeline([
            """
            CREATE TABLE IF NOT EXISTS project_team (
                project_id INTEGER NOT NULL,
                sp_id TEXT NOT NULL,
                role TEXT,
                assigned_at INTEGER DEFAULT (strftime('%s','now')),
                PRIMARY KEY (project_id, sp_id)
            )
            """
        ])
        print("OK: project_team table exists/created")
    except Exception as error:
        print(f"SKIP: project_team table: {error}")

    # Upsert service_provider_details first (FK source for provider_auth.sp_id)
    try:
        check_result = pipeline(
            ["SELECT SP_id FROM service_provider_details WHERE SP_id = ?"],
            [[SEED_PROVIDER["sp_id"]]],
        )[0]
        check_rows = rows(check_result)
        if check_rows:
            pipeline(
                [
                    """
                    UPDATE service_provider_details
                    SET provider_name = ?, email = ?
                    WHERE SP_id = ?
                    """
                ],
                [[
                    SEED_PROVIDER["provider_name"],
                    SEED_PROVIDER["email"],
                    SEED_PROVIDER["sp_id"],
                ]],
            )
            print(f"OK: updated service_provider_details {SEED_PROVIDER['sp_id']}")
        else:
            pipeline(
                [
                    """
                    INSERT INTO service_provider_details (SP_id, provider_name, email, type)
                    VALUES (?, ?, ?, 'architect')
                    """
                ],
                [[
                    SEED_PROVIDER["sp_id"],
                    SEED_PROVIDER["provider_name"],
                    SEED_PROVIDER["email"],
                ]],
            )
            print(f"OK: inserted service_provider_details {SEED_PROVIDER['sp_id']}")
    except Exception as error:
        print(f"ERR: service_provider_details: {error}")

    # Upsert provider_auth
    try:
        check_result = pipeline(
            ["SELECT sp_id FROM provider_auth WHERE sp_id = ?"],
            [[SEED_PROVIDER["sp_id"]]],
        )[0]
        check_rows = rows(check_result)
        if check_rows:
            pipeline(
                [
                    """
                    UPDATE provider_auth
                    SET email = ?, provider_name = ?, password_hash = ?
                    WHERE sp_id = ?
                    """
                ],
                [[
                    SEED_PROVIDER["email"],
                    SEED_PROVIDER["provider_name"],
                    SEED_PROVIDER["password_hash"],
                    SEED_PROVIDER["sp_id"],
                ]],
            )
            print(f"OK: updated provider_auth {SEED_PROVIDER['email']}")
        else:
            pipeline(
                [
                    """
                    INSERT INTO provider_auth (sp_id, email, provider_name, password_hash)
                    VALUES (?, ?, ?, ?)
                    """
                ],
                [[
                    SEED_PROVIDER["sp_id"],
                    SEED_PROVIDER["email"],
                    SEED_PROVIDER["provider_name"],
                    SEED_PROVIDER["password_hash"],
                ]],
            )
            print(f"OK: inserted provider_auth {SEED_PROVIDER['email']}")
    except Exception as error:
        print(f"ERR: provider_auth: {error}")

    # Link provider to existing projects
    try:
        result = pipeline(["SELECT id FROM projects ORDER BY id"])[0]
        project_ids = [row[0] for row in rows(result)]
    except Exception as error:
        print(f"ERR: listing projects: {error}")
        return

    linked = 0
    for project_id in project_ids:
        try:
            pipeline(
                [
                    """
                    INSERT OR REPLACE INTO project_team (project_id, sp_id, role)
                    VALUES (?, ?, 'primary')
                    """
                ],
                [[project_id, SEED_PROVIDER["sp_id"]]],
            )
            linked += 1
        except Exception as error:
            print(f"SKIP: linking project {project_id}: {error}")

    print(f"OK: linked {linked} project(s) to provider {SEED_PROVIDER['sp_id']}")


if __name__ == "__main__":
    main()
