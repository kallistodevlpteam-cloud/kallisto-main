"""Insert remaining data for enquiry projects 16-19 (skip project_technical and project_regulatory already inserted).

Run from the backend directory:
    python migrations/insert_remaining_enquiry_data.py
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

    project_ids = [16, 17, 18, 19]
    print(f"Inserting remaining data for projects {project_ids}...")

    # project_outdoor
    outdoor_data = [
        (16, "Yes", "No", "Yes", "No", "2 covered car parking", "Automatic sliding gate", "Live hedge + 4ft brick wall", "Solar path lights + courtyard uplighting", "Yes", "Yes"),
        (17, "No", "No", "No", "No", "25 + 5 visitor parking in basement", "Security boom barrier with RFID", "Chain link fence + hedges", "LED flood lights + parking area lights", "No", "No"),
        (18, "Yes", "No", "Yes", "No", "4 covered + 2 visitor parking", "Wrought iron gate (restore original)", "Laterite wall with original gate pillars", "Vintage-style lamp posts + warm bollards", "No", "Yes"),
        (19, "Yes", "Yes", "Yes", "Yes", "Visitor parking for 20 vehicles", "Natural bamboo fence with gate", "Native shrub hedge + coconut palms", "Solar deck lights + low-level path lighting", "Yes", "Yes"),
    ]
    for r in outdoor_data:
        pipeline(["INSERT INTO project_outdoor (project_id, garden, swimming_pool, outdoor_deck_patio, bbq_area, parking, driveway_gate_notes, landscape_boundary_fencing, outdoor_lighting, play_area_children, pet_friendly_outdoor) VALUES (?,?,?,?,?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_outdoor")

    # project_timeline
    timeline_data = [
        (16, "2026-09-01", "2027-06-30", "Must complete before school year starts (June 2027)", "No", "N/A", "Medium"),
        (17, "2026-10-01", "2027-12-31", "Move-in by January 2028 for expansion plan", "Yes", "Phase 1: Shell and core (6 months), Phase 2: Interiors (4 months), Phase 3: Landscape and parking (4 months)", "High"),
        (18, "2026-08-01", "2027-08-31", "Heritage festival deadline - August 2027 for inauguration", "No", "N/A", "Medium"),
        (19, "2027-01-01", "2028-12-31", "Soft opening December 2028 for peak season", "Yes", "Phase 1: Common areas and 4 cottages (12 months), Phase 2: Remaining 8 cottages (8 months), Phase 3: Landscaping and wellness center (4 months)", "Low"),
    ]
    for r in timeline_data:
        pipeline(["INSERT INTO project_timeline (project_id, desired_start_date, desired_completion_date, fixed_deadline_notes, phased, phases_description, urgency_level) VALUES (?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_timeline")

    # project_spaces
    spaces_data = [
        # Project 16 - Nila Residence
        (16, "Master Bedroom Suite", 1, "Essential", "420 sq ft", 1, "Ground floor, garden access, walk-in closet"),
        (16, "Children's Bedroom", 1, "Essential", "280 sq ft", 2, "First floor, shared Jack-and-Jill bath"),
        (16, "Home Office / Study", 1, "Essential", "250 sq ft", 1, "Quiet corner, north-facing for natural light"),
        (16, "Kitchen + Dining", 1, "Essential", "380 sq ft", 1, "Open plan, courtyard view, island counter"),
        (16, "Living Room", 1, "Essential", "360 sq ft", 1, "Courtyard facing, double-height ceiling"),
        (16, "Central Courtyard", 1, "Essential", "600 sq ft", 1, "Landscaped with water feature and seating"),
        (16, "Covered Parking", 1, "Essential", "240 sq ft", 2, "Side entry, EV charging ready"),
        (16, "Utility + Laundry", 1, "Important", "120 sq ft", 1, "Behind kitchen, ventilated"),
        # Project 17 - Marina Commercial
        (17, "Open Office Floor", 1, "Essential", "4200 sq ft", 1, "Column-free span, 120 workstations"),
        (17, "Conference Room Alpha", 1, "Essential", "420 sq ft", 1, "Video conference ready, 16 seats"),
        (17, "Conference Room Beta", 1, "Important", "320 sq ft", 1, "Adjacent to breakout area, 10 seats"),
        (17, "Pantry / Cafeteria", 1, "Essential", "650 sq ft", 1, "Natural ventilation, 50 covers"),
        (17, "Reception Lobby", 1, "Essential", "400 sq ft", 1, "Street-facing, brand wall"),
        (17, "Server Room", 1, "Essential", "180 sq ft", 1, "Climate controlled, fire suppression, UPS"),
        (17, "Basement Parking", 1, "Essential", "2800 sq ft", 25, "EV charging for 5 vehicles"),
        (17, "Terrace Lounge", 1, "Important", "800 sq ft", 1, "City view, evening events"),
        # Project 18 - Heritage Restoration
        (18, "Drawing Room", 1, "Essential", "520 sq ft", 1, "Original teak paneling restored"),
        (18, "Dining Room", 1, "Essential", "380 sq ft", 1, "Connected to restored verandah"),
        (18, "Master Suite", 1, "Essential", "480 sq ft", 1, "Attached heritage bathroom with modern fittings"),
        (18, "Guest Room", 1, "Important", "320 sq ft", 2, "Ground floor, accessible, verandah access"),
        (18, "Study / Library", 1, "Important", "300 sq ft", 1, "Original built-in shelves restored"),
        (18, "Kitchen", 1, "Essential", "340 sq ft", 1, "Modern equipment, heritage look with wood cabinets"),
        (18, "Verandah", 1, "Essential", "450 sq ft", 1, "Wrap-around, original swing restored"),
        (18, "Courtyard", 1, "Important", "350 sq ft", 1, "Traditional with tulasi and well"),
        # Project 19 - Eco Resort
        (19, "Cottage Type A (Deluxe)", 1, "Essential", "800 sq ft", 6, "Waterfront view, private deck, outdoor shower"),
        (19, "Cottage Type B (Standard)", 1, "Essential", "600 sq ft", 6, "Garden view, shared deck, fan cooled"),
        (19, "Dining Pavilion", 1, "Essential", "1400 sq ft", 1, "Open-air, 60 covers, thatched roof"),
        (19, "Wellness Center", 1, "Essential", "900 sq ft", 1, "Yoga deck, 2 massage rooms, meditation space"),
        (19, "Reception + Lounge", 1, "Essential", "700 sq ft", 1, "Natural materials, thatched roof, library"),
        (19, "Staff Quarters", 1, "Essential", "1200 sq ft", 1, "Behind main complex, 15 rooms"),
        (19, "Organic Garden", 1, "Important", "2000 sq ft", 1, "Guest experience, farm-to-table dining"),
        (19, "Parking Area", 1, "Essential", "1800 sq ft", 20, "Screened with bamboo, porous paving"),
    ]
    for r in spaces_data:
        pipeline(["INSERT INTO project_spaces (project_id, space_name, required, priority, approx_area_size, quantity, adjacency_notes) VALUES (?,?,?,?,?,?,?)"], [list(r)])
    print(f"  Inserted {len(spaces_data)} project spaces")

    # requirements + requirement_items
    import uuid
    reqs_data = [
        # Project 16
        (16, "Space Planning", ["3 bedrooms with attached baths", "Home office with natural light", "Open kitchen with island", "Central courtyard with water feature"], [["Master suite 420sqft with walk-in closet"], ["North-facing, soundproofed for calls"], ["Island counter 8ft, pantry behind"], ["Water feature, seating, native plants"]], [True, True, True, True]),
        (16, "Materials & Finishes", ["Laterite stone exterior cladding", "Terracotta roofing tiles", "Teak wood interior doors and windows"], [["Random rubble pattern, weather sealed"], ["Mangalore pattern, ridge vents"], ["Burma teak, oil finish, brass hardware"]], [True, True, True]),
        # Project 17
        (17, "Infrastructure", ["25kW rooftop solar system", "10kW diesel backup generator", "Dual ISP fiber connectivity"], [["Grid-tie with net metering"], ["Auto-start, 8-hour runtime"], ["Airtel + Jio, load balancing"]], [True, True, True]),
        (17, "Interior Systems", ["Raised flooring for cabling", "Glass partition walls", "LED lighting with daylight sensors"], [["600mm height, cable trays"], ["Frameless, soundproofed"], ["DALI control, 4000K color temp"]], [True, True, True]),
        # Project 18
        (18, "Heritage Preservation", ["Preserve original facade and columns", "Restore teak paneling and doors", "Maintain verandah structure and swing"], [["No structural changes to front elevation"], ["Strip, treat with teak oil, rehang"], ["Replace rotten beams, keep original design"]], [True, True, True]),
        (18, "Modern Integration", ["Concealed electrical wiring", "VRF AC in 3 rooms only", "Modern plumbing with heritage fixtures"], [["Conduit behind paneling"], ["Outdoor units hidden behind compound wall"], ["Heritage-style taps, modern pressure"]], [True, True, True]),
        # Project 19
        (19, "Sustainability", ["100kW solar farm with battery storage", "Rainwater harvesting 50,000L", "Greywater recycling for irrigation"], [["Ground-mounted, tilted 15 degrees"], ["Rooftop collection, filtration, storage"], ["Bio-filter system, drip irrigation"]], [True, True, True]),
        (19, "Guest Experience", ["Private deck with outdoor shower per cottage", "Kayaking dock and equipment storage", "Organic farm-to-table dining"], [["Bamboo fencing, solar shower"], ["Floating dock, 6 kayaks, life jackets"], ["2000 sq ft garden, chef's table"]], [True, True, True]),
    ]
    for pid, name, items, details, statuses in reqs_data:
        req_id = str(uuid.uuid4())
        pipeline(["INSERT INTO requirements (id, project_id, requirement_name) VALUES (?, ?, ?)"], [[req_id, pid, name]])
        for i, item in enumerate(items):
            detail = details[i] if i < len(details) else []
            status = statuses[i] if i < len(statuses) else None
            detail_json = str(detail).replace("'", '"')
            pipeline(["INSERT INTO requirement_items (requirement_id, item_value, details, status) VALUES (?, ?, ?, ?)"], [[req_id, item, detail_json, 1 if status else 0]])
    print("  Inserted requirements + items")

    # family_details
    families_data = [
        ("FAM-0016-1", "CLI-0016", "Primary decision maker, works from home 3 days/week, prefers quiet office corner", None, None, "Rahul Nair", 38, "Software Engineer at Infosys", "9876543212", "Husband / Father", None),
        ("FAM-0016-2", "CLI-0016", "Co-decision maker on aesthetics, colors, and materials. Has strong opinions on Vastu compliance", None, None, "Ananya Nair", 35, "Interior Designer (freelance)", "9876543213", "Wife / Mother", None),
        ("FAM-0016-3", "CLI-0016", "Needs study desk by window, loves art and craft, wants pink accent wall", None, None, "Meera Nair", 8, "Student (Grade 3)", None, "Daughter", None),
        ("FAM-0016-4", "CLI-0016", "Needs small play area, loves dinosaurs and cars", None, None, "Aarav Nair", 5, "Kindergarten", None, "Son", None),
        ("FAM-0018-1", "CLI-0018", "Heritage enthusiast, detail-oriented, wants every change documented with photos", None, None, "Dr. Thomas Mathew", 68, "Retired Professor of History", "9876543214", "Owner", None),
        ("FAM-0018-2", "CLI-0018", "Concerned about modern comfort, wants western toilet, geyser, and mixer grinder in kitchen", None, None, "Saramma Mathew", 65, "Homemaker", "9876543215", "Wife", None),
    ]
    for r in families_data:
        pipeline(["INSERT INTO family_details (family_id, client_id, description, created_at, updated_at, name, age, job, phone, relation, family_member_img_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted family_details")

    # inspiration images
    inspirations_data = [
        (16, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Modern Kerala villa with courtyard - reference 1"),
        (16, "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", "Open plan living and dining - reference 2"),
        (16, "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80", "Courtyard garden with water feature"),
        (17, "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "Modern commercial facade - reference 1"),
        (17, "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", "Open office interior with glass walls"),
        (17, "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80", "Office pantry and breakout area"),
        (18, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Colonial bungalow exterior - reference 1"),
        (18, "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80", "Restored verandah with teak details"),
        (18, "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80", "Heritage bathroom with modern fittings"),
        (19, "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", "Eco resort cottages - reference 1"),
        (19, "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80", "Bamboo and thatch roof architecture"),
        (19, "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80", "Backwater view resort deck"),
    ]
    for r in inspirations_data:
        pipeline(["INSERT INTO inspiration_img (project_id, image_url, alt_text) VALUES (?,?,?)"], [list(r)])
    print("  Inserted inspiration images")

    # project documents (different for each project)
    doc_templates_16 = [
        ("Site Survey Plan.pdf", "/assets/nila-thumb1.jpg", "Site Reports", 1),
        ("Client Requirements v2.pdf", "/assets/nila-thumb2.jpg", "Requirements", 1),
        ("Floor Plan Concept.dwg", "/assets/nila-thumb3.jpg", "Drawings", 1),
        ("Vastu Compliance Report.pdf", "", "Reports", 0),
        ("Budget Estimate.xlsx", "/assets/project-banner.jpg", "BOQ & Estimates", 1),
        ("Landscape Concept.pdf", "/assets/projectbg.webp", "Drawings", 1),
        ("MEP Layout.dwg", "/assets/kallisto-scattered-section.webp", "Drawings", 1),
        ("Material Palette.pdf", "/assets/scattered.webp", "Materials", 0),
        ("Soil Test Report.pdf", "/assets/hero-architecture-banner.webp", "Site Reports", 1),
        ("Structural Feasibility.pdf", "/assets/kallisto-virtual-office-hero-8k.webp", "Feasibility", 1),
        ("Design Proposal.pdf", "/assets/template_street_shoot.png", "Proposal", 1),
        ("Client Approval Letter.pdf", "/assets/manual.webp", "Approvals", 1),
    ]
    doc_templates_17 = [
        ("Site Survey Plan.pdf", "/assets/nila-thumb2.jpg", "Site Reports", 1),
        ("Space Program Brief.pdf", "/assets/nila-thumb3.jpg", "Requirements", 1),
        ("Concept Floor Plans.dwg", "/assets/project-banner.jpg", "Drawings", 1),
        ("Fire Safety Compliance.pdf", "", "Reports", 0),
        ("Cost Estimate v1.xlsx", "/assets/projectbg.webp", "BOQ & Estimates", 1),
        ("Facade Design.pdf", "/assets/kallisto-scattered-section.webp", "Drawings", 1),
        ("Electrical Layout.dwg", "/assets/scattered.webp", "Drawings", 1),
        ("IT Infrastructure Plan.pdf", "/assets/hero-architecture-banner.webp", "Technical", 0),
        ("Parking Layout.dwg", "/assets/kallisto-virtual-office-hero-8k.webp", "Drawings", 1),
        ("Environmental Clearance.pdf", "/assets/template_street_shoot.png", "Feasibility", 1),
        ("Design Presentation.pdf", "/assets/manual.webp", "Proposal", 1),
        ("Board Approval Minutes.pdf", "/assets/nila-thumb1.jpg", "Approvals", 1),
    ]
    doc_templates_18 = [
        ("Heritage Survey.pdf", "/assets/nila-thumb3.jpg", "Site Reports", 1),
        ("Restoration Brief.pdf", "/assets/project-banner.jpg", "Requirements", 1),
        ("Measured Drawings.dwg", "/assets/projectbg.webp", "Drawings", 1),
        ("Heritage NOC Application.pdf", "", "Reports", 0),
        ("Restoration Cost Estimate.xlsx", "/assets/kallisto-scattered-section.webp", "BOQ & Estimates", 1),
        ("Wood Treatment Plan.pdf", "/assets/scattered.webp", "Materials", 1),
        ("Plumbing Upgrade.dwg", "/assets/hero-architecture-banner.webp", "Drawings", 1),
        ("Electrical Upgrade Plan.pdf", "/assets/kallisto-virtual-office-hero-8k.webp", "Technical", 0),
        ("Foundation Assessment.pdf", "/assets/template_street_shoot.png", "Site Reports", 1),
        ("Heritage Committee Letter.pdf", "/assets/manual.webp", "Feasibility", 1),
        ("Restoration Proposal.pdf", "/assets/nila-thumb1.jpg", "Proposal", 1),
        ("Family Approval.pdf", "/assets/nila-thumb2.jpg", "Approvals", 1),
    ]
    doc_templates_19 = [
        ("Eco Site Survey.pdf", "/assets/projectbg.webp", "Site Reports", 1),
        ("Resort Masterplan Brief.pdf", "/assets/kallisto-scattered-section.webp", "Requirements", 1),
        ("Masterplan Layout.dwg", "/assets/scattered.webp", "Drawings", 1),
        ("CRZ Clearance Application.pdf", "", "Reports", 0),
        ("Resort Budget.xlsx", "/assets/hero-architecture-banner.webp", "BOQ & Estimates", 1),
        ("Cottage Design.pdf", "/assets/kallisto-virtual-office-hero-8k.webp", "Drawings", 1),
        ("Sustainability Plan.pdf", "/assets/template_street_shoot.png", "Technical", 1),
        ("Landscape Design.pdf", "/assets/manual.webp", "Drawings", 0),
        ("Waterfront Study.pdf", "/assets/nila-thumb1.jpg", "Site Reports", 1),
        ("Environmental Impact.pdf", "/assets/nila-thumb2.jpg", "Feasibility", 1),
        ("Investor Pitch Deck.pdf", "/assets/nila-thumb3.jpg", "Proposal", 1),
        ("Investor Approval.pdf", "/assets/project-banner.jpg", "Approvals", 1),
    ]

    all_doc_templates = {
        16: doc_templates_16,
        17: doc_templates_17,
        18: doc_templates_18,
        19: doc_templates_19,
    }

    max_doc_res = pipeline(["SELECT COALESCE(MAX(id), 0) FROM project_DOC"])[0]
    current_doc_id = rows(max_doc_res)[0][0]

    for pid, templates in all_doc_templates.items():
        for i, (doc_name, doc_img_url, doc_type, status) in enumerate(templates):
            current_doc_id += 1
            pipeline([
                """INSERT INTO project_DOC (
                    id, project_id, doc_name, doc_img_url, sort_order, created_at, updated_at, DOC_type, status
                ) VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'), ?, ?)"""
            ], [[
                current_doc_id, pid, doc_name, doc_img_url if doc_img_url else None, i, doc_type, status
            ]])
    print("  Inserted project documents (unique per project)")

    # project scopes (different for each project)
    scope_templates = {
        16: [
            ("Space Planning", ["3 bedrooms with attached baths", "Home office with natural light", "Open kitchen with island counter", "Central courtyard with water feature"]),
            ("Materials & Finishes", ["Laterite stone exterior cladding", "Terracotta roofing tiles", "Teak wood interior joinery"]),
            ("Infrastructure", ["8kW rooftop solar", "Borewell + rainwater harvesting", "Smart home automation"]),
            ("Landscape", ["Central courtyard garden", "Side parking area", "Front hedge boundary"]),
        ],
        17: [
            ("Office Layout", ["120 open workstations", "2 conference rooms", "4 private cabins", "Breakout area"]),
            ("Building Systems", ["25kW solar rooftop", "Central HVAC with VAV", "Raised flooring for cabling"]),
            ("Amenities", ["Cafeteria for 50 people", "Terrace lounge", "Basement parking for 25 cars"]),
            ("Technology", ["Dual ISP fiber", "Server room with UPS", "IoT-based building management"]),
        ],
        18: [
            ("Heritage Restoration", ["Restore teak paneling", "Preserve verandah structure", "Repair Mangalore tile roof"]),
            ("Modern Additions", ["Concealed electrical wiring", "VRF AC in 3 rooms", "Modern plumbing with heritage fixtures"]),
            ("Outdoor", ["Restore compound wall", "Preserve ancient mango trees", "Clean traditional pond"]),
            ("Accessibility", ["Level entry ramps", "Grab bars in bathrooms", "Non-slip flooring"]),
        ],
        19: [
            ("Cottages", ["6 deluxe cottages (800 sq ft)", "6 standard cottages (600 sq ft)", "Private deck per cottage", "Outdoor shower"]),
            ("Common Areas", ["Dining pavilion 60 covers", "Wellness center with yoga", "Reception lounge with library", "Organic garden"]),
            ("Sustainability", ["100kW solar farm", "50kL rainwater harvesting", "Greywater recycling", "Bamboo and thatch construction"]),
            ("Recreation", ["Kayaking dock", "Nature walk trails", "Bird watching deck", "Organic farm tour"]),
        ],
    }

    max_scope_res = pipeline(["SELECT COALESCE(MAX(id), 0) FROM project_scope"])[0]
    current_scope_id = rows(max_scope_res)[0][0]
    
    max_scope_item_res = pipeline(["SELECT COALESCE(MAX(id), 0) FROM project_scope_item"])[0]
    current_scope_item_id = rows(max_scope_item_res)[0][0]

    for pid, scopes in scope_templates.items():
        for i, (scope_name, items) in enumerate(scopes):
            current_scope_id += 1
            enq_id = f"ENQ-2026-{pid:04d}"
            pipeline([
                "INSERT INTO project_scope (id, project_id, enq_id, scope_name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))"
            ], [[current_scope_id, pid, enq_id, scope_name, i]])
            
            for j, item_name in enumerate(items):
                current_scope_item_id += 1
                pipeline([
                    "INSERT INTO project_scope_item (id, scope_id, item_name, sort_order, created_at) VALUES (?, ?, ?, ?, strftime('%s','now'))"
                ], [[current_scope_item_id, current_scope_id, item_name, j]])

    print("  Inserted project scopes (unique per project)")

    # Verify
    print("\n=== VERIFICATION ===")
    for pid in project_ids:
        r = pipeline(["SELECT project_name, project_character, project_status, sq_area, brief_description FROM projects WHERE id = ?"], [[pid]])[0]
        p = rows(r)[0]
        print(f"Project {pid}: {p[0]} (char={p[1]}, status={p[2]}, area={p[3]})")
        print(f"  Desc: {p[4][:80]}...")

    print("\n=== INSERT COMPLETE ===")

if __name__ == "__main__":
    main()
