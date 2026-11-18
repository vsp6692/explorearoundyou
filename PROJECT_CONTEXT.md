# Explore Around You — complete project handoff

Last updated: 2026-11-16 (Asia/Kolkata).

## Current scope — read this before the historical handoff

The latest user explicitly requested **optional Google and Facebook sign-in**, profiles and saved search history/preferences, and selected **prepare a Supabase setup** because no auth/database project exists yet. This supersedes the original no-accounts constraint; keep guest exploration available. The older phase statuses below are historical; later sections record repairs and added features.

The account code is prepared but **not connected or OAuth-verified**. `docs/AUTH_SETUP.md`, `.env.example`, `supabase/schema.sql` and `tests/auth-schema.*` contain deployment and validation steps. No secrets or fake provider IDs are present. Two browser-public build variables activate the client only after a real project is supplied. Google/Facebook provider secrets belong in Supabase, not the repository. Do not claim active social login until both providers have been configured and tested.

## Read this first

**This project is not accepted as working or finished.** The user's latest feedback is: “I dont see its working as expected.” The immediate request is to preserve full context inside this folder so the project can be moved independently to `/Users/satheesh/Work/explorearoundyou`.

Do not equate successful builds, mocked tests, an HTTP 200, or a successful hosting deployment with a functioning map/discovery experience. Real mobile and browser acceptance testing remains outstanding. Do not add more game features before diagnosing the core experience.

Relocation completed on 2026-11-16. The entire folder, including its Git history, uncommitted handoff documents and hosting identity, was moved. The deployed application was not changed.

## Location and independence

- Current root: `/Users/satheesh/Work/explorearoundyou`.
- Previous root: `/Users/satheesh/Work/profile-builder/explorearoundyou`.
- Relocation status: complete.
- The parent `profile-builder` project is an unrelated portfolio. Preserve it and its assets.
- This folder has its own `.git`, package manifest, lockfile, source, tests, license and hosting manifest. It does not need the portfolio files.
- Application imports and build scripts use project-relative paths. No parent-project dependency was found in the source inspection.
- Preserve hidden `.git` and `.openai` directories during a move. Do not recreate the hosted Site.
- Dependencies and generated output can be regenerated; `node_modules`, `.next`, `out` and `.test-output` are not source requirements.
- A running dev process can retain the old working directory. Stop this project's servers before moving, and restart from the new directory.
- The destination was absent before relocation; no existing project was overwritten.

See `MOVE_PROJECT.md` for safe manual steps.

## Product vision and constraints

Initial inspiration: pixelchennai.com. Original concept name was ExploreVerse; the user explicitly chose **explorearoundyou**. User-facing branding can read **Explore Around You**.

“A playful world of places, surprises, and little adventures.” The website should feel like opening a game, while keeping a useful readable map. Discovery comes before navigation. Children and families should be able to enjoy it. No signup, onboarding, accounts, payments, SaaS features, enterprise dashboards, microservices or unnecessary infrastructure.

User's chosen direction:

- Full-screen/map-first homepage with search, categories and game controls floating above it.
- Balanced playful design, colorful and fun, without compromising map usability.
- **Surprise Me first**, then other game ideas.
- Free/open-source, minimal dependencies, mobile-first, light/dark modes, MIT code license.
- Hand off directions to an external maps app rather than rebuilding navigation, traffic or reviews.

Requested stack: Next.js, TypeScript, Tailwind, MapLibre GL JS, OSM/Overpass discovery, a separate geocoder and browser localStorage. Static hosting where possible.

## Original six-level plan and actual status

1. **First adventure:** map, submitted worldwide search, permission-based location, responsive interface. Implemented in code, not accepted on mobile. Initial city shortcut cards were later removed in favor of a compact kit.
2. **Discover nearby:** real Overpass places and categories. Implemented, but successful live discovery is not verified.
3. **Meet a place:** name, type, distance and directions implemented. No real photos, rich descriptions, ratings or verified opening status.
4. **Your collection:** local bookmarks and Surprise Me implemented; browser persistence and reveal interactions need acceptance testing.
5. **Explore your way:** radius implemented. Natural-language parsing, hidden gems, mood and budget filtering are not implemented.
6. **Polish and share:** preliminary Pixel UI, accessibility improvements and public HTTPS deployment exist. Full browser/mobile QA and polished pixel map styling are unfinished.

Later the user narrowed the immediate MVP to six capabilities: beautiful interactive map; current location/worldwide search; colorful pins/basic information; categories/distance; Surprise Me; local bookmarks and Classic/Pixel themes. Finish this before expanding.

## Deferred ideas, not implemented

- Mood Explorer: peaceful, adventurous, romantic, hungry, bored, energetic.
- Rule-based natural text, e.g. “Quiet cafés within 5 km under ₹500.” Parse category/radius/budget/mood without a paid AI dependency initially.
- Adventure Mode: three stops for “I have 2 hours” or “family outing.”
- Optional local fog-of-war progress.
- Explorer badges: Beach Hunter, Café Hopper, Nature Explorer, Weekend Wanderer. No leaderboard.
- Mystery question-mark pins with reveal.
- Hidden Gems as clearly labeled suggestions; no unsupported popularity claims.
- Candy Map and Night Explorer as future community themes. Launch preference was Classic and Pixel.
- Advanced filters: opening hours, accessibility, pets, parking, amenities, rating only with adequate data.

OSM does not reliably provide quietness, romance, child-friendliness, price or ratings. Do not fabricate these. Use explicit approximations/community tags where applicable. Budget controls must not imply reliable price data. Image/map/data licenses remain separate from the MIT code license. Community contributions can begin with GitHub issues/PRs and OSM improvements; no moderation platform required.

## Current files and responsibilities

- `app/page.tsx`: renders Explorer.
- `app/layout.tsx`: metadata and imports CSS.
- `app/globals.css`: Tailwind import plus multiple appended style iterations. Needs consolidation; desktop/mobile/dark/pixel rules overlap.
- `components/Explorer.tsx`: large client component owning search, discovery, selection, theme, saved places, result lists, location and UI.
- `components/WorldMap.tsx`: client MapLibre lifecycle, navigation, selected-location marker and place markers.
- `lib/places.ts`: Place type, category selectors, Haversine distance, bounded Overpass request, response parsing and memory cache.
- **`lib/places.js`: tracked generated duplicate, likely emitted by an early failed test compile. Investigate/remove it during the next repair pass to eliminate ambiguous module resolution. Tests target TypeScript output, so they do not prove which sibling the application resolves.** It is preserved in this documentation-only handoff to avoid silently altering the app.
- `scripts/prepare-map.mjs`: copies installed MapLibre worker and license into `public`; runs before dev and build.
- `tests/places.cjs`, `tests/tsconfig.json`: mock-based discovery regression suite, emits to `.test-output`.
- `.openai/hosting.json`: existing hosted Site identity and `out` static directory.
- `AGENTS.md`: Next-generated instructions to read the installed Next docs before changing code. Additional handoff pointer appended separately.
- `LICENSE`: MIT code license.

## Actual current behavior

- Initial location is Chennai (13.0827, 80.2707).
- MapLibre uses OpenFreeMap Liberty style, external vector tiles, WebGL and a same-origin module worker.
- WorldMap imports MapLibre as a namespace; installed v6 did not provide the default export used in the first draft.
- Worker URL is explicitly `/maplibre-gl-worker.mjs`; `predev`/`prebuild` prepare it. Serving the file was verified; that alone did not verify rendering on the phone.
- Search is an explicitly submitted Nominatim request, not autocomplete, with up to five result choices, a 12-second timeout, in-memory cache and per-tab 1.1-second throttle.
- Geolocation requires explicit click. In insecure LAN HTTP, an explanatory message is shown. Public HTTPS permits requesting location but users/browsers may still deny it.
- Discovery runs only after Explore nearby or Surprise Me, not automatically on launch, pan or filter change.
- Categories: Everything, Food, Stays, Beaches, Parks, Attractions, Shopping, Fun.
- Radius choices: 1, 3, 5, 10 km.
- Overpass requests use named nodes/ways/relations, center coordinates, 20-second server timeout, 25-second client abort and at most 180 output elements.
- Results are filtered by center distance and sorted locally; the limited upstream set is not a nearest-180 ranking or exhaustive listing. Polygon centers can misrepresent proximity.
- Cache lasts ten minutes (maximum 30 entries); UI prevents another request within five seconds.
- `center` is now separate from camera `destination`. Selecting a pin flies the camera without shifting the discovery center. Search/geolocation update the center. Filter/center changes abort old discovery and clear results.
- Surprise Me picks a random returned place, avoids the current selection where possible, flies to it and animates a gift card.
- Pins are emoji DOM buttons. A separate result list provides a keyboard-accessible alternative.
- Details show type, straight-line distance from discovery center, save control, Google Maps directions and an OSM link. There is no actual photo.
- Classic/Pixel currently changes CSS, contrast/saturation, square controls and pin styling. It is **not** a custom pixel MapLibre style/sprite system.
- Dark mode dims the map with CSS rather than loading a dedicated night basemap.
- Escape closes panels/results/status. Reduced-motion CSS disables reveal animations. More focus-management and screen-reader review is needed.
- Local storage keys: `explorearoundyou-theme`, `explorearoundyou-style`, `explorearoundyou-saved`.
- Favorites belong to the browser origin. LAN ports, localhost and public hosting do not share localStorage.

## Services and configuration

Build-time, browser-public variables (never put secrets in them):

- `NEXT_PUBLIC_MAP_STYLE`: default `https://tiles.openfreemap.org/styles/liberty`.
- `NEXT_PUBLIC_GEOCODER_URL`: default `https://nominatim.openstreetmap.org/search`; Nominatim-compatible JSON and browser CORS required.
- `NEXT_PUBLIC_OVERPASS_URL`: default `https://overpass-api.de/api/interpreter`; Overpass POST endpoint and browser CORS required.

No database, authentication, backend proxy, API keys or analytics exist. Tile provider sees requested geography; geocoder sees submitted text; Overpass sees coordinates/radius/categories. Public services have usage restrictions and variable availability. Per-tab geocoder throttling does not enforce a public provider's application-wide limit. Resolve that before promoting to substantial traffic.

## Verification history and failures

Passed in the last implementation turn:

- `npm test`: distance including antipodes, radius exclusion, node/way parsing, missing-name handling, sorting, memory cache, invalid input, abort, HTTP failure and incomplete response tests. Fetch is mocked.
- `npm run build`: compiled, TypeScript checked and static export generated.
- Local HTTP page and worker had returned 200 in earlier checks.
- Sites backend reported successful publication.

Not verified:

- End-to-end successful live discovery.
- Phone map rendering, touch navigation, search, actual location permission, bookmarks across reload, theme behavior, Surprise Me and panel accessibility.
- Public site network/CORS/worker behavior in a real mobile browser.
- Broad screen-size or assistive technology support.

Known observed problems:

1. User repeatedly reported mobile connection problems; later clarified the page loaded but the map was blank.
2. MapLibre worker loading was suspected and an explicit worker asset was added. No phone confirmation established that this fixed the map.
3. T3 browser snapshot and evaluate each timed out after 15 seconds during earlier diagnosis. No successful browser visual QA followed.
4. Local dev process sometimes stopped between turns; changing ports did not establish reliability. Last LAN address was `192.168.1.240`, ports 3000 then 3001. The address can change.
5. Live POST to the main Overpass endpoint returned HTML HTTP 406 from the Mac network. This is an observation, not a proven service-wide failure or diagnosed root cause.
6. A diagnostic request to `https://overpass.kumi.systems/api/interpreter` timed out after 28 seconds. It was not adopted as a fallback.
7. The current user still says it does not work as expected. Treat this as the strongest acceptance signal.

## Hosting and source identity

Public URL reported by successful deployment:
`https://explorearoundyou.lyric-6185.chatgpt.site`

- Site project: `appgprj_6afa62246b4c81919d3c04be09e677d2`.
- Access mode was explicitly updated to public during the preceding turn.
- Published source commit: `d235b6a191e41fdf7143e63a29cd11140fba01d8`.
- Saved version: `appgprj_6afa62246b4c81919d3c04be09e677d2~appgver_9cb09773fab48191930228ae97ce6638`.
- Successful deployment: `appgdep_6afa62c387548191b3fa70fd22dc5e4e`.
- Static output: `out`.
- Previous deployment archive: `/tmp/explorearoundyou-deploy.tar.gz`, disposable and not needed for relocation.

The folder's Git repository was prepared/pushed by Sites tooling. Preserve its configuration. Credentials were transient; no deployment token is needed in this handoff. Obtain a fresh source credential through Sites when publishing; do not create a replacement project or invent IDs. Future Sites publication requires pushing exact source and packaging matching build output. Normal local development does not depend on Sites tooling.

## Suggested next session: diagnose before expanding

1. Read this document and AGENTS.md. Work from the relocated standalone folder if moved.
2. Ask the user for the current visible symptom/browser if needed; do not assume the earlier blank-map symptom is still the only problem.
3. Remove/resolve generated `lib/places.js` ambiguity and confirm actual module resolution. Consolidate generated-output handling.
4. Reproduce the public site on desktop and mobile. Inspect canvas dimensions, WebGL support, worker status/content type, runtime console errors, style/tiles/glyphs/sprites requests and CORS. Record evidence, not just hypotheses.
5. Diagnose real Overpass requests (including status/body/timeout) and geocoding under the hosting origin. Choose a reliable, policy-compliant provider approach without adding unnecessary infrastructure. Never fill failures with invented places.
6. Verify search → select city → category/radius → discover → select pin → directions/save; Surprise Me; reload bookmarks; location allow/deny; empty results; offline/slow services; cancellation when filters change.
7. Check 360px and 390px screens, landscape, keyboard, focus visibility, panels not covering essential attribution/navigation, map gesture usability and reduced motion.
8. Only after acceptance, refine real MapLibre Pixel styling and consider deferred game features.

Do not say “fully done” until the user can actually perform the main exploration journey on their phone.

## Latest restart and repair pass

The user requested restarting the app because many things remain open or broken. Local dev was restarted from the standalone root on port 3001. Removed the tracked generated `lib/places.js` duplicate and ignored future emitted JS under `lib`. Added map loading/error state, explicit Retry map, a load timeout, container resize handling and retry cleanup. Discovery now surfaces upstream HTTP status or timeout rather than a generic message. These changes are local and not yet published.

Validation: regression tests and static production build passed; local app and worker returned HTTP 200. OpenFreeMap style and Nominatim Chennai query returned 200. A GET request to the default Overpass service still returned HTML HTTP 406. An alternate `overpass.private.coffee` request timed out after 25 seconds; no automatic fallback was added. Live nearby discovery and actual mobile rendering remain unverified. The user was asked which current symptom is most prominent; do not treat service failures as resolved by the improved error UI.

## Blank map: CSS sizing conflict found

The user confirmed that the current main failure is a blank/unloaded map. `app/layout.tsx` imports MapLibre's stylesheet after the application stylesheet. MapLibre sets `.maplibregl-map { position: relative }`, overriding the application's equally specific `.map { position: absolute }`. With no explicit height, the map container can collapse. Added `.canvas > .map.maplibregl-map { position:absolute; inset:0; width:100%; height:100%; min-height:0 }` so vendor load order cannot override sizing. Production build passed. Browser verification was blocked: T3 snapshot/evaluate timed out after 15 seconds, and alternate native Chrome inspection timed out after 30 seconds. Actual rendered/mobile result still needs confirmation. Changes are local, not yet deployed to the public Site.

## Phases 1–2 repair and validation (2026-11-16)

The static production export was browser-tested at 390×844. It hydrates, reaches map-ready, renders thousands of geographic features, and has no horizontal overflow. Map worker/style/sprites/font requests succeeded. Submitted Chennai search returned a real result; selecting it updated the exploration center. Zoom controls changed map zoom and rendered POI counts. Light/dark switching worked. Geolocation success/denial paths were verified with simulated coordinates, not actual device GPS permissions. Cancellation was tested against a simulated stalled request and restored enabled controls.

The default Overpass service is now VK Maps (`https://maps.mail.ru/osm/tools/overpass/api/interpreter`), whose small live Chennai café query returned three real OSM objects and permissive CORS. Full queries encountered upstream capacity failures/504s. Private.coffee timed out. Thus dependable exhaustive Overpass discovery remains an external limitation; do not claim every phase-2 network query passed. The client has a 45-second cap and explicit Cancel.

A clearly labeled fallback extracts real named POIs from the currently rendered map, filters by category and straight-line distance, and links map-only entries by coordinates instead of fabricating OSM IDs. It can be requested directly using “Explore visible map places” or used after an Overpass failure. It is viewport-limited, excludes transport/medical/education labels and infers categories from map tags. Initial camera zoom is 14 so POI labels are available. Real map-derived pins and pin detail selection were exercised in the browser. This is a useful resilient MVP, not an exhaustive nearby directory.

The installed Next/Turbopack dev runtime stalled before hydration; the same production export worked. Use `npm run build && npm run preview` to run on port 3001. Do not describe the development-runtime issue as fixed. `scripts/serve.mjs` uses only Node built-ins and serves the static export. Automated snapshots still timed out, but browser DOM/actions/network diagnostics worked. Real-phone permission prompts, visual screenshot QA and larger public traffic remain unverified.

Final browser check: viewport-bounded POIs extracted from loaded map source tiles produced 166 mapped places at Chennai zoom 14. Food filtering produced 42 pins (including KFC, Bombay Snacks Bar, Andhra Bhavan and MURUGAN idli). The fallback uses source features within map bounds, rather than only labels surviving collision placement. Categories remain tag-derived and may inherit mapping errors. This verifies usable real-data fallback discovery, not full Overpass service reliability.

## Next pending-feature slice (2026-11-16)

Implemented `lib/search-intent.ts` and `components/AdventureSearch.tsx`: a compact separate text-discovery form, local category/radius/café rules, mood category suggestions and explicit unverified/unapplied notices for budgets, hours and hidden-gem popularity. The original city search remains separate. Distances now support 0.1–10 km (including metre inputs), with a custom dropdown option for non-preset values. Apply searches currently loaded map places around the selected center; the same café subtype filter also applies to Overpass results. Clear word filters removes the subtype/mood preferences while retaining the selected category/radius.

Place details can display OSM description, street address, cuisine, raw mapped hours and HTTP(S) website links when supplied. No photos, ratings, live open/closed claims or verified prices were added. Surprise Me now uses current candidates/loaded map data first, avoids the current selected ID where alternatives exist, and only falls back to network discovery when necessary. `allowedDevOrigins: ['127.0.0.1']` addresses the explicit dev-HMR rejection logged in the prior session; it is not a blanket dev-origin wildcard.

Validation: discovery/parser/safe-link regression tests and static production build passed. New UI interactions have not been browser-verified in this pass. Remaining: licensed photos, stronger hidden-gem evidence/community tags, genuine Pixel map styling, complete phone/accessibility QA and later mini-adventures, mystery pins, badges and fog-of-war. Public Overpass capacity remains external and variable.

## Continued build: journal, adventures and mystery pins (2026-11-16)

Added `lib/adventures.ts`, `components/JourneyPanel.tsx` and `tests/adventures.cjs`. Journal offers short/variety/family three-stop suggestions, computed from real candidates without a routing API. Straight-line limits: 2 km short, 5 km other modes, plus discovery-radius restriction. Fewer than three candidates are reported honestly. Family suitability is not verified. Selecting a stop opens existing details/directions.

Manual visit toggles persist minimal place records locally under `explorearoundyou-visits`. Five badges: First Footstep, Beach Hunter, Café Hopper, Nature Explorer and Curious Explorer. There is no actual-visit or GPS verification. Reset requires two UI clicks and preserves bookmarks. Data validation rejects malformed records; duplicate IDs or equal names within 50 m merge. Mystery mode hides up to three stable result pins and reveals them on selection; no visit is recorded automatically. Reveals remain session-local.

All automated tests and static builds passed. New journal/mystery UI has not had real-device or browser interaction QA in this pass. Remaining: licensed photos, genuine pixel map styling, evidence-backed hidden-gem suggestions, optional fog-of-war, complete interaction/accessibility testing and ongoing public Overpass reliability. Do not declare the entire product complete.

## Optional accounts and history implementation (2026-11-16)

Added `lib/account.ts` (lazy Supabase client/PKCE), `components/useAccount.ts`, profile UI and an always-available guest fallback. Profile loading is isolated across users; same-user token refresh preserves loaded state. Transient profile errors expose Retry. Fixed switching from Profile to Saved/Journal/Discoveries. The database stores an editable display name and history consent, initially false. Only future submitted city/place searches and normalized discovery category/radius terms are recorded while consent is on. No automatic GPS history, background tracking, previous-search upload or social-graph access. Interests are simple explicit-category counts. Saved places and badges remain local.

SQL enforces per-user read/write/delete access, no anonymous table access, consent-checked writes, query/category validation, max 100 entries, 90-day visibility and pruning on writes. A daily SQL cron job is required to physically purge inactive expired records; documented. History deletion has confirmation and is available even when no recent rows are visible. Full Auth-identity self-service deletion remains unimplemented; operator deletion instructions are in setup.

Validation: `npm test` and production export passed. SQL authorization checks passed using a disposable PostgreSQL WASM engine (PGlite installed under `/private/tmp`, not a project dependency), covering two users, anonymous access, consent off/on/revocation, direct-write denial, bounds, expired records and deletion isolation. Native local PostgreSQL startup failed due to this Mac's shared-memory limit; no running database or system configuration was changed. `tests/auth-schema.mjs --pglite <module-path>` is the supported alternative. Real Supabase/OAuth, new account UI and physical-mobile QA have not run. Existing external map/geocoding/Overpass availability limitations remain.

## Interests, Explore repair and Nature 3D (2026-11-16)

Latest user request: collect interests during profile setup, suggest preferred places, fix Explore, and make the map look natural in 3D. Added editable interest chips, guest local persistence and account profile column (migration 002 for existing databases). Preferences rank real mapped results first and optionally filter via For you; no subjective suitability claims.

Identified flow defects: Explore waited up to 45 seconds on Overpass despite loaded POIs; categories cleared pins without repopulating; clicking a pin while a collection/list was open could leave details hidden. Fixed these: automatic map-POI discovery after load/filter changes, immediate Explore nearby and Surprise Me, explicit 20-second wider-area network action, consistent panel closing, and an Explore this area action after panning. Selecting the already active category no longer clears all pins. City search is labelled Find place to distinguish moving location from nearby discovery. Wider-area results remain bounded/provider-dependent.

Default camera is zoom 15, pitch 48°, bearing -12°, with a 2D switch. Actual style building extrusion heights remain unchanged. Nature colours are applied to real land/water/buildings and labels with light/dark palettes; removed whole-map CSS dimming. No elevation DEM, photorealistic satellite map or fabricated terrain. Max 60 rendered pins; list contains all selected results (up to 180). A nonfatal tile error no longer immediately replaces a loading map with the error overlay; the load deadline/retry remain.

Validation: regression tests, preferred ranking/distance/category tests, profile interest checks under two database identities (PGlite), migration idempotency, real OpenFreeMap style validation after light/dark transformations, live Nominatim Chennai lookup, and production export passed. Python urllib received HTTP 403 fetching style; curl successfully fetched the same style. No claim of new browser/mobile visual acceptance. OAuth remains unconfigured.

## Continued pending work: photos, sharing and usability (2026-11-16)

Added `lib/photos.ts` and `PlacePhoto`: opt-in photo loading only for explicit OSM Commons file references (no name matching/fabricated photo associations), supported CC BY/CC BY-SA/CC0 metadata, plain-text attribution, source and license links, restricted Wikimedia image hosts, 12-second cancellation and bounded cache. Public-domain/other licenses are currently declined rather than inferred. Actual Wikimedia now returns `thumb.wikimedia.org` as well as `upload.wikimedia.org`; the allowlist supports both. Verified three live Chennai photo metadata records parsed successfully and one actual thumbnail returned HTTP 200 image/jpeg. These test searches are not part of the app's photo-association logic.

Added safe place links/native sharing/copy fallback. Share URLs contain place name/category and coordinates only, are reconstructed from the app origin and strip unrelated query/hash tokens. Opening a valid share moves the center/camera and opens a sender-labelled place card. Invalid coordinates are ignored. No login needed.

Main Explore/Surprise controls moved above optional controls. Mood/journal/mystery moved into an expandable section. Panel mount/close focus handling added without trapping focus in these nonmodal panels. Added strict bookmark restoration so malformed optional fields or out-of-range coordinates cannot break rendering/navigation.

Tests cover photo source/license/attribution checks, missing data, cache/errors/abort, share round-trip/bounds/token exclusion and corrupt bookmarks; the existing suites and production build passed. New sharing/photo/mobile interactions have not been browser-tested. No paid API, new production dependency, credentials or backend added. See ROADMAP.md for current actual remaining work; older sections are historical.

## Next phase: local discovery-progress map (2026-11-16)

Implemented optional exploration mist via `ExplorationMist.tsx` and `lib/exploration.ts`. A pointer-transparent SVG overlay lightly mutes the map and cuts fixed-size clear halos around manually marked visits. It follows map movement/resize with animation-frame throttling and nearest-world longitude wrapping; up to 150 on-screen halos are rendered. This is cosmetic, not measured territory/route coverage. It does not add GPS tracking, backend storage or dependencies.

Mode is off by default and stored locally under `explorearoundyou-mist`. Toggle in More ways to explore or journal My progress; while active, an always-available map control turns it off. Existing visit records provide the data. Visited pins receive check marks and accessible status labels; only unvisited rendered pins are eligible for mysteries. Readable place lists remain available.

Journal now lists the most recent 50 visit marks for reopening/undo, plus current-candidate progress counts with explicit non-world-percentage wording. Existing two-step reset clears visits/badges/reveals while preserving bookmarks/interests. Map halos are derived, so undo/reset does not leave separate stale reveal records.

Tests passed for duplicate-source visit matching, nearby different names, distant same names, empty/reset states, finite/projected viewport coordinates, antimeridian handling and render limits. All existing tests and production build passed. New mist/3D/mobile and assistive-technology interactions still need browser/device acceptance. OAuth configuration remains outstanding; do not describe the whole product as finished.

## Pixel World phase (2026-11-16)

Replaced the CSS-only Pixel treatment with an actual MapLibre paint palette in `applyMapTheme`, covering land/water/vegetation/roads/buildings/label colours, sharp fill edges and flat extrusion shading. Four combinations (Nature/Pixel × light/dark) validate against the style spec. Geography, source definitions, layer filters/layout, real extrusion heights and readable label content remain unchanged. Theme effects are separated from camera effects, preventing theme/dark switching from resetting the camera. Nature is still the default; existing preference persistence and 2D/3D controls are retained.

Added nine original 12×12 SVG sprites, their generator and an allowlisted category-to-file mapper. Pixel map pins, category controls, mystery pins and destination marker use them; known pins keep accessible labels and visited checks. Markers fall back to normal glyphs on asset load failure. Assets are local and covered by MIT; no external font/icon service, additional library or raster-generation dependency. This is a pixel-inspired vector map, not voxel/pixelated terrain geometry.

Verification: all regression tests and static build passed. Theme tests cover distinct palettes, exact restoration of Nature on switching back and preservation of geographic/layer definitions and height expressions, against both a fixture and the previously fetched provider Liberty style. Sprite tests cover all categories, mystery/fallback selection, integer pixel bounds and self-contained SVGs. Local exported sprite returned HTTP 200 with image/svg+xml. New visual/browser/mobile acceptance remains pending; OAuth remains unconfigured.


## Cleaner discovery and richer cards (2026-11-16, local pending publication)

Replaced the horizontally scrolling category strip with a responsive grid. Optional kit controls are folded away, and mobile details hide the underlying kit. Kept Nature 3D, reduced pitch from 48 to 30 degrees, disabled accidental drag/touch rotation, removed duplicate base-map POI symbols, and retained 2D switching. Nearby pins are grouped by screen distance; tapping a count opens every member in a list, including co-located businesses. Ordinary pin selection no longer moves the camera; Surprise, city search, saved places and journal stops still can.

Food has eight explicit cuisine/type choices plus All food. Matching uses mapped cuisine tags or café type only. The Find this nearby action sends a bounded Overpass query; unknown cuisine is never guessed from a business name. Public Overpass returned HTTP 504 during this pass, so cuisine discovery is implemented but upstream availability remains unresolved.

Extracted PlaceCard with an on-selection, abortable detail lookup. Nominatim searches are bounded to the selected location and accepted only for one matching name/category/nearby record, or the exact known OSM object. A linked OSM Wikidata ID can supply description and Commons image; images still require supported license and attribution metadata. Photos now load automatically within opened cards. Missing details/photos remain explicit, with retry and usable save/directions. City and detail geocoding share a per-tab serialized queue and bounded cache. No new dependency or secret.

All regression tests and production export passed during implementation; actual phone/browser visual acceptance remains pending. An identified curl request to Nominatim returned the real Taj Connemara hotel and a same-name bus stop (the matcher rejects the bus stop); the default Node fetch was rejected.

Hosting blocker: Sites get_site for the existing manifest project returns NOT_FOUND, and the previous public URL https://explorearoundyou.lyric-6185.chatgpt.site now returns HTTP 404. No new Site was created and no URL change/deployment is claimed. Restore access to this existing Site or explicitly resolve its deletion/account ownership before publication. Local Codex CLI reports ChatGPT login for Satheesh V / vsp6692@gmail.com; this does not prove which account the Sites connector uses.

Follow-up live check using an identifying app User-Agent completed the full Taj Connemara lookup: exact OSM way 217645028, Wikidata Q7676703 description and linked Commons filename, with accepted CC BY 2.0 photo metadata. This validates the association pipeline against real responses, not the browser/device rendering. Bookmarks retain only validated OSM/Wikidata source references.


## Open-issue repair pass (2026-11-16)

Fixed map POI discovery loading: MapLibre stops using layers whose layout visibility is none. Duplicate icons/text are now hidden with paint opacity instead, retaining tile-source usage. The map parser preserves real optional tags, validates coordinates/types, classifies exact categories, and normalizes wrapped-world longitudes for APIs and visible marker projection. Overpass parsing isolates malformed entries/metadata, handles unreadable JSON/abort, deduplicates IDs and retains the explicitly queried category for dual hotel/restaurant objects.

Explorer keeps a bounded richer result pool while filters change and merges real map labels with network records, preserving loaded map results after online errors/empty responses. There are actionable empty states and an online Cancel control inside the result panel (the kit is hidden on mobile when that panel opens). Grouped lists are cleared before new searches. Submitted location search validates rows/bounds and has cancellation; closing pending details before searching releases their queued geocoder work.

Details/photo retries bypass caches, which now expire (partial details after one minute, full metadata after fifteen). Explicit OSM/Wikidata results use linked metadata directly rather than requiring Nominatim first. Match checks cover all categories. Queue cancellation settles promptly and skips aborted queued calls; repeated queued lookups reuse fresh data. Supported preferred Wikidata images take precedence. Missing detail fields offer Check for more details.

New regression files: tests/discovery-map.cjs, tests/discovery-pool.cjs, tests/detail-repair.cjs. All existing/new suites and static builds passed. No browser/real-phone acceptance is claimed. No added dependency. OAuth/Supabase setup and permanent hosting remain open; external discovery can still be slow or unavailable.

Public test tunnel: https://learners-individuals-easier-study.trycloudflare.com -> local static server port 3002. Public app and worker returned HTTP 200 after rebuilding. This is temporary and requires the Mac/server/cloudflared process to stay running. Current cloudflared binary is /private/tmp/explore-public-tools/cloudflared; the tunnel process was launched via the tool session, not installed as a login service. Existing Sites identity is preserved; no replacement Site was created.


## Shared app-design implementation (2026-11-17)

The user supplied three travel-app reference images and set the end goal as matching Android/iOS apps with the website using the same style. Implemented the website in that direction: warm off-white, charcoal controls, photo-led rounded cards, pastel collections and persistent Home/My Trips/Create/Map/Profile navigation. Home is now the default; shared-place URLs still open Map directly. This newer reference supersedes the earlier always-map-first homepage preference.

TravelApp owns one shared account hook and app navigation. Map is lazy-mounted on first use and retained while switching tabs. Explorer accepts explicit place/category requests, communicates bookmark/visit changes to Home/Profile, and offers Add to trip from real details. Selected/shared places are no longer cleared by a later filter-reset effect. Existing map discovery, cuisine controls, saved places and game features remain reachable.

New trips use validated localStorage records (100 trips, 100 places and 100 text memories per trip). Working creation/edit form, status filters/search, bookmark toggle, itinerary from actual saved places, local text memories, confirmed deletion and a photo tab for explicitly mapped stop images. No fake trips/counts/photos/reviews. Cover photos are decorative inspiration, locally hosted with per-image Commons licenses and visible Profile credits. Personal photo uploads and cross-device trip sync remain unimplemented.

Added standalone web manifest, original SVG/PNG icons, Apple home-screen metadata and safe-area viewport. This is a web app foundation, not completed native binaries or offline support. `docs/MOBILE_APP_PLAN.md` records the design contract and a proposed Capacitor/static-out native path, with real device, native permissions/OAuth, storage, signing and store steps still required.

Trip/domain regression tests and existing tests pass; static production build passed during implementation. Browser/real-device visual and interaction acceptance is not claimed. Prior public tunnel expired; create/verify a fresh one for handoff. Sites NOT_FOUND and unconfigured OAuth remain independent blockers.

Final handoff for this pass: fresh public test URL https://nut-influences-unknown-causing.trycloudflare.com points to the restarted static server on port 3002. Verified public HTML equals the local export and manifest/cover images/icons/map worker all return HTTP 200. Prior temporary URL is expired. Static server now sends proper manifest and JPEG/WebP MIME types. Regression suites, typecheck, static export and exported HTML/asset checks pass; mobile/browser visual acceptance is still pending. Native app binaries and store releases have not been created.


## One-tap visual discovery (2026-11-17)

Latest feedback: Map still had no area/place photos and selection required too much input. Added a persistent nearby photo-card rail and visual See all grid, with source/license links. Licensed photos also become image pins; tapping a card/pin opens that place directly. No generic photo is presented as a hotel/restaurant. A small real attributed Chennai area/landmark snapshot and local images load instantly at the default center; radius guards prevent reuse for unrelated locations.

`lib/nearby-photos.ts` finds nearby primary-coordinate Wikipedia pages, uses explicit Wikidata P18 Commons images, and accepts only supported author/license metadata. Requests are batched (Wikipedia, Wikidata, Commons), cancellable and cached. Known entity coordinates are preferred where available. Historical/admin/transport/medical/education titles and dissolved entities are filtered; area overviews are labelled separately. The live Chennai pipeline returned licensed real photos and image URLs were reachable. Restaurant/hotel photo coverage still depends on mapped explicit image/entity references; these can be batch-resolved without name guessing.

Map starts in the clearer flat view with optional 3D; moving over 650m refreshes discoveries after a 1.2s settle, avoiding an extra Explore this area tap. Food has five simple choices and searches on selection (debounced, respecting cooldown); Stays also searches on selection. The large Explorer Kit is closed behind Options; Surprise/Near me stay directly available. No extra form or confirmation was added. Existing advanced/game controls remain optional.

Selected preloaded photos render immediately in PlaceCard. Photo-loaded callbacks share metadata with the map; retry no longer depends on initial-photo prop changes. Wiki landmark detail records can use their explicit associations without a geocoder lookup. Public service outages and incomplete venue photo coverage remain real limitations. Browser/phone visual acceptance remains pending; regression and build checks are used here.


## Approved premium UX pass (2026-11-18)

The user approved the Stage 1 audit and asked to resume through all five stages. Implemented shared tokens/controls, map-first Explore with photo cards and a desktop sidebar/mobile preview, direct saving, source provenance fixes, full explicit cuisine choices, nonrepeating canonical Surprise selection, and Explore/Map/My Trips/Journal/Profile navigation. Previous Home remains reachable through Profile collections. Existing local storage keys, optional account APIs, map styles and exploration games are preserved.

Trip creation now includes a pending selected place atomically; stops can be moved with accessible buttons, optionally assigned valid trip dates, and all shown as numbered pins on a fitted map. The dedicated journal aggregates real notes and manual visit marks; new marks record optional timestamps, legacy marks stay undated. Trip/saved photo metadata loads near the viewport. Decorative fallback covers are explicitly labelled Inspiration. Optional visual interest themes project to the existing seven account categories; theme labels are separately scoped to each account/guest and stored only after a successful save. No onboarding blocks the map.

Runtime QA identified two additional defects and fixed them: changing a marker class discarded MapLibre positioning classes, placing pins in document flow; long photo-author metadata expanded the compact mobile card rail. Preserve engine classes on updates and bounded compact credits. Incoming provider styles now suppress duplicate POI symbols before rendering while retaining source tiles, and guard only the three confirmed road-shield null-number predicates.

All 19 regression suites and production static export pass. Browser checks covered 320×568, 390×844, 768×1024 and 1440×900, map/real photo load, Save/details/source restoration, cuisine navigation, Surprise rotation, first-place trip creation, adding/reordering stops, planned day, journal memory, reload, numbered all-stop map, preferences save/reload, light/dark and simulated location denial. Primary map controls are 44px with no page horizontal overflow. Final inspected browser console was empty. These checks do not certify physical devices, screen readers, real GPS, offline or configured OAuth. Full details: docs/design/IMPLEMENTATION_STATUS.md.

Public test link: https://closer-greatest-picked-unit.trycloudflare.com/ -> static server port 3002. Temporary: requires this Mac, preview and cloudflared to stay running. Existing Sites project appgprj_6afa62246b4c81919d3c04be09e677d2 still reports Sites project not found; no new identity or permanent deployment was created. Supabase/social-provider activation and native/store builds remain open.
