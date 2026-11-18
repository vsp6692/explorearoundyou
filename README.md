# explorearoundyou

**Status: unfinished; user reports the deployed experience is not working as expected.** Read [the complete project handoff](PROJECT_CONTEXT.md) before continuing. The project now lives at `/Users/satheesh/Work/explorearoundyou`; see the [relocation record](MOVE_PROJECT.md).

A playful, free, MIT-licensed map exploration website. Map-first discovery MVP.

Permanent hosting choice: **GitHub Pages**. [Deployment setup](docs/GITHUB_PAGES.md) · [Current repair/release status](docs/WEB_RELEASE_STATUS.md) · [Public support](https://github.com/vsp6692/explorearoundyou/issues). The target is not live until Pages is enabled and its deploy workflow succeeds.

## Run

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. `npm run build` produces a static site in `out/`. Deploy that directory to any static HTTPS host. HTTPS (or localhost) is required for browser geolocation.

## Six working levels

1. **First adventure (implemented):** interactive MapLibre world map, submitted place search, browser location, city shortcuts, responsive layout, theme preference, category selection.
2. **Discover nearby:** Overpass discovery, real category pins, bounded queries, caching and service failure handling.
3. **Meet a place:** place details, available photos, distance and directions.
4. **Your collection:** local favorites and Surprise Me.
5. **Explore your way:** natural text, distance filters, evidence-based hidden-gem suggestions; budget and mood only with reliable supporting data.
6. **Polish and share:** optional pixel theme, accessibility review, performance and deployment hardening.

## Repository and UI

- `app/page.tsx`: application entry point.
- `app/layout.tsx`: document metadata and global styles.
- `app/globals.css`: Tailwind import, responsive visual system and dark theme.
- `components/Explorer.tsx`: floating search, result choices, categories, adventure card, location status and theme persistence.
- `components/WorldMap.tsx`: browser-only MapLibre lifecycle, navigation and destination marker.

Live category pins come from explicit Overpass searches (1–10 km, at most 180 OSM elements per request). Results are cached in memory for ten minutes and requests time out after 45 seconds. These bounded results are not an exhaustive directory. Surprise Me chooses from returned places and flies to the selection. Distances are straight-line distances from the discovery center, not walking routes. Favorites are stored locally, with no account. Classic/Pixel switches change the interface and map color treatment; Pixel is an initial visual treatment, not a custom pixel tile set. No verified photos, prices, ratings, mood or hidden-gem claims are invented.

## External services and privacy

Map tiles/style are loaded from OpenFreeMap; place searches go to Nominatim. Attribution remains visible. Search is submitted explicitly (no autocomplete), throttled per tab and cached in memory. This small prototype uses the public geocoder: before wider launch, choose a provider appropriate to traffic and enforce any shared rate limit required by that provider. Public Nominatim has an application-wide usage limit that per-tab throttling cannot enforce.

Set `NEXT_PUBLIC_MAP_STYLE` and `NEXT_PUBLIC_GEOCODER_URL` at build time to replace these providers; the geocoder must support Nominatim-compatible search responses and browser CORS. Network access and WebGL are required. Provider availability is not guaranteed. Location is requested only when the user clicks a location button; the resulting map position causes tile requests to the tile provider. No application analytics or automatic location-history storage. Optional cloud accounts are described below. Theme, visual style and saved places are stored locally. Overpass receives the discovery coordinates when you explicitly search nearby. Set `NEXT_PUBLIC_OVERPASS_URL` to use another compatible endpoint.

## Verification

`npm run build` validates TypeScript and generates the static export. Browser visual QA and real-device geolocation still require manual validation. Check keyboard search/result selection, permission denial, mobile layout, theme switching, blocked network behavior and map navigation before public launch.

Contributions welcome. Keep dependencies minimal, preserve attribution and make each level independently usable.

## Reliable local preview

Run `npm run build` followed by `npm run preview` to serve the exact static export on port 3001. This avoids a development-runtime hydration issue observed with the currently installed Next/Turbopack version. Do not run a build against the same output while a development server is active. `PORT=3002 npm run preview` uses an alternate port.

Discovery now defaults to the VK Maps global Overpass instance (`https://maps.mail.ru/osm/tools/overpass/api/interpreter`), which returned real Chennai results during verification. This provider receives the coordinates and categories of explicit discovery requests. Override with `NEXT_PUBLIC_OVERPASS_URL` at build time. Public provider availability is still external to the app.

If Overpass is unavailable, discovery can use named places in loaded map tiles within the current viewport (also available through “Explore visible map places”). This is a limited viewport result set, not an exhaustive radius search. Zoom in for more detailed map data. Categories are inferred from map tags; map-derived entries link to their coordinates rather than an invented OSM object ID. The initial zoom is 14 to expose useful nearby labels.

## Text discovery and place information

“Search by mood or words” applies simple local rules around the selected location. Examples: `Quiet cafés within 3 km`, `Nature within 500 m`, `Fun for kids`. Categories and radii from 100 m to 10 km are supported; café searches also filter the mapped place type. The current implementation searches loaded map data immediately; Explore nearby uses the same filters for its bounded Overpass results. Use the separate city search to change location.

Mood terms suggest a category; they do not verify quietness, romance or suitability for children. Budget, hidden-gem popularity and time-sensitive requests are explicitly reported as unverified/unapplied. No paid AI service is used. OSM-supplied descriptions, addresses, cuisine, opening-hours strings and websites are displayed when present; hours are not interpreted as live open/closed status. Website URLs accept HTTP(S) only. Map-tile results often lack these extra fields.

Surprise Me first selects from current discoveries or loaded map data before requesting the network. Dependencies remain unchanged. `npm test` now covers the rule parser, radius bounds/units, café matching, unsupported price claims and safe external links, in addition to discovery tests. The development configuration explicitly permits `127.0.0.1` to address the observed blocked-HMR-origin warning; physical-device and development hydration behavior still need confirmation.

## Explorer journal and mystery pins

Use “Plan an adventure & view badges” to create up to three distinct stops from current discoveries (or map data when no discovery list is loaded). Short wander limits the straight-line sequence to 2 km; variety and family ideas use 5 km. The selected discovery radius still applies. Family ideas select relevant categories, not verified child-friendly venues. No route geometry, journey duration or opening-time guarantee is provided; inspect each stop and use its directions link.

Mark places visited manually in their details card to earn five local badges. Visit records contain place ID, name, coordinates, category and kind in `explorearoundyou-visits`; no background location tracking or server synchronization is used. Undo is available per place. The journal offers an explicit two-step reset that leaves bookmarks untouched. Invalid stored data is discarded. Same-name records within 50 metres are treated as one place for visits/plans to reduce duplicates across map tiles and OSM queries; this heuristic can merge adjacent same-name venues.

Optional mystery mode replaces up to three selected result pins with question marks. Clicking reveals the real place; this does not claim hidden-gem popularity or mark it visited. Reveals last for the current page session. Names remain available in the normal discovery list. Planner, progress validation, badge and deterministic mystery-selection logic have automated tests; interactive/mobile QA remains pending for these additions.

## Optional Google/Facebook accounts

The account integration is prepared with Supabase; no cloud project/provider credentials are configured yet. Guests can continue exploring. Once connected, the profile panel offers Google/Facebook login, an editable display name, opt-in future search history, category-interest counts and deletion controls. Search history is isolated by account with database row-level security. Bookmarks and badges remain browser-local.

Follow [the setup guide](docs/AUTH_SETUP.md) to provision Supabase, apply the SQL schema, configure OAuth callbacks, set the two public build variables and schedule retention cleanup. Do not put OAuth secrets or service-role keys into the frontend. Live-provider login, mobile account UI and cross-device behavior still need verification after configuration.

## Interests, immediate exploration and Nature 3D

Open Profile to choose Food, Fun, Stays, Beaches, Parks, Attractions and Shopping. Guest preferences save locally under `explorearoundyou-interests`. Connected accounts store explicit interests separately from history consent; guest interests are not silently uploaded. Matching categories rank first (distance breaks ties), show a star and can be isolated with “For you.” Surprise Me favours those interests when exploring Everything.

Pins now appear automatically from loaded map data, and category/radius changes refresh them. Explore nearby opens these discoveries immediately; it no longer waits on Overpass. “Search wider area · online” explicitly requests Overpass with a 20-second cap. Existing map results remain usable and Explore nearby can cancel that request. After dragging, use “Explore this area” to move the discovery centre. City search is labelled Find place; choose a result to move there. Map coverage remains limited to the visible loaded tiles.

Nature Explorer uses a 48° camera tilt, real mapped building extrusions, green land and teal water. Light/dark colours are applied through MapLibre paint properties rather than dimming the entire canvas. Switch to 2D for a flat view. This is a styled vector map with 3D buildings, not photorealistic imagery or elevation terrain. Up to 60 pins are rendered to reduce clutter; the full discovery list remains available. Pixel controls remain optional.

Existing Supabase installations must apply `supabase/migrations/002_profile_interests.sql`; new projects can use the updated `schema.sql`. Tests validate interest filtering/ranking, allowed private profile interests, and style-spec validity against both a fixture and the live Liberty style. Production build passed. New mobile/browser visual acceptance is still required.

## Place photos, sharing and mobile controls

Place cards can load Wikimedia Commons photos referenced by OSM's `wikimedia_commons=File:...` or a supported Commons `image` URL. Loading is opt-in, with a 12-second timeout and bounded in-memory cache. The app requests metadata first and displays only supported CC BY, CC BY-SA or CC0 files with attribution. It shows the file title, creator, credit, source and license links. Unsupported licenses, missing attribution, unknown image hosts or failed requests produce an explanation rather than a guessed picture. Photos are not searched by place name; map-tile discoveries often have no photo reference.

“Share this place” opens native sharing where available, otherwise copies a clean URL or provides a selectable link. Links include the selected place's name/category/coordinates; they exclude account tokens, profile interests, saved history and automatic GPS. Shared labels come from the sender and are explicitly described as such. The receiving page validates coordinates, moves the map and opens a place card.

Explore/Surprise actions now sit above the optional controls; mood, journal and mystery controls are under More ways to explore. Opened panels receive keyboard focus and restore the previous connected control when closed. Malformed saved places are discarded safely. Mobile visual/assistive-technology acceptance remains pending.

Current remaining work is maintained in [ROADMAP.md](ROADMAP.md).

## Exploration mist and visited collection

Open **More ways to explore → Exploration mist**, or use the journal's My progress tab. The optional overlay mutes unexplored map areas while small clear halos follow the places you manually marked visited. Marked pins have a check badge; unvisited pins are muted while this mode is active. Visited places are never chosen as mystery pins. The on-map “Mist on · turn off” button restores the normal view immediately.

This is a cosmetic game treatment, not a map of verified travel or geographic coverage. No route/GPS tracking is added. Reveals are fixed-size screen halos, follow the map camera in 2D/3D, handle the closest world copy and cap at the nearest 150 on-screen visit marks. The underlying map gestures, attribution and controls remain interactive.

The journal shows the latest 50 saved visit marks and counts matches among current candidates, not world-completion percentages. Open a visited place to undo its mark. Reset my progress removes visits, badges and reveals together after confirmation; bookmarks and interests remain. The mist preference is stored in `explorearoundyou-mist`; visit data continues using `explorearoundyou-visits`. It remains browser-local and is not synced by sign-in.

## Pixel World map theme

Use the Nature Explorer / Pixel World switch in the explorer kit. Pixel World now changes actual MapLibre paint properties: land, water, roads, vegetation, building colours, fill edges and extrusion shading. Light and dark variants are supported. Map labels, source data and real building heights remain intact. Switching themes does not reset your camera or reload tiles. The existing 2D/3D choice remains independent.

Category chips, place pins, mystery pins and the destination marker use nine original 12×12 SVG sprites served locally from `public/icons/pixel`. Labels, visited checks and exploration mist remain available. Map pins fall back to their normal glyph if an icon fails to load. The preference still uses `explorearoundyou-style`. No new API or dependency is needed.

This is a pixel-inspired vector-map style, not a voxel world or a replacement map engine. Geometry remains geographically accurate to the underlying dataset. To contribute icons, edit `scripts/generate-pixel-icons.mjs`, run `npm run icons:generate`, and commit the generated SVGs. They share the project's MIT license.
