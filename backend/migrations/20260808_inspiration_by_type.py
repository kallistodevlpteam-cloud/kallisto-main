"""Seed inspiration images per project matching the project building type.

Each project's inspiration_img list is replaced with images chosen for its
building_type (Villa, House, Apartment, Office). Remote URLs are served from
images.pexels.com which is already whitelisted in next.config.ts.

Run from the backend directory:

    python migrations/20260808_inspiration_by_type.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

PEX = "https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=1200"

TYPE_SETS: dict[str, list[str]] = {
    "Villa": [
        "106399",  # modern white villa exterior
        "1396122",  # luxury villa at dusk
        "280221",  # villa facade
        "280222",  # country house exterior
        "1571460",  # living room interior
        "1571463",  # lounge interior
        "2081468",  # minimal interior
        "1909792",  # bathroom interior
    ],
    "House": [
        "1029599",  # suburban house exterior
        "106399",  # modern white exterior
        "280222",  # house facade
        "280221",  # front garden house
        "1571460",  # living room interior
        "2081468",  # minimal interior
        "1571463",  # lounge interior
        "90317",  # bedroom interior
    ],
    "Apartment": [
        "1643383",  # apartment building
        "1648776",  # city apartment towers
        "280229",  # apartment facade
        "2724749",  # kitchen interior
        "1571460",  # living room interior
        "2081468",  # minimal interior
        "1571463",  # lounge interior
        "271624",  # bedroom interior
    ],
    "Office": [
        "1170412",  # office building exterior
        "380769",  # open-plan office
        "3184292",  # office meeting room
        "416405",  # office workstations
        "1571460",  # lounge interior
        "2081468",  # minimal interior
        "1571463",  # lounge interior
        "106399",  # modern exterior
    ],
}

DEFAULT_SETS = TYPE_SETS["Villa"]


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    result = pipeline(
        ["SELECT id, building_type, project_name FROM projects ORDER BY id"]
    )[0]
    projects = rows(result)
    labels: dict[str, str] = {
        "Villa": "Villa",
        "House": "House",
        "Apartment": "Apartment",
        "Office": "Office",
    }

    for project_id, building_type, project_name in projects:
        set_for_type = TYPE_SETS.get(str(building_type or "").strip(), DEFAULT_SETS)
        label = labels.get(str(building_type or "").strip(), "Inspiration")
        pipeline(["DELETE FROM inspiration_img WHERE project_id = ?"], [[project_id]])
        for sort_order, photo_id in enumerate(set_for_type):
            image_url = PEX.format(id=photo_id)
            alt_text = f"{label} concept {sort_order + 1}"
            pipeline(
                [
                    "INSERT INTO inspiration_img (project_id, image_url, alt_text, sort_order) "
                    "VALUES (?, ?, ?, ?)"
                ],
                [[project_id, image_url, alt_text, sort_order]],
            )
        print(f"project {project_id} ({project_name}, building_type={building_type}): "
              f"{len(set_for_type)} inspiration images")

    verify = pipeline(
        [
            "SELECT p.id, p.building_type, count(i.id), group_concat(i.image_url, ' | ') "
            "FROM projects p JOIN inspiration_img i ON i.project_id = p.id "
            "GROUP BY p.id ORDER BY p.id"
        ]
    )[0]
    for row in rows(verify):
        urls = (row[3] or "").split(" | ")
        print(f"VERIFY project {row[0]} ({row[1]}): {row[2]} images -> {urls[0] if urls else None}")


if __name__ == "__main__":
    main()