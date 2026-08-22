"""Seed extended project data with correct CHECK constraints.

Populates the 9 tables that the frontend renders with fabricated data.
Uses correct Yes/No, Low/Medium/High, Essential/Important/Optional values.

Run from the backend directory:
    python migrations/20260814_seed_extended_project_data.py
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
    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)

    # ── 0. Clean up orphaned client_details ─────────────────────────────
    orphaned = pipeline(["DELETE FROM client_details WHERE project_id IS NULL"])[0]
    print(f"OK: removed {orphaned.get('affected_row_count', 0)} orphaned client_details")

    # ── 1. project_clients (CHECK: elderly_members IN Yes/No, children IN Yes/No, work_from_home IN Yes/No)
    clients = [
        (1, "Family of 4 seeking a modern, sustainable home with open-plan living", "Family", 4, "No", "Yes", "No pets", "Yes", "None specified"),
        (2, "Young couple starting a boutique design studio", "Couple + occasional team", 2, "No", "No", "No", "Yes", "None"),
        (3, "Multi-generational family with elderly parents and children", "Extended family", 6, "Yes", "Yes", "Dog", "Yes", "Wheelchair-accessible ground floor"),
        (4, "Professional couple relocating from abroad", "Couple", 2, "No", "No", "No", "Yes", "None"),
        (5, "Retired couple building their dream retirement villa", "Retired couple", 2, "No", "No", "Cat", "No", "Senior-friendly design"),
        (6, "Corporate office fit-out for 20-person tech team", "Corporate team", 20, "No", "No", "No", "No", "ADA compliance required"),
        (7, "Single professional looking for compact studio", "Individual", 1, "No", "No", "No", "Yes", "None"),
    ]
    for row in clients:
        pipeline(
            ["INSERT INTO project_clients (project_id, about_client, building_users, family_or_team_size, elderly_members, children, pets, work_from_home, accessibility_requirements) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET about_client=excluded.about_client"],
            [[*row]],
        )
    print("OK: project_clients seeded")

    # ── 2. project_lifestyle (CHECK: entertain_guests IN Yes/No, host_parties IN Yes/No)
    lifestyle = [
        (1, "Active family - morning walks, evening homework sessions", "Yes", "Yes", "Reading nook in master bedroom", "Kitchen island", "Gardening, cycling", "Board games, cooking", "High - master bedroom must be quiet"),
        (2, "Creative studio - irregular hours, brainstorming sessions", "Yes", "Yes", "Balcony with city view", "Corner cafe nearby", "Photography, travel", "Sketching, music", "Medium - open to collaborative noise"),
        (3, "Large family - daily rituals, shared meals", "Yes", "Yes", "Veranda swing", "Courtyard morning tea", "Farming, cooking", "Cricket, gardening", "High - private master suite essential"),
        (4, "Busy professionals - gym in morning, dinner at 9pm", "Yes", "Yes", "Home theatre room", "Breakfast counter", "Running, movies", "Reading, tech", "High - quiet study mandatory"),
        (5, "Relaxed retirement - gardening, reading, slow meals", "Yes", "Yes", "Garden gazebo", "Kitchen garden", "Gardening, chess", "Bird watching, painting", "Medium - peaceful neighbourhood"),
        (6, "Agile tech team - standups, sprints, Friday demos", "Yes", "Yes", "Breakout pods", "Pantry coffee station", "Board games, coding", "Hackathons, foosball", "Medium - focus pods needed"),
        (7, "Minimalist lifestyle - small footprint, efficient spaces", "No", "No", "Window seat", "Cafes", "Photography, hiking", "Yoga, journaling", "High - no noise after 10pm"),
    ]
    for row in lifestyle:
        pipeline(
            ["INSERT INTO project_lifestyle (project_id, daily_routine, entertain_guests, host_parties, relaxation_place, morning_coffee_location, outdoor_activities, hobbies, privacy_importance) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET daily_routine=excluded.daily_routine"],
            [[*row]],
        )
    print("OK: project_lifestyle seeded")

    # ── 3. project_approval_process ─────────────────────────────────────
    approval = [
        (1, "Ananya Sharma (client)", "Rahul Sharma (husband)", "2-3 rounds typical", "Email + in-person reviews", "48 hours for minor, 1 week for major"),
        (2, "Priya Menon", "Sarin Thomas (architect partner)", "1-2 rounds", "Video calls + shared boards", "24 hours"),
        (3, "Arun Kumar (eldest son)", "All family members consulted", "3-4 rounds", "WhatsApp group + site visits", "1 week"),
        (4, "Meera Iyer", "Vikram Iyer (spouse)", "2 rounds", "Email + scheduled reviews", "3 business days"),
        (5, "Dev Nair", "Children consulted", "1-2 rounds", "In-person + phone", "Flexible"),
        (6, "CTO + Facilities Manager", "Department heads", "2 rounds", "Slack + formal sign-off", "3 business days"),
        (7, "Individual", "None", "1 round", "Email", "48 hours"),
    ]
    for row in approval:
        pipeline(
            ["INSERT INTO project_approval_process (project_id, primary_decision_maker, other_approval_stakeholders, expected_revision_rounds, design_review_method, approval_turnaround_time) VALUES (?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET primary_decision_maker=excluded.primary_decision_maker"],
            [[*row]],
        )
    print("OK: project_approval_process seeded")

    # ── 4. project_communication ────────────────────────────────────────
    comms = [
        (1, "WhatsApp + email", "WhatsApp for quick queries, email for formal docs", "Weekly site visits + monthly formal review", "Evenings after 6pm", "Both parents must be copied on all updates"),
        (2, "Email + Notion", "Notion for design boards, email for contracts", "Bi-weekly video reviews", "Flexible", "Prefer async updates"),
        (3, "Phone + WhatsApp group", "Family WhatsApp group for daily updates", "Weekly site visits", "Weekends preferred", "All adult family members in group"),
        (4, "Email + Slack", "Slack for real-time, email for approvals", "Bi-weekly", "Evenings IST", "Sync with US timezone on Fridays"),
        (5, "Phone + email", "Phone for urgent, email for records", "Monthly site visits", "Morning 9-11am", "Patient with technology"),
        (6, "Slack + email", "Slack for daily, email for legal", "Weekly standup + monthly deep-dive", "Business hours", "CC facilities manager"),
        (7, "Email", "Email only", "Monthly", "Evenings", "No phone calls please"),
    ]
    for row in comms:
        pipeline(
            ["INSERT INTO project_communication (project_id, preferred_contact, communication_channel, meeting_frequency, best_time_to_reach, special_instructions) VALUES (?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET preferred_contact=excluded.preferred_contact"],
            [[*row]],
        )
    print("OK: project_communication seeded")

    # ── 5. project_technical (CHECK: Yes/No for boolean columns)
    technical = [
        (1, "Yes", "Yes", "Yes", "Yes", "Split AC with zoning", "Yes", "5,000L", "CCTV + smart door locks", "Sustainable concrete, bamboo accents"),
        (2, "Yes", "No", "Yes", "Yes", "VRF system", "Yes", "Municipal", "Card access + surveillance", "Glass, steel, exposed concrete"),
        (3, "Yes", "Yes", "Yes", "Yes", "Split AC + ceiling fans", "Yes", "Borewell + 8,000L", "CCTV + motion sensors", "Laterite stone, terracotta tiles"),
        (4, "Yes", "Yes", "Yes", "Yes", "VRF with individual control", "Yes", "Municipal + 3,000L", "Smart security system", "Green-certified materials"),
        (5, "Yes", "Yes", "Yes", "No", "Split AC in bedrooms only", "Yes", "Municipal", "Basic CCTV", "Local wood, clay tiles"),
        (6, "Yes", "Yes", "Yes", "Yes", "Central VAV", "Yes", "Municipal + backup", "Access control + surveillance", "Glass curtain wall, steel frame"),
        (7, "Yes", "No", "No", "Yes", "Mini-split", "No", "Municipal", "Smart doorbell", "Recycled materials, low-VOC paint"),
    ]
    for row in technical:
        pipeline(
            ["INSERT INTO project_technical (project_id, energy_efficient_design, solar_panels, rainwater_harvesting, smart_home_automation, hvac_preference, backup_power, water_storage_borewell, security_system_requirements, preferred_material_techs) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET energy_efficient_design=excluded.energy_efficient_design"],
            [[*row]],
        )
    print("OK: project_technical seeded")

    # ── 6. project_regulatory ─────────────────────────────────────────
    regulatory = [
        (1, "Residential zone - no commercial", "Ground + 2 floors max", "No", "Not yet - architect to guide", "None known", "3m front, 1.5m sides"),
        (2, "Commercial zone", "Height unrestricted in this zone", "No", "Architect responsible", "None", "As per municipal bylaws"),
        (3, "Agricultural converted to residential", "Ground + 1 floor", "No", "In progress", "None known", "5m front, 2m sides"),
        (4, "Residential gated community", "Ground + 3 floors", "Yes - KMA guidelines", "To be obtained", "None", "4m front, 2m sides"),
        (5, "Residential - coastal regulation zone", "Ground + 1 floor", "No", "Pending", "None", "6m front, 3m sides"),
        (6, "Commercial IT park", "12 floors permitted", "No", "Already obtained", "None", "10m setback"),
        (7, "Residential apartment", "As per apartment bylaws", "Yes", "Already obtained", "None", "N/A"),
    ]
    for row in regulatory:
        pipeline(
            ["INSERT INTO project_regulatory (project_id, zoning_restrictions, height_restrictions, home_owner_association_rules, permits_obtained, land_disputes_encumbrances, setback_requirements) VALUES (?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET zoning_restrictions=excluded.zoning_restrictions"],
            [[*row]],
        )
    print("OK: project_regulatory seeded")

    # ── 7. project_outdoor (CHECK: garden/swimming_pool/outdoor_deck_patio/bbq_area/play_area_children IN Yes/No)
    outdoor = [
        (1, "Yes", "No", "Yes", "Yes", "2 covered + visitor", "Automatic sliding gate", "Yes - 4ft compound wall", "Yes - pathway + garden lights", "No", "No"),
        (2, "No", "No", "Yes", "No", "5 staff + visitor", "Manual shutter", "No", "Basic facade lighting", "No", "No"),
        (3, "Yes", "Yes", "Yes", "Yes", "3 covered + farm vehicles", "Traditional wooden gate", "Yes - live fence", "Yes - decorative + security", "Yes", "Yes"),
        (4, "Yes", "No", "Yes", "Yes", "2 covered + guest", "Remote gate", "Yes - 6ft wall", "Yes - landscape + security", "No", "No"),
        (5, "Yes", "No", "Yes", "Yes", "2 covered + 1 visitor", "Manual gate", "Yes - hedge", "Yes - solar garden lights", "No", "Yes - cat-friendly"),
        (6, "No", "No", "No", "No", "20 covered + visitor", "Barrier gate", "No", "Facade lighting", "No", "No"),
        (7, "Yes", "No", "No", "No", "1 visitor", "Intercom", "No", "Basic", "No", "No"),
    ]
    for row in outdoor:
        pipeline(
            ["INSERT INTO project_outdoor (project_id, garden, swimming_pool, outdoor_deck_patio, bbq_area, parking, driveway_gate_notes, landscape_boundary_fencing, outdoor_lighting, play_area_children, pet_friendly_outdoor) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET garden=excluded.garden"],
            [[*row]],
        )
    print("OK: project_outdoor seeded")

    # ── 8. project_spaces (CHECK: priority IN Essential/Important/Optional)
    spaces = [
        (1, "Formal Living Room", 1, "Essential", "450", 1, "Adjacent to dining"),
        (1, "Master Bedroom Suite", 1, "Essential", "380", 1, "Ensuite bathroom + walk-in closet"),
        (1, "Home Office", 1, "Essential", "200", 1, "Quiet corner, natural light"),
        (1, "Open Kitchen + Dining", 1, "Essential", "400", 1, "Island with breakfast bar"),
        (1, "Guest Bedroom", 1, "Important", "280", 1, "Ground floor, accessible"),
        (1, "Children's Bedroom", 1, "Important", "250", 2, "Shared bath, study nook"),
        (1, "Utility Room", 1, "Important", "120", 1, "Near kitchen, laundry"),
        (2, "Design Studio Floor", 1, "Essential", "800", 1, "Open plan, north light"),
        (2, "Meeting Room", 1, "Essential", "300", 1, "Glass walls, AV ready"),
        (2, "Reception + Waiting", 1, "Important", "200", 1, "Street-facing"),
        (2, "Pantry + Breakout", 1, "Important", "150", 1, "Near studios"),
        (2, "Director Cabin", 1, "Essential", "250", 1, "Corner, private"),
        (3, "Central Courtyard", 1, "Essential", "600", 1, "Heart of home, open to sky"),
        (3, "Grandparents' Suite", 1, "Essential", "320", 1, "Ground floor, attached bath"),
        (3, "Family Living Hall", 1, "Essential", "500", 1, "Adjacent to courtyard"),
        (3, "Kitchen + Dining", 1, "Essential", "450", 1, "Large for family meals"),
        (3, "Home Office", 1, "Important", "200", 1, "Quiet wing"),
        (3, "Children's Bedrooms", 1, "Important", "220", 2, "First floor, shared bath"),
        (4, "Open Plan Living", 1, "Essential", "500", 1, "Views to garden"),
        (4, "Master Bedroom", 1, "Essential", "350", 1, "Walk-in closet"),
        (4, "Study / Guest Room", 1, "Important", "200", 1, "Convertible"),
        (4, "Modular Kitchen", 1, "Essential", "250", 1, "European fittings"),
        (5, "Sun Room", 1, "Essential", "300", 1, "South-facing, reading"),
        (5, "Master Suite", 1, "Essential", "400", 1, "Garden access"),
        (5, "Guest Cottage", 1, "Important", "350", 1, "Separate entrance"),
        (5, "Kitchen Garden", 1, "Important", "200", 1, "Herbs + vegetables"),
        (6, "Open Workspace", 1, "Essential", "1,200", 1, "120 seats, agile layout"),
        (6, "Meeting Pods", 1, "Essential", "400", 4, "4-6 person each"),
        (6, "Town Hall", 1, "Important", "600", 1, "80 person, AV"),
        (6, "Pantry + Recreation", 1, "Important", "300", 1, "Games + coffee"),
        (6, "Server Room", 1, "Essential", "150", 1, "Climate controlled"),
        (7, "Studio Living", 1, "Essential", "400", 1, "Multi-functional"),
        (7, "Kitchenette", 1, "Important", "100", 1, "Compact, efficient"),
        (7, "Bathroom", 1, "Essential", "80", 1, "Full bath"),
    ]
    for row in spaces:
        pipeline(
            ["INSERT INTO project_spaces (project_id, space_name, required, priority, approx_area_size, quantity, adjacency_notes) VALUES (?,?,?,?,?,?,?)"],
            [[*row]],
        )
    print("OK: project_spaces seeded")

    # ── 9. project_timeline (CHECK: phased IN Yes/No, urgency_level IN Low/Medium/High)
    timelines = [
        (1, "2026-09-01", "2027-03-31", "Must complete before monsoon 2027", "No", "N/A", "Medium"),
        (2, "2026-10-01", "2027-01-31", "Soft opening for Kochi Design Week", "Yes", "Phase 1: Shell, Phase 2: Interiors", "High"),
        (3, "2026-08-15", "2027-06-30", "Festival season completion desired", "No", "N/A", "Medium"),
        (4, "2026-11-01", "2027-08-31", "Aligned with school admission cycle", "Yes", "Phase 1: Structure, Phase 2: Fit-out", "High"),
        (5, "2026-12-01", "2027-12-01", "No fixed deadline - quality over speed", "No", "N/A", "Low"),
        (6, "2026-09-15", "2027-02-28", "Must be operational by Q1 FY27", "Yes", "Phase 1: Core, Phase 2: Furniture, Phase 3: IT", "High"),
        (7, "2026-10-01", "2026-12-31", "Lease starting Jan 2027", "No", "N/A", "High"),
    ]
    for row in timelines:
        pipeline(
            ["INSERT INTO project_timeline (project_id, desired_start_date, desired_completion_date, fixed_deadline_notes, phased, phases_description, urgency_level) VALUES (?,?,?,?,?,?,?) ON CONFLICT(project_id) DO UPDATE SET desired_start_date=excluded.desired_start_date"],
            [[*row]],
        )
    print("OK: project_timeline seeded")

    # Verify row counts
    for table in ["project_clients", "project_lifestyle", "project_approval_process", "project_communication", "project_technical", "project_regulatory", "project_outdoor", "project_spaces", "project_timeline"]:
        count = rows(pipeline([f"SELECT count(*) FROM {table}"])[0])[0][0]
        print(f"VERIFY {table}: {count} rows")

    print("OK: extended project data seed complete")


if __name__ == "__main__":
    main()
