# explorearoundyou

**Status: unfinished; user reports the deployed experience is not working as expected.** Read [the complete project handoff](PROJECT_CONTEXT.md) before continuing. The project now lives at `/Users/satheesh/Work/explorearoundyou`; see the [relocation record](MOVE_PROJECT.md).

A playful, free, MIT-licensed map exploration website. Map-first discovery MVP.

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
