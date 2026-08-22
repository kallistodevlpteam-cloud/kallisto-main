"""Comprehensive database audit for Kallisto backend.

Checks:
1. All tables, columns, row counts
2. Foreign key integrity (orphaned records)
3. JSON column validity (provider_id, SP_ids, etc.)
4. Cross-table consistency (projects without providers, etc.)
5. Empty tables
6. Data value distributions
"""

from __future__ import annotations

import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / ".env")

from turso_client import pipeline, rows

def run():
    print("=" * 60)
    print("KALLISTO DATABASE AUDIT")
    print("=" * 60)

    # 1. Table inventory
    print("\n--- 1. TABLE INVENTORY ---")
    tbl_result = pipeline([
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ])[0]
    table_names = [row[0] for row in rows(tbl_result)]
    print(f"Total tables: {len(table_names)}")
    for name in table_names:
        info = pipeline([f'PRAGMA table_info("{name}")'])[0]
        cols = [(r[1], r[2], bool(r[3])) for r in rows(info)]
        count = rows(pipeline([f'SELECT count(*) FROM "{name}"'])[0])[0][0]
        print(f"  {name}: {count} rows, columns: {[c[0] for c in cols]}")

    # 2. Orphan checks
    print("\n--- 2. ORPHAN / REFERENTIAL INTEGRITY CHECKS ---")
    checks = [
        ("projects with NULL provider_id", "SELECT count(*) FROM projects WHERE provider_id IS NULL OR provider_id = '' OR provider_id = '[]'"),
        ("client_details without matching project", "SELECT count(*) FROM client_details cd WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = cd.project_id)"),
        ("project_site without matching project", "SELECT count(*) FROM project_site ps WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = ps.project_id)"),
        ("project_budget without matching project", "SELECT count(*) FROM project_budget pb WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = pb.project_id)"),
        ("enquiry_details without matching project", "SELECT count(*) FROM enquiry_details ed WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = ed.project_id)"),
        ("project_scope without matching project", "SELECT count(*) FROM project_scope ps WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = ps.project_id)"),
        ("requirements without matching project", "SELECT count(*) FROM requirements r WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = r.project_id)"),
        ("clientcontext_priorities without matching project", "SELECT count(*) FROM clientcontext_priorities cp WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = cp.project_id)"),
        ("project_DOC without matching project", "SELECT count(*) FROM project_DOC pd WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = pd.project_id)"),
        ("inspiration_img without matching project", "SELECT count(*) FROM inspiration_img ii WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = ii.project_id)"),
        ("family_details without matching client_details", "SELECT count(*) FROM family_details fd WHERE NOT EXISTS (SELECT 1 FROM client_details cd WHERE cd.client_id = fd.client_id)"),
        ("priority_details without matching clientcontext_priorities", "SELECT count(*) FROM priority_details pd WHERE NOT EXISTS (SELECT 1 FROM clientcontext_priorities cp WHERE cp.id = pd.priority_id)"),
        ("requirement_items without matching requirements", "SELECT count(*) FROM requirement_items ri WHERE NOT EXISTS (SELECT 1 FROM requirements r WHERE r.id = ri.requirement_id)"),
        ("project_scope_item without matching project_scope", "SELECT count(*) FROM project_scope_item si WHERE NOT EXISTS (SELECT 1 FROM project_scope ps WHERE ps.id = si.scope_id)"),
        ("project_providers SP_ids referencing non-existent SP", """
            SELECT count(*) FROM project_providers pp WHERE (
                SELECT count(*) FROM json_each(pp.SP_ids) 
                WHERE json_each.value NOT IN (SELECT SP_id FROM service_provider_details)
            ) > 0
        """),
        ("projects provider_id referencing non-existent project_providers", """
            SELECT count(*) FROM projects p WHERE (
                SELECT count(*) FROM json_each(p.provider_id)
                WHERE json_each.value NOT IN (SELECT provider_id FROM project_providers)
            ) > 0 AND p.provider_id != '[]'
        """),
        ("provider_auth sp_id referencing non-existent service_provider", "SELECT count(*) FROM provider_auth pa WHERE pa.sp_id NOT IN (SELECT SP_id FROM service_provider_details)"),
    ]

    for label, sql in checks:
        try:
            result = rows(pipeline([sql])[0])[0][0]
            status = "OK" if result == 0 else f"ISSUE: {result} orphans"
            print(f"  {label}: {status}")
        except Exception as e:
            print(f"  {label}: ERROR - {str(e)[:80]}")

    # 3. JSON column validity
    print("\n--- 3. JSON COLUMN VALIDITY ---")
    json_checks = [
        ("projects.provider_id malformed JSON", "SELECT count(*) FROM projects WHERE provider_id IS NOT NULL AND provider_id NOT IN ('', '[]') AND json_valid(provider_id) = 0"),
        ("project_providers.SP_ids malformed JSON", "SELECT count(*) FROM project_providers WHERE SP_ids IS NOT NULL AND SP_ids != '' AND json_valid(SP_ids) = 0"),
        ("project_site.site_img_url malformed JSON", "SELECT count(*) FROM project_site WHERE site_img_url IS NOT NULL AND site_img_url != '' AND json_valid(site_img_url) = 0"),
        ("priority_details.tags malformed JSON", "SELECT count(*) FROM priority_details WHERE tags IS NOT NULL AND tags != '' AND json_valid(tags) = 0"),
    ]
    for label, sql in json_checks:
        try:
            result = rows(pipeline([sql])[0])[0][0]
            status = "OK" if result == 0 else f"ISSUE: {result} invalid"
            print(f"  {label}: {status}")
        except Exception as e:
            print(f"  {label}: ERROR - {str(e)[:80]}")

    # 4. Data distributions
    print("\n--- 4. DATA DISTRIBUTIONS ---")
    dist_checks = [
        ("projects by character", "SELECT project_character, count(*) FROM projects GROUP BY project_character"),
        ("projects by provider_id", "SELECT provider_id, count(*) FROM projects GROUP BY provider_id"),
        ("service_provider_details by type", "SELECT type, count(*) FROM service_provider_details GROUP BY type"),
        ("provider_auth by sp_id", "SELECT sp_id, count(*) FROM provider_auth GROUP BY sp_id"),
        ("client_details by project_id", "SELECT project_id, count(*) FROM client_details GROUP BY project_id"),
        ("requirements by project_id", "SELECT project_id, count(*) FROM requirements GROUP BY project_id"),
        ("clientcontext_priorities by project_id", "SELECT project_id, count(*) FROM clientcontext_priorities GROUP BY project_id"),
        ("project_site by project_id", "SELECT project_id, count(*) FROM project_site GROUP BY project_id"),
        ("project_budget by project_id", "SELECT project_id, count(*) FROM project_budget GROUP BY project_id"),
        ("enquiry_details by project_id", "SELECT project_id, count(*) FROM enquiry_details GROUP BY project_id"),
        ("inspiration_img by project_id", "SELECT project_id, count(*) FROM inspiration_img GROUP BY project_id"),
        ("project_DOC by project_id", "SELECT project_id, count(*) FROM project_DOC GROUP BY project_id"),
        ("family_details by client_id", "SELECT client_id, count(*) FROM family_details GROUP BY client_id"),
    ]
    for label, sql in dist_checks:
        try:
            result = rows(pipeline([sql])[0])
            print(f"  {label}:")
            for row in result:
                print(f"    {row[0]!r}: {row[1]}")
        except Exception as e:
            print(f"  {label}: ERROR - {str(e)[:80]}")

    # 5. FK enforcement
    print("\n--- 5. FOREIGN KEY ENFORCEMENT ---")
    fk_result = rows(pipeline(["PRAGMA foreign_keys"])[0])[0][0]
    print(f"  PRAGMA foreign_keys: {fk_result} ({'ENABLED' if fk_result == 1 else 'DISABLED'})")

    # 6. Sample data from key tables
    print("\n--- 6. SAMPLE DATA ---")
    for table in ["projects", "service_provider_details", "project_providers", "provider_auth", "client_details", "requirements"]:
        try:
            sample = rows(pipeline([f'SELECT * FROM "{table}" LIMIT 2'])[0])
            print(f"  {table} (first 2 rows):")
            for row in sample:
                print(f"    {row}")
        except Exception as e:
            print(f"  {table}: ERROR - {str(e)[:80]}")

    print("\n" + "=" * 60)
    print("AUDIT COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    run()
