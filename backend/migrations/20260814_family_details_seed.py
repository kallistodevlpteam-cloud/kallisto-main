"""Seed family_details rows for the enq projects' clients.

Each row is one family member of the project-linked client (family_details
rows link through client_details.client_id; client_details.project_id ties
them to the project). Used until real client-family data is captured.

Run from the backend directory so the .env credentials are loaded:

    python migrations/20260814_family_details_seed.py
"""

from __future__ import annotations

import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv  # noqa: E402

from turso_client import pipeline, rows  # noqa: E402

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"

# client_name -> family members (name, age, job, phone, relation, img url)
SEED: dict[str, list[tuple[str, int, str, str, str, str]]] = {
    "Rahul Menon": [
        ("Meera Menon", 36, "Architect", "+91 98470 11223", "Spouse", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"),
        ("Aarav Menon", 10, "Student", "", "Son", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"),
        ("Leela Menon", 68, "Retired", "", "Mother", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"),
    ],
    "Priya Sharma": [
        ("Arjun Sharma", 41, "Entrepreneur", "+91 99880 44556", "Spouse", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"),
        ("Nila Sharma", 13, "Student", "", "Daughter", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"),
    ],
    "Arun Kumar": [
        ("Divya Kumar", 34, "Software Engineer", "+91 98765 22334", "Spouse", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"),
        ("Rohan Kumar", 6, "Student", "", "Son", "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=600&q=80"),
    ],
    "Meera Iyer": [
        ("Vikram Iyer", 39, "Consultant", "+91 98950 33445", "Spouse", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"),
        ("Amara Iyer", 8, "Student", "", "Daughter", "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"),
    ],
    "Dev Nair": [
        ("Rithika Nair", 33, "Designer", "+91 96330 55667", "Spouse", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"),
    ],
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    result = pipeline(
        [
            "SELECT cd.client_id, cd.client_name FROM client_details cd "
            "WHERE cd.project_id IS NOT NULL ORDER BY cd.project_id"
        ]
    )[0]
    client_ids = {row[1]: row[0] for row in rows(result)}

    statements: list[str] = []
    args_list: list[list[object]] = []
    seeded = 0
    for client_name, members in SEED.items():
        client_id = client_ids.get(client_name)
        if not client_id:
            print(f"SKIP: no project-linked client named {client_name!r}")
            continue
        for name, age, job, phone, relation, img_url in members:
            statements.append(
                "INSERT INTO family_details (family_id, client_id, name, age, "
                "job, phone, relation, family_member_img_url) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
            )
            args_list.append([str(uuid.uuid4()), client_id, name, age, job, phone, relation, img_url])
            seeded += 1

    if not statements:
        print("Nothing to seed.")
        return

    try:
        pipeline(statements, args_list)
        print(f"OK: seeded {seeded} family members")
    except Exception as error:  # noqa: BLE001
        print(f"ERR: {str(error)[:200]}")

    try:
        result = pipeline(
            [
                "SELECT fd.name, fd.relation, fd.age, fd.job, cd.client_name "
                "FROM family_details fd "
                "LEFT JOIN client_details cd ON cd.client_id = fd.client_id "
                "ORDER BY cd.project_id"
            ]
        )[0]
        print(f"VERIFY: {result.get('rows', [])}")
    except Exception as error:  # noqa: BLE001
        print(f"VERIFY FAILED: {str(error)[:120]}")


if __name__ == "__main__":
    main()