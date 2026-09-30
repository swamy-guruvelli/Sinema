import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {validateVideoSpec} from './validate-video.mjs';
import {assertCharacterApproval} from './character-approval.mjs';

export const productionTypes = [
  {id: 'animation', name: 'Animation', description: 'Character scenes, animated sequences and varied frame designs.', layouts: ['stage', 'split', 'sequence', 'focus']},
  {id: 'education', name: 'Educational video', description: 'Explain one idea at a time with diagrams, examples and dialogue.', layouts: ['focus', 'sequence', 'split', 'stage']},
  {id: 'walkthrough', name: 'Website walkthrough', description: 'Guide viewers through screenshots with crops, pans and close-ups.', layouts: ['focus', 'split', 'sequence', 'stage']},
];
const root = process.cwd();
const publicRoot = path.join(root, 'public');
const read = (file, fallback = null) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback;
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const fail = (message, status = 400) => { throw Object.assign(new Error(message), {status}); };
const directory = (id) => {
  if (typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) fail('Use a project ID with lowercase letters, numbers and hyphens.');
  return path.join(root, 'videos', id);
};
const walk = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => entry.isSymbolicLink() ? [] : entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]) : [];
const hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const revision = (spec) => hash(spec);
const scriptRevision = (spec) => hash({voices: spec.voiceReferences, scenes: spec.scenes.map((s) => ({id: s.id, narration: s.narration, dialogue: s.dialogue?.map(({speaker, text, pauseAfterMs}) => ({speaker, text, pauseAfterMs}))}))});
const audioRevision = (spec) => hash({script: scriptRevision(spec), fps: spec.fps, scenes: spec.scenes.map((s) => ({duration: s.durationInFrames, lines: s.dialogue?.map(({startFrame, endFrame}) => ({startFrame, endFrame}))}))});
const assets = () => read(path.join(root, 'src/data/characterAssets.json'), []);
const safeMedia = (file, prefix) => {
  if (typeof file !== 'string' || !file.startsWith(prefix) || file.includes('\\') || file.split('/').includes('..')) fail('Choose a local media file from this project.');
  const resolved = path.resolve(publicRoot, file);
  if (!resolved.startsWith(publicRoot + path.sep) || !fs.existsSync(resolved) || !fs.statSync(resolved).isFile() || !fs.realpathSync(resolved).startsWith(fs.realpathSync(publicRoot) + path.sep)) fail('The selected media file is unavailable.');
};
const readProject = (id) => {
  const spec = read(path.join(directory(id), 'video.json'));
  if (!spec) fail('Project not found.', 404);
  return spec;
};
let job = null;
const assertIdle = () => { if (job?.status === 'running') fail('A production task is running. Wait for it to finish before changing projects.', 409); };
export const studioState = (id) => {
  const projects = fs.readdirSync(path.join(root, 'videos'), {withFileTypes: true}).filter((e) => e.isDirectory() && fs.existsSync(path.join(root, 'videos', e.name, 'video.json'))).map((e) => {
    const spec = readProject(e.name);
    return {id: e.name, type: spec.productionType ?? 'education', scenes: spec.scenes.length};
  });
  const spec = readProject(id);
  const review = read(path.join(directory(id), 'studio.json'), {});
  const media = ['assets', 'render-assets'].flatMap((dir) => walk(path.join(publicRoot, dir))).filter((file) => /\.(png|jpe?g|webp)$/i.test(file)).map((file) => path.relative(publicRoot, file).split(path.sep).join('/'));
  const voices = walk(path.join(publicRoot, 'audio/voices')).filter((file) => /\.wav$/i.test(file)).map((file) => path.relative(publicRoot, file).split(path.sep).join('/'));
  const preview = review.previewRevision === revision(spec) ? review.previews : null;
  const readyAudio = review.audioRevision === audioRevision(spec) && spec.audio?.file && fs.existsSync(path.join(publicRoot, spec.audio.file));
  return {projects, spec, revision: revision(spec), productionTypes, media, voices, characters: assets().filter((a) => a.id.startsWith('character-')), job,
    review: {...review, designApproved: review.designRevision === revision(spec), scriptApproved: review.scriptRevision === scriptRevision(spec), audioApproved: Boolean(readyAudio && review.audioApproved === true)},
    previews: preview ?? [], audioReady: Boolean(readyAudio),
    exportUrl: review.exportRevision === revision(spec) ? review.exportUrl : null};
};

const startJob = (id, action, spec, review) => {
  assertIdle();
  const rev = revision(spec);
  const scriptRev = scriptRevision(spec);
  const variant = spec.format === 'youtube-9x16' ? 'reels' : 'landscape';
  const previewDir = path.join(root, 'out', 'studio', id);
  fs.mkdirSync(previewDir, {recursive: true});
  let cursor = 0;
  const previews = spec.scenes.map((scene, index) => {
    const frame = cursor + Math.min(scene.durationInFrames - 1, Math.max(1, Math.round(scene.durationInFrames * 0.4)));
    cursor += scene.durationInFrames;
    return {frame, file: path.join(previewDir, `scene-${index + 1}.png`), url: `/out/studio/${id}/scene-${index + 1}.png`};
  });
  const commands = action === 'preview' ? previews.map((p) => ['scripts/render-video-still.mjs', id, String(p.frame), p.file, variant])
    : action === 'audio' ? [['scripts/generate-chatterbox.mjs', 'video', id]]
    : [['scripts/render.mjs', 'video', id, variant]];
  job = {id: crypto.randomUUID(), projectId: id, action, status: 'running', log: '', completed: 0, total: commands.length};
  const activeJob = job;
  const run = (index) => {
    if (index === commands.length) {
      const current = readProject(id);
      const updated = read(path.join(directory(id), 'studio.json'), {});
      if (action === 'preview') Object.assign(updated, {previewRevision: rev, previews: previews.map((p) => p.url)});
      if (action === 'audio') {
        current.audio = {file: `audio/videos/${id}/narration.wav`, metadataFile: `audio/videos/${id}/metadata.json`, volume: 0.9};
        write(path.join(directory(id), 'video.json'), current);
        Object.assign(updated, {audioRevision: audioRevision(current), audioApproved: false,
        // Audio fitting changes only timing; keep the user's design approval but refresh previews.
        designRevision: updated.designRevision === rev ? revision(current) : undefined});
      }
      if (action === 'render') Object.assign(updated, {exportRevision: revision(current), exportUrl: `/out/${id}${variant === 'reels' ? '-reels' : ''}.mp4`});
      write(path.join(directory(id), 'studio.json'), updated);
      activeJob.status = 'complete';
      return;
    }
    const child = spawn(process.execPath, commands[index], {cwd: root, shell: false, windowsHide: true});
    const log = (data) => { activeJob.log = (activeJob.log + data.toString()).slice(-6000); };
    child.stdout.on('data', log);
    child.stderr.on('data', log);
    child.on('error', (error) => { activeJob.status = 'failed'; log(error.message); });
    child.on('close', (code) => {
      if (code !== 0) { activeJob.status = 'failed'; return; }
      activeJob.completed++;
      try { run(index + 1); } catch (error) { activeJob.status = 'failed'; log(error.message); }
    });
  };
  try { run(0); } catch (error) { activeJob.status = 'failed'; activeJob.log = error.message; }
};

export const studioAction = (body) => {
  assertIdle();
  const {id, action} = body;
  const dir = directory(id);
  if (action === 'create') {
    if (fs.existsSync(dir)) fail('A project with this ID already exists.', 409);
    if (!productionTypes.some((type) => type.id === body.type)) fail('Choose one of the three video types.');
    const spec = {version: 1, videoId: id, productionType: body.type, format: body.format === 'youtube-16x9' ? body.format : 'youtube-9x16', fps: 30, styleVersion: 'samithgath-fresh-1', voiceReferences: {narrator: 'audio/voices/gnanesh-clean.wav', skeptic: 'audio/voices/skeptic.wav'}, scenes: [{id: 'scene-1', title: 'Start with the problem', narration: 'Every useful explanation starts with a question.', board: 'paper', layout: body.type === 'animation' ? 'stage' : 'focus', motion: 'reveal', durationInFrames: 240, beats: [{frame: 0, action: 'reveal', text: 'The problem'}, {frame: 80, action: 'draw', text: 'The idea'}, {frame: 160, action: 'emphasis', text: 'The solution'}], characters: [], dialogue: [{speaker: 'narrator', text: 'Every useful explanation starts with a question. What are we trying to solve?', startFrame: 0, endFrame: 230, pauseAfterMs: 300}]}]};
    fs.mkdirSync(dir);
    write(path.join(dir, 'video.json'), spec);
    write(path.join(dir, 'studio.json'), {requireDesign: true, requireScript: true});
    return studioState(id);
  }
  let spec = readProject(id);
  const review = read(path.join(dir, 'studio.json'), {requireDesign: true, requireScript: true});
  if (action === 'upload') {
    if (typeof body.data !== 'string' || body.data.length > 14_000_000) fail('Choose an image smaller than 10 MB.');
    const bytes = Buffer.from(body.data, 'base64');
    const ext = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png' : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'jpg' : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : null;
    if (!ext) fail('Upload a PNG, JPEG or WebP screenshot.');
    const file = `render-assets/studio/${id}/${crypto.randomUUID()}.${ext}`;
    fs.mkdirSync(path.dirname(path.join(publicRoot, file)), {recursive: true});
    fs.writeFileSync(path.join(publicRoot, file), bytes, {flag: 'wx'});
    return {...studioState(id), uploadedFile: file};
  } else if (action === 'save') {
    if (body.revision !== revision(spec)) fail('This project changed on disk. Refresh before saving to avoid overwriting newer edits.', 409);
    const next = body.spec;
    if (next?.videoId !== id) fail('Project ID cannot be changed.');
    const errors = validateVideoSpec(next, assets(), {publicRoot});
    if (errors.length) fail(errors.join('\n'));
    if (next.scenes.length > 60) fail('Use at most 60 scenes per project.');
    for (const file of Object.values(next.voiceReferences ?? {})) safeMedia(file, 'audio/voices/');
    for (const scene of next.scenes) if (scene.screenshot) safeMedia(scene.screenshot.file, '');
    if (next.audio?.file) safeMedia(next.audio.file, 'audio/');
    if (audioRevision(next) !== audioRevision(spec)) { delete next.audio; delete review.audioRevision; review.audioApproved = false; }
    write(path.join(dir, 'video.json'), next);
    review.requireDesign = body.requireDesign !== false;
    review.requireScript = body.requireScript !== false;
    write(path.join(dir, 'studio.json'), review);
  } else if (action === 'approve-design') {
    if (review.previewRevision !== revision(spec)) fail('Generate current frame previews before approving the design.');
    review.designRevision = revision(spec);
    write(path.join(dir, 'studio.json'), review);
  } else if (action === 'approve-script') {
    review.scriptRevision = scriptRevision(spec);
    write(path.join(dir, 'studio.json'), review);
  } else if (action === 'approve-audio') {
    if (review.audioRevision !== audioRevision(spec)) fail('Generate current narration before approving audio.');
    review.audioApproved = true;
    write(path.join(dir, 'studio.json'), review);
  } else if (['preview', 'audio', 'render'].includes(action)) {
    if (action !== 'preview') {
      if (review.requireDesign !== false && review.designRevision !== revision(spec)) fail('Review and approve the frame designs first.');
      if (review.requireScript !== false && review.scriptRevision !== scriptRevision(spec)) fail('Review and approve the script first.');
    }
    if (action === 'audio') {
      for (const scene of spec.scenes) if (!scene.dialogue?.length) fail('Add dialogue to every scene before generating audio.');
      for (const speaker of new Set(spec.scenes.flatMap((s) => s.dialogue.map((l) => l.speaker)))) safeMedia(spec.voiceReferences?.[speaker] ?? `audio/voices/${speaker}.wav`, 'audio/voices/');
    }
    if (action === 'render') {
      assertCharacterApproval(root);
      if (review.audioRevision !== audioRevision(spec) || !review.audioApproved) fail('Generate and listen to the audio, then approve it before exporting.');
    }
    startJob(id, action, spec, review);
  } else fail('Unknown studio action.');
  return studioState(id);
};
export const projectRevision = revision;
