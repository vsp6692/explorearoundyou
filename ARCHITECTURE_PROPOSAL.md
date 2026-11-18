# Incremental architecture proposal

Audit date: 2026-11-18. Baseline `83f63fe`. Audit only; proposals below are not implemented. Status terms match CURRENT_STATE.md. Evidence distinguishes source, domain tests and live runtime. No production code or infrastructure was changed.

## Decision

Use a lightweight npm-workspaces monorepo when the native spike is approved. Preserve the Next.js web app. Add one Expo React Native application targeting Android and iOS, a shared pure domain/contracts layer, platform adapters, and a small shared backend. Do not introduce microservices, an enterprise dashboard or a wholesale UI rewrite. An administrative UI is an optional future consumer of controlled APIs, not a public service-role client.

| Proposed location | Responsibility / migration order |
|---|---|
| `apps/web` | Existing Next.js app; move only after shared-package extraction is proven, preserving deployment output and URLs |
| `apps/mobile` | Expo native screens, Router, native MapLibre, permissions and platform adapters; no whole-site WebView |
| `packages/domain` | Place/trip/visit/preference types, validation, identity, ranking, itinerary/date rules; zero DOM/React/storage dependencies |
| `packages/contracts` | Versioned request/response/error and sync schemas with runtime validation, shared by clients and server |
| `packages/design-tokens` | Serializable colors, spacing, radii and typography roles; web/native render independently |
| `packages/test-fixtures` | Sanitized provider fixtures, location state cases, persistence migrations, contract cases |
| `supabase` | Existing SQL/migrations plus approved sync/cache schemas and functions, not a new microservice fleet |
| `apps/admin` (future only) | Minimal authorized operational tooling if justified; separate role and server checks |

## Capability decisions and dependencies

| ID / component | Status | Evidence | Missing / recommended solution | Priority | Dependencies |
|---|---|---|---|---|---|
| A01 Domain extraction | Partially implemented | Pure helpers exist, but types cross-import provider utilities and map-library types | Extract rules incrementally behind existing imports; retain current behavior/test fixtures; no source move until regression gates pass | High | F02/F10 |
| A02 Platform ports | Not implemented | Direct localStorage, navigator, window, crypto and DOM map APIs | Interfaces for LocationProvider, TripRepository, SavedRepository, SessionStore, Share/Directions and provider clients; implementations per platform | High | A01 |
| A03 Provider gateway | Not implemented | Browser talks directly to Overpass/Nominatim/Wikimedia; caches are per-tab | Single edge/API layer: validated requests, aggregate quotas, bounded TTL caches, provider failover, configurable backend selection and typed errors. A proxy cannot grant rights or increase an upstream quota | Critical | Provider agreement, stable backend |
| A04 Database / sync | Partially implemented | Profile/history SQL only | Optional `trips`, `trip_stops`, `memories`, `saved_places`, `visits` with owner IDs, revisions and deletion tombstones; migrations and two-user authorization tests | High if sync | Auth, privacy design |
| A05 Identity | Partially implemented | Web PKCE client + RLS; unconfigured | Keep guest identities/device storage separate from user accounts. Explicit preview/import on sign-in; no implicit guest data upload | High | A04, M09 |
| A06 Location state | Not implemented (shared model) | Independent map center, destination and gpsOrigin in Explorer; fixed camera startup | Typed location status, accuracy/time/source, explicit area selection and camera intent; shared policy with browser/native permission adapters | Critical | F01/F05 |
| A07 Canonical place model | Partially implemented | OSM, map-derived and Wiki IDs plus heuristic samePlace | Store provider+provider ID separately from internal stable ID, provenance/license/fetchedAt, capabilities and optional fields. Avoid blindly merging nearby same-name branches | High | Provider design |
| A08 Offline and repositories | Not implemented | Whole-blob localStorage and no sync version | Versioned web adapter (localStorage initially/IndexedDB as needed), native SQLite; transactional writes/outbox, deliberate retention and export | High | F09, A04 |
| A09 Operations/admin | Not implemented | No tracked operational workflow or role model | Health/error metrics without precise GPS/raw query logging, budget alarms/quotas, provider kill switches, rollback; future least-privilege admin functions | High for operations; Low for UI | Stable host |
| A10 CI/security | Partially implemented | Tests exist, no checked-in release CI; strict=false | Tests/typecheck/export, targeted strict-null migration, UI E2E, dependency/secret checks, reproducible lockfile and deployment approvals/rollback | High | F10/F12 |

## API contract sketch (proposal only)

- `POST /v1/discovery/search`: validated area/radius/category/cuisine/query; output items, source, fetchedAt, completeness/cap indicator, optional continuation, and partial-result warnings.
- `GET /v1/places/:provider/:id`: sourced detail fields and licensed image metadata. Never treat missing values as zero price, open status or positive suitability.
- `GET /v1/sync?cursor=...` and `POST /v1/sync/mutations`: authenticated, owner-bound incremental changes, idempotency key and expected revision; explicit conflicts and tombstones.
- A shared error union distinguishes permission denied, invalid input, offline, rate limited, provider unavailable, partial results, not found, unauthorized and conflict. Clients keep existing local records on failures.

Anonymous discovery remains available with abuse limits. Validate on the server even when the client has shared validation. Never trust a caller-supplied owner ID; use authenticated identity. Privileged keys stay server-side.

## Data, caching and images

Current map rendering: MapLibre GL JS with OpenFreeMap Liberty style, OpenMapTiles/OSM data and visible map attribution. Current discovery: public Overpass endpoints, public Nominatim geocoding/details, Wikipedia primary coordinates/excerpts, Wikidata P18/descriptions and Commons metadata/files. Default Chennai assets are real attributed snapshots, not global sample results.

Current caches are ephemeral bounded Maps: discovery about 10 minutes; geocoding/photos/nearby photo metadata about 15 minutes; partial details about 1 minute, fuller details about 15 minutes. There is no shared cache, persisted provider cache, catalog freshness guarantee or outage telemetry. Place payload parsing caps rows after receiving JSON, not a strict streaming response-byte budget. The proposed gateway must bound request/response sizes, retries, concurrency and costs.

Use Postgres for user-owned records and a modest provider cache only when rights permit. A CDN/object store is not necessary for personal uploads because uploads are out of scope. For future media, use private object storage, signed access, quotas, deletion/backup rules and explicit photo consent. Do not rehost every third-party image by default.

Cost model: monthly discovery requests = active users × sessions × searches per session, plus details, images, tiles, storage and egress. Account for debounce, cache hits and two-endpoint fallback. No committed operating budget or contracted provider quota was available, so no fixed monthly cost is asserted. Evaluate a provider on known-place coverage, rights, latency, quota and actual projected traffic before buying or integrating it.

## Provider terms and privacy decisions

- [Nominatim policy](https://operations.osmfoundation.org/policies/nominatim/): maximum public-service traffic is one request/second across the application, not per user/tab. Current 1.1-second per-tab queue cannot enforce that globally. Provider switching/caching is required for scalable operation; do not turn public geocoding into a bulk directory crawler.
- [OpenFreeMap terms](https://openfreemap.org/tos/), checked 2026-11-18: public service is as-is; offline downloads have explicit size/concurrency/app-identification limits (currently 3,000 tiles or 50 MB per download, at most four parallel requests). Confirm rights and limits again before any offline feature. MapLibre renderer licensing is separate from data/style/tiles and fonts/sprites.
- [Commons reuse guidance](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia): each file's license governs attribution and redistribution; MIT applies to code only. Existing photo allowlists and credits help, but the complete shipped asset and excerpt obligations still need review.
- [Google service terms](https://cloud.google.com/maps-platform/terms/maps-service-terms): direct Places API content has non-Google-map restrictions; Places UI Kit has a distinct allowance. A provider switch affects maps, caching, saved-place storage, attribution and cost, not only a fetch URL. No Google migration is proposed without an explicit provider decision.

GPS/search areas and text are currently sent from the device to third-party APIs even with account history disabled. Publish that distinction, minimize precision/log retention, and never make background location a prerequisite. Server history is opt-in and capped/aged in SQL, but inactive expired rows require an actual scheduled purge. Device-local data has no documented expiry or comprehensive export/delete flow. Cloud backups/logs need their own documented retention. Licensing/privacy conclusions require owner review, not assumed compliance.

## Migration order

Repair launch blockers in place → introduce validated domain/ports under current web code → provider gateway and location contract → optional storage/sync model → native map/auth/storage spike → native screens → device/store qualification. Keep existing local keys readable throughout; every migration has fixture and rollback tests. Admin UI follows demonstrated operational need.
