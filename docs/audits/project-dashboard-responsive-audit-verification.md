# Project Dashboard Responsive Audit — Final Verification Addendum

Verification date: 31 July–1 August 2026  
Target route: `http://127.0.0.1:3000/projects/proj-001`  
Parent report: `docs/audits/project-dashboard-responsive-audit.md`  
Mode: audit-only; no production component, style, route, data, or test file was changed

## 1. Verification verdict

All 15 findings in the parent report were reproduced or source-verified. None was downgraded, upgraded, or rejected. Content-stress testing promoted two of the six original suspected risks to confirmed defects and exposed five new P2 findings: `RSP-016` through `RSP-020`.

| Classification | Parent report | Final verification |
|---|---:|---:|
| Confirmed issues | 15 | 20 |
| P0 | 0 | 0 |
| P1 | 5 | 5 |
| P2 | 6 | 11 |
| P3 | 2 | 2 |
| P4 | 2 | 2 |
| Original suspected risks | 6 | 6 inventoried; 4 remain unresolved |

`RSP-005` remains P1, not P0. Pointer-positioned mouse-wheel and trackpad-equivalent input reached every overflowing left/feed/sidebar region tested. The content is therefore present and reachable with common pointer input. The P1 remains justified because the scroll owners are fragmented, their main scrollbars are hidden, empty/composer areas do not transfer scrolling, and Page Down, Space, and Arrow Down did not move the unfocused containers. Native Tab traversal is indeterminate because the in-app browser's Tab command did not advance focus during this run; this automation limitation is not reported as an application Tab failure.

## 2. Complete confirmed-issue inventory

### RSP-001 — Fixed Updates rail starves the primary project area

| Field | Verified evidence |
|---|---|
| Severity / category | P1 — responsive width hierarchy |
| Affected viewports | 1366×768, 1280×720; pressure begins at 1536×864 |
| Visible symptom | The secondary Updates rail becomes nearly as wide as the primary project area, compressing the gallery, statistics, and overview. |
| Immediate cause | The Updates column remains 440px in every two-column state. |
| Controlling cause | `.poc-wrapper { grid-template-columns: minmax(0, 1fr) 440px; gap: 24px; }` |
| Amplifying causes | 240px sidebar; `max-width:1320px` container inset; fixed 24px gap. |
| Exact component / source | `ProjectOverviewCard`; `features/documents/components/project-overview-card.tsx:316-838`; `app/globals.css:2522-2533` |
| Computed measurements | Main/Updates: 758/440px at 1536, 588/440px at 1366, 454/440px at 1280. Updates share: 36.01%, 41.83%, 47.93%. |
| Screenshot | `dashboard-1366x768-viewport.png`; `dashboard-1280x720-viewport.png`; `rsp-001-1280x720-main-vs-updates-crop.png` |
| Confidence / dependency | High. Independent width-allocation defect; amplifies `RSP-002`, `RSP-004`, and `RSP-007`. |

### RSP-002 — Statistics overflow into the Updates region

| Field | Verified evidence |
|---|---|
| Severity / category | P1 — technical overflow/layout |
| Affected viewports | 1440×900 (3px overflow), 1366×768, 1280×720 |
| Visible symptom | Later statistics extend beneath/cross toward Updates and require invisible horizontal scrolling. |
| Immediate cause | Five cards retain an approximately 665px intrinsic row width. |
| Controlling cause | `.project-stat-cards-bar { grid-template-columns: repeat(5, 1fr); }`; three columns activate only at viewport `max-width:1200px`. |
| Amplifying causes | `RSP-001` narrows the component; left scrollbar is suppressed. |
| Exact component / source | `ProjectStatCardsBar`; `features/documents/components/project-stat-cards-bar.tsx:22-87`; `app/globals.css:2555-2567` |
| Computed measurements | Left client/scroll: 662/665px at 1440, 588/665px at 1366, 454/665px at 1280. Horizontal range: 3, 77, and 211px. |
| Screenshot | `dashboard-1280x720-stats-horizontal-scroll.png`; `dashboard-1280x720-viewport.png`; `rsp-002-1280x720-stat-overflow-crop.png` |
| Confidence / dependency | High. Controlling defect is container/viewport mismatch; severity is amplified by `RSP-001` but not caused solely by it. |

### RSP-003 — The 1100px stack creates two undersized fixed rows

| Field | Verified evidence |
|---|---|
| Severity / category | P1 — stacked responsive composition |
| Affected viewports | 1024×768; reproduced at the 1101→1100 boundary |
| Visible symptom | The first row is shorter than its gallery; stats/overview are hidden in a nested scroll. Updates receives a 192px feed above the fixed composer. |
| Immediate cause | The grid becomes one column but keeps its fixed viewport-derived height and child height rules. |
| Controlling cause | `@media (max-width:1100px) { .poc-wrapper { grid-template-columns:1fr; } }` without a row/height/flow reset. |
| Amplifying causes | 421px gallery; left/right `height:100%`; right `max-height:400px`; fixed composer. |
| Exact component / source | `ProjectOverviewCard`; `app/globals.css:2522-2533`, `3032-3040`, `3080-3102` |
| Computed measurements | Wrapper 620px; computed grid rows 298px + 298px with 24px gap. Gallery 842×421px. Left 298/710px; feed 192/731px. |
| Screenshot | `dashboard-1024x768-viewport.png`; `dashboard-1024x768-left-scroll.png`; `dashboard-1024x768-feed-scroll.png`; `rsp-003-1024x768-stacked-rows-crop.png` |
| Confidence / dependency | High. Independent incomplete breakpoint override; worsened by `RSP-004` and `RSP-005`. |

### RSP-004 — Height-insensitive gallery pushes important content below short viewports

| Field | Verified evidence |
|---|---|
| Severity / category | P1 — viewport-height response |
| Affected viewports | 1280×720, 1024×768; pressure at 1366×768 |
| Visible symptom | Project Overview is not fully visible initially; at 1024, stats/overview begin below the short first grid row. |
| Immediate cause | Gallery retains a 340px minimum on short laptops and becomes 421px after stacking. |
| Controlling cause | Width-derived `aspect-ratio:16/8` combined with fixed `min-height`/`max-height`; no height-media-query behavior. |
| Amplifying causes | Fixed wrapper budget; stats and 16–20px section gaps; `RSP-003` stacked rows. |
| Exact component / source | `ProjectGalleryViewer`; `features/documents/components/gallery/project-gallery-viewer.tsx:12-73`; `app/globals.css:2928-2937`, `3012-3029`, `3043-3075` |
| Computed measurements | Gallery: 450×340px at 1280 (47.22% of viewport height); 842×421px at 1024 (54.82%). Overview bottom ≈783.5px at 1280×720. |
| Screenshot | `dashboard-1280x720-viewport.png`; `dashboard-1024x768-viewport.png`; `rsp-004-1280x720-height-pressure-crop.png` |
| Confidence / dependency | High. Independent height-policy defect; combines critically with `RSP-003` and `RSP-005`. |

### RSP-005 — Hidden, fragmented scroll ownership obscures reachable content

| Field | Verified evidence |
|---|---|
| Severity / category | P1 — usability/scroll architecture |
| Affected viewports | 1536×864 through 1024×768; left pane joins at 1280×720; sidebar joins at 1366/1280 |
| Visible symptom | Users must discover separate Updates, left-project, and sidebar scroll owners; scrolling over composer/empty space does nothing; the principal pane scrollbars are hidden. |
| Immediate cause | Descendants use `overflow:auto` while document, shell, workspace, wrapper, and right column clip overflow. |
| Controlling cause | Page-specific `:has(.poc-wrapper)` height/overflow lock transfers ownership into `.poc-left-column` and `.poc-sections-card`. |
| Amplifying causes | `scrollbar-width:none`; non-focusable containers; horizontal stat overflow; fixed composer. |
| Exact component / source | `MainWorkspace`, `ProjectOverviewCard`; `app/globals.css:31-38`, `88-100`, `833-856`, `2522-2551`, `3080-3102` |
| Computed measurements | At 1280: left 572/659px, feed 466/787px, sidebar 459/600px. At 1024: left 298/710px, feed 192/731px. Wheel/trackpad work only over the owning region; keyboard keys produced 0→0 without focus. |
| Screenshot | `dashboard-1024x768-left-scroll.png`; `dashboard-1024x768-feed-scroll.png`; `dashboard-1280x720-stats-horizontal-scroll.png`; `rsp-005-1024x768-hidden-scroll-crop.png` |
| Confidence / dependency | High for pointer reachability and hidden cues; Tab traversal indeterminate. Independent architecture defect that amplifies `RSP-002`–`RSP-004`. |

### RSP-006 — Breakpoint cliffs produce discontinuous layouts

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — responsive continuity |
| Affected viewports | Boundaries at 1320, 1160, 1100, and 1080px |
| Visible symptom | A one-pixel resize can remove 49px, add 183px, or switch the dashboard to the invalid fixed-height stack. |
| Immediate cause | Several large discrete changes occur at nearby independent thresholds. |
| Controlling cause | Container-width, sidebar JS/CSS, dashboard-stack, and heading rules have no shared minimum-content contract. |
| Amplifying causes | Fixed 440px Updates and fixed wrapper height. |
| Exact component / source | `AppShell`, `RoutePageContainer`, `ProjectOverviewCard`; `app/globals.css:882-888`, `1607-1627`, `3032-3040`; `components/layout/app-shell.tsx:64-77` |
| Computed measurements | 1321→1320: container 1055→1006px, left 543→494px. 1161→1160: sidebar 240→56px, left 335→518px. 1101→1100: two columns→two 298px stacked rows. |
| Screenshot | `dashboard-1366x768-viewport.png`; `dashboard-1280x720-viewport.png`; `dashboard-1024x768-viewport.png` |
| Confidence / dependency | High. Independent breakpoint-system defect; its visible severity depends on `RSP-001`/`RSP-003`. |

### RSP-007 — Gallery crop changes disproportionately

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — media/visual consistency |
| Affected viewports | 1366×768, 1280×720, 1024×768 |
| Visible symptom | The same image shifts from wide landscape to a severely cropped tall frame as the primary column narrows/stacks. |
| Immediate cause | `object-fit:cover` fills frames whose ratios are dominated by changing minimum heights. |
| Controlling cause | `.project-viewer-frame` aspect/min/max-height cascade. |
| Amplifying causes | `RSP-001` reduces width while height remains 340px; stack expands width and therefore aspect height. |
| Exact component / source | `ProjectGalleryViewer`; `features/documents/components/gallery/project-gallery-viewer.tsx:12-73`; `app/globals.css:2928-2945`, `3012-3029`, `3043-3075` |
| Computed measurements | 1138×460 at 1920; 450×340 at 1280; 842×421 at 1024. `object-fit:cover`; no geometric distortion. |
| Screenshot | `dashboard-1920x1080-viewport.png`; `dashboard-1280x720-viewport.png`; `dashboard-1024x768-viewport.png` |
| Confidence / dependency | High. Crop defect is independent; amount is amplified by `RSP-001` and `RSP-003`. |

### RSP-008 — Interactive targets are below the requested 40×40px target

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — usability/accessibility |
| Affected viewports | All; most consequential at 1024 tablet width |
| Visible symptom | Dense toolbars and overlays expose small pointer/touch targets. |
| Immediate cause | Direct small width, height, and padding values. |
| Controlling cause | The compact desktop control system has no coarse-pointer/tablet hit-area mode. |
| Amplifying causes | Controls cluster tightly in gallery, heading, top bar, cards, and composer. |
| Exact component / source | Shared shell/project controls; `app/globals.css:274-285`, `757-770`, `923-935`, `2964-2976`, `3489-3499`, `3623-3635`, `3830-3841`, `4024-4034`, `4144-4157` |
| Computed measurements | Gallery buttons 26×26px; title/top controls 28×28px; send 32×32px; sidebar rows 32px high. |
| Screenshot | `dashboard-1280x720-viewport.png`; `dashboard-1024x768-viewport.png` |
| Confidence / dependency | High against the requested ~40px audit threshold. Independent. |

### RSP-009 — Composer textarea suppresses its focus indicator

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — keyboard accessibility |
| Affected viewports | All |
| Visible symptom | Focused textarea has no border, outline, shadow, or focus-within replacement. |
| Immediate cause | Base and focus selectors set all indicators to `none !important`. |
| Controlling cause | Page CSS overrides the global focus-visible rule. |
| Amplifying causes | White textarea sits within a white card; no alternate state cue. |
| Exact component / source | Update composer; `features/documents/components/project-overview-card.tsx:759-773`; `app/globals.css:68-73`, `3414-3434` |
| Computed measurements | Border 0; outline `none`; box-shadow `none` in focused source/computed state. |
| Screenshot | `dashboard-1280x720-viewport.png` (location only; static screenshot cannot display the focus-state failure) |
| Confidence / dependency | High. Independent. |

### RSP-010 — Update date text fails normal-text contrast

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — accessibility/visual consistency |
| Affected viewports | All |
| Visible symptom | Small blue dates are weak against the white update card. |
| Immediate cause | Hard-coded `#3B82F6` is used for regular text on white. |
| Controlling cause | `.post-date` color rule. |
| Amplifying causes | 12.5px regular-weight text. |
| Exact component / source | Update post metadata; `features/documents/components/project-overview-card.tsx:523-595`; `app/globals.css:3987-3990` |
| Computed measurements | Contrast ≈3.68:1 against white; below 4.5:1 normal-text target. |
| Screenshot | `dashboard-1920x1080-viewport.png`; `dashboard-1280x720-viewport.png` |
| Confidence / dependency | High. Independent. |

### RSP-011 — Composer controls have incomplete accessible naming

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — form labelling/accessibility |
| Affected viewports | All |
| Visible symptom | Textarea depends on disappearing placeholder copy; compact upload/audience controls lack durable purpose-oriented labels. |
| Immediate cause | No associated `<label>`/`aria-label` for the textarea; title/value shorthand is used for other controls. |
| Controlling cause | Composer markup. |
| Amplifying causes | Several instructions are compressed into one placeholder line. |
| Exact component / source | Update composer; `features/documents/components/project-overview-card.tsx:758-829` |
| Computed measurements | Placeholder 13.5px/20.25px; textarea is 45px high in the baseline. Accessibility naming is a DOM fact rather than a geometry value. |
| Screenshot | `dashboard-1280x720-viewport.png` |
| Confidence / dependency | High for the missing persistent textarea label; title announcement behavior can vary by assistive technology. Independent. |

### RSP-012 — Sidebar invitation copy clips by approximately 2px

| Field | Verified evidence |
|---|---|
| Severity / category | P3 — minor text clipping |
| Affected viewports | Expanded-sidebar states (1920 through 1280) |
| Visible symptom | “Bring your studio into one workspace.” exceeds its single-line text box. |
| Immediate cause | Rendered text is slightly wider than the fixed inner box. |
| Controlling cause | Fixed sidebar/card inner width and non-wrapping copy. |
| Amplifying causes | Loaded Hanken font metrics. |
| Exact component / source | `SidebarExpanded`; `components/layout/sidebar-expanded.tsx:99-108`; `.invite-banner-card/.invite-banner-text` at `app/globals.css:337-380` |
| Computed measurements | Text `scrollWidth 169px`, `clientWidth 167px`. |
| Screenshot | `dashboard-1280x720-viewport.png`; `dashboard-1920x1080-viewport.png` |
| Confidence / dependency | High, low impact. Independent. |

### RSP-013 — Project styling bypasses shared tokens

| Field | Verified evidence |
|---|---|
| Severity / category | P3 — theming/visual-system consistency |
| Affected viewports | All |
| Visible symptom | Project cards, labels, statuses, controls, and composer use many direct values despite root tokens. |
| Immediate cause | Direct hex colors and dimensions are repeated in page CSS and stat data. |
| Controlling cause | Legacy Documents-owned surface is styled in the monolithic global stylesheet. |
| Amplifying causes | Light-only `color-scheme`; no semantic theme mapping for this surface. |
| Exact component / source | `ProjectOverviewCard`, `ProjectStatCardsBar`; `app/globals.css:3-24`, `2522-4162`; corresponding feature files |
| Computed measurements | Geometry remains stable but token coverage is source-level; no meaningful single computed number applies. |
| Screenshot | `dashboard-1920x1080-viewport.png`; all baseline screenshots |
| Confidence / dependency | High. Independent maintainability/design-system defect. |

### RSP-014 — Duplicate media-banner rules conflict

| Field | Verified evidence |
|---|---|
| Severity / category | P4 — duplicate CSS/future responsive risk |
| Affected viewports | All update cards with media |
| Visible symptom | Earlier aspect/min/max sizing is silently replaced by a later fixed height. |
| Immediate cause | `.post-media-banner` is declared twice with incompatible sizing models. |
| Controlling cause | Cascade order makes the later `height:145px` rule authoritative. |
| Amplifying causes | Declarations are separated by ~946 lines in a global stylesheet. |
| Exact component / source | Update media; `features/documents/components/project-overview-card.tsx:563-577`; `app/globals.css:3104-3114`, `4050-4058` |
| Computed measurements | Rendered update image frame is 440×145px at 1280 for baseline, 240×960 portrait, and 1800×240 wide sources. |
| Screenshot | `dashboard-1280x720-viewport.png`; `rsp-019-1280x720-unbroken-update.png` (same media contract visible) |
| Confidence / dependency | High. Independent CSS duplication; it controls the media part of `SR-04` stress behavior. |

### RSP-015 — Route/tab ownership is disconnected from the rendered composition

| Field | Verified evidence |
|---|---|
| Severity / category | P4 — component/route structure |
| Affected routes | Project base/overview/updates route family |
| Visible symptom | `activeTab` is accepted but unused; Updates remains embedded in an 838-line overview component. |
| Immediate cause | Workspace mounts the same `ProjectOverviewCard` independent of the tab prop. |
| Controlling cause | Route semantics and feature/render ownership are not aligned. |
| Amplifying causes | Mock data and page CSS are co-located in Documents/global styling. |
| Exact component / source | `ProjectDetailWorkspace`; `features/projects/project-detail-workspace.tsx:18-80`; `ProjectOverviewCard` at `features/documents/components/project-overview-card.tsx:316-838` |
| Computed measurements | No geometry value applies; source trace confirms one identical dashboard composition. |
| Screenshot | `dashboard-1920x1080-viewport.png` |
| Confidence / dependency | High as a structural fact; intended route behavior requires product confirmation. Independent of current geometry. |

### RSP-016 — Long project title pushes heading actions off-screen

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — content resilience/heading overflow |
| Affected viewports | Confirmed at 1280×720; risk increases below 1280 until the 1080 heading breakpoint |
| Visible symptom | A long title stays on one line, extends beyond the heading, and pushes Task/Drive/BOQ/Finance/Site actions beyond the viewport. |
| Immediate cause | `.page-heading-title { flex-shrink:0; }`; title/actions do not wrap. |
| Controlling cause | Fixed no-shrink title group inside a single-row heading. |
| Amplifying causes | 393.63px action group; 24px heading gap; narrow center created by sidebar/container rules. |
| Exact component / source | `RoutePageContainer`; `components/ui/route-page-container.tsx:48-64`; `app/globals.css:890-914`, `943-972` |
| Computed measurements | Title group ≈984.83px from x=281 to 1265.83; heading ends x=1199. Actions shift to x≈1281.83–1675.45. Heading remains 36px rather than wrapping. |
| Screenshot | `rsp-016-1280x720-long-project-title.png` |
| Confidence / dependency | High. New independent content-resilience defect; confirms/promotes original `SR-02`. |

### RSP-017 — Long breadcrumbs overlap search and top-bar actions

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — content resilience/top-bar collision |
| Affected viewports | Confirmed at 1280×720; applicable while breadcrumbs and search remain visible above 900px |
| Visible symptom | Long breadcrumb labels draw through the search pill and right-side top-bar actions. |
| Immediate cause | Breadcrumb flex row is `white-space:nowrap` with no truncation or bounded flex contract. |
| Controlling cause | `.topbar-breadcrumbs` and top-bar grid allocation. |
| Amplifying causes | Search remains visible until 900px; all labels were lengthened together. |
| Exact component / source | `TopBar`; `components/layout/top-bar.tsx:260-264`; `app/globals.css:607-625`, `628-674`, `1653-1660` |
| Computed measurements | Breadcrumbs width 853.72px, x=347–1200.72; search x≈778.64–979.97 and actions x≈995.97–1255 overlap. |
| Screenshot | `rsp-017-1280x720-long-breadcrumbs.png` |
| Confidence / dependency | High. New independent content-resilience defect. |

### RSP-018 — Long workspace name is substantially clipped

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — identity/context truncation |
| Affected viewports | Confirmed in every expanded 240px sidebar state |
| Visible symptom | Long provider/studio identity collapses to a short ellipsis, hiding most of the workspace name. |
| Immediate cause | Single-line `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`. |
| Controlling cause | Fixed workspace selector/sidebar width. |
| Amplifying causes | Avatar and chevron reduce available text width to 146px. |
| Exact component / source | `SidebarExpanded`; `components/layout/sidebar-expanded.tsx:50-62`; `app/globals.css:229-243` |
| Computed measurements | Workspace name `clientWidth 146px`, `scrollWidth 345px`; 199px is not exposed visually. |
| Screenshot | `rsp-018-1280x720-long-workspace.png` |
| Confidence / dependency | High. New independent content-resilience defect. |

### RSP-019 — Unbroken update text creates extreme horizontal feed overflow

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — user-content overflow |
| Affected viewports | Confirmed at 1280×720; applies to all 440px Updates states and stacked Updates |
| Visible symptom | A long token runs horizontally out of the post, expanding the feed's scroll width far beyond the rail. |
| Immediate cause | Post text has no `overflow-wrap`, `word-break`, or equivalent long-token containment. |
| Controlling cause | `.post-content-text` only defines typography/margin; `.poc-sections-card` permits overflow scrolling. |
| Amplifying causes | Fixed 440px rail; hidden scrollbar; arbitrary provider-generated content. |
| Exact component / source | Update post; `features/documents/components/project-overview-card.tsx:559-560`; `app/globals.css:3091-3102`, `4042-4047` |
| Computed measurements | Post and feed `clientWidth 440px`, `scrollWidth 2909px`. |
| Screenshot | `rsp-019-1280x720-unbroken-update.png` |
| Confidence / dependency | High. New independent containment defect; confirms part of original `SR-04`. |

### RSP-020 — Multiline composer draft is internally clipped/scrolling

| Field | Verified evidence |
|---|---|
| Severity / category | P2 — form content resilience |
| Affected viewports | Confirmed at 1280×720; composer geometry is shared across tested widths |
| Visible symptom | A four-line draft remains in a two-row, non-resizable textarea; only part of the draft is visible and the textarea gains its own unindicated scroll. |
| Immediate cause | `rows={2}` plus `resize:none`; no content-driven auto-growth. |
| Controlling cause | Fixed/non-shrinking composer card and textarea contract. |
| Amplifying causes | Composer already competes with the feed at 1024; hidden/unstyled internal textarea scrolling. |
| Exact component / source | Update composer; `features/documents/components/project-overview-card.tsx:759-773`; `app/globals.css:3305-3311`, `3401-3426` |
| Computed measurements | Textarea `clientHeight 45px`, `scrollHeight 85px`, four value lines; composer remains 106.5px high. |
| Screenshot | `rsp-020-1280x720-multiline-composer.png` |
| Confidence / dependency | High. New independent composer defect; confirms part of original `SR-04` and amplifies `RSP-005` at 1024. |

## 3. Complete original suspected-risk inventory

The six original risks are retained below for traceability. `SR-02` and `SR-04` are no longer unresolved risks: runtime content variation promoted them into `RSP-016`, `RSP-019`, and `RSP-020`.

### SR-01 — Odin-open center compression

| Field | Verification |
|---|---|
| Severity / category | Suspected risk — shell width allocation |
| Affected viewports | Widths above 1160px when Odin is open |
| Symptom / cause chain | Optional fixed 340px Odin column is added beside the 240px sidebar and fixed 440px Updates rail, potentially leaving an unusable center. |
| Exact component / source / rule | `AppShell`; `components/layout/app-shell.tsx`; `app/globals.css:107-115`; optional three-column shell rule |
| Measurements / screenshot | Odin closed during the required matrix, so no valid rendered width/screenshot exists. CSS reserve is 340px. |
| Confidence / dependency / status | Medium; depends on Odin-open product state and combines with `RSP-001`. Unresolved. |

### SR-02 — Long/localized project names collide with heading actions

| Field | Verification |
|---|---|
| Severity / category | Historical risk, promoted to P2 `RSP-016` |
| Affected viewports | Confirmed at 1280×720 |
| Symptom / cause chain | Long title cannot shrink/wrap and pushes actions beyond the viewport. |
| Exact component / source / rule | `RoutePageContainer`; `components/ui/route-page-container.tsx:48-64`; `app/globals.css:890-914`, `943-972` |
| Measurements / screenshot | Title group ≈984.83px; actions end ≈x1675.45 in a 1280px viewport; `rsp-016-1280x720-long-project-title.png`. |
| Confidence / dependency / status | High; independent. Confirmed and removed from unresolved-risk count. |

### SR-03 — Web-font fallback metric drift

| Field | Verification |
|---|---|
| Severity / category | Suspected risk — typography/loading |
| Affected viewports | All devices during font failure/fallback |
| Symptom / cause chain | Fallback metrics could change clipping/wrapping even though the settled web-font run is stable. |
| Exact component / source / rule | Global font import/family; `app/globals.css:1`, root/body font rules |
| Measurements / screenshot | Every tested viewport reported `document.fonts.status=loaded`, intended Hanken checks true, DPR 1, zoom 100%. No fallback screenshot was forced. |
| Confidence / dependency / status | Low-to-medium; depends on network/font failure. Unresolved. |

### SR-04 — Variable Updates content increases hidden-scroll burden

| Field | Verification |
|---|---|
| Severity / category | Historical risk, partly promoted to P2 `RSP-019` and `RSP-020` |
| Affected viewports | Confirmed at 1280×720; scroll burden also applies at 1536 through 1024 |
| Symptom / cause chain | Long tokens escape horizontally; multiline drafts clip internally; long/many posts greatly expand feed scroll height. |
| Exact component / source / rule | Embedded Updates/composer; `project-overview-card.tsx:523-834`; `app/globals.css:3091-3102`, `3305-3438`, `4042-4058` |
| Measurements / screenshot | Unbroken text 440/2909px; 12 updates 466/3892px; four-line textarea 45/85px. Screenshots `rsp-019...` and `rsp-020...`. |
| Confidence / dependency / status | High for confirmed sub-failures. Promoted; long/many normal paragraphs remain an amplifier rather than a separate defect. |

### SR-05 — Mobile guard is a product gap if phone work is required

| Field | Verification |
|---|---|
| Severity / category | Suspected risk — product/responsive scope |
| Affected viewports | Below 640px |
| Symptom / cause chain | `MobileScreenGuard` prevents access to the application surface. |
| Exact component / source / rule | `MobileScreenGuard`; `app/globals.css:1812-1844`; guard breakpoint `max-width:639px` |
| Measurements / screenshot | Required matrix stops at 1024px; no phone-layout screenshot is claimed. |
| Confidence / dependency / status | High that the guard exists; severity depends entirely on approved phone-support policy. Unresolved. |

### SR-06 — No dedicated multi-viewport regression gate

| Field | Verification |
|---|---|
| Severity / category | Suspected risk — testing/regression control |
| Affected viewports | All responsive boundaries |
| Symptom / cause chain | Breakpoint and content failures can recur without repeatable route-specific multi-viewport assertions/screenshots. |
| Exact component / source / rule | Repository test inventory; no production test was changed in this audit-only task. |
| Measurements / screenshot | This audit generated six required live viewport measurements and evidence, but that temporary process is not a repository regression gate. |
| Confidence / dependency / status | Medium-high. Unresolved; independent process risk. |

## 4. Scroll-ownership verification

Method: for each region, scrolling was reset, the pointer was positioned over the named target, and one 420px mouse-wheel input plus four 55px trackpad-equivalent wheel inputs were sent separately. Page Down, Space, and Arrow Down were also sent separately. `clientHeight/scrollHeight` refers to the effective owning element when a child delegates to `.poc-left-column`; otherwise it refers to the named selector. `left`, `feed`, and `sidebar` in transitions identify the element whose `scrollTop` changed.

The in-app browser's Tab command did not advance focus after repeated attempts. Therefore “Tab then keyboard scroll” is recorded as **indeterminate**, not failed. The scroll containers themselves have no `tabindex`; Page Down, Space, and Arrow Down did not scroll them without focus.

### 1920×1080

| Region / selector | `overflow-y`; client/scroll | Mouse wheel | Trackpad eq. | PgDn / Space / ArrowDown | Scrollbar / recognisable | Focus requirement |
|---|---|---|---|---|---|---|
| Gallery `.project-viewer-frame` | hidden; 460/460 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | No scroll range |
| Statistics `.project-stat-cards-bar` | visible; 50/50 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | No scroll range |
| Overview `.project-overview-section` | visible; 143/143 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | No scroll range |
| Updates `.poc-sections-card` | auto; 826/826 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | hidden / no | No scroll range |
| Composer `.update-input-card` | visible; 105/105 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Empty `.poc-wrapper` | hidden; 932/932 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Sidebar `.sidebar-scrollable` | auto; 819/819 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | No scroll range |

### 1536×864

| Region / selector | `overflow-y`; client/scroll | Mouse wheel | Trackpad eq. | PgDn / Space / ArrowDown | Scrollbar / recognisable | Focus requirement |
|---|---|---|---|---|---|---|
| Gallery `.project-viewer-frame` | hidden; 377/377 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Statistics `.project-stat-cards-bar` | visible; 50/50 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Overview `.project-overview-section` | visible; 164/164 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Updates `.poc-sections-card` | auto; 610/787 | feed 0→177 | feed 0→177 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Composer `.update-input-card` | visible; 105/105 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Empty `.poc-wrapper` | hidden; 716/716 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Sidebar `.sidebar-scrollable` | auto; 603/603 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | No scroll range |

### 1440×900

| Region / selector | `overflow-y`; client/scroll | Mouse wheel | Trackpad eq. | PgDn / Space / ArrowDown | Scrollbar / recognisable | Focus requirement |
|---|---|---|---|---|---|---|
| Gallery `.project-viewer-frame` | hidden; 360/360 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Statistics `.project-stat-cards-bar` | visible; 63/63 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Overview `.project-overview-section` | visible; 164/164 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Updates `.poc-sections-card` | auto; 646/787 | feed 0→141 | feed 0→141 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Composer `.update-input-card` | visible; 105/105 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Empty `.poc-wrapper` | hidden; 752/752 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Sidebar `.sidebar-scrollable` | auto; 639/639 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | No scroll range |

Vertical range is zero in the left pane, but the same pane has a hidden 3px horizontal range caused by the statistics row.

### 1366×768

| Region / selector | `overflow-y`; client/scroll | Mouse wheel | Trackpad eq. | PgDn / Space / ArrowDown | Scrollbar / recognisable | Focus requirement |
|---|---|---|---|---|---|---|
| Gallery `.project-viewer-frame` | hidden; 340/340 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Statistics `.project-stat-cards-bar` | visible; 63/63 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Overview `.project-overview-section` | visible; 164/164 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Updates `.poc-sections-card` | auto; 514/787 | feed 0→273 | feed 0→220 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Composer `.update-input-card` | visible; 105/105 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Empty `.poc-wrapper` | hidden; 620/620 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Sidebar `.sidebar-scrollable` | auto; 507/600 | sidebar 0→93 | sidebar 0→93 | 0→0 / 0→0 / 0→0 | visible / yes | Pointer wheel works; container not focusable |

The left pane has no vertical range but has a hidden 77px horizontal range caused by statistics.

### 1280×720

| Region / selector | `overflow-y`; client/scroll | Mouse wheel | Trackpad eq. | PgDn / Space / ArrowDown | Scrollbar / recognisable | Focus requirement |
|---|---|---|---|---|---|---|
| Gallery → `.poc-left-column` | auto; 572/659 | left 0→87 | left 0→87 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Statistics → `.poc-left-column` | auto; 572/659 | left 0→87 | left 0→87 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Overview → `.poc-left-column` | auto; 572/659 | left 87→0 | left 87→0 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Updates `.poc-sections-card` | auto; 466/787 | feed 0→321 | feed 0→220 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Composer `.update-input-card` | visible; 105/105 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Empty `.poc-wrapper` | hidden; 572/572 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Sidebar `.sidebar-scrollable` | auto; 459/600 | sidebar 0→141 | sidebar 0→141 | 0→0 / 0→0 / 0→0 | visible / yes | Pointer wheel works; container not focusable |

The same left owner also has a hidden 211px horizontal range.

### 1024×768

| Region / selector | `overflow-y`; client/scroll | Mouse wheel | Trackpad eq. | PgDn / Space / ArrowDown | Scrollbar / recognisable | Focus requirement |
|---|---|---|---|---|---|---|
| Gallery → `.poc-left-column` | auto; 298/710 | left 0→412 | left 0→220 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Statistics → `.poc-left-column` | auto; 298/710 | left 347→0 | left 347→127 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Overview → `.poc-left-column` | auto; 298/710 | left 412→0 | left 412→192 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Updates `.poc-sections-card` | auto; 192/731 | feed 0→420 | feed 0→220 | 0→0 / 0→0 / 0→0 | hidden / no | Pointer wheel works; container not focusable |
| Composer `.update-input-card` | visible; 105/105 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Empty `.poc-wrapper` | hidden; 620/620 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | N/A |
| Sidebar rail `.sidebar--rail` | hidden; 750/750 | none 0→0 | none 0→0 | 0→0 / 0→0 / 0→0 | none / no | No scroll range |

The wheel results establish technical reachability, but the ownership remains unreliable as a discoverable interaction model: scroll over composer or dashboard gap yields no transfer, the document cannot recover content, and keyboard scrolling did not engage an unfocused nested owner.

## 5. Verification of `height: calc(100vh - 148px)`

Source: `app/globals.css:2530-2531`.

There is no token, comment, or component contract defining “148px.” It is a magic composite literal. The nearest inferable design arithmetic is:

`56 shell/top-bar offset + 16 container top padding + 36 route heading + 16 heading margin + 24 assumed lower reserve = 148px`.

That is not the current rendered arithmetic. The actual wide-layout reserve to the container content bottom is:

`57 workspace/top-bar boundary + 16 top padding + 36 heading + 16 heading margin + 16 bottom padding = 141px`.

At 1024, the heading breakpoint reduces the rendered heading to 29px, so the same measured reserve becomes 134px. The top-bar breadcrumbs are 17px high *inside* the 48px top bar and do not add a separate vertical row; likewise, the 22px project title is inside the route-heading box. The top-bar's border/subpixel positioning is included in the rendered 48px/57px boundary measurements.

| Viewport | Top bar | Workspace top | Route heading | Heading margin | Container top/bottom padding | Wrapper top | Wrapper height (`vh-148`) | Actual reserve | Actual−148 | Wrapper end vs content bottom |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1920×1080 | 48 | 57 | 36 | 16 | 16/16 | 125 | 932 | 141 | −7 | 8px spare |
| 1536×864 | 48 | 57 | 36 | 16 | 16/16 | 125 | 716 | 141 | −7 | 8px spare |
| 1440×900 | 48 | 57 | 36 | 16 | 16/16 | 125 | 752 | 141 | −7 | 8px spare |
| 1366×768 | 48 | 57 | 36 | 16 | 16/16 | 125 | 620 | 141 | −7 | 8px spare |
| 1280×720 | 48 | 57 | 36 | 16 | 16/16 | 125 | 572 | 141 | −7 | 8px spare |
| 1024×768 | 48 | 57 | 29 | 16 | 16/16 | 118 | 620 | 134 | −14 | 15px spare |

Current baseline content therefore does **not** prove that 148 under-budgets the surrounding chrome; it over-reserves by 7px on the five wide states and 14px at 1024. The defect is that the wrapper uses an undocumented viewport literal while its internal tracks and gallery remain fixed. Text wrapping can invalidate the assumption, but the long-title test revealed a different failure first: the title refuses to wrap and escapes horizontally (`RSP-016`). The 1080 heading breakpoint changes the arithmetic even with baseline copy.

## 6. Breakpoint collision matrix

“Main owner” below describes the intended/effective project-content owner when content exceeds the track. Below 640, the guard blocks access, so underlying shell behavior is informational only.

| Width range | Sidebar | Search / breadcrumbs | Dashboard / Updates | Stats | Heading | Gallery rule | Main / Updates owner | Known failure |
|---|---|---|---|---|---|---|---|---|
| >1400 | Expanded 240 | Search + breadcrumbs visible | 2 columns / 440px | 5 | Row, 36px | 16/8; min360, max460 | Left if needed / feed | Updates share already 27–36%; nested feed begins at 1536 height |
| 1321–1400 | Expanded 240 | Both visible | 2 / 440px | 5 | Row | min340, max460 | Left if needed / feed | Crop shifts; stats near intrinsic limit by 1366 |
| 1201–1320 | Expanded 240; extra container inset | Both visible | 2 / 440px | **5** | Row | min340 | Left / feed | Invalid combination: 1280 left=454px, Updates=440px, stats need665px (`RSP-001/002`) |
| 1161–1200 | Expanded 240; extra inset | Both visible | 2 / 440px | 3 | Row | min340 | Left / feed | Still extremely narrow left column before sidebar releases |
| 1101–1160 | Rail 56 | Both visible | 2 / 440px | 3 | Row | min340 | Left / feed | Abrupt 183px release at 1160; fixed Updates remains |
| 1081–1100 | Rail 56 | Both visible | **1 column** / full-width, max-height400 | 3 | Row | min340 | Two fixed child scrolls / feed | Invalid stack: two auto rows inside `vh-148` (`RSP-003`) |
| 901–1080 | Rail 56 | Both visible | 1 / full-width, max-height400 | 3 | Column/auto height | min340 | Left / feed | Heading arithmetic changes; 1024 produces 298px rows and 421px gallery |
| 761–900 | Rail 56 | Search hidden; breadcrumbs visible | 1 / full-width | 3 | Column | min340 | Left / feed | Extra container top padding adds vertical pressure; fixed rows persist |
| 721–760 | Rail 56 | Search + breadcrumbs hidden | 1 / full-width | 3 | Column | min340 | Left / feed | Navigation context removed; fixed rows persist |
| 640–720 | Rail 56 | Search + breadcrumbs hidden | 1 / full-width | 3 | Column | 16/9; min280 | Left / feed | Narrow tablet remains internally scrolling; app still visible only at 640+ |
| 621–639 | Guard blocks app; rail underneath | Hidden | Underlying 1 column | 3 | Column | min280 | Not user-accessible | `MobileScreenGuard` and shell rules overlap |
| 601–620 | Guard; underlying sidebar hidden/one-column shell | Hidden | Underlying 1 column | 3 | Column | min280 | Not user-accessible | Guard masks another shell re-composition at 620 |
| ≤600 | Guard; underlying sidebar hidden | Hidden | Underlying 1 column | 1 | Column | min280 | Not user-accessible | Guard masks stats one-column rule |

Additional relevant breakpoints discovered: 1400 (gallery height), 760 (breadcrumbs/rail details), 720 (gallery ratio/minimum), 639 (mobile guard), 620 (one-column shell), and 600 (one-column stats). The poorest active combinations are 1201–1320, 1081–1100, and 901–1080.

## 7. Rendered component-width measurements

All figures below are rendered bounding boxes at DPR 1 and 100% browser zoom, not inferred CSS values.

| Viewport | Sidebar | Centre shell | Dashboard | Left | Updates | Gap | Updates % | Main % | L/R padding | Gallery | Stats grid | Individual stat widths |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1920×1080 | 240 | 1656 | 1606 | 1142 | 440 | 24 | 27.40% | 71.11% | 24/24 | 1138×460 | 1138 | 219.59, 219.59, 219.61, 219.59, 219.61 |
| 1536×864 | 240 | 1272 | 1222 | 758 | 440 | 24 | 36.01% | 62.03% | 24/24 | 754×377 | 754 | 142.80, 142.80, 142.80, 142.80, 142.81 |
| 1440×900 | 240 | 1176 | 1126 | 662 | 440 | 24 | 39.08% | 58.79% | 24/24 | 658×360 | 658 | 138.14, 121.66, 126.28, 114.53, 124.64 |
| 1366×768 | 240 | 1102 | 1052 | 588 | 440 | 24 | 41.83% | 55.89% | 24/24 | 584×340 | 584 | 138.14, 121.66, 126.28, 114.53, 124.64 |
| 1280×720 | 240 | 1016 | 918 | 454 | 440 | 24 | 47.93% | 49.46% | 24/24 | 450×340 | 450 | 138.14, 121.66, 126.28, 114.53, 124.64 |
| 1024×768 | 56 | 944 | 846 | 846 | 846 | 24 | 100%* | 100%* | 24/24 | 842×421 | 842 | 274, 274, 274, 274, 274 |

\* At 1024 the two regions are stacked, so each is 100% of dashboard width rather than simultaneous shares. The individual 1024 statistics are three per row; all five measured 274px wide.

## 8. Content-variation verification

Method: a temporary, non-hydrated DOM snapshot of the live 1280×720 route was served from `public/__audit-project-dashboard-harness.html`. Only the named text/value/image nodes were varied; the same compiled stylesheet and rendered component DOM were retained. The temporary harness was removed after measurement and screenshots. A 1024 snapshot was discarded because the non-hydrated conditional sidebar DOM did not represent the live React state; no conclusion below relies on it.

| Variation | Rendered result at 1280×720 | Disposition |
|---|---|---|
| Very long project title | No wrap; title group ≈984.83px crosses heading right x=1199; actions end ≈x1675.45 | New `RSP-016` |
| Long breadcrumbs | 853.7px wide, x=347–1200.7; overlaps both search and actions | New `RSP-017` |
| Long workspace name | 146px client / 345px scroll width; heavily ellipsized | New `RSP-018` |
| Long navigation label | Wraps to approximately 34px row content height; no horizontal overflow | Amplifier: increases sidebar density/scroll burden, not separate defect |
| Long client name | Left client/scroll becomes 454/809px; client card expands to 266px | Amplifies `RSP-002` |
| Five-digit built-up area | Left client/scroll becomes 454/673px; area card 132px | Amplifies `RSP-002` |
| Large budget | Left client/scroll becomes 454/699px; budget card 146px | Amplifies `RSP-002` |
| Long unbroken update | Post and feed 440px client / 2909px scroll width | New `RSP-019` |
| Several paragraphs | Post height 113px; feed 466/862px | Existing feed contains it; amplifies `RSP-005` only |
| Portrait image | Natural 240×960 renders in 440×145 cover frame | No distortion/new layout failure; extreme crop confirms `RSP-014`/crop policy concern |
| Very wide image | Natural 1800×240 renders in 440×145 cover frame | No distortion/new layout failure; extreme crop confirms `RSP-014`/crop policy concern |
| No updates | Feed 466/466px, count 0; composer stays positioned | Structure stable; injected empty copy is not proof of a production empty-state contract |
| Ten or more updates | 12 cards; feed 466/3892px | Contained vertically; substantially amplifies hidden-feed scrolling |
| Multiline composer draft | Four lines; textarea 45/85px; composer stays 106.5px | New `RSP-020` |
| Expanded Project Overview | `aria-expanded=true`; overview 219.8px; baseline was already expanded | No new failure beyond existing left-scroll pressure |

New content-stress screenshots: `rsp-016-1280x720-long-project-title.png`, `rsp-017-1280x720-long-breadcrumbs.png`, `rsp-018-1280x720-long-workspace.png`, `rsp-019-1280x720-unbroken-update.png`, and `rsp-020-1280x720-multiline-composer.png`.

## 9. Typography verification

Notation is `font-size / line-height`; `normal` is the browser's computed keyword. Values were identical at every viewport unless marked unavailable. Weight and letter spacing were also stable.

| Element | 1920×1080 | 1536×864 | 1440×900 | 1366×768 | 1280×720 | 1024×768 | Weight / tracking |
|---|---|---|---|---|---|---|---|
| Sidebar navigation | 13/normal | 13/normal | 13/normal | 13/normal | 13/normal | Not mounted (rail) | 500 / normal |
| Sidebar section label | 10.5/normal | 10.5/normal | 10.5/normal | 10.5/normal | 10.5/normal | Not mounted (rail) | 600 / 0.315px |
| Breadcrumbs | 13/normal | 13/normal | 13/normal | 13/normal | 13/normal | 13/normal | 400 / normal |
| Project title | 22/22 | 22/22 | 22/22 | 22/22 | 22/22 | 22/22 | 700 / −0.55px |
| Header actions | 13/normal | 13/normal | 13/normal | 13/normal | 13/normal | 13/normal | 500 / normal |
| Statistics labels | 11.5/13.8 | 11.5/13.8 | 11.5/13.8 | 11.5/13.8 | 11.5/13.8 | 11.5/13.8 | 500 / normal |
| Statistics values | 13.5/16.2 | 13.5/16.2 | 13.5/16.2 | 13.5/16.2 | 13.5/16.2 | 13.5/16.2 | 700 / normal |
| Overview heading | 12/normal | 12/normal | 12/normal | 12/normal | 12/normal | 12/normal | 700 / 0.6px |
| Overview body | 13/21.45 | 13/21.45 | 13/21.45 | 13/21.45 | 13/21.45 | 13/21.45 | 400 / normal |
| Update author | 13/normal | 13/normal | 13/normal | 13/normal | 13/normal | 13/normal | 700 / normal |
| Update metadata | 12/normal | 12/normal | 12/normal | 12/normal | 12/normal | 12/normal | 400 / normal |
| Update body | 13/18.85 | 13/18.85 | 13/18.85 | 13/18.85 | 13/18.85 | 13/18.85 | 400 / normal |
| Update actions | 12.5/normal | 12.5/normal | 12.5/normal | 12.5/normal | 12.5/normal | 12.5/normal | 500 / normal |
| Composer placeholder | 13.5/20.25 | 13.5/20.25 | 13.5/20.25 | 13.5/20.25 | 13.5/20.25 | 13.5/20.25 | 400 / normal |

| Viewport | DPR | Browser zoom | Loaded family | Font status / intended-font check |
|---|---:|---:|---|---|
| 1920×1080 | 1 | 100% | `"Hanken Grotesk", -apple-system, ...` | `loaded` / true |
| 1536×864 | 1 | 100% | Same | `loaded` / true |
| 1440×900 | 1 | 100% | Same | `loaded` / true |
| 1366×768 | 1 | 100% | Same | `loaded` / true |
| 1280×720 | 1 | 100% | Same | `loaded` / true |
| 1024×768 | 1 | 100% | Same | `loaded` / true |

Conclusion: within this browser/DPR/zoom run, perceived size change is geometrical, not responsive type scaling. Fixed shell/rail/gallery regions occupy a larger proportion of smaller viewports. OS-level display scaling and forced font-fallback behavior were not directly tested, so `SR-03` remains a risk rather than a confirmed defect.

## 10. Duplicated, conflicting, dead, and coupled rules

| Surface | Rules / source | Classification | Verification |
|---|---|---|---|
| `.workspace` | Base scrollable rule `app/globals.css:802-809`; page-specific `:has(.poc-wrapper)` lock `833-844` | Intentional override; **high-risk coupling** | Dashboard presence changes a shared ancestor from scrollable to fixed/hidden. |
| `.workspace-container` | Base padding/layout `819-831`; `:has` lock `846-856`; max1320 `1607-1614`; max900 `1653-1660`; max620 `1744-1747` | Intentional responsive overrides; **high-risk coupling** | Page-specific global state plus shell breakpoints produces discontinuous width/height arithmetic. |
| `.route-content-wrap` | Dashboard-related `:has` selector `859-869` explicitly excludes `.poc-wrapper`; base width rule `2090-2092` | **Dead for this dashboard** / inconsistent page coupling | The dashboard relies on its own `flex:1`; the page-specific flex rule controls sibling route types only. |
| `.poc-wrapper` | Base two-column/fixed-height rule `2522-2533`; max1100 one-column rule `3032-3035` | **Conflicting/incomplete override** | Column count changes but height, rows, and child scroll contracts do not. |
| `.poc-left-column` | Single fixed-height/auto-overflow rule `2542-2551`; no stack reset | **High-risk coupling** | Carries desktop nested scrolling unchanged into the stacked layout. |
| `.poc-sections-card` | Single feed `overflow-y:auto`/hidden-scrollbar rule `3091-3102` | **High-risk coupling** | Fixed composer and right-column height make feed the only Updates scroll owner. |
| Gallery viewer/frame | Base `2923-2937`; fullscreen state `2989-3006`; max1400 `3012-3029`; max720 `3043-3075` | Intentional state/responsive overrides; height model is **high risk** | Aspect ratio plus min/max heights creates crop/height cliffs. The max720 viewer order change has no current thumbnail rail to reorder. |
| Statistics bar | Base five columns `2555-2561`; max1200 three columns `2563-2567`; max600 one column `2569-2573` | Intentional override; **high-risk viewport coupling** | Trigger follows viewport, not actual 454–588px container width. |
| Sidebar | Base/expanded `132-149`; rail `429+`; max1160 `1616-1627`; max760 `1690-1708`; max620 `1720-1752` | Intentional overrides; **high-risk duplicated condition** | The 1160 breakpoint is duplicated in JS `matchMedia` at `app-shell.tsx:64-77`. Guard 639 and shell 620 overlap. |
| Top bar | Base `533-545`; breadcrumb/search `607-674`; max900 `1653-1660`; max760 `1690-1708`; max620 `1729-1733` | Intentional overrides; **high-risk content coupling** | Search and breadcrumb visibility are viewport-based; no length containment before hiding. |
| `.post-media-banner` | First sizing rule `3104-3114`; later fixed rule `4050-4058` | **Conflicting duplicate** | Later 145px height wins over earlier aspect/min/max model. |
| Global page `:has()` selectors | `833-869` | **High-risk coupling** | A descendant implementation detail changes shared workspace behavior across route surfaces. |

No exact byte-for-byte duplicate affecting the requested layout list was found. The important duplication is semantic/conflicting: repeated selectors or the same breakpoint implemented in CSS and JavaScript.

## 11. Screenshot evidence index

All files are in `docs/audits/project-dashboard-responsive/`. There are 29 PNG files after verification: 19 baseline/reachability images, five P1 crops, and five content-stress images. Raw evidence is in `dashboard-measurements.json` and `dashboard-verification-measurements.json`.

| Issue | Full viewport evidence | Crop / focused evidence | Notes |
|---|---|---|---|
| RSP-001 | `dashboard-1280x720-viewport.png` (1280×720) | `rsp-001-1280x720-main-vs-updates-crop.png` | Main/Updates allocation |
| RSP-002 | `dashboard-1280x720-viewport.png` | `rsp-002-1280x720-stat-overflow-crop.png`; `dashboard-1280x720-stats-horizontal-scroll.png` | Stat crossing and reachability |
| RSP-003 | `dashboard-1024x768-viewport.png` (1024×768) | `rsp-003-1024x768-stacked-rows-crop.png`; left/feed scroll images | Fixed stacked tracks |
| RSP-004 | `dashboard-1280x720-viewport.png` | `rsp-004-1280x720-height-pressure-crop.png` | Gallery/overview pressure |
| RSP-005 | `dashboard-1024x768-viewport.png` | `rsp-005-1024x768-hidden-scroll-crop.png`; left/feed scroll images | Hidden nested owners |
| RSP-006 | 1366, 1280, and 1024 viewport images | DOM boundary probes in verification JSON | Breakpoint cliffs |
| RSP-007 | 1920, 1280, and 1024 viewport images | RSP-004 crop | Crop progression |
| RSP-008 | 1280 and 1024 viewport images | RSP-003/RSP-005 crops | Dense controls |
| RSP-009 | `dashboard-1280x720-viewport.png` | Source/computed focus evidence only | Static PNG cannot show focus suppression |
| RSP-010 | 1920 and 1280 viewport images | Updates region in RSP-001 crop | Date contrast |
| RSP-011 | 1280 and 1024 viewport images | Composer in RSP-001/RSP-005 crops | Labelling location |
| RSP-012 | 1280 and 1920 viewport images | Sidebar in full image | 2px invitation clipping |
| RSP-013 | All baseline viewport images | N/A | Hard-coded visual system |
| RSP-014 | 1280 viewport image | Update media in RSP-001 crop | Later 145px rule visible |
| RSP-015 | 1920 viewport image | Source trace only | Same embedded composition |
| RSP-016 | `rsp-016-1280x720-long-project-title.png` | Same stress screenshot | Title/actions escape |
| RSP-017 | `rsp-017-1280x720-long-breadcrumbs.png` | Same stress screenshot | Top-bar overlap |
| RSP-018 | `rsp-018-1280x720-long-workspace.png` | Same stress screenshot | Workspace clipping |
| RSP-019 | `rsp-019-1280x720-unbroken-update.png` | Same stress screenshot | Horizontal post overflow |
| RSP-020 | `rsp-020-1280x720-multiline-composer.png` | Same stress screenshot | Internal textarea scroll |

### Required P1 full/crop pairs

1. `RSP-001`: `dashboard-1280x720-viewport.png` + `rsp-001-1280x720-main-vs-updates-crop.png`.
2. `RSP-002`: `dashboard-1280x720-viewport.png` + `rsp-002-1280x720-stat-overflow-crop.png`.
3. `RSP-003`: `dashboard-1024x768-viewport.png` + `rsp-003-1024x768-stacked-rows-crop.png`.
4. `RSP-004`: `dashboard-1280x720-viewport.png` + `rsp-004-1280x720-height-pressure-crop.png`.
5. `RSP-005`: `dashboard-1024x768-viewport.png` + `rsp-005-1024x768-hidden-scroll-crop.png`.

## 12. Final root-cause and dependency verdict

### Minimum root-cause set explaining most failures

1. Fixed shell/page dimensions delegate scrolling into hidden nested panes: document/shell/workspace/wrapper locks plus left/feed ownership.
2. Fixed secondary width dominates a shrinking center: 440px Updates, 240px sidebar, 24px gap, and the 1320 container inset.
3. Viewport breakpoints do not represent component minimum widths or a shared layout contract: stats 1200, sidebar 1160, stack 1100, heading 1080.
4. Gallery sizing combines width-derived aspect ratios with fixed minimum heights and no viewport-height policy.
5. Dynamic text and form content lack containment/growth policies: no-shrink title, unbounded breadcrumbs, long-token posts, and two-row composer.

### Problems that must be resolved together

- `RSP-001`, `RSP-002`, `RSP-006`, and the width contribution to `RSP-007` share the same center/rail/container contract.
- `RSP-003`, `RSP-004`, `RSP-005`, and the 1024 impact of `RSP-020` share the same wrapper-height, stacked-row, gallery-height, and scroll-owner contract.
- CSS/JS sidebar behavior in `RSP-006` must stay synchronized with shell rendering; changing only one side creates state disagreement.

### Problems that can be resolved independently

- `RSP-008`–`RSP-011` accessibility details, while their visual validation should cover all breakpoints.
- `RSP-012` invitation clipping, `RSP-013` token integration, and `RSP-014` duplicate media CSS.
- `RSP-016`–`RSP-019` content containment policies, provided they are tested against the final width/scroll contract.
- `RSP-015` route/feature ownership is an architectural decision and should not be mixed into a visual-only correction by default.

### Product/design decisions required before correction

1. Whether Updates must remain persistently visible, and the minimum approved widths for main project content and Updates.
2. The single primary scroll owner in two-column and stacked states, and whether a nested Updates feed remains intentional.
3. Content priority on 1366×768, 1280×720, and 1024×768: gallery, statistics, overview, Updates, or composer above the fold.
4. Approved gallery focal point/crop and maximum height on short laptops/tablets.
5. Whether titles/breadcrumbs may truncate, wrap, or displace actions, and which labels are essential.
6. Composer growth/maximum-height behavior for multiline drafts.
7. Whether the below-640 mobile guard is a long-term approved constraint.
8. Whether Odin may remain open when the center falls below the approved minimum.
9. Whether base, `/overview`, and `/updates` routes should render different feature compositions.

### False-positive and negative checks

- No original issue was a false positive.
- The `148px` literal does not currently under-budget surrounding chrome; it over-reserves 7–14px. Its defect is undocumented, breakpoint-sensitive coupling.
- Typography did not scale across the six viewports.
- Portrait/wide update images were cropped but not geometrically distorted.
- Normal paragraph growth and 12 updates stayed inside the vertical feed, though with much greater hidden-scroll burden.
- Composer and feed did not overlap; the composer instead permanently reduces feed height.
- Document/full-page scrolling is intentionally locked and did not become an alternate reachability path.

## 13. Validation performed and limitations

Performed:

- verified the existing Next.js route returned HTTP 200 at `127.0.0.1:3000/projects/proj-001`;
- inspected the live route at 1920×1080, 1536×864, 1440×900, 1366×768, 1280×720, and 1024×768;
- measured rendered bounding boxes, scroll dimensions, height budgets, type styles, DPR, zoom, and font state;
- sent mouse-wheel, trackpad-equivalent, Page Down, Space, and Arrow Down input over seven named regions at every required viewport;
- attempted Tab traversal and recorded the in-app browser automation limitation without attributing it to the application;
- used temporary 1280×720 content variants and removed the temporary harness afterward;
- created/visually checked five P1 crops and five content-stress screenshots;
- traced the controlling selectors, breakpoints, `:has()` rules, JS media condition, feature components, and conflicting CSS;
- rechecked Git directly: a `.git` directory exists but contains incomplete/empty metadata, and `git -C <workspace> status --short --branch` reports that the path is not a Git repository.

Not performed:

- no production code, route, component, style, test, or product data was changed;
- lint, typecheck, unit tests, end-to-end tests, and production build were not run because this task produced documentation/evidence only;
- authentication, permission variants, real backend data, Odin-open state, phone layouts blocked by the guard, OS display scaling, forced font failure, and assistive-technology announcements were outside this verification matrix;
- native keyboard Tab behavior remains indeterminate due the in-app browser command limitation; a real keyboard/manual assistive-technology pass is still required before claiming complete keyboard reachability.

This addendum completes the requested audit evidence package only. It does not begin or authorize the correction phase.
