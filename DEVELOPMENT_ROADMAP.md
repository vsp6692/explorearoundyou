# Prioritized development roadmap and release recommendation

Audit date: 2026-11-18. Baseline `83f63fe`. Proposal only; no implementation started. Findings/status definitions and evidence are in CURRENT_STATE.md and MISSING_FEATURES.md. This plan replaces neither source nor existing deployment until approved.

## Top 10 issues before public launch

| Order / feature | Current status | Evidence | Missing / recommended action | Priority | Dependencies |
|---|---|---|---|---|---|
| 1. New-trip stability (F02) | UI present but functionality missing | Reproduced null-photo crash in public/local; TripCover:13 | Fix null guard; render empty/no-photo/legacy trips; verify full create journey and error isolation | Critical | Approval for focused repair |
| 2. Current location (F01/F05/F06) | Partially implemented | Fixed Chennai startup; click-only GPS; near-me uses selected map area | Location state model, permission-aware first open, honest fallback, accuracy/race handling and separate device/search centers | Critical | Foreground consent design |
| 3. Reliable discovery (F03/F07) | Partially implemented | Public UI service-unavailable; shared-free endpoints/timeouts | Provider coverage/latency benchmark, production quota/cache/failover strategy and incomplete-data labels | Critical | Provider rights and budget |
| 4. Permanent HTTPS hosting (F04) | Unable to verify | Tunnel later 502; Sites ID not found | Resolve owner/hosting, stable domain, immutable release/rollback, worker/CORS checks and monitoring | Critical | Hosting access |
| 5. Data protection/recovery (F09) | Partially implemented | Browser-only collections; no export/import/versioning | Consistent failed-write behavior, validated export/import, storage-version migrations and corruption/reload checks | High | Storage interfaces |
| 6. UI quality gates (F10) | Partially implemented | 20 domain suites/typecheck pass despite trip crash; strict=false | Add component/E2E tests and gradual strict null checks; current location + trip + saved journeys mandatory | High | Repairs 1–2 |
| 7. Privacy/licensing baseline (F11) | Partially implemented | No public policy routes; external location requests; separate image licenses | Data-flow notice, contact/deletion, source/license manifest and provider compliance sign-off | High | Provider/domain decisions |
| 8. Mobile web/accessibility acceptance (U05/U10) | Partially implemented | Viewport checks only; no physical/screen-reader certification | Real iOS/Android, keyboard/zoom, screen readers, safe areas, offline/error/denial matrix | High | Stable candidate build |
| 9. Shared taxonomy/contracts (F08) | Partially implemented | Different parser type lists and provider IDs | Normalize source IDs/types/optional capabilities and test same named venue/branches across sources | High | Provider choice |
| 10. Release operations/security (F12) | Partially implemented | No tracked CI release pipeline; no proven production quota/log policy | Reproducible build, dependency/secret checks, security headers, rate limits, incident owner and metrics | High | Stable host/backend |

Accounts are an additional gate **if advertised**: configure real OAuth, account deletion and two-user isolation; add collection sync before promising cross-device collections. Guest-first release may defer them honestly.

## Minimum viable public web release

Include: location-aware Explore/Map with explicitly selected area fallback, city/business search, supported category/cuisine filters, sourced details/photos, useful no-photo/error behavior, save/unsave, optional interests, trustworthy Surprise rotation, external directions, working local trip creation/reorder/day assignments and text journal. Display data provenance/coverage and local-only storage status. Provide privacy/contact/license information, local export/import and stable HTTPS hosting.

Do not promise: every place, verified hidden gems/popularity, live prices, Open Now, timed routes, cloud trip backup, collaboration, personal uploads, offline maps or native apps. Keep optional existing games reachable without presenting them as measured travel. Do not remove working features to pass the gate.

## Execution phases

Estimates are rough **engineering effort**, not calendar commitments: one experienced full-time engineer with part-time product/QA help, access to provider/hosting accounts, and no major rebrand. External approvals, legal review and store review are excluded. Phases overlap; ranges are not a fixed quote.

| Phase / feature | Current status | Evidence motivating work | Recommended work / exit gate | Priority | Dependencies | Complexity / effort |
|---|---|---|---|---|---|---|
| P0 Audit approval | Implemented and verified (reports) | This seven-report audit | Agree guest MVP, provider criteria, foreground-only location and native Expo direction | High | Owner review | Decision |
| P1 Core correctness | Partially implemented | F01/F02/F05/F06/F10 | Repair trip crash/location state; current location granted/denied/stale/race tests; create/save/reload journey passes on real web devices | Critical | P0 | Medium; 3–7 engineer-days |
| P2 Discovery + hosting | Partially implemented | F03/F04/F07/F08 | Benchmark at least three geographic areas with a documented known-place list; source/latency/quota targets agreed; permanent host and degraded-mode tests | Critical | P0, provider/host access | High; 1–3 engineer-weeks, provider-dependent |
| P3 Public web gate | Partially implemented | F09/F11/F12/U10 | Export/import and migration checks, policies/licenses, CI/error monitoring, accessibility/mobile acceptance; no Critical issues, High issues fixed or explicitly scoped out | High | P1/P2 | Medium–High; 1–2 engineer-weeks |
| P4 Shared packages + native spike | Not implemented | M01–M06/A01–A03 | Extract pure contracts without breaking web; Expo development builds with real native map, GPS, local storage and deep-link proof on both OSs | High | Stable web/domain/provider decisions | High; 1–2 engineer-weeks |
| P5 Optional account/sync foundation | Partially implemented | Prepared auth only, no collection tables | Configure providers; RLS/retention/deletion; explicit guest import; offline revisions/tombstones and conflicts; two-account/device tests | High if promised | P3/P4, credentials/privacy | High; 2–4 engineer-weeks |
| P6 Native MVP screens | Not implemented | No native UI | Native discovery/details, saves, trips/journal and optional preferences; real device permission/resume/keyboard/performance matrix; sync only if P5 passes | High | P4, P5 if included | High; 4–7 engineer-weeks |
| P7 Beta/store readiness | Not implemented | No signing/store assets/qualification | TestFlight/Android closed beta, privacy declarations, support/deletion, crash-free acceptance and signed reproducible releases | High | P6, owner accounts | Medium–High; 1–3 engineer-weeks plus review |
| P8 Further opportunities | Not implemented or partial | O01–O08 | Prioritize from observed user need, not checkbox completeness | Low | Stable public products | Separate estimates |

A local-first native MVP may proceed after P4 without P5 if accounts/sync are clearly deferred. Do not make public social login a superficial checkbox while user collections remain unsynchronized.

## Release acceptance matrix

- Real location: fresh permission, granted, denied, revoked, approximate/low-accuracy, timeout, stale result, app resume, explicit shared destination and older callback race.
- Discovery: named known venues, sparse/dense areas, cuisine missing/known, no records vs service failure, bounded partial results, repeat/cancel/rapid category change and quota exhaustion.
- Persistence: first stop atomic creation, empty/legacy/photo-less trips, reorder/day edit, note, save/visit, reload, full/denied/corrupt storage, validated export/import and migration rollback.
- Navigation: browser/native back, restored selected trip, shared/deep links, directions app unavailable, share cancellation and attribution reachability.
- Identity/sync when enabled: two-user isolation, refresh/logout, provider cancellation, guest import consent, offline conflict/deletion, revoked token and account deletion.
- Accessibility/performance: keyboard and screen reader, text zoom, contrast, reduced motion, safe areas, landscape/keyboard, low-memory map lifecycle and slow connections.
- Operations: stable public origin independent of a laptop; health checks, rate/cost limits, rollback and support ownership.

## Approval requested

Approve P1–P3 as the web launch track and P4 as a bounded native feasibility spike after the core repairs. Confirm whether account sync is part of the first native release before committing to P5/P6 scope. No product or mobile implementation is included in this audit.
