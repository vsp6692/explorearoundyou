# Location and trip blocker repairs

2026-11-18. Follow-up to the audit at baseline `83f63fe`; the audit reports remain historical snapshots.

## Changed

- Guard TripCover's loaded photo before dereferencing it. New empty trips, legacy stops without photo metadata and pending image loads retain labelled inspiration covers.
- Start Explore in a neutral world view and request browser location when the map is first opened. Existing granted permission works without an extra button. Unknown permission uses the browser's own prompt; no background tracking was added.
- Apply only fresh, valid GPS coordinates; retain accuracy and label approximate fixes. Denial/timeout/unavailable states explain what happened. Chennai is now explicitly an **example area** on failed startup, rather than presented as the user's neighborhood.
- Separate device origin from the exploration/camera center. Cards and details use device distance when known; area/radius filtering remains based on the selected exploration area.
- Cancel older GPS callbacks when a new request, manual city search, requested saved place, user map movement or navigation supersedes them. A camera flight's old move-end cannot reset the new search area.
- Explicit shared-place links retain their destination and selection. A “near me” category search requests a current fix instead of blindly using a remote map center.
- Stop automatic nearby searches while awaiting startup location and while the map screen is inactive. Existing provider outages remain separate from these fixes.

## Verification

- All **22** regression suites pass; static production export and its TypeScript check pass.
- New test renders the actual TripCover component through React's server renderer for empty, legacy photo-less and pending-photo trips. Uses the existing Next.js SWC compiler; no test/runtime dependency added.
- New location tests cover coordinate/age/accuracy validation, unsupported geolocation, denial, timeout, cancelled requests and out-of-order callbacks.
- Browser: first opening Map from Profile with simulated Paris GPS automatically invokes location and shows Your location.
- Browser: new photo-less trip creates successfully, accepts a journal note, survives reload and reopens without the audited crash.
- Browser: denied startup labels Chennai as an example and explains browser permissions. Manual London search remains selected after a late Paris callback.
- Browser: a shared Tokyo link stays selected. At 390×844, approximate GPS is labelled, “cafés near me” reacquires GPS and selects Cafés, with no page overflow.
- GPS was simulated in an isolated browser profile; physical-device permission/accuracy testing is still required. The final timeout-UI and public-form rechecks could not complete because browser automation repeatedly reported no available host. Controller timeout tests pass; the earlier local trip/GPS checks above completed. No successful final public-form check is claimed.

Remaining launch work includes provider reliability/coverage, permanent hosting, data export/recovery, broader UI error boundaries/accessibility and optional account/sync activation. This repair does not declare the product launch-ready.
