# Current implementation and remaining work

Updated 2026-11-16. Builds and automated tests do not establish real-phone acceptance.

## Implemented

- Map-first exploration, submitted worldwide location search and permission-based location.
- Automatic discoveries from loaded map data; immediate Explore/Surprise; explicit bounded Overpass search.
- Category/radius rules, natural-text category suggestions, editable interests and preferred discoveries.
- Nature-style light/dark map, mapped 3D buildings, flat-view switch and local Pixel UI treatment.
- Local bookmarks, manually recorded visits, badges, mystery pins and three-stop ideas.
- Optional exploration mist, visited-pin checks and a journal collection of recent visit marks.
- Basic place details, external directions, licensed Commons photos when explicitly mapped and supported.
- Shareable place links, native share/copy fallback, simpler mobile controls and basic panel focus handling.
- Prepared optional Google/Facebook + Supabase profiles/history/interest integration; **not activated**.

## Next acceptance checks

1. On a real phone, verify map rendering and touch gestures, category changes, Explore, Surprise, place details, panel reachability and 2D/3D switching.
2. Verify shared links open correctly, native sharing/copy cancellation and photo success/failure states.
3. Verify saved places/interests/visits after reload, keyboard navigation, screen-reader announcements and location permission allow/deny. Check mist alignment while panning/tilting, on/off persistence and undo/reset clearing reveals.
4. Check the deployed origin under slow/offline conditions. External tiles/geocoding/Overpass/Commons can fail independently.

## Requires external configuration

- Create the owner's Supabase project and Google/Facebook OAuth applications; follow `docs/AUTH_SETUP.md`.
- Apply schema (or migration 002 to an existing project), set browser-public build values, enable providers and configure redirects.
- Configure history expiry cleanup and a real operator privacy/deletion contact before public sign-in.
- Test both providers, account isolation and cross-device persistence against the actual service. Full self-service Auth identity deletion is still pending.

## Further product work

- Pixel map sprites/style beyond the current square controls. Exploration mist is implemented as cosmetic screen halos, not geographic territory tracking.
- Better photo coverage from explicit, licensed associations. Public-domain/other photo licenses are not automatically supported yet.
- Evidence for hidden-gem popularity, verified pricing or ratings. These cannot be honestly implemented from the present data alone.
- Production-scale geocoding/discovery capacity and provider-wide rate limits. Per-tab throttling is insufficient for substantial traffic.
- Consolidate the large Explorer component and accumulated CSS once core phone acceptance is established.

No paid API was added. External services retain their own terms, availability and usage limits; no unlimited free hosting or data guarantee is implied.
