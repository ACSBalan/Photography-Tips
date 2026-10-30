# Fieldframe 2.0 verification

Verified on 30 October 2026 against the photographic-edition source and production build.

## Build and content

- `npm run build`: PASS. TypeScript and Vite compilation complete.
- `npm run validate`: PASS. 120 unique, complete scene sheets; all 12 categories; valid related links and consistent numeric ranges/modes.
- `npm test`: **93/93 PASS** across six test files.
- 120/120 local photographic WebP files pass full image decoding and provenance checks. Exactly 120 unique images; 12.53 MiB of photography.
- The final app cache version is `76df55686407`. Its offline package contains 133 files including the offline manifest, approximately 14.77 MiB. `sw.js` is served separately.
- The complete paid companion guide is absent from the public source, build and offline manifest. The public sample contains six scenes over nine PDF pages.

## Browser checks

The actual React interface was inspected in the supported cloud browser using the local preview:

- Desktop library and Milky Way scene: real photographs load, settings appear correctly, no horizontal overflow.
- Responsive 390px and 320px frames: settings remain readable, controls fit, no horizontal overflow. These are browser viewport checks, not a claim of physical iPhone testing.
- Search for `bird flight` returns the single intended Bird in flight sheet.
- A scene can be added to Saved, appears there, and can be removed. Test changes were reversed.
- APS-C at the selected 1.6× factor converts the Milky Way's 20 mm equivalent to 12.5 mm actual. Phone selection replaces the camera numeric controls with the authored phone-specific limitations and settings.
- Presentation mode starts paused; Next changes the scene from Milky Way to waterfall. Exit retains its accessible name on a narrow screen.
- Print images use eager loading before the print dialog waits for decoding, avoiding hidden lazy-image stalls.
- Reduced-motion preferences are honoured by JavaScript scene shortcuts as well as CSS.

Screenshots: [desktop library](fieldframe-photographic-desktop.jpg).

## Offline behaviour covered by the built-worker tests

The tests execute the actual generated service worker under a project subdirectory. They verify all scene photographs and the public PDF sample are included, install completion, an unvisited photograph and sample served without network access, failed downloads, a sign-in page masquerading as an image, empty response bodies, cache eviction and cache-only rehearsal. The build also rejects empty assets.

An activation test also verifies that a pending browser navigation cannot block worker activation. A successful update installs the complete replacement before removing the previous Fieldframe cache. Existing controlled app tabs in the same scope are reloaded once after activation to show the new release.

## Commercial safeguards

Checkout remains inactive until a real HTTPS merchant URL, merchant name and price are configured. The helper rejects credential-bearing/non-HTTPS destinations and does not render sales offers on `github.io`. There is no fabricated checkout, payment-success screen or localStorage premium unlock. Live payment processing and digital fulfilment have **not** been connected or tested.

## PDF verification

The separate complete guide has 133 pages and all 120 unique scenes. All safety text survives extraction. Every page passed an extracted-character bounds audit with no out-of-bounds characters. All nine public sample pages and 15 representative full-guide pages were visually reviewed, including Moon/eclipse crops, longest safety-critical pages, index and credits. The complete guide has a clickable index and 121 bookmarks.

## Limits

Physical iOS/Android installation, physical printed output, native browser PDF pagination and a live merchant checkout are not verified. The app's separate designed PDF files were rendered and checked directly. Technical exposure recipes are conditional starting points; schema and arithmetic tests do not replace field testing.
