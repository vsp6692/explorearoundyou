# Missing, incomplete and broken features

> Follow-up: the first location/trip blocker repairs are implemented. See [fix validation](docs/design/LOCATION_AND_TRIP_FIX_VALIDATION.md). The findings below describe the original audit baseline; remaining release gates still apply.

Audit date: 2026-11-18  
Repository: `/Users/satheesh/Work/explorearoundyou`  
Baseline: `83f63fe221a44aef40267dac9c5d3a3112af2b87`  
Mode: audit only. No production code, dependencies, migrations or deployments changed.

Statuses: **Implemented and verified** = directly exercised or verified by an appropriate domain test (scope stated); **Partially implemented** = working subset with gaps; **UI present but functionality missing** = visible flow cannot deliver its promise; **Not implemented** = no implementation found; **Unable to verify** = evidence/access insufficient. A passing domain test is not UI verification. Recommendations below are proposals awaiting approval.

## Launch blockers and core gaps

| ID / feature | Status | Evidence | Missing / recommended solution | Priority | Dependencies |
|---|---|---|---|---|---|
| F01 Current-location startup | Partially implemented | Explorer initializes Chennai center/destination/photo data; WorldMap also initializes Chennai; `locate()` is click-only | One location state machine: unknown → requesting → located/denied/unavailable. Reuse granted permission on startup; explain/request permission when needed. Show a clearly labelled fallback area, never imply it is nearby. Preserve explicit shared links/destination intent | Critical | Foreground consent UX, physical GPS QA |
| F02 Trip-cover crash | UI present but functionality missing | `TripCover.tsx:12–13`: loaded=null and title=undefined makes `loaded?.title===title` true, then dereferences loaded.photo; reproduced twice | Guard loaded before dereference; cover-less/new/legacy trip component tests; recovery boundary | Critical | Focused code approval |
| F03 Discovery reliability | Partially implemented | Public UI reports online service unavailable; places uses two public Overpass endpoints, 8.5s attempts; prior live probes timed out | Choose supported production provider, server-side quotas/cache/circuit breaker, coverage benchmark and clear degraded-state source labels | Critical | Provider terms, operating budget |
| F04 Permanent deployment | Unable to verify (permanent host) | Temporary tunnel loaded then returned 502; Sites ID lookup not found | Resolve existing host ownership/access; stable HTTPS domain, health/rollback, deploy immutable builds | Critical | Hosting owner |
| F05 True distance / GPS accuracy | Partially implemented | `distanceLabel` compares GPS origin to mutable map center; PlaceCard computes from center; `locate` ignores accuracy/timestamp validation | Separate device origin, search area and camera; validate fresh coordinates, show accuracy, use explicit “from you”/“from area” labels. Cancel stale location callbacks | High | F01 |
| F06 Near-me semantics | Partially implemented | `discoverySearch` sets category; never requests location; query runs around existing center | Resolve origin before treating “near me” as nearby; offer last explicit area when permission denied | High | F01, F05 |
| F07 Search completeness | Partially implemented | Type/tag subsets, visible tiles, 20 geocoder results, 15k parsed rows → 1,500 POIs, radius ≤10km | State bounded coverage; preserve continuation/cap metadata; test named venues and diverse cities against known fixtures | High | F03, taxonomy |
| F08 Data consistency | Partially implemented | Provider parsers/detail matching use differing type lists; map, OSM and Wiki IDs coexist | Canonical provider references, normalized categories, stable identity and source/freshness/capability metadata | High | Shared models |
| F09 Data durability | Partially implemented | LocalStorage whole collections; no import/export/version field or cloud tables | Versioned validated export/import, backup/recovery and migration; consistent write-failure notices; sync separately | High | Storage adapters |
| F10 Error isolation / test coverage | Partially implemented | 20 domain suites and typecheck pass despite F02; TypeScript strict=false; no checked-in UI E2E suite | Component render tests, location state tests, browser golden journeys, progressive null checking, screen recovery boundaries | High | F02 regression |
| F11 Privacy / deletion / consent | Partially implemented | No privacy/terms page routes; GPS sent to external APIs; cloud history default-off; account deletion operator-only | Publish accurate data-flow policy/support, export/delete local data, real account deletion if enabled, verified retention cron | High | Stable origin, service decisions |
| F12 Production security / operations | Partially implemented | Static preview server, latest dependency ranges, no tracked CI workflow, no demonstrated monitoring or header policy | Pin compatible versions, automated tests/build/dependency scans, CSP/headers tested with worker/providers, quotas, incident contact and rollback | High | F04 |
| F13 Real social login | Partially implemented | Prepared PKCE Google/Facebook flows; public build unconfigured; AUTH_SETUP references obsolete host/port | Configure legitimate redirect origins/provider apps and two-user tests; maintain guest mode; do not activate incidentally | High if promised | F04, privacy, credentials |
| F14 Multi-day itinerary quality | Partially implemented | stopDays stores valid date assignments and array ordering only | Day grouping, timezone semantics and optional travel-time estimates; do not describe straight-line ideas as routes | Medium | F02, F08 |
| F15 Journal completeness | Partially implemented | Plain text notes, createdAt, manual visits; no independent visit date editing/export | Associate notes with optional stop/date, distinguish note creation vs travel date; media stays deferred | Medium | F09 |
| F16 Trip sharing | Not implemented | Only place-coordinate share helper exists | Read-only revocable token with explicit audience and minimal shared fields; no auth bypass | Medium | Server/auth/privacy |
| F17 Open Now | UI present but functionality missing (natural-text request) | Parser acknowledges “open” but only adds a caveat; openingHours is raw text | Timezone-aware trusted hours evaluation with unknown/temporary-closure states, otherwise keep unavailable label | Medium | Provider hours/timezone data |
| F18 Price/accessibility/pet filters | Not implemented (verified filtering) | Reliable metadata/rating/price models absent; budget parser says not applied | Only expose filters with sourced fields and unknown handling; no inferred affordability/suitability | Medium | Provider/licensing |
| F19 Account collection sync | Not implemented | SQL only profiles/searches; local trips/saves remain local on sign-in | Optional explicit guest import, per-user RLS, tombstones/revisions, conflict handling and deletion | High for cross-device promise | F08, F09, auth |

## Product opportunities, separate from launch readiness

| ID / feature | Status | Evidence | Missing / recommended solution | Priority | Dependencies |
|---|---|---|---|---|---|
| O01 Weekend Explorer | Partially implemented | Three-stop ideas exist, but no weekend availability/schedule engine | Combine curated day ideas with duration and trusted opening data, clearly flag unknowns | Medium | F03, F14, F17 |
| O02 Road Trip Planner | Not implemented | No routing/waypoints/drive-time API | Routing-provider evaluation, road-access checks, corridor search and route stops; not just fly-to pins | Low | Routing licensing/cost |
| O03 Weather-aware discovery | Not implemented | No weather adapter/model | Optional destination forecast with timestamps; fallback when unavailable | Low | Weather terms/quota |
| O04 Collaborative trips | Not implemented | No memberships/invitations/conflicts | Start with F16 read-only shares; later roles, revocation, conflicts and notification consent | Low | F19, authorization tests |
| O05 Offline travel | Not implemented | Manifest without service worker/native local DB/tile download manager | Start with offline access to user's own saved text/trips; add licensed bounded map packs separately | Medium for native | Storage and data rights |
| O06 Learned recommendations | Partially implemented | Explicit interest categories affect ranking; search history only displayed/counts | Evaluate feedback-based relevance with consent; benchmark outcomes before adding AI; avoid sensitive inference | Medium | F03, measurable relevance |
| O07 Push reminders | Not implemented | No token registry or scheduler | Optional user-created itinerary reminders; local notifications first, remote push only if needed | Low | Native build, timezone, consent |
| O08 Community/admin tools | Not implemented | GitHub contribution route, no moderation/admin backend | Limited operational/provider controls later; no unsolicited social/moderation platform | Low | Real operational need, RBAC |
