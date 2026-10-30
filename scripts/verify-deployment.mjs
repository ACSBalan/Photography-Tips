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
let next = 0;
let verified = 0;
async function worker() {
  while (next < files.length) {
    const file = files[next++];
    let current = new URL(file, base);
    let response;
    for (let redirects = 0; redirects < 5; redirects++) {
      response = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
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
    const received = Buffer.from(await response.arrayBuffer());
    const expected = fs.readFileSync(`dist/${file}`);
    if (digest(received) !== digest(expected)) throw new Error(`${file}: deployed bytes differ from the build`);
    verified++;
  }
}
try {
  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(JSON.stringify({ status: 'PASS', url: base.href, verifiedFiles: verified, sceneVisuals: manifest.sceneVisuals, cacheVersion: manifest.version }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Deployment verification failed');
  process.exitCode = 1;
}
