"""Backfill descriptions for seeded family_details rows.

Each seeded member gets a free-text description (family_details.description)
used verbatim by the ODIN hover insight on the enquiry detail page.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260814_family_details_descriptions.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# member name -> description
DESCRIPTIONS: dict[str, str] = {
    "Meera Menon": "Meera works as an architect and jointly leads the design brief; she prioritizes a bright kitchen, covered outdoor dining and energy-efficient passive cooling for the ground floor.",
    "Aarav Menon": "Aarav needs a private bedroom with a built-in study desk and quiet corner for reading and art projects.",
    "Leela Menon": "Leela is a frequent visitor who needs a ground-floor bedroom with attached bathroom and minimal stair dependency.",
    "Arjun Sharma": "Arjun occasionally works from home and values outdoor entertaining, a shared master suite and medium privacy.",
    "Nila Sharma": "Nila needs a private bedroom with a dedicated study desk and quiet space for reading and art.",
    "Divya Kumar": "Divya works from home regularly and needs a dedicated study with high acoustic privacy and easy access to the master suite.",
    "Rohan Kumar": "Rohan requires a playful, safe children's zone near the living area with storage for toys and books.",
    "Vikram Iyer": "Vikram consults from home part-time and needs a compact work nook with natural light and video-call privacy.",
    "Amara Iyer": "Amara needs a cozy bedroom with a study desk, wall-mounted shelves for art supplies and soft reading lighting.",
    "Rithika Nair": "Rithika designs interiors and needs a well-lit home studio space with display walls for material samples and fabric swatches.",
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    statements: list[str] = []
    args_list: list[list[object]] = []
    for name, description in DESCRIPTIONS.items():
        statements.append(
            "UPDATE family_details SET description = ? WHERE name = ? AND "
            "(description IS NULL OR description = '')"
        )
        args_list.append([description, name])

    if not statements:
        print("Nothing to backfill.")
        return

    try:
        pipeline(statements, args_list)
        print(f"OK: backfilled {len(statements)} descriptions")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: {str(error)[:200]}")

    try:
        result = pipeline(
            [
                "SELECT fd.name, fd.description FROM family_details fd "
                "WHERE fd.description IS NOT NULL ORDER BY fd.name"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()