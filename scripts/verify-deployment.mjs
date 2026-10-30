import fs from 'node:fs';
import crypto from 'node:crypto';

// Accepts the actual URL emitted by a deployment, including /project/ paths.
// No credentials are required or accepted for a public GitHub Pages website.
const address = process.argv[2];
if (!address) {
  console.error('Usage: npm run verify:deployment -- https://your-host/your-project/');
  process.exit(1);
}
const base = new URL(address);
if (base.protocol !== 'https:' || base.search || base.hash || base.username || base.password) {
  throw new Error('Use an HTTPS deployment URL without credentials, query or fragment.');
}
if (!base.pathname.endsWith('/')) base.pathname += '/';
const manifest = JSON.parse(fs.readFileSync('dist/offline-manifest.json', 'utf8'));
const files = [...manifest.files, 'offline-manifest.json', 'sw.js'];
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const transientStatuses = new Set([429, 500, 502, 503, 504]);
async function fetchWithRetry(current, file) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
      if (transientStatuses.has(response.status)) {
        await response.body?.cancel();
        throw new Error(`HTTP ${response.status}`);
      }
      // Read successful bodies here so a dropped connection also gets a retry.
      const received = response.status === 200 ? Buffer.from(await response.arrayBuffer()) : undefined;
      return { response, received };
    } catch (error) {
      if (attempt === 3) {
        throw new Error(`${file}: request failed after 3 attempts: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
      }
      await new Promise(resolve => setTimeout(resolve, attempt * 250));
    }
  }
}
let next = 0;
let verified = 0;
async function worker() {
  while (next < files.length) {
    const file = files[next++];
    let current = new URL(file, base);
    let response, received;
    for (let redirects = 0; redirects < 5; redirects++) {
      ({ response, received } = await fetchWithRetry(current, file));
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      if (!location) break;
      const target = new URL(location, current);
      if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) {
        throw new Error(`${file}: redirect leaves the selected deployment`);
      }
      current = target;
    }
    if (response.status !== 200) throw new Error(`${file}: HTTP ${response.status}`);
    const expected = fs.readFileSync(`dist/${file}`);
    if (digest(received) !== digest(expected)) throw new Error(`${file}: deployed bytes differ from the build`);
    verified++;
  }
}
try {
  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(JSON.stringify({ status: 'PASS', url: base.href, verifiedFiles: verified, scenePhotos: manifest.scenePhotos, sceneSheets: manifest.sceneSheets, cacheVersion: manifest.version }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Deployment verification failed');
  process.exitCode = 1;
}
