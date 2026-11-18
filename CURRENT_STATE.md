# Current state and launch verdict

Audit date: 2026-11-18  
Repository: `/Users/satheesh/Work/explorearoundyou`  
Baseline: `83f63fe221a44aef40267dac9c5d3a3112af2b87`  
Mode: audit only. No production code, dependencies, migrations or deployments changed.

Statuses: **Implemented and verified** = directly exercised or verified by an appropriate domain test (scope stated); **Partially implemented** = working subset with gaps; **UI present but functionality missing** = visible flow cannot deliver its promise; **Not implemented** = no implementation found; **Unable to verify** = evidence/access insufficient. A passing domain test is not UI verification. Recommendations below are proposals awaiting approval.

**Verdict: not ready for unrestricted public launch or native-store submission.** The existing discovery/domain work is reusable. Fix reproducible regressions and operational dependencies before adding new experiences.

## Inspection and evidence

Reviewed the tracked repository inventory (130 files): App Router entry/config/manifest, all screen/component families, domain and provider helpers, CSS/assets/credits, scripts, tests, SQL/migration, account setup and handoff documents. This is a source/heuristic audit, not a penetration test, legal certification or completed user study. No live database credentials or provider administrative dashboards were available; secrets were not read.

The supplied public URL initially loaded its real map and photo cards. It displayed an online-discovery failure. Later a document request returned HTTP 502, so inspection continued at the already running static local preview, `http://127.0.0.1:3002`. A trip-create client exception was reproduced separately at both origins. The 502 and client exception are distinct observations, not an asserted shared cause.

| Runtime check | Observation / confidence |
|---|---|
| Fresh Explore | Opens **Chennai, India**, not device location; source has fixed coordinates in Explorer and WorldMap. Verified. |
| Location success | With a simulated Paris browser coordinate and 5,000m accuracy, clicking Find my location changes heading to Your neighborhood and reports success. This tests callback behavior, not real GPS accuracy. |
| Reload / denied permission | Reload reverts to Chennai. Simulated denial displays a useful search fallback. Verified. |
| New trip | Start a new trip crashes before form fields render: `TypeError: Cannot read properties of null (reading 'photo')`. Public and local reproduction. |
| Saves / visits / reload | On local preview, opened a real Chennai temple card, saw its photo/directions URL, saved it and marked visited; both survived reload and the Saved/Journal screens listed it. Isolated QA records were restored afterwards. |
| Profile | Ten visual interest themes render; current public build explicitly says cloud sign-in is not connected. Verified UI, not OAuth. |
| Mobile layout | 390×844 viewport checked; inspected screens had no document horizontal overflow before the crash. Not physical-device certification. |
| Tests | `npm test`: all **20** suites pass. `npm run typecheck`: passes. SQL test runner is separate and was not rerun against a real database. |
| Hosting identity | `.openai/hosting.json` retains its ID; Sites connector returns `Sites project not found`. No replacement or deployment performed. |

Previous handoff claims of successful trip creation do not establish current behavior. Current source and runtime crash take precedence.

## Routes, screens and feature inventory

There is one application page, `app/page.tsx`, plus static manifest and generated not-found behavior. Most navigation is React state with `?view=` history in `TravelApp`, not separate page routes. No application API routes or always-on application server are implemented. Static preview is a file server.

| ID / feature | Status | Evidence | Missing / recommended solution | Priority | Dependencies |
|---|---|---|---|---|---|
| C01 Explore / Map | Partially implemented | `Explorer`, `WorldMap`; real map reached ready state | Startup uses sample location; stabilize location/provider state first | Critical | F01, F03 |
| C02 Search | Partially implemented | `discovery-search`, `discovery-pool`, `geocoding`; regression tests | Rule-based phrases, 20 geocoder matches, variable POI coverage; benchmark known places | High | Provider decision |
| C03 Categories / cuisines | Partially implemented | `discovery-categories`, `cuisines`, `places`; tests | Only explicit cuisine tags; parser/type coverage differs among providers; unify taxonomy | High | Shared contracts |
| C04 Surprise Me | Implemented and verified (domain) | `discovery-engagement`; rotation/dedup tests | No independent quality/popularity evidence; keep factual labels and test UI rotations | Medium | Reliable discovery |
| C05 Place details / photos | Partially implemented | `PlaceCard`, `PlacePhoto`, details/photo tests; real default images | Incomplete venue photos/contact fields, one photo, unverified opening state; retain honest fallbacks | High | Provider/licensing |
| C06 Saves / favourites | Partially implemented | `bookmarks`, Explorer and Saved screen, validation tests | Local only, no export/import or recovery; persisted distance resets to zero and needs origin-aware recomputation | High | Storage adapter |
| C07 My Trips / creation | UI present but functionality missing (new-trip entry) | `TripScreens` → `TripCover.tsx:13`; runtime exception | Null-safe cover selection and component smoke tests | Critical | F02 |
| C08 Itinerary / multi-day | Partially implemented | `trips`, `stopDays`, reorder tests; TripScreens controls | Planned date labels, not travel-time routing or an optimized itinerary; current entry crash obstructs journey | High | F02 |
| C09 Trip maps / directions | Partially implemented | WorldMap fitBounds/numbered markers; PlaceCard Google directions URL | External directions handoff, not in-app navigation; no travel-time validation | Medium | Real-device links |
| C10 Journal / visits | Partially implemented | JournalScreen, memories, `visitedAt`, validation tests | Plain text and manual visits; old marks undated, note dates are creation dates; runtime creation blocked | High | F02, storage |
| C11 Place sharing | Implemented and verified (domain) | `sharing`, SharePlace; safe URL round-trip tests | Browser/OS share flows not fully exercised now; sender names are unverified | Medium | Stable origin |
| C12 Trip sharing / collaboration | Not implemented | No trip share token, member table or endpoint | Add read-only share first if needed; collaboration deferred | Low | Auth, server ACLs |
| C13 Preferences / onboarding | Partially implemented | ThemePreferences, scoped themes, guest saving tests | Optional prompt; broad category projection only, no learned search-history recommendations | Medium | Consent/product model |
| C14 Profile / social login | Partially implemented | AccountPanel, useAccount, Supabase SQL; UI says not connected | Configure and test real providers before advertising account persistence | High if advertised | Stable domain, OAuth |
| C15 Home / collections | Partially implemented | HomeScreen reachable from Profile; photos labelled inspiration | Previous mobile-plan document describes obsolete nav; clarify secondary navigation | Medium | UX cleanup |
| C16 Exploration games | Partially implemented | JourneyPanel, badges, mist, mystery helpers/tests | Cosmetic/manual progress, three straight-line suggestions; not verified routes or measured exploration | Low | Provider coverage |
| C17 Offline / push / weather | Not implemented | Manifest only; no service worker, native project, weather client or push registry | Defer beyond guest web MVP; specify offline tiers | Low for web MVP | Mobile/data rights |
| C18 Backend | Partially implemented | Optional Supabase client; profiles/history schema only | No provider gateway, trip/saved sync or admin service | High | Architecture proposal |
| C19 Accessibility | Partially implemented | Labels, focus styles, 44px controls, reduced-motion CSS | No current screen-reader/keyboard journey certification; map/list equivalents need acceptance | High | UX audit |

## State and persistence

React hooks own screen, account, map and local trip state. Browser keys cover trips, saves, visits, interests, style, theme, mist, welcome dismissal and account-scoped theme labels. `useTrips` writes before replacing state and listens for cross-tab changes. Saves/visits can update session state even after failed writes; behavior differs from trips. Whole-record storage has no schema-version migration, conflict resolution or user export.

Trip bounds: 100 trips, 100 stops and 100 notes per trip; notes up to 2,000 characters. The database contains profiles and consented search history only, with RLS and a bounded recording function. It does not store trips, favourites, journal media or collaboration. Signing in does not synchronize device collections.

## Source ownership map

| Area | Files / current ownership |
|---|---|
| App shell | `app/page.tsx`, `layout.tsx`, `manifest.ts`; TravelApp, HomeScreen, AppIcon, ui |
| Discovery | Explorer, WorldMap, DiscoveryCards, PlaceCard, PlacePhoto, DeferredPlacePhoto, SharePlace, AdventureSearch |
| Planning | TripScreens, TripCover, JournalScreen, JourneyPanel, useTrips |
| Identity | AccountPanel, ThemePreferences, InterestPicker, useAccount; `lib/account`, history, interests, preference-themes |
| Geography/data | places, discovery-pool/search/categories/engagement, cuisines, geocoding, place-details/sources, photos, nearby/default-photo-places |
| Progress/maps | adventures, exploration, marker-groups, map-theme, prepare-map-style, pixel-icons, ExplorationMist |
| Persistence/sharing | trips, bookmarks, sharing; no backend equivalents for trips/saves |
| Infrastructure | next/postcss/TypeScript/package config, map preparation, static serve and sprite scripts, Supabase schema/migration, licensing assets/docs |

See MISSING_FEATURES.md for concrete gaps, DEVELOPMENT_ROADMAP.md for gates, and RISK_REGISTER.md for operating/licensing decisions.
