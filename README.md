# Fieldframe · Photographic edition

**[Open the app](https://acsbalan.github.io/Photography-Tips/)** · **[Presentation view](https://acsbalan.github.io/Photography-Tips/#/showcase)** · **[Public source](https://github.com/ACSBalan/Photography-Tips)**

A practical photography reference with **120 distinct scene sheets in 12 categories**. Pick the photograph you want to make, read the starting settings, take a test frame and find the next adjustment. The library is the product; there are no courses, accounts or learning sequences.

## Version 2.0

The photographic edition replaces the previous illustrated assets with **120 real, locally stored photographs**. The interface uses neutral white and graphite surfaces, system typography, restrained blue controls and responsive layouts. Scene sheets put exposure, conditions and focus first; source photography supplies context and visual interest.

- Search scenes and conditions, filter by category, sort alphabetically and save favourites.
- Full-frame, APS-C, Micro Four Thirds and authored phone-specific guidance.
- Optional adaptation to lens aperture, actual focal length and an ISO ceiling, with explicit trade-offs.
- Complete local photographs, scene content and tools for offline use after download verification.
- Presentation view with manual previous/next controls, an optional automatic tour and full-screen support where the browser permits it. Playback starts paused.
- A free six-scene photographic PDF sample and custom browser print sets.
- Original content, practical corrections, shooting steps, equipment, alternatives and primary technical references on every sheet.
- Real photographer/source/licence credits. Suggested settings are **not claimed EXIF for the reference photographs**.

The live public repository and app remain public. This is the existing `ACSBalan/Photography-Tips` project.

## Photography and rights

`src/photo-manifest.json` maps each of the 120 scenes to an optimized local WebP, its descriptive text, creator, original source and licence. Photographs are used under the Pexels License or each named Creative Commons/public-domain licence. Cropping and compression are disclosed. Attribution appears on individual scenes and in the app's Photo credits view. The build verifies every mapping, attribution record and local WebP before compilation.

See [the full photo credits](docs/PHOTO-CREDITS.md). The repository does not offer a separate stock-photo download service. Its photo files are supporting assets of the reference application. Third-party photographs retain their own licences; the source repository's visibility does not erase those terms. No competitor photographs or paid materials are copied.

The free sample and complete field guide combine photography with original instructional content. The full guide is delivered separately and is not present in the public repository or offline cache.

## Commercial model

The app is a free field reference. Its companion PDF is a separate designed product. A six-scene sample is available in the Pocket guide view; the complete guide has 120 scene pages and credits.

There is **no live checkout, mocked payment flow or client-side premium lock**. `src/commerce.ts` provides a deliberately inactive external merchant offer. It requires a real HTTPS checkout URL, price label and merchant name, and will not display on `github.io`. The merchant must handle payment and purchased-file delivery. Use commercial-capable hosting before activating a sales-oriented version; GitHub Pages is not an ecommerce host. The code can remain in this public repository.

See [commercial setup and launch notes](docs/COMMERCIAL.md). Revenue and conversion are not guaranteed or demonstrated by this build.

## Development

Use Node.js 24 and the included lockfile:

```sh
npm ci
npm run build
npm run validate
npm test
npm run preview
```

Build before running tests: the offline tests exercise the actual emitted service worker and manifest. Development is `npm run dev`. The `qa/mobile.html` page wraps the app in selectable 320, 360, 390, 768 and 1024px viewports for browser layout checks. It is not a product route.

The static production output is `dist/`. Vite's relative base, relative manifest URLs and hash routes support a GitHub project subdirectory. The existing Pages configuration publishes **`gh-pages` → `/`**. Do not change repository visibility or Pages source to deploy an updated built branch.

```sh
npm run verify:deployment -- https://acsbalan.github.io/Photography-Tips/
```

The verification script downloads every application file listed in the exact local build and checks SHA-256 equality.

## Offline access and updates

Open **Setup → Offline & installation**, and wait for the complete ready status before leaving a connection. **Verify saved files** checks every saved file. An offline rehearsal mode exercises cache-only routing. The service worker installs the new version completely before discarding the old cache. All local photographs, the free sample, the scene content and calculators are included; external technical sources and photo-source websites require a connection.

On iPhone or iPad, open in Safari and choose **Share → Add to Home Screen**. Home-screen installation and a complete offline download are separate operations. Storage remains on that device/browser profile and may be evicted or cleared.

## Technical conventions

- Starting exposures are conditional recommendations, not universally correct values. Check the scene assumptions, focus target, test frame and troubleshooting.
- Focal length is shown as the actual lens length for the selected sensor format. Full-frame-equivalent field of view is labelled separately. Format selection alone does not automatically change aperture, shutter or ISO.
- In **M + Auto ISO**, the numeric ISO is an expected starting estimate; the camera meters within the stated bounds.
- Lens-limit adaptations preserve motion or long-exposure intent and explain unrecoverable exposure deficits. A tripod does not freeze a moving subject.
- Phone guidance describes device/app limitations. Fixed aperture and computational capture modes are not presented as interchangeable-lens camera controls.
- The ND calculation is `filtered seconds = original seconds × 2^stops`.
- Focal equivalence is `equivalent = actual × crop factor`.
- The full NPF implementation is attributed to Frédéric Michaud / Société Astronomique du Havre. It uses physical sensor width, native pixel count, actual focal length, aperture, declination and tolerance. The 500 rule is explicitly a rough comparison. Keep attribution and check source conditions before commercial reuse. See `src/calculators.ts` and the in-app tool for the complete documented method.

## Source structure

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Library, scene sheets, preferences, print and hash routes |
| `src/Photography.tsx` | Local photography, credits, exposure strips and featured scenes |
| `src/Showcase.tsx` | Working presentation view, playback and full-screen controls |
| `src/Guide.tsx` | Free PDF sample and conditional external merchant offer |
| `src/commerce.ts` | Explicitly inactive merchant configuration and validation |
| `src/data/*.json` | All 120 authored scene sheets |
| `src/photo-manifest.json` | Per-scene photo provenance and display crop |
| `src/calculators.ts`, `src/Tools.tsx` | Pure calculations and supporting tool interfaces |
| `src/schema.ts`, `src/search.ts`, `src/storage.ts` | Validated content, search and local preferences |
| `src/design.css` | Photographic edition's responsive design system |
| `src/styles.css` | Base layout and print styles |
| `scripts/prepare-assets.mjs` | Validate local photographs and generate attribution manifest |
| `scripts/build-offline.mjs` | Build-derived cache manifest and service worker |
| `scripts/build-field-guide.py` | Reproducible photographic PDF generation |
| `tests/` | Exposure, search, content, offline and commerce activation checks |
| `public/photos/` | Locally served licensed photography |
| `public/downloads/` | The free six-scene PDF sample and its previews only |

## Originality and sources

The practical publicly available samples at [Camera Cheat Sheets](https://fotocheatsheets-sco.pages.dev/) and [PictureCorrect's travel set](https://the-photo-ebook.com/cheat-sheets-travel-set/) informed the scene-first structure. Their wording, images and paid files are not reused. The app's own recipes cite primary technical guidance, including camera manufacturers and original specialist sources. Each scene is a complete distinct photographic situation.

The existing research records remain in `docs/`: [nature](docs/nature-research.md), [people/city](docs/people-city-research.md), and [action/creative](docs/action-creative-research.md). Content validation checks structure and internal consistency; it does not replace field testing in actual conditions.

## Privacy

Preferences, favourites and recent scenes are saved locally under `fieldframe:` keys. No advertising, tracking, email capture or user account is implemented. There is no cross-device sync or server backup. Hosting providers may maintain ordinary access logs. External photo credits and technical sources open their respective websites only when selected.
