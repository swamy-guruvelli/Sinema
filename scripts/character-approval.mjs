import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);

const manifestPath = (root) => path.join(root, 'src', 'data', 'characterAssets.json');
const approvalPath = (root) => path.join(root, 'props', 'character-approval.json');
const assetDir = (root) => path.join(root, 'public', 'assets');
const visualExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

const toPosix = (value) => value.split(path.sep).join('/');
const labelFor = (relativePath) => path.basename(relativePath, path.extname(relativePath)).replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJsonIfChanged = (file, value) => {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== serialized) fs.writeFileSync(file, serialized, 'utf8');
};
const digest = (root, asset) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'public', asset.file))).digest('hex');

const walk = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
};

export const discoverCharacterAssets = (root) => walk(assetDir(root))
  .filter((file) => visualExtensions.has(path.extname(file).toLowerCase()))
  .sort((left, right) => left.localeCompare(right))
  .map((file) => {
    const relative = toPosix(path.relative(assetDir(root), file));
    const parts = relative.split('/');
    const isCharacter = parts[0] === 'characters';
    const idSource = isCharacter ? parts.slice(1).join('/') : relative;
    const id = `${isCharacter ? 'character' : 'asset'}-${idSource.replace(/\.[^.]+$/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}`;
    return {
      id,
      file: `assets/${relative}`,
      label: labelFor(relative),
      role: isCharacter ? (parts.length > 2 ? 'character design variant' : 'character design') : `${parts[0].replace(/[-_]+/g, ' ')} visual asset`,
    };
  });

export const scanCharacterAssets = (root) => {
  const assets = discoverCharacterAssets(root);
  fs.mkdirSync(path.dirname(manifestPath(root)), {recursive: true});
  writeJsonIfChanged(manifestPath(root), assets);
  if (fs.existsSync(approvalPath(root))) {
    const approval = readJson(approvalPath(root));
    const approved = new Map((approval.assets ?? []).map((asset) => [asset.id, asset.sha256]));
    const unchanged = approval.status === 'approved'
      && approved.size === assets.length
      && assets.every((asset) => approved.get(asset.id) === digest(root, asset));
    if (approval.status === 'approved' && !unchanged) {
      writeJsonIfChanged(approvalPath(root), {version: 1, status: 'pending', approvedAt: null, assets: []});
    }
  }
  return assets;
};

export const readCharacterApproval = (root) => readJson(approvalPath(root));

export const assertCharacterApproval = (root) => {
  const assets = readJson(manifestPath(root));
  if (!assets.length) throw new Error('No visual assets are registered. Add files under public/assets and run npm.cmd run assets:scan.');
  const approval = readCharacterApproval(root);
  if (approval.status !== 'approved') throw new Error('Visual asset approval is pending. Run npm.cmd run render:character-approval, inspect the board, then run npm.cmd run approve:characters.');

  const approved = new Map(approval.assets.map((asset) => [asset.id, asset.sha256]));
  const failures = [];
  for (const asset of assets) {
    const file = path.join(root, 'public', asset.file);
    if (!fs.existsSync(file)) failures.push(`${asset.id}: file missing`);
    else if (approved.get(asset.id) !== digest(root, asset)) failures.push(`${asset.id}: changed since approval`);
  }
  if (approved.size !== assets.length) failures.push('asset inventory changed since approval');
  if (failures.length) throw new Error(`Visual asset approval is stale:\n- ${failures.join('\n- ')}\nRun npm.cmd run render:character-approval, inspect the board, then run npm.cmd run approve:characters.`);
  return approval;
};

const writeApproval = (root, value) => fs.writeFileSync(approvalPath(root), `${JSON.stringify(value, null, 2)}\n`, 'utf8');

export const approveCharacterAssets = (root) => {
  const assets = scanCharacterAssets(root);
  if (!assets.length) throw new Error('Cannot approve an empty visual asset inventory. Add images under public/assets first.');
  const missing = assets.filter((asset) => !fs.existsSync(path.join(root, 'public', asset.file)));
  if (missing.length) throw new Error(`Missing character files: ${missing.map((asset) => asset.file).join(', ')}`);
  const approval = {
    version: 1,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    assets: assets.map((asset) => ({id: asset.id, sha256: digest(root, asset)})),
  };
  writeApproval(root, approval);
  return approval;
};

export const revokeCharacterApproval = (root) => {
  const approval = {version: 1, status: 'pending', approvedAt: null, assets: []};
  writeApproval(root, approval);
  return approval;
};

const main = () => {
  const root = process.cwd();
  const command = process.argv[2] ?? 'status';
  if (command === 'scan') {
    const assets = scanCharacterAssets(root);
    console.log(`Registered ${assets.length} visual asset${assets.length === 1 ? '' : 's'}.`);
    assets.forEach((asset) => console.log(`- ${asset.id}: ${asset.file}`));
    return;
  }
  if (command === 'approve') {
    const approval = approveCharacterAssets(root);
    console.log(`Approved ${approval.assets.length} character PNG${approval.assets.length === 1 ? '' : 's'}. Long renders are unlocked.`);
    return;
  }
  if (command === 'revoke') {
    revokeCharacterApproval(root);
    console.log('Character approval revoked. Long renders are locked.');
    return;
  }
  const assets = readJson(manifestPath(root));
  const approval = readCharacterApproval(root);
  console.log(`Character assets: ${assets.length}`);
  console.log(`Approval status: ${approval.status}`);
};

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
