"""Replace dummy project_DOC rows with per-project varied document sets.

Each project gets the same 12 document titles rotated to a different start
offset and document thumbnails drawn from a real /assets pool at a different
offset, so no two projects share the same document list. One document per
project intentionally has no thumbnail to exercise the missing-image state.

Run from the backend directory:

    python migrations/20260808_vary_project_docs.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

DOC_TYPES = [
    {"doc_name": "Client Requirements.pdf", "doc_img_url": "/assets/nila-thumb1.jpg"},
    {"doc_name": "Site Inspection Report.pdf", "doc_img_url": "/assets/nila-thumb2.jpg"},
    {"doc_name": "Existing Floor Plan.dwg", "doc_img_url": "/assets/nila-thumb3.jpg"},
    {"doc_name": "Brand Guidelines.pdf", "doc_img_url": None},
    {"doc_name": "BOQ Estimate.xlsx", "doc_img_url": "/assets/project-banner.jpg"},
    {"doc_name": "Landscape Plan.pdf", "doc_img_url": "/assets/projectbg.webp"},
    {"doc_name": "Electrical Layout.dwg", "doc_img_url": "/assets/kallisto-scattered-section.webp"},
    {"doc_name": "Material Moodboard.pdf", "doc_img_url": "/assets/scattered.webp"},
    {"doc_name": "Site Survey Plan.dwg", "doc_img_url": "/assets/hero-architecture-banner.webp"},
    {"doc_name": "Feasibility Study.pdf", "doc_img_url": "/assets/kallisto-virtual-office-hero-8k.webp"},
    {"doc_name": "Concept Proposal.pdf", "doc_img_url": "/assets/template_street_shoot.png"},
    {"doc_name": "Approval Record.pdf", "doc_img_url": "/assets/manual.webp"},
]

PROJECT_IDENTIFIERS = [1, 2, 3, 4, 5, 6, 7]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    count = 0
    for index, project_id in enumerate(PROJECT_IDENTIFIERS):
        pipeline(["DELETE FROM project_DOC WHERE project_id = ?"], [[project_id]])
        name_offset = (index * 3) % len(DOC_TYPES)
        image_offset = (index * 7) % len(DOC_TYPES)
        doc_rows = []
        for name_index in range(len(DOC_TYPES)):
            doc = DOC_TYPES[(name_offset + name_index) % len(DOC_TYPES)]
            image_index = (image_offset + name_index) % len(DOC_TYPES)
            thumbnail = DOC_TYPES[image_index]["doc_img_url"]
            doc_rows.append(
                {
                    "project_id": project_id,
                    "doc_name": doc["doc_name"],
                    "doc_img_url": thumbnail,
                    "sort_order": name_index,
                }
            )
        for row in doc_rows:
            pipeline(
                [
                    "INSERT INTO project_DOC (project_id, doc_name, doc_img_url, sort_order) "
                    "VALUES (?, ?, ?, ?)"
                ],
                [[row["project_id"], row["doc_name"], row["doc_img_url"], row["sort_order"]]],
            )
        count += 1
        print(f"project {project_id}: {len(doc_rows)} documents")

    verify = pipeline(
        [
            "SELECT project_id, count(*), group_concat(doc_name, ' | ') "
            "FROM project_DOC GROUP BY project_id ORDER BY project_id"
        ]
    )[0]
    for row in rows(verify):
        docs = row[2].split(" | ") if row[2] else []
        print(f"VERIFY project {row[0]}: {row[1]} docs")
        print(f"  docs: {docs}")
        print(f"  first: {docs[0] if docs else None}")


if __name__ == "__main__":
    main()