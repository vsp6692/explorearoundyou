# One exploration experience: web, iOS and Android

The user's three travel-app references are the accepted visual direction (2026-11-17). The website should share that direction with the future iPhone/iPad and Android apps.

## Design contract

- Warm off-white surfaces, charcoal type and primary actions, peach/sage/lilac/sky accents.
- Rounded photographic cards, subtle soft shadows, simple outline icons, generous spacing.
- Home, My Trips, central Create action, Map and Profile as the primary navigation.
- Trip details use Itinerary, Journal, Photos and Map. Creation stays short: name, destination, optional dates, travellers and inspiration cover.
- Photographs must represent a real associated place, or be labelled decorative inspiration. Counts, ratings and visit history must never be invented.
- The real interactive discovery map, cuisine choices, Surprise Me, local bookmarks and interests remain available. The map is reached directly from the main navigation or a shared-place link.
- Use native safe areas and real device status bars. Do not draw fake phone frames, clocks, signal indicators or system controls into the product.
- Touch targets, reduced-motion support and light/dark themes apply across all platforms.

## Implemented web foundation

`components/TravelApp.tsx` owns navigation and the shared account hook. Home and trip screens share `AppIcon` and tokens from `app/app-design.css`; `app/trips.css` defines trip layouts. `lib/trips.ts` defines and validates framework-independent trip records. `useTrips` saves validated, bounded records locally and reports storage failures. Existing bookmarks and visit marks remain in their existing keys.

Trip creation/editing, status filters, search, bookmarks, saved-place itineraries, local text memories, mapped-stop photo gallery and confirmed trip deletion work without a login. Decorative cover images are locally hosted and individually credited in `docs/IMAGE_CREDITS.md` and Profile. Personal photo upload, trip-photo upload/sync, invitations and cross-device trip sync are not implemented.

The manifest, 192/512 PNG icons, Apple touch icon and safe-area viewport prepare the website for browser home-screen use. This does **not** produce an App Store/Play Store application or offline map. No service worker caches map tiles or personal data.

## Native delivery path

The current Next.js app exports static assets to `out/`, so Capacitor is a practical route to reusing this UI and domain logic inside iOS/Android shells. This is a proposed implementation path, not an installed native integration. See [official installation requirements](https://capacitorjs.com/docs/getting-started) and [build/sync workflow](https://capacitorjs.com/docs/basics/workflow).

1. Complete real-phone acceptance of the website, including keyboard/safe-area behavior and map interactions. Stabilize the production HTTPS origin; temporary tunnels are for testing.
2. Add Capacitor to the existing project and configure `webDir` as `out`. Confirm the owner-approved app identifiers before registering them. Add iOS and Android native projects, then build and sync the web export.
3. Test MapLibre WebGL, local worker loading, public-service CORS, camera behavior and memory use in WKWebView and Android WebView. Keep map attribution accessible.
4. Add native adapters for location permission, share/directions handoff, persistence and future camera/photo-library access. Avoid changing public API behavior just to hide native permission failures.
5. Configure Google/Facebook OAuth using native-safe browser sessions and deep links, and the real Supabase project. Test account isolation and cancellation. Trip sync needs a separate schema/RLS/storage design; current auth only covers profile/interests/consented search history.
6. Implement personal photo memories with explicit picker permissions, bounded local storage, delete/export flows, and upload consent if cloud sync is added.
7. Produce signed builds with the owner's Apple/Google developer accounts, privacy declarations, real deletion/support contact, screenshots and release testing. No developer account or signing key is configured here.

Keep UI components and `lib/` behavior shared. Introduce platform-specific code only for capabilities that require it. Never report native apps or store publication complete until actual builds, devices and distribution have been verified.

## Acceptance journey

Open Home → create a trip → save a real map discovery → add it to the itinerary → write a memory → reload and reopen the trip → find the place on Map. Repeat on small iPhone/Android screens, landscape, desktop, dark mode, storage failure, offline services and keyboard navigation. Check that no fake photographs, counts, prices or ratings appear.
