"""Deduplicate and vary dummy site_img_url lists across projects.

Each project keeps 10 URLs drawn from a real /assets pool, starting at a
different offset so no two projects share the same list.

Run from the backend directory:

    python migrations/20260808_vary_site_images.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

POOL = [
    "/assets/nila-thumb1.jpg",
    "/assets/nila-thumb2.jpg",
    "/assets/nila-thumb3.jpg",
    "/assets/nila-hero.jpg",
    "/assets/nila-hero-modern.jpg",
    "/assets/project-banner.jpg",
    "/assets/projectbg.webp",
    "/assets/kallisto-scattered-section.webp",
    "/assets/scattered.webp",
    "/assets/hero-architecture-banner.webp",
    "/assets/kallisto-virtual-office-hero-8k.webp",
    "/assets/manual.webp",
    "/assets/template_street_shoot.png",
]

WINDOW_SIZE = 10


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    result = pipeline(
        ["SELECT project_id, site_img_url FROM project_site ORDER BY project_id"]
    )[0]
    current = {}
    for row in rows(result):
        try:
            current[row[0]] = json.loads(row[1]) if row[1] else []
        except (TypeError, ValueError):
            current[row[0]] = []

    for index, project_id in enumerate(current.keys()):
        offset = (index * 5) % len(POOL)
        merged = [
            POOL[(offset + position) % len(POOL)] for position in range(WINDOW_SIZE)
        ]
        pipeline(
            ["UPDATE project_site SET site_img_url = ? WHERE project_id = ?"],
            [[json.dumps(merged, ensure_ascii=False), project_id]],
        )
        print(f"project {project_id}: {len(merged)} images")

    verify = pipeline(["SELECT project_id, site_img_url FROM project_site ORDER BY project_id"])[0]
    lists = {}
    for row in rows(verify):
        lists[row[0]] = json.loads(row[1]) if row[1] else []
    seen = {}
    for project_id, urls in lists.items():
        key = tuple(urls)
        seen.setdefault(key, []).append(project_id)
    duplicates = {key: ids for key, ids in seen.items() if len(ids) > 1}
    if duplicates:
        for key, ids in duplicates.items():
            print(f"DUPLICATE LIST shared by projects {ids}: first urls {list(key)[:3]}")
    else:
        print("ALL LISTS DISTINCT")
    for project_id, urls in lists.items():
        print(f"VERIFY project {project_id}: {len(urls)} urls, first={urls[0]}")


if __name__ == "__main__":
    main()