# Deploy Fieldframe from GitHub

The project's source repository is **[ACSBalan/Photography-Tips](https://github.com/ACSBalan/Photography-Tips)**. It contained only its initial README when checked; the prepared application does not import the history or starter code of another repository. Preserve the owner's initial commit when adding the app. This guide concerns deployment from the new repository; it does not claim that a live GitHub Pages deployment has been verified.

Fieldframe is a static React/Vite PWA. The complete deployable output is `dist/`. No application server, database, runtime secret or paid AI API is required.

## Repository privacy and Pages eligibility

Public repositories support Pages with GitHub Free. GitHub Free also supports private repositories, so storing the source privately does not require an upgrade. For a **personal account**, publishing Pages from a private repository requires **GitHub Pro**. The resulting Pages website is publicly accessible even though the source repository remains private. Access-controlled private Pages websites require an Enterprise Cloud organization. These are separate features; see [GitHub's Pages eligibility](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans) and [Pages visibility](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site).

The owner explicitly confirmed keeping this repository public on 30 October 2026. GitHub Free supports Pages for this visibility. No plan upgrade is needed for this static app; do not purchase services or change spending settings as part of deployment. If visibility changes in future, recheck Pages eligibility before relying on the existing host.

## Build and verify locally

Use Node 24 and the committed lockfile:

```sh
npm ci
npm run build
npm run validate
npm test
npm run preview
```

Build first: the tests inspect the generated service worker, offline manifest and artwork. The build creates all diagrams and thumbnails, checks TypeScript, compiles the application and then writes `dist/sw.js` and `dist/offline-manifest.json`. Deploy every file in `dist/`, including all visuals and PWA assets.

## Enable GitHub Pages and run the workflow

The included [Pages workflow](../.github/workflows/pages.yml) is **manual only** (`workflow_dispatch`). Uploading source or pushing another commit does not trigger this deployment workflow. It does not enable Pages automatically and does not use a personal access token or extra deployment credential.

1. Ensure the completed app and workflow are committed to the repository's default branch.
2. Open **Settings → Pages → Build and deployment**. If the account is eligible, choose **GitHub Actions** as the source. If GitHub requests an upgrade, stop before accepting charges or changing visibility.
3. Open **Actions → Deploy GitHub Pages → Run workflow** and select the default branch.
4. Wait for **Build and verify**, then **Publish verified artifact**, to succeed. The build runs `npm ci`, `npm run build`, `npm run validate` and `npm test` in that order; a failure prevents deployment.
5. Open the URL reported by the deployment job or **Settings → Pages**. Record that exact verified address in the README and verification record after completing the checks below.

The normal project-site URL would be `https://acsbalan.github.io/Photography-Tips/`, unless account/domain settings change it. This is an expected URL shape, not a verified live address.

The workflow uses official GitHub actions: checkout and setup-node v7, configure-pages v5, upload-pages-artifact v4 and deploy-pages v4. Node setup explicitly disables automatic package-manager caching. The build job has only `contents: read`; the separate deployment job has only `pages: write` and `id-token: write`. Checkout does not persist credentials, the artifact expires after one day, and deployments are serialized. `configure-pages` uses its default configuration: no forced enablement and no supplied token. See [GitHub's Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [setup-node](https://github.com/actions/setup-node) and [checkout](https://github.com/actions/checkout).

GitHub's [Actions billing documentation](https://docs.github.com/en/billing/concepts/product-billing/github-actions) lists standard Pages runner use as free. General private-repository CI and artifact storage have their own allowances and possible overages. Check current account usage before adding broader automation; this workflow uses standard Linux runners, no dependency cache and a one-day artifact lifetime. It does not upgrade a plan or change spending settings.

## Why a project subdirectory works

Vite uses `base: './'`; scripts, styles, diagrams and thumbnails have relative URLs. The manifest's `id`, `start_url`, `scope` and icons are relative. The service worker caches files against its registration scope. Scene links use hashes, for example `#/scene/milky-way`, so they need no per-scene server rewrites.

Publish the contents of `dist/` as the Pages artifact, with `index.html` at the artifact root. The workflow does this directly; a compiled deployment branch or `.nojekyll` file is unnecessary for this path. The deployed directory should have its normal trailing slash.

## Verify the deployed app

- Open the actual Pages address and confirm the 120-scene library appears. Reload a direct scene link and check its diagram and thumbnail load.
- On a narrow phone viewport, search for a scene, read the four main settings, change camera format and find a correction. Check keyboard focus, favourites persistence and theme selection.
- In **Setup → Offline & installation**, wait for the complete green ready status. Choose **Verify saved files**, start the offline rehearsal, reload and open an unvisited scene, then end rehearsal. Check an installed copy without connectivity on a physical device before relying on it in the field.
- Inspect complete-sheet and pocket-set print previews, including long phone guidance and safety text.
- Confirm the manifest, worker, bundles and SVGs return actual assets, not HTML error pages. Record the confirmed repository URL, public app URL, release commit and any remaining limitation in the verification record.

The application caches a complete content-versioned build before reporting offline readiness. Browser storage can still be cleared or evicted. External research sources need internet. Favourites and preferences are local to each origin, browser and device; moving from another host does not migrate those local values automatically.

## Other static hosting

If another host is chosen with the owner's authorization, use `npm ci`, build command `npm run build`, publish directory `dist`, Node 24 and HTTPS. Keep the GitHub repository as the source of record, with its confirmed visibility. Check the host's actual access, plan and charges before publishing; no alternative live deployment is claimed by this guide.
