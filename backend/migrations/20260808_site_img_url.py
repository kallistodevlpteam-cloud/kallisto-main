"""Add site_img_url (a list of image URLs) to the project_site table.

site_img_url stores the ordered site image list as a JSON-encoded TEXT
value (one row per project, 1:1 like the rest of project_site). The
backend parses it and returns an array; the frontend never hardcodes
site images.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_site_img_url.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# Seed list — same set the site images card previously rendered.
SITE_IMAGES = [
    "/assets/nila-thumb1.jpg",
    "/assets/nila-thumb2.jpg",
    "/assets/nila-thumb3.jpg",
    "/assets/nila-thumb3.jpg",
    "/assets/nila-hero.jpg",
    "/assets/nila-hero-modern.jpg",
    "/assets/project-banner.jpg",
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(["ALTER TABLE project_site ADD COLUMN site_img_url TEXT"])
        print("OK: ALTER TABLE project_site ADD COLUMN site_img_url TEXT")
    except Exception as error:  # noqa: BLE001
        print(f"SKIP: column may already exist: {str(error)[:120]}")

    try:
        result = pipeline(["SELECT id FROM projects ORDER BY id"])[0]
        project_ids = [row[0] for row in rows(result)]
    except Exception as error:  # noqa: BLE001
        print(f"ERR: listing projects: {str(error)[:120]}")
        return

    updated = 0
    for project_id in project_ids:
        encoded = json.dumps(SITE_IMAGES, ensure_ascii=False)
        try:
            pipeline(
                [
                    "UPDATE project_site SET site_img_url = ? WHERE project_id = ?"
                ],
                [[encoded, project_id]],
            )
            updated += 1
            print(f"OK: seeded site images for project {project_id}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: project {project_id}: {str(error)[:120]}")

    # Projects without a project_site row get one so the list is present.
    for project_id in project_ids:
        encoded = json.dumps(SITE_IMAGES, ensure_ascii=False)
        try:
            pipeline(
                [
                    "INSERT INTO project_site (project_id, site_img_url) "
                    "VALUES (?, ?) "
                    "ON CONFLICT(project_id) DO NOTHING"
                ],
                [[project_id, encoded]],
            )
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: insert row for project {project_id}: {str(error)[:120]}")

    print(f"OK: updated {updated}/{len(project_ids)} project_site rows")

    try:
        result = pipeline(
            [
                "SELECT project_id, site_img_url FROM project_site "
                "WHERE site_img_url IS NOT NULL ORDER BY project_id"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()