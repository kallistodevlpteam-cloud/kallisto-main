"""Add project_DOC.DOC_type (document category per project_DOC row).

The enquiry documents table shows a "Discipline" column. Previously the
frontend fabricated values ("Drawings") or relied on mock rows. This
migration adds the authoritative DOC_type column and seeds it from the
document name so every existing row carries strict backend data.

Run from the backend directory:

    python migrations/20260813_doc_type.py
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

# doc_name -> DOC_type category.
DOC_TYPE_BY_NAME: dict[str, str] = {
    "Client Requirements.pdf": "Requirements",
    "Site Inspection Report.pdf": "Site Reports",
    "Existing Floor Plan.dwg": "Drawings",
    "Brand Guidelines.pdf": "Brand Assets",
    "BOQ Estimate.xlsx": "BOQ & Estimates",
    "Landscape Plan.pdf": "Drawings",
    "Electrical Layout.dwg": "Drawings",
    "Material Moodboard.pdf": "Materials",
    "Site Survey Plan.dwg": "Drawings",
    "Feasibility Study.pdf": "Feasibility",
    "Concept Proposal.pdf": "Proposal",
    "Approval Record.pdf": "Approvals",
}


def main() -> None:
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    try:
        pipeline(["ALTER TABLE project_DOC ADD COLUMN DOC_type TEXT"])
        print("OK: added project_DOC.DOC_type column")
    except Exception as error:  # noqa: BLE001
        print(f"SKIP: {str(error)[:120]}")

    result = pipeline(["SELECT id, doc_name FROM project_DOC"])[0]
    updated = 0
    missing = 0
    for doc_id, doc_name in rows(result):
        doc_type = DOC_TYPE_BY_NAME.get(doc_name)
        if not doc_type:
            print(f"SKIP: no DOC_type mapping for {doc_name!r}")
            missing += 1
            continue
        pipeline(
            ["UPDATE project_DOC SET DOC_type = ? WHERE id = ?"],
            [[doc_type, doc_id]],
        )
        updated += 1
    print(f"OK: set DOC_type for {updated} document rows ({missing} unmapped)")

    verify = pipeline(
        [
            "SELECT pd.id, pd.doc_name, pd.DOC_type FROM project_DOC pd "
            "WHERE pd.project_id IN (4, 5, 7) "
            "ORDER BY pd.project_id, pd.sort_order, pd.id LIMIT 6"
        ]
    )[0]
    for doc_id, doc_name, doc_type in rows(verify):
        print(f"VERIFY {doc_id}: {doc_name!r} -> {doc_type!r}")


if __name__ == "__main__":
    main()
