# Remaining work, in execution order

Updated 18 November 2026. Work through one phase at a time. Preserve guest access and existing device data. A completed build alone does not satisfy a phase.

## Phase 1 — Permanent public website (completed)

- Diagnose the failed Pages workflow, activate the approved GitHub Actions publishing source and publish the verified static export.
- Check HTTPS entrypoint, prefixed JS/CSS, MapLibre worker, manifest, bundled photos, privacy and credits routes.
- Check the deployed map and discovery interaction; document provider or physical-device verification limits.
- Exit: successful deploy and reachable permanent URL with functioning core assets/map.

Evidence: run 44237420619 passed build, all tests and export validation, then failed in configure-pages with “Get Pages site failed / Not Found”. Public repository metadata subsequently changed to has_pages=true. Triggering a fresh run will determine whether activation resolved the failure. If settings still block deployment, repository administrator access is required; do not request passwords in chat.

Completion evidence: deployment run 44280081242 succeeded. The public entrypoint, worker, manifest, bundled photo, privacy and credits returned HTTP 200. Live headless mobile Chromium rendered 292 map features at zoom 15, with no page exceptions, failed own-host assets or horizontal overflow. Physical-device acceptance remains in Phase 4.

## Phase 2 — Reliable discovery (in progress)

- Validate current-location startup, denial/timeout recovery, manual city precedence and stale-request cancellation on phones.
- Recheck city versus nearby search routing, cuisine/category filters, recommendation distance and repeat-free Surprise Me.
- Improve coverage diagnostics, provider failure/retry states, caching and photo/detail fallbacks without inventing ratings or images.
- Define supported provider capacity and aggregate request-budget strategy before significant traffic. GitHub Pages cannot host a server proxy.
- Exit: reproducible nearby discovery and useful recovery for failed/missing provider data across representative areas.

First repair: retain supported food-court, accommodation, nature, attraction and activity map types that were silently dropped by the loaded-map parser. Added category regression checks; this improves supported coverage and does not promise exhaustive place listings.

## Phase 3 — Real accounts and privacy

- Configure the owner's Supabase project and apply reviewed schema/migrations.
- Connect Google and Facebook; verify success, cancellation, refresh, sign-out and separate-user access.
- Verify optional interest/history persistence, consent, history deletion, retention scheduling and a private identity-deletion process.
- Exit: real provider and two-account authorization tests pass. Guest access remains available.
- Dependency: owner-controlled service/provider configuration. Existing prepared login code is not active login.

## Phase 4 — Web public-release acceptance

- Physical Android/iPhone and tablet/desktop checks for GPS, map touch behavior, sheets, navigation, keyboard and safe areas.
- Assistive-technology, contrast/focus and reduced-motion checks; fix observed issues.
- Review dependency/security findings, provider/image licensing, data retention and hosting limitations.
- Exit: explicit release checklist with test evidence and no unresolved critical/high release blockers.

## Phase 5 — Connected trips and offline travel

- Design shared API contracts, ownership and migrations around existing local trip models.
- Implement opt-in saved-place/trip/journal synchronization with conflict handling and safe guest-data migration.
- Add deliberately bounded offline storage compatible with provider redistribution licenses; handle reconnect and deletion.
- Collaborative trip editing follows ownership/synchronization foundations.
- Exit: device-local records remain recoverable; cross-device and offline/reconnect tests pass.
- Dependency: Phase 3 backend, privacy/retention decisions and a supported data/offline license strategy.

## Phase 6 — Android and iOS

- Incrementally extract shared TypeScript models/validation/discovery logic; retain the existing website.
- Build React Native/Expo screens with native navigation, native map integration and GPS permissions.
- Add secure session storage, deep links, offline persistence and synchronization. Notifications only for a defined useful feature and explicit consent.
- Complete physical-device acceptance, store privacy/data declarations, signing and release configuration.
- Exit: separately tested Android and iOS builds; no whole-site WebView as the final app.
- Dependency: stable web/backend contracts and owner-controlled developer-store accounts.

Current completed foundation: local backup/import/recovery/deletion, error boundaries, privacy/source pages, prefixed static hosting support and 24 scripted suites. Native apps and cloud trip sync have not been implemented.
