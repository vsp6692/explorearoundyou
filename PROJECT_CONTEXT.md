# Explore Around You — complete project handoff

Last updated: 2026-11-16 (Asia/Kolkata).

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
