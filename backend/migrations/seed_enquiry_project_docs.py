"""Seed project documents, scopes, and requirements for new enquiry projects.

Run from the backend directory:
    python migrations/seed_enquiry_project_docs.py
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

def main() -> None:
    load_dotenv(ENV_PATH)

    # New enquiry project IDs
    project_ids = [16, 19, 20, 23]

    # Get current max ids for project_DOC and project_scope
    max_doc_res = pipeline(["SELECT COALESCE(MAX(id), 0) FROM project_DOC"])[0]
    max_doc_id = rows(max_doc_res)[0][0]
    
    max_scope_res = pipeline(["SELECT COALESCE(MAX(id), 0) FROM project_scope"])[0]
    max_scope_id = rows(max_scope_res)[0][0]
    
    max_scope_item_res = pipeline(["SELECT COALESCE(MAX(id), 0) FROM project_scope_item"])[0]
    max_scope_item_id = rows(max_scope_item_res)[0][0]
    
    print(f"Max doc id: {max_doc_id}, Max scope id: {max_scope_id}, Max scope item id: {max_scope_item_id}")

    # Seed project documents for each new enquiry
    doc_templates = [
        # (doc_name, doc_img_url, DOC_type, status)
        ("Client Requirements.pdf", "/assets/nila-thumb1.jpg", "Requirements", 1),
        ("Site Inspection Report.pdf", "/assets/nila-thumb2.jpg", "Site Reports", 1),
        ("Existing Floor Plan.dwg", "/assets/nila-thumb3.jpg", "Drawings", 1),
        ("Brand Guidelines.pdf", "", "Brand Assets", 0),
        ("BOQ Estimate.xlsx", "/assets/project-banner.jpg", "BOQ & Estimates", 1),
        ("Landscape Plan.pdf", "/assets/projectbg.webp", "Drawings", 1),
        ("Electrical Layout.dwg", "/assets/kallisto-scattered-section.webp", "Drawings", 1),
        ("Material Moodboard.pdf", "/assets/scattered.webp", "Materials", 0),
        ("Site Survey Plan.dwg", "/assets/hero-architecture-banner.webp", "Drawings", 1),
        ("Feasibility Study.pdf", "/assets/kallisto-virtual-office-hero-8k.webp", "Feasibility", 1),
        ("Concept Proposal.pdf", "/assets/template_street_shoot.png", "Proposal", 1),
        ("Approval Record.pdf", "/assets/manual.webp", "Approvals", 1),
    ]

    inserted_docs = 0
    current_doc_id = max_doc_id
    for pid in project_ids:
        for i, (doc_name, doc_img_url, doc_type, status) in enumerate(doc_templates):
            current_doc_id += 1
            pipeline([
                """INSERT INTO project_DOC (
                    id, project_id, doc_name, doc_img_url, sort_order, created_at, updated_at, DOC_type, status
                ) VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'), ?, ?)"""
            ], [[
                current_doc_id, pid, doc_name, doc_img_url if doc_img_url else None, i, doc_type, status
            ]])
            inserted_docs += 1
    print(f"OK: Inserted {inserted_docs} project documents")

    # Seed project scopes for each new enquiry
    scope_templates = [
        # (scope_name, items)
        ("Space Planning", ["3 bedrooms", "Home office", "Open kitchen", "Courtyard"]),
        ("Materials", ["Laterite stone exterior", "Terracotta roofing", "Teak wood interiors"]),
        ("Infrastructure", ["Solar panels", "UPS backup", "Fiber connectivity"]),
        ("Landscape", ["Central garden", "Parking area", "Boundary wall"]),
    ]

    inserted_scopes = 0
    inserted_scope_items = 0
    current_scope_id = max_scope_id
    current_scope_item_id = max_scope_item_id
    
    for pid in project_ids:
        for i, (scope_name, items) in enumerate(scope_templates):
            current_scope_id += 1
            enq_id = f"ENQ-2026-{pid:04d}"
            pipeline([
                "INSERT INTO project_scope (id, project_id, enq_id, scope_name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))"
            ], [[current_scope_id, pid, enq_id, scope_name, i]])
            inserted_scopes += 1
            
            for j, item_name in enumerate(items):
                current_scope_item_id += 1
                pipeline([
                    "INSERT INTO project_scope_item (id, scope_id, item_name, sort_order, created_at) VALUES (?, ?, ?, ?, strftime('%s','now'))"
                ], [[current_scope_item_id, current_scope_id, item_name, j]])
                inserted_scope_items += 1

    print(f"OK: Inserted {inserted_scopes} project scopes")
    print(f"OK: Inserted {inserted_scope_items} project scope items")

    # Verify
    for pid in project_ids:
        doc_count = rows(pipeline(["SELECT COUNT(*) FROM project_DOC WHERE project_id = ?"], [[pid]])[0])[0][0]
        scope_count = rows(pipeline(["SELECT COUNT(*) FROM project_scope WHERE project_id = ?"], [[pid]])[0])[0][0]
        print(f"VERIFY: Project {pid} has {doc_count} documents, {scope_count} scopes")

    print("\n=== SEED COMPLETE ===")

if __name__ == "__main__":
    main()
