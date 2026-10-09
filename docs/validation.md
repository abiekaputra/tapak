# Validation record

Tapak is complete when all automated gates and the documented local product flow pass.

## Automated gates

- Prettier format verification for TypeScript, TSX, CSS, JSON, YAML, and Markdown.
- Production source files limited to 300 lines and test files to 1000 lines.
- Oxlint with warnings denied.
- Strict TypeScript across contracts, domain, API, web, and mobile.
- Unit coverage for valid, repeated, and invalid parcel transitions.
- Fastify integration coverage for authentication, assignment, and the complete event sequence.
- Vite production build.
- Expo web, Android, and iOS bundle exports.
- Playwright operator-to-courier delivery journey with synthetic geolocation.
- Dependency audit reviewed; the available `uuid` fix is pinned, while two unpublished Expo
  tooling fixes are recorded in `SECURITY.md`.

## Browser journey

The browser validation creates a shipment in the operations console, obtains its QR value,
authenticates the courier in the Expo web target, enters the code, records pickup while offline,
reconnects, adds transit, confirms delivery, and verifies the recipient evidence from the
operator's screen.

JPG screenshots from this run are stored under `DevLab/Porto/Tapak/` and selected frames are
curated in `docs/images/`.

## Honest boundary

Browser validation proves the shared mobile screen tree, storage logic, geolocation contract,
API integration, and responsive presentation. Android and iOS bundle export proves native module
resolution. Camera and operating-system permission presentation must still be observed through
Expo Go on a physical device using the checklist in `expo-go.md`.
