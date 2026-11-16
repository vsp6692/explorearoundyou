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
