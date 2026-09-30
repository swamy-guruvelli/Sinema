import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import process from 'node:process';
import {assertCharacterApproval, scanCharacterAssets} from './character-approval.mjs';
import {validateVideoFile} from './validate-video.mjs';

const require = createRequire(import.meta.url);
const root = process.cwd();
const mode = process.argv[2];
const sceneId = mode === 'scene' ? process.argv[3]?.padStart(2, '0') : null;
const walkthroughId = mode === 'walkthrough' ? (process.argv[3] ?? 'mindkraft-tour') : null;
const videoId = mode === 'video' ? (process.argv[3] ?? 'eda') : null;
const videoVariant = mode === 'video' ? (process.argv[4] ?? 'landscape') : null;
const verticalVideo = videoVariant === 'reels';
const boardId = mode === 'board' ? (process.argv[3] ?? 'paper') : null;
const boardCompositions = {paper: 'BoardPaper', editorial: 'BoardEditorial', lesson: 'BoardLesson'};

if (mode !== 'pilot' && mode !== 'scene' && mode !== 'doodle-test' && mode !== 'doodle-story-test' && mode !== 'editorial-pilot' && mode !== 'git-basics' && mode !== 'rich-explain' && mode !== 'walkthrough' && mode !== 'character-approval' && mode !== 'board' && mode !== 'production-board' && mode !== 'video') {
  console.error('Usage: npm run render:character-approval | npm run render:board -- paper | npm run render:production-board | npm run render:video -- eda | npm run render:pilot | npm run render:scene -- 01 | npm run render:doodle-test | npm run render:doodle-story-test | npm run render:editorial-pilot | npm run render:git-basics | npm run render:rich-explain | npm run render:walkthrough -- mindkraft-tour');
  process.exit(1);
}
if (mode === 'board' && !Object.hasOwn(boardCompositions, boardId)) {
  console.error('Usage: npm run render:board -- paper | editorial | lesson');
  process.exit(1);
}
if (mode === 'scene' && (!sceneId || !/^\d{2}$/.test(sceneId) || Number(sceneId) < 1 || Number(sceneId) > 30)) {
  console.error('Usage: npm run render:scene -- 01');
  process.exit(1);
}
scanCharacterAssets(root);
if (mode !== 'character-approval' && mode !== 'rich-explain') assertCharacterApproval(root);

const outDir = path.join(root, 'out');
const binariesDir = path.join(outDir, '.remotion-binaries');
fs.mkdirSync(outDir, {recursive: true});
fs.mkdirSync(binariesDir, {recursive: true});

// ponytail: use one local binary directory; upgrade to Remotion's binaries when its Windows build is stable here.
const compositorDir = path.join(root, 'node_modules', '@remotion', 'compositor-win32-x64-msvc');
for (const file of fs.readdirSync(compositorDir)) {
  if (file.endsWith('.dll') || file === 'remotion.exe') {
    fs.copyFileSync(path.join(compositorDir, file), path.join(binariesDir, file));
  }
}
fs.copyFileSync(require('ffmpeg-static'), path.join(binariesDir, 'ffmpeg.exe'));
fs.copyFileSync(require('ffprobe-static').path, path.join(binariesDir, 'ffprobe.exe'));

const propsPath = mode === 'character-approval'
  ? path.join(root, 'props', 'character-approval.json')
  : mode === 'board'
    ? path.join(outDir, `.board-${boardId}-props.json`)
  : mode === 'production-board'
    ? path.join(outDir, '.production-board-props.json')
  : mode === 'video'
    ? path.join(outDir, `.video-${videoId}-props.json`)
  : mode === 'pilot'
  ? path.join(root, 'props', 'pilot.json')
  : mode === 'doodle-test'
    ? path.join(root, 'props', 'doodle-test.json')
    : mode === 'doodle-story-test'
      ? path.join(root, 'props', 'doodle-story-test.json')
      : mode === 'editorial-pilot'
        ? path.join(root, 'props', 'editorial-pilot.json')
      : mode === 'git-basics'
          ? path.join(root, 'props', 'git-basics.json')
          : mode === 'rich-explain'
            ? path.join(root, 'props', 'rich-explain-gitbasics.json')
          : mode === 'walkthrough'
            ? path.join(outDir, `.${walkthroughId}-props.json`)
    : path.join(outDir, `.scene-${sceneId}-props.json`);
if (mode === 'scene') fs.writeFileSync(propsPath, JSON.stringify({sceneIds: [sceneId], includeAudio: true}));
if (mode === 'board') {
  const spec = validateVideoFile(path.join(root, 'videos', 'eda', 'video.json'));
  const scene = spec.scenes.find((candidate) => candidate.board === boardId);
  if (!scene) throw new Error(`No board scene found for ${boardId}`);
  fs.writeFileSync(propsPath, JSON.stringify({scene}, null, 2));
}
if (mode === 'production-board') fs.writeFileSync(propsPath, '{}');
if (mode === 'video') {
  const videoFile = path.join(root, 'videos', videoId, 'video.json');
  if (!fs.existsSync(videoFile)) {
    console.error(`Missing videos/${videoId}/video.json`);
    process.exit(1);
  }
  const spec = validateVideoFile(videoFile, {requireAudio: false});
  const renderSpec = verticalVideo ? {...spec, videoId: `${spec.videoId}-reels`, format: 'youtube-9x16'} : spec;
  fs.writeFileSync(propsPath, JSON.stringify({spec: renderSpec, includeAudio: Boolean(renderSpec.audio?.file)}, null, 2));
}
if (mode === 'walkthrough') {
  const captureDir = path.join(root, 'render-assets', walkthroughId);
  const capturePath = path.join(captureDir, 'capture.json');
  if (!fs.existsSync(capturePath)) {
    console.error(`Missing render-assets/${walkthroughId}/capture.json. Run: npm.cmd run capture:walkthrough -- ${walkthroughId}`);
    process.exit(1);
  }
  const publicCaptureDir = path.join(root, 'public', 'render-assets', walkthroughId);
  fs.mkdirSync(publicCaptureDir, {recursive: true});
  fs.cpSync(captureDir, publicCaptureDir, {recursive: true, force: true});
  const audioMetadataPath = path.join(root, 'public', 'audio', walkthroughId, 'metadata.json');
  const audioMetadata = fs.existsSync(audioMetadataPath) ? JSON.parse(fs.readFileSync(audioMetadataPath, 'utf8')) : undefined;
  fs.writeFileSync(propsPath, JSON.stringify({manifest: JSON.parse(fs.readFileSync(capturePath, 'utf8')), includeAudio: true, audioMetadata}, null, 2));
}
const outputPath = path.join(outDir, mode === 'character-approval' ? 'character-approval.mp4' : mode === 'board' ? `board-${boardId}.mp4` : mode === 'production-board' ? 'production-board.mp4' : mode === 'video' ? `${videoId}${verticalVideo ? '-reels' : ''}.mp4` : mode === 'pilot' ? 'india-pilot.mp4' : mode === 'doodle-test' ? 'doodle-test.mp4' : mode === 'doodle-story-test' ? 'doodle-story-test.mp4' : mode === 'editorial-pilot' ? 'editorial-pilot.mp4' : mode === 'git-basics' ? 'git-basics.mp4' : mode === 'rich-explain' ? 'rich-explain-gitbasics.mp4' : mode === 'walkthrough' ? `${walkthroughId}.mp4` : `scene-${sceneId}.mp4`);
const compositionId = mode === 'character-approval' ? 'CharacterApproval' : mode === 'board' ? boardCompositions[boardId] : mode === 'production-board' ? 'ProductionBoard' : mode === 'video' ? 'GeneratedVideo' : mode === 'doodle-test' ? 'DoodleMotionTest' : mode === 'doodle-story-test' ? 'DoodleStoryTest' : mode === 'editorial-pilot' ? 'EditorialCartoonPilot' : mode === 'git-basics' ? 'GitBasics' : mode === 'rich-explain' ? 'RichExplainGitBasics' : mode === 'walkthrough' ? 'BrowserWalkthrough' : 'IndiaHistory';
const remotionCli = path.join(root, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
const action = 'render';
const rendererArgs = [remotionCli, action, path.join('src', 'index.ts'), compositionId, outputPath, `--props=${propsPath}`, `--binaries-directory=${binariesDir}`];
if (mode === 'character-approval') rendererArgs.push('--concurrency=1', '--disallow-parallel-encoding', '--image-format=png');
else rendererArgs.push('--concurrency=1', '--disallow-parallel-encoding', '--image-format=png', '--audio-codec=mp3');
const result = spawnSync(process.execPath, rendererArgs, {stdio: 'inherit', shell: false});

if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
