// ============================================================================
// Kallisto Franchise — data-service layer.
//
// The ONLY file that touches storage for franchise applications and
// franchise-page CMS content. Franchise applications are a SEPARATE funnel
// from Partner/Virtual Office waitlists (waitlist-data.js) and from CMS
// articles/pages (cms-data.js). Do not mix records.
//
// PRODUCTION SWAP POINT — replace _load/_persist and submit() with
// Firebase / Supabase / CRM / custom API calls; signatures are async-ready.
// ============================================================================

const FR_STORE_KEY = 'kallisto_franchise_store_v1';

const STATUSES = ['New', 'Under Review', 'Contacted', 'Information Requested', 'Qualified', 'Territory Discussion', 'Commercial Review', 'Shortlisted', 'Rejected', 'On Hold', 'Approved'];

function uid(p) { return p + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-5); }
function nowIso() { return new Date().toISOString(); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function normEmail(e) { return String(e || '').trim().toLowerCase(); }
function normPhone(p) {
  let d = String(p || '').replace(/\D/g, '');
  if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2);
  if (d.length === 11 && d[0] === '0') d = d.slice(1);
  return d;
}

let _cache = null;
function _load() {
  if (_cache) return _cache;
  try {
    const raw = localStorage.getItem(FR_STORE_KEY);
    if (raw) { _cache = JSON.parse(raw); if (_cache && _cache.version === 1) return _cache; }
  } catch (e) {}
  _cache = { version: 1, applications: [], content: { draft: null, published: null, lastUpdatedAt: null, lastUpdatedBy: null, publishedAt: null } };
  return _cache;
}
function _persist() { localStorage.setItem(FR_STORE_KEY, JSON.stringify(_cache)); }

// ---------------------------------------------------------------------------
// CMS-manageable public content (Franchise Page group). Draft/publish
// snapshots so admin edits never touch the live page until published.
// Defaults mirror the shipped page copy. No commercial figures — approved
// copy only states that terms are shared with shortlisted applicants.
// ---------------------------------------------------------------------------
const CONTENT_DEFAULTS = {
  applicationOpen: true,
  heroEyebrow: 'Kallisto Franchise',
  heroHeading: 'Build the construction ecosystem in your city.',
  heroBody: 'Apply to operate and grow Kallisto within an approved city, district or territory.',
  primaryCtaLabel: 'Apply for Franchise', primaryCtaHref: '#apply',
  secondaryCtaLabel: 'Request Information Pack', secondaryCtaHref: '#commercial',
  intro: 'Kallisto is building a connected construction ecosystem across India. Selected local operators will lead provider growth, customer support, partnerships and market activation within approved territories.',
  opportunityTypes: [
    { name: 'City Franchise', desc: 'Operate and grow Kallisto across a single approved city.', status: 'Under evaluation' },
    { name: 'District Franchise', desc: 'Lead activation across a district and its major towns.', status: 'Under evaluation' },
    { name: 'Kallisto Experience Centre', desc: 'A physical touchpoint for customers, partners and onboarding.', status: 'Under evaluation' },
    { name: 'Regional Operating Partner', desc: 'Multi-territory operations for established organisations.', status: 'Under evaluation' }
  ],
  eligibility: ['Construction business owners', 'Builders and contractors', 'Material business owners', 'Entrepreneurs with strong local networks', 'Existing construction-service operators', 'Regional business developers', 'Operators capable of building and managing a local team'],
  supportGroups: [
    { kicker: 'Brand & platform', items: ['Kallisto brand access', 'Platform and operating-system access', 'Central technology and product support'] },
    { kicker: 'Operations', items: ['Training and onboarding', 'Standard operating procedures', 'Provider-management tools', 'Customer-support workflows'] },
    { kicker: 'Growth', items: ['Partner acquisition workflows', 'Marketing assets', 'Territory activation support', 'Performance dashboards'] }
  ],
  responsibilities: ['Building the local provider network', 'Developing local partnerships', 'Maintaining service quality', 'Supporting customer activation', 'Following Kallisto operating standards', 'Managing the approved territory', 'Hiring and supervising the local team', 'Reporting performance', 'Protecting the Kallisto brand', 'Meeting compliance and commercial requirements'],
  steps: [
    { t: 'Submit expression of interest', d: 'Share your profile, territory preference and operating background.' },
    { t: 'Initial eligibility review', d: 'The Kallisto team reviews experience, network and readiness.' },
    { t: 'Territory and market discussion', d: 'Alignment on the city or district and its current demand.' },
    { t: 'Commercial and operational assessment', d: 'Detailed evaluation with shortlisted applicants.' },
    { t: 'Agreement and onboarding', d: 'Operating standards, training and launch preparation.' },
    { t: 'Territory launch', d: 'Activation with central support from the Kallisto team.' }
  ],
  commercialNotice: 'Commercial terms are shared with shortlisted applicants after the initial evaluation.',
  packEmail: 'hello@kallisto.in',
  territoryNote: 'Territory availability is reviewed during the selection process.',
  seo: { title: 'Kallisto Franchise \u2014 Build the construction ecosystem in your city', metaDescription: 'Apply to operate and grow Kallisto within an approved city, district or territory.', socialImage: null }
};

export const FranchiseData = {
  STATUSES,
  normEmail, normPhone,

  // ---- CMS content (Franchise Page group) ----
  getContentDraft() { const c = _load().content; return Object.assign(clone(CONTENT_DEFAULTS), c.draft || c.published || {}); },
  getPublished() { const c = _load().content; return Object.assign(clone(CONTENT_DEFAULTS), c.published || {}); },
  saveDraft(patch, user) {
    const c = _load().content;
    c.draft = Object.assign({}, c.draft || c.published || {}, patch || {});
    c.lastUpdatedAt = nowIso(); c.lastUpdatedBy = user && user.name ? user.name : 'Admin';
    try { _persist(); return { ok: true }; } catch (e) { return { ok: false, error: 'storage' }; }
  },
  publishContent(user) {
    const c = _load().content;
    c.published = Object.assign({}, c.published || {}, c.draft || {});
    c.draft = null; c.publishedAt = nowIso();
    c.lastUpdatedAt = nowIso(); c.lastUpdatedBy = user && user.name ? user.name : 'Admin';
    try { _persist(); return { ok: true }; } catch (e) { return { ok: false, error: 'storage' }; }
  },
  contentMeta() { const c = _load().content; return { lastUpdatedAt: c.lastUpdatedAt, lastUpdatedBy: c.lastUpdatedBy, publishedAt: c.publishedAt, hasDraft: !!c.draft }; },

  // ---- applications ----
  findDuplicate(email, phone) {
    const e = normEmail(email), p = normPhone(phone);
    return _load().applications.find((x) => (e && x.email === e) || (p && x.phone === p)) || null;
  },
  async submit(payload) {
    await new Promise((r) => setTimeout(r, 550));
    const errors = {};
    const req = ['fullName', 'phone', 'email', 'currentCity', 'homeState', 'applicantType', 'prefState', 'prefCity', 'invRange', 'why'];
    req.forEach((k) => { if (!String(payload[k] || '').trim()) errors[k] = 'required'; });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normEmail(payload.email))) errors.email = 'invalid';
    if (!/^[6-9]\d{9}$/.test(normPhone(payload.phone))) errors.phone = 'invalid';
    if (payload.consent !== true) errors.consent = 'required';
    if (Object.keys(errors).length) return { ok: false, error: 'invalid', fields: errors };
    if (this.findDuplicate(payload.email, payload.phone)) {
      return { ok: false, error: 'duplicate', message: 'A franchise expression of interest already exists for this email or phone number. The Kallisto team will contact you as your application progresses.' };
    }
    const t = (k) => String(payload[k] || '').trim();
    const entry = {
      id: uid('fr'), applicationType: 'franchise',
      fullName: t('fullName'), phone: normPhone(payload.phone), email: normEmail(payload.email),
      currentCity: t('currentCity'), homeState: t('homeState'),
      applicantType: t('applicantType'),
      territory: { preferredState: t('prefState'), preferredDistrict: t('prefDistrict'), preferredCity: t('prefCity'), alternative: t('altTerritory') },
      business: { name: t('bizName'), industry: t('industry'), yearsExperience: t('yearsExp'), teamSize: t('teamSize'), constructionExperience: t('consExp'), localNetwork: t('network'), officeOrProperty: t('property') },
      investmentRange: t('invRange'),
      operational: { fullTime: t('fullTime'), buildTeam: t('buildTeam'), managingBusiness: t('managing'), followStandards: t('standards'), launchTimeline: t('timeline'), why: t('why') },
      consent: true, sourcePage: t('sourcePage') || 'direct',
      status: 'New', assignedReviewer: '', notes: [],
      submittedAt: nowIso(), updatedAt: nowIso()
    };
    try { _load().applications.push(entry); _persist(); }
    catch (e) { return { ok: false, error: 'storage', message: 'Your application could not be saved. Please try again.' }; }
    return { ok: true, entry: clone(entry) };
  },

  // ---- admin management (Franchise Applications module) ----
  list() { return clone(_load().applications); },
  get(id) { return clone(_load().applications.find((x) => x.id === id) || null); },
  filter(criteria) {
    criteria = criteria || {};
    return this.list().filter((a) => {
      if (criteria.state && a.territory.preferredState.toLowerCase() !== String(criteria.state).toLowerCase()) return false;
      if (criteria.district && a.territory.preferredDistrict.toLowerCase() !== String(criteria.district).toLowerCase()) return false;
      if (criteria.city && a.territory.preferredCity.toLowerCase() !== String(criteria.city).toLowerCase()) return false;
      if (criteria.applicantType && a.applicantType !== criteria.applicantType) return false;
      if (criteria.investmentRange && a.investmentRange !== criteria.investmentRange) return false;
      if (criteria.status && a.status !== criteria.status) return false;
      if (criteria.assignedReviewer && a.assignedReviewer !== criteria.assignedReviewer) return false;
      if (criteria.from && a.submittedAt < criteria.from) return false;
      if (criteria.to && a.submittedAt > criteria.to) return false;
      return true;
    });
  },
  updateStatus(id, status) {
    if (STATUSES.indexOf(status) < 0) return { ok: false, error: 'invalid_status' };
    const a = _load().applications.find((x) => x.id === id);
    if (!a) return { ok: false, error: 'not_found' };
    a.status = status; a.updatedAt = nowIso();
    try { _persist(); return { ok: true }; } catch (e) { return { ok: false, error: 'storage' }; }
  },
  assignReviewer(id, name) {
    const a = _load().applications.find((x) => x.id === id);
    if (!a) return { ok: false, error: 'not_found' };
    a.assignedReviewer = String(name || ''); a.updatedAt = nowIso();
    try { _persist(); return { ok: true }; } catch (e) { return { ok: false, error: 'storage' }; }
  },
  addNote(id, text, user) {
    const a = _load().applications.find((x) => x.id === id);
    if (!a) return { ok: false, error: 'not_found' };
    a.notes.unshift({ id: uid('note'), text: String(text || ''), by: user && user.name ? user.name : 'Admin', at: nowIso() });
    a.updatedAt = nowIso();
    try { _persist(); return { ok: true }; } catch (e) { return { ok: false, error: 'storage' }; }
  },
  exportAll() { return clone(_load().applications); }
};
