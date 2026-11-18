# Web release hardening — 18 November 2026

## Implemented in this change

- Versioned, bounded JSON backups for device trips/notes/stops, bookmarks, visits, interests and display settings. No auth tokens or unrelated local-storage keys are included.
- Previewed merge import keeps existing trip fields/matching notes, appends distinct stops/notes and detects a changed preview baseline.
- Multi-key writes use a before-image recovery journal; quota failures roll back. A recent journal is treated as an active write; after an interrupted operation wait at least 10 seconds before retrying recovery. LocalStorage is not a multi-tab transactional database.
- Raw recovery download and explicitly confirmed local deletion. Cloud identity/history are separate and are not deleted by this operation.
- Corrupt collection writes fail before overwriting previous values. Trip writes reject a changed storage snapshot to reduce lost edits between tabs.
- Screen/route recovery boundaries and skip-to-content links.
- Public Privacy and Sources pages, file attribution, public GitHub support links.
- Static GitHub Pages build prefix and deploy workflow; local root hosting remains supported.

## Validation

24 scripted suites pass, including new backup validation, merge preservation, private-key exclusion, stale preview rejection, quota rollback, interrupted recovery, scoped deletion and base-path/share-link tests. TypeScript check and optimized static export pass. Static export checks validate entrypoint resources, map worker, bundled photos, public information pages and manifest paths.

Actual headless Chromium checks at 390×844 and 1440×844 passed backup download, preview/merge import, persisted reload, invalid import rejection, guarded scoped deletion, privacy/credits navigation, horizontal-overflow and page-exception checks using an isolated QA browser context. No production/user records were used. A separate live-provider Chromium map check under the Pages prefix reached `ready`, reported 292 rendered features at zoom 15, and recorded no page exceptions or failed local assets. This does not replace physical Android/iOS acceptance testing, screen-reader testing or live OAuth testing.

## Remaining blockers / deferred work

1. **High / external:** Repository Pages source must be enabled by an administrator; target URL was 404 when checked. Verify actual workflow deployment and live map/worker/photo requests after activation.
2. **High / external:** Supabase project, Google/Facebook OAuth settings, real two-account RLS tests, retention job and private identity-deletion channel remain unconfigured/unverified. Guest exploration works without them.
3. **High / infrastructure:** Nominatim throttling is per browser, not aggregate. Public Overpass/Wikimedia/tile services can fail or limit requests; static hosting has no shared request budget or global cache. Select appropriately supported providers/proxy before significant public traffic. Coverage and photo availability remain source-dependent; no claim of exhaustive search.
4. **High / acceptance:** Verify real GPS permission flows, map loading and image reliability over mobile networks on physical Android/iOS. Previous location-controller tests do not establish real-device accuracy.
5. **Medium / product:** Shared trip editing, account trip synchronization, robust offline travel, native deep links/notifications and the React Native/Expo applications remain later roadmap work. Do not label them complete because the web UI includes trip/map screens.
6. **Medium / security:** Hosting response-header controls, dependency/security review and accessibility assistive-technology audit need launch review. No analytics, personal photo uploads or cloud journal sync were added.

The original seven audit reports remain historical evidence. This status file records the narrower completed repair slice and remaining dependencies; it does not certify the whole product as launch-ready.
