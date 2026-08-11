"""Add extra dummy site images and project documents to existing projects.

Extends the seeded dummy data for testing:
- appends more asset URLs to project_site.site_img_url lists
- inserts additional project_DOC rows per project

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260808_add_dummy_test_data.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

EXTRA_SITE_IMAGES = [
    "/assets/nila-hero.jpg",
    "/assets/nila-hero-modern.jpg",
    "/assets/projectbg.webp",
    "/assets/project-banner.jpg",
    "/assets/kallisto-scattered-section.webp",
    "/assets/scattered.webp",
]

EXTRA_DOCUMENTS = [
    {"doc_name": "Site Progress Report.pdf", "doc_img_url": "/assets/manual.webp"},
    {"doc_name": "Structural Drawing.dwg", "doc_img_url": "/assets/kallisto-drawing-approval-record.png"},
    {"doc_name": "Interior Moodboard.pdf", "doc_img_url": "/assets/quotation-retyping-workflow.png"},
]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        result = pipeline(["SELECT id FROM projects ORDER BY id"])[0]
        project_ids = [row[0] for row in rows(result)]
    except Exception as error:  # noqa: BLE001
        print(f"ERR: listing projects: {str(error)[:120]}")
        return

    # 1. Append extra site images to each project's site_img_url list.
    site_updated = 0
    for project_id in project_ids:
        try:
            current = pipeline(
                ["SELECT site_img_url FROM project_site WHERE project_id = ?"],
                [[project_id]],
            )[0]
            current_rows = rows(current)
            current_list = []
            if current_rows and current_rows[0][0]:
                try:
                    current_list = json.loads(current_rows[0][0])
                except (TypeError, ValueError):
                    current_list = []
            if not isinstance(current_list, list):
                current_list = []
            merged = current_list + [url for url in EXTRA_SITE_IMAGES if url not in current_list]
            pipeline(
                [
                    "UPDATE project_site SET site_img_url = ? WHERE project_id = ?"
                ],
                [[json.dumps(merged, ensure_ascii=False), project_id]],
            )
            site_updated += 1
            print(f"OK: project {project_id} site images -> {len(merged)}")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: project {project_id} site images: {str(error)[:120]}")

    # 2. Insert extra dummy documents per project.
    doc_updated = 0
    for project_id in project_ids:
        try:
            result = pipeline(
                ["SELECT sort_order FROM project_DOC WHERE project_id = ? ORDER BY sort_order DESC LIMIT 1"],
                [[project_id]],
            )[0]
            result_rows = rows(result)
            start_order = (result_rows[0][0] if result_rows and result_rows[0][0] is not None else -1) + 1
            for offset, doc in enumerate(EXTRA_DOCUMENTS):
                pipeline(
                    [
                        "INSERT INTO project_DOC (project_id, doc_name, doc_img_url, sort_order) "
                        "VALUES (?, ?, ?, ?)"
                    ],
                    [[project_id, doc["doc_name"], doc["doc_img_url"], start_order + offset]],
                )
            doc_updated += 1
            print(f"OK: project {project_id} +{len(EXTRA_DOCUMENTS)} documents")
        except Exception as error:  # noqa: BLE001
            print(f"SKIP: project {project_id} documents: {str(error)[:120]}")

    # Verify
    try:
        site_result = pipeline(
            [
                "SELECT project_id, site_img_url FROM project_site "
                "WHERE site_img_url IS NOT NULL ORDER BY project_id"
            ]
        )[0]
        for row in rows(site_result):
            count = len(json.loads(row[1])) if row[1] else 0
            print(f"VERIFY SITE project {row[0]}: {count} images")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY SITE FAILED: {str(error)[:120]}")

    try:
        doc_result = pipeline(
            [
                "SELECT project_id, count(*) FROM project_DOC "
                "GROUP BY project_id ORDER BY project_id"
            ]
        )[0]
        print(f"VERIFY DOCS: {doc_result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY DOCS FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()