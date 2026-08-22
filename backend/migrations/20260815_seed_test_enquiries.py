"""Seed new enquiry projects with full details for testing.

Run from the backend directory:
    python migrations/20260815_seed_test_enquiries.py
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

    try:
        # Check how many projects already exist
        result = pipeline(["SELECT COUNT(*) FROM projects"])[0]
        existing_count = rows(result)[0][0]
        print(f"Existing projects: {existing_count}")

        # Get max id
        max_result = pipeline(["SELECT COALESCE(MAX(id), 0) FROM projects"])[0]
        max_id = rows(max_result)[0][0]
        print(f"Max project id: {max_id}")

        # Insert new projects (enquiries)
        new_projects = [
            {
                "name": "Nila Residence",
                "type": "Residential",
                "building": "Villa",
                "character": "enq",
                "status": "upcoming",
                "construction": "New construction",
                "purpose": "Family residence",
                "description": "Modern 3-bedroom villa with courtyard and garden",
                "cover": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                "sq_area": 3200,
                "timeline": "8-10 months",
                "overview": "A young family of four seeks a modern villa with open-plan living, 3 bedrooms, home office, and a landscaped garden. Budget range 45-60 lakhs. Site located in suburban Kochi with clear title.",
                "providers": '["PROV-0001"]',
            },
            {
                "name": "Marina Commercial Plaza",
                "type": "Commercial",
                "building": "Office Complex",
                "character": "enq",
                "status": "upcoming",
                "construction": "New construction",
                "purpose": "Commercial office space",
                "description": "Ground + 2 floor commercial complex for IT startup",
                "cover": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
                "sq_area": 8500,
                "timeline": "12-14 months",
                "overview": "Tech startup needs 8,500 sq ft office space across 3 floors. Requires open floor plan, 2 conference rooms, cafeteria, and parking for 25 vehicles. Must comply with commercial building codes.",
                "providers": '["PROV-0002"]',
            },
            {
                "name": "Heritage Restoration - Malabar House",
                "type": "Residential",
                "building": "Heritage Bungalow",
                "character": "enq",
                "status": "upcoming",
                "construction": "Renovation",
                "purpose": "Heritage restoration with modern amenities",
                "description": "1920s colonial bungalow restoration with modern upgrades",
                "cover": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                "sq_area": 4200,
                "timeline": "10-12 months",
                "overview": "Restore a 1920s colonial-era bungalow while adding modern plumbing, electrical, and climate control. Preserve original teak woodwork and verandahs. Heritage committee approval required.",
                "providers": '["PROV-0003"]',
            },
            {
                "name": "Greenfield Eco Resort",
                "type": "Mixed Use",
                "building": "Resort",
                "character": "enq",
                "status": "upcoming",
                "construction": "New construction",
                "purpose": "Eco-friendly boutique resort",
                "description": "12-cottage eco resort with sustainable design",
                "cover": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                "sq_area": 15000,
                "timeline": "18-24 months",
                "overview": "Sustainable 12-cottage eco-resort near backwaters. Solar power, rainwater harvesting, organic gardens. Each cottage 800 sq ft with private deck. Common area includes dining pavilion and wellness center.",
                "providers": '["PROV-0001", "PROV-0004"]',
            },
        ]

        inserted_ids = []
        for i, proj in enumerate(new_projects):
            new_id = max_id + i + 1
            pipeline([
                """INSERT INTO projects (
                    id, project_name, project_type, building_type, project_character,
                    project_status, new_construction_or_renovation, purpose_of_project,
                    brief_description, cover_image_url, sq_area, client_expected_timeline,
                    over_view, provider_id, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s','now'), strftime('%s','now'))"""
            ], [[
                new_id, proj["name"], proj["type"], proj["building"], proj["character"],
                proj["status"], proj["construction"], proj["purpose"],
                proj["description"], proj["cover"], proj["sq_area"], proj["timeline"],
                proj["overview"], proj["providers"]
            ]])
            inserted_ids.append(new_id)
            print(f"OK: Inserted project {new_id}: {proj['name']}")

        # Seed client_details
        clients = [
            (inserted_ids[0], "Rahul and Ananya Nair", "rahul.nair@email.com", "9847012345"),
            (inserted_ids[1], "VentureTech Solutions", "contact@venturetech.in", "9876543210"),
            (inserted_ids[2], "Dr. Thomas Mathew", "thomas.mathew@email.com", "9847012346"),
            (inserted_ids[3], "Greenfield Hospitality Group", "projects@greenfield.in", "9876543211"),
        ]
        for pid, name, email, phone in clients:
            pipeline([
                "INSERT INTO client_details (client_id, client_name, email, phone, project_id) VALUES (?, ?, ?, ?, ?)"
            ], [[f"CLI-{pid:04d}", name, email, phone, pid]])
        print(f"OK: client_details seeded")

        # Seed project_site
        sites = [
            (inserted_ids[0], "Kakkanad, Kochi", '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"]'),
            (inserted_ids[1], "MG Road, Kochi", '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"]'),
            (inserted_ids[2], "Kumarakom, Kottayam", '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"]'),
            (inserted_ids[3], "Alappuzha Backwaters", '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]'),
        ]
        for pid, place, imgs in sites:
            pipeline(["INSERT INTO project_site (project_id, place, site_img_url) VALUES (?, ?, ?)"], [[pid, place, imgs]])
        print(f"OK: project_site seeded")

        # Seed project_budget
        budgets = [
            (inserted_ids[0], 5500000),
            (inserted_ids[1], 12000000),
            (inserted_ids[2], 8000000),
            (inserted_ids[3], 25000000),
        ]
        for pid, amount in budgets:
            pipeline(["INSERT INTO project_budget (project_id, estimated_overall_budget) VALUES (?, ?)"], [[pid, amount]])
        print(f"OK: project_budget seeded")

        # Seed enquiry_details
        for pid in inserted_ids:
            pipeline(["INSERT INTO enquiry_details (enq_id, project_id, view) VALUES (?, ?, 0)"], [[f"ENQ-2026-{pid:04d}", pid]])
        print(f"OK: enquiry_details seeded")

        # Seed extended tables
        ext_data = {
            "project_clients": [
                (inserted_ids[0], "Young professional couple with 2 children", "Family of 4", 4, "No", "Yes", "No", "Yes", "Wheelchair access for elderly grandmother visiting", "CLI-0008"),
                (inserted_ids[1], "IT startup founders (3 partners)", "Office staff of 45", 45, "No", "No", "No", "Yes", "Accessible restrooms and ramps required", "CLI-0009"),
                (inserted_ids[2], "Retired professor and wife", "Couple with occasional guests", 2, "No", "No", "No", "No", "Level entry and grab bars in bathrooms", "CLI-0010"),
                (inserted_ids[3], "Hospitality management company", "Guests and staff", 60, "No", "No", "No", "No", "Universal design for accessibility compliance", "CLI-0011"),
            ],
            "project_lifestyle": [
                (inserted_ids[0], "Early risers, home cooked meals, weekend hosting", "Yes", "Yes", "Courtyard garden", "Kitchen garden", "Walking, yoga, gardening", "Photography, reading", "Very important - prefer private setbacks"),
                (inserted_ids[1], "9-6 office hours, Friday team lunches", "Yes", "Yes", "Terrace lounge", "Pantry", "Cycling club", "Board games", "Medium - open plan with acoustic privacy pods"),
                (inserted_ids[2], "Quiet mornings with tea on verandah", "Yes", "Yes", "Verandah", "Traditional courtyard", "Bird watching", "Antique collecting", "Very important - large setback from road"),
                (inserted_ids[3], "Guests arrive year-round, seasonal peaks", "Yes", "Yes", "Deck overlooking backwaters", "Restaurant patio", "Kayaking, nature walks", "Sustainability education", "Medium - natural screening with native plants"),
            ],
            "project_approval_process": [
                (inserted_ids[0], "Rahul Nair (husband)", "Ananya Nair (co-decision)", "2-3 rounds", "3D renders and physical samples", "3-5 days"),
                (inserted_ids[1], "Board of directors (3 partners)", "Office manager", "3-4 rounds", "Digital presentations with cost breakdowns", "5-7 days"),
                (inserted_ids[2], "Dr. Thomas Mathew", "Heritage committee", "4-6 rounds", "Detailed drawings with heritage approval", "2-3 weeks"),
                (inserted_ids[3], "Managing director", "Investor group", "3-5 rounds", "Professional pitch deck with ROI analysis", "7-10 days"),
            ],
            "project_communication": [
                (inserted_ids[0], "WhatsApp", "WhatsApp group + email", "Weekly progress call", "Evenings after 6 PM", "Prefers visual updates with photos"),
                (inserted_ids[1], "Email", "Email + project management tool", "Bi-weekly review", "Business hours", "Requires formal signed approvals for changes"),
                (inserted_ids[2], "Phone call", "Phone + postal correspondence", "Monthly site visit", "Morning 9-11 AM", "Traditional, prefers face-to-face discussions"),
                (inserted_ids[3], "Video conference", "Slack + video calls", "Weekly standup", "Flexible", "Multi-timezone, record all meetings"),
            ],
            "project_technical": [
                (inserted_ids[0], "Yes", "Yes", "Yes", "Yes", "VRF with zoning", "Yes", "Borewell + rainwater", "CCTV + smart doorbell", "Laterite stone, terracotta tiles"),
                (inserted_ids[1], "Yes", "Yes", "No", "Yes", "Central HVAC", "Yes", "Municipal + storage", "CCTV + access control", "Glass curtain wall, raised flooring"),
                (inserted_ids[2], "Yes", "No", "Yes", "No", "Split AC units", "No", "Well water", "Basic alarm", "Original teak, Mangalore tiles"),
                (inserted_ids[3], "Yes", "Yes", "Yes", "Yes", "Passive cooling + fans", "Yes", "Rainwater + treated well", "Perimeter + cottage sensors", "Bamboo, thatch, local stone"),
            ],
            "project_regulatory": [
                (inserted_ids[0], "Residential zone R-2", "Ground + 2 floors max", "No HOA", "Not yet obtained", "None known", "Front 3m, sides 2m, rear 2m"),
                (inserted_ids[1], "Commercial zone C-1", "Ground + 3 floors", "Commercial association fees apply", "Pending", "None", "Front 5m, sides 3m"),
                (inserted_ids[2], "Heritage conservation zone", "No height increase permitted", "Heritage committee approval mandatory", "Requires heritage NOC first", "None", "Front 5m (preserve existing)"),
                (inserted_ids[3], "Tourism development zone", "Ground + 1 floor max", "Eco-certification required", "Environmental clearance pending", "Coastal regulation zone applies", "Front 10m (backwater setback)"),
            ],
            "project_outdoor": [
                (inserted_ids[0], "Yes", "No", "Yes", "No", "2 covered", "Automatic gate", "Live hedge + brick wall", "Solar path lights", "Yes", "Yes"),
                (inserted_ids[1], "No", "No", "No", "No", "25 + visitor", "Security boom barrier", "Chain link + hedge", "LED flood lights", "No", "No"),
                (inserted_ids[2], "Yes", "No", "Yes", "No", "4 covered + visitor", "Wrought iron gate", "Laterite wall with original gate", "Vintage lamp posts", "No", "Yes"),
                (inserted_ids[3], "Yes", "Yes", "Yes", "Yes", "Visitor parking", "Natural bamboo fence", "Native shrub hedge", "Solar + low-level deck lights", "Yes", "Yes"),
            ],
            "project_timeline": [
                (inserted_ids[0], "2026-09-01", "2027-06-30", "Must complete before school year starts", "No", "N/A", "Medium"),
                (inserted_ids[1], "2026-10-01", "2027-12-31", "Move-in by Jan 2028", "Yes", "Phase 1: Shell, Phase 2: Interiors, Phase 3: Landscape", "High"),
                (inserted_ids[2], "2026-08-01", "2027-08-31", "Heritage festival deadline Aug 2027", "No", "N/A", "Medium"),
                (inserted_ids[3], "2027-01-01", "2028-12-31", "Soft opening Dec 2028", "Yes", "Phase 1: Common areas, Phase 2: Cottages, Phase 3: Landscaping", "Low"),
            ],
        }

        for table, rows_data in ext_data.items():
            if table == "project_clients":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, about_client, building_users, family_or_team_size, elderly_members, children, pets, work_from_home, accessibility_requirements, client_id) VALUES (?,?,?,?,?,?,?,?,?,?)"], [list(r)])
            elif table == "project_lifestyle":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, daily_routine, entertain_guests, host_parties, relaxation_place, morning_coffee_location, outdoor_activities, hobbies, privacy_importance) VALUES (?,?,?,?,?,?,?,?,?)"], [list(r)])
            elif table == "project_approval_process":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, primary_decision_maker, other_approval_stakeholders, expected_revision_rounds, design_review_method, approval_turnaround_time) VALUES (?,?,?,?,?,?)"], [list(r)])
            elif table == "project_communication":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, preferred_contact, communication_channel, meeting_frequency, best_time_to_reach, special_instructions) VALUES (?,?,?,?,?,?)"], [list(r)])
            elif table == "project_technical":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, energy_efficient_design, solar_panels, rainwater_harvesting, smart_home_automation, hvac_preference, backup_power, water_storage_borewell, security_system_requirements, preferred_material_techs) VALUES (?,?,?,?,?,?,?,?,?,?)"], [list(r)])
            elif table == "project_regulatory":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, zoning_restrictions, height_restrictions, home_owner_association_rules, permits_obtained, land_disputes_encumbrances, setback_requirements) VALUES (?,?,?,?,?,?,?)"], [list(r)])
            elif table == "project_outdoor":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, garden, swimming_pool, outdoor_deck_patio, bbq_area, parking, driveway_gate_notes, landscape_boundary_fencing, outdoor_lighting, play_area_children, pet_friendly_outdoor) VALUES (?,?,?,?,?,?,?,?,?,?,?)"], [list(r)])
            elif table == "project_timeline":
                for r in rows_data:
                    pipeline([f"INSERT INTO {table} (project_id, desired_start_date, desired_completion_date, fixed_deadline_notes, phased, phases_description, urgency_level) VALUES (?,?,?,?,?,?,?)"], [list(r)])
            print(f"OK: {table} seeded")

        # Seed project_spaces
        spaces_data = [
            (inserted_ids[0], "Master Bedroom", 1, "Essential", "400 sq ft", 1, "Ground floor, garden access"),
            (inserted_ids[0], "Children's Bedroom", 1, "Essential", "300 sq ft", 2, "First floor, shared bath"),
            (inserted_ids[0], "Home Office", 1, "Important", "250 sq ft", 1, "Quiet corner, natural light"),
            (inserted_ids[0], "Kitchen + Dining", 1, "Essential", "400 sq ft", 1, "Open plan, courtyard view"),
            (inserted_ids[0], "Living Room", 1, "Essential", "350 sq ft", 1, "Courtyard facing"),
            (inserted_ids[0], "Courtyard", 1, "Important", "600 sq ft", 1, "Central outdoor space"),
            (inserted_ids[0], "Parking", 1, "Essential", "200 sq ft", 2, "Covered, side entry"),
            (inserted_ids[1], "Open Office Floor", 1, "Essential", "4000 sq ft", 1, "Column-free span"),
            (inserted_ids[1], "Conference Room A", 1, "Essential", "400 sq ft", 1, "Video conference ready"),
            (inserted_ids[1], "Conference Room B", 1, "Important", "300 sq ft", 1, "Adjacent to breakout area"),
            (inserted_ids[1], "Pantry / Cafeteria", 1, "Essential", "600 sq ft", 1, "Natural ventilation"),
            (inserted_ids[1], "Reception", 1, "Essential", "350 sq ft", 1, "Street-facing entrance"),
            (inserted_ids[1], "Server Room", 1, "Essential", "150 sq ft", 1, "Climate controlled, secure"),
            (inserted_ids[1], "Parking", 1, "Essential", "2500 sq ft", 25, "Basement level"),
            (inserted_ids[2], "Drawing Room", 1, "Essential", "500 sq ft", 1, "Original teak paneling"),
            (inserted_ids[2], "Dining Room", 1, "Essential", "350 sq ft", 1, "Connected to restored verandah"),
            (inserted_ids[2], "Master Suite", 1, "Essential", "450 sq ft", 1, "Attached heritage bathroom"),
            (inserted_ids[2], "Guest Room", 1, "Important", "300 sq ft", 2, "Ground floor, accessible"),
            (inserted_ids[2], "Study / Library", 1, "Important", "280 sq ft", 1, "Original built-in shelves"),
            (inserted_ids[2], "Kitchen", 1, "Essential", "320 sq ft", 1, "Modern equipment, heritage look"),
            (inserted_ids[3], "Cottage Type A (Deluxe)", 1, "Essential", "800 sq ft", 6, "Waterfront view, private deck"),
            (inserted_ids[3], "Cottage Type B (Standard)", 1, "Essential", "600 sq ft", 6, "Garden view, shared deck"),
            (inserted_ids[3], "Dining Pavilion", 1, "Essential", "1200 sq ft", 1, "Open-air, 60 covers"),
            (inserted_ids[3], "Wellness Center", 1, "Important", "800 sq ft", 1, "Yoga + massage rooms"),
            (inserted_ids[3], "Reception + Lounge", 1, "Essential", "600 sq ft", 1, "Natural materials, thatched roof"),
            (inserted_ids[3], "Staff Quarters", 1, "Important", "1000 sq ft", 1, "Behind main complex"),
            (inserted_ids[3], "Parking", 1, "Essential", "1500 sq ft", 20, "Screened with bamboo"),
        ]
        for r in spaces_data:
            pipeline(["INSERT INTO project_spaces (project_id, space_name, required, priority, approx_area_size, quantity, adjacency_notes) VALUES (?,?,?,?,?,?,?)"], [list(r)])
        print(f"OK: project_spaces seeded ({len(spaces_data)} rows)")

        import uuid
        # Seed requirements
        reqs = [
            (inserted_ids[0], "Space Planning", ["3 bedrooms", "Home office", "Open kitchen", "Courtyard"], [["Master suite 400sqft"], ["Natural light, quiet zone"], ["Island counter, pantry"], ["Central landscaped"]], [True, True, True, True]),
            (inserted_ids[0], "Materials", ["Laterite stone exterior", "Terracotta roofing", "Teak wood interiors"], [[], [], []], [True, True, True]),
            (inserted_ids[1], "Infrastructure", ["25kW solar", "UPS backup", "Fiber connectivity"], [["Rooftop installation"], ["4-hour runtime"], ["Dual ISP redundancy"]], [True, True, True]),
            (inserted_ids[2], "Heritage Compliance", ["Preserve original facade", "Restore teak paneling", "Maintain verandah structure"], [[], [], []], [True, True, True]),
            (inserted_ids[3], "Sustainability", ["100kW solar farm", "Rainwater harvesting", "Greywater recycling"], [[], [], []], [True, True, True]),
        ]
        for pid, name, items, details, statuses in reqs:
            req_id = str(uuid.uuid4())
            pipeline(["INSERT INTO requirements (id, project_id, requirement_name) VALUES (?, ?, ?)"], [[req_id, pid, name]])
            for i, item in enumerate(items):
                detail = details[i] if i < len(details) else []
                status = statuses[i] if i < len(statuses) else None
                detail_json = str(detail).replace("'", '"')
                pipeline(["INSERT INTO requirement_items (requirement_id, item_value, details, status) VALUES (?, ?, ?, ?)"], [[req_id, item, detail_json, 1 if status else 0]])
        print(f"OK: requirements + items seeded")

        # Seed family_details
        families = [
            (f"CLI-{inserted_ids[0]:04d}", "Rahul Nair", 38, "Software Engineer", "9876543212", "Husband / Father", None, "Primary decision maker, works from home 3 days/week"),
            (f"CLI-{inserted_ids[0]:04d}", "Ananya Nair", 35, "Interior Designer", "9876543213", "Wife / Mother", None, "Co-decision maker, has strong opinions on aesthetics"),
            (f"CLI-{inserted_ids[0]:04d}", "Meera Nair", 8, "Student", None, "Daughter", None, "Needs study desk in bedroom"),
            (f"CLI-{inserted_ids[2]:04d}", "Dr. Thomas Mathew", 68, "Retired Professor", "9876543214", "Owner", None, "Heritage enthusiast, detail-oriented"),
            (f"CLI-{inserted_ids[2]:04d}", "Saramma Mathew", 65, "Homemaker", "9876543215", "Wife", None, "Concerned about modern comfort in heritage home"),
        ]
        for r in families:
            pipeline(["INSERT INTO family_details (client_id, name, age, job, phone, relation, family_member_img_url, description) VALUES (?,?,?,?,?,?,?,?)"], [list(r)])
        print(f"OK: family_details seeded")

        # Seed inspiration images
        inspirations = [
            (inserted_ids[0], "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Modern Kerala villa with courtyard"),
            (inserted_ids[0], "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", "Open plan living and dining"),
            (inserted_ids[1], "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", "Modern commercial facade"),
            (inserted_ids[1], "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", "Open office interior"),
            (inserted_ids[2], "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", "Colonial bungalow exterior"),
            (inserted_ids[3], "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", "Eco resort cottages"),
        ]
        for r in inspirations:
            pipeline(["INSERT INTO inspiration_img (project_id, image_url, alt_text) VALUES (?,?,?)"], [list(r)])
        print(f"OK: inspiration_img seeded")

        # Verify
        for pid in inserted_ids:
            r = pipeline(["SELECT COUNT(*) FROM projects WHERE id = ?"], [[pid]])[0]
            count = rows(r)[0][0]
            print(f"VERIFY: project {pid} exists = {count > 0}")

        print()
        print("=== SEED COMPLETE ===")
        print(f"Inserted {len(inserted_ids)} new enquiry projects:")
        for pid in inserted_ids:
            r = pipeline(["SELECT project_name, project_character, project_status FROM projects WHERE id = ?"], [[pid]])[0]
            p = rows(r)[0]
            print(f"  {pid}: {p[0]} (char={p[1]}, status={p[2]})")

    except Exception as e:
        print(f"ERROR: {e}")
        raise

if __name__ == "__main__":
    main()
