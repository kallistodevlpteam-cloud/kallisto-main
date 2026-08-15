-- ODIN AI Client Requirement Template -> Turso (libSQL) schema
-- Source: ODIN_AI_Client_Requirement_Template (1).md (all 15 sections)
-- Convention: snake_case columns, TEXT for free-form/Yes-No answers,
-- INTEGER for counts/booleans, one-to-many rows in sub-tables.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS project_DOC;
DROP TABLE IF EXISTS inspiration_img;
DROP TABLE IF EXISTS enquiry_details;
DROP TABLE IF EXISTS project_media;
DROP TABLE IF EXISTS project_spaces;
DROP TABLE IF EXISTS project_inspirations;
DROP TABLE IF EXISTS project_clients;
DROP TABLE IF EXISTS project_dream;
DROP TABLE IF EXISTS project_design_style;
DROP TABLE IF EXISTS project_lifestyle;
DROP TABLE IF EXISTS project_budget;
DROP TABLE IF EXISTS project_site;
DROP TABLE IF EXISTS project_timeline;
DROP TABLE IF EXISTS project_outdoor;
DROP TABLE IF EXISTS project_technical;
DROP TABLE IF EXISTS project_regulatory;
DROP TABLE IF EXISTS project_approval_process;
DROP TABLE IF EXISTS project_communication;
DROP TABLE IF EXISTS projects;

-- Section 1: Project Information
CREATE TABLE projects (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name            TEXT NOT NULL,
  project_type            TEXT CHECK (project_type IN ('Residential','Commercial','Office','Industrial','Mixed Use')),
  building_type           TEXT,
  project_character       TEXT,
  new_construction_or_renovation TEXT,
  purpose_of_project      TEXT,
  brief_description       TEXT,
  cover_image_url         TEXT,
  sq_area                 INTEGER,
  client_expected_timeline TEXT,
  created_at              INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at              INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Gallery / inspiration images per project (one row per image).
-- The list is strictly backend-sourced; the frontend never hardcodes it.
CREATE TABLE inspiration_img (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url  TEXT NOT NULL,
  alt_text   TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Project scopes: parent list (one row per scope) with a nested child
-- sub-list (project_scope_item). Both are strictly backend-sourced.
CREATE TABLE IF NOT EXISTS project_scope (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  enq_id     TEXT REFERENCES enquiry_details(enq_id) ON DELETE CASCADE,
  scope_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE TABLE IF NOT EXISTS project_scope_item (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  scope_id   INTEGER NOT NULL REFERENCES project_scope(id) ON DELETE CASCADE,
  item_name  TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Uploaded documents per project (one row per document, with an image
-- preview URL). The list is strictly backend-sourced; the frontend never
-- hardcodes project documents.
CREATE TABLE project_DOC (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_name   TEXT,
  doc_img_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Enquiry identity: one stable UUID per enquiry, linked to its project.
-- view = 0 while unviewed (green indicator in the list); 1 once opened.
CREATE TABLE enquiry_details (
  enq_id     TEXT PRIMARY KEY,
  project_id INTEGER NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  view       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

-- Section 2: About the Client (1:1)
CREATE TABLE project_clients (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  about_client            TEXT,
  building_users          TEXT,
  family_or_team_size     INTEGER,
  elderly_members         TEXT CHECK (elderly_members IN ('Yes','No')),
  children                TEXT CHECK (children IN ('Yes','No')),
  pets                    TEXT,
  work_from_home          TEXT CHECK (work_from_home IN ('Yes','No')),
  accessibility_requirements TEXT
);

-- Section 3: Dream & Vision (1:1)
CREATE TABLE project_dream (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  dream_building          TEXT,
  building_feel           TEXT,
  three_words             TEXT,
  inspired_by             TEXT,
  visitors_notice_first   TEXT,
  money_no_limitation     TEXT
);

-- Section 4: Design Style (1:1)
CREATE TABLE project_design_style (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  architectural_style     TEXT,
  interior_style          TEXT,
  exterior_style          TEXT,
  favourite_colours       TEXT,
  colours_to_avoid        TEXT,
  material_preferences    TEXT,
  materials_to_avoid      TEXT
);

-- Section 5: Design Inspiration (1:N)
CREATE TABLE project_inspirations (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id              INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type                    TEXT CHECK (type IN ('Pinterest','Instagram','Building','Hotel','Restaurant','Architect','Image')),
  reference_url           TEXT,
  note                    TEXT
);

-- Section 6: Lifestyle (1:1)
CREATE TABLE project_lifestyle (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  daily_routine           TEXT,
  entertain_guests        TEXT CHECK (entertain_guests IN ('Yes','No')),
  host_parties            TEXT CHECK (host_parties IN ('Yes','No')),
  relaxation_place        TEXT,
  morning_coffee_location TEXT,
  outdoor_activities      TEXT,
  hobbies                 TEXT,
  privacy_importance      TEXT
);

-- Section 7: Budget (1:1)
CREATE TABLE project_budget (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  estimated_overall_budget TEXT,
  budget_flexibility      TEXT CHECK (budget_flexibility IN ('Fixed','Flexible')),
  budget_priority         TEXT,
  willing_to_spend_more   TEXT,
  areas_to_save            TEXT,
  interior_included       TEXT CHECK (interior_included IN ('Yes','No')),
  financing_arranged      TEXT CHECK (financing_arranged IN ('Yes','No'))
);

-- Section 8: Site & Location (1:1)
CREATE TABLE project_site (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  plot_address            TEXT,
  plot_size               TEXT,
  plot_orientation        TEXT,
  existing_structures     TEXT,
  topography              TEXT,
  soil_type               TEXT,
  climate_considerations  TEXT,
  neighbouring_context    TEXT,
  preferred_views         TEXT,
  views_to_avoid          TEXT,
  preserve_features       TEXT,
  utility_access          TEXT,
  place                   TEXT,
  -- Ordered site image list as JSON-encoded TEXT (parsed by the backend
  -- into an array). Strictly backend-sourced; the frontend never
  -- hardcodes site images.
  site_img_url            TEXT
);

-- Section 9: Timeline (1:1)
CREATE TABLE project_timeline (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  desired_start_date       TEXT,
  desired_completion_date TEXT,
  fixed_deadline_notes     TEXT,
  phased              TEXT CHECK (phased IN ('Yes','No')),
  phases_description       TEXT,
  urgency_level            TEXT CHECK (urgency_level IN ('Low','Medium','High'))
);

-- Section 10: Space Requirements (1:N)
CREATE TABLE project_spaces (
  project_id              INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  space_name              TEXT NOT NULL,
  required                INTEGER NOT NULL DEFAULT 0,
  priority                TEXT CHECK (priority IN ('Essential','Important','Optional')),
  approx_area_size        TEXT,
  quantity                INTEGER,
  adjacency_notes         TEXT
);

-- Section 11: Outdoor & Landscape (1:1)
CREATE TABLE project_outdoor (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  garden                  TEXT CHECK (garden IN ('Yes','No')),
  swimming_pool         TEXT CHECK (swimming_pool IN ('Yes','No')),
  outdoor_deck_patio       TEXT CHECK (outdoor_deck_patio IN ('Yes','No')),
  bbq_area                 TEXT CHECK (bbq_area IN ('Yes','No')),
  parking                  TEXT,
  driveway_gate_notes       TEXT,
  landscape_boundary_fencing  TEXT,
  outdoor_lighting     TEXT,
  play_area_children  TEXT CHECK (play_area_children IN ('Yes','No')),
  pet_friendly_outdoor    TEXT
);

-- Section 12: Sustainability & Technical Preferences (1:1)
CREATE TABLE project_technical (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  energy_efficient_design TEXT CHECK (energy_efficient_design IN ('Yes','No')),
  solar_panels          TEXT CHECK (solar_panels IN ('Yes','No')),
  rainwater_harvesting TEXT CHECK (rainwater_harvesting IN ('Yes','No')),
  smart_home_automation TEXT CHECK (smart_home_automation IN ('Yes','No')),
  hvac_preference         TEXT,
  backup_power            TEXT CHECK (backup_power IN ('Yes','No')),
  water_storage_borewell  TEXT,
  security_system_requirements TEXT,
  preferred_material_techs TEXT
);

-- Section 13: Regulatory & Legal (1:1)
CREATE TABLE project_regulatory (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  zoning_restrictions      TEXT,
  height_restrictions     TEXT,
  home_owner_association_rules TEXT,
  permits_obtained       TEXT,
  land_disputes_encumbrances TEXT,
  setback_requirements    TEXT
);

-- Section 14: Decision-Making & Approval Process (1:1)
CREATE TABLE project_approval_process (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  primary_decision_maker TEXT,
  other_approval_stakeholders TEXT,
  expected_revision_rounds INTEGER,
  design_review_method    TEXT,
  approval_turnaround_time TEXT
);

-- Section 15: Communication & Logistics (1:1)
CREATE TABLE project_communication (
  project_id              INTEGER PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  preferred_contact      TEXT,
  communication_channel  TEXT,
  meeting_frequency      TEXT,
  best_time_to_reach     TEXT,
  special_instructions      TEXT
);

-- Uploaded media / references (images, documents) for a project
CREATE TABLE project_media (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_type      TEXT,
  location_url    TEXT,
  description     TEXT
);

CREATE INDEX idx_inspiration_img_project_id     ON inspiration_img(project_id);
CREATE INDEX idx_project_doc_project_id         ON project_DOC(project_id);
CREATE INDEX idx_project_spaces_project_id      ON project_spaces(project_id);
CREATE INDEX idx_project_inspirations_project_id ON project_inspirations(project_id);
CREATE INDEX idx_project_media_project_id       ON project_media(project_id);
CREATE INDEX idx_projects_project_name          ON projects(project_name);