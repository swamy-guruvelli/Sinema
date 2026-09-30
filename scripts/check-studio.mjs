import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {studioAction, studioState} from './studio-api.mjs';
import {validateVideoSpec} from './validate-video.mjs';

// Isolated fixtures exercise persistence and stale-approval safeguards without TTS.
const videos = path.resolve('videos');
const id = `studio-check-${crypto.randomUUID()}`;
const testDir = path.join(videos, id);
fs.mkdirSync(testDir);
const spec = {version: 1, videoId: id, productionType: 'education', format: 'youtube-9x16', fps: 30, styleVersion: '1', scenes: [{id: 'one', title: 'A clear explanation', narration: 'Start with an idea.', board: 'paper', layout: 'focus', motion: 'reveal', durationInFrames: 90, characters: [], beats: [{frame: 0, action: 'reveal', text: 'Start'}], dialogue: [{speaker: 'narrator', text: 'Start with an idea.', startFrame: 0, endFrame: 90}]}]};
fs.writeFileSync(path.join(testDir, 'video.json'), JSON.stringify(spec));
try {
  for (const type of ['animation', 'education', 'walkthrough']) assert.deepEqual(validateVideoSpec({...spec, productionType: type}, []), []);
  assert.ok(validateVideoSpec({...spec, productionType: 'invalid'}, []).length);
  assert.throws(() => studioAction({id, action: 'audio'}), /design/);
  assert.throws(() => studioAction({id, action: 'approve-design'}), /previews/);
  assert.throws(() => studioAction({id: '../escape', action: 'create'}));
  assert.throws(() => studioAction({id, action: 'upload', data: Buffer.from('<svg onload="alert(1)">').toString('base64')}), /PNG/);
  const before = studioState(id);
  assert.throws(() => studioAction({id, action: 'save', spec, revision: 'stale'}), /changed on disk/);
  let result = studioAction({id, action: 'save', spec: {...spec, scenes: [{...spec.scenes[0], title: 'Updated idea'}]}, revision: before.revision});
  assert.equal(result.spec.scenes[0].title, 'Updated idea');
  result = studioAction({id, action: 'approve-script'});
  assert.equal(result.review.scriptApproved, true);
  result.spec.scenes[0].dialogue[0].text = 'A different sentence.';
  result = studioAction({id, action: 'save', spec: result.spec, revision: result.revision});
  assert.equal(result.review.scriptApproved, false);
  assert.throws(() => studioAction({id, action: 'approve-audio'}), /narration/);
  result.spec.scenes[0].screenshot = {file: 'render-assets/../../secret.png', focusX: 50, focusY: 50, zoom: 1};
  assert.throws(() => studioAction({id, action: 'save', spec: result.spec, revision: result.revision}), /screenshot/);
  console.log('Studio checks passed: modes, save, conflict protection, review gates and media validation.');
} finally {
  if (path.dirname(testDir) !== videos || !path.basename(testDir).startsWith('studio-check-')) throw new Error('Unsafe fixture cleanup path');
  fs.rmSync(testDir, {recursive: true});
}
