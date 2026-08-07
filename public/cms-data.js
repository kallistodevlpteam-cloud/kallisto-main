// ============================================================================
// Kallisto CMS — data-service layer.
//
// This module is the ONLY place that touches storage. Every screen in
// Kallisto Admin.dc.html calls the functions on `CMSData` below and never
// reads localStorage directly. Today `_persist`/`_load` implement a local
// prototype adapter (localStorage); to go to production, replace the bodies
// of `_load`/`_persist` (and the few functions marked PRODUCTION SWAP POINT)
// with calls to Firebase / Supabase / a headless CMS / a custom API — no
// screen code needs to change because they only ever see this file's API.
//
// This is a prototype persistence adapter, not a production database.
// ============================================================================

const STORE_KEY = 'kallisto_cms_store_v4';

let _cache = null;

function uid(prefix) {
  return prefix + '_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-5);
}
function nowIso() { return new Date().toISOString(); }
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

function slugify(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'untitled';
}
function wordCount(html) {
  const text = String(html || '').replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function readingTime(html) { return Math.max(1, Math.round(wordCount(html) / 200)); }

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function timeAgo(iso) {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  if (h < 24) return h + ' hr ago';
  const d = Math.round(h / 24);
  if (d < 30) return d + ' day' + (d === 1 ? '' : 's') + ' ago';
  return fmtDate(iso);
}

// ---------------------------------------------------------------------------
// Section "kinds" — the approved layout library. Every page section picks a
// kind; the kind decides which renderer + which fields + which approved
// layout/background variants are available. This is what keeps section
// editing from becoming an unrestricted CSS/HTML editor.
// ---------------------------------------------------------------------------
const KIND_META = {
  navbar: { renderType: 'chrome', label: 'Navbar', locked: true, group: 'Global content → Navigation' },
  footer: { renderType: 'chrome', label: 'Footer', locked: true, group: 'Global content → Footer' },
  contactPanel: { renderType: 'chrome', label: 'Contact details', locked: true, group: 'Global content → Contact & social' },
  articleGrid: { renderType: 'chrome', label: 'Article grid', locked: true, group: null, info: 'Lists all Published articles automatically, newest first. Nothing to configure here.' },
  hero: { renderType: 'hero', label: 'Hero', imageGuidance: 'Wide desktop image, minimum 1600px wide, light tones. Keep the centre clear for the headline. Crops narrower on mobile.', layoutOptions: ['Centered', 'Left-aligned'], backgroundOptions: ['Default', 'Card (subtle)', 'Ink (dark)'] },
  logoStrip: { renderType: 'logoStrip', label: 'Trust logo strip', imageGuidance: 'Transparent PNG or SVG works best, shown ~22px tall and greyscaled. Falls back to a text wordmark if no logo is uploaded.' },
  testimonial: { renderType: 'testimonial', label: 'Testimonial' },
  cardGrid: { renderType: 'cardGrid', label: 'Card grid', layoutOptions: ['3 columns', '2 columns', 'List'], backgroundOptions: ['Default', 'Card (subtle)'] },
  mediaCopy: { renderType: 'mediaCopy', label: 'Media + copy', imageGuidance: 'Editorial photo, roughly 2.2:1 landscape.', layoutOptions: ['Media right', 'Media left', 'Panel (no media)'], backgroundOptions: ['Default', 'Card (subtle)'] },
  faq: { renderType: 'faq', label: 'FAQ' },
  steps: { renderType: 'steps', label: 'Steps' }
};

// ---------------------------------------------------------------------------
// Seed content — mirrors the real copy already live on the public site so
// the CMS demonstrates editing real structure, not placeholder lorem ipsum.
// ---------------------------------------------------------------------------
function sec(kind, overrides) {
  return Object.assign({ id: uid('sec'), kind, order: 0, visible: true, fields: {} }, overrides || {});
}

function homepageSections() {
  return [
    sec('navbar', { order: 0, fields: { summary: '5 links · CTA “Join early access”' } }),
    sec('hero', { order: 1, fields: {
      eyebrow: 'Kallisto Virtual Office', heading: 'Run your practice from one intelligent workspace',
      body: 'A connected virtual office for architects, engineers, designers and construction teams.',
      ctaLabel: 'Join early access', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office', secondaryCtaLabel: '', secondaryCtaHref: '',
      image: { mediaId: 'm_hero', alt: 'Architectural drawings and project materials arranged around a white workspace' }, layoutVariant: 'Centered', background: 'Default'
    } }),
    sec('logoStrip', { order: 2, fields: {
      caption: 'Built with architects, engineers & construction teams',
      logos: ['LATERITE', 'Form & Ferro', 'GRIDLINE', 'Sthira', 'MALANAD', 'anvaya', 'KMC ENGINEERS', 'Kanira'].map((name) => ({ name, mediaId: null }))
    } }),
    sec('testimonial', { order: 3, fields: {
      quote: 'Kallisto gave our studio one address for everything — enquiries, drawings and approvals in a single office.',
      attribution: 'Devika Menon, Principal Architect at Laterite Studio', rating: 5
    } }),
    sec('cardGrid', { order: 4, fields: {
      eyebrow: 'Who is this for?', heading: 'One virtual office that works harder for your practice', layoutVariant: '3 columns', background: 'Default',
      items: [
        { title: 'Architects', body: 'Present your studio, run design stages and keep client approvals moving from one office.', tag: 'blue' },
        { title: 'Interior Designers', body: 'Share portfolios, manage selections and estimates, and coordinate site work with clients.', tag: 'pink' },
        { title: 'Engineers', body: 'Issue drawings, track review cycles and keep site queries against the right project record.', tag: 'purple' },
        { title: 'Construction Companies', body: 'Run execution, teams and site documentation with one operating surface across projects.', tag: 'mint' },
        { title: 'Design & Build Firms', body: 'Carry projects from concept to handover without switching tools between stages.', tag: 'amber' },
        { title: 'Project Consultants', body: 'Give owners structured reporting, approvals and visibility across every stakeholder.', tag: 'blue' }
      ]
    } }),
    sec('cardGrid', { order: 5, fields: {
      heading: 'A practice shouldn’t run on scattered chats and spreadsheets', layoutVariant: '3 columns', background: 'Default',
      items: [
        { title: 'Scattered', body: 'Your projects live across chats, drives and notebooks — enquiries, drawings and decisions sit in ten places and belong to no one.', tag: 'blue' },
        { title: 'Manual', body: 'Quotations and follow-ups are retyped every time — spreadsheets and forwarded PDFs stand in for a system of record.', tag: 'pink' },
        { title: 'Invisible', body: 'Your work is excellent but hard to see — there’s no verified public identity that turns referrals into structured enquiries.', tag: 'purple' }
      ]
    } }),
    sec('cardGrid', { order: 6, fields: {
      heading: 'One workspace. Every project detail.', body: 'Kallisto puts identity and operations in one place. Present a verified office, then run every enquiry, document and milestone behind it.',
      ctaLabel: 'Join early access', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office', layoutVariant: '3 columns', background: 'Default',
      items: [
        { title: 'Client approvals in one thread', body: '', tag: 'blue' },
        { title: 'Documents & drawings, versioned', body: '', tag: 'pink' },
        { title: 'Quotations that become milestones', body: '', tag: 'mint' },
        { title: 'Project tracking without spreadsheets', body: '', tag: 'amber' },
        { title: 'Team roles and permissions', body: '', tag: 'purple' },
        { title: 'A verified public profile', body: '', tag: 'mint' }
      ]
    } }),
    sec('mediaCopy', { order: 7, fields: {
      heading: 'Present a verified office, not a forwarded phone number',
      body: 'First impressions decide enquiries. Your Virtual Office gives clients a verified public profile with your work, services and credentials — a permanent address for your practice that referrals can trust.',
      quote: 'Clients used to reach us through forwarded numbers. Now they find a proper office.', attribution: 'Arjun Varkey, Partner at Form & Ferro',
      image: { mediaId: null, alt: '' }, layoutVariant: 'Media right', background: 'Default'
    } }),
    sec('mediaCopy', { order: 8, fields: {
      heading: 'Every drawing, decision and approval on one record',
      body: 'No more hunting through chat history. Drawings stay versioned, approvals are logged against the project, and site queries land where the whole team can resolve them.',
      quote: 'Every drawing issue and approval is on one record. Site queries stopped getting lost.', attribution: 'Rahul Krishnan, Project Lead at Malanad',
      image: { mediaId: null, alt: '' }, layoutVariant: 'Media right', background: 'Default'
    } }),
    sec('mediaCopy', { order: 9, fields: {
      heading: 'Quotations that turn into tracked milestones',
      body: 'Stop retyping the same estimate. Send a structured quotation, get it accepted, and watch it become project milestones your client and team both see — on site, from a phone.',
      quote: 'Quotations, revisions and milestones finally live in the same place as the project.', attribution: 'Fathima Rasheed, Interior Designer at Nira',
      image: { mediaId: null, alt: '' }, layoutVariant: 'Media right', background: 'Default'
    } }),
    sec('mediaCopy', { order: 10, fields: {
      heading: 'Gentle nudges keep clients and reviews moving',
      body: 'Nobody enjoys chasing approvals. Your office follows up on pending reviews, selections and payments with polite, professional reminders — so you can stay focused on the work.',
      quote: 'The office follows up so I don’t have to. Reviews come back on time now.', attribution: 'Joseph Kurian, Consultant at Gridline',
      image: { mediaId: null, alt: '' }, layoutVariant: 'Media right', background: 'Default'
    } }),
    sec('mediaCopy', { order: 11, fields: {
      eyebrow: 'Meet clients where they reply', heading: 'Updates and approvals reach clients on WhatsApp and email',
      body: 'Send updates, review requests and reminders where your clients already respond. Every reply lands back on the project record — nothing lives only in someone’s phone.',
      image: { mediaId: null, alt: '' }, layoutVariant: 'Panel (no media)', background: 'Card (subtle)'
    } }),
    sec('cardGrid', { order: 12, fields: {
      layoutVariant: '2 columns', background: 'Default',
      items: [
        { title: 'Verified identities', body: 'Every Virtual Office is checked against business and professional records before it carries the verified mark.', tag: 'blue' },
        { title: 'Role-based access', body: 'Owners decide what employees, partners and clients can see and do on every project — one company, one office, many accounts.', tag: 'purple' }
      ]
    } }),
    sec('hero', { order: 13, fields: {
      eyebrow: 'Early access', heading: 'Build better projects from one virtual office',
      body: 'Set up your office, verify your practice and start receiving structured enquiries.',
      ctaLabel: 'Get early access', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office', image: { mediaId: null, alt: '' }, layoutVariant: 'Centered', background: 'Default'
    } }),
    sec('faq', { order: 14, fields: {
      heading: 'FAQs', items: [
        { q: 'What is a Kallisto Virtual Office?', a: 'A verified public profile for your practice, with an operations workspace behind it for enquiries, projects and documents.' },
        { q: 'Do I need to be verified to join early access?', a: 'No — you can create your office immediately. Verification adds a badge to your public profile once your details are confirmed.' },
        { q: 'Can my whole team use one office?', a: 'Yes. Invite teammates and set roles and permissions so everyone sees only what they need.' },
        { q: 'What happens to my data if I stop using Kallisto?', a: 'You can export or delete your practice data at any time by contacting us.' },
        { q: 'Which regions is Kallisto available in?', a: 'We’re focused on India during early access, starting with architecture, engineering and construction teams.' }
      ]
    } }),
    sec('footer', { order: 15, fields: { summary: '4 link columns · hello@kallisto.in · Kerala, India' } })
  ];
}

function pageSeed(id, title, route, sections, opts) {
  opts = opts || {};
  const draft = { sections, seo: {
    title: opts.seoTitle || title + ' — Kallisto Virtual Office', metaDescription: opts.metaDescription || '',
    canonicalUrl: route, ogTitle: '', ogDescription: '', socialImage: null, index: true, follow: true, schemaType: opts.schemaType || 'WebPage'
  } };
  const published = opts.neverPublished ? null : deepClone(draft);
  return {
    id, title, route, sections: draft.sections, seo: draft.seo,
    publishedSnapshot: published,
    createdAt: opts.createdAt || nowIso(), updatedAt: opts.updatedAt || nowIso(),
    publishedAt: published ? (opts.publishedAt || nowIso()) : null,
    editedBy: opts.editedBy || 'Ansel Fernandes'
  };
}

function seedPages() {
  return [
    pageSeed('home', 'Homepage', '/', homepageSections(), { seoTitle: 'Kallisto — Run your practice from one intelligent workspace', metaDescription: 'A connected virtual office for architects, engineers, designers and construction teams.', schemaType: 'Organization' }),
    pageSeed('how', 'How it works', '/how-it-works', [
      sec('hero', { order: 0, fields: { eyebrow: 'How it works', heading: 'Set up your professional office in minutes', body: 'From first sign-in to a verified public office receiving structured enquiries — here is the whole journey.', ctaLabel: '', ctaHref: '', layoutVariant: 'Centered', background: 'Default' } }),
      sec('mediaCopy', { order: 1, fields: { heading: 'What is a Virtual Office?', body: 'A permanent digital identity with a workspace behind it. Your public page presents the practice; behind it, enquiries, projects, documents, quotations and your team run in one organised place.', image: { mediaId: null, alt: '' }, layoutVariant: 'Panel (no media)', background: 'Default' } }),
      sec('steps', { order: 2, fields: { heading: 'The journey', items: [
        { title: 'Join the waitlist', body: 'Set your practice identity, location and professional details.', mediaId: null },
        { title: 'Add professional information', body: 'Credentials, services and the work that represents you.', mediaId: null },
        { title: 'Publish a verified profile', body: 'Go live with a public office clients and partners can trust.', mediaId: null },
        { title: 'Receive structured enquiries', body: 'New enquiries arrive as records, not forwarded messages.', mediaId: null },
        { title: 'Manage opportunities', body: 'Quotations, milestones and approvals from the same office.', mediaId: null }
      ] } }),
      sec('hero', { order: 3, fields: { heading: 'Ready to open your office?', body: 'Five minutes of setup. Everything saves as you go.', ctaLabel: 'Join the waitlist', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office', layoutVariant: 'Centered', background: 'Default' } })
    ], { seoTitle: 'How it works — Kallisto Virtual Office', metaDescription: 'From first sign-in to a verified public office receiving structured enquiries — here is the whole journey.' }),
    pageSeed('features', 'Features', '/features', [
      sec('hero', { order: 0, fields: { eyebrow: 'Features', heading: 'Everything your practice needs to work professionally', body: 'One system underneath — identity in front, operations behind.', layoutVariant: 'Centered', background: 'Default' } }),
      sec('cardGrid', { order: 1, fields: { heading: 'Feature groups', layoutVariant: '3 columns', background: 'Default', items: [
        { title: 'A verified public profile', body: 'Present credentials clients can trust.', tag: 'blue' },
        { title: 'Portfolio & services', body: 'Showcase past work alongside what you offer.', tag: 'blue' },
        { title: 'A permanent office address', body: 'One link, not a forwarded number.', tag: 'blue' },
        { title: 'Structured enquiries', body: 'Every enquiry lands as a record, not a text.', tag: 'mint' },
        { title: 'Quotations & milestones', body: 'Estimates that become tracked project stages.', tag: 'mint' },
        { title: 'Documents & drawings', body: 'Version control built into every upload.', tag: 'mint' },
        { title: 'Team roles & permissions', body: 'Control what employees and partners can see.', tag: 'purple' },
        { title: 'Client approvals', body: 'One thread per decision, not a chat backlog.', tag: 'purple' },
        { title: 'WhatsApp & email updates', body: 'Reach clients where they already reply.', tag: 'purple' },
        { title: 'Partner Network visibility', body: 'Get discovered by other verified practices.', tag: 'amber' },
        { title: 'Reminders that follow up', body: 'Gentle nudges keep reviews moving.', tag: 'amber' },
        { title: 'Reporting for owners', body: 'Structured visibility across every stakeholder.', tag: 'amber' }
      ] } }),
      sec('mediaCopy', { order: 2, fields: { body: 'The office, portfolio and workspace share one record — nothing is retyped between them.', image: { mediaId: null, alt: '' }, layoutVariant: 'Panel (no media)', background: 'Default' } }),
      sec('hero', { order: 3, fields: { heading: 'See it working for your kind of practice', ctaLabel: 'Who it’s for', ctaHref: '#/who-its-for', layoutVariant: 'Centered', background: 'Default' } })
    ], { seoTitle: 'Features — Kallisto Virtual Office', metaDescription: 'One system underneath — identity in front, operations behind.' }),
    pageSeed('who', 'Who it’s for', '/who-its-for', [
      sec('hero', { order: 0, fields: { heading: 'One workspace for every kind of practice', body: 'Nine kinds of practice, one operating surface — shaped to how each one actually works.', layoutVariant: 'Centered', background: 'Default' } }),
      sec('cardGrid', { order: 1, fields: { layoutVariant: '3 columns', background: 'Default', items: [
        { title: 'Architects', body: 'Present your studio, run design stages and keep approvals moving.', tag: 'blue' },
        { title: 'Interior Designers', body: 'Share portfolios, manage selections and estimates in one place.', tag: 'pink' },
        { title: 'Civil Engineers', body: 'Issue drawings, track review cycles and manage site queries.', tag: 'purple' },
        { title: 'Structural Engineers', body: 'Keep calculations, revisions and approvals attached to the right project.', tag: 'purple' },
        { title: 'Construction Companies', body: 'Run execution, crews and site documentation across every project.', tag: 'mint' },
        { title: 'Design & Build Firms', body: 'Carry projects from concept to handover without switching tools.', tag: 'amber' },
        { title: 'Project Management Consultants', body: 'Give owners structured reporting and visibility across stakeholders.', tag: 'blue' },
        { title: 'Turnkey Contractors', body: 'Track quotations, milestones and vendors from a single office.', tag: 'pink' },
        { title: 'Builders', body: 'Keep clients updated and site records organised without spreadsheets.', tag: 'mint' }
      ] } }),
      sec('hero', { order: 2, fields: { heading: 'Ready to see your practice represented properly?', ctaLabel: 'Join early access', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office', layoutVariant: 'Centered', background: 'Default' } })
    ], { seoTitle: 'Who it’s for — Kallisto Virtual Office', metaDescription: 'Nine kinds of construction practice, one operating surface — shaped to how each one actually works.' }),
    pageSeed('pricing', 'Pricing', '/pricing', [
      sec('hero', { order: 0, fields: { heading: 'Choose the office that fits', body: 'Founder pricing locks in during early access — plans below are still being finalised.', layoutVariant: 'Centered', background: 'Default' } }),
      sec('cardGrid', { order: 1, fields: { heading: 'Plans', layoutVariant: '3 columns', background: 'Default', items: [
        { title: 'Solo', body: 'For individual practitioners. Early access — pricing TBA.', tag: 'blue' },
        { title: 'Studio', body: 'For growing studios and teams. Early access — pricing TBA.', tag: 'purple' },
        { title: 'Enterprise', body: 'For multi-office firms. Early access — pricing TBA.', tag: 'mint' }
      ] } }),
      sec('faq', { order: 2, fields: { heading: 'Pricing questions', items: [
        { q: 'Is pricing available yet?', a: 'We’re finalising plans during early access — everyone who joins now locks in founder pricing.' },
        { q: 'Can I switch plans later?', a: 'Yes, you’ll be able to change plans at any time from your office settings.' },
        { q: 'Is there a free trial?', a: 'Early access itself is free while we build out the full plan structure.' }
      ] } }),
      sec('hero', { order: 3, fields: { heading: 'Start free during early access', ctaLabel: 'Get early access', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office', layoutVariant: 'Centered', background: 'Default' } })
    ], { seoTitle: 'Pricing — Kallisto Virtual Office', metaDescription: 'Founder pricing during early access — plans for solo practitioners, studios and multi-office firms.' }),
    pageSeed('about', 'About', '/about', [
      sec('hero', { order: 0, fields: { eyebrow: 'About Kallisto', heading: 'Building the operating layer for construction practices', body: 'Kallisto started with a simple observation: practices run on scattered chats, spreadsheets and forwarded PDFs. We’re building the verified, connected alternative.', layoutVariant: 'Centered', background: 'Default' } }),
      sec('cardGrid', { order: 1, fields: { heading: 'What we believe', layoutVariant: '3 columns', background: 'Default', items: [
        { title: 'Verified by default', body: 'Every public office is checked before it carries the verified mark — trust isn’t a paid add-on.', tag: 'blue' },
        { title: 'Built with practitioners', body: 'Every feature is shaped with architects, engineers and construction teams already running practices.', tag: 'mint' },
        { title: 'One record, not ten tools', body: 'Identity, enquiries, documents and delivery live on a single, shared record.', tag: 'purple' }
      ] } }),
      sec('cardGrid', { order: 2, fields: { heading: 'Team', layoutVariant: 'List', background: 'Card (subtle)', items: [
        { title: 'Add your team', body: 'Add photos, names and roles for your founders and leadership team.', tag: 'blue' }
      ] } }),
      sec('hero', { order: 3, fields: { heading: 'Want to work with us?', ctaLabel: 'Contact us', ctaHref: '#/contact', layoutVariant: 'Centered', background: 'Default' } })
    ], { seoTitle: 'About — Kallisto Virtual Office', metaDescription: 'Kallisto is building the verified, connected operating layer for construction practices.', neverPublished: true, updatedAt: nowIso(), createdAt: nowIso() }),
    pageSeed('contact', 'Contact', '/contact', [
      sec('hero', { order: 0, fields: { heading: 'Talk to the Kallisto team', body: 'Questions about early access, verification or the Partner Network — we read everything.', layoutVariant: 'Centered', background: 'Default' } }),
      sec('contactPanel', { order: 1, fields: { summary: 'hello@kallisto.in · Kerala, India' } })
    ], { seoTitle: 'Contact — Kallisto Virtual Office', metaDescription: 'Questions about early access, verification or the Partner Network — get in touch with the Kallisto team.' }),
    pageSeed('blog', 'Blog index', '/blog', [
      sec('hero', { order: 0, fields: { heading: 'Notes for the modern construction practice', body: 'Field guides, product notes and operating advice for architects, engineers and construction teams.', layoutVariant: 'Centered', background: 'Default' } }),
      sec('articleGrid', { order: 1, fields: {} })
    ], { seoTitle: 'Blog — Kallisto Virtual Office', metaDescription: 'Field guides, product notes and operating advice for architects, engineers and construction teams.' })
  ];
}

function seedCategories() {
  return ['Practice Management', 'Architecture', 'Construction', 'Business Operations', 'Digital Transformation', 'Project Delivery', 'Kallisto Updates'].map((name) => ({
    id: uid('cat'), name, slug: slugify(name), description: '', seo: { title: '', metaDescription: '' }, archived: false
  }));
}

function seedAuthors() {
  return [{ id: 'auth_house', name: 'Kallisto Team', role: 'Editorial', bio: 'The house byline for Kallisto product notes and field guides.', avatarMediaId: null, social: {}, slug: 'kallisto-team', active: true }];
}

function art(slug, cat, title, excerpt, body, status, extra) {
  extra = extra || {};
  const catObj = seedCategories().find((c) => c.name === cat);
  return {
    id: uid('art'), title, slug, excerpt, body, authorId: 'auth_house', categoryId: null, categoryName: cat, tags: extra.tags || [],
    coverImageId: null, coverAlt: extra.coverAlt !== undefined ? extra.coverAlt : '',
    status: status, scheduledAt: extra.scheduledAt || null, publishedAt: extra.publishedAt || null,
    createdAt: extra.createdAt || nowIso(), updatedAt: extra.updatedAt || nowIso(), editedBy: 'Ansel Fernandes',
    publishedSnapshot: null,
    seo: Object.assign({
      title: extra.seoTitle !== undefined ? extra.seoTitle : title, metaDescription: extra.metaDescription !== undefined ? extra.metaDescription : excerpt,
      canonicalUrl: '/blog/' + slug, ogTitle: title, ogDescription: excerpt, ogImage: null, socialImage: null,
      index: true, follow: true, articleSchema: true, authorSchema: true, breadcrumbSchema: true,
      relatedKeywords: [], internalLinks: [], redirectFromSlug: ''
    }, extra.seo || {}),
    relatedIds: []
  };
}

function seedArticles() {
  const richBody = '<h2>Why one office beats ten tools</h2><p>Most practices don’t fail from lack of talent — they fail from decisions living in ten different places. A quotation in a spreadsheet. Approvals in a chat thread. Drawings in a shared drive nobody organised. By the time a client asks “where are we on this?”, the honest answer takes ten minutes to assemble.</p><blockquote>The cheapest dispute is the one your records prevented before it started.</blockquote><p>A single office changes the shape of the problem. Enquiries land as structured records instead of forwarded messages. Drawings keep their version history automatically. Quotations, once accepted, become the milestones everyone already sees.</p><h2>What actually moves into one place</h2><ul><li>Client enquiries and the replies that follow them</li><li>Quotations, revisions and their acceptance status</li><li>Drawings and documents, versioned automatically</li><li>Milestones, site queries and approvals</li></ul><p>None of this requires a new habit — it requires one office instead of ten surfaces.</p>';
  return [
    art('run-practice-one-office', 'Practice Management', 'Running a construction practice from one office: a field guide', 'What changes when identity, enquiries and delivery share a single record instead of ten scattered tools.', richBody, 'published', { publishedAt: '2026-06-02T09:00:00.000Z', createdAt: '2026-05-28T09:00:00.000Z', tags: ['operations', 'practice management'] }),
    art('structured-enquiries', 'Business Operations', 'Why structured enquiries beat forwarded phone numbers', 'Referrals are gold — until they arrive as a missed call with no context. A structured enquiry fixes that.', '<p>Referrals are gold — until they arrive as a missed call with no context attached. A structured enquiry captures the project type, budget range and timeline up front, so the first reply is useful instead of a round of twenty questions.</p><p>Treat every enquiry as a record from the moment it lands, not a message to triage later.</p>', 'published', { publishedAt: '2026-05-20T09:00:00.000Z', tags: ['enquiries', 'sales'] }),
    art('drawing-version-discipline', 'Architecture', 'Drawing version discipline for small studios', 'Version chaos isn’t a size problem — it’s a system problem. A lightweight discipline fixes most of it.', '<p>Version chaos isn’t a size problem — it’s a system problem. Most studios lose track of “final” not because they’re careless, but because the naming and storage system was never designed to hold the weight of a live project.</p><p>A few conventions — one canonical location, automatic version numbers, and a change log per drawing — remove almost all of the ambiguity.</p>', 'published', { publishedAt: '2026-05-08T09:00:00.000Z', tags: ['drawings', 'workflow'] }),
    art('quotation-to-milestones', 'Project Delivery', 'From quotation to milestones without spreadsheets', 'The estimate, the acceptance and the delivery plan are one document, not three.', '<p>The estimate, the acceptance and the delivery plan are usually three different documents living in three different places. They don’t need to be. Once a quotation is accepted, its line items are already most of a milestone plan.</p>', 'published', { publishedAt: '2026-04-22T09:00:00.000Z', tags: ['quotations', 'milestones'] }),
    art('site-documentation-habits', 'Construction', 'Five site-documentation habits that save disputes', 'The cheapest dispute is the one your records ended before it began. Five habits worth building.', '<p>The cheapest dispute is the one your records ended before it began. Photograph before covering up work, log site instructions the same day, and keep one thread per decision — small habits, compounding value.</p>', 'in_review', {
      seoTitle: 'Five site-documentation habits every construction supervisor should build into their daily routine without exception',
      updatedAt: nowIso(), tags: ['site management']
    }),
    art('digital-office-india', 'Digital Transformation', 'The digital office moment for Indian construction', 'Clients now research providers the way they research everything else — a verified digital presence is no longer optional.', '<p>Clients now research providers the way they research everything else online — a verified digital presence is no longer optional, even for referral-driven practices.</p>', 'scheduled', { scheduledAt: '2026-07-28T09:00:00.000Z', metaDescription: '', tags: [] }),
    art('kallisto-early-access', 'Kallisto Updates', 'Inside Kallisto early access: what ships first', 'Verified profiles, structured enquiries and the project workspace — the first slice of the product.', '<p>Verified profiles, structured enquiries and the project workspace are the first slice of the product shipping to early access practices.</p>', 'draft', { metaDescription: '', coverAlt: '', tags: [] }),
    art('client-approvals-thread', 'Practice Management', 'Client approvals: one thread, zero ambiguity', 'Approval by emoji is not approval. How to make sign-off unambiguous without slowing clients down.', '<p>Approval by emoji reaction is not approval. When sign-off has real consequences downstream, it deserves one unambiguous thread per decision — not a reaction buried in a longer conversation.</p>', 'published', { publishedAt: '2026-03-14T09:00:00.000Z', tags: ['clients', 'approvals'] })
  ];
}

function seedGlobal() {
  return {
    navigation: {
      links: [
        { label: 'How it works', href: '#/how-it-works', visible: true },
        { label: 'Features', href: '#/features', visible: true },
        { label: 'Who it’s for', href: '#/who-its-for', visible: true },
        { label: 'Pricing', href: '#/pricing', visible: true },
        { label: 'Blog', href: '#/blog', visible: true }
      ],
      loginLabel: '', loginHref: '', ctaLabel: 'Join early access', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office'
    },
    footer: {
      brandStatement: 'Built in India for construction professionals.', ctaLabel: 'Join the waitlist', ctaHref: 'Kallisto Waitlist.dc.html?type=virtual-office',
      columns: [
        { title: 'Explore', links: [{ label: 'How it works', href: '#/how-it-works' }, { label: 'Features', href: '#/features' }, { label: 'Who it’s for', href: '#/who-its-for' }, { label: 'Pricing', href: '#/pricing' }, { label: 'Blog', href: '#/blog' }] },
        { title: 'For professionals', links: [{ label: 'Architects', href: '#/who-its-for' }, { label: 'Interior Designers', href: '#/who-its-for' }, { label: 'Civil Engineers', href: '#/who-its-for' }, { label: 'Construction Companies', href: '#/who-its-for' }] },
        { title: 'Kallisto', links: [{ label: 'Join the waitlist', href: '#/create-office' }, { label: 'Log in', href: '#/login' }, { label: 'Partner Network', href: 'Kallisto Waitlist.dc.html?type=partner' }, { label: 'Contact', href: '#/contact' }] }
      ],
      copyright: '© 2026 Kallisto Innovations Private Limited'
    },
    contact: { email: 'hello@kallisto.in', phone: '', whatsapp: '', address: 'Kerala, India', instagram: '', linkedin: '', youtube: '' },
    announcement: { message: '', ctaLabel: '', ctaHref: '', startDate: '', endDate: '', enabled: false }
  };
}

function seedDesign() {
  return {
    font: 'Hanken Grotesk', headingScale: 'Default', bodyScale: 'Default', lineHeight: 'Comfortable',
    colors: { primary: '#2668E8', secondary: '#7B5BE6', background: '#FCFBF8', panel: '#F7F6F2', text: '#131312', muted: '#67645D' },
    buttonRadius: 'Pill', cardRadius: 'Large (16px)', inputRadius: 'Medium (10px)', sectionSpacing: 'Default', containerWidth: '1060px'
  };
}

function seedSeoGlobal() {
  return {
    siteTitle: 'Kallisto', separator: '—', defaultMetaDescription: 'A connected virtual office for architects, engineers, designers and construction teams.',
    defaultSocialImage: null, orgSchemaEnabled: true, logoMediaId: null, siteUrl: 'https://kallisto.in', robots: 'index, follow', sitemapStatus: 'Generated automatically'
  };
}

function seedUsers() {
  return [
    { id: 'admin', name: 'Ansel Fernandes', email: 'ansel@kallisto.in', role: 'admin', title: 'Head of Marketing' },
    { id: 'editor', name: 'Priya Nair', email: 'priya@kallisto.in', role: 'editor', title: 'Content Editor' }
  ];
}

function seedMedia() {
  return [
    { id: 'm_hero', fileName: 'hero-desk-2.png', url: 'assets/hero-desk-2.png?v=projects-workspace-20260717', format: 'PNG', width: null, height: null, fileSize: null, altText: 'Architectural drawings and project materials arranged around a white workspace', caption: '', focalPoint: { x: 50, y: 40 }, createdAt: nowIso() },
    { id: 'm_hero_alt', fileName: 'hero-desk.png', url: 'assets/hero-desk.png', format: 'PNG', width: null, height: null, fileSize: null, altText: '', caption: '', focalPoint: { x: 50, y: 50 }, createdAt: nowIso() }
  ];
}

function seedStore() {
  const pages = seedPages();
  const pageDefaults = {};
  pages.forEach((p) => { pageDefaults[p.id] = deepClone(p.sections); });
  return {
    version: 4,
    session: null,
    users: seedUsers(),
    pages, pageDefaults,
    articles: seedArticles(),
    categories: seedCategories(),
    authors: seedAuthors(),
    media: seedMedia(),
    global: seedGlobal(),
    design: seedDesign(),
    seoGlobal: seedSeoGlobal(),
    revisions: [],
    lastPublishedAt: '2026-06-02T09:00:00.000Z'
  };
}

function _load() {
  if (_cache) return _cache;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { _cache = JSON.parse(raw); if (_cache && _cache.version === 4) return _cache; }
  } catch (e) {}
  _cache = seedStore();
  _persist();
  return _cache;
}
function _persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(_cache)); } catch (e) { /* storage full — prototype adapter only */ }
}

// Assign categoryId now that we have real category objects (done lazily on first load).
function _linkCategories(store) {
  store.articles.forEach((a) => {
    if (!a.categoryId) {
      const c = store.categories.find((c) => c.name === a.categoryName);
      a.categoryId = c ? c.id : store.categories[0].id;
    }
  });
}

function _touchPage(page, user) { page.updatedAt = nowIso(); if (user) page.editedBy = user.name; }
function _touchArticle(a, user) { a.updatedAt = nowIso(); if (user) a.editedBy = user.name; }

function _diffSummary(prevSections, nextSections) {
  if (!prevSections) return 'Initial version';
  const changed = [];
  nextSections.forEach((s) => {
    const prev = prevSections.find((p) => p.id === s.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(s)) changed.push((KIND_META[s.kind] || {}).label || s.kind);
  });
  if (!changed.length) return 'No content changes';
  return 'Updated ' + changed.slice(0, 4).join(', ') + (changed.length > 4 ? ' and ' + (changed.length - 4) + ' more' : '');
}

function _addRevision(store, entityType, entityId, snapshot, note, user, state) {
  store.revisions.unshift({ id: uid('rev'), entityType, entityId, snapshot: deepClone(snapshot), note, editedBy: user ? user.name : 'System', createdAt: nowIso(), state });
  if (store.revisions.length > 300) store.revisions.length = 300;
}

function _forbidden() { return { ok: false, error: 'forbidden', message: 'Your Editor role can’t perform this action. Ask an Admin to publish or change settings.' }; }

// ---------------------------------------------------------------------------
// SEO + publish validation
// ---------------------------------------------------------------------------
function computeSeoIssues(kind, seo, extra) {
  extra = extra || {};
  const issues = [];
  const title = (seo && seo.title) || '';
  const meta = (seo && seo.metaDescription) || '';
  if (!title.trim()) issues.push({ field: 'title', message: 'Missing SEO title', severity: 'error' });
  else if (title.length > 60) issues.push({ field: 'title', message: 'SEO title is longer than 60 characters (' + title.length + ')', severity: 'warning' });
  if (!meta.trim()) issues.push({ field: 'metaDescription', message: 'Missing meta description', severity: 'warning' });
  else if (meta.length > 160) issues.push({ field: 'metaDescription', message: 'Meta description is longer than 160 characters (' + meta.length + ')', severity: 'warning' });
  if (kind === 'article') {
    if (!extra.coverImageId) issues.push({ field: 'cover', message: 'Missing cover image', severity: 'warning' });
    if (extra.coverImageId && !extra.coverAlt) issues.push({ field: 'coverAlt', message: 'Cover image is missing alt text', severity: 'warning' });
    if (!seo.canonicalUrl) issues.push({ field: 'canonical', message: 'Missing canonical URL', severity: 'warning' });
    if (!(seo.internalLinks || []).length) issues.push({ field: 'internalLinks', message: 'No internal links in this article', severity: 'warning' });
  }
  if (!seo.index) issues.push({ field: 'index', message: 'This page is set to noindex — it will not appear in search results', severity: 'warning' });
  if (extra.duplicateSlug) issues.push({ field: 'slug', message: 'Another item already uses this slug', severity: 'error' });
  return issues;
}

function computePageChecklist(page) {
  const items = [];
  const heroLike = page.sections.find((s) => s.kind === 'hero');
  items.push({ label: 'Page has a title', status: page.title.trim() ? 'pass' : 'fail' });
  items.push({ label: 'Hero heading is filled in', status: heroLike && heroLike.fields.heading && heroLike.fields.heading.trim() ? 'pass' : (heroLike ? 'fail' : 'pass') });
  const missingAlt = page.sections.some((s) => s.fields && s.fields.image && s.fields.image.mediaId && !s.fields.image.alt);
  items.push({ label: 'Images have alt text', status: missingAlt ? 'warn' : 'pass' });
  const seoIssues = computeSeoIssues('page', page.seo, {});
  items.push({ label: 'SEO fields reviewed', status: seoIssues.some((i) => i.severity === 'error') ? 'fail' : (seoIssues.length ? 'warn' : 'pass') });
  items.push({ label: 'Mobile preview reviewed', status: 'warn' });
  return items;
}

function computeArticleChecklist(a) {
  const items = [];
  items.push({ label: 'Title is filled in', status: a.title.trim() ? 'pass' : 'fail' });
  items.push({ label: 'Body has content', status: wordCount(a.body) >= 30 ? 'pass' : 'fail' });
  items.push({ label: 'Cover image present', status: a.coverImageId ? 'pass' : 'warn' });
  items.push({ label: 'Cover image has alt text', status: a.coverImageId && !a.coverAlt ? 'warn' : 'pass' });
  const seoIssues = computeSeoIssues('article', a.seo, { coverImageId: a.coverImageId, coverAlt: a.coverAlt });
  items.push({ label: 'SEO fields reviewed', status: seoIssues.some((i) => i.severity === 'error') ? 'fail' : (seoIssues.length ? 'warn' : 'pass') });
  items.push({ label: 'Mobile preview reviewed', status: 'warn' });
  return items;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const CMSData = {
  KIND_META,
  helpers: { fmtDate, fmtDateTime, timeAgo, wordCount, readingTime, slugify, uid },

  // ---- auth ----
  listDemoUsers() { return deepClone(_load().users); },
  getSession() { return deepClone(_load().session); },
  login(userId) {
    const store = _load();
    const u = store.users.find((x) => x.id === userId);
    if (!u) return { ok: false, error: 'not_found' };
    store.session = { id: u.id, name: u.name, email: u.email, role: u.role, title: u.title, loginAt: nowIso() };
    _persist();
    return { ok: true, session: deepClone(store.session) };
  },
  logout() { const store = _load(); store.session = null; _persist(); },

  // ---- pages ----
  getPages() { const store = _load(); _linkCategories(store); return deepClone(store.pages); },
  getPage(id) { return deepClone(_load().pages.find((p) => p.id === id) || null); },
  pageStatus(page) {
    if (!page.publishedSnapshot) return 'draft';
    const same = JSON.stringify({ s: page.sections, seo: page.seo }) === JSON.stringify({ s: page.publishedSnapshot.sections, seo: page.publishedSnapshot.seo });
    return same ? 'published' : 'changed';
  },
  updateSectionField(pageId, sectionId, patch, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const section = page.sections.find((s) => s.id === sectionId); if (!section) return { ok: false };
    Object.assign(section.fields, patch);
    _touchPage(page, user); _persist();
    return { ok: true };
  },
  setSectionList(pageId, sectionId, listKey, list, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const section = page.sections.find((s) => s.id === sectionId); if (!section) return { ok: false };
    section.fields[listKey] = list;
    _touchPage(page, user); _persist();
    return { ok: true };
  },
  setSectionVisible(pageId, sectionId, visible, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const section = page.sections.find((s) => s.id === sectionId); if (!section || (KIND_META[section.kind] || {}).locked) return { ok: false };
    section.visible = visible; _touchPage(page, user); _persist();
    return { ok: true };
  },
  reorderSection(pageId, sectionId, direction, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const movable = page.sections.filter((s) => !(KIND_META[s.kind] || {}).locked).sort((a, b) => a.order - b.order);
    const idx = movable.findIndex((s) => s.id === sectionId);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= movable.length) return { ok: false };
    const a = movable[idx], b = movable[swapIdx];
    const tmp = a.order; a.order = b.order; b.order = tmp;
    _touchPage(page, user); _persist();
    return { ok: true };
  },
  duplicateSection(pageId, sectionId, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const section = page.sections.find((s) => s.id === sectionId); if (!section || (KIND_META[section.kind] || {}).locked) return { ok: false };
    const copy = deepClone(section); copy.id = uid('sec');
    page.sections.forEach((s) => { if (s.order > section.order) s.order += 1; });
    copy.order = section.order + 1;
    page.sections.push(copy);
    _touchPage(page, user); _persist();
    return { ok: true, newId: copy.id };
  },
  restoreSectionDefault(pageId, sectionId, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const defaults = (store.pageDefaults || {})[pageId] || [];
    const def = defaults.find((s) => s.id === sectionId);
    const section = page.sections.find((s) => s.id === sectionId);
    if (!def || !section) return { ok: false };
    section.fields = deepClone(def.fields);
    _touchPage(page, user); _persist();
    return { ok: true };
  },
  updatePageMeta(pageId, patch, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    if (patch.title !== undefined) page.title = patch.title;
    if (patch.seo) Object.assign(page.seo, patch.seo);
    _touchPage(page, user); _persist();
    return { ok: true };
  },
  saveDraft(pageId, user) {
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const prevRev = store.revisions.find((r) => r.entityType === 'page' && r.entityId === pageId);
    _touchPage(page, user);
    _addRevision(store, 'page', pageId, { sections: page.sections, seo: page.seo }, _diffSummary(prevRev ? prevRev.snapshot.sections : null, page.sections), user, 'draft');
    _persist();
    return { ok: true };
  },
  publishPage(pageId, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    page.publishedSnapshot = deepClone({ sections: page.sections, seo: page.seo });
    page.publishedAt = nowIso(); _touchPage(page, user);
    _addRevision(store, 'page', pageId, { sections: page.sections, seo: page.seo }, 'Published', user, 'published');
    store.lastPublishedAt = nowIso();
    _persist();
    return { ok: true };
  },
  restorePageRevision(pageId, revisionId, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    const page = store.pages.find((p) => p.id === pageId); if (!page) return { ok: false };
    const rev = store.revisions.find((r) => r.id === revisionId); if (!rev) return { ok: false };
    page.sections = deepClone(rev.snapshot.sections); page.seo = deepClone(rev.snapshot.seo);
    _touchPage(page, user);
    _addRevision(store, 'page', pageId, { sections: page.sections, seo: page.seo }, 'Restored from ' + fmtDateTime(rev.createdAt), user, 'draft');
    _persist();
    return { ok: true };
  },
  getPageChecklist(page) { return computePageChecklist(page); },
  getPageSeoIssues(page) { return computeSeoIssues('page', page.seo, {}); },

  // ---- media ----
  getMedia() { return deepClone(_load().media); },
  getMediaItem(id) { return deepClone(_load().media.find((m) => m.id === id) || null); },
  async _processImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, 1920 / img.width);
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          let data = file.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86);
          if (data.length > 4200000) data = c.toDataURL('image/jpeg', 0.78);
          resolve({ data, width: img.width, height: img.height });
        };
        img.onerror = () => reject(new Error('Could not read that image'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('Could not read that file'));
      reader.readAsDataURL(file);
    });
  },
  async addMediaFromFile(file) {
    const dataUrl = await this._processImageFile(file);
    const store = _load();
    const item = {
      id: uid('m'), fileName: file.name, url: dataUrl.data, format: (file.type.split('/')[1] || 'image').toUpperCase(),
      width: dataUrl.width, height: dataUrl.height, fileSize: file.size, altText: '', caption: '', focalPoint: { x: 50, y: 50 }, createdAt: nowIso()
    };
    store.media.unshift(item); _persist();
    return deepClone(item);
  },
  async replaceMediaFile(id, file) {
    const dataUrl = await this._processImageFile(file);
    const store = _load();
    const m = store.media.find((x) => x.id === id); if (!m) return { ok: false };
    m.url = dataUrl.data; m.width = dataUrl.width; m.height = dataUrl.height; m.fileSize = file.size;
    m.fileName = file.name; m.format = (file.type.split('/')[1] || 'image').toUpperCase();
    _persist();
    return { ok: true };
  },
  updateMedia(id, patch) {
    const store = _load();
    const m = store.media.find((x) => x.id === id); if (!m) return { ok: false };
    Object.assign(m, patch); _persist();
    return { ok: true };
  },
  deleteMedia(id, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    store.media = store.media.filter((m) => m.id !== id); _persist();
    return { ok: true };
  },
  getMediaUsage(mediaId) {
    const store = _load();
    const usage = [];
    store.pages.forEach((p) => {
      p.sections.forEach((s) => {
        if (s.fields && s.fields.image && s.fields.image.mediaId === mediaId) usage.push({ type: 'page', id: p.id, label: p.title + ' — ' + ((KIND_META[s.kind] || {}).label || s.kind) });
        if (s.fields && Array.isArray(s.fields.logos)) s.fields.logos.forEach((lg) => { if (lg.mediaId === mediaId) usage.push({ type: 'page', id: p.id, label: p.title + ' — logo strip' }); });
      });
      if (p.seo && p.seo.socialImage === mediaId) usage.push({ type: 'page', id: p.id, label: p.title + ' — social image' });
    });
    store.articles.forEach((a) => {
      if (a.coverImageId === mediaId) usage.push({ type: 'article', id: a.id, label: a.title + ' — cover' });
      if (a.seo && (a.seo.ogImage === mediaId || a.seo.socialImage === mediaId)) usage.push({ type: 'article', id: a.id, label: a.title + ' — social image' });
    });
    return usage;
  },

  // ---- articles ----
  getArticles() { const store = _load(); _linkCategories(store); return deepClone(store.articles); },
  getArticle(id) { const store = _load(); _linkCategories(store); return deepClone(store.articles.find((a) => a.id === id) || null); },
  createArticle(user) {
    const store = _load();
    const a = art('untitled-' + (store.articles.length + 1), 'Practice Management', 'Untitled article', '', '<p></p>', 'draft', {});
    a.categoryId = store.categories[0].id;
    store.articles.unshift(a); _persist();
    return deepClone(a);
  },
  updateArticleField(id, patch, user) {
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    if (patch.seo) { Object.assign(a.seo, patch.seo); delete patch.seo; }
    Object.assign(a, patch);
    _touchArticle(a, user); _persist();
    return { ok: true };
  },
  updateArticleBody(id, html, user) {
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    a.body = html; _touchArticle(a, user); _persist();
    return { ok: true };
  },
  saveArticleDraft(id, user) {
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    const prevRev = store.revisions.find((r) => r.entityType === 'article' && r.entityId === id);
    _touchArticle(a, user);
    _addRevision(store, 'article', id, deepClone(a), prevRev ? 'Draft updated' : 'Initial version', user, 'draft');
    _persist();
    return { ok: true };
  },
  submitForReview(id, user) {
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    a.status = 'in_review'; _touchArticle(a, user); _persist();
    return { ok: true };
  },
  publishArticle(id, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    a.status = 'published'; a.publishedAt = a.publishedAt || nowIso(); a.publishedSnapshot = deepClone(a);
    _touchArticle(a, user);
    _addRevision(store, 'article', id, deepClone(a), 'Published', user, 'published');
    store.lastPublishedAt = nowIso();
    _persist();
    return { ok: true };
  },
  scheduleArticle(id, whenIso, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    a.status = 'scheduled'; a.scheduledAt = whenIso; _touchArticle(a, user); _persist();
    return { ok: true };
  },
  unpublishArticle(id, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    a.status = 'draft'; _touchArticle(a, user); _persist();
    return { ok: true };
  },
  archiveArticle(id, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    a.status = 'archived'; _touchArticle(a, user); _persist();
    return { ok: true };
  },
  deleteArticle(id, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    store.articles = store.articles.filter((a) => a.id !== id); _persist();
    return { ok: true };
  },
  duplicateArticle(id, user) {
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    const copy = deepClone(a); copy.id = uid('art'); copy.title = 'Copy of ' + a.title; copy.slug = slugify(copy.title) + '-' + Math.floor(Math.random() * 900 + 100);
    copy.status = 'draft'; copy.publishedAt = null; copy.publishedSnapshot = null; copy.createdAt = nowIso(); copy.updatedAt = nowIso();
    store.articles.unshift(copy); _persist();
    return { ok: true, newId: copy.id };
  },
  restoreArticleRevision(id, revisionId, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load();
    const a = store.articles.find((x) => x.id === id); if (!a) return { ok: false };
    const rev = store.revisions.find((r) => r.id === revisionId); if (!rev) return { ok: false };
    const keep = { id: a.id, status: a.status, publishedAt: a.publishedAt, publishedSnapshot: a.publishedSnapshot, createdAt: a.createdAt };
    Object.assign(a, deepClone(rev.snapshot), keep);
    _touchArticle(a, user);
    _addRevision(store, 'article', id, deepClone(a), 'Restored from ' + fmtDateTime(rev.createdAt), user, 'draft');
    _persist();
    return { ok: true };
  },
  getArticleChecklist(a) { return computeArticleChecklist(a); },
  getArticleSeoIssues(a) { return computeSeoIssues('article', a.seo, { coverImageId: a.coverImageId, coverAlt: a.coverAlt }); },

  // ---- categories / authors (seeded + saved for Phase 2 editors) ----
  getCategories() { return deepClone(_load().categories); },
  saveCategory(cat, user) {
    const store = _load();
    const existing = store.categories.find((c) => c.id === cat.id);
    if (existing) Object.assign(existing, cat); else store.categories.push(Object.assign({ id: uid('cat') }, cat));
    _persist();
    return { ok: true };
  },
  getAuthors() { return deepClone(_load().authors); },
  saveAuthor(author, user) {
    const store = _load();
    const existing = store.authors.find((a) => a.id === author.id);
    if (existing) Object.assign(existing, author); else store.authors.push(Object.assign({ id: uid('auth') }, author));
    _persist();
    return { ok: true };
  },

  // ---- global content / design / seo (data ready; Phase-2 editors surface these) ----
  getGlobal() { return deepClone(_load().global); },
  saveGlobal(section, patch, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load(); Object.assign(store.global[section], patch); _persist();
    return { ok: true };
  },
  getDesign() { return deepClone(_load().design); },
  saveDesign(patch, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load(); Object.assign(store.design, patch); _persist();
    return { ok: true };
  },
  restoreDesignDefaults(user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load(); store.design = seedDesign(); _persist();
    return { ok: true };
  },
  getSeoGlobal() { return deepClone(_load().seoGlobal); },
  saveSeoGlobal(patch, user) {
    if (!user || user.role !== 'admin') return _forbidden();
    const store = _load(); Object.assign(store.seoGlobal, patch); _persist();
    return { ok: true };
  },

  // ---- revisions ----
  listRevisions(entityType, entityId) {
    return deepClone(_load().revisions.filter((r) => r.entityType === entityType && r.entityId === entityId));
  },
  listAllRevisions(limit) {
    const store = _load();
    return deepClone(store.revisions.slice(0, limit || 40));
  },
  restoreRevision(entityType, entityId, revisionId, user) {
    if (entityType === 'page') return this.restorePageRevision(entityId, revisionId, user);
    if (entityType === 'article') return this.restoreArticleRevision(entityId, revisionId, user);
    return { ok: false };
  },

  // ---- overview aggregates ----
  getOverviewStats() {
    const store = _load(); _linkCategories(store);
    const draftPages = store.pages.filter((p) => this.pageStatus(p) !== 'published');
    const scheduledArticles = store.articles.filter((a) => a.status === 'scheduled');
    let missingSeoCount = 0;
    store.pages.forEach((p) => { missingSeoCount += computeSeoIssues('page', p.seo, {}).length; });
    store.articles.forEach((a) => { missingSeoCount += computeSeoIssues('article', a.seo, { coverImageId: a.coverImageId, coverAlt: a.coverAlt }).length; });
    const mediaMissingAlt = store.media.filter((m) => !m.altText);
    const recentlyPublished = store.articles.filter((a) => a.status === 'published').sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, 5);
    const recentActivity = store.revisions.slice(0, 8);
    return {
      totalPages: store.pages.length,
      draftPages: deepClone(draftPages),
      scheduledArticles: deepClone(scheduledArticles),
      missingSeoCount,
      mediaMissingAlt: deepClone(mediaMissingAlt),
      recentlyPublished: deepClone(recentlyPublished),
      recentActivity: deepClone(recentActivity),
      lastPublishedAt: store.lastPublishedAt
    };
  }
};
