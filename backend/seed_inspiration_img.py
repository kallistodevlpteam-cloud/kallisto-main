"""Seed dummy inspiration_img rows for testing."""

from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from dotenv import load_dotenv
from turso_client import pipeline, rows

load_dotenv(Path(__file__).resolve().parent / ".env")


def main() -> None:
    existing = pipeline(["SELECT id FROM projects ORDER BY id"])[0]
    project_ids = [row[0] for row in rows(existing)]
    if not project_ids:
        print("No projects found in the database.")
        return

    dummy_images = [
        ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", "Modern House Exterior at Dusk"),
        ("https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80", "Open-Plan Living Room"),
        ("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", "Apartment Interior with City View"),
        ("https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80", "House with Swimming Pool"),
        ("https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=800&q=80", "Luxury Interior Lounge"),
        ("https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80", "White Minimalist Facade"),
        ("https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80", "Contemporary Villa in Garden"),
        ("https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80", "Cozy Bedroom with Natural Light"),
    ]

    statements: list[str] = []
    args_list: list[list[Any]] = []

    for project_id in project_ids:
        statements.append(
            "DELETE FROM inspiration_img WHERE project_id = ?"
        )
        args_list.append([project_id])

        for sort_order, (url, alt) in enumerate(dummy_images):
            statements.append(
                "INSERT INTO inspiration_img (project_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?)"
            )
            args_list.append([project_id, url, alt, sort_order])

    pipeline(statements, args_list)
    print(f"Inserted {len(dummy_images)} inspiration images for {len(project_ids)} project(s).")


if __name__ == "__main__":
    main()
