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

Live category pins come from explicit Overpass searches (1–10 km, at most 180 OSM elements per request). Results are cached in memory for ten minutes and requests time out after 25 seconds. These bounded results are not an exhaustive directory. Surprise Me chooses from returned places and flies to the selection. Distances are straight-line distances from the discovery center, not walking routes. Favorites are stored locally, with no account. Classic/Pixel switches change the interface and map color treatment; Pixel is an initial visual treatment, not a custom pixel tile set. No verified photos, prices, ratings, mood or hidden-gem claims are invented.

## External services and privacy

Map tiles/style are loaded from OpenFreeMap; place searches go to Nominatim. Attribution remains visible. Search is submitted explicitly (no autocomplete), throttled per tab and cached in memory. This small prototype uses the public geocoder: before wider launch, choose a provider appropriate to traffic and enforce any shared rate limit required by that provider. Public Nominatim has an application-wide usage limit that per-tab throttling cannot enforce.

Set `NEXT_PUBLIC_MAP_STYLE` and `NEXT_PUBLIC_GEOCODER_URL` at build time to replace these providers; the geocoder must support Nominatim-compatible search responses and browser CORS. Network access and WebGL are required. Provider availability is not guaranteed. Location is requested only when the user clicks a location button; the resulting map position causes tile requests to the tile provider. No app server, accounts, analytics or location storage. Theme, visual style and saved places are stored locally. Overpass receives the discovery coordinates when you explicitly search nearby. Set `NEXT_PUBLIC_OVERPASS_URL` to use another compatible endpoint.

## Verification

`npm run build` validates TypeScript and generates the static export. Browser visual QA and real-device geolocation still require manual validation. Check keyboard search/result selection, permission denial, mobile layout, theme switching, blocked network behavior and map navigation before public launch.

Contributions welcome. Keep dependencies minimal, preserve attribution and make each level independently usable.
