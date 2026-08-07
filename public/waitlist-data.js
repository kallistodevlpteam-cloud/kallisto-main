// ============================================================================
// Kallisto Waitlist — data-service layer.
//
// This module is the ONLY file that touches storage for waitlist
// applications. `Kallisto Waitlist.dc.html` calls the functions on
// `WaitlistData` below and never reads localStorage directly.
//
// Waitlist applicants are intentionally SEPARATE from the Website CMS
// (cms-data.js). The CMS may manage the public waitlist-page copy (via
// getContent/saveContent below), but applicant records, statuses,
// qualification and invitation decisions live here and belong to a future
// waitlist-operations / CRM dashboard — never to CMS content.
//
// PRODUCTION SWAP POINT — to go live, replace the bodies of `_load` /
// `_persist` and `submit` with calls to Firebase / Supabase / a CRM /
// a custom backend API. The function signatures are already async so no
// page code changes.
//
// ---------------------------------------------------------------------------
// INVITATION HANDOFF (documented, not publicly exposed)
//
// When an applicant is Qualified and the team decides to invite them, the
// operations dashboard (future) generates a secure, single-use, expiring
// invitation token SERVER-SIDE and emails a link of the form:
//
//     Kallisto Onboarding.dc.html?invite={secureInvitationToken}
//
// The preserved onboarding flow validates the token with the backend,
// pre-fills the applicant's details, and only then allows account +
// Virtual Office creation. Activation must NEVER be derived from an email
// address or waitlist ID alone — those are guessable. On successful
// onboarding, the backend marks the waitlist record status = 'Activated'
// (see `updateStatus`). Nothing on the public waitlist page links to the
// onboarding file.
// ============================================================================

const WL_STORE_KEY = 'kallisto_waitlist_store_v1';
const WL_CONTENT_KEY = 'kallisto_waitlist_content_v1';

const STATUSES = ['New', 'Reviewed', 'Qualified', 'Research interview', 'Invited', 'Activated', 'Rejected', 'Unsubscribed'];

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-5);
}
function nowIso() { return new Date().toISOString(); }
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

// ---------------------------------------------------------------------------
// Normalisation — applied before storing AND before duplicate comparison.
// ---------------------------------------------------------------------------
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}
function normalizePhone(phone) {
  // Strip spaces, punctuation, parentheses; fold the +91 / 0 prefixes so
  // "+91 98470-12345", "098470 12345" and "9847012345" compare equal.
  let d = String(phone || '').replace(/\D/g, '');
  if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
  if (d.length === 11 && d[0] === '0') d = d.slice(1);
  return d;
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(email));
}
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(normalizePhone(phone));
}

// ---------------------------------------------------------------------------
// Storage adapter (prototype: localStorage). PRODUCTION SWAP POINT.
// ---------------------------------------------------------------------------
let _cache = null;
function _load() {
  if (_cache) return _cache;
  try {
    const raw = localStorage.getItem(WL_STORE_KEY);
    if (raw) { _cache = JSON.parse(raw); if (_cache && _cache.version === 1) return _cache; }
  } catch (e) {}
  _cache = { version: 1, entries: [] };
  return _cache;
}
function _persist() {
  localStorage.setItem(WL_STORE_KEY, JSON.stringify(_cache));
}

// ---------------------------------------------------------------------------
// Public waitlist-page content — the ONLY part of this file the Website CMS
// may manage. Defaults below mirror the approved public copy; `saveContent`
// is the hook a CMS "Waitlist page" editor would call. Applicant records are
// deliberately NOT reachable through this content API.
// ---------------------------------------------------------------------------
const CONTENT_DEFAULTS = {
  enabled: true,
  eyebrow: 'Kallisto Virtual Office',
  heading: 'Join the early-access waitlist',
  body: 'Be among the first construction professionals invited to build a verified Virtual Office and test Kallisto\u2019s practice workspace.',
  benefits: [
    'Create a professional digital office',
    'Manage enquiries, projects and documents',
    'Join Kallisto\u2019s verified construction network'
  ],
  notice: 'Kallisto Virtual Office is currently being prepared for selected early users. Joining the waitlist does not create an account immediately.',
  consentText: 'I agree to be contacted by Kallisto about early access, and I understand that joining the waitlist does not create an account.',
  ctaLabel: 'Join the waitlist',
  eyebrowPartner: 'Kallisto Partner Network',
  headingPartner: 'Join the Partner Network waitlist',
  bodyPartner: 'Be among the first labour teams, material suppliers and specialist contractors invited to join Kallisto\u2019s verified construction network.',
  benefitsPartner: [
    'Create a verified partner identity',
    'Receive structured project requirements',
    'Get discovered by verified construction businesses'
  ],
  noticePartner: 'The Kallisto Partner Network is currently being prepared for selected early partners. Joining the waitlist does not create an account immediately.',
  ctaLabelPartner: 'Join the Partner Network waitlist',
  successHeading: 'You\u2019re on the waitlist',
  successMessage: 'We\u2019ve received your details. The Kallisto team will contact you when early access becomes available for your professional category and location.',
  successSupport: 'No account has been created yet. Selected applicants will receive a separate invitation to complete their Kallisto onboarding.',
  duplicateMessage: 'You are already on the waitlist. We will contact you when access becomes available.',
  closedMessage: 'The waitlist is temporarily paused while we work through current applications. Please check back soon, or write to hello@kallisto.in.',
  professionOptions: ['Architect', 'Interior Designer', 'Architecture & Design Studio', 'Civil Engineer', 'Structural Engineer', 'Construction Company', 'Design & Build Firm', 'Project Management Consultant', 'Turnkey Contractor', 'Builder', 'Other'],
  partnerGroups: [
    { label: 'Labour Contractors', items: ['Mason teams', 'Carpenter teams', 'Painting teams', 'Tiling teams', 'Plumbing labour', 'Electrical labour', 'Other labour provider'] },
    { label: 'Material Providers', items: ['Cement', 'Steel', 'Sand', 'Aggregates', 'Paint', 'Electrical', 'Plumbing', 'Hardware', 'Sanitary', 'Roofing', 'Other material provider'] },
    { label: 'Specialist Service Providers', items: ['HVAC', 'MEP', 'Structural works', 'Electrical contractor', 'Plumbing contractor', 'Fire fighting', 'Waterproofing', 'Solar', 'Fabrication', 'Aluminium', 'Lift contractor', 'Other specialist provider'] }
  ],
  interestOptions: ['Professional online presence', 'Receiving structured enquiries', 'Project management', 'Documents and drawings', 'Quotations and milestones', 'Team collaboration', 'Other']
};

export const WaitlistData = {
  STATUSES,
  normalizeEmail,
  normalizePhone,
  isValidEmail,
  isValidPhone,

  // ---- public page content (CMS-manageable) ----
  getContent() {
    let overrides = {};
    try { overrides = JSON.parse(localStorage.getItem(WL_CONTENT_KEY) || '{}') || {}; } catch (e) {}
    return Object.assign(deepClone(CONTENT_DEFAULTS), overrides);
  },
  saveContent(patch) {
    // CMS hook — copy + option lists + enabled flag only. Never applicants.
    let overrides = {};
    try { overrides = JSON.parse(localStorage.getItem(WL_CONTENT_KEY) || '{}') || {}; } catch (e) {}
    Object.assign(overrides, patch || {});
    try { localStorage.setItem(WL_CONTENT_KEY, JSON.stringify(overrides)); return { ok: true }; }
    catch (e) { return { ok: false, error: 'storage' }; }
  },

  // ---- duplicate lookup (normalised email OR phone) ----
  findDuplicate(email, phone) {
    const e = normalizeEmail(email);
    const p = normalizePhone(phone);
    const store = _load();
    return store.entries.find((x) => (e && x.email === e) || (p && x.phone === p)) || null;
  },

  // ---- submission. PRODUCTION SWAP POINT (becomes a POST to the API) ----
  async submit(payload) {
    await new Promise((r) => setTimeout(r, 550)); // simulated network latency

    const fullName = String(payload.fullName || '').trim();
    const email = normalizeEmail(payload.email);
    const phone = normalizePhone(payload.phone);
    const errors = {};
    if (!fullName) errors.fullName = 'required';
    if (!isValidEmail(email)) errors.email = 'invalid';
    if (!isValidPhone(phone)) errors.phone = 'invalid';
    if (payload.applicantType !== 'independent' && payload.applicantType !== 'firm') errors.applicantType = 'required';
    if (!String(payload.professionCategory || '').trim()) errors.professionCategory = 'required';
    if (!String(payload.city || '').trim()) errors.city = 'required';
    if (payload.consent !== true) errors.consent = 'required';
    if (payload.waitlistType !== 'virtual-office' && payload.waitlistType !== 'partner-network') errors.waitlistType = 'invalid';
    if (Object.keys(errors).length) return { ok: false, error: 'invalid', fields: errors };

    // Duplicate guard — never creates a second record, never leaks the
    // existing record's details.
    if (this.findDuplicate(email, phone)) {
      return { ok: false, error: 'duplicate', message: this.getContent().duplicateMessage };
    }

    const entry = {
      id: uid('wl'),
      waitlistType: payload.waitlistType,          // 'virtual-office' | 'partner-network'
      fullName,
      email,
      phone,
      applicantType: payload.applicantType,        // 'independent' | 'firm'
      professionCategory: String(payload.professionCategory).trim(),
      city: String(payload.city).trim(),
      primaryInterest: String(payload.primaryInterest || '').trim(),
      consent: true,
      sourcePage: String(payload.sourcePage || 'direct'),
      referralCode: String(payload.referralCode || ''),
      status: 'New',
      submittedAt: nowIso(),
      updatedAt: nowIso()
    };
    try {
      const store = _load();
      store.entries.push(entry);
      _persist();
    } catch (e) {
      return { ok: false, error: 'storage', message: 'Your application could not be saved. Please try again.' };
    }
    return { ok: true, entry: deepClone(entry) };
  },

  // ---- operations API (future waitlist-ops / CRM dashboard, not public) ----
  list() { return deepClone(_load().entries); },
  get(id) { return deepClone(_load().entries.find((x) => x.id === id) || null); },
  updateStatus(id, status) {
    if (STATUSES.indexOf(status) < 0) return { ok: false, error: 'invalid_status' };
    const store = _load();
    const e = store.entries.find((x) => x.id === id);
    if (!e) return { ok: false, error: 'not_found' };
    e.status = status; e.updatedAt = nowIso();
    try { _persist(); } catch (err) { return { ok: false, error: 'storage' }; }
    return { ok: true };
  },
  exportAll() {
    // Future CRM sync hook — returns the raw records for a one-way export.
    return deepClone(_load().entries);
  }
};
