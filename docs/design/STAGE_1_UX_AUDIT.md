# Stage 1 — UX audit and proposed design foundation

**Product:** Explore Around You  
**Audit date:** 2026-11-17  
**Baseline:** `ca3a11d`  
**Scope:** Read-only product/code audit and browser inspection. No application code, dependencies, data schemas or deployed application behavior changed. Implementation awaits the user's approval.

## Main conclusion

The working discovery engine should be preserved. The most urgent problems are competing screen layers, interrupted journeys and incomplete photographic coverage. The next pass should simplify the structure around the existing map rather than replace its integrations or add more controls.

## What was inspected

- First-party routes/configuration, React components and hooks, domain/data helpers, three CSS layers, scripts, asset/attribution setup, local persistence, optional Supabase schema/migration and setup documentation.
- Public site in an isolated browser profile at **320×568, 390×844, 768×1024 and 1440×900 CSS pixels**. This emulates layout size; it is not a physical-device or screen-reader certification.
- Map startup, default photos, Food selection, place details, Save, Add to trip with no existing trip, trip creation, adding a saved stop, journal notes, reload restoration, dark-mode toggle and simulated location denial.
- `npm test` and `npm run typecheck`: **passed**. No application rebuild was necessary for a read-only audit.
- Browser warnings: missing provider sprite images (`sports_centre`, `office`, `gate`, `lift_gate`, `cycling`) and highway-shield filters receiving null instead of a number. Map remained usable. No uncaught error/unhandled rejection was recorded during the instrumented interactions before reload; this is not a claim that every path is error-free.
- Audit records were created only in the isolated browser profile. Existing user browser records were not changed.

This is an expert heuristic/source audit, not a completed user-research study. Actual outdoor GPS, iOS/Android webviews, screen readers, full offline behavior and live OAuth remain unverified.

## Current architecture and preservation contract

| Area | Existing implementation to preserve |
| --- | --- |
| Entry/navigation | Static Next.js export. `app/page.tsx` renders `TravelApp`; screens use React state. `?view=map` and shared-place query parameters open Map. |
| Map | MapLibre/OpenFreeMap, local worker, lazy initial mount and retained instance between tabs; explicit container sizing, flat/3D and Nature/Pixel light/dark themes. |
| Discovery | Loaded map POIs first; bounded Overpass searches; submitted Nominatim search/details; aborts, cooldowns, result merging and bounded caches. |
| Photographs | Explicit Wikipedia/Wikidata/Commons associations with license/author checks; real default-Chennai snapshot; no invented venue photos. |
| Saved/progress | Local saved places, manual visit marks, badges, optional mystery pins, three-stop ideas and cosmetic mist. |
| Trips | Create/edit, dates/status filters/search, bookmark, saved stops, text memories, mapped-stop photos and confirmed deletion; 100 trips and 100 stops/memories per trip. |
| Accounts | One shared account controller; optional Google/Facebook Supabase PKCE; guest fallback; interests and consented history. Not activated against real providers. |
| Privacy | RLS/account isolation, history default off, 100-row/90-day history bounds, no automatic GPS history or upload of existing local collections. |
| Build | Next.js/TypeScript/Tailwind/static `out/`; existing public environment-variable provider overrides; no new production dependency required for the design pass. |

Preserve these browser keys and their records: `explorearoundyou-trips`, `explorearoundyou-saved`, `explorearoundyou-visits`, `explorearoundyou-interests`, `explorearoundyou-theme`, `explorearoundyou-style`, `explorearoundyou-mist`. Any added fields must be optional/additive, with regression fixtures for existing data. Current Supabase category allowlists cannot be renamed casually.

## Prioritized findings

### P1 — Address before visual embellishment

1. **Small-phone controls are obstructed. [Runtime confirmed]** At 320×568, top controls occupy y=137–307 while the card rail starts at y≈252. Surprise Me, Near me and Options are covered at their center hit points by the card header/See all control. At 390×844, the two headers take 124px, top controls 131px and the card rail about 257px; only about 180px lies between the action row and rail. Food's extra wrapping increases crowding. Source: `app/app-design.css` final responsive positioning rules; `Explorer.tsx:112–120`.
2. **Details hide most of the map. [Runtime confirmed]** A selected place opens a 491px-tall scrolling panel at 390×844. No compact/expanded state exists. Missing photos still consume a large gradient placeholder. Source: `PlaceCard.tsx:22–43`.
3. **Photographic coverage is inconsistent. [Runtime confirmed]** All four default landmark photos loaded, but the first 12 Food cards had zero photographs. Overpass returned HTTP 200 after about 10.5s. This is a content-coverage issue, not proof that image rendering is broken. Redesign missing-photo cards and improve only explicit real associations; never substitute unrelated restaurant/hotel imagery. Source: `nearby-photos.ts`, `photos.ts`, `DiscoveryCards.tsx`.
4. **Create trip from a selected place loses context. [Runtime confirmed]** Starting from KFC → Add to trip → Create a new trip produced a trip with zero stops. The user must re-add the saved place. Carry the pending place through successful creation. Source: `TravelApp.tsx:24,35`.
5. **Source attribution does not survive restoration. [Runtime confirmed]** A saved Wikipedia landmark had a Description source link before reload; reopening the saved item after reload lost that link. Its description remained. `readBookmarks` accepts only Wikidata description-source URLs; trip restoration uses the same parser. Source: `lib/bookmarks.ts:12`, `lib/trips.ts:24`.
6. **A source page is called an official website. [Runtime confirmed]** The landmark's “Visit official website” link points to Wikipedia. Separate source/reference URLs from real venue contact URLs. Source: `nearby-photos.ts:17–18`, `PlaceCard.tsx:36`.

### P2 — Core usability and engagement

- **No selected-marker state. [Source]** `WorldMap` receives no selected ID. It rebuilds marker DOM on state changes and movement, which can discard keyboard focus. Photo groups announce Browse N but open one anchor place. Preserve the MapLibre lifecycle; add keyed marker updates, a selected visual and truthful accessible names. `WorldMap.tsx:16,32–50`.
- **Discovery cards lack Save and a short description. [Runtime/source]** Saving requires opening details. Photo-first sorting can override preference-first relevance. Failed image state is keyed only by place ID and can suppress a refreshed image URL. `DiscoveryCards.tsx:7–9`, `interests.ts:14–16`.
- **Distance lacks a clear origin. [Runtime/source]** Badges say 152m/0.1km away, but calculations use the discovery center, not necessarily the user's location. The header never identifies the selected area. Use “from map area” unless GPS is the known origin; show the selected destination in the compact header.
- **Journal and visited collections are hard to reach. [Runtime/source]** No dedicated Journal tab. Your journal opens Trips; recent-memory links land on Itinerary. Been there opens Profile. `TravelApp.tsx:15,37`, `HomeScreen.tsx:11,13`, `TripScreens.tsx:10–11`.
- **Trips lack organization and a trip-wide map. [Source]** No rearranging/day organization; Map opens only the first stop. Use Move up/down controls before optional drag and show all itinerary stops with fitted bounds. `TripScreens.tsx:22–24`.
- **Surprise can repeat A→B→A. [Source]** Only the currently selected ID is excluded, without canonical matching across map/OSM sources or recent suggestion history. Add a small recent-history window and show a factual reason (mapped type, description, explicit interest match). `Explorer.tsx:49–53`.
- **Preferences require careful taxonomy changes. [Source]** Current profile/SQL supports seven data categories, while the new brief asks for more user-facing interests/categories. Preserve old values; use display aliases/subtypes and an additive migration where necessary. No map access gate or forced onboarding.
- **Controls/text are too small. [Runtime/source]** Category targets are 34px tall; cuisine choices 31px. Labels reach 9px and photo credits 6px. Several muted/eyebrow/placeholder colour combinations are below the proposed 4.5:1 text target. Standardize 44px hit areas and readable supporting text.
- **Desktop remains a wide mobile overlay. [Runtime]** Floating controls are spread across a large map and the bottom rail stretches horizontally; there is no deliberate results/detail column. Give desktop a resizable-free, bounded side panel and reserve the map area.

### P3 — Foundation and release readiness

- CSS totals **84,429 raw bytes** across `globals.css`, `trips.css`, `app-design.css`, with repeated overrides and hardcoded geometry. Six app colours exist but no shared spacing/type/control scale. Consolidate incrementally; preserve the explicit `.canvas > .map.maplibregl-map` sizing fix and stylesheet-order behavior.
- React state navigation does not represent screen/trip context in browser history. Add predictable Back and deep-link behavior incrementally.
- Decorative scenic covers can be mistaken for the destination. Prefer a genuine saved-stop photo; visibly label inspiration covers when used.
- Provider style/sprite warnings should be resolved without replacing map rendering. Surface a usable data fallback if a provider fails.
- Temporary hostname changes strand access to origin-local storage. Stable hosting is necessary for reliable repeat use. Do not imply cloud sync or permanent retention from a temporary tunnel.
- README/auth setup contain obsolete UI/timeout/hostname details. Keep documentation aligned with verified behavior.

## Proposed design direction

**Identity: a warm, quiet explorer.** Keep the compass brand, paper-like background and charcoal selection. Photography provides colour; sage, peach and lilac are restrained accents. No extra dashboards, artificial urgency, fabricated ratings or decorative notifications.

### Navigation and information architecture

Use **Explore · Map · My Trips · Journal · Profile** on mobile. Move Create to a clear action inside Trips and contextual Add to trip. Explore offers visual nearby discoveries with map context; Map expands geographical browsing. Both share filters, selection and the existing map instance. First-time users encounter discovery, not an oversized trip-planning hero.

Desktop uses compact top navigation, an approximately 340–380px results/detail column and the remaining width for the map. The column can close; avoid a bottom navigation bar spanning a desktop monitor.

### Proposed map structure

- One compact header: selected area (clearly distinguished from GPS), search, profile/preferences.
- One horizontal category row on mobile, with clear selected state and 44px hit areas. Café/Nature/Adventure/Activities labels map to supported underlying categories/subtypes, rather than corrupting stored categories.
- Map controls in one reserved corner. Near me remains immediately reachable. Surprise is visible but secondary to browsing; all optional game/theme controls live under one More entry.
- A **compact preview**, around 112–144px when a place is selected, containing a photo/appropriate fallback, name, category, correctly labelled distance, Save and Directions.
- A clear Expand control opens full details in a sheet; dragging may be optional, never the only mechanism. Preserve map gestures and attribution when collapsed.
- Discovery cards have a unified photo ratio, name, factual short description, distance provenance and a one-tap save target. Empty photo coverage uses a compact, honest treatment instead of a large error-looking panel.
- No Popular, Hidden gems, rating stars or Open today claims unless backed by explicit trustworthy fields. Start with source-supported Nearby landmarks, Food spots, Nature nearby and Saved for later.

### Proposed foundation tokens

| Token | Proposal |
| --- | --- |
| Background / surface | `#FBF7F4` / `#FFFDFC` |
| Primary text / supporting text | `#28252B` / `#6D656C` |
| Primary action | Charcoal, white label; one prominent action per region |
| Accent surfaces | Sage `#E8EDDF`, peach `#F5E4DA`, lilac `#ECE3F3` |
| Focus | `#76558F`, visible outline; test on light/dark actual surfaces |
| Type | Body 16px; secondary 13–14px; supporting minimum 12px; page headings 24–28px |
| Spacing | 4, 8, 12, 16, 24, 32px |
| Radii | 12px controls, 20px cards, 28px sheets |
| Touch targets | Minimum 44×44px, without forcing every visual icon to be large |
| Motion | 160–220ms purposeful transitions; reduced-motion override |
| Shadows | One restrained elevation for sheets/floating controls; quiet cards |
| Photography | Consistent ratios, lazy loading, explicit association and readable attribution; no fabricated venue imagery |

Dark mode needs its own tested token pairing, not just inherited pastel backgrounds with swapped text.

### Reusable component plan

Standardize the existing AppIcon and introduce/reuse Button, IconButton, CategoryChip, Photo (with attribution/fallback), PlacePreviewCard, Compact/Expanded BottomSheet, EmptyState, Skeleton and feedback components. Derive their variants from tokens. Replace affected sections in place, one stage at a time; do not rewrite the app or introduce a new UI library.

## Incremental stage gates after approval

1. **Foundation:** shared tokens/primitives and a small component reference; no persistence or API contract changes. Typecheck/tests and visual checks at the four audited sizes.
2. **Explore/Map:** one layout system, horizontal mobile categories, selected marker, compact/expanded sheet, non-overlapping controls, desktop results column. Verify keyboard focus and map usability.
3. **Place discovery:** card save/description, honest photo fallback, cuisine choices, canonical recent Surprise history and source/contact correctness. Test save/reload and provider failures.
4. **Trips/Journal:** pending-place handoff, rearrange controls, trip-wide map, dedicated journal and direct entry context. Preserve existing records and confirm reload/delete behavior.
5. **Preferences/polish:** skippable interest card, additive taxonomy mapping, states/motion, keyboard/screen-reader and phone acceptance. Keep personal photo uploads/cloud sync out of scope.

For each stage: run the app, existing tests and typecheck; inspect console/network; exercise affected flows; check small/large mobile, tablet and desktop; verify legacy-data restoration; fix regressions before moving forward.

## Approval requested

Approve the design direction and staged plan before application implementation begins. This audit document is the only planned repository addition in Stage 1; no product code has been changed.
