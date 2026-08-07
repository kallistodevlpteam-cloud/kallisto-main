# Kallisto Service Provider Web App — Repository Guidelines

## Repository Purpose

This repository contains the final production Kallisto Service Provider Web App.

It is not a static prototype, concept demo, landing-page experiment, or disposable HTML mock-up. All implementation decisions must support production deployment, maintainability, security, testing, and future scale.

Existing HTML screens and visual references may be used to understand approved layouts and workflows. Do not preserve prototype architecture when it conflicts with the production application architecture.

## Product Objective

The Service Provider Web App allows approved Kallisto service providers to manage their complete project lifecycle inside the Kallisto ecosystem.

Core capabilities include:

- Service-provider onboarding and verification.
- Professional and business profile management.
- Project opportunity and structured requirement review.
- Site feasibility report access.
- Concept, proposal, drawing, view, estimate, and document submission.
- Client review and approval workflows.
- BOQ creation and revision.
- Variation management.
- Construction-stage coordination.
- Milestone and payment visibility.
- Project communication and activity history.
- Project completion and handover.

Do not replace structured project workflows with untracked chat, disconnected documents, or local-only data.

## Technology Stack

Use the approved production stack:

- Next.js with App Router, React, and TypeScript with strict mode.
- Firebase Authentication, Cloud Firestore, Firebase Storage, and Firebase Cloud Functions or approved server-side APIs.
- Firebase Admin SDK only in trusted server environments.
- Vercel for frontend deployment and Firebase-managed infrastructure for approved backend services.
- Vitest or the repository-approved unit test runner, React Testing Library, and Playwright.

Do not introduce another framework, database, authentication provider, or state-management library without documenting the requirement and impact.

## Repository Structure

Follow this general structure:

```text
app/
  (auth)/
  (dashboard)/
  api/
  layout.tsx
  page.tsx
components/
  ui/
  layout/
  feedback/
features/
  authentication/
  onboarding/
  provider-profile/
  opportunities/
  projects/
  requirements/
  feasibility/
  proposals/
  documents/
  approvals/
  boq/
  variations/
  milestones/
  payments/
  handover/
lib/
  auth/
  firebase/
  permissions/
  validation/
  errors/
  logging/
services/
  repositories/
  integrations/
types/
  domain/
  api/
tests/
  unit/
  integration/
  e2e/
public/
  assets/
docs/
  PRODUCT.md
  ARCHITECTURE.md
  DOMAIN_RULES.md
  DATA_MODEL.md
  SECURITY.md
  DESIGN_SYSTEM.md
  TESTING.md
```

Use the actual repository structure when it already provides an equivalent location. Do not reorganize unrelated code during a scoped task.

## Source-of-Truth Documents

Before implementing domain-sensitive changes, inspect:

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/DOMAIN_RULES.md`
- `docs/DATA_MODEL.md`
- `docs/SECURITY.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/TESTING.md`

These documents are authoritative for product behavior and architecture. When implementation and documentation conflict:

1. Identify the conflict.
2. Determine which source controls the behavior.
3. Do not silently rewrite a business rule.
4. Update documentation when an approved change alters system behavior.

## Architecture Rules

- Use React components and Next.js routes through `app/`, not standalone page-level HTML files.
- Keep route files focused on routing, composition, and route-level loading.
- Keep domain logic inside the relevant feature module.
- Place reusable visual primitives in `components/ui/` and reusable application components in the appropriate shared component directory.
- Centralize Firebase configuration and initialization.
- Keep external service access inside typed service or repository modules; do not call Firestore directly from arbitrary UI components.
- Separate server state from temporary interface state.
- Prefer server components where appropriate; use client components only when browser interaction requires them.
- Keep privileged operations in trusted server-side code.
- Validate all external data at application boundaries.
- Do not duplicate existing components, utilities, validators, or contracts.
- Do not place business logic inside styling or rendering helpers.
- Do not build oversized route components containing unrelated workflows.

## Existing HTML Migration Rules

Existing `.html` and `.dc.html` files are visual and workflow references only. When converting an approved screen:

1. Identify its layout, responsive behavior, and interaction states.
2. Break the screen into reusable React components.
3. Move business logic into feature modules.
4. Replace inline styles with the approved design-system implementation.
5. Replace local persistence with approved Firebase or server persistence.
6. Add loading, empty, error, success, and permission-denied states.
7. Add appropriate automated tests.
8. Confirm visual alignment with the approved reference.

Do not embed an entire legacy HTML file into the production application. Do not continue adding production functionality to legacy HTML files. Do not delete legacy references until their replacement has been verified and deletion is explicitly in scope.

## Kallisto Domain Rules

### Provider Access

- Only approved and verified service providers may receive or accept full projects.
- Enforce provider verification with trusted server-side logic.
- A provider may access only projects assigned to that provider or an authorized team.
- Determine team-member access by role and project membership.
- Keep client, provider, field-team, and Kallisto internal roles distinct.

### Project Requirements

- Keep requirements in one authoritative project record.
- Keep AI-enhanced requirements traceable to the original client input; never silently overwrite original requirements.
- Preserve requirement revision history.
- Require providers to acknowledge the applicable requirement version before submitting deliverables.

### Site Feasibility

- Field feasibility reports must identify the project, author, date, and evidence.
- Providers must not modify a Kallisto field-team report unless expressly authorized.
- Preserve earlier versions when reports are updated.

### Proposals and Deliverables

- Link concepts, drawings, estimates, views, and documents to a project.
- Record author, timestamp, category, and version for every submission.
- Replacing a file must not erase its previous version or approval history.
- The client must review the exact submitted version; approval of one version does not approve later revisions.

### Approvals

Every approval record must include:

- Project identifier.
- Deliverable or decision identifier.
- Version.
- Decision.
- Actor and actor role.
- Timestamp.
- Comments and evidence reference where applicable.

Validate approval-dependent phase transitions server-side. Do not display a project phase as approved when the authoritative approval record is missing.

### Project Phases

Project phases must follow the approved Kallisto workflow. A project must not progress into construction until all mandatory pre-construction conditions are satisfied.

Phase transitions must validate the current phase, required approvals, required documents, and user authority; record the actor and timestamp; and preserve previous phase history. Do not update phases through unrestricted client-side writes.

### BOQ Governance

- Lock each BOQ to one project and preserve revision history.
- Do not overwrite approved quantities, rates, or totals without an authorized revision.
- Missing required quantities or rates must produce visible validation failures; missing financial values must not silently calculate as zero.
- Record author, status, and timestamp for every revision.
- Approved revisions are immutable except through controlled correction or revision workflows.

### Variations

Use explicit statuses where applicable: Draft, Submitted, Pending, Approved, Rejected, and Withdrawn.

Pending variations must not update the approved revised contract total. Keep original approved contract total, approved variation total, approved revised contract total, pending variation total, and scenario total separate.

Each variation decision must record its evidence reference, approver, decision, decision date, financial impact, and related BOQ or scope references.

### Milestones and Payments

- Use authoritative server data for financial records.
- Do not treat a displayed payment status as proof of settlement; require an approved payment system or verified backend record.
- Keep milestone approval and payment status separate.
- Do not implement escrow, wallet, or fund-holding claims unless the approved payment architecture supports them.
- Do not expose provider or payment secrets in client code.

### Handover

A project must not be marked complete without required completion approvals, final documents, handover evidence, outstanding-issue status, final financial status, and completion actor and timestamp.

## Authentication and Authorization

- Use Firebase Authentication for identity and verify tokens in trusted server-side code for protected operations.
- Do not trust browser-supplied role values.
- Resolve permissions from authoritative backend records or approved custom claims.
- Enforce authorization at database, storage, and server-function layers.
- Hidden buttons are not permission controls.
- Protect records against cross-provider and cross-client access.
- Deny access by default when permission information is incomplete.

## Data and Persistence

- Firestore or an approved backend service is authoritative for production data.
- Do not use `localStorage` as the source of truth for projects, users, BOQs, documents, approvals, variations, milestones, or payments.
- Browser storage is allowed only for approved, non-sensitive temporary preferences. Never store authentication tokens manually in `localStorage`.
- Use typed domain models and validate data before persistence.
- Use server-generated timestamps for authoritative events.
- Preserve immutable audit records for critical actions.
- Make writes idempotent and safe against retries or duplicate submissions.
- Use transactions, batched writes, or equivalent atomic operations when financial, approval, or project-state records must remain consistent.

## Security Requirements

- Never commit secrets, credentials, service-account files, or private keys.
- Use environment variables through the approved configuration system.
- Keep Firebase Admin SDK code exclusively in trusted server environments and outside browser bundles.
- Validate uploaded file type, size, ownership, and project association.
- Restrict Firestore and Storage access through authenticated identity, role, and project permissions.
- Sanitize user-controlled content before rendering.
- Do not expose internal stack traces to users.
- Do not log confidential client, project, identity, authentication, or payment information.
- Rate-limit abuse-sensitive operations.
- Protect destructive, financial, and approval actions against duplicate execution.
- Require explicit confirmation for irreversible actions.
- Record immutable audit events for critical business operations.
- Deny access by default when authentication, ownership, or permission information is incomplete.

## Design-System Rules

Follow `docs/DESIGN_SYSTEM.md` and approved Kallisto interface references.

- Use established typography, spacing, colour, and component tokens.
- Do not introduce arbitrary visual styles.
- Do not redesign unrelated areas during scoped work.
- Reuse approved shared components before creating new ones.
- Keep information hierarchy clear, operational, and task-focused.
- Avoid unnecessary dashboard cards, decorative gradients, and generic AI-generated interface patterns.
- Support desktop, tablet, and mobile layouts.
- Preserve visible keyboard focus.
- Use semantic HTML through React components.
- Give controls accessible names.
- Do not communicate important status through colour alone.

Every data-driven screen must support:

- Loading state.
- Empty state.
- Error state.
- Success state.
- Permission-denied state.
- Offline or retry state where applicable.

## Coding Conventions

- Use TypeScript strict mode.
- Use typed domain models for all production data.
- Avoid `any` unless the boundary cannot be typed and the exception is documented.
- Use descriptive terminology based on the Kallisto product domain.
- Follow the repository formatter, lint rules, and import conventions.
- Keep functions focused, cohesive, and testable.
- Prefer explicit domain types over generic objects.
- Validate API, Firebase, and user-provided data at system boundaries.
- Do not suppress TypeScript, lint, or test errors merely to make validation pass.
- Do not modify generated files directly.
- Explain non-obvious business constraints with concise comments.
- Remove dead code, duplicated components, temporary debugging output, and unapproved console logging.
- Do not place production business logic directly inside presentation components.
- Do not access Firestore or privileged APIs from arbitrary UI components; use approved service, repository, or server modules.
- Do not use `localStorage` as the authoritative source for users, projects, documents, approvals, BOQs, variations, milestones, or payments.

## Development Commands

Use the package manager and scripts configured in the repository. Typical commands are:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Use the development URL reported by the framework after running `npm run dev`. Do not assume a fixed port unless the repository explicitly configures one.

Do not claim that a command passed unless it was actually executed successfully.

When a required validation script does not exist, add the appropriate script as part of the production foundation rather than relying permanently on manual checks.

## Testing Requirements

Every meaningful behavioral change must include appropriate automated coverage:

- Unit tests for validation, permissions, calculations, and domain logic.
- Component tests for interactive interface behavior.
- Integration tests for Firebase adapters, repositories, and server operations.
- End-to-end tests for critical user workflows.

Critical coverage includes:

- Authentication.
- Service-provider onboarding.
- Provider verification.
- Roles and permissions.
- Project access and assignment.
- Project requirements.
- Feasibility reports.
- Proposal submission.
- Document upload and versioning.
- Client approvals.
- Project phase transitions.
- BOQ calculations and revisions.
- Variation creation and approval.
- Milestone approval.
- Payment-status display.
- Project completion and handover.

Test failure and edge cases, including:

- Unauthenticated access.
- Unauthorized project access.
- Invalid state transitions.
- Missing required data.
- Duplicate submissions.
- Stale document or record versions.
- Rejected approvals.
- Concurrent updates.
- Network failures.
- Backend failures.
- Partial transaction failures.
- Invalid uploaded files.

## Manual Verification

After automated validation, manually verify affected workflows in the running production application.

Check:

- Browser console output.
- Navigation and routing.
- Authentication.
- Permission boundaries.
- Forms and validation.
- Loading, empty, error, and success states.
- Persistence after refresh.
- Desktop, tablet, and mobile layouts.
- Keyboard accessibility.
- Duplicate-submission protection.
- Visual alignment with approved Kallisto references.

Manual verification supplements automated tests; it does not replace them.

## Commit and Pull Request Guidelines

Use short, imperative, and scoped commit subjects, for example:

```text
Projects: enforce approval before phase transition
BOQ: validate missing quantity and rate
Auth: protect provider dashboard routes
```

Pull requests must:

- Summarize the implemented behavior.
- Identify affected features and routes.
- Explain database, security-rule, or API-contract changes.
- List automated and manual validation performed.
- Include screenshots for visible desktop and mobile changes.
- Identify migrations, environment changes, and deployment considerations.
- State remaining limitations or risks.
- Avoid unsupported commercial, financial, legal, or payment-protection claims.

Do not describe temporary browser storage, mocked data, or incomplete integrations as production-ready.

## Completion Standard

A task is complete only when:

- The requested behavior is implemented using the approved architecture.
- Domain and permission rules remain enforced.
- Loading, empty, error, and permission states are handled.
- Relevant tests are added or updated.
- Lint passes.
- Type checking passes.
- Automated tests pass.
- The production build passes.
- No new browser-console errors are introduced.
- Desktop and mobile behavior are verified.
- No secrets or sensitive data are exposed.
- No unrelated redesign or refactor is included.
- Documentation is updated when behavior, architecture, data contracts, or workflows change.

The completion response must state:

- What changed.
- Which files changed.
- Which validation commands were run.
- The factual result of each command.
- Any remaining limitations or risks.

Do not state that work is complete when required validation failed or could not be performed.

## Change Discipline

Before editing:

1. Inspect the relevant route, feature, domain types, services, and tests.
2. Read the controlling product, architecture, domain, and security documents.
3. Identify existing reusable components, validators, and utilities.
4. Check authentication, permission, data-integrity, and migration implications.
5. Implement the smallest coherent production-quality change.
6. Run the required validation.
7. Report factual results.

Do not:

- Rebuild unrelated areas.
- Weaken business rules to simplify implementation.
- Preserve prototype architecture merely because it already exists.
- Add placeholders where production behavior can be implemented.
- Silently invent business, financial, legal, approval, or payment rules.
- Claim completion based only on visual appearance.
