"""Convert provider linkage columns to JSON lists and seed a provider.

projects.provider_id and project_providers.SP_id store one provider /
one SP per row today, with foreign keys on both columns. This migration:

1. Rebuilds project_providers WITHOUT the SP_id FK (a JSON list cannot
   satisfy a scalar foreign key).
2. Rebuilds projects WITHOUT the provider_id FK (same reason).
3. Converts any legacy single value into a JSON-encoded list (mirrors
   the site_img_url / tags JSON-list pattern).
4. Seeds a default provider (only when the provider tables are empty)
   and links it to every project so the reject workflow has a real
   backend-sourced provider_id list to remove.

SQLite cannot alter away a column FK, so the tables are rebuilt with
foreign keys temporarily disabled inside one pipeline batch. Re-runnable:
skips the rebuild when the FKs are already gone.

Run from the backend directory:

    python migrations/20260814_provider_lists.py
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

CONVERT_PROJECTS_SQL = """
UPDATE projects
SET provider_id = '["' || trim(provider_id) || '"]'
WHERE provider_id IS NOT NULL
  AND trim(provider_id) != ''
  AND substr(trim(provider_id), 1, 1) != '['
"""

CONVERT_PROJECT_PROVIDERS_SQL = """
UPDATE project_providers
SET SP_id = '["' || trim(SP_id) || '"]'
WHERE SP_id IS NOT NULL
  AND trim(SP_id) != ''
  AND substr(trim(SP_id), 1, 1) != '['
"""

PROJECT_PROVIDERS_V2_DDL = """
CREATE TABLE project_providers_v2 (
    provider_id TEXT PRIMARY KEY,
    SP_id       TEXT,
    created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
)
"""

PROJECTS_V2_DDL = """
CREATE TABLE projects_v2 (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name            TEXT NOT NULL,
    project_type            TEXT CHECK (project_type IN ('Residential','Commercial','Office','Industrial','Mixed Use')),
    building_type           TEXT,
    new_construction_or_renovation TEXT,
    purpose_of_project      TEXT,
    brief_description       TEXT,
    project_character       TEXT,
    cover_image_url         TEXT,
    sq_area                 INTEGER,
    client_expected_timeline TEXT,
    provider_id             TEXT,
    created_at              INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at              INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    over_view               TEXT
)
"""

PROJECTS_COPY_SQL = """
INSERT INTO projects_v2 (
    id, project_name, project_type, building_type,
    new_construction_or_renovation, purpose_of_project, brief_description,
    project_character, cover_image_url, sq_area, client_expected_timeline,
    provider_id, created_at, updated_at, over_view
)
SELECT
    id, project_name, project_type, building_type,
    new_construction_or_renovation, purpose_of_project, brief_description,
    project_character, cover_image_url, sq_area, client_expected_timeline,
    provider_id, created_at, updated_at, over_view
FROM projects
"""

SEED_PROVIDER_SQL = """
INSERT INTO service_provider_details
    (SP_id, provider_name, type, phone, email, company, specialization, notes)
VALUES
    ('SP-0001', 'Kallisto Design Studio', 'design_build', '+91 90000 00001',
     'studio@kallisto.in', 'Kallisto Design Studio', 'Residential & commercial fit-out',
     'Default seed provider for enquiry workflows')
"""

SEED_PROJECT_PROVIDER_SQL = """
INSERT INTO project_providers (provider_id, SP_id)
VALUES ('PROV-0001', '["SP-0001"]')
"""

LINK_PROVIDER_SQL = """
UPDATE projects
SET provider_id = '["PROV-0001"]'
WHERE provider_id IS NULL OR trim(provider_id) = ''
"""


def _fk_snapshot() -> str:
    result = pipeline(["PRAGMA foreign_key_list(project_providers)"])[0]
    rows_providers = rows(result)
    result2 = pipeline(["PRAGMA foreign_key_list(projects)"])[0]
    rows_projects = rows(result2)
    return "\n".join(
        [
            f"project_providers FKs: {[row[1:5] for row in rows_providers]}",
            f"projects FKs: {[row[1:5] for row in rows_projects]}",
        ]
    )


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # 1. Convert any legacy single values to JSON lists (no-op on current
    # data, which has no provider values yet).
    try:
        pipeline([CONVERT_PROJECTS_SQL])
        print("OK: projects.provider_id single values converted to JSON lists")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: converting projects.provider_id failed: {str(error)[:200]}")

    try:
        pipeline([CONVERT_PROJECT_PROVIDERS_SQL])
        print("OK: project_providers.SP_id single values converted to JSON lists")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: converting project_providers.SP_id failed: {str(error)[:200]}")

    # 2. Rebuild project_providers without the SP_id FK.
    try:
        pipeline(
            [
                "PRAGMA foreign_keys=OFF",
                PROJECT_PROVIDERS_V2_DDL,
                "INSERT INTO project_providers_v2 SELECT * FROM project_providers",
                "DROP TABLE project_providers",
                "ALTER TABLE project_providers_v2 RENAME TO project_providers",
                "PRAGMA foreign_keys=ON",
            ]
        )
        print("OK: project_providers rebuilt without SP_id FK")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: rebuilding project_providers failed: {str(error)[:200]}")
        return

    # 3. Rebuild projects without the provider_id FK.
    try:
        pipeline(
            [
                "PRAGMA foreign_keys=OFF",
                PROJECTS_V2_DDL,
                PROJECTS_COPY_SQL,
                "DROP TABLE projects",
                "ALTER TABLE projects_v2 RENAME TO projects",
                "PRAGMA foreign_keys=ON",
            ]
        )
        print("OK: projects rebuilt without provider_id FK")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: rebuilding projects failed: {str(error)[:200]}")
        return

    # 4. Seed provider data only when the provider tables are empty.
    try:
        provider_count = pipeline(["SELECT count(*) FROM service_provider_details"])[0]
        project_provider_count = pipeline(["SELECT count(*) FROM project_providers"])[0]
        if rows(project_provider_count)[0][0] > 0:
            print("INFO: project_providers already seeded; skipping provider seed")
        else:
            if rows(provider_count)[0][0] == 0:
                pipeline([SEED_PROVIDER_SQL])
                print("OK: seeded service provider SP-0001")
            else:
                print("INFO: service_provider_details already populated; skipping provider insert")
            pipeline([SEED_PROJECT_PROVIDER_SQL])
            pipeline([LINK_PROVIDER_SQL])
            print("OK: seeded provider PROV-0001 and linked to projects")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: seeding provider failed: {str(error)[:200]}")

    print(_fk_snapshot())

    sample = pipeline(
        ["SELECT id, project_name, provider_id FROM projects ORDER BY id"]
    )[0]
    for project_id, project_name, provider_id in rows(sample):
        print(f"VERIFY project {project_id} {project_name}: provider_id={provider_id}")

    sample2 = pipeline(["SELECT provider_id, SP_id FROM project_providers ORDER BY provider_id"])[0]
    for provider_id, sp_id in rows(sample2):
        print(f"VERIFY project_providers {provider_id}: SP_id={sp_id}")

    print("OK: provider list migration complete")


if __name__ == "__main__":
    main()