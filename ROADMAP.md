# Current implementation and remaining work

Updated 2026-11-17. Builds and automated tests do not establish real-phone acceptance.

## Shared web and native design direction

The supplied travel-app references define the visual target for web, iOS and Android: warm backgrounds, photo cards, pastel accents and Home/My Trips/Create/Map/Profile navigation. See `docs/MOBILE_APP_PLAN.md`. The website now implements that app shell plus device-local trips, itineraries and text memories. Native shells, device integration and store builds are still future work.

## Implemented

- App-style Home, My Trips, Create, Map and Profile navigation, with desktop responsive layouts.
- Local trip creation/editing, date status filters/search, saved-place itineraries, text journal entries and mapped-stop photo gallery.
- Real interactive map, submitted worldwide location search and permission-based location.
- Home-screen manifest, original icons and mobile safe-area support; no offline map claim.
- Automatic discoveries from loaded map data; immediate Explore/Surprise; explicit bounded Overpass search.
- Category/radius rules, natural-text category suggestions, editable interests and preferred discoveries.
- Nature and Pixel World light/dark map palettes, mapped 3D buildings, flat-view switch and original local pixel sprites.
- Local bookmarks, manually recorded visits, badges, mystery pins and three-stop ideas.
- Optional exploration mist, visited-pin checks and a journal collection of recent visit marks.
- Selected-place detail matching, external directions, automatically loaded licensed Commons photos from explicit OSM/Wikidata associations.
- Responsive category grid, separated pin groups, gentler Nature 3D, and cuisine choices based on mapped tags (public discovery service still unreliable).
- Shareable place links, native share/copy fallback, simpler mobile controls and basic panel focus handling.
- Prepared optional Google/Facebook + Supabase profiles/history/interest integration; **not activated**.

## Next acceptance checks

0. Test Home → create trip → save a real map place → add to itinerary → add memory → reload → reopen and find the stop on Map. Confirm failure notices under denied/full browser storage. Personal photo uploads, trip cloud sync and native apps are not yet built.

1. On a real phone, verify map rendering and touch gestures, category changes, Explore, Surprise, place details, panel reachability and 2D/3D switching. Check Nature/Pixel and light/dark combinations, icon legibility and switching without camera resets.
2. Verify shared links open correctly, native sharing/copy cancellation and photo success/failure states.
3. Verify saved places/interests/visits after reload, keyboard navigation, screen-reader announcements and location permission allow/deny. Check mist alignment while panning/tilting, on/off persistence and undo/reset clearing reveals.
4. Check the deployed origin under slow/offline conditions. External tiles/geocoding/Overpass/Commons can fail independently.

## Public testing and permanent hosting

A temporary public test link serves the current local static export: https://nut-influences-unknown-causing.trycloudflare.com. It requires this Mac, the app server on port 3002 and the cloudflared process to remain running. It is not permanent hosting.

The existing Sites project still returns NOT_FOUND and its last ChatGPT URL returns HTTP 404. Restoring that Site/account connection or configuring permanent hosting is still needed.

## Latest repairs

- Hidden basemap POI icons now retain their source tiles; map discoveries also handle wrapped longitudes and malformed provider records.
- Empty/failed wider searches preserve loaded discoveries. Richer results remain usable when changing filters; recovery buttons and cancellation stay available in the mobile result panel.
- Selected-place/photo caches expire, retries refresh metadata, explicit OSM/Wikidata associations can bypass the geocoder, and queued geocoder cancellation settles promptly.
- Location search validates provider rows, offers Cancel and closes pending detail lookups before queueing a city search.

Automated regression checks and static build pass. Real-phone rendering and interaction acceptance remain pending.

## Requires external configuration

- Create the owner's Supabase project and Google/Facebook OAuth applications; follow `docs/AUTH_SETUP.md`.
- Apply schema (or migration 002 to an existing project), set browser-public build values, enable providers and configure redirects.
- Configure history expiry cleanup and a real operator privacy/deletion contact before public sign-in.
- Test both providers, account isolation and cross-device persistence against the actual service. Full self-service Auth identity deletion is still pending.

## Further product work

- Visual refinement after real-phone acceptance. Pixel World now has map styling and sprites; geometry remains vector-based. Exploration mist uses cosmetic screen halos, not geographic territory tracking.
- Better photo coverage from explicit, licensed associations. Public-domain/other photo licenses are not automatically supported yet.
- Evidence for hidden-gem popularity, verified pricing or ratings. These cannot be honestly implemented from the present data alone.
- Production-scale geocoding/discovery capacity and provider-wide rate limits. Per-tab throttling is insufficient for substantial traffic.
- Consolidate the large Explorer component and accumulated CSS once core phone acceptance is established.

No paid API was added. External services retain their own terms, availability and usage limits; no unlimited free hosting or data guarantee is implied.
