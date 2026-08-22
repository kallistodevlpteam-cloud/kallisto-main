"""Seed multi-provider test data.

Creates 4 service providers, 4 project-provider links (some shared),
4 login accounts, and re-links the 7 projects so each provider sees a
different scoped subset.

Run from the backend directory:
    python migrations/20260814_seed_multi_providers.py
"""

from __future__ import annotations

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

import bcrypt  # noqa: E402

PROVIDERS = [
    ("SP-0001", "Kallisto Design Studio", "design_build", "+91 90000 00001",
     "studio@kallisto.in", "Kallisto Design Studio", "Residential & commercial fit-out",
     "Default seed provider"),
    ("SP-0002", "Arjun Architects", "architecture", "+91 90000 00002",
     "arjun@architects.in", "Arjun Architects", "Architecture & interiors",
     "Multi-project provider"),
    ("SP-0003", "Kochi Builders", "construction", "+91 90000 00003",
     "kochi@builders.in", "Kochi Builders", "Construction & contracting",
     "Shared-project provider"),
    ("SP-0004", "Greenfield Contractors", "contracting", "+91 90000 00004",
     "greenfield@contractors.in", "Greenfield Contractors", "General contracting",
     "Shared-project provider"),
]

PROJECT_PROVIDERS = [
    ("PROV-0001", '["SP-0001"]'),
    ("PROV-0002", '["SP-0002"]'),
    ("PROV-0003", '["SP-0003", "SP-0004"]'),
    ("PROV-0004", '["SP-0002"]'),
]

AUTH_USERS = [
    ("studio@kallisto.in", "Kallisto123!", "SP-0001", "Kallisto Design Studio"),
    ("arjun@architects.in", "Arjun123!", "SP-0002", "Arjun Architects"),
    ("kochi@builders.in", "Kochi123!", "SP-0003", "Kochi Builders"),
    ("greenfield@contractors.in", "Green123!", "SP-0004", "Greenfield Contractors"),
]

PROJECT_LINKS = {
    1: ('["PROV-0001"]', "enq"),   # Kallisto only
    2: ('["PROV-0002"]', "enq"),   # Arjun only
    3: ('["PROV-0003"]', "pr"),    # Kochi + Greenfield
    4: ('["PROV-0001", "PROV-0002"]', "enq"),  # Kallisto + Arjun
    5: ('["PROV-0004"]', "enq"),   # Arjun (via PROV-0004)
    6: ('["PROV-0002", "PROV-0003"]', "pr"),   # Arjun + Kochi + Greenfield
    7: ('[]', "rej"),              # No provider, rejected
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # 1. Seed service_provider_details (upsert by SP_id).
    for sp in PROVIDERS:
        pipeline(
            [
                "INSERT INTO service_provider_details "
                "(SP_id, provider_name, type, phone, email, company, specialization, notes) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?) "
                "ON CONFLICT(SP_id) DO UPDATE SET provider_name=excluded.provider_name"
            ],
            [[sp[0], sp[1], sp[2], sp[3], sp[4], sp[5], sp[6], sp[7]]],
        )
    print("OK: service_provider_details seeded (4 providers)")

    # 2. Seed project_providers.
    for pp in PROJECT_PROVIDERS:
        pipeline(
            [
                "INSERT INTO project_providers (provider_id, SP_ids) VALUES (?, ?) "
                "ON CONFLICT(provider_id) DO UPDATE SET SP_ids=excluded.SP_ids"
            ],
            [[pp[0], pp[1]]],
        )
    print("OK: project_providers seeded (4 links)")

    # 3. Seed provider_auth accounts.
    for email, pw, sp_id, name in AUTH_USERS:
        pw_hash = bcrypt.hashpw(pw.encode(), bcrypt.gensalt(rounds=12)).decode()
        pipeline(
            [
                "INSERT INTO provider_auth (email, password_hash, sp_id, provider_name) "
                "VALUES (?, ?, ?, ?) "
                "ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash, "
                "sp_id=excluded.sp_id, provider_name=excluded.provider_name"
            ],
            [[email, pw_hash, sp_id, name]],
        )
    print("OK: provider_auth seeded (4 accounts)")

    # 4. Update project linkages.
    for pid, (provider_id, character) in PROJECT_LINKS.items():
        pipeline(
            [
                "UPDATE projects SET provider_id = ?, project_character = ?, "
                "updated_at = strftime('%s','now') WHERE id = ?"
            ],
            [[provider_id, character, pid]],
        )
    print("OK: project linkages updated")

    # 5. Verify.
    for pid in range(1, 8):
        r = pipeline(["SELECT project_name, provider_id, project_character FROM projects WHERE id = ?"], [[pid]])[0]
        row = rows(r)[0]
        print(f"project {pid}: {row[0]} | provider_id={row[1]} | char={row[2]}")

    for email, _, sp_id, _ in AUTH_USERS:
        r = pipeline(["SELECT email, sp_id FROM provider_auth WHERE email = ?"], [[email]])[0]
        row = rows(r)[0]
        print(f"auth {row[0]} -> {row[1]}")

    print("OK: multi-provider seed complete")


if __name__ == "__main__":
    main()