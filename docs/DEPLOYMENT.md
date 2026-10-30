# Deployment

The existing public app is published at **https://acsbalan.github.io/Photography-Tips/** from **`gh-pages` → `/`** in **ACSBalan/Photography-Tips**. The complete source remains on `main`. Preserve the public repository and the existing Pages source.

## Produce a release

Use Node.js 24 and the committed lockfile:

```sh
npm ci
npm run build
npm run validate
npm test
```

The asset preparation step requires every local licensed photograph. The build rejects missing or empty files and creates a content-derived offline manifest and worker. The resulting `dist/` is a complete static site with relative paths suitable for the `/Photography-Tips/` project directory.

Update `main` with the reviewed source. Update `gh-pages` with the contents of `dist/`, plus a root `.nojekyll` file. Preserve branch history and use a lease/expected-head check. Do not copy node_modules, source-only configuration or the separately delivered complete field guide onto the published branch.

Observe GitHub's Pages build/deployment until it succeeds, then verify the actual served bytes:

```sh
npm run verify:deployment -- https://acsbalan.github.io/Photography-Tips/
```

This compares every local manifest-listed file, the manifest and worker against the deployed version using SHA-256. An updated Git ref alone is not proof that the site is live.

## Existing installed copies

The new worker downloads the whole replacement before discarding its previous cache. It reloads existing app tabs in its scope after activation so the newly deployed photographs and interface are displayed. Local favourites and preferences retain their existing storage keys. The offline-ready status confirms completeness; verify saved files before travelling.

## Merchant activation

GitHub source visibility is separate from commercial hosting. The free reference app can remain on Pages. A site primarily used to sell the full guide or run a commercial app needs appropriate hosting and a real merchant checkout/delivery system. See [commercial setup](COMMERCIAL.md). The complete guide must remain outside public assets; no client-side lock protects publicly shipped files.

The existing optional manual `.github/workflows/pages.yml` is retained. It assumes GitHub Actions is selected as the Pages source. Do not trigger it as a substitute for this branch-deployment configuration without intentionally migrating that setting.
