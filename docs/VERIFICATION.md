# Fieldframe verification

Validation date: 30 October 2026. This record distinguishes checks performed from physical-device or photographic field testing.

## Automated checks

The production build, content validator and all **88 tests in five files** pass.

| Suite | Checks |
| --- | ---: |
| Exposure adaptation, ND, focal equivalence and full NPF calculations | 62 |
| Search, aliases and intent matching | 13 |
| Schema, complete content, references, related scenes and safety | 4 |
| Flash and subject-motion constraints | 3 |
| Generated service worker, complete cache and failure handling | 6 |

Run in order:

```sh
npm ci
npm run build
npm run validate
npm test
```

The offline tests execute the actual generated service worker in a controlled Cache API/fetch environment. They verify that all 120 diagrams, all 120 matching thumbnails and install icons are present, all assets must save before readiness is reported, a previously unvisited diagram, its library thumbnail and the shell load when network fetch fails, a failed download never becomes ready, a host sign-in page cannot be cached as an image, a missing cached visual is detected, and offline rehearsal disables network fallback.

The final build at this checkpoint has **120 sheets, 120 original SVG diagrams, 120 dedicated library thumbnails and 250 precached files**, approximately **2.83 MiB** uncompressed. No external image service, font service or AI API is required to use the app. Source-reference links are external.

The content validator resolves every related-scene ID, rejects missing sections, confirms unique scene identities and conditions, checks setting ranges and mode labels, and verifies every required SVG exists. Every category has at least eight distinct sheets.

## Photographic checks

The three research records document manufacturer and specialist sources for the original recipes. The reference sites informed the practical scene-sheet approach and coverage; their text and artwork were not copied. Capture values are recommendations, never claimed metadata for an illustrative asset.

Exposure adaptation was checked for motion-priority subjects, deliberate blur, long star exposures, ISO ceilings, static tripod scenes, and flash/ambient differences. Changing only sensor format does not change ISO, aperture or shutter. Actual and equivalent focal lengths are separately labelled. The 1.5× and 1.6× APS-C options are tested.

The NPF implementation uses the documented full formula and native horizontal pixel count. A full-frame 36 mm sensor, 6000 pixels, actual 24 mm lens, f/2.8, declination 0° and strictness 1 gives 5.4966667 seconds. The separate 500 rule is labelled rough, and the app requires an enlarged recorded-frame check. Phone dimensions are not inferred from a marketing megapixel count or an equivalent lens label.

Safety guidance accompanies solar photography, lightning, water and other relevant scenes. The Moon-in-landscape setup explicitly protects lunar detail and explains the brightness difference from the landscape. Timelapse, flash pulse and multi-image instructions remain in printed pocket cards.

## Browser checks performed

The managed preview was used for the library and a same-origin iframe at phone widths. The following journey was exercised through visible controls:

1. Search “Milky Way”; one matching scene remains.
2. Open the scene and read all four primary settings before the illustration.
3. Select APS-C 1.5×: the focal suggestion becomes 13.3 mm actual for a 20 mm equivalent view.
4. Set APS-C to 1.6×: the focal suggestion becomes 12.5 mm actual. ISO 3200, f/2.8 and 10 seconds remain unchanged.
5. Open “Fix a problem”: the sheet distinguishes Earth-rotation trails, focus/dew, corner aberrations and light pollution, each with its own correction.

At the small-phone fixture's 360 px outer width (345 px content width with the desktop test browser's scrollbar), the sheet has no horizontal overflow. Its four-setting block runs from y=201 to y=395 px, within the first screen.

Further checks exercised Phone mode (fixed aperture, automatic ISO and capability-dependent shutter guidance), saving a waterfall to favourites, an eight-scene Water & motion filter, both dark and dim-red theme controls, the ND calculator at 1/30 s plus 10 stops (34.1333 s), and the full NPF calculator's strict 5.50 s result. At 768 px the content width and scroll width both measure 753 px, so no horizontal overflow is present.

A fresh reload retained both saved scenes (Milky Way and Silky waterfall), the chosen camera format and the light theme. The console messages observed in the final browser check came from the browser integration extension, not Fieldframe's application code.

A 50 mm, f/4 lens with an ISO 6400 ceiling adapts the Milky Way recipe to 4 s, f/4 and ISO 6400, explicitly explaining the approximately 1.4-stop brightness shortfall. A final wording correction distinguishes the ISO to set in Manual mode from an Auto ISO expectation. The complete test suite passes after that correction.

The saved [phone screenshot](fieldframe-redesign-phone.jpg) shows the tested 1.1 production build's waterfall sheet with ISO 100, f/8, 0.5 s and an actionable rock-focus target above the first illustration.

The `viewport-check.html` utility provides reproducible 390 px, 360 px and 768 px iframe viewports. It is marked `noindex` and is not part of the app's navigation. This validates responsive CSS, not physical touch targets, real-device camera behavior or mobile OS installation.

## Print review

Individual print layouts contain the full sheet, diagram, relevant safety, exposure notes, ranges, metering, stabilisation, steps, explanations, pack list, corrections, alternatives and source URLs. Pocket sets include the primary setup, operational exposure notes, focus, essentials, first three corrections and practical tip. Phone alternatives are labelled as camera references and capability-dependent.

Print CSS resets light/dark/red display themes to dark text on white and removes the red filter from diagrams. Cards have automatic height and visible overflow so longer safety and phone guidance is not clipped. Actual printer output and every browser's PDF pagination have not been physically tested.

The browser's individual print action populated one full Milky Way sheet with all six extended section headings and sources. The Night & sky category print action populated all 12 correctly named pocket cards. This environment does not expose a reliable native print-to-PDF export, so physical pagination is not claimed as verified.

## GitHub migration and hosting status

The authenticated GitHub connection checked the owner's fresh **ACSBalan/Photography-Tips** repository before any upload. Its sole file was an 18-byte `README.md` containing `# Photography-Tips`, at initial commit `19b2e21c0dcf35dfe75eb9c7e74160dec8db432b`. There is no prior application code to mix with this delivery. The owner explicitly confirmed public publication on 30 October 2026. Pages was not enabled at the initial repository check.

A separate read-only comparison verified that all 16 application/source files, 246 public assets and five test files in this prepared delivery exactly match the finished Fieldframe app. No files from the other repository's starter implementation are present. The upload set excludes hosting associations, dependencies, build output, environment files and local cache files. The prepared metadata points only to the new repository.

The manual Pages workflow is prepared, but it has not run and no GitHub Pages URL is claimed as live. The deployment checker accepts an HTTPS project subdirectory and compares every served file with the built output. After Pages is enabled, run the workflow and use the URL reported by its deployment job.

Before this migration, the same application build was published on a separate owner-private host. Authenticated checks verified all **251 deployed files** against the production output, using cache version `a8076470a1d7`. That earlier host's publication does not establish GitHub Pages deployment. The app has no dependency on that host and its hosting association is not included in this repository.

## Version 1.1 visual refresh

The screen interface now uses charcoal navigation, white or neutral navy panels, stronger sans-serif typography and blue/violet controls. The primary setting readouts use amber, violet, blue and cyan labels with high-contrast values. Category identity and scene artwork use varied colours instead of a shared olive palette. The screen-only CSS layer keeps the existing print layout independent of display themes.

All 120 original full comparison diagrams were recoloured without changing technique geometry, comparison differences or wording. Dedicated 420 × 265 thumbnails show the first scene panel without tiny annotation text. Both diagrams and thumbnails are included in the complete offline download. SVG validation checked every output and its scene ID. The full 88-test suite passed; the generated-worker suite also passed after the final theme fixes.

The refreshed production build was reviewed in the managed browser at desktop width and phone fixtures of 390 px and 360 px. Search → Milky Way → APS-C 1.6× → Fix a problem was exercised. It retained ISO 3200, f/2.8 and 10 s, while the focal suggestion changed to 12.5 mm actual for a 20 mm equivalent field of view. The corrections section opened and showed the separate focus, Earth-rotation, lens-aberration and sky-brightness corrections.

At the 360 px fixture, content and scroll widths were both 345 px; the four primary setting fields occupied approximately y=202–417 px. All three themes were inspected at that width, including the narrow header and card controls. At the 768 px fixture, content and scroll widths were both 753 px, with no horizontal overflow. Existing favourites and camera preferences remained after a fresh reload. Observed console errors belonged to the browser integration extension, not the app.

The [desktop library screenshot](fieldframe-redesign-library.jpg) and [phone sheet screenshot](fieldframe-redesign-phone.jpg) show this build. The latter includes the responsive test harness around the actual app. These preview screenshots do not claim a live GitHub Pages or physical-device installation test.

## Practical limits

- Recipes are starting points based on stated conditions. They are not metered exposures for every location, camera or subject.
- The relevant visuals are original annotated diagrams, not sample photographs.
- Phone manual controls, stacking, long-exposure and RAW support depend on the handset and app.
- Offline data can be evicted by the browser or cleared by the user. Verify the green readiness status before a trip.
- Physical iOS/Android installation, camera capture and printed-paper tests were not performed in this environment.
