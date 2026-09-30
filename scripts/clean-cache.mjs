import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outDir = path.join(root, 'out');
const dryRun = process.argv.includes('--dry-run');

const isInsideProject = (target) => {
  const relative = path.relative(root, target);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};

const targets = [];
const addTarget = (target, reason) => {
  if (!isInsideProject(target)) throw new Error(`Refusing to clean a path outside the project: ${target}`);
  if (fs.existsSync(target)) targets.push({target, reason});
};

// These are recreated by the render scripts and are never used as source assets.
addTarget(path.join(outDir, '.remotion-binaries'), 'copied Remotion/FFmpeg render binaries');
addTarget(path.join(root, 'node_modules', '.cache'), 'webpack/Remotion build cache');

if (fs.existsSync(outDir)) {
  for (const entry of fs.readdirSync(outDir, {withFileTypes: true})) {
    if (entry.isFile() && /^\.[a-z0-9-]+-props\.json$/i.test(entry.name)) {
      addTarget(path.join(outDir, entry.name), 'generated render props');
    }
    if (entry.isDirectory() && /^\.audio-fit-[a-z0-9-]+$/i.test(entry.name)) {
      addTarget(path.join(outDir, entry.name), 'temporary audio-fit files');
    }
  }
}

if (targets.length === 0) {
  console.log('No disposable video-generation cache found.');
  process.exit(0);
}

for (const {target, reason} of targets) {
  const label = path.relative(root, target);
  if (dryRun) {
    console.log(`Would remove ${label} (${reason})`);
  } else {
    fs.rmSync(target, {recursive: true, force: true});
    console.log(`Removed ${label} (${reason})`);
  }
}

console.log(`${dryRun ? 'Would remove' : 'Removed'} ${targets.length} disposable cache item${targets.length === 1 ? '' : 's'}.`);
