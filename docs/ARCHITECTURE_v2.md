# Kallisto Service Provider Web App — Architecture v2.0

**Status:** Production Architecture Baseline  
**Date:** 15 August 2026  
**Scope:** Complete end-to-end schema, API, and state-machine redesign for the Client → Enquiry → Proposal → Project lifecycle.

---

## Contents

1. [Immutable Enquiry Snapshot](#1-immutable-enquiry-snapshot)
2. [Clarification Loop and Canonical Requirement Updates](#2-clarification-loop)
3. [Proposal Version History](#3-proposal-version-history)
4. [Project Conversion and Workspace Bootstrap](#4-project-conversion)
5. [Migration Plan from Current Schema](#5-migration-plan)
6. [Failure and Rollback Handling](#6-failure-and-rollback)
7. [Appendix A — Complete DDL](#appendix-a)

---

## 1. Immutable Enquiry Snapshot

### 1.1 Principle
Every submitted enquiry must contain a frozen snapshot of the exact requirement information shared with that provider. The snapshot becomes immutable after submission and is never overwritten by later client edits.

### 1.2 Schema

| Table | Purpose | Mutability |
|-------|---------|------------|
| `enquiries` | Lifecycle header for the provider-targeted enquiry | Mutable (status, stage) |
| `enquiry_snapshots` | Frozen requirement payload disclosed to the provider | **Immutable** after `submitted_at` |
| `enquiry_snapshot_files` | File references included in the snapshot | **Immutable** |
| `enquiry_snapshot_scope` | Scope items frozen at submission time | **Immutable** |
| `enquiry_snapshot_requirements` | Requirement items frozen at submission time | **Immutable** |
| `enquiry_snapshot_priorities` | Client priorities frozen at submission time | **Immutable** |
| `enquiry_matches` | Match rationale, scoring, and consent | Mutable (until submitted) |

### 1.3 DDL — `enquiries`
```sql
CREATE TABLE enquiries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES projects(id),
    provider_id     TEXT NOT NULL REFERENCES service_provider_details(SP_id),
    -- Snapshot link (set once at submission, never changed)
    snapshot_id     INTEGER UNIQUE REFERENCES enquiry_snapshots(id),
    -- Lifecycle state (separate from project_character)
    status          TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','opened','under_review','needs_clarification','accepted','rejected','expired','archived')),
    stage           TEXT NOT NULL DEFAULT 'lead' CHECK(stage IN ('lead','contacted','meeting_scheduled','proposal_submitted','won','lost')),
    -- Actor and consent
    submitted_by    TEXT,                -- client_id or system actor
    submitted_at    INTEGER,            -- epoch seconds
    opened_at       INTEGER,
    accepted_at     INTEGER,
    rejected_at     INTEGER,
    rejected_reason TEXT,
    -- Matching rationale captured at submission
    match_rationale TEXT,                -- JSON: {fit_score, reasons, risks, limitations}
    -- Idempotency
    idempotency_key TEXT UNIQUE,         -- derived from requirement_version + provider_id + timestamp
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    -- Integrity
    integrity_hash  TEXT                 -- SHA-256 of canonical JSON payload
);
CREATE INDEX idx_enquiries_project ON enquiries(project_id);
CREATE INDEX idx_enquiries_provider ON enquiries(provider_id);
CREATE INDEX idx_enquiries_status   ON enquiries(status);
```

### 1.4 DDL — `enquiry_snapshots` (Immutable Core)
```sql
CREATE TABLE enquiry_snapshots (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_id      INTEGER NOT NULL,          -- links to canonical Requirement Object version
    requirement_version INTEGER NOT NULL,          -- version number at time of freeze
    -- Frozen payload (structured JSON for fast reads; normalised tables for queries)
    payload_json        TEXT NOT NULL,              -- canonical frozen requirement JSON
    -- Disclosed identity
    client_name         TEXT,
    client_email        TEXT,
    client_phone        TEXT,
    -- Frozen project facts
    project_name        TEXT,
    project_type        TEXT,
    building_type         TEXT,
    new_construction_or_renovation TEXT,
    purpose_of_project   TEXT,
    brief_description    TEXT,
    over_view            TEXT,
    sq_area              REAL,
    client_expected_timeline TEXT,
    place                TEXT,
    estimated_overall_budget REAL,
    -- Frozen site
    plot_address         TEXT,
    plot_size            TEXT,
    plot_orientation     TEXT,
    existing_structures  TEXT,
    topography           TEXT,
    soil_type            TEXT,
    climate_considerations TEXT,
    neighbouring_context TEXT,
    preferred_views      TEXT,
    views_to_avoid       TEXT,
    preserve_features    TEXT,
    utility_access       TEXT,
    site_img_urls        TEXT,                      -- JSON array of frozen image URLs
    -- Submission metadata
    submitted_by_actor   TEXT NOT NULL,
    submitted_at       INTEGER NOT NULL,
    -- Integrity
    integrity_hash       TEXT NOT NULL,             -- SHA-256 of payload_json + requirement_version + submitted_at
    created_at           INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 1.5 DDL — `enquiry_snapshot_requirements` (Immutable Detail)
```sql
CREATE TABLE enquiry_snapshot_requirements (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id     INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
    requirement_id  TEXT NOT NULL,                  -- original requirement domain UUID
    requirement_name TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_esr_snapshot ON enquiry_snapshot_requirements(snapshot_id);
```

### 1.6 DDL — `enquiry_snapshot_requirement_items`
```sql
CREATE TABLE enquiry_snapshot_requirement_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_req_id INTEGER NOT NULL REFERENCES enquiry_snapshot_requirements(id),
    item_value      TEXT NOT NULL,
    item_details    TEXT,                         -- JSON array of detail strings
    status          INTEGER,                      -- boolean or null
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 1.7 DDL — `enquiry_snapshot_scope` and `enquiry_snapshot_scope_items`
```sql
CREATE TABLE enquiry_snapshot_scope (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id     INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
    scope_name      TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE TABLE enquiry_snapshot_scope_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_scope_id INTEGER NOT NULL REFERENCES enquiry_snapshot_scope(id),
    item_name       TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 1.8 DDL — `enquiry_snapshot_files`
```sql
CREATE TABLE enquiry_snapshot_files (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id     INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
    file_type       TEXT NOT NULL CHECK(file_type IN ('image','document','drawing','reference')),
    file_url        TEXT NOT NULL,
    file_name       TEXT,
    description     TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 1.9 State Transition Rules
```
draft → submitted   : client confirms recipient and snapshot
submitted → opened  : provider first opens the enquiry
opened → under_review : provider begins evaluation
under_review → needs_clarification : provider requests clarification
needs_clarification → under_review : client answers, provider resumes review
under_review → accepted : provider explicitly confirms acceptance
under_review → rejected : provider explicitly rejects with reason
accepted → proposal_submitted : provider sends proposal
proposal_submitted → won : client accepts proposal version
proposal_submitted → lost : client rejects or proposal expires
won → converted : provider triggers Convert to Project
```

### 1.10 API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/enquiries` | client + system | Create enquiry with snapshot from current requirement version |
| GET | `/api/enquiries/{id}` | provider | Read enquiry header + snapshot (never mutable fields) |
| GET | `/api/enquiries/{id}/snapshot` | provider | Read frozen snapshot payload |
| POST | `/api/enquiries/{id}/submit` | client | Submit draft → submitted (sets snapshot_id immutably) |
| POST | `/api/enquiries/{id}/open` | provider | Mark as opened |
| POST | `/api/enquiries/{id}/accept` | provider | Accept enquiry → proposal preparation |
| POST | `/api/enquiries/{id}/reject` | provider | Reject with structured reason |

### 1.11 Agent Permissions
| Agent | Read | Write |
|-------|------|-------|
| Enquiry Analyst | `enquiry_snapshots` (read-only) | None (advisory only) |
| Matching Agent | `requirements` (latest version) | `enquiry_matches` (before submission) |
| Odin Orchestrator | All | Routes only, no direct mutation |

### 1.12 Human Approval Gates
- **Submit enquiry**: Client confirms provider recipient and requirement version.
- **Accept / Reject**: Provider with authority over the linked SP_id.
- **Snapshot creation**: Automatic on submit; no human override to alter frozen data.

### 1.13 Idempotency
- `idempotency_key` = `SHA256(requirement_version + "|" + provider_id + "|" + submitted_at)`.
- Duplicate `POST /api/enquiries` with same `idempotency_key` returns existing enquiry.

### 1.14 Audit Events
- `enquiry.submitted` — actor, timestamp, requirement_version, snapshot_id
- `enquiry.opened` — provider_id, timestamp
- `enquiry.accepted` — provider_id, timestamp, accepted_snapshot_id
- `enquiry.rejected` — provider_id, timestamp, reason

---

## 2. Clarification Loop and Canonical Requirement Updates

### 2.1 Principle
Clarifications must be stored as structured, enquiry-linked records—not only as UI messages. The original Enquiry Snapshot remains unchanged; accepted answers create new Requirement Object versions.

### 2.2 Schema

| Table | Purpose | Mutability |
|-------|---------|------------|
| `clarification_threads` | One thread per enquiry | Mutable (status) |
| `clarification_questions` | Structured questions from provider | **Immutable** after sent |
| `clarification_answers` | Client answers | **Immutable** after submitted |
| `clarification_field_links` | Links questions to requirement fields | Immutable |
| `clarification_change_proposals` | Odin's proposed field updates | Mutable (until merged/rejected) |
| `requirement_versions` | Version history of Requirement Object | Append-only |

### 2.3 DDL — `clarification_threads`
```sql
CREATE TABLE clarification_threads (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    enquiry_id      INTEGER NOT NULL REFERENCES enquiries(id),
    status          TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','merged','closed','expired')),
    opened_by       TEXT NOT NULL,                 -- provider_id
    opened_at       INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    resolved_at     INTEGER,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_clar_threads_enquiry ON clarification_threads(enquiry_id);
```

### 2.4 DDL — `clarification_questions`
```sql
CREATE TABLE clarification_questions (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id           INTEGER NOT NULL REFERENCES clarification_threads(id),
    question_text       TEXT NOT NULL,
    question_type       TEXT NOT NULL DEFAULT 'text' CHECK(question_type IN ('text','choice','file','measurement','budget','timeline')),
    -- Link to requirement fields this question targets
    target_fields       TEXT,                     -- JSON array of {requirement_id, item_index, field_name}
    -- Actor
    asked_by            TEXT NOT NULL,             -- provider_id
    asked_at            INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    -- Odin assistance flag
    assisted_by_agent   TEXT,                     -- agent name if AI-generated
    -- Status
    answer_id           INTEGER,                  -- FK to clarification_answers when answered
    status              TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','answered','superseded')),
    created_at          INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_clq_thread ON clarification_questions(thread_id);
CREATE INDEX idx_clq_status ON clarification_questions(status);
```

### 2.5 DDL — `clarification_answers`
```sql
CREATE TABLE clarification_answers (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id     INTEGER NOT NULL UNIQUE REFERENCES clarification_questions(id),
    answer_text     TEXT NOT NULL,
    answer_type     TEXT NOT NULL DEFAULT 'text' CHECK(answer_type IN ('text','choice','file','confirmation')),
    -- Evidence
    attachments     TEXT,                         -- JSON array of {file_url, file_name, type}
    -- Actor
    answered_by     TEXT NOT NULL,               -- client_id
    answered_at     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    -- Merge tracking
    merged_into_requirement_version INTEGER,    -- version number this answer contributed to
    merge_status    TEXT DEFAULT 'pending' CHECK(merge_status IN ('pending','approved','rejected','auto_merged')),
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_cla_question ON clarification_answers(question_id);
```

### 2.6 DDL — `requirement_versions`
```sql
CREATE TABLE requirement_versions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES projects(id),
    version_number  INTEGER NOT NULL,            -- sequential within project
    -- Source of this version
    triggered_by    TEXT NOT NULL CHECK(triggered_by IN ('client_edit','clarification_merge','system_correction','manual_override')),
    triggered_by_clarification_answer_id INTEGER REFERENCES clarification_answers(id),
    -- Frozen payload (same structure as enquiry_snapshot)
    payload_json    TEXT NOT NULL,
    -- Readiness at this version
    readiness_score REAL,
    readiness_status TEXT CHECK(readiness_status IN ('draft','reviewable','provider_ready','blocked')),
    blocker_summary TEXT,                       -- JSON array of blocking issues
    -- Actor
    created_by      TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    -- Integrity
    integrity_hash  TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_req_ver_project ON requirement_versions(project_id, version_number);
CREATE INDEX idx_req_ver_project_latest ON requirement_versions(project_id, version_number DESC);
```

### 2.7 State Transition Rules
```
clarification_thread: open → merged → closed
question: pending → answered → superseded (if new version replaces it)
answer: pending → approved → merged_into_requirement_version
answer: pending → rejected → remains in thread, no merge
merge_status: pending → auto_merged (for non-consequential fields) OR pending → approved (for consequential fields requiring client confirmation)
```

### 2.8 API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/enquiries/{id}/clarifications` | provider | Open a clarification thread and post questions |
| GET | `/api/enquiries/{id}/clarifications` | provider, client | Read thread with questions and answers |
| POST | `/api/enquiries/{id}/clarifications/{question_id}/answer` | client | Submit answer |
| POST | `/api/enquiries/{id}/clarifications/merge` | client | Confirm Odin's proposed merges → creates new requirement version |
| GET | `/api/requirements/{project_id}/versions` | provider, client | List version history |
| GET | `/api/requirements/{project_id}/versions/{version_number}` | provider, client | Read specific version |

### 2.9 Agent Permissions
| Agent | Read | Write |
|-------|------|-------|
| Clarification Agent | Thread history, requirement gaps | `clarification_questions` (draft), change proposals |
| Requirement Agent | `requirement_versions` (latest) | `requirement_versions` (new version) |
| Odin Orchestrator | All | Routes merge proposals to client approval gate |

### 2.10 Human Approval Gates
- **Answer submission**: Client writes answer; Odin may draft but client submits.
- **Field merge for consequential changes**: Client must explicitly approve before Requirement Object is updated.
- **Non-consequential merge** (spelling, formatting): May be auto-merged with audit trail.

### 2.11 Idempotency
- Duplicate answer submission with same `question_id` and identical `integrity_hash` returns existing answer.
- Clarification merge uses `requirement_version` idempotency key to prevent duplicate versions.

---

## 3. Proposal Version History

### 3.1 Principle
The current one-row-per-proposal model must be replaced with a versioned proposal architecture. A sent version is immutable; any revision creates a new version under the same proposal thread.

### 3.2 Schema

| Table | Purpose | Mutability |
|-------|---------|------------|
| `proposal_threads` | One negotiation lifecycle per enquiry | Mutable (overall status) |
| `proposal_drafts` | Mutable working state in Hive Studio | Mutable until sent |
| `proposal_versions` | Immutable sent versions | **Immutable** |
| `proposal_version_scope` | Scope coverage per version | **Immutable** |
| `proposal_version_milestones` | Payment milestones per version | **Immutable** |
| `proposal_decisions` | Client decisions per version | **Immutable** |
| `proposal_change_sets` | Diff between versions | **Immutable** |

### 3.3 DDL — `proposal_threads`
```sql
CREATE TABLE proposal_threads (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    enquiry_id      INTEGER NOT NULL UNIQUE REFERENCES enquiries(id),
    provider_id     TEXT NOT NULL,
    -- Status of the overall negotiation lifecycle
    status          TEXT NOT NULL DEFAULT 'drafting' CHECK(status IN ('drafting','sent','revision_requested','accepted','rejected','expired')),
    -- Source references
    source_requirement_version INTEGER NOT NULL,
    source_snapshot_id      INTEGER NOT NULL REFERENCES enquiry_snapshots(id),
    -- Current working draft reference
    current_draft_id        INTEGER REFERENCES proposal_drafts(id),
    -- Final accepted version
    accepted_version_id     INTEGER REFERENCES proposal_versions(id),
    -- Actor and timestamps
    created_by            TEXT NOT NULL,
    created_at            INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at            INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_pt_enquiry ON proposal_threads(enquiry_id);
CREATE INDEX idx_pt_provider ON proposal_threads(provider_id);
CREATE INDEX idx_pt_status ON proposal_threads(status);
```

### 3.4 DDL — `proposal_drafts`
```sql
CREATE TABLE proposal_drafts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id       INTEGER NOT NULL REFERENCES proposal_threads(id),
    -- Mutable commercial data
    total_amount    REAL,
    currency        TEXT DEFAULT 'INR',
    rate_notes      TEXT,
    timeline_notes TEXT,
    scope_summary   TEXT,
    -- Provider ownership
    provider_id     TEXT NOT NULL,
    -- Status
    status          TEXT NOT NULL DEFAULT 'drafting' CHECK(status IN ('drafting','validating','ready')),
    -- Validation results
    validation_errors TEXT,                     -- JSON array
    validation_warnings TEXT,                   -- JSON array
    -- Timestamps
    last_edited_by  TEXT,
    last_edited_at  INTEGER,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 3.5 DDL — `proposal_versions` (Immutable)
```sql
CREATE TABLE proposal_versions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id       INTEGER NOT NULL REFERENCES proposal_threads(id),
    version_number  INTEGER NOT NULL,           -- sequential within thread
    -- Frozen commercial data
    total_amount    REAL NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'INR',
    rate_notes      TEXT,
    timeline_notes  TEXT,
    scope_summary   TEXT,
    -- Coverage mapping
    scope_covered_json TEXT,                    -- JSON: requirement_id → {covered, excluded, unresolved}
    -- Validity
    validity_period_days INTEGER DEFAULT 30,
    valid_until     INTEGER,                    -- epoch seconds
    -- Authority
    prepared_by     TEXT NOT NULL,              -- provider_id
    approved_by     TEXT,                       -- provider_id who sent
    sent_at         INTEGER NOT NULL,
    -- Source
    source_requirement_version INTEGER NOT NULL,
    source_snapshot_id INTEGER NOT NULL,
    -- Rendered document reference
    rendered_document_url TEXT,
    -- Integrity
    integrity_hash  TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE UNIQUE INDEX idx_pv_thread_version ON proposal_versions(thread_id, version_number);
```

### 3.6 DDL — `proposal_version_scope`
```sql
CREATE TABLE proposal_version_scope (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id      INTEGER NOT NULL REFERENCES proposal_versions(id),
    requirement_id  TEXT NOT NULL,
    requirement_name TEXT,
    coverage_status TEXT NOT NULL CHECK(coverage_status IN ('fully_covered','partially_covered','excluded','unresolved')),
    provider_notes  TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 3.7 DDL — `proposal_version_milestones`
```sql
CREATE TABLE proposal_version_milestones (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id      INTEGER NOT NULL REFERENCES proposal_versions(id),
    milestone_name  TEXT NOT NULL,
    trigger_description TEXT NOT NULL,
    amount          REAL,
    percentage      REAL,
    due_condition   TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 3.8 DDL — `proposal_decisions` (Immutable)
```sql
CREATE TABLE proposal_decisions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id      INTEGER NOT NULL REFERENCES proposal_versions(id),
    decision        TEXT NOT NULL CHECK(decision IN ('accept','reject','revision_request','expired')),
    -- Actor
    decided_by      TEXT NOT NULL,
    decided_by_role TEXT NOT NULL CHECK(decided_by_role IN ('client','client_decision_maker','system')),
    decided_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    -- Details
    rejection_reason  TEXT,
    revision_notes  TEXT,
    negotiation_notes TEXT,
    -- Confirmation
    confirmation_summary TEXT,                  -- client-facing summary of accepted terms
    -- Integrity
    integrity_hash  TEXT NOT NULL,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_pd_version ON proposal_decisions(version_id);
CREATE INDEX idx_pd_decision ON proposal_decisions(decision);
```

### 3.9 DDL — `proposal_change_sets`
```sql
CREATE TABLE proposal_change_sets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id       INTEGER NOT NULL REFERENCES proposal_threads(id),
    from_version_id INTEGER NOT NULL REFERENCES proposal_versions(id),
    to_version_id   INTEGER NOT NULL REFERENCES proposal_versions(id),
    change_summary  TEXT NOT NULL,              -- human-readable summary
    diff_json       TEXT NOT NULL,              -- structured diff
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 3.10 State Transition Rules
```
proposal_thread: drafting → sent → revision_requested → sent (new version) → accepted
proposal_thread: drafting → sent → rejected (terminal)
proposal_thread: drafting → sent → expired (terminal, after valid_until)
proposal_draft: drafting → validating → ready → (on send, becomes proposal_version, draft is archived)
proposal_version: sent → revision_requested (client) → new draft created
proposal_version: sent → accepted (client) → triggers Convert to Project availability
proposal_version: sent → rejected (client) → terminal
```

### 3.11 API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/enquiries/{id}/proposals` | provider | Create proposal thread + draft |
| GET | `/api/enquiries/{id}/proposals` | provider, client | Read thread with versions |
| POST | `/api/enquiries/{id}/proposals/draft` | provider | Update mutable draft |
| POST | `/api/enquiries/{id}/proposals/validate` | provider | Run validation agent |
| POST | `/api/enquiries/{id}/proposals/send` | provider | Freeze draft → immutable version |
| POST | `/api/enquiries/{id}/proposals/{version_id}/decide` | client | Accept / reject / request revision |
| GET | `/api/enquiries/{id}/proposals/{version_id}/changes` | provider, client | Diff from previous version |

### 3.12 Agent Permissions
| Agent | Read | Write |
|-------|------|-------|
| Proposal Agent | Requirement version, enquiry snapshot | `proposal_drafts` (sections) |
| Validation Agent | `proposal_drafts`, requirement version | Validation results, blocks send |
| Bootstrap Agent | Accepted proposal version | None (suggests only) |

### 3.13 Human Approval Gates
- **Draft preparation**: Provider responsible for fees, taxes, milestones.
- **Send validation**: Validation Agent blocks send on critical errors.
- **Send approval**: Authorised provider user must explicitly send.
- **Client decision**: Client decision-maker must explicitly accept; no auto-accept.

### 3.14 Idempotency
- `POST /api/enquiries/{id}/proposals/send` uses `draft_id` + `sent_at` as idempotency key.
- Duplicate send with same `draft_id` returns existing version.
- `POST /api/enquiries/{id}/proposals/{version_id}/decide` is idempotent for same `version_id` and `decided_by`.

---

## 4. Project Conversion and Workspace Bootstrap

### 4.1 Principle
Convert to Project must perform a real domain conversion—not merely change the enquiry status. It creates a complete operational workspace with bidirectional lineage links.

### 4.2 Schema

| Table | Purpose | Mutability |
|-------|---------|------------|
| `project_contexts` | Operational project header | Mutable (status) |
| `project_scope_baselines` | Accepted scope from proposal version | **Immutable** |
| `project_deliverables` | Expected outputs and acceptance criteria | Mutable (status, revision) |
| `project_milestones` | Payment triggers and dates | Mutable (actual dates, status) |
| `project_teams` | Team members and roles | Mutable (add/remove/activate) |
| `project_communication_channels` | Message threads | Append-only |
| `project_drive_folders` | Document folder structure | Mutable |
| `project_tasks` | Initial task structure | Mutable |
| `project_risk_register` | Identified risks | Mutable |
| `project_decision_log` | All decisions | **Immutable** |
| `project_bootstrap_status` | Bootstrap completion tracking | Mutable |

### 4.3 DDL — `project_contexts`
```sql
CREATE TABLE project_contexts (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Lineage (immutable after creation)
    enquiry_id          INTEGER NOT NULL UNIQUE REFERENCES enquiries(id),
    proposal_thread_id  INTEGER NOT NULL REFERENCES proposal_threads(id),
    accepted_version_id INTEGER NOT NULL REFERENCES proposal_versions(id),
    -- Project identity
    project_code        TEXT NOT NULL UNIQUE,   -- e.g., PRJ-2026-0042
    project_name        TEXT NOT NULL,
    -- Client-provider relationship
    client_id           TEXT NOT NULL,
    provider_id         TEXT NOT NULL,
    -- Status
    status              TEXT NOT NULL DEFAULT 'bootstrapping' CHECK(status IN ('bootstrapping','active','on_hold','completed','cancelled')),
    -- Commercial baseline (copied from accepted proposal version)
    total_contract_value REAL NOT NULL,
    currency            TEXT NOT NULL DEFAULT 'INR',
    contract_valid_from INTEGER,
    contract_valid_until INTEGER,
    -- Timeline baseline
    planned_start_date  INTEGER,
    planned_end_date    INTEGER,
    -- Bootstrap
    bootstrap_completed INTEGER NOT NULL DEFAULT 0,  -- boolean
    bootstrap_started_at INTEGER,
    bootstrap_completed_at INTEGER,
    -- Idempotency
    idempotency_key     TEXT UNIQUE,             -- derived from accepted_version_id
    -- Actor and timestamps
    converted_by        TEXT NOT NULL,
    converted_at        INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    created_at          INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at          INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_pc_client ON project_contexts(client_id);
CREATE INDEX idx_pc_provider ON project_contexts(provider_id);
CREATE INDEX idx_pc_status ON project_contexts(status);
```

### 4.4 DDL — `project_scope_baselines` (Immutable)
```sql
CREATE TABLE project_scope_baselines (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    -- Copied from proposal_version_scope
    requirement_id  TEXT NOT NULL,
    requirement_name TEXT,
    coverage_status TEXT NOT NULL,
    provider_notes  TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 4.5 DDL — `project_deliverables`
```sql
CREATE TABLE project_deliverables (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    deliverable_name TEXT NOT NULL,
    description     TEXT,
    format          TEXT,                         -- e.g., PDF, DWG, 3D model
    quantity        INTEGER DEFAULT 1,
    revision_terms  TEXT,
    acceptance_responsibility TEXT,               -- who signs off
    due_milestone_id INTEGER REFERENCES project_milestones(id),
    status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','submitted','approved','rejected')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 4.6 DDL — `project_milestones`
```sql
CREATE TABLE project_milestones (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    milestone_name  TEXT NOT NULL,
    trigger_description TEXT NOT NULL,
    planned_amount  REAL,
    planned_percentage REAL,
    actual_amount   REAL,
    due_condition   TEXT,
    planned_date    INTEGER,
    actual_date     INTEGER,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','triggered','invoiced','paid','delayed')),
    approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending','approved','rejected')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_pm_project ON project_milestones(project_id);
```

### 4.7 DDL — `project_teams`
```sql
CREATE TABLE project_teams (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    provider_id     TEXT NOT NULL,
    role            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','completed','removed')),
    assigned_by     TEXT NOT NULL,
    assigned_at     INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    activated_at    INTEGER,
    completed_at    INTEGER,
    notes           TEXT,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_pt_project ON project_teams(project_id);
```

### 4.8 DDL — `project_communication_channels`
```sql
CREATE TABLE project_communication_channels (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    channel_type    TEXT NOT NULL CHECK(channel_type IN ('general','milestone','deliverable','issue','decision')),
    channel_name    TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 4.9 DDL — `project_drive_folders`
```sql
CREATE TABLE project_drive_folders (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    folder_name     TEXT NOT NULL,
    parent_folder_id INTEGER REFERENCES project_drive_folders(id),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 4.10 DDL — `project_tasks`
```sql
CREATE TABLE project_tasks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    task_name       TEXT NOT NULL,
    description     TEXT,
    assigned_to     TEXT,                         -- provider_id
    phase           TEXT,
    dependencies    TEXT,                         -- JSON array of task_ids
    planned_start   INTEGER,
    planned_end     INTEGER,
    actual_start    INTEGER,
    actual_end      INTEGER,
    status          TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','in_progress','blocked','completed','cancelled')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_ptask_project ON project_tasks(project_id);
```

### 4.11 DDL — `project_risk_register`
```sql
CREATE TABLE project_risk_register (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    risk_description TEXT NOT NULL,
    probability     TEXT CHECK(probability IN ('low','medium','high')),
    impact          TEXT CHECK(impact IN ('low','medium','high')),
    mitigation      TEXT,
    owner           TEXT,                         -- provider_id
    status          TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','mitigated','accepted','transferred','closed')),
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 4.12 DDL — `project_decision_log` (Immutable)
```sql
CREATE TABLE project_decision_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL REFERENCES project_contexts(id),
    decision_type   TEXT NOT NULL CHECK(decision_type IN ('scope_change','timeline_change','budget_change','team_change','milestone_approval','deliverable_approval','bootstrap_approval')),
    decision        TEXT NOT NULL CHECK(decision IN ('approved','rejected','deferred')),
    proposed_by     TEXT NOT NULL,
    decided_by      TEXT NOT NULL,
    decided_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    proposal_json   TEXT,                         -- what was proposed
    decision_json   TEXT,                         -- final accepted form (if approved)
    rejection_reason TEXT,
    -- Lineage
    source_event_id TEXT,                       -- correlation id from originating workflow
    created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
CREATE INDEX idx_pdl_project ON project_decision_log(project_id);
```

### 4.13 DDL — `project_bootstrap_status`
```sql
CREATE TABLE project_bootstrap_status (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id      INTEGER NOT NULL UNIQUE REFERENCES project_contexts(id),
    -- Steps
    workspace_created      INTEGER NOT NULL DEFAULT 0,
    relationship_linked    INTEGER NOT NULL DEFAULT 0,
    scope_baseline_created INTEGER NOT NULL DEFAULT 0,
    deliverables_created   INTEGER NOT NULL DEFAULT 0,
    milestones_created     INTEGER NOT NULL DEFAULT 0,
    team_placeholders_created INTEGER NOT NULL DEFAULT 0,
    communication_channels_created INTEGER NOT NULL DEFAULT 0,
    drive_folders_created  INTEGER NOT NULL DEFAULT 0,
    tasks_created          INTEGER NOT NULL DEFAULT 0,
    risk_register_created  INTEGER NOT NULL DEFAULT 0,
    decision_log_created   INTEGER NOT NULL DEFAULT 0,
    -- Overall
    total_steps            INTEGER NOT NULL DEFAULT 11,
    completed_steps        INTEGER NOT NULL DEFAULT 0,
    status                 TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('in_progress','completed','failed','partial')),
    failure_reason         TEXT,
    created_at             INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    updated_at             INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
```

### 4.14 Pre-Conversion Validation Rules
Before creating `project_contexts`, the system must verify:

```
1. enquiry.status == 'accepted'                (provider accepted enquiry)
2. proposal_thread.status IN ('sent', 'revision_requested', 'accepted')
3. EXISTS proposal_decisions WHERE decision = 'accept'
   AND version_id = proposal_thread.accepted_version_id
4. requesting_user has authority (provider_id match + role check)
5. NOT EXISTS project_contexts WHERE enquiry_id = :enquiry_id
   OR idempotency_key = :derived_key
6. proposal_version integrity_hash is valid (not corrupted)
7. total_amount, currency, validity_period are present and non-zero
```

### 4.15 Conversion Transaction
On successful validation, execute atomically:

```sql
BEGIN;

-- 1. Create project_contexts
INSERT INTO project_contexts (...)
VALUES (...);

-- 2. Copy scope baseline from accepted proposal version
INSERT INTO project_scope_baselines (project_id, requirement_id, ...)
SELECT :project_id, requirement_id, ...
FROM proposal_version_scope WHERE version_id = :accepted_version_id;

-- 3. Copy milestones from proposal version
INSERT INTO project_milestones (project_id, milestone_name, ...)
SELECT :project_id, milestone_name, ...
FROM proposal_version_milestones WHERE version_id = :accepted_version_id;

-- 4. Create team placeholder for primary provider
INSERT INTO project_teams (project_id, provider_id, role, status, assigned_by)
VALUES (:project_id, :provider_id, 'primary_provider', 'active', :converted_by);

-- 5. Create communication channels
INSERT INTO project_communication_channels (project_id, channel_type, channel_name, sort_order)
VALUES
    (:project_id, 'general', 'General Discussion', 1),
    (:project_id, 'milestone', 'Milestone Updates', 2),
    (:project_id, 'deliverable', 'Deliverable Reviews', 3);

-- 6. Create drive folders
INSERT INTO project_drive_folders (project_id, folder_name, sort_order)
VALUES
    (:project_id, 'Contracts', 1),
    (:project_id, 'Designs', 2),
    (:project_id, 'Documents', 3),
    (:project_id, 'Photos', 4);

-- 7. Initialize bootstrap status
INSERT INTO project_bootstrap_status (project_id, ...)
VALUES (:project_id, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 11, 'completed', NULL);

-- 8. Mark enquiry as converted
UPDATE enquiries SET status = 'converted', stage = 'won', updated_at = strftime('%s','now')
WHERE id = :enquiry_id;

-- 9. Update proposal thread
UPDATE proposal_threads SET status = 'accepted', updated_at = strftime('%s','now')
WHERE id = :proposal_thread_id;

-- 10. Record decision
INSERT INTO project_decision_log (project_id, decision_type, decision, proposed_by, decided_by, proposal_json, decision_json)
VALUES (:project_id, 'bootstrap_approval', 'approved', 'system', :converted_by, ...);

COMMIT;
```

### 4.16 Idempotency
- `idempotency_key` = `SHA256(enquiry_id + "|" + accepted_version_id + "|" + provider_id)`.
- Duplicate conversion returns existing `project_contexts` record.

### 4.17 API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/enquiries/{id}/convert` | provider | Trigger conversion with full validation |
| GET | `/api/projects/{id}` | provider, client | Read project context with lineage |
| GET | `/api/projects/{id}/lineage` | provider, client | Enquiry → Snapshot → Proposal → Project trace |
| GET | `/api/projects/{id}/bootstrap` | provider | Read bootstrap completion status |
| POST | `/api/projects/{id}/bootstrap/{step}/approve` | provider | Approve a bootstrap suggestion |
| POST | `/api/projects/{id}/bootstrap/{step}/reject` | provider | Reject a bootstrap suggestion |

### 4.18 Agent Permissions
| Agent | Read | Write |
|-------|------|-------|
| Bootstrap Agent | Accepted proposal version, project_contexts | `project_tasks` (suggestions), `project_risk_register` (suggestions) |
| Validation Agent | All conversion prerequisites | Blocks conversion if rules fail |
| Odin Orchestrator | All | Routes bootstrap suggestions to approval gates |

### 4.19 Human Approval Gates
- **Convert to Project**: Authorised provider user must explicitly trigger.
- **Bootstrap suggestions**: Provider approves each suggestion; suggestions that expand scope, cost, deliverables, or timeline require explicit approval.
- **Client-involved changes**: Any change to accepted commercial baseline requires client approval.

### 4.20 Audit Events
- `project.conversion_requested` — actor, timestamp, enquiry_id, proposal_version_id
- `project.conversion_validated` — validation results, timestamp
- `project.created` — project_contexts.id, timestamp, lineage
- `project.bootstrap_completed` — step completion log

---

## 5. Migration Plan from Current Schema

### 5.1 Current State
- `projects` table stores enquiry, project, and rejected states in `project_character` (`enq`, `pr`, `rej`).
- `project_proposals` stores one row per project (no versioning).
- `project_messages` stores loose audit messages.
- No `enquiry_snapshots`, `clarification_threads`, `proposal_versions`, or `project_contexts`.

### 5.2 Migration Sequence

#### Phase 1: Create New Tables (Backward Compatible)
Run all DDL above. Existing tables remain untouched. New tables are empty.

#### Phase 2: Backfill Enquiry Snapshots
For each `project_character = 'enq'` or `'rej'`:
```sql
INSERT INTO enquiry_snapshots (requirement_id, requirement_version, payload_json, ...)
SELECT p.id, 1, json_object(...), cd.client_name, ps.place, ...
FROM projects p
LEFT JOIN client_details cd ON cd.project_id = p.id
LEFT JOIN project_site ps ON ps.project_id = p.id
WHERE p.project_character IN ('enq', 'rej');
```

#### Phase 3: Create Enquiry Headers
```sql
INSERT INTO enquiries (project_id, provider_id, snapshot_id, status, stage, submitted_at, integrity_hash)
SELECT p.id, json_extract(p.provider_id, '$[0]'), s.id,
    CASE p.project_character WHEN 'enq' THEN 'submitted' ELSE 'rejected' END,
    CASE p.project_character WHEN 'enq' THEN 'lead' ELSE 'lost' END,
    p.created_at, s.integrity_hash
FROM projects p
JOIN enquiry_snapshots s ON s.requirement_id = p.id;
```

#### Phase 4: Migrate Existing Proposals
For each `project_proposals` row with `status = 'accepted'`:
```sql
INSERT INTO proposal_threads (enquiry_id, provider_id, status, ...)
SELECT e.id, pp.provider_id, 'accepted', ...
FROM project_proposals pp
JOIN enquiries e ON e.project_id = pp.project_id;
```

#### Phase 5: Migrate Accepted Projects to project_contexts
For each `project_character = 'pr'` with accepted proposal:
```sql
INSERT INTO project_contexts (enquiry_id, proposal_thread_id, accepted_version_id, ...)
SELECT e.id, pt.id, pv.id, ...
FROM projects p
JOIN enquiries e ON e.project_id = p.id
JOIN proposal_threads pt ON pt.enquiry_id = e.id
JOIN proposal_versions pv ON pv.thread_id = pt.id
WHERE p.project_character = 'pr' AND pt.status = 'accepted';
```

#### Phase 6: Deprecate Old Fields
- Mark `projects.project_character` as deprecated (do not write).
- Mark `project_proposals` as deprecated (read-only for history).
- Update application code to use new tables exclusively.

#### Phase 7: Cleanup (Post-Verification)
After 30 days of production validation:
- Archive `projects.project_character` data.
- Drop `project_proposals` after confirming `proposal_versions` contains all data.

### 5.3 Rollback Procedures
- **Phase 1–2**: Drop new tables; no data loss.
- **Phase 3–5**: Keep `projects` table untouched; rollback = delete new rows, revert code.
- **Phase 6–7**: Restore from backup before dropping columns.

---

## 6. Failure and Rollback Handling

### 6.1 Partial Conversion Failure
If conversion fails mid-transaction:
- Keep `project_contexts` record if created.
- Mark `project_bootstrap_status.status = 'partial'`.
- Record failure reason in `project_bootstrap_status.failure_reason`.
- Allow safe resumption of remaining steps via `/api/projects/{id}/bootstrap/resume`.

### 6.2 Snapshot Integrity Failure
If `integrity_hash` mismatch detected:
- Reject read with 409 Conflict.
- Log audit event `snapshot.integrity_failed`.
- Route to operations for manual verification.

### 6.3 Duplicate Conversion
- Return existing `project_contexts` with 200 OK.
- Log `project.conversion_idempotent`.
- Do not create duplicates.

### 6.4 Proposal Version Race Condition
If client accepts while provider sends revision:
- Version guard: accept only `status = 'sent'` version.
- Lock version row with `SELECT ... FOR UPDATE` (or equivalent).
- Return 409 if version already decided.

---

## Appendix A — Complete DDL Summary

### A.1 Drop Order (for rollback)
```sql
-- Reverse dependency order
DROP TABLE IF EXISTS project_decision_log;
DROP TABLE IF EXISTS project_risk_register;
DROP TABLE IF EXISTS project_tasks;
DROP TABLE IF EXISTS project_drive_folders;
DROP TABLE IF EXISTS project_communication_channels;
DROP TABLE IF EXISTS project_teams;
DROP TABLE IF EXISTS project_milestones;
DROP TABLE IF EXISTS project_deliverables;
DROP TABLE IF EXISTS project_scope_baselines;
DROP TABLE IF EXISTS project_bootstrap_status;
DROP TABLE IF EXISTS project_contexts;

DROP TABLE IF EXISTS proposal_decisions;
DROP TABLE IF EXISTS proposal_change_sets;
DROP TABLE IF EXISTS proposal_version_milestones;
DROP TABLE IF EXISTS proposal_version_scope;
DROP TABLE IF EXISTS proposal_versions;
DROP TABLE IF EXISTS proposal_drafts;
DROP TABLE IF EXISTS proposal_threads;

DROP TABLE IF EXISTS clarification_change_proposals;
DROP TABLE IF EXISTS clarification_answers;
DROP TABLE IF EXISTS clarification_questions;
DROP TABLE IF EXISTS clarification_threads;
DROP TABLE IF EXISTS requirement_versions;

DROP TABLE IF EXISTS enquiry_snapshot_files;
DROP TABLE IF EXISTS enquiry_snapshot_scope_items;
DROP TABLE IF EXISTS enquiry_snapshot_scope;
DROP TABLE IF EXISTS enquiry_snapshot_requirement_items;
DROP TABLE IF EXISTS enquiry_snapshot_requirements;
DROP TABLE IF EXISTS enquiry_snapshots;
DROP TABLE IF EXISTS enquiries;
```

### A.2 Create Order
See Sections 1.3–1.8, 2.3–2.6, 3.3–3.8, 4.3–4.13 above. Execute in forward dependency order (tables with no FKs first, then dependent tables).

---

*Document Version: 2.0*  
*Author: Kallisto Architecture Team*  
*Next Review: Post-MVP-2 Implementation*
