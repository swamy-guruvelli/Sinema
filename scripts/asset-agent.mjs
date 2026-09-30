import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const videoId = process.argv[2] ?? 'gitbasics';
const catalogPath = path.join(root, 'assets', 'open-source.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const assets = catalog.assets.filter((asset) => asset.videos.includes(videoId));
const allowedHosts = new Set(['upload.wikimedia.org', 'git-scm.com']);
const outputDir = path.join(root, 'public', 'assets', 'open-source');

if (!assets.length) {
  console.error(`No open-source assets registered for ${videoId}.`);
  process.exit(1);
}

fs.mkdirSync(outputDir, {recursive: true});
const fetched = [];

for (const asset of assets) {
  const url = new URL(asset.url);
  if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) {
    throw new Error(`Blocked asset host for ${asset.id}: ${url.hostname}`);
  }
  const response = await fetch(url, {headers: {'user-agent': 'samithgath-asset-agent/1.0'}});
  if (!response.ok) throw new Error(`Failed to fetch ${asset.id}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error(`Empty asset downloaded for ${asset.id}`);
  const filePath = path.join(outputDir, asset.file);
  fs.writeFileSync(filePath, bytes);
  fetched.push({
    ...asset,
    localFile: `assets/open-source/${asset.file}`,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    contentType: response.headers.get('content-type') ?? 'unknown',
    fetchedAt: new Date().toISOString(),
  });
  console.log(`Fetched ${asset.id} -> public/${asset.localFile ?? `assets/open-source/${asset.file}`}`);
}

const manifestPath = path.join(outputDir, 'manifest.json');
fs.writeFileSync(manifestPath, `${JSON.stringify({version: 1, videoId, assets: fetched}, null, 2)}\n`, 'utf8');
console.log(`Wrote public/assets/open-source/manifest.json for ${videoId}.`);
