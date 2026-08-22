"""Delete duplicate enquiry projects 20-23 and update remaining projects 16-19 with unique details.

Run from the backend directory:
    python migrations/fix_duplicate_enquiries.py
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

    # Step 1: Delete duplicate projects 20-23 and all related data
    duplicate_ids = [20, 21, 22, 23]
    print(f"Deleting duplicate projects {duplicate_ids}...")

    for pid in duplicate_ids:
        # Delete in order of dependency
        pipeline(["DELETE FROM project_scope_item WHERE scope_id IN (SELECT id FROM project_scope WHERE project_id = ?)"], [[pid]])
        pipeline(["DELETE FROM project_scope WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_DOC WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM requirement_items WHERE requirement_id IN (SELECT id FROM requirements WHERE project_id = ?)"], [[pid]])
        pipeline(["DELETE FROM requirements WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM family_details WHERE client_id IN (SELECT client_id FROM client_details WHERE project_id = ?)"], [[pid]])
        pipeline(["DELETE FROM inspiration_img WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM client_details WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM enquiry_details WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_budget WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_site WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_clients WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_lifestyle WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_approval_process WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_communication WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_technical WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_regulatory WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_outdoor WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_timeline WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_spaces WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM projects WHERE id = ?"], [[pid]])
        print(f"  Deleted project {pid} and all related data")

    # Step 2: Update remaining projects 16-19 with unique details
    print("\nUpdating projects 16-19 with unique details...")

    # Project 16: Nila Residence (keep but enhance)
    # Project 17: Marina Commercial Plaza (keep but enhance)
    # Project 18: Heritage Restoration (keep but enhance)
    # Project 19: Greenfield Eco Resort (keep but enhance)

    # Update projects table
    updates = [
        {
            "id": 16,
            "name": "Nila Residence - Kakkanad Villa",
            "type": "Residential",
            "building": "Villa",
            "construction": "New construction",
            "purpose": "Family residence",
            "description": "Modern 3-bedroom villa with central courtyard, home office, and landscaped garden. Designed for a young professional family with work-from-home needs.",
            "cover": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
            "sq_area": 3200,
            "timeline": "8-10 months",
            "overview": "A young family of four seeks a modern Kerala-style villa in Kakkanad, Kochi. Requirements include 3 bedrooms with attached bathrooms, a dedicated home office with natural lighting, open-plan living and dining area facing a central courtyard, modern kitchen with island counter, and a landscaped garden with parking for 2 vehicles. Budget range 45-60 lakhs. Site has clear title and is located in a gated community with 24/7 security."
        },
        {
            "id": 17,
            "name": "Marina Commercial Plaza - MG Road",
            "type": "Commercial",
            "building": "Office Complex",
            "construction": "New construction",
            "purpose": "Commercial office space",
            "description": "Ground + 2 floor commercial complex for expanding IT startup. Open floor plans with conference rooms, cafeteria, and basement parking.",
            "cover": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
            "sq_area": 8500,
            "timeline": "12-14 months",
            "overview": "Tech startup 'VentureTech Solutions' needs 8,500 sq ft office space across 3 floors on MG Road, Kochi. Ground floor: reception + open office for 30 staff. First floor: 2 conference rooms, 4 private cabins, breakout area. Second floor: cafeteria for 50 people, terrace lounge, server room. Basement parking for 25 vehicles with EV charging. Must comply with commercial building codes and obtain KSERP clearance."
        },
        {
            "id": 18,
            "name": "Malabar Heritage House - Kumarakom",
            "type": "Residential",
            "building": "Heritage Bungalow",
            "construction": "Renovation",
            "purpose": "Heritage restoration with modern amenities",
            "description": "1920s colonial bungalow restoration in Kumarakom. Preserve original teak woodwork and verandahs while adding modern plumbing, electrical, and climate control.",
            "cover": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            "sq_area": 4200,
            "timeline": "10-12 months",
            "overview": "Restore a 1920s colonial-era bungalow in Kumarakom, Kottayam for Dr. Thomas Mathew (retired professor). Must preserve original teak woodwork, verandahs, and Mangalore tile roof while adding modern plumbing, electrical rewiring, VRF climate control, and accessibility features. Heritage committee approval required. The property includes a 0.5-acre compound with ancient mango trees and a traditional pond."
        },
        {
            "id": 19,
            "name": "Greenfield Backwater Eco Resort",
            "type": "Mixed Use",
            "building": "Resort",
            "construction": "New construction",
            "purpose": "Eco-friendly boutique resort",
            "description": "12-cottage eco resort near Alappuzha backwaters with sustainable design. Solar power, rainwater harvesting, organic gardens, and wellness center.",
            "cover": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "sq_area": 15000,
            "timeline": "18-24 months",
            "overview": "Sustainable 12-cottage eco-resort on 3-acre waterfront property near Alappuzha backwaters for Greenfield Hospitality Group. Each cottage 800 sq ft with private deck and outdoor shower. Common area includes dining pavilion (60 covers), wellness center with yoga deck and 2 massage rooms, reception lounge with thatched roof, and organic garden. 100% solar powered, rainwater harvesting, greywater recycling. CRZ and environmental clearance pending."
        }
    ]

    for proj in updates:
        pipeline([
            """UPDATE projects SET
                project_name = ?,
                project_type = ?,
                building_type = ?,
                new_construction_or_renovation = ?,
                purpose_of_project = ?,
                brief_description = ?,
                cover_image_url = ?,
                sq_area = ?,
                client_expected_timeline = ?,
                over_view = ?,
                updated_at = strftime('%s','now')
            WHERE id = ?"""
        ], [[
            proj["name"], proj["type"], proj["building"], proj["construction"],
            proj["purpose"], proj["description"], proj["cover"], proj["sq_area"],
            proj["timeline"], proj["overview"], proj["id"]
        ]])
        print(f"  Updated project {proj['id']}: {proj['name']}")

    # Step 3: Delete old related data for 16-19
    print("\nClearing old related data...")
    for pid in [16, 17, 18, 19]:
        pipeline(["DELETE FROM project_scope_item WHERE scope_id IN (SELECT id FROM project_scope WHERE project_id = ?)"], [[pid]])
        pipeline(["DELETE FROM project_scope WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_DOC WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM requirement_items WHERE requirement_id IN (SELECT id FROM requirements WHERE project_id = ?)"], [[pid]])
        pipeline(["DELETE FROM requirements WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM inspiration_img WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_spaces WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM family_details WHERE client_id IN (SELECT client_id FROM client_details WHERE project_id = ?)"], [[pid]])
        pipeline(["DELETE FROM client_details WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM enquiry_details WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_budget WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_site WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_clients WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_lifestyle WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_approval_process WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_communication WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_technical WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_regulatory WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_outdoor WHERE project_id = ?"], [[pid]])
        pipeline(["DELETE FROM project_timeline WHERE project_id = ?"], [[pid]])
        print(f"  Cleared old data for project {pid}")

    # Step 4: Insert new related data
    print("\nInserting new related data...")

    # client_details
    clients = [
        (16, "CLI-0016", "Rahul & Ananya Nair", "rahul.nair@email.com", "9847012345"),
        (17, "CLI-0017", "VentureTech Solutions", "contact@venturetech.in", "9876543210"),
        (18, "CLI-0018", "Dr. Thomas Mathew", "thomas.mathew@email.com", "9847012346"),
        (19, "CLI-0019", "Greenfield Hospitality Group", "projects@greenfield.in", "9876543211"),
    ]
    for pid, cid, name, email, phone in clients:
        pipeline(["INSERT INTO client_details (client_id, client_name, email, phone, project_id) VALUES (?, ?, ?, ?, ?)"], [[cid, name, email, phone, pid]])
    print("  Inserted client_details")

    # project_site
    sites = [
        (16, "Kakkanad, Kochi", '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"]'),
        (17, "MG Road, Kochi", '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"]'),
        (18, "Kumarakom, Kottayam", '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"]'),
        (19, "Alappuzha Backwaters", '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"]'),
    ]
    for pid, place, imgs in sites:
        pipeline(["INSERT INTO project_site (project_id, place, site_img_url) VALUES (?, ?, ?)"], [[pid, place, imgs]])
    print("  Inserted project_site")

    # project_budget
    budgets = [
        (16, 5500000),
        (17, 12000000),
        (18, 8000000),
        (19, 25000000),
    ]
    for pid, amount in budgets:
        pipeline(["INSERT INTO project_budget (project_id, estimated_overall_budget) VALUES (?, ?)"], [[pid, amount]])
    print("  Inserted project_budget")

    # enquiry_details
    for pid in [16, 17, 18, 19]:
        pipeline(["INSERT INTO enquiry_details (enq_id, project_id, view) VALUES (?, ?, 0)"], [[f"ENQ-2026-{pid:04d}", pid]])
    print("  Inserted enquiry_details")

    # project_clients
    project_clients_data = [
        (16, "Young professional couple with 2 children (ages 8 and 5)", "Family of 4", 4, "No", "Yes", "No", "Yes", "Wheelchair ramp for elderly grandmother who visits monthly", "CLI-0016"),
        (17, "IT startup with 3 co-founders and 42 employees", "Office staff of 45", 45, "No", "No", "No", "Yes", "Accessible restrooms, ramps, and elevator for wheelchair users", "CLI-0017"),
        (18, "Retired professor (68) and wife (65) with occasional guests", "Couple with guests", 2, "No", "No", "No", "No", "Level entry, grab bars in all bathrooms, non-slip flooring", "CLI-0018"),
        (19, "Hospitality management company operating 3 resorts in Kerala", "Guests (60 max) + 15 staff", 75, "No", "No", "No", "No", "Universal design compliance, accessible cottages, ramps throughout", "CLI-0019"),
    ]
    for r in project_clients_data:
        pipeline(["INSERT INTO project_clients (project_id, about_client, building_users, family_or_team_size, elderly_members, children, pets, work_from_home, accessibility_requirements, client_id) VALUES (?,?,?,?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_clients")

    # project_lifestyle
    lifestyle_data = [
        (16, "Early risers (6 AM), home-cooked meals daily, weekend hosting for extended family", "Yes", "Yes", "Courtyard garden with seating", "Kitchen garden for herbs", "Walking, yoga, gardening", "Photography, reading, cooking", "Very important - prefer 3m setback on all sides"),
        (17, "9-6 office hours, Friday team lunches, monthly town halls", "Yes", "Yes", "Terrace lounge with city view", "Pantry with coffee station", "Cycling club on weekends", "Board games, table tennis", "Medium - open plan with acoustic privacy pods and phone booths"),
        (18, "Quiet mornings with tea on verandah, afternoon naps, early dinner", "Yes", "Yes", "Restored verandah with swing", "Traditional courtyard with tulasi", "Bird watching, temple visits", "Antique collecting, Malayalam literature", "Very important - 5m setback to preserve ancient mango trees"),
        (19, "Guests arrive year-round, peak season Dec-Feb and Jun-Aug", "Yes", "Yes", "Deck overlooking backwaters with sunset view", "Restaurant patio for alfresco dining", "Kayaking, nature walks, cycling", "Sustainability education, Ayurveda", "Medium - natural screening with native coconut and banana plants"),
    ]
    for r in lifestyle_data:
        pipeline(["INSERT INTO project_lifestyle (project_id, daily_routine, entertain_guests, host_parties, relaxation_place, morning_coffee_location, outdoor_activities, hobbies, privacy_importance) VALUES (?,?,?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_lifestyle")

    # project_approval_process
    approval_data = [
        (16, "Rahul Nair (husband) - primary decision maker", "Ananya Nair (wife) - co-decision on aesthetics", "2-3 rounds", "3D renders and physical material samples", "3-5 days for feedback"),
        (17, "Board of directors (3 partners) - unanimous approval required", "Office manager - operational feasibility", "3-4 rounds", "Digital presentations with detailed cost breakdowns", "5-7 business days"),
        (18, "Dr. Thomas Mathew - sole decision maker", "Heritage committee - mandatory approval for all exterior changes", "4-6 rounds", "Detailed drawings with heritage committee stamp", "2-3 weeks (heritage committee meets monthly)"),
        (19, "Managing director - financial and strategic approval", "Investor group (3 angel investors) - ROI focused", "3-5 rounds", "Professional pitch deck with 5-year ROI analysis and market comps", "7-10 days"),
    ]
    for r in approval_data:
        pipeline(["INSERT INTO project_approval_process (project_id, primary_decision_maker, other_approval_stakeholders, expected_revision_rounds, design_review_method, approval_turnaround_time) VALUES (?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_approval_process")

    # project_communication
    comm_data = [
        (16, "WhatsApp", "WhatsApp family group + email for formal docs", "Weekly progress call on Sunday evenings", "Evenings after 6 PM or weekends", "Prefers visual updates with daily site photos"),
        (17, "Email", "Email + Slack + Asana for project tracking", "Bi-weekly review meeting (Tue/Thu 4 PM)", "Business hours 9 AM - 6 PM", "Requires formal signed approvals for any budget changes >₹50K"),
        (18, "Phone call", "Phone + postal correspondence + occasional home visit", "Monthly site visit with tea and discussion", "Morning 9-11 AM only", "Traditional, prefers face-to-face discussions, dislikes video calls"),
        (19, "Video conference", "Slack + Zoom + Loom for async updates", "Weekly standup (Monday 10 AM)", "Flexible, but record all meetings for investor updates", "Multi-timezone friendly (investors in Dubai and Singapore)"),
    ]
    for r in comm_data:
        pipeline(["INSERT INTO project_communication (project_id, preferred_contact, communication_channel, meeting_frequency, best_time_to_reach, special_instructions) VALUES (?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_communication")

    # project_technical
    tech_data = [
        (16, "Yes", "Yes", "Yes", "Yes", "VRF multi-split with zoning", "Yes", "Borewell + rainwater harvesting", "CCTV + smart doorbell + motion sensors", "Laterite stone, terracotta tiles, teak wood"),
        (17, "Yes", "Yes", "No", "Yes", "Central HVAC with VAV", "Yes", "Municipal + 20,000L underground storage", "CCTV + access control + biometric entry", "Glass curtain wall, raised flooring, false ceiling"),
        (18, "Yes", "No", "Yes", "No", "Split AC units in 3 rooms only", "No", "Well water + traditional pond", "Basic alarm system (no visible modern devices)", "Original teak, Mangalore tiles, lime plaster"),
        (19, "Yes", "Yes", "Yes", "Yes", "Passive cooling + ceiling fans (no AC in cottages)", "Yes", "Rainwater + treated well water", "Perimeter sensors + cottage door sensors", "Bamboo, thatch, local laterite stone, coconut wood"),
    ]
    for r in tech_data:
        pipeline(["INSERT INTO project_technical (project_id, energy_efficient_design, solar_panels, rainwater_harvesting, smart_home_automation, hvac_preference, backup_power, water_storage_borewell, security_system_requirements, preferred_material_techs) VALUES (?,?,?,?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_technical")

    # project_regulatory
    reg_data = [
        (16, "Residential zone R-2, gated community", "Ground + 2 floors max (12m height)", "No HOA but society rules apply", "Not yet obtained (builder will assist)", "None known, title is clear", "Front 3m, sides 2m, rear 2m (as per community rules)"),
        (17, "Commercial zone C-1, main road frontage", "Ground + 3 floors max (15m height)", "Commercial association fees ₹5/sq ft/month", "Pending (architect to prepare drawings)", "None", "Front 5m, sides 3m, rear 3m"),
        (18, "Heritage conservation zone HC-1", "No height increase permitted (preserve original)", "Heritage committee approval mandatory for all changes", "Requires heritage NOC before any work begins", "None, family owned for 3 generations", "Front 5m (preserve existing verandah), sides 3m"),
        (19, "Tourism development zone TD-2, CRZ area", "Ground + 1 floor max (6m height)", "Eco-certification required (GSTC criteria)", "Environmental clearance + CRZ clearance pending", "Coastal Regulation Zone applies (100m setback from HTL)", "Front 10m (backwater setback), sides 5m, rear 8m"),
    ]
    for r in reg_data:
        pipeline(["INSERT INTO project_regulatory (project_id, zoning_restrictions, height_restrictions, home_owner_association_rules, permits_obtained, land_disputes_encumbrances, setback_requirements) VALUES (?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_regulatory")

    # project_outdoor
    outdoor_data = [
        (16, "Yes (600 sq ft landscaped)", "No", "Yes (covered patio 200 sq ft)", "No", "2 covered car parking", "Automatic sliding gate", "Live hedge + 4ft brick wall", "Solar path lights + courtyard uplighting", "Yes (small play area with swings)", "Yes (dog-friendly lawn)"),
        (17, "No (concrete landscape only)", "No", "No", "No", "25 + 5 visitor parking in basement", "Security boom barrier with RFID", "Chain link fence + hedges", "LED flood lights + parking area lights", "No", "No"),
        (18, "Yes (heritage garden with native plants)", "No", "Yes (restored verandah 400 sq ft)", "No", "4 covered + 2 visitor parking", "Wrought iron gate (restore original)", "Laterite wall with original gate pillars", "Vintage-style lamp posts + warm bollards", "No", "Yes (pet-friendly with walking path)"),
        (19, "Yes (organic garden 2000 sq ft)", "Yes (natural pool with bio-filter)", "Yes (multiple decks and pavilions)", "Yes (2 BBQ stations)", "Visitor parking for 20 vehicles", "Natural bamboo fence with gate", "Native shrub hedge + coconut palms", "Solar deck lights + low-level path lighting", "Yes (children's nature play area)", "Yes (pet-friendly cottages)"),
    ]
    for r in outdoor_data:
        pipeline(["INSERT INTO project_outdoor (project_id, garden, swimming_pool, outdoor_deck_patio, bbq_area, parking, driveway_gate_notes, landscape_boundary_fencing, outdoor_lighting, play_area_children, pet_friendly_outdoor) VALUES (?,?,?,?,?,?,?,?,?,?,?)"], [list(r)])
    print("  Inserted project_outdoor")

    # project_timeline
    timeline_data = [
        (16, "2026-09-01", "2027-06-30", "Must complete before school year starts (June 2027)", "No", "N/A", "Medium"),
        (17, "2026-10-01", "2027-12-31", "Move-in by January 2028 for expansion plan", "Yes", "Phase 1: Shell and core (6 months), Phase 2: Interiors (4 months), Phase 3: Landscape and parking (4 months)", "High"),
        (18, "2026-08-01", "2027-08-31", "Heritage festival deadline - August 2027 for inauguration", "No", "N/A", "Medium (heritage committee meetings may cause delays)"),
        (19, "2027-01-01", "2028-12-31", "Soft opening December 2028 for peak season", "Yes", "Phase 1: Common areas and 4 cottages (12 months), Phase 2: Remaining 8 cottages (8 months), Phase 3: Landscaping and wellness center (4 months)", "Low (eco-construction allows flexibility)"),
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
        ("CLI-0016", "Rahul Nair", 38, "Software Engineer at Infosys", "9876543212", "Husband / Father", None, "Primary decision maker, works from home 3 days/week, prefers quiet office corner"),
        ("CLI-0016", "Ananya Nair", 35, "Interior Designer (freelance)", "9876543213", "Wife / Mother", None, "Co-decision maker on aesthetics, colors, and materials. Has strong opinions on Vastu compliance"),
        ("CLI-0016", "Meera Nair", 8, "Student (Grade 3)", None, "Daughter", None, "Needs study desk by window, loves art and craft, wants pink accent wall"),
        ("CLI-0016", "Aarav Nair", 5, "Kindergarten", None, "Son", None, "Needs small play area, loves dinosaurs and cars"),
        ("CLI-0018", "Dr. Thomas Mathew", 68, "Retired Professor of History", "9876543214", "Owner", None, "Heritage enthusiast, detail-oriented, wants every change documented with photos"),
        ("CLI-0018", "Saramma Mathew", 65, "Homemaker", "9876543215", "Wife", None, "Concerned about modern comfort, wants western toilet, geyser, and mixer grinder in kitchen"),
    ]
    for r in families_data:
        pipeline(["INSERT INTO family_details (client_id, name, age, job, phone, relation, family_member_img_url, description) VALUES (?,?,?,?,?,?,?,?)"], [list(r)])
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
    for pid in [16, 17, 18, 19]:
        r = pipeline(["SELECT project_name, project_character, project_status, sq_area, brief_description FROM projects WHERE id = ?"], [[pid]])[0]
        p = rows(r)[0]
        print(f"Project {pid}: {p[0]} (char={p[1]}, status={p[2]}, area={p[3]})")
        print(f"  Desc: {p[4][:80]}...")

    print("\n=== FIX COMPLETE ===")

if __name__ == "__main__":
    main()
