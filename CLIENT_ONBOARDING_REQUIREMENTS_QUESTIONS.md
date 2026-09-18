# Kallisto – Client Onboarding & Requirement Gathering Questionnaire

> **Document Purpose:**  
> This questionnaire is designed for Kallisto service providers, lead architects, project managers, and the **Odin AI** requirement extraction engine. Its objective is to systematically uncover the client's functional program, aesthetic identity, lifestyle nuances, technical parameters, regulatory constraints, and commercial boundaries before design commencement.

---

## 📋 Interviewer & Onboarding Protocol

1. **Conversational First:** Use these questions as an empathetic interview guide rather than a mechanical audit.
2. **Distinguish 'Needs' vs. 'Wants':** Tag answers as **Essential (P0)**, **Important (P1)**, or **Desirable / Aspirational (P2)**.
3. **Capture Context & Imagery:** Always encourage the client to share sketches, photos of existing spaces, inspirational reference pins, or site video walkthroughs.
4. **Odin AI Traceability:** Requirements captured here populate the project's authoritative requirement baseline. Never overwrite raw client inputs; let Odin generate structured interpretations alongside direct quotes.

---

## 1. Client & Stakeholder Identification

*Understand who will own, live in, or use the space, and who holds approval authority.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 1.1 | **Who is the primary contact person / project champion?** | Full Name, Phone, Email, WhatsApp | Single point of operational contact to avoid communication breakdown. | `client.spoc` |
| 1.2 | **Who is the legal property owner / contract signatory?** | Full Name, Relationship | Confirms legal contracting authority and authorization to sign agreements and approvals. | `client.owner` |
| 1.3 | **Who are all key decision-makers involved in design approvals?** | Names & Roles (Spouse, Business Partner, Co-owner, Parents) | Prevents late-stage redesigns caused by unconsulted stakeholders. | `decision.stakeholders` |
| 1.4 | **Are there secondary influencers or advisors?** | E.g. Vastu Consultant, Feng Shui Master, Family Elder, Interior Stylist | Clarifies external validation checkpoints early before drawings progress. | `decision.advisors` |
| 1.5 | **What is the best time and preferred mode of communication?** | WhatsApp / Phone / Email / In-Person / Video Conference | Sets communication rhythm and response SLAs. | `communication.channel` |

---

## 2. Project Core Identity & Scope of Work

*Define what type of project is being undertaken and the exact service envelope expected.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 2.1 | **What is the project name or working title?** | Text | Project identity within the Kallisto workspace. | `project.title` |
| 2.2 | **What is the project typology?** | Single Choice: Residential / Commercial / Hospitality / Mixed-Use / Retail / Industrial | Determines applicable building codes, structural loads, and studio specialization. | `project.typology` |
| 2.3 | **What is the building format?** | Single Choice: Independent Villa / Duplex House / Penthouse / Apartment / Row House / Office Suite / Bare-Shell Commercial | Sets spatial boundaries and architectural vs. interior scope. | `project.building_format` |
| 2.4 | **Is this a New Build, Renovation, or Fit-Out?** | Single Choice: Ground-up Construction / Complete Renovation / Interior Fit-Out / Structural Extension / Façade Redesign | Governs demolition, structural audit requirements, and baseline site survey needs. | `project.nature_of_work` |
| 2.5 | **What is the primary purpose of this property?** | Single Choice: Primary Personal Residence / Holiday Home / Rental Income / Speculative Investment / Commercial Workspace | Defines lifecycle durability, material grade, and maintenance expectations. | `project.purpose` |
| 2.6 | **What services do you expect from Kallisto & your Service Provider?** | Multi-select: Architectural Design / Structural Engineering / Interior Design / Turnkey Construction / MEP Engineering / Landscape Design / Project Management / Statutory Approvals | Establishes the authoritative Scope of Work (SOW) matrix. | `scope.services_requested` |

---

## 3. Site, Land & Environmental Context

*Gather critical physical and contextual parameters that dictate the building envelope.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 3.1 | **What is the exact site address / coordinates?** | Address + GPS Pin | Enables remote satellite review, zoning verification, and logistics planning. | `site.location` |
| 3.2 | **What are the plot dimensions and total land area?** | Dimensions (L × W) & Area (Sq Ft / Sq Metres / Cents / Gunthas) | Establishes ground coverage, setback calculations, and allowable FSI/FAR. | `site.plot_area` |
| 3.3 | **Which cardinal direction does the property face?** | N / S / E / W / NE / NW / SE / SW | Sun path analysis, natural heat load, daylighting, and Vastu compliance. | `site.orientation` |
| 3.4 | **What is the topography of the land?** | Flat / Gentle Slope / Steep Terrain / Stepped Terraces / Low-lying | Dictates cut-and-fill, retaining walls, basement suitability, and drainage design. | `site.topography` |
| 3.5 | **What is the access road width and condition?** | Road Width (in Ft/M), Paved / Unpaved / Cul-de-sac | Construction equipment access, RMC truck movement, and municipal setback rules. | `site.access_road` |
| 3.6 | **Are there existing structures or trees on site?** | Text / Upload | Identifies structures to demolish or heritage trees to protect and incorporate. | `site.existing_conditions` |
| 3.7 | **What surrounds the property on all four sides?** | North / South / East / West surroundings (vacant plots, tall buildings, roads, parks) | Views to capture vs. privacy screens to erect; noise and dust considerations. | `site.context_surroundings` |
| 3.8 | **What utilities are currently connected or accessible at site?** | Multi-select: Municipal Water / Borewell / Grid Electricity / Temporary Power / Sewage Line / Septic Tank / Fiber Internet | Flags preliminary infrastructure investments needed before construction. | `site.utilities` |
| 3.9 | **Do you possess existing land surveys or soil test reports?** | File Upload (DWG / PDF) | Accelerates structural engineering and foundation design. | `site.survey_reports` |

---

## 4. Vision, Aesthetics & Architectural Character

*Translate abstract feelings and stylistic tastes into concrete design directions.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 4.1 | **In 3 to 5 words, how should your completed space feel?** | Text (e.g. "Serene, warm, sunlit, understated, modern") | Establishes the emotional design thesis and experiential goal. | `vision.emotional_tone` |
| 4.2 | **What architectural style resonates most with you?** | Multi-select: Modern Contemporary / Tropical Modern / Minimalist / Industrial Chic / Vernacular-Traditional / Classical / Scandinavian / Japandi / Brutalist / Mediterranean | Anchors exterior massing, fenestrations, rooflines, and spatial character. | `style.architectural_style` |
| 4.3 | **What interior design language do you prefer?** | Multi-select: Warm Minimalist / Contemporary Luxury / Earthy & Raw / Classic Contemporary / Eclectic / Modern Farmhouse | Directs interior joinery, cabinetry, ceiling designs, and furniture procurement. | `style.interior_style` |
| 4.4 | **What materials and textures do you love?** | Multi-select: Exposed Concrete / Teak & Oak Wood / Natural Stone / Brass & Fluted Glass / Terracotta / Large Format Porcelain / Lime Plaster | Informs core material palette and specification sheets. | `style.preferred_materials` |
| 4.5 | **What materials, colors, or finishes do you strongly dislike or want to avoid?** | Text (e.g. "No high-gloss surfaces, no fake wood tiles, avoid dark gloomy walls, avoid marble maintenance") | Prevents costly presentation rounds with rejected finishes. | `style.materials_to_avoid` |
| 4.6 | **What are your favorite reference projects, hotels, or residences?** | Links / Reference Names / Image Uploads | Concrete visual benchmarks for quality and detailing expectations. | `vision.inspirational_references` |
| 4.7 | **What should someone's first impression be when walking into the building?** | Text (e.g. "A dramatic double-height foyer with a courtyard view", "Subtle, understated elegance") | Focuses effort on key architectural feature moments. | `vision.first_impression` |

---

## 5. Occupant Profile, Lifestyle & Daily Habits

*Design around actual living and working patterns rather than generic floorplans.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 5.1 | **Who will permanently reside in or occupy the space?** | Family composition: Adults, Elderly, Children (with ages), Pets | Defines safety provisions, acoustic needs, and bedroom counts. | `lifestyle.occupants` |
| 5.2 | **Do any occupants have accessibility or mobility requirements?** | Yes / No + Details (Wheelchair access, zero-threshold showers, ground-floor bedroom, elevator provision) | Non-negotiable life-safety and universal design parameters. | `lifestyle.accessibility` |
| 5.3 | **How do you use your home on a typical weekday vs. weekend?** | Text / Routine narrative | Maps out morning rush flow, quiet work hours, and evening family time. | `lifestyle.daily_routine` |
| 5.4 | **How frequently do you entertain guests, and in what style?** | Single Choice: Daily family visits / Weekly intimate dinners / Monthly large parties (20+ guests) / Rarely / Formal business gatherings | Sizes the formal living, dining, parking, and powder room provisions. | `lifestyle.entertaining_habits` |
| 5.5 | **Does anyone work from home on a full-time or hybrid basis?** | Yes / No + Number of people | Dictates dedicated home office vs. study nook, acoustic isolation, and high-speed data cabling. | `lifestyle.work_from_home` |
| 5.6 | **What hobbies, fitness, or personal interests need dedicated space?** | Multi-select: Reading / Music & Instruments / Gym & Yoga / Gardening / Home Theater / Art / Cooking / Gaming / Meditation | Prevents afterthought retrofitting of specialized equipment or acoustic spaces. | `lifestyle.hobbies` |
| 5.7 | **What level of visual and acoustic privacy do you require?** | High / Medium / Low (Public vs. Private zoning preference) | Guides spatial layout between guest entertaining zones and family bedrooms. | `lifestyle.privacy_level` |
| 5.8 | **Are traditional compliance principles (e.g. Vastu Shastra / Feng Shui) essential?** | Essential (Strict) / Moderate (Key zones only) / Not Applicable | Critical constraint for kitchen placement, master bed direction, entrance orientation, and water bodies. | `lifestyle.vastu_compliance` |

---

## 6. Detailed Spatial Programming (Room-by-Room Matrix)

*Define room inventory, approximate sizes, priority, and functional adjacencies.*

### Living, Dining & Social Zones
| Space | Required? | Priority | Placement Preference | Special Features / Adjacencies |
|-------|-----------|----------|----------------------|--------------------------------|
| **Foyer / Entry Lobby** | Yes / No | P0 / P1 / P2 | Ground floor, main door | Shoe storage, seating ledge, privacy screen |
| **Formal Living Room** | Yes / No | P0 / P1 / P2 | Near entrance | Separated from private zones, garden view |
| **Family Living / Lounge** | Yes / No | P0 / P1 / P2 | Central / First floor | Connected to dining/kitchen, TV wall |
| **Dining Area** | Yes / No | P0 / P1 / P2 | Adjacent to kitchen | Seating capacity (6 / 8 / 10 / 12 seater), courtyard adjacency |
| **Powder Room / Guest Bath** | Yes / No | P0 / P1 / P2 | Near formal living / foyer | Discreet entrance, high-end vanity |
| **Puja / Prayer / Meditation** | Yes / No | P0 / P1 / P2 | Vastu-compliant (NE/East preferred) | Quiet, natural light, ventilation for incense/diya |

### Culinary & Service Zones
| Space | Required? | Priority | Placement Preference | Special Features / Adjacencies |
|-------|-----------|----------|----------------------|--------------------------------|
| **Show / Dry Kitchen** | Yes / No | P0 / P1 / P2 | Open to dining | Island counter, breakfast bar, integrated appliances |
| **Wet / Heavy Cooking Kitchen**| Yes / No | P0 / P1 / P2 | Enclosed, adjacent to dry kitchen | High-suction chimney, deep sinks, spice storage |
| **Pantry & Dry Food Store** | Yes / No | P0 / P1 / P2 | Inside/beside kitchen | Floor-to-ceiling pullout storage, refrigeration space |
| **Utility & Washing Area** | Yes / No | P0 / P1 / P2 | Back of kitchen / side setback | Washing machine, dryer, mop sink, drying yard |
| **Domestic Staff Room & Bath** | Yes / No | P0 / P1 / P2 | External access / near utility | Attached bathroom, privacy from main family zone |

### Bedroom Suites & Private Quarters
| Space | Required? | Priority | Placement Preference | Special Features / Adjacencies |
|-------|-----------|----------|----------------------|--------------------------------|
| **Master Bedroom Suite** | Yes / No | P0 / P1 / P2 | Preferred floor & facing | Walk-in wardrobe, 5-fixture bath (tub, double vanity), balcony |
| **Parents' Bedroom (Elderly)**| Yes / No | P0 / P1 / P2 | Ground floor mandatory | Anti-skid flooring, grab bars, zero steps, close to living |
| **Children's Bedroom(s)** | Count: ___ | P0 / P1 / P2 | Upper floors | Study desk, ample wardrobe, twin beds or loft bed |
| **Guest Bedroom(s)** | Count: ___ | P0 / P1 / P2 | Ground or upper level | Attached bath, luggage space, neutral styling |
| **Walk-in Closets (Dresser)**| Yes / No | P0 / P1 / P2 | Attached to bedrooms | Dedicated vanity, jewelry safe, luggage storage |

### Leisure, Work & Specialized Spaces
| Space | Required? | Priority | Placement Preference | Special Features / Adjacencies |
|-------|-----------|----------|----------------------|--------------------------------|
| **Home Office / Study** | Yes / No | P0 / P1 / P2 | Quiet corner / near entry | Video call acoustic backdrop, bookshelf, filing |
| **Home Theatre / AV Room** | Yes / No | P0 / P1 / P2 | Basement / Top floor | Complete acoustic isolation, projector/screen, recliner seating |
| **Gym / Yoga Studio** | Yes / No | P0 / P1 / P2 | Terrace / garden view | Mirror wall, rubber flooring, ventilation, heavy load support |
| **Library / Reading Lounge** | Yes / No | P0 / P1 / P2 | Mezzanine / quiet nook | Natural light, window bench, custom shelving |
| **Terrace Lounge / Bar Area** | Yes / No | P0 / P1 / P2 | Top floor / terrace | Pergola, weather-proof bar counter, outdoor seating |
| **Passenger Elevator / Lift** | Yes / No | P0 / P1 / P2 | Central core | Capacity (4-8 pax), wheelchair accessible |

---

## 7. Outdoor, Façade & Landscape

*Integrate exterior spaces, vehicles, greenery, and outdoor lifestyle.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 7.1 | **How many vehicles need parking space?** | Numeric (Cars: Covered & Open; Two-wheelers; Bicycles) | Determines driveway radius, basement ramp, porch size, and car porch height. | `outdoor.parking_capacity` |
| 7.2 | **Do you require Electric Vehicle (EV) charging stations?** | Yes / No + Count | Electrical load sanctioning and conduit routing to parking bays. | `outdoor.ev_charging` |
| 7.3 | **What landscape features do you want?** | Multi-select: Manicured Lawn / Zen Garden / Kitchen Vegetable Garden / Native Tree Canopy / Vertical Green Wall / Zero-Maintenance Turf | Determines irrigation points, soil depth on slabs, and sunlight requirements. | `outdoor.landscape_type` |
| 7.4 | **Do you want water bodies or a swimming pool?** | Multi-select: Lap Pool / Plunge Pool / Kids Pool / Jacuzzi / Koi Pond / Water Fountain / None | Major structural, waterproofing, pump room, and safety fence implications. | `outdoor.water_features` |
| 7.5 | **Do you want outdoor cooking or entertainment areas?** | Yes / No (Outdoor Barbecue / Pizza Oven / Wet Bar / Fire Pit / Gazebo) | Requires outdoor plumbing, gas lines, and weatherproof electrical points. | `outdoor.entertainment_zone` |
| 7.6 | **What boundary wall and gate design do you prefer?** | High Privacy Solid Wall / Semi-permeable Louvers / Green Bio-fence / Automated Sliding Gate | Governs security posture, street aesthetics, and motor power requirements. | `outdoor.boundary_security` |

---

## 8. Technical, MEP, Sustainability & Automation

*Specify building performance, comfort engineering, and environmental footprint.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 8.1 | **What is your preferred air conditioning and cooling system?** | Single Choice: High-Efficiency Split ACs / VRV-VRF Central System / Ductable ACs / Passive Natural Ventilation Focus | Impacts false ceiling heights, outdoor unit locations, and MEP shafts. | `technical.hvac` |
| 8.2 | **Are you planning a Rooftop Solar PV system?** | Yes / No / Provision Only (Estimated KW capacity if known) | Roof structure loading, net-metering conduit, and inverter space allocation. | `technical.solar` |
| 8.3 | **What are your water management and conservation preferences?** | Multi-select: Rainwater Harvesting / Underground Sump / Overhead Tanks / Water Softener / RO Plant / Greywater Recycling for Garden | Sizing pump rooms, sump capacities, and dual plumbing lines. | `technical.water_management` |
| 8.4 | **What level of Smart Home Automation is desired?** | Single Choice: Basic (Smart lighting & fans) / Intermediate (Lighting, motorized curtains, AC control) / Advanced (Integrated scenes, multi-room audio, smart access) / Traditional (Standard switches) | Low-voltage conduit planning, automation rack location, and neutral wire provisions. | `technical.automation` |
| 8.5 | **What security and surveillance systems do you require?** | Multi-select: Perimeter CCTV / Video Door Phone (VDP) / Biometric Smart Door Locks / Intruder Sensors / Fire & Gas Leak Alarms | Cabling infrastructure, security monitoring station, and gate connectivity. | `technical.security` |
| 8.6 | **What backup power setup do you need?** | Single Choice: Full-load Diesel Generator / Inverter + Lithium Battery / Basic UPS for essential circuits | Acoustic enclosure space, fuel storage rules, and automatic transfer switch (AMF). | `technical.power_backup` |

---

## 9. Budget, Commercial Boundaries & Financial Structure

*Establish realistic financial boundaries to align architectural ambition with construction reality.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 9.1 | **What is your overall target investment / budget range?** | Currency / Amount Range (Min – Max) | Baseline for value engineering, structural framing choices, and finish selections. | `budget.total_range` |
| 9.2 | **Is the budget strictly fixed or flexible for high-value additions?** | Single Choice: Strictly Capped / Flexible by 10-15% / Flexible for exceptional design & quality | Guides the service provider on whether to propose premium alternates. | `budget.flexibility` |
| 9.3 | **What does this budget need to encompass?** | Multi-select: Core Shell & Structure / Civil Finishes / Complete Interiors & Fixed Furniture / Loose Furniture / MEP & HVAC / Landscaping / Statutory Fees / Professional Fees | Avoids catastrophic budget misalignment by defining scope inclusions clearly. | `budget.scope_inclusions` |
| 9.4 | **What is your primary commercial priority?** | Single Choice: Highest Architectural & Craft Quality / Maximizing Built Area & Space / Fast-Track Speed of Delivery / Strict Cost Minimization | Drives trade-off decisions throughout design and value engineering phases. | `budget.priority` |
| 9.5 | **Where are you willing to allocate premium expenditure?** | Text (e.g. "Façade design, master bathroom fittings, energy efficiency") | Allocates budget weighting to high-impact focal points. | `budget.spend_focus` |
| 9.6 | **Where do you want to optimize or save cost?** | Text (e.g. "Guest bedrooms, secondary utility areas, standard tile finishes in service zones") | Prevents over-specifying in low-visibility or utilitarian zones. | `budget.saving_focus` |
| 9.7 | **How is project funding structured?** | Single Choice: Self-funded / Bank Construction Loan Approved / Loan Applied / Phased Cashflow | Determines billing cycle terms and milestone payment schedules. | `budget.funding_status` |

---

## 10. Timeline, Milestones & Phasing

*Define scheduling constraints, non-negotiable target dates, and construction staging.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 10.1 | **What is your target design sign-off date?** | Date | Milestone deadline for concept, drawings, and BOQ freeze. | `timeline.design_signoff` |
| 10.2 | **When do you expect site construction to break ground?** | Date (e.g. auspicious date / Bhoomi Puja / specific month) | Coordinates mobilization, site clearing, and labor sourcing. | `timeline.groundbreak_date` |
| 10.3 | **What is your target move-in / handover date?** | Date | Benchmark for backward scheduling and procurement lead times. | `timeline.target_handover` |
| 10.4 | **Are there hard, non-negotiable deadlines?** | Text (e.g. "Current lease expires on Oct 1st", "Wedding in family by December") | Flags risk for penalty clauses or fast-track prefabricated construction methods. | `timeline.critical_deadlines` |
| 10.5 | **Can the project be executed in phases?** | Yes / No + Details (e.g. Phase 1: Ground floor habitable; Phase 2: Upper floors & pool) | Structures phased occupation permits and progressive investment. | `timeline.phasing` |

---

## 11. Regulatory, Approvals & Statutory Documentation

*Assess legal clearance, building bylaws, and municipality requirements before drafting.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 11.1 | **Under which local municipal authority does the site fall?** | Authority Name (e.g. BBMP / BDA / BMRDA / Municipal Corporation / Gram Panchayat) | Identifies applicable bylaws, set-back charts, and height limitations. | `regulatory.jurisdiction` |
| 11.2 | **Are there any Community, HOA, or Gated Villa Society bylaws?** | Yes / No + Upload Guidelines (e.g. mandatory roof tiles, uniform exterior colors, working hour restrictions) | Ensures design compliance with internal community aesthetic codes. | `regulatory.hoa_guidelines` |
| 11.3 | **Are any building sanctions, permits, or NOCs already in place?** | Multi-select: Land Conversion (CLU) / Khatas / Sanctioned Plan / Fire NOC / Environmental Clearance / None | Determines statutory approval timeline before on-site work can commence. | `regulatory.existing_permits` |
| 11.4 | **Are there known property boundary disputes or legal encumbrances?** | Yes / No + Clarification | Risk management to avoid sudden work-stoppage notices on site. | `regulatory.legal_status` |

---

## 12. Review Workflow & Decision-Making Governance

*Establish how designs will be reviewed, revised, and approved to guarantee smooth progress.*

| # | Question | Field Type | Why We Ask This / Probing Nuance | Odin Requirement Tag |
|---|----------|------------|-----------------------------------|-----------------------|
| 12.1 | **How do you prefer to review architectural concepts and drawings?** | Multi-select: 3D Digital Walkthroughs / In-Person Physical Review / Video Conference / Material Sample Moodboards | Guides studio presentation format and deliverable packaging. | `governance.presentation_format` |
| 12.2 | **What is your expected turnaround time for feedback and approvals?** | Single Choice: Within 48 hours / 3–5 working days / Over 1 week | Critical for project velocity and schedule adherence. | `governance.approval_turnaround` |
| 12.3 | **How many formal design iteration rounds are anticipated?** | Standard: 2–3 Concept Revisions before BOQ Lock | Sets clear boundaries to prevent perpetual preliminary design loops. | `governance.revision_rounds` |
| 12.4 | **Do you agree to formal digital sign-offs via the Kallisto Portal?** | Yes / Acknowledged | Confirms understanding that phase progression and BOQs require explicit digital approvals. | `governance.portal_signoff` |

---

## 💡 Summary Checklist for the Lead Service Provider

Before closing the onboarding session, ensure:
- [ ] Primary decision maker and financial signatory are confirmed.
- [ ] Site location, survey coordinates, and road access are documented.
- [ ] Room program inventory is verified with P0 (essential) vs. P2 (optional) tags.
- [ ] Realistic budget envelope and scope inclusions are agreed upon.
- [ ] Any strict Vastu / Feng Shui or accessibility constraints are flagged.
- [ ] Next step: Odin AI Requirement Baseline generation & Preliminary Feasibility Review scheduled.
