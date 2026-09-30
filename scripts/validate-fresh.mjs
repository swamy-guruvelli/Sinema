import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {discoverCharacterAssets, readCharacterApproval} from './character-approval.mjs';

const root = process.cwd();
const manifestPath = path.join(root, 'src', 'data', 'characterAssets.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const discovered = discoverCharacterAssets(root);
const manifestIds = manifest.map(({id}) => id);
const discoveredIds = discovered.map(({id}) => id);
const failures = [];

if (new Set(manifestIds).size !== manifestIds.length) failures.push('visual asset manifest contains duplicate IDs');
if (manifestIds.join('|') !== discoveredIds.join('|')) failures.push('visual asset manifest is stale; run npm.cmd run assets:scan');
for (const asset of manifest) {
  if (!fs.existsSync(path.join(root, 'public', asset.file))) failures.push(`missing visual asset: ${asset.file}`);
}

if (failures.length) {
  console.error(failures.map((failure) => `✗ ${failure}`).join('\n'));
  process.exit(1);
}

const approval = readCharacterApproval(root);
console.log(`✓ fresh visual asset inventory valid (${manifest.length} asset${manifest.length === 1 ? '' : 's'})`);
console.log(`✓ visual asset approval status: ${approval.status}`);
if (!manifest.length) console.log('! no visual assets registered yet; long renders remain locked until fresh assets are added and approved');
