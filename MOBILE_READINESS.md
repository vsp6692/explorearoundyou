# Android and iOS readiness — React Native and Expo

Audit date: 2026-11-18. Baseline `83f63fe`. Audit only; proposals below are not implemented. Status terms match CURRENT_STATE.md. Evidence distinguishes source, domain tests and live runtime. No production code or infrastructure was changed.

**Assessment: reusable domain foundation, not a native-ready application.** There is no Expo project, native navigation, mobile storage adapter, signed build or device qualification. The existing `docs/MOBILE_APP_PLAN.md` proposes Capacitor and contains obsolete navigation guidance. That proposal does not satisfy the user's current requirement for a native React Native/Expo end product; supersede it after approval, rather than wrapping the whole site in a WebView.

## Reuse and rewrite matrix

| ID / capability | Status | Evidence | Missing / recommended solution | Priority | Dependencies |
|---|---|---|---|---|---|
| M01 Domain models/rules | Partially implemented | `lib/trips`, adventures, cuisines, interests, search-intent, discovery-search, sharing and validation tests | Extract pure TypeScript rules/types into a shared package; inject clock, ID factory and I/O. No invented percentage of UI reuse | High | Fix web regressions; contract tests |
| M02 React UI | Not implemented (native) | Components render DOM/CSS/forms, browser focus and SVG | Rewrite screens with native primitives, accessible controls and native sheets; share design token values and behavior, not CSS/DOM | High | Design contract |
| M03 Maps | Not implemented (native) | Web MapLibre GL JS, worker, DOM pins and ResizeObserver | Prove MapLibre React Native in Expo development builds, licensed styles/tiles and native annotations/clustering; translate camera/theme logic | High | Native map/provider spike |
| M04 Navigation | Not implemented (native) | Web React state and `?view=` only | Expo Router five tabs + stacks for place, trip, journal and preferences; typed route parameters and back restoration | High | M01, URL contract |
| M05 GPS | Not implemented (native) | Browser navigator.geolocation only; F01/F05 | `expo-location` foreground permission, accuracy/age validation, last-known vs fresh fix, denial/settings flow and request cancellation. No background location for MVP | Critical | Location state machine and device tests |
| M06 Offline user storage | Not implemented (native) | Browser localStorage and storage events | `expo-sqlite` versioned transactional user data and migrations; simple preference adapter; export/import with validation | High | F09, shared repository interfaces |
| M07 Offline maps/data | Not implemented | Manifest is not an offline solution | Separate user's own records from licensed provider cache/tile packs; explicit downloads, size limits, expiry, attribution and remove controls | Medium | Provider rights and map SDK test |
| M08 Backend suitability | Partially implemented | Supabase profiles/search history RLS supports authenticated clients | Add collection tables/APIs and sync contract; shared provider gateway for web/native; validate on server too | High for sync | A03/A04 |
| M09 Authentication | Partially implemented | Browser PKCE client and SQL; current service unconfigured | Native browser-based auth sessions, callback allowlist, verified app/universal links and native token exchange; secure session-storage adapter tested with real token sizes/refresh | High if enabled | Stable domain, providers, platform IDs |
| M10 Deep links | Partially implemented | Web place-coordinate links, no trip IDs in routes | Canonical HTTPS links + Android App Links/iOS Universal Links and recovery web page; OAuth scheme fallback; validate all inbound payloads | High | Stable domain, M04, auth |
| M11 Sync / conflict resolution | Not implemented | No cloud trip/save tables or outbox | Optional explicit guest import; per-user IDs, revisions, tombstones, retryable mutations and conflict strategy. Never silently merge different accounts | High for cross-device scope | M06, M08, M09 |
| M12 Push notifications | Not implemented | No registry or scheduling | Defer; if approved, opt-in itinerary reminders, token lifecycle/logout deletion, timezone-aware delivery, deep-link handling and APNs/FCM credentials | Low | Native development build; consent |
| M13 Share/directions | Partially implemented | navigator.share/clipboard and web Google directions URL | Native Share and Linking adapters with available-app fallback, cancellation and accessibility tests | Medium | M04, real devices |
| M14 Assets/images | Partially implemented | Licensed remote Commons and absolute `/images`/pixel asset paths | Native image adapter, bundled asset manifest, attribution UI and bounded licensed disk caching; no upload infrastructure for MVP | Medium | Rights manifest |
| M15 Distribution/security | Not implemented | No iOS/Android projects, signing or store configuration | Owner-controlled IDs/accounts, EAS or equivalent builds, release signing, privacy disclosures, support/deletion and staged release | High | Product gate, real devices |
| M17 Store account policy | Not implemented (release compliance) | No native login/deletion experience; web deletion remains operator-only | If social account creation ships, assess Apple login-service requirements/exceptions and implement in-app deletion plus required web deletion entry for Play; include reviewer access and accurate disclosures | High if accounts enabled | Provider identity, deletion backend, store accounts |
| M16 Native validation | Unable to verify | No emulator/device build exists | Test current Expo/native map compatibility, memory/GPU, app resume, offline, permissions, screen reader and low-end Android. Do not claim Expo Go certifies native maps/push | High | M03–M15 |

## Recommended first native scope

Native Explore/Map, foreground current location, search/categories/cuisines, real details/photos, save/unsave, local trips with day labels and reorder, text journal/manual visits, optional interests and directions/share handoff. Preserve guest use. If account sync is advertised, ship and test it end-to-end before release; otherwise label the release local-only and defer accounts.

Exclude background tracking, uploads, collaboration, road-trip routing, automatic Open Now claims, recommendation AI, full offline map downloads and engagement push from the first release. These are independent products/data obligations, not prerequisites for a useful native companion.

## Current primary documentation and design implications

- [MapLibre Expo setup](https://maplibre.org/maplibre-react-native/docs/setup/expo/): native module/config plugin and a rebuilt native app are required; it is not available in Expo Go. Confirm versions in a spike before selecting an Expo SDK.
- [Expo foreground location](https://docs.expo.dev/versions/latest/sdk/location/): supports permission and accuracy handling; request only capabilities the product uses.
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) supports persistent local databases. Proposed repository adapters keep platform storage out of shared rules.
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) and [Supabase React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native) inform a native session adapter; secure storage is a proposed hardening decision, not existing code.
- [Expo Router authentication](https://docs.expo.dev/router/advanced/authentication/) and [Supabase deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking) support native callback/navigation design.
- [Expo notifications](https://docs.expo.dev/versions/latest/sdk/notifications/): remote push needs native credentials and development/release build testing; defer until a clear opted-in use case exists.

Store-policy review must precede a social-login native release. [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/) include login-service criteria; evaluate Sign in with Apple or an eligible equivalent/exception. [Apple account deletion](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion/) and [Google Play deletion requirements](https://support.google.com/googleplay/android-developer/answer/13327111) require deliberate product/backend flows when accounts are created. Operator-only deletion is not a native-release completion claim.

No mobile scaffolding or implementation was started.
