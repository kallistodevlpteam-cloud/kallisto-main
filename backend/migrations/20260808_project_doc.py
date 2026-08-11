"""Create the project_DOC table and seed existing projects.

Each project can carry an ordered list of documents (one row per
document). Rows are ordered by sort_order then id so the frontend
document section renders a stable, backend-sourced sequence of
documents, each with an image preview URL (doc_img_url).

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_project_doc.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# Set of documents used for seeding. doc_img_url is the document preview
# served to the frontend; a null value means the document is missing.
DOCUMENTS: list[dict[str, str | None]] = [
    {"doc_img_url": "/assets/projectbg.webp", "name": "Client Requirements.pdf"},
    {"doc_img_url": "/assets/nila-hero-modern.jpg", "name": "Site Inspection Report.pdf"},
    {"doc_img_url": "/assets/kallisto-drawing-approval-record.png", "name": "Existing Floor Plan.dwg"},
    {"doc_img_url": None, "name": "Brand Guidelines.pdf"},
    {"doc_img_url": "/assets/quotation-retyping-workflow.png", "name": "BOQ Estimate.xlsx"},
    {"doc_img_url": "/assets/nila-hero.jpg", "name": "Landscape Plan.pdf"},
    {"doc_img_url": "/assets/kallisto-drawing-approval-record.png", "name": "Electrical Layout.dwg"},
    {"doc_img_url": "/assets/project-banner.jpg", "name": "Material Moodboard.pdf"},
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(
            [
                """
                CREATE TABLE IF NOT EXISTS project_DOC (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                    doc_name   TEXT,
                    doc_img_url TEXT,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
                    updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
                )
                """
            ]
        )
        print("OK: created project_DOC table")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: creating table: {str(error)[:120]}")
        return

    try:
        pipeline(["CREATE INDEX IF NOT EXISTS idx_project_doc_project_id ON project_DOC(project_id)"])
        print("OK: created idx_project_doc_project_id index")
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
            for sort_order, doc in enumerate(DOCUMENTS):
                pipeline(
                    [
                        "INSERT INTO project_DOC (project_id, doc_name, doc_img_url, sort_order) "
                        "VALUES (?, ?, ?, ?)"
                    ],
                    [[project_id, doc["name"], doc["doc_img_url"], sort_order]],
                )
            print(f"OK: seeded {len(DOCUMENTS)} documents for project {project_id}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: project {project_id}: {str(error)[:120]}")

    try:
        result = pipeline(
            [
                "SELECT project_id, count(*) FROM project_DOC "
                "GROUP BY project_id ORDER BY project_id"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()