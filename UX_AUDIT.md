# UX and design audit

Audit date: 2026-11-18  
Repository: `/Users/satheesh/Work/explorearoundyou`  
Baseline: `83f63fe221a44aef40267dac9c5d3a3112af2b87`  
Mode: audit only. No production code, dependencies, migrations or deployments changed.

Statuses: **Implemented and verified** = directly exercised or verified by an appropriate domain test (scope stated); **Partially implemented** = working subset with gaps; **UI present but functionality missing** = visible flow cannot deliver its promise; **Not implemented** = no implementation found; **Unable to verify** = evidence/access insufficient. A passing domain test is not UI verification. Recommendations below are proposals awaiting approval.

The warm, photographic, map-led direction is appropriate. The largest problems are correctness and confidence, not decorative polish. This is an expert inspection with simulated viewport/GPS tests; no interviews or measured retention study were performed.

| ID / feature | Status | Evidence | Missing / recommended solution | Priority | Dependencies |
|---|---|---|---|---|---|
| U01 First open / location | Partially implemented | Fresh public UI says Chennai and “around you”; GPS is a secondary compass icon | Prioritize “Use my location”, discover granted permission automatically, label fallback as “Exploring Chennai”, and keep destination search available | Critical | F01 |
| U02 Trust in nearby recommendations | Partially implemented | Online failure message while loaded map/photo results remain | Show source, area, distance reference, freshness and incomplete coverage. Do not imply a count represents every business | High | F03, F05 |
| U03 New-trip journey | UI present but functionality missing | New-trip crash reproduced, form never appears | Fix F02 before visual refinements; accessible recovery action preserves draft/previous saved state | Critical | F02, UI tests |
| U04 Search intent clarity | Partially implemented | Named-place geocoding and simple discovery phrases take different paths | One clear search surface; explicit area context; explain no match vs provider failure; no extra mandatory forms | High | F06, F07 |
| U05 Map/detail balance | Partially implemented | Compact mobile preview + expanded sheet, desktop side panel; 390px viewport inspected | Test real touch panning, software keyboard, safe areas, attribution and GPS reachability across short/landscape screens | High | Device matrix |
| U06 Navigation | Partially implemented | Five tabs work by view state; Map and Explore share engine; Home is secondary; trip ID/section not represented in stable route | Define Explore inspiration vs Map browsing; provide persistent trip/entry routes and predictable back/restore | Medium | Shared navigation contract |
| U07 Photos / credibility | Partially implemented | Real default-Chennai images, licensed photo loader, placeholders, decorative covers | Maintain graceful no-photo cards; benchmark hotel coverage; audit description licensing and full credit access in every layout | High | Provider/rights review |
| U08 Preferences | Partially implemented | Ten optional themes project to seven categories; mood traits not verified | Explain broad matching, skip/change easily; avoid claiming learning from searches or verified family/quiet suitability | Medium | F18, O06 |
| U09 Empty / loading / failure | Partially implemented | Skeletons, timeouts/cancel, no-matches and service-failure text exist; trips crash bypasses intended UI | Distinguish no permission/no source/no results/offline/failed save; announce status without repeated screen-reader noise | High | F02, F03, F10 |
| U10 Accessibility | Unable to verify (full conformance) | Icon labels, focus treatment and reduced motion exist; no screen-reader run | Keyboard-only complete journeys; non-map list equivalent; selected-pin announcements; contrast measurement; dynamic text/zoom; focus restoration in sheets/dialogs | High | VoiceOver/TalkBack, browser tests |
| U11 Family use and consent | Partially implemented | No required account; notes and local data; external services receive location/search requests | Plain-language privacy, no background tracking, no targeted nudges; assess child-directed audience obligations before marketing to children | High | Privacy review |
| U12 Planning UX | Partially implemented | Ordered stops/date input; no travel-time or duration model | Day grouping, clear dates and unscheduled section; accessible reorder actions retained; explicit routing limitations | Medium | F14 |
| U13 Journal UX | Partially implemented | Aggregated text notes/manual visits exist in code | Verify real journeys after F02; note timestamps vs visited dates, export and recoverability; no decorative photo passed as memory | Medium | F02, F09, F15 |
| U14 Desktop performance / maintainability | Partially implemented | Desktop rail and side panel; several layered legacy CSS files and retained hidden map | Profile GPU/network/memory while switching tabs; suspend unnecessary hidden discovery; consolidate tokens/obsolete overrides incrementally | Medium | Performance measurements |

## Acceptance journeys

1. First visitor: permission unknown → explain/request → correct area; deny/timeout → labelled fallback/search; already granted → locate without repeated onboarding.
2. Shared destination: open link in another city → keep explicit destination; “Near me” intentionally returns to current GPS, not that shared city.
3. Search a known café/hotel → correct identity → available photo/details → save → reload → reopen. Check no-photo and provider-failure cases.
4. New empty trip → optional dates → add saved place → reorder/assign day → journal note → reload. Currently blocked by F02.
5. Keyboard/screen reader and physical iOS/Android: use lists, select pin, expand/close sheet, switch tabs, handle keyboard and directions handoff.

No animation, redesign or new onboarding should be prioritized ahead of location correctness, trip stability and reliable discovery.
