"""Backfill missing client_details and enquiry_details for orphaned projects.

Run from the backend directory:
    python migrations/20260814_backfill_links.py
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


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # Project 1: Greenfield Villa
    try:
        pipeline(
            [
                "INSERT INTO client_details (project_id, client_id, client_name) "
                "VALUES (1, 'cli-001', 'Greenfield Client') "
                "ON CONFLICT(project_id) DO NOTHING"
            ]
        )
        print("OK: client_details for project 1")
    except Exception as error:  # noqa: BLE001
        print(f"INFO: project 1 client_details: {str(error)[:120]}")

    try:
        pipeline(
            [
                "INSERT INTO enquiry_details (project_id, view) VALUES (1, 0) "
                "ON CONFLICT(project_id) DO NOTHING"
            ]
        )
        print("OK: enquiry_details for project 1")
    except Exception as error:  # noqa: BLE001
        print(f"INFO: project 1 enquiry_details: {str(error)[:120]}")

    # Project 7: Test View Flag Villa
    try:
        pipeline(
            [
                "INSERT INTO client_details (project_id, client_id, client_name) "
                "VALUES (7, 'cli-007', 'Test Client') "
                "ON CONFLICT(project_id) DO NOTHING"
            ]
        )
        print("OK: client_details for project 7")
    except Exception as error:  # noqa: BLE001
        print(f"INFO: project 7 client_details: {str(error)[:120]}")

    try:
        pipeline(
            [
                "INSERT INTO enquiry_details (project_id, view) VALUES (7, 0) "
                "ON CONFLICT(project_id) DO NOTHING"
            ]
        )
        print("OK: enquiry_details for project 7")
    except Exception as error:  # noqa: BLE001
        print(f"INFO: project 7 enquiry_details: {str(error)[:120]}")

    # Verify all projects now have full links
    for pid in range(1, 8):
        cd = pipeline(["SELECT count(*) FROM client_details WHERE project_id = ?"], [[pid]])[0]
        ed = pipeline(["SELECT count(*) FROM enquiry_details WHERE project_id = ?"], [[pid]])[0]
        print(f"project {pid}: client_details={rows(cd)[0][0]} enquiry_details={rows(ed)[0][0]}")

    print("OK: backfill complete")


if __name__ == "__main__":
    main()