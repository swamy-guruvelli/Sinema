import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const root = process.cwd();
const styleSystem = JSON.parse(fs.readFileSync(path.join(root, 'brand', 'style-system.json'), 'utf8'));
const BOARD_IDS = Object.keys(styleSystem.boards ?? {});
const scriptPath = fileURLToPath(import.meta.url);

export const validateVideoSpec = (spec, assets, {publicRoot, requireAudio = false} = {}) => {
  const failures = [];
  if (!spec || typeof spec !== 'object') return ['video spec must be an object'];
  if (spec.version !== 1) failures.push('video spec version must be 1');
  if (typeof spec.videoId !== 'string' || !spec.videoId) failures.push('videoId is required');
  if (!['youtube-16x9', 'youtube-9x16'].includes(spec.format)) failures.push('format must be youtube-16x9 or youtube-9x16');
  if (!Number.isInteger(spec.fps) || spec.fps <= 0) failures.push('fps must be a positive integer');
  if (!Array.isArray(spec.scenes) || spec.scenes.length === 0) failures.push('at least one scene is required');
  if (spec.productionType && !['animation', 'education', 'walkthrough'].includes(spec.productionType)) failures.push('unknown production type');
  if (!Array.isArray(spec.scenes)) return failures;

  const assetIds = new Set(assets.map(({id}) => id));
  const sceneIds = new Set();
  for (const scene of spec.scenes ?? []) {
    if (!scene || typeof scene !== 'object') { failures.push('scene must be an object'); continue; }
    if (scene.layout && !['focus', 'split', 'stage', 'sequence', 'token-bucket-editorial'].includes(scene.layout)) failures.push(`scene ${scene.id}: invalid layout`);
    if (scene.motion && !['reveal', 'zoom', 'pan', 'still'].includes(scene.motion)) failures.push(`scene ${scene.id}: invalid motion`);
    if (scene.screenshot) {
      const shot = scene.screenshot;
      if (typeof shot.file !== 'string' || !/^(assets|render-assets)\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp)$/.test(shot.file) || shot.file.split('/').includes('..')) failures.push(`scene ${scene.id}: invalid screenshot path`);
      else if (publicRoot && !fs.existsSync(path.join(publicRoot, shot.file))) failures.push(`scene ${scene.id}: screenshot is missing`);
      if (![shot.focusX, shot.focusY].every((n) => Number.isFinite(n) && n >= 0 && n <= 100) || !Number.isFinite(shot.zoom) || shot.zoom < 1 || shot.zoom > 3) failures.push(`scene ${scene.id}: invalid screenshot crop`);
    }
    if (!Array.isArray(scene.beats) || !Array.isArray(scene.characters) || (scene.dialogue !== undefined && !Array.isArray(scene.dialogue))) { failures.push(`scene ${scene.id}: invalid scene lists`); continue; }
    if (sceneIds.has(scene.id)) failures.push(`duplicate scene id: ${scene.id}`);
    sceneIds.add(scene.id);
    if (!scene.id || !scene.title || !scene.narration) failures.push(`scene ${scene.id || '(unknown)'} needs id, title, and narration`);
    if (!BOARD_IDS.includes(scene.board)) failures.push(`scene ${scene.id}: unknown board ${scene.board}`);
    if (!Number.isInteger(scene.durationInFrames) || scene.durationInFrames <= 0) failures.push(`scene ${scene.id}: durationInFrames must be positive`);
    for (const beat of scene.beats ?? []) {
      if (!Number.isInteger(beat.frame) || beat.frame < 0 || beat.frame >= scene.durationInFrames) failures.push(`scene ${scene.id}: beat frame is outside the scene`);
    }
    for (const line of scene.dialogue ?? []) {
      if (!line.speaker || !line.text) failures.push(`scene ${scene.id}: dialogue lines need speaker and text`);
      if (line.pauseAfterMs !== undefined && (!Number.isFinite(line.pauseAfterMs) || line.pauseAfterMs < 0)) failures.push(`scene ${scene.id}: dialogue pause must be non-negative`);
      if (line.startFrame !== undefined && (!Number.isInteger(line.startFrame) || line.startFrame < 0 || line.startFrame >= scene.durationInFrames)) failures.push(`scene ${scene.id}: dialogue startFrame is outside the scene`);
      if (line.endFrame !== undefined && (!Number.isInteger(line.endFrame) || line.endFrame <= (line.startFrame ?? 0) || line.endFrame > scene.durationInFrames)) failures.push(`scene ${scene.id}: dialogue endFrame is invalid`);
    }
    for (const character of scene.characters ?? []) {
      if (!assetIds.has(character.assetId)) failures.push(`scene ${scene.id}: unregistered character asset ${character.assetId}`);
      if (![character.x, character.y, character.width].every((value) => typeof value === 'number' && Number.isFinite(value))) failures.push(`scene ${scene.id}: character ${character.assetId} has invalid geometry`);
      const characterHeight = character.height ?? character.width;
      const characterTop = character.anchor === 'bottom' ? character.y - characterHeight : character.y;
      if (character.x < 0 || character.y < 0 || character.x + character.width > 1 || characterTop < 0 || characterTop + characterHeight > 1) failures.push(`scene ${scene.id}: character ${character.assetId} leaves the safe canvas`);
    }
  }
  if (spec.audio && (!spec.audio.file || typeof spec.audio.file !== 'string')) failures.push('audio.file is required when audio is configured');
  if (spec.audio?.file && requireAudio && publicRoot && !fs.existsSync(path.join(publicRoot, spec.audio.file))) failures.push(`missing audio file: public/${spec.audio.file}`);
  return failures;
};

export const validateVideoFile = (file, options = {}) => {
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  const assets = JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', 'characterAssets.json'), 'utf8'));
  const failures = validateVideoSpec(spec, assets, {publicRoot: path.join(root, 'public'), ...options});
  if (failures.length) throw new Error(failures.map((failure) => `✗ ${failure}`).join('\n'));
  return spec;
};

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  const videoId = process.argv[2] ?? 'eda';
  const file = path.join(root, 'videos', videoId, 'video.json');
  try {
    const spec = validateVideoFile(file);
    console.log(`✓ ${spec.videoId}: ${spec.scenes.length} scene${spec.scenes.length === 1 ? '' : 's'} valid`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
