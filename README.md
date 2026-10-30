# Fieldframe

**Photography in your pocket.** Fieldframe is a standalone, scene-first photography reference with 120 complete cheat sheets. Search for the photograph you want to make, choose your camera format, read the starting settings, take a test frame and use the scene's corrections.

The app opens directly into its searchable library. A scene puts ISO, aperture, shutter and actionable focus instructions first; mode, focal length, white balance and support are nearby. Every sheet also contains conditions, original comparison diagrams, practical explanations, shooting steps, essential and optional equipment, troubleshooting, alternatives, a field tip and technical sources. There are no lessons, accounts or required learning sequence.

## Repository and deployment

**Public GitHub repository: [ACSBalan/Photography-Tips](https://github.com/ACSBalan/Photography-Tips).** This delivery contains the complete React/TypeScript application, all 120 scene sheets, 240 original SVG assets, the lockfile, tests and deployment instructions. The owner confirmed public publication on 30 October 2026. The fresh repository contained only its initial README when checked. No code or history from another starter repository is included.

GitHub Pages has not yet been enabled or verified for this repository. The supplied `.github/workflows/pages.yml` builds, validates, tests and deploys the full application when run manually after Pages is enabled. It does not start a hosted job automatically on upload. This public repository supports Pages on GitHub Free; no plan upgrade or visibility change is part of the workflow.

See [deployment instructions](docs/DEPLOYMENT.md), the [verification record](docs/VERIFICATION.md), [redesigned library screenshot](docs/fieldframe-redesign-library.jpg) and [phone layout screenshot](docs/fieldframe-redesign-phone.jpg). The local production build, all 120 content checks and all 88 automated tests pass. Live GitHub Pages verification and physical-device installation are separate acceptance steps and are not claimed here.

## What is included

- Fast search across scene names, tags, conditions, effects, instructions and corrections; category filters and related-scene links.
- Full frame, APS-C with 1.5× or 1.6× crop, Micro Four Thirds and capability-aware phone guidance.
- Optional actual focal length, available aperture and ISO-ceiling preferences, with explained exposure trade-offs.
- Local favourites and the 16 most recently viewed scenes; stable shareable scene URLs.
- A complete offline PWA, including every sheet, its essential diagrams and all three calculators.
- Visible download progress, cache verification and an offline rehearsal mode.
- Full-sheet printing and compact category or favourites pocket sets, using the browser's Save as PDF facility.
- Light, dark and dim-red themes; metric and imperial distance displays.
- ND exposure, focal-length equivalence and star-exposure tools.

The app runs entirely in the browser. It needs no application backend, account database or paid AI API.

### Scene coverage

| Category | Sheets | Examples |
| --- | ---: | --- |
| Night & sky | 12 | Milky Way, star trails, Moon detail, aurora, meteors, lunar and safely filtered solar eclipses |
| Sunrise & sunset | 8 | Reflections, silhouettes, backlit grasses, blue-hour coast, sunbursts |
| Landscape & weather | 12 | Mountains, forests, near/far depth, fog, snow, dunes, rainbows, sheltered lightning |
| Water & motion | 8 | Silky waterfalls, textured streams, frozen fountain droplets, waves, long seascapes |
| City & street | 12 | Day and night streets, neon, architecture, bridges, interiors, festive lights |
| Events & low light | 10 | Fireworks, concerts, theatre, weddings, dancing, candlelight |
| People | 10 | Open shade, harsh sun, window light, groups, environmental portraits, moving children |
| Action & sport | 10 | Running, cycling, panning, motorsport, surfing, indoor sports |
| Animals & wildlife | 10 | Birds in flight, perched birds, moving wildlife, indoor pets, glass and enclosures |
| Close-up & still life | 10 | Flowers, insects, droplets, food, products, jewellery |
| Travel | 8 | Aircraft windows, moving vehicles, monuments, markets, museums, underwater scenes |
| Creative & multi-image | 10 | ICM, zoom bursts, light painting, panoramas, bracketing, focus stacking, timelapse |
| **Total** | **120** | **12 categories** |

Minor variations belong inside a sheet's alternative setups. The library count represents distinct photographic situations and techniques.

## Run locally

Use **Node.js 22.18 or later**, or a current Node 24 release, with npm. Recent Node is needed both by Vite and by the validation script's direct import of the TypeScript schema. A lockfile is included for reproducible dependency installation.

```sh
npm ci
npm run build
npm run validate
npm test
npm run preview
```

Open the local URL printed by Vite. The production output is `dist/`.

**Build before running the full test suite.** The offline tests inspect the actual generated `dist/sw.js` and `dist/offline-manifest.json`; content tests also check generated scene artwork. `npm run build` generates assets, checks TypeScript, builds Vite and creates the offline files. It does not automatically run the separate validation or test commands.

For ordinary interface development:

```sh
npm run dev
```

This provides Vite hot reload. Service-worker downloads are deliberately disabled in development to avoid stale-cache confusion. Use `npm run build` followed by `npm run preview` to test the real PWA. In a managed Sites container with `SITES_MANAGED_LINUX_CONTAINER=1`, the development wrapper starts the production preview instead; build first there too.

### Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the exact locked dependency tree |
| `npm run dev` | Local development server, or built preview in the managed Sites environment |
| `npm run build` | Generate diagrams, type-check, compile and create the offline manifest/service worker |
| `npm run validate` | Check all scene schemas, uniqueness, ranges, sources and related links |
| `npm test` | Run the calculator, content, search, exposure-adaptation and built-worker tests |
| `npm run preview` | Serve the production build for browser and offline QA |

## Using Fieldframe in the field

Search by subject, conditions or desired effect, then open the scene. Check the assumed light and subject behaviour before using its starting exposure. In **M**, aperture, shutter and ISO are chosen values. In **M + Auto ISO**, aperture and shutter are chosen while the camera meters ISO within the displayed range; a numeric ISO expectation is a useful starting estimate, not a simultaneous fixed instruction.

Select your format in the header or Setup. The selection is remembered on the device. On a phone, the primary fields switch to phone-specific capabilities and limitations. Tap the heart to keep a sheet in favourites. The Share button uses the browser's share facility or copies the current URL; links such as `#/scene/milky-way` open the same scene directly.

The correction section distinguishes subject movement, camera shake and missed focus. Use the stated focus target, inspect an enlarged test frame and adjust for the actual light. Additional explanations and alternatives stay inside the selected sheet.

### Install and verify offline access

1. Open a production deployment over HTTPS, or the local production preview on localhost.
2. Open **Setup → Offline & installation**. Wait for the green **120 sheets ready offline** message and a complete file count. Use **Download / retry** if an interruption left the download incomplete.
3. Choose **Verify saved files** before travelling. This checks that every expected cached response is present and its body can be read; it is not a cryptographic authenticity check.
4. Under **Check offline routing**, start the offline rehearsal, reload and open a scene you have not visited. The service worker then serves app requests only from its saved cache. End the rehearsal when finished. An actual device airplane-mode check is also useful before a trip.
5. Install through **Install app** when offered. On iPhone/iPad, open in Safari and choose **Share → Add to Home Screen**. On Android, use the browser's install or home-screen option. Supported desktop browsers expose an install icon.

Installing an icon and completing the offline download are separate steps. The ready status is the confirmation that the complete library is saved. Browser storage can be cleared or evicted, and different browser profiles have separate caches. External source websites still require a connection. A host's sign-in gate may also be required for an initial visit or a new download.

The worker caches the complete built app, all 120 diagrams, all 120 dedicated library thumbnails and install assets. A content-derived version identifies each build. An incomplete download cannot report ready. The previous Fieldframe cache is removed only after the replacement worker has installed successfully. Source URLs are references; third-party websites are not cached.

### Printing and PDF

Use a scene's print button for the **complete sheet**, including all corrections, alternatives, equipment, diagrams and references. It can span multiple pages.

**Pocket print sets** creates compact cards for one category or your favourites, using the selected camera format and any gear adaptation. These contain the core setup, focus, essentials and the first three corrections. They usually fit two per A4/Letter page; longer cards can occupy a page so phone guidance or safety text is not clipped. Use complete-sheet printing when you need every explanation and alternative.

In the print dialog, use 100% scale and default margins, disable browser headers/footers, and choose a printer or **Save as PDF**. PDF creation happens locally through the browser.

## Camera format and exposure behaviour

### Field of view

Scene data stores a full-frame reference focal length. The interface displays the actual lens length for a comparable field of view and labels the equivalent view separately:

```text
equivalent focal length = actual focal length × crop factor
actual focal length = equivalent focal length ÷ crop factor
```

A 24 mm-equivalent view therefore corresponds to 24 mm on full frame, 16 mm at APS-C 1.5×, 15 mm at APS-C 1.6×, or 12 mm on Micro Four Thirds. Selecting a different sensor format does not by itself change aperture, ISO or shutter. Field-of-view equivalence is not a promise of identical depth of field, noise, perspective or lens performance. Perspective changes when camera position changes.

Phone camera labels often already describe equivalent focal lengths. They must not be multiplied by a crop factor again. The phone sheets identify fixed or automatic aperture and distinguish optional manual-app controls, computational exposure stacks, supported movement modes and physical lens reach. Native phone flash is not assumed to support studio sync or programmable repetition.

### Optional lens adaptation

Enable **Adapt starting setups to my lens limits** and enter actual focal length, the widest aperture available at that focal length, and an ISO ceiling. Blank lens fields preserve the sheet's recommendation.

The adaptation is deliberately constrained by the scene's photographic priority:

- If the lens cannot open as wide as suggested, the app uses the available aperture and calculates the resulting light loss. It preserves the motion or creative-effect shutter and raises ISO where appropriate. Any exposure deficit beyond the ISO ceiling is shown explicitly.
- A longer handheld lens can require a faster starting shutter for camera shake. That rough check does not guarantee subject sharpness and does not replace stabilization or technique.
- A static depth-of-field setup on support can lengthen its exposure only when the scene explicitly allows it with `canSlowShutter: true`. A tripod alone does not make a moving subject safe to expose for longer.
- Star scenes with a longer actual lens receive a proportional shorter-shutter adjustment, followed by an instruction to use the full NPF tool and check enlarged stars. This quick adaptation is not itself an NPF calculation.
- Effect and flash-sync shutters are preserved. Flash or mixed-light scenes require a separate flash-power/TTL and ambient check; within normal sync, shutter changes principally affect ambient light.

The app explains changes and remaining trade-offs. It cannot infer every camera's ISO performance, flash-sync limit, subject speed, depth of field or stabilization capability. Phone mode uses its own authored guidance instead of applying interchangeable-lens assumptions.

## Supporting calculators

The pure implementations are in [`src/calculators.ts`](src/calculators.ts). These tools support the selected scene; they are not required steps before using a sheet.

### ND exposure

```text
filtered seconds = unfiltered seconds × 2^ND_stops
```

The calculation assumes unchanged aperture, ISO and illumination. For example, 1/125 s with 6 stops becomes 0.512 s; 1/30 s with 10 stops becomes about 34.13 s. The tool accepts 0–20 stops, including fractional values. Test for actual filter transmission, changing light and highlight clipping. A photographic ND filter is not solar-eye or solar-camera protection.

### Focal-length equivalence

The converter uses the field-of-view equations above and supports the selected APS-C crop factor. It does not change the physical lens, aperture or exposure.

### Full NPF star-exposure estimator

The implementation uses the full formula attributed to **Frédéric Michaud / Société Astronomique du Havre**, with the source linked in the tool: [Règle NPF / NPF Rule](https://sahavre.fr/wp/regle-npf-rule/).

```text
p = sensor_width_mm × 1000 / native_image_width_pixels

t_seconds = k × (16.9 × N + 0.10 × f + 13.7 × p)
            / (f × cos(δ))
```

| Input | Meaning |
| --- | --- |
| `N` | Actual lens f-number |
| `f` | Actual focal length in millimetres, not equivalent focal length |
| `p` | Physical pixel pitch in micrometres, derived from sensor width and native horizontal pixel count |
| `δ` | Stellar declination in degrees; the implementation converts to radians for cosine |
| `k` | Selected tolerance: 1 strict, 2 moderate, 3 relaxed |

Use the physical sensor width and native uncropped image width that correspond to the capture. Use the smallest absolute declination in the frame; use 0° conservatively if unknown or if the field crosses the celestial equator. Declinations beyond ±85° are rejected to avoid unreliable near-pole estimates. Format-specific sensor and pixel defaults are stated assumptions and should be checked against the camera. In Phone mode, the tool requires the user to supply the physical inputs instead of silently assuming a full-frame sensor.

**Independent numerical example:** for a 36 mm-wide sensor with 6000 native horizontal pixels, `p = 6 µm`. At actual 24 mm, f/2.8, `k = 1` and `δ = 0°`:

```text
t = (16.9 × 2.8 + 0.10 × 24 + 13.7 × 6) / 24
  = 131.92 / 24
  = 5.4966667 seconds
```

There is no crop-factor multiplication in this formula: actual focal length and physical pixel pitch already supply the relevant geometry. Applying crop again would be an error. Automated tests check the numerical anchor, pixel-pitch changes, declination, tolerance and input limits.

The comparison **500 rule** is `500 / (actual focal length × crop factor)`. It is explicitly a rough estimate and often tolerates visible trails at modern pixel-level inspection. At a 24 mm-equivalent field of view it gives about 20.83 s, markedly longer than the strict example above.

Both calculations are starting estimates for an untracked camera. Focus manually on a bright star using a magnified live view, make a test exposure, and inspect recorded stars enlarged in the centre and corners. Shorten exposure when needed. The source requests attribution and states usage conditions; preserve the attribution and review those conditions before commercial reuse of its material. No third-party licensing grant is implied here.

## Architecture

React, TypeScript and Vite produce a static application; Zod validates its structured content. All scene data is shipped with the app. No runtime content generation or external API is required.

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Library, sheets, hash routes, preferences, sharing and print views |
| `src/Tools.tsx` | The three supporting calculator interfaces |
| `src/schema.ts` | Authoritative Zod scene schema, categories, preferences and defaults |
| `src/data.ts` | Imports all scene JSON arrays, validates them and creates lookup data |
| `src/data/*.json` | Original scene content, separate from interface components |
| `src/search.ts` | Accent-insensitive token matching, aliases and result ranking |
| `src/calculators.ts` | Pure exposure, equivalence, NPF and gear-adaptation functions |
| `src/storage.ts` | Browser-local preferences and saved lists |
| `src/offline.ts` | Service-worker registration and download/readiness UI state |
| `src/styles.css` | Structural responsive layouts and print styling |
| `src/design.css` | Screen design system: neutral surfaces, category colours and light/dark/dim-red themes |
| `scripts/prepare-assets.mjs` | Builds 120 original diagram SVGs, 120 clean thumbnails, category palettes and asset credits |
| `scripts/draw-*.mjs` | Scene-specific comparison renderers |
| `scripts/build-offline.mjs` | Creates a versioned manifest and worker from the built output |
| `scripts/validate-content.mjs` | Standalone content and semantic checks |
| `tests/` | Calculator, content, search, flash/motion and generated-worker tests |
| `public/` | PWA manifest, original icons, generated diagrams, thumbnails and asset credits |
| `dist/` | Complete generated static deployment; do not edit by hand |

Hash routing keeps scene links portable on static hosts without per-route server rewrites. Vite uses `base: './'`; the manifest's URLs and scope are relative, and the worker uses its registration scope. This supports both domain-root deployments and a GitHub Pages project subdirectory.

## Add or revise a scene

1. Read [`CONTENT_CONTRACT.md`](CONTENT_CONTRACT.md) and the authoritative [`src/schema.ts`](src/schema.ts). Add a complete object to an existing array in `src/data/`, or create another JSON array file there. `src/data.ts` discovers it automatically.
2. Give it a stable, unique kebab-case ID, a distinct title, a valid category, difficulty, at least four searchable tags, assumed conditions and a clear intended result. Keep a minor exposure variation in an existing sheet's alternatives.
3. Author a coherent starting setup. Shutter values are numeric **seconds** (`0.002` for 1/500 s); focal lengths use the full-frame reference convention. Ranges ascend numerically and contain their starting values. Set `autoISO: true` only with `mode: "M + Auto ISO"` and explain the automatic value.
4. Set the photographic `priority`. Use optional `lighting: "flash"` or `"mixed"` when necessary. Set `canSlowShutter: true` only when a supported static setup can tolerate a longer exposure. These fields determine which exposure adaptations are allowed.
5. Populate phone guidance, 3–6 practical explanations, 4–8 steps, essential/optional equipment, 4–6 problem/cause/correction entries, 2–3 concrete alternatives, a specific tip, starting-point note, relevant safety, primary source links and 2–4 valid related IDs.
6. Write a precise `visual` brief: subject, kind, title, caption, three short annotations and two meaningful comparison labels. Add or update the appropriate `scripts/draw-*.mjs` renderer so the two panels actually show the claimed effect. Generic identical shapes with different labels are not an adequate comparison. Artwork is schematic and must not claim photographic EXIF.
7. Build, validate and test. Inspect the generated SVG in the sheet, a narrow phone layout and print preview. Check the main settings, format change and at least one correction. If a scene ID is renamed, update related links and remove its obsolete generated SVG so the offline package has no stale scene asset.

When the total changes, update exact-count assertions in the content/offline tests and descriptive counts in this README, package metadata and manifest. The app's category counts are derived from data. Do not lower validation requirements to accommodate an incomplete sheet.

Content validation checks structure, ranges, uniqueness and link resolution. It does not substitute for checking the photographic reasoning, source quality or meaning of a diagram.

## Verification

Run the build, validation and test commands above after source or content changes. The test suite covers:

- Independent ND and full-NPF numerical anchors; conversion round-trips, crop applied once, declination/pixel-pitch effects and invalid inputs.
- Lens limits and ISO ceilings, static supported exposure changes, preservation of subject-motion and creative-effect shutters, and separate flash/ambient handling.
- All 120 schemas, required categories, valid related IDs, expected diagrams, mode/range consistency and key solar, lightning and star-focus instructions.
- Search ranking and aliases.
- The actual generated service worker under a project subdirectory: complete installation, an unvisited scene and app bundle with the network disabled, failed downloads, a sign-in page returned in place of an asset, cache eviction and rehearsal behaviour.

Browser QA should additionally cover phone, tablet and desktop layouts, keyboard navigation, visible focus, light/dark/red themes, a saved preference after reload, sharing, print preview and the journey **search → scene settings → change camera format → find a correction**. Test the published origin after deployment; a local build alone does not establish that hosting, authentication and offline delivery work there.

## Sources, originality and credits

Content and source review date: **30 October 2026**. The practical public examples at [Camera Cheat Sheets](https://fotocheatsheets-sco.pages.dev/) and [The Photo eBook travel collection](https://the-photo-ebook.com/cheat-sheets-travel-set/) informed coverage and the scene-first reference approach. Their wording, artwork and paid materials were not copied.

Every sheet contains its own technical source links. The authored numerical combinations are original starting points for the described conditions; citations support techniques and constraints rather than asserting that a source supplied each exact recipe. Detailed research records are in:

- [Nature, sky, landscape and water](docs/nature-research.md)
- [People, city, events and travel](docs/people-city-research.md)
- [Action, wildlife, close-up and creative techniques](docs/action-creative-research.md)

Primary references include camera manufacturers, NASA, NOAA/NWS, specialist equipment makers, original software documentation and the original NPF author. Safety-sensitive solar and lightning sheets include technique-specific precautions. All recommendations still require a test frame and adjustment to actual conditions.

All scene prose, diagram artwork, interface icons and the Fieldframe identity were created for this project. The 120 scene illustrations are original SVG technique diagrams, with 120 clean first-panel thumbnails for the library. The full illustrations are labelled as diagrams; they are not photographs and contain no invented capture metadata. [`public/asset-credits.json`](public/asset-credits.json) records their origin. No external image CDN or image licence purchase is needed. Third-party dependency licences remain with their respective packages; this README does not grant rights to referenced websites or their material.

## Privacy and persistence

The application has no advertising, trackers, analytics or application account system. Preferences, favourites and recent scene IDs are stored in browser `localStorage` under `fieldframe:` keys. Offline assets use the browser's Cache Storage. They remain on that origin, device and browser profile; there is no cross-device sync or server backup. Clearing site data removes them, and private browsing may limit persistence.

A shared scene link contains the scene route, not your favourites or gear preferences. Access still depends on the deployment's permissions. Hosting providers can operate their own authentication and ordinary access logs independently of this application. See [deployment notes](docs/DEPLOYMENT.md) before choosing repository and site visibility.
