import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {approveCharacterAssets, readCharacterApproval, revokeCharacterApproval, scanCharacterAssets} from './character-approval.mjs';
import {studioState, studioAction} from './studio-api.mjs';

const root = process.cwd();
const webRoot = path.join(root, 'web');
const publicRoot = path.join(root, 'public');
const outRoot = path.join(root, 'out');
const notesPath = path.join(root, 'props', 'production-notes.json');
const port = Number(process.env.SAMITHGATH_WEB_PORT ?? 4173);
const host = '127.0.0.1';
const requestedVideoId = process.env.SAMITHGATH_VIDEO_ID ?? process.argv[2] ?? '';
const currentVideoId = /^[a-z0-9-]+$/.test(requestedVideoId)
  ? requestedVideoId
  : 'eda';

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const readJsonIfExists = (file, fallback) => fs.existsSync(path.join(root, file)) ? readJson(file) : fallback;
const readNotes = () => fs.existsSync(notesPath)
  ? JSON.parse(fs.readFileSync(notesPath, 'utf8'))
  : {version: 1, notes: {}};
const writeNotes = (value) => {
  fs.mkdirSync(path.dirname(notesPath), {recursive: true});
  fs.writeFileSync(notesPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const mime = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
};

const safePath = (base, requestPath) => {
  const resolvedBase = path.resolve(base);
  const resolved = path.resolve(resolvedBase, `.${decodeURIComponent(requestPath)}`);
  return resolved === resolvedBase || resolved.startsWith(`${resolvedBase}${path.sep}`) ? resolved : null;
};

const send = (response, status, body, type = 'text/plain; charset=utf-8') => {
  response.writeHead(status, {'Content-Type': type, 'Cache-Control': 'no-store'});
  response.end(body);
};

const sendJson = (response, status, value) => send(response, status, JSON.stringify(value), 'application/json; charset=utf-8');

const readBody = (request, limit = 100_000) => new Promise((resolve, reject) => {
  let body = '';
  request.setEncoding('utf8');
  request.on('data', (chunk) => {
    body += chunk;
    if (body.length > limit) { reject(Object.assign(new Error('Request body is too large.'), {status: 413})); request.destroy(); }
  });
  request.on('end', () => resolve(body));
  request.on('error', reject);
});

const getState = () => {
  const team = readJson('src/data/productionTeam.json');
  const spec = readJson(`videos/${currentVideoId}/video.json`);
  const style = readJson('brand/style-system.json');
  const notes = readNotes();
  const discovered = scanCharacterAssets(root);
  const approval = readCharacterApproval(root);
  const manifest = readJson('src/data/characterAssets.json');
  const voiceProfiles = readJsonIfExists('public/audio/voices/voice-profiles.json', {profiles: []});
  const audioMetadata = readJsonIfExists(`public/${spec.audio?.file ? path.posix.dirname(spec.audio.file) + '/metadata.json' : `audio/videos/${currentVideoId}/metadata.json`}`, null);
  const assets = manifest.map((asset) => {
    const discoveredAsset = discovered.find((item) => item.id === asset.id) ?? asset;
    const approved = approval.assets?.find((item) => item.id === asset.id);
    return {...discoveredAsset, sha256: approved?.sha256 ?? null, approved: Boolean(approved)};
  });
  const previews = Object.fromEntries(Object.keys(style.boards).map((board) => [board, fs.existsSync(path.join(outRoot, `board-${board}.mp4`))]));
  const totalFrames = spec.scenes.reduce((sum, scene) => sum + scene.durationInFrames, 0);
  const audioLines = (audioMetadata?.lines ?? []).map((line, index) => ({
    ...line,
    sceneId: line.sceneId ?? spec.scenes[index]?.id ?? null,
    sceneTitle: line.sceneTitle ?? spec.scenes[index]?.title ?? `Scene ${index + 1}`,
    url: `/${line.file}`,
  }));
  const audioFile = audioMetadata?.assembledFile ?? spec.audio?.file ?? null;
  const voices = (voiceProfiles.profiles ?? []).map((profile) => {
    const file = `audio/voices/${profile.referenceFile ?? `${profile.id}.wav`}`;
    return {...profile, file, url: `/${file}`, exists: fs.existsSync(path.join(publicRoot, file))};
  });
  return {
    team,
    scenes: spec.scenes,
    styleVersion: spec.styleVersion,
    boards: style.boards,
    assets,
    approval,
    previews,
    notes: notes.notes ?? {},
    draft: {
      id: currentVideoId,
      format: spec.format,
      fps: spec.fps,
      totalFrames,
      durationSeconds: totalFrames / spec.fps,
      audioDurationMs: audioLines.at(-1)?.endMs ?? null,
    },
    audio: audioFile ? {
      url: `/${audioFile}`,
      file: audioFile,
      sampleRate: audioMetadata?.sampleRate ?? null,
      durationMs: audioLines.at(-1)?.endMs ?? null,
      lines: audioLines,
    } : null,
    voices,
    generatedAt: new Date().toISOString(),
  };
};

const serveStatic = (response, base, requestPath, fallback = null) => {
  const file = safePath(base, requestPath);
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (fallback) return serveStatic(response, base, fallback);
    send(response, 404, 'Not found');
    return;
  }
  send(response, 200, fs.readFileSync(file), mime[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://${host}:${port}`);
    if (request.method === 'POST' && request.headers.origin && request.headers.origin !== `http://${host}:${port}`) {
      sendJson(response, 403, {error: 'Open this workspace on its local address before making changes.'});
      return;
    }
    if (url.pathname === '/api/studio' && request.method === 'GET') {
      sendJson(response, 200, studioState(url.searchParams.get('id') || currentVideoId));
      return;
    }
    if (url.pathname === '/api/studio' && request.method === 'POST') {
      sendJson(response, 200, studioAction(JSON.parse(await readBody(request, 16_000_000))));
      return;
    }
    if (url.pathname === '/api/state' && request.method === 'GET') {
      sendJson(response, 200, getState());
      return;
    }
    if (url.pathname === '/api/approval' && request.method === 'POST') {
      const body = JSON.parse(await readBody(request));
      if (!['approved', 'pending'].includes(body.status)) {
        sendJson(response, 400, {error: 'Approval status must be approved or pending.'});
        return;
      }
      body.status === 'approved' ? approveCharacterAssets(root) : revokeCharacterApproval(root);
      sendJson(response, 200, getState());
      return;
    }
    if (url.pathname === '/api/notes' && request.method === 'POST') {
      const body = JSON.parse(await readBody(request));
      const team = readJson('src/data/productionTeam.json');
      const validRole = team.tabs.some((tab) => tab.id === body.roleId);
      if (!validRole || typeof body.note !== 'string') {
        sendJson(response, 400, {error: 'A valid role and note are required.'});
        return;
      }
      const note = body.note.trim();
      if (note.length > 2_000) {
        sendJson(response, 400, {error: 'Notes are limited to 2,000 characters.'});
        return;
      }
      const notes = readNotes();
      notes.notes = {...(notes.notes ?? {}), [body.roleId]: {text: note, updatedAt: new Date().toISOString()}};
      writeNotes(notes);
      sendJson(response, 200, getState());
      return;
    }
    if (url.pathname === '/review') {
      send(response, 200, fs.readFileSync(path.join(webRoot, 'index.html'), 'utf8').replace('/studio.js', '/app.js'), 'text/html; charset=utf-8');
      return;
    }
    if (url.pathname === '/') {
      serveStatic(response, webRoot, '/index.html');
      return;
    }
    if (url.pathname.startsWith('/assets/')) {
      serveStatic(response, publicRoot, url.pathname);
      return;
    }
    if (url.pathname.startsWith('/render-assets/')) {
      serveStatic(response, publicRoot, url.pathname);
      return;
    }
    if (url.pathname.startsWith('/audio/')) {
      serveStatic(response, publicRoot, url.pathname);
      return;
    }
    if (url.pathname.startsWith('/out/')) {
      serveStatic(response, root, url.pathname);
      return;
    }
    serveStatic(response, webRoot, url.pathname);
  } catch (error) {
    sendJson(response, error.status ?? (error instanceof SyntaxError ? 400 : 500), {error: error instanceof Error ? error.message : 'Unexpected server error.'});
  }
});

server.listen(port, host, () => {
  console.log(`Samithgath production desk: http://${host}:${port}`);
});

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}
