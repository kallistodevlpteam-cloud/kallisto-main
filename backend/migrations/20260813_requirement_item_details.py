"""Add requirement_items.details (list of detail strings per item value).

Each requirement_items row stores its item_value plus a details column: a
JSON-encoded list of strings (the ":t/y/z details" sub-list below the item
value). Missing or unparsable values stay NULL. Design mirrors the
project_site.site_img_url JSON-list pattern already used in the codebase.

Details are seeded for every seeded requirement item so the enquiry
requirements workspace shows strict backend data in the
"Specification / Details" column.

Run from the backend directory:

    python migrations/20260813_requirement_item_details.py
"""

from __future__ import annotations

import json
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

# (project_id, requirement_name, item_value) -> list of detail strings.
DETAILS_BY_ITEM: dict[tuple[int, str, str], list[str]] = {
    (1, "Building & Project Type", "Residential, Ground + 1 Floor"): [
        "Ground floor living + first floor bedrooms",
        "Design + build scope with client",
    ],
    (1, "Building & Project Type", "Design + Build scope"): [
        "Single contract for design and construction",
    ],
    (1, "Target Built-up Area", "2,200 sq ft"): ["Total built-up area"],
    (1, "Target Built-up Area", "Car porch + Courtyard included"): [
        "Car porch for one car",
        "Courtyard for daylight & ventilation",
    ],
    (1, "Architectural & Interior Style", "Warm Contemporary Minimalist"): [
        "Natural teak accents",
        "Microcement wall finishes",
    ],
    (1, "Architectural & Interior Style", "Natural teak accents"): [
        "Joinery, wardrobes and wall panelling",
    ],
    (1, "Architectural & Interior Style", "Microcement finishes"): [
        "Bathroom walls and feature surfaces",
    ],
    (1, "Timeline", "Housing loan approval in place"): [
        "Construction financing approved",
    ],
    (1, "Timeline", "Move-in within 10 months"): [
        "Target handover within 10 months",
    ],

    (2, "Building & Project Type", "Residential Fit-out"): [
        "Turnkey interior fit-out",
    ],
    (2, "Building & Project Type", "Single detached house"): [
        "Standalone villa on owned plot",
    ],
    (2, "Target Built-up Area", "3,000 sq ft"): ["Total built-up area"],
    (2, "Target Built-up Area", "Two storeys"): [
        "Ground + first floor configuration",
    ],
    (2, "Client / User Profile", "Family of 4"): [
        "Parents + two school-age children",
    ],
    (2, "Client / User Profile", "Elderly parents visiting"): [
        "Ground-floor guest accommodation preferred",
    ],
    (2, "Timeline", "Completion within 8 months"): [
        "Target completion window",
    ],

    (3, "Building & Project Type", "Residential Renovation"): [
        "Existing structure retained",
    ],
    (3, "Building & Project Type", "Existing structure"): [
        "Partial demolition of internal walls",
        "Structural assessment required",
    ],
    (3, "Target Built-up Area", "1,800 sq ft"): ["Renovation scope area"],
    (3, "Target Built-up Area", "First floor only"): [
        "Upper floor remodelling",
    ],
    (3, "Architectural & Interior Style", "Contemporary with Italian marble"): [
        "Luxury flooring in living and dining",
    ],
    (3, "Budget & Commercial", "₹60L – ₹80L"): [
        "Renovation budget including finishes",
    ],
    (3, "Budget & Commercial", "Incl. contingencies"): [
        "10% contingency buffer",
    ],

    (4, "Building & Project Type", "Apartment, Rental"): [
        "Rental-yield focused tower",
        "12-floor apartment building",
    ],
    (4, "Building & Project Type", "Premium tower"): [
        "Skyline views on upper floors",
    ],
    (4, "Target Built-up Area", "1,450 sq ft"): [
        "Per-apartment built-up area",
        "3BHK layout",
    ],
    (4, "Target Built-up Area", "3BHK"): [
        "Three bedrooms + hall + kitchen",
        "Attached bathrooms for all bedrooms",
    ],
    (4, "Architectural & Interior Style", "Modern with skyline views"): [
        "Floor-to-ceiling glazing",
        "West-facing terraces",
    ],
    (4, "Smart Home & Technical", "Rooftop lounge"): [
        "Shared amenities floor with skyline lounge",
    ],
    (4, "Smart Home & Technical", "Fitness center"): [
        "Gym and yoga deck",
    ],

    (5, "Building & Project Type", "Residential, Ground + 1"): [
        "Single-family villa",
        "Courtyard-style plan",
    ],
    (5, "Building & Project Type", "Warm Contemporary Minimalist"): [
        "Natural materials and earthy palette",
    ],
    (5, "Target Built-up Area", "2,800 – 3,200 sq ft"): [
        "Ground + first floor total",
        "Including covered sit-outs",
    ],
    (5, "Target Built-up Area", "Courtyard cutout"): [
        "Central daylight core",
        "Cross ventilation",
    ],
    (5, "Client / User Profile", "Family of 4"): [
        "Parents + two children",
    ],
    (5, "Client / User Profile", "School-age children"): [
        "Bedroom study desks required",
    ],
    (5, "Client / User Profile", "Elderly grandparents visiting"): [
        "Ground-floor guest bedroom",
    ],
    (5, "Architectural & Interior Style", "Natural teak accents"): [
        "Joinery, wardrobes and wall panelling",
    ],
    (5, "Architectural & Interior Style", "Microcement finishes"): [
        "Bathroom walls and feature surfaces",
    ],
    (5, "Architectural & Interior Style", "Soft terracotta accents"): [
        "Textiles, rugs and wall colour",
    ],
    (5, "Timeline", "Six-month target"): ["Client-driven schedule"],
    (5, "Timeline", "Budget ₹40L – ₹60L"): [
        "Including furniture & fixtures",
    ],

    (6, "Building & Project Type", "Commercial Fit-out"): [
        "Office interior fit-out",
    ],
    (6, "Building & Project Type", "Office, 50+ capacity"): [
        "Workstations, cabins and conference rooms",
    ],
    (6, "Target Built-up Area", "8,500 sq ft"): ["Leased floor area"],
    (6, "Target Built-up Area", "2 Executive Cabins"): [
        "Corner cabins with glass partitions",
    ],
    (6, "Architectural & Interior Style", "Glass acoustic partitions"): [
        "Meeting rooms and cabin fronts",
    ],
    (6, "Architectural & Interior Style", "Commercial carpet flooring"): [
        "Open work zones",
    ],
    (6, "Smart Home & Technical", "Data cabling"): [
        "Floor raceways for workstations",
    ],
    (6, "Smart Home & Technical", "Server room trunking"): [
        "Dedicated cooling for server room",
    ],

    (7, "Building & Project Type", "Residential"): ["Private villa"],
    (7, "Building & Project Type", "View flag test project"): [
        "Booking flag verification record",
    ],
    (7, "Target Built-up Area", "2,400 sq ft"): [
        "Total built-up area",
        "Three bedrooms",
    ],
    (7, "Target Built-up Area", "Three bedrooms"): [
        "Master + two bedrooms",
    ],
    (7, "Architectural & Interior Style", "Contemporary design"): [
        "Clean lines and glass accents",
    ],
    (7, "Timeline", "Within 6 months"): ["Target handover window"],
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(["ALTER TABLE requirement_items ADD COLUMN details TEXT"])
        print("OK: added requirement_items.details column")
    except Exception as error:  # noqa: BLE001
        print(f"SKIP: {str(error)[:120]}")

    count = pipeline(
        ["SELECT count(*) FROM requirement_items WHERE details IS NULL"]
    )[0]
    pending = rows(count)[0][0]
    print(f"INFO: {pending} requirement_items rows still have NULL details")

    requirements = pipeline(
        ["SELECT id, project_id, requirement_name FROM requirements"]
    )[0]
    requirement_ids: dict[tuple[int, str], str] = {}
    for requirement_id, project_id, requirement_name in rows(requirements):
        requirement_ids[(project_id, requirement_name)] = requirement_id

    items = pipeline(
        ["SELECT id, requirement_id, item_value FROM requirement_items"]
    )[0]
    item_rows: dict[tuple[str, str], str] = {}
    for item_id, requirement_id, item_value in rows(items):
        item_rows[(requirement_id, item_value)] = item_id

    updated = 0
    for (project_id, requirement_name, item_value), details in DETAILS_BY_ITEM.items():
        requirement_id = requirement_ids.get((project_id, requirement_name))
        if not requirement_id:
            print(f"SKIP: requirement {project_id}/{requirement_name} not found")
            continue
        item_id = item_rows.get((requirement_id, item_value))
        if not item_id:
            print(f"SKIP: item {project_id}/{requirement_name}/{item_value} not found")
            continue
        pipeline(
            ["UPDATE requirement_items SET details = ? WHERE id = ?"],
            [[json.dumps(details), item_id]],
        )
        updated += 1
    print(f"OK: seeded details for {updated} requirement items")

    verify = pipeline(
        [
            "SELECT ri.item_value, ri.details FROM requirements r "
            "JOIN requirement_items ri ON ri.requirement_id = r.id "
            "WHERE r.project_id IN (4, 5, 7) AND r.sort_order = 0 "
            "ORDER BY r.project_id, ri.sort_order LIMIT 6"
        ]
    )[0]
    for item_value, details in rows(verify):
        print(f"VERIFY {item_value!r} -> {details}")


if __name__ == "__main__":
    main()