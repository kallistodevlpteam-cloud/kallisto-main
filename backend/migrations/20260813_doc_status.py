"""Add project_DOC.status (approval boolean per project_DOC row).

The enquiry documents table shows a "STATUS" column. Previously the
frontend fabricated values ("Approved"/"Missing"). This migration adds
the authoritative boolean column (1 = approved, 0 = not approved) and
seeds it so every existing row carries strict backend data.

Run from the backend directory:

    python migrations/20260813_doc_status.py
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

# doc_name -> approval boolean. Rows not listed default to approved.
NOT_APPROVED_DOCS: set[str] = {
    "Brand Guidelines.pdf",
    "Material Moodboard.pdf",
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(["ALTER TABLE project_DOC ADD COLUMN status INTEGER NOT NULL DEFAULT 0"])
        print("OK: added project_DOC.status column")
    except Exception as error:  # noqa: BLE001
        print(f"SKIP: {str(error)[:120]}")

    result = pipeline(["SELECT id, doc_name FROM project_DOC"])[0]
    updated = 0
    for doc_id, doc_name in rows(result):
        status = 0 if doc_name in NOT_APPROVED_DOCS else 1
        pipeline(
            ["UPDATE project_DOC SET status = ? WHERE id = ?"],
            [[status, doc_id]],
        )
        updated += 1
    print(f"OK: set status for {updated} document rows")

    verify = pipeline(
        [
            "SELECT pd.id, pd.doc_name, pd.status FROM project_DOC pd "
            "WHERE pd.project_id IN (4, 5, 7) "
            "ORDER BY pd.project_id, pd.sort_order, pd.id LIMIT 8"
        ]
    )[0]
    for doc_id, doc_name, status in rows(verify):
        print(f"VERIFY {doc_id}: {doc_name!r} -> {status!r}")


if __name__ == "__main__":
    main()
