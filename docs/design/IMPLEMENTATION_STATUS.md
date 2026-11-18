# Premium discovery implementation

Updated 2026-11-18. The user approved implementation after the Stage 1 audit.

## Completed stages

1. **Foundation:** shared warm-paper, sage, peach and lilac tokens; readable typography; reusable buttons, icon controls, skeletons and empty states; dark equivalents.
2. **Explore and Map:** map-first Explore, horizontal categories, desktop discovery panel, compact expandable mobile preview, stable selected markers and separated controls. MapLibre positioning classes are preserved during marker updates. Map remains mounted between tabs.
3. **Discovery:** real photo cards and image pins, direct saving, factual descriptions, explicit cuisine choices, canonical Surprise rotation and preference-aware ordering. Wikipedia/source links retain provenance after reload and are labelled separately from venue websites. Long photo credits cannot stretch the compact rail; full credits remain in details.
4. **Trips and Journal:** five-tab Explore/Map/My Trips/Journal/Profile shell, desktop navigation rail, atomic creation with the selected first stop, accessible stop reordering, optional planned dates, numbered all-stop maps, real trip covers where explicitly linked, and an aggregated journal. Legacy records keep their existing keys and array order. New visits may have a date; old visits stay undated.
5. **Preferences and polish:** optional skippable interest prompt, ten visual themes mapped to existing categories, scoped theme-label persistence, deferred photo metadata for saved/trip cards, reduced-motion styles, focus states, safe areas and responsive controls. On short screens the interest prompt is omitted to preserve map-control access; preferences remain available from Profile.

## Verification

- All 19 regression suites and the static production export pass. TypeScript is checked by the build.
- Browser layout checks: 320×568, 390×844, 768×1024 and 1440×900 CSS pixels. No page horizontal overflow; primary map controls are 44px. Desktop uses an 88px navigation rail; mobile uses a 64px dock plus device safe area.
- Browser flows: loaded real map/POIs and licensed photos, select/expand a place, direct save and source restoration, cuisine choices, distinct Surprise results, trip creation from a place, second stop, reorder, planned day, memory, reload restoration, all-stop numbered map, optional interests save/reload and light/dark rendering.
- Simulated location denial retained discovery and showed a useful message. Map provider sprite/filter warnings were fixed by targeted style preparation; inspected final browser console contained no entries.
- Visual checks caught and fixed DOM marker positioning and oversized compact cards that the build could not detect.
- Test records were created only in an isolated browser profile, not the user's regular browser.

These are browser viewport checks, not physical iOS/Android, screen-reader, real outdoor GPS, offline or live OAuth certification. Map tiles, geocoding, Overpass and Wikimedia can still fail independently. Venue photo coverage is incomplete; no substitute venue photos, ratings, popularity or price claims were invented.

## Publication

Existing Sites identity is unchanged. The connector reports `Sites project not found`; no replacement Site was created. Current public testing uses a temporary Cloudflare tunnel and requires the Mac, local port 3002 server and tunnel process to keep running. Google/Facebook authentication still needs the user's configured Supabase/OAuth service. Native binaries and store releases remain future work.
