# Fieldframe 2.1 — approved audit corrections

This release addresses the content, usability and offline findings from the 30 October 2026 prototype audit. The user approved implementation of the suggested corrections. The product remains a GitHub Pages prototype for personal, offline field testing; checkout, ecommerce conversion and a change of hosting are outside this release.

## A. Photographic instructions

- Fireworks smoke guidance now suggests an **upwind or crosswind permitted spectator position**, never entering the launch or safety area. It no longer recommends a downwind position.
- The market sheet corrects blurred moving hands by selecting **1/500–1/640 s in Manual + Auto ISO**. The photographer chooses the faster shutter; the meter supplies ISO within its bounds.
- The textured-stream variation keeps the same ND filtration while balancing its faster shutter with ISO. The slow lake-reflection variation explicitly needs about three additional stops of ND or correspondingly dimmer light.
- Comparable-light alternatives have been reconciled for the full Moon, Earthshine, noctilucent clouds, sunset clouds, sea mist, dunes, forest canopy, storm clouds, breaking waves and the spotlit speaker. Their exposure arithmetic has regression coverage. These remain starting points for the stated conditions, not universal meter readings.

## B. Complete phone workflows

Every scene now has a separately authored phone workflow: practical reasons, shooting steps, essential and optional equipment, troubleshooting and a tip. The expanded schema requires these fields. The selected-content helper feeds the highlighted first steps, expanded sections, complete-sheet print layout and pocket cards, so selecting Phone changes the procedure throughout the sheet.

Phone instructions distinguish stock-camera automation, fixed aperture, optional manual capture apps and multi-frame/composite effects. Examples include continuous-light studio portraits, phone alternatives to synchronised flash trails, shorter supported water captures, fixed-aperture fireworks corrections, and device-dependent astrophotography. Lack of a particular control is stated where it matters, with an achievable alternative where possible.

Camera numerical alternatives and camera-only metering/stabilisation notes remain explicitly labelled reference material in Phone mode. They are not presented as universal phone controls.

## C. Gear adaptation and tools

- ISO and shutter outputs use conventional camera increments. Rounding and any remaining brightness difference are explained.
- Adaptation preserves the scene's required motion/effect shutter; supported stationary scenes can instead extend exposure. Low ISO ceilings, unavailable apertures, diffraction, exposures beyond 30 seconds and unusually fast shutter requirements receive relevant explanations.
- Headline settings, starting instructions and printed first-exposure guidance share the adapted result. Exposure-bracketing sequences recalculate all frames together. Original rationale and independent alternative recipes are labelled as references.
- The displayed ISO bounds reflect entered gear limits. Alternative setups warn when their aperture or expected ISO exceeds those limits.
- The star estimator keeps the physical-input NPF calculation and enlarged test-frame instruction. The inappropriate full-frame 500-rule comparison is hidden for Phone; manual phone NPF inputs must be supplied instead of borrowing camera assumptions.
- Search includes useful setup and phone terms. Autofocus abbreviations and shutter fractions use token boundaries, avoiding substring collisions such as `1/250` matching `1/2500`.

## D. Photographic examples

Ten lead photographs were replaced: backlit grasses, subway motion, group portrait, daylight street, vertical architecture, interior/window balance, dance-floor flash, light painting, partial solar eclipse and textured stream flow.

The replacements show the intended visual result more clearly. Light painting uses selective illumination without sparks; the solar example retains a defined partially occluded disc; the stream example preserves readable flow lines. Images are illustrative and their camera settings are not invented. Each has a local offline file, creator, source and licence record in the [photograph credits](PHOTO-CREDITS.md).

Scene captions explain what to inspect. Three photographic pairs compare panning versus frozen action, flowing water versus separate droplets, and translucent backlighting versus silhouettes. They are labelled as independent photographs, not controlled comparisons. Phone viewers are directed to the supported method in their selected workflow.

## E. Use in the field

Shooting mode, actual/equivalent focal length, white balance, camera support and the troubleshooting shortcut now appear directly after the four main settings, before the photograph on a narrow screen. The DOM order matches that visual order.

Essential setting labels and helper text have been enlarged. Automatic ISO has a separate label and a compact approximate value; numeric shutter strings are kept together. Detailed instructions, equipment and corrections use larger mobile text. The full-frame, APS-C, Micro Four Thirds and Phone selection remains remembered locally; APS-C print headings include the selected crop factor.

## F. Offline reliability

Cache names and messages are scoped to the exact deployment URL. Cleanup cannot remove a sibling deployment's offline library. Legacy origin-wide caches are migrated by removing only entries belonging to this installation.

The worker installs the entire new package before taking over. Previous assets remain available while older tabs move to the new app script. Failed downloads do not produce a ready marker; verification detects missing files and repair restores them. The test harness now models separate caches accurately and covers sibling scopes, failed installs, repair, legacy migration and multiple open tabs during an update.

## Maintenance and verification

The application version is 2.1.0. Vite, Vitest and Zod were updated to patched compatible releases. The build, schema, calculator, offline and rendered-content checks are recorded with browser results in [VERIFICATION.md](VERIFICATION.md).

The existing public six-scene designed PDF is a fixed camera-reference sample. Its six baseline camera recipes were unaffected by the audited numeric corrections; it is separate from the format-aware, complete-sheet and pocket printing updated in this release. Physical device installation, actual camera results and physical print readability still require field testing. Those limits must not be represented as completed laboratory or commercial certification.
