import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {validateVideoFile} from './validate-video.mjs';

const require = createRequire(import.meta.url);
const root = process.cwd();
const videoId = process.argv[2];
const frame = Number(process.argv[3]);
const outputPath = process.argv[4] ?? path.join('output', 'playwright', `${videoId}-frame-${frame}.png`);
const variant = process.argv[5] ?? 'landscape';
const verticalVideo = variant === 'reels';

if (!videoId || !Number.isInteger(frame) || frame < 0) {
  console.error('Usage: node scripts/render-video-still.mjs <video-id> <frame> [output.png]');
  process.exit(1);
}

const spec = validateVideoFile(path.join(root, 'videos', videoId, 'video.json'), {requireAudio: false});
const renderSpec = verticalVideo ? {...spec, videoId: `${spec.videoId}-reels`, format: 'youtube-9x16'} : spec;
const propsPath = path.join(root, 'out', `.video-${videoId}-still-props.json`);
const binariesDir = path.join(root, 'out', '.remotion-binaries');
const cli = path.join(root, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
fs.writeFileSync(propsPath, JSON.stringify({spec: renderSpec, includeAudio: false}, null, 2), 'utf8');

try {
  const result = spawnSync(process.execPath, [
    cli,
    'still',
    path.join('src', 'index.ts'),
    'GeneratedVideo',
    outputPath,
    `--props=${propsPath}`,
    `--frame=${frame}`,
    '--image-format=png',
    '--overwrite',
    `--binaries-directory=${binariesDir}`,
  ], {stdio: 'inherit', shell: false});
  process.exit(result.status ?? 1);
} finally {
  fs.rmSync(propsPath, {force: true});
}
