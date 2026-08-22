"""Create provider_auth table and link service providers to authentication.

Also renames project_providers.SP_id to SP_ids for JSON-list clarity.

Run from the backend directory:
    python migrations/20260814_provider_auth.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(errors="replace")
    except ValueError:
        pass

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

PROVIDER_AUTH_DDL = """
CREATE TABLE IF NOT EXISTS provider_auth (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    sp_id       TEXT NOT NULL UNIQUE REFERENCES service_provider_details(SP_id),
    provider_name TEXT NOT NULL DEFAULT '',
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at  INTEGER NOT NULL DEFAULT (strftime('%s','now'))
)
"""

# Rename SP_id to SP_ids to reflect JSON-list semantics.
# SQLite cannot rename a column with ALTER TABLE, so rebuild.
PROJECT_PROVIDERS_V3_DDL = """
CREATE TABLE project_providers_v3 (
    provider_id TEXT PRIMARY KEY,
    SP_ids      TEXT NOT NULL DEFAULT '[]',
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
)
"""


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # 1. Create provider_auth table.
    try:
        pipeline([PROVIDER_AUTH_DDL])
        print("OK: provider_auth table created (or already exists)")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: creating provider_auth failed: {str(error)[:200]}")

    # 2. Seed the default provider account for SP-0001.
    try:
        existing = pipeline(["SELECT count(*) FROM provider_auth"])[0]
        if rows(existing)[0][0] > 0:
            print("INFO: provider_auth already seeded; skipping")
        else:
            # Password: "Kallisto123!" (bcrypt hashed below via python)
            import bcrypt  # noqa: E402
            pw = bcrypt.hashpw("Kallisto123!".encode(), bcrypt.gensalt(rounds=12)).decode()
            pipeline(
                [
                    "INSERT INTO provider_auth (email, password_hash, sp_id, provider_name) "
                    "VALUES (?, ?, ?, ?)"
                ],
                [["studio@kallisto.in", pw, "SP-0001", "Kallisto Design Studio"]],
            )
            print("OK: seeded provider_auth for SP-0001 / studio@kallisto.in")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: seeding provider_auth failed: {str(error)[:200]}")

    # 3. Rebuild project_providers with SP_ids column name.
    try:
        # Check current column names
        info = pipeline(["PRAGMA table_info(project_providers)"])[0]
        cols = {row[1] for row in rows(info)}
        if "SP_ids" in cols:
            print("INFO: project_providers already has SP_ids; skipping rename")
        else:
            pipeline(
                [
                    "PRAGMA foreign_keys=OFF",
                    PROJECT_PROVIDERS_V3_DDL,
                    "INSERT INTO project_providers_v3 SELECT provider_id, SP_id, created_at, updated_at FROM project_providers",
                    "DROP TABLE project_providers",
                    "ALTER TABLE project_providers_v3 RENAME TO project_providers",
                    "PRAGMA foreign_keys=ON",
                ]
            )
            print("OK: rebuilt project_providers with SP_ids column")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: rebuilding project_providers failed: {str(error)[:200]}")

    # 4. Verify seed data.
    for row in rows(pipeline(["SELECT provider_id, SP_ids FROM project_providers"])[0]):
        print(f"VERIFY project_providers {row[0]}: SP_ids={row[1]}")

    for row in rows(pipeline(["SELECT email, sp_id, provider_name FROM provider_auth"])[0]):
        print(f"VERIFY provider_auth {row[0]}: sp={row[1]} name={row[2]}")

    print("OK: provider auth migration complete")


if __name__ == "__main__":
    main()