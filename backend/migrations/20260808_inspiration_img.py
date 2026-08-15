"""Create the inspiration_img table and seed it for existing projects.

Each project can carry an ordered list of inspiration images (one row per
image). Rows are ordered by sort_order then id so the frontend gallery
renders a stable, backend-sourced sequence. Existing projects are seeded
with the previously hardcoded gallery set so the visual output stays the
same while the source of truth moves to the database.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_inspiration_img.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# Same set (and order) that the enquiry overview card previously
# rendered from a hardcoded array in the frontend.
INSPIRATION_IMAGES: list[dict[str, str]] = [
    {"image_url": "/assets/projectbg.webp", "alt_text": "Modern Architectural Structure"},
    {"image_url": "/assets/nila-thumb1.jpg", "alt_text": "Entrance Facade Architecture"},
    {"image_url": "/assets/nila-thumb2.jpg", "alt_text": "Living Area Interior Design"},
    {"image_url": "/assets/nila-thumb3.jpg", "alt_text": "Pool Deck Elevation View"},
    {"image_url": "/assets/nila-hero.jpg", "alt_text": "Villa Exterior View"},
    {"image_url": "/assets/nila-hero-modern.jpg", "alt_text": "Modern Villa Facade"},
    {"image_url": "/assets/project-banner.jpg", "alt_text": "Project Site Overview"},
    {"image_url": "/assets/hero-architecture-banner.webp", "alt_text": "Architectural Render"},
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(
            [
                """
                CREATE TABLE IF NOT EXISTS inspiration_img (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    image_url  TEXT NOT NULL,
                    alt_text   TEXT,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
                )
                """
            ]
        )
        print("OK: created inspiration_img table")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: creating table: {str(error)[:120]}")
        return

    try:
        pipeline(["CREATE INDEX IF NOT EXISTS idx_inspiration_img_project_id ON inspiration_img(project_id)"])
        print("OK: created idx_inspiration_img_project_id index")
    except Exception as error:  # noqa: BLE001
        print(f"SKIP: index: {str(error)[:120]}")

    try:
        result = pipeline(["SELECT id FROM projects ORDER BY id"])[0]
        project_ids = [row[0] for row in rows(result)]
    except Exception as error:  # noqa: BLE001
        print(f"ERR: listing projects: {str(error)[:120]}")
        return

    for project_id in project_ids:
        try:
            for sort_order, image in enumerate(INSPIRATION_IMAGES):
                pipeline(
                    [
                        "INSERT INTO inspiration_img (project_id, image_url, alt_text, sort_order) "
                        "VALUES (?, ?, ?, ?)"
                    ],
                    [[project_id, image["image_url"], image["alt_text"], sort_order]],
                )
            print(f"OK: seeded {len(INSPIRATION_IMAGES)} images for project {project_id}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: project {project_id}: {str(error)[:120]}")

    try:
        result = pipeline(
            [
                "SELECT project_id, count(*), min(sort_order), max(sort_order) "
                "FROM inspiration_img GROUP BY project_id ORDER BY project_id"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()