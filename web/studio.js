const app = document.querySelector('#app');
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
let data, draft, selected = 0, dirty = false, pending = false, creating = false, notice = '';
let projectId = new URLSearchParams(location.search).get('id') ?? '';
const layouts = {focus: 'Visual focus', split: 'Presenter + visual', stage: 'Character stage', sequence: 'Animated sequence'};
const motions = {reveal: 'Staggered reveal', zoom: 'Slow close-up', pan: 'Guided pan', still: 'Hold still'};
const options = (items, value) => items.map(([id, label]) => `<option value="${esc(id)}" ${id === value ? 'selected' : ''}>${esc(label)}</option>`).join('');
const running = () => data?.job?.status === 'running';
const disabled = () => pending || running() ? 'disabled' : '';
const active = () => draft.scenes[selected];
const setDirty = () => { dirty = true; const mark = document.querySelector('#save-status'); if (mark) mark.textContent = 'Unsaved changes'; document.querySelectorAll('[data-production]').forEach((b) => b.disabled = true); };
const request = async (body) => {
  const response = await fetch('/api/studio', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'The operation failed. Try again.');
  return result;
};
const load = async (replace = true) => {
  const response = await fetch(`/api/studio${projectId ? `?id=${encodeURIComponent(projectId)}` : ''}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Cannot open this project.');
  data = result;
  projectId = data.spec.videoId;
  if (replace) { draft = structuredClone(data.spec); selected = Math.min(selected, draft.scenes.length - 1); dirty = false; }
};
const field = (label, input) => `<label class="studio-field"><span>${label}</span>${input}</label>`;
const selectField = (label, attr, values, value) => field(label, `<select ${attr}>${options(values, value)}</select>`);
const sceneEditor = () => {
  const s = active();
  const shot = s.screenshot;
  return `<div class="scene-heading"><div><span class="eyebrow">SCENE ${String(selected + 1).padStart(2, '0')}</span><h2>Compose the frame</h2></div><span class="studio-badge">${Math.round(s.durationInFrames / draft.fps)} sec</span></div>
    <div class="scene-controls">
      ${field('Scene title', `<input data-scene="title" value="${esc(s.title)}" maxlength="100" required>`)}
      <div class="studio-grid">${selectField('Frame design', 'data-scene="layout"', Object.entries(layouts), s.layout ?? 'focus')}${selectField('Motion', 'data-scene="motion"', Object.entries(motions), s.motion ?? 'reveal')}</div>
      <div class="studio-grid">${selectField('Board surface', 'data-scene="board"', [['paper', 'Warm paper'], ['lesson', 'Teal lesson']], s.board === 'editorial' ? 'paper' : s.board)}${field('Minimum duration (seconds)', `<input data-duration type="number" min="2" max="120" value="${Math.round(s.durationInFrames / draft.fps)}">`)}</div>
      ${selectField('Screenshot / image', 'data-screenshot', [['', 'Use an animated diagram'], ...data.media.map((file) => [file, file.split('/').slice(-2).join('/')])], shot?.file ?? '')}
      <label class="upload-control">Import screenshot <input type="file" accept="image/png,image/jpeg,image/webp" data-upload ${disabled()}></label>
      ${shot ? `<div class="crop-controls">${field('Focus across (%)', `<input type="range" min="0" max="100" data-crop="focusX" value="${shot.focusX}">`)}${field('Focus down (%)', `<input type="range" min="0" max="100" data-crop="focusY" value="${shot.focusY}">`)}${field('Zoom', `<input type="range" min="1" max="3" step="0.05" data-crop="zoom" value="${shot.zoom}">`)}</div>` : ''}
      ${field('Visual steps (one per line, up to four)', `<textarea data-beats rows="3">${esc(s.beats.map((b) => b.text ?? b.action).join('\n'))}</textarea>`)}
      ${field('Dialogue — one speaker: sentence per line', `<textarea data-dialogue rows="5" spellcheck="true">${esc((s.dialogue ?? []).map((line) => `${line.speaker}: ${line.text}`).join('\n'))}</textarea>`)}
      <p class="studio-hint">Keep sentences together. Narration sets the final timing; scenes expand to fit the voice.</p>
      <div class="scene-actions"><button type="button" data-move="-1" ${selected === 0 ? 'disabled' : ''}>Move earlier</button><button type="button" data-move="1" ${selected === draft.scenes.length - 1 ? 'disabled' : ''}>Move later</button><button type="button" data-duplicate>Duplicate</button><button type="button" data-remove ${draft.scenes.length === 1 ? 'disabled' : ''}>Remove scene</button></div>
    </div>`;
};
const sketch = () => {
  const s = active();
  const vertical = draft.format === 'youtube-9x16';
  return `<div class="canvas-label"><span>LAYOUT SKETCH</span><span>${vertical ? '9:16 · REELS' : '16:9 · YOUTUBE'}</span></div>
    <div class="frame-sketch ${vertical ? 'portrait' : 'landscape'} layout-${esc(s.layout ?? 'focus')}">
      <h3>${esc(s.title)}</h3>
      <div class="sketch-visual">${s.screenshot ? `<img id="crop-image" src="/${esc(s.screenshot.file)}" alt="Selected screenshot crop" style="object-position:${s.screenshot.focusX}% ${s.screenshot.focusY}%;transform:scale(${s.screenshot.zoom});transform-origin:${s.screenshot.focusX}% ${s.screenshot.focusY}%">` : `<div class="sketch-nodes">${s.beats.map((b, i) => `<span><small>${i + 1}</small>${esc(b.text)}</span>`).join('')}</div>`}</div>
      <div class="sketch-cast">${s.characters.map((c) => { const a = data.characters.find((a) => a.id === c.assetId); return a ? `<img src="/${esc(a.file)}" alt="${esc(c.speaker)} character" style="transform:${c.speaker === 'skeptic' ? 'scaleX(-1)' : 'none'}">` : ''; }).join('')}</div>
      <div class="sketch-subtitle">${esc(s.dialogue?.[0]?.text ?? 'Dialogue appears here')}</div>
      <div class="sketch-steps">${s.beats.map((b) => `<span>${esc(b.text)}</span>`).join('')}</div>
    </div><p class="studio-hint">Composition guide. Generate frame previews below to inspect the actual render.</p>`;
};
const pipeline = () => {
  const stale = dirty || pending || running() || !data.spec.productionType;
  const button = (action, label, off = false) => `<button type="button" data-production="${action}" ${stale || off ? 'disabled' : ''}>${label}</button>`;
  return `<section class="pipeline" aria-labelledby="pipeline-heading"><div class="scene-heading"><div><span class="eyebrow">PRODUCTION</span><h2 id="pipeline-heading">From frame to final cut</h2></div><span id="save-status" role="status">${dirty ? 'Unsaved changes' : 'Saved to project folder'}</span></div>
    <div class="pipeline-stages">
      <article><span class="stage-number">01</span><h3>Frame designs</h3><p>${data.review.designApproved ? 'Designs approved' : data.previews.length ? 'Ready to review' : 'Preview each scene before narration.'}</p>${button('preview', 'Generate PNGs')}${button('approve-design', 'Approve designs', !data.previews.length || data.review.designApproved)}</article>
      <article><span class="stage-number">02</span><h3>Script</h3><p>${data.review.scriptApproved ? 'Script approved' : 'Review the dialogue in every scene.'}</p>${button('approve-script', 'Approve script', data.review.scriptApproved)}</article>
      <article><span class="stage-number">03</span><h3>Narration</h3><p>${data.audioReady ? 'Listen for pacing, clarity and unwanted sounds.' : 'Generate with the selected reference voices.'}</p>${button('audio', 'Generate audio')}${data.audioReady ? `<audio controls preload="none" src="/${esc(data.spec.audio.file)}?v=${data.revision}" aria-label="Generated narration"></audio>${button('approve-audio', data.review.audioApproved ? 'Audio approved' : 'Audio sounds good', data.review.audioApproved)}` : ''}</article>
      <article><span class="stage-number">04</span><h3>Export</h3><p>One video in the selected orientation.</p>${button('render', 'Render video', !data.review.audioApproved)}${data.exportUrl ? `<a class="download-video" href="${esc(data.exportUrl)}" download>Download MP4</a>` : ''}<a href="/review">Visual asset approval desk</a></article>
    </div>
    ${data.job ? `<div class="job-status" role="status"><strong>${esc(data.job.action)} · ${esc(data.job.status)}</strong><span>${data.job.completed} / ${data.job.total} tasks · ${esc(data.job.projectId)}</span><details><summary>Production log</summary><pre>${esc(data.job.log || 'Starting…')}</pre></details></div>` : ''}
    ${data.previews.length ? `<div class="frame-previews">${data.previews.map((url, i) => `<a href="${url}?v=${data.revision}" target="_blank" rel="noopener"><img src="${url}?v=${data.revision}" alt="Rendered scene ${i + 1}" loading="lazy"><span>Scene ${i + 1} · open full size</span></a>`).join('')}</div>` : ''}
    ${data.exportUrl ? `<video class="final-preview" controls preload="metadata" src="${esc(data.exportUrl)}?v=${data.revision}" aria-label="Final rendered video"></video>` : ''}
    </section>`;
};
const newProject = () => `<form id="new-project" class="new-project"><h2>Start a video</h2><div class="studio-grid">${field('Project ID', '<input name="id" required pattern="[a-z0-9]([a-z0-9]|-){0,79}" placeholder="my-next-video" maxlength="80">')}${selectField('Video type', 'name="type"', data.productionTypes.map((t) => [t.id, t.name]), 'education')}${selectField('Orientation', 'name="format"', [['youtube-9x16', 'Reels · portrait 9:16'], ['youtube-16x9', 'YouTube · landscape 16:9']], 'youtube-9x16')}</div><div class="scene-actions"><button class="primary" type="submit" ${disabled()}>Create project</button><button type="button" data-cancel-create>Cancel</button></div></form>`;
const render = () => {
  if (!data) return;
  const type = draft.productionType ?? 'education';
  app.innerHTML = `<div class="studio-shell"><header class="studio-header"><a class="studio-brand" href="/">Sinema<span>VIDEO STUDIO</span></a><div class="project-picker">${selectField('Project', 'id="project-picker"', data.projects.map((p) => [p.id, p.id]), projectId)}<button type="button" data-new ${disabled()}>New video</button><a href="/review">Review desk ↗</a></div></header>
    <main id="main-content"><div class="studio-intro"><div><span class="eyebrow">YOUR STORY, FRAME BY FRAME</span><h1>What are we making?</h1></div><p>Choose a format. Build the scenes.<br>Bring the explanation to life.</p></div>
    ${creating ? newProject() : ''}
    <div class="type-picker" aria-label="Video type">${data.productionTypes.map((t) => `<button type="button" data-type="${t.id}" aria-pressed="${type === t.id}" ${disabled()}><span class="type-icon" aria-hidden="true">${t.id === 'animation' ? '◈' : t.id === 'education' ? 'Aa' : '↗'}</span><strong>${t.name}</strong><span>${t.description}</span></button>`).join('')}</div>
    <section class="project-settings" aria-label="Video setup">${selectField('Orientation', 'data-format', [['youtube-9x16', 'Reels · 9:16'], ['youtube-16x9', 'YouTube · 16:9']], draft.format)}
      ${['narrator', 'skeptic'].map((speaker) => selectField(`${speaker === 'narrator' ? 'Narrator' : 'Second character'} voice`, `data-voice="${speaker}"`, data.voices.map((v) => [v, v.split('/').at(-1).replace('.wav', '')]), draft.voiceReferences?.[speaker] ?? `audio/voices/${speaker}.wav`)).join('')}
      <div class="approval-options"><label><input type="checkbox" id="require-design" ${data.review.requireDesign !== false ? 'checked' : ''}> Approve PNG designs before audio</label><label><input type="checkbox" id="require-script" ${data.review.requireScript !== false ? 'checked' : ''}> Approve script before audio</label></div>
    </section>
    <div class="editor-toolbar"><h2>Storyboard <small>${draft.scenes.length} scenes · ${Math.round(draft.scenes.reduce((sum, s) => sum + s.durationInFrames, 0) / draft.fps)} sec minimum</small></h2><button class="primary" type="button" data-save ${disabled()}>${pending ? 'Working…' : 'Save project'}</button></div>
    <div class="studio-notice" role="status">${esc(notice)}</div>
    <div class="studio-editor"><aside class="scene-rail" aria-label="Scenes">${draft.scenes.map((s, i) => `<button type="button" data-select="${i}" aria-current="${selected === i ? 'true' : 'false'}"><span>${String(i + 1).padStart(2, '0')}</span><strong>${esc(s.title)}</strong><small>${esc(layouts[s.layout ?? 'focus'])}</small></button>`).join('')}<button type="button" data-add>+ Add scene</button></aside>
      <section class="frame-workspace"><div id="layout-sketch">${sketch()}</div><div class="cast-settings">${['narrator', 'skeptic'].map((speaker) => selectField(`${speaker === 'narrator' ? 'Narrator' : 'Second character'} appearance`, `data-character="${speaker}"`, [['', 'Off screen'], ...data.characters.map((a) => [a.id, a.label])], active().characters.find((c) => c.speaker === speaker)?.assetId ?? '')).join('')}</div></section>
      <section class="scene-inspector"><fieldset ${disabled()}>${sceneEditor()}</fieldset></section>
    </div>${pipeline()}</main><footer class="studio-footer">Local production workspace · PNG review → narration → video <span>Sinema / Samithgath</span></footer></div>`;
  if (!data.spec.productionType && !notice) document.querySelector('.studio-notice').textContent = 'Save this project to enable the new layouts and production controls.';
  if (running() || pending) app.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = true; });
};
const updateSketch = () => { document.querySelector('#layout-sketch').innerHTML = sketch(); };

app.addEventListener('input', (event) => {
  const el = event.target;
  const s = active();
  if (el.matches('[data-scene]')) s[el.dataset.scene] = el.value;
  else if (el.matches('[data-duration]')) {
    if (!el.checkValidity()) return;
    const old = s.durationInFrames;
    s.durationInFrames = Math.round(Number(el.value) * draft.fps);
    s.beats.forEach((b) => b.frame = Math.min(s.durationInFrames - 1, Math.round(b.frame / old * s.durationInFrames)));
    s.dialogue?.forEach((line) => { line.startFrame = Math.floor((line.startFrame ?? 0) / old * s.durationInFrames); line.endFrame = Math.max(line.startFrame + 1, Math.round((line.endFrame ?? old) / old * s.durationInFrames)); });
  } else if (el.matches('[data-beats]')) {
    const lines = el.value.split('\n').filter((v) => v.trim()).slice(0, 4);
    s.beats = lines.map((text, i) => ({frame: Math.floor(i / lines.length * s.durationInFrames), action: i ? 'emphasis' : 'reveal', text}));
    s.visual = {kind: 'pipeline', label: s.title, nodes: lines};
  } else if (el.matches('[data-dialogue]')) {
    const lines = el.value.split('\n').filter((v) => v.trim());
    s.dialogue = lines.map((text, i) => { const parts = text.match(/^([a-z0-9_-]+):\s*(.+)$/i); return {speaker: parts?.[1] ?? 'narrator', text: parts?.[2] ?? text, pauseAfterMs: 300, startFrame: Math.floor(i / lines.length * s.durationInFrames), endFrame: Math.floor((i + 1) / lines.length * s.durationInFrames)}; });
    s.narration = s.dialogue.map((l) => l.text).join(' ') || s.title;
  } else if (el.matches('[data-crop]')) s.screenshot[el.dataset.crop] = Number(el.value);
  else if (el.matches('#require-design, #require-script')) { data.review[el.id === 'require-design' ? 'requireDesign' : 'requireScript'] = el.checked; }
  else return;
  setDirty(); updateSketch();
});
app.addEventListener('change', async (event) => {
  const el = event.target;
  if (el.matches('#project-picker')) {
    if (dirty && !confirm('Discard unsaved changes and switch projects?')) { el.value = projectId; return; }
    projectId = el.value; selected = 0; await perform(async () => { await load(); }); return;
  }
  if (el.matches('[data-format]')) draft.format = el.value;
  else if (el.matches('[data-voice]')) { draft.voiceReferences ??= {}; draft.voiceReferences[el.dataset.voice] = el.value; }
  else if (el.matches('[data-character]')) {
    const s = active(), speaker = el.dataset.character;
    s.characters = s.characters.filter((c) => c.speaker !== speaker);
    if (el.value) s.characters.push({assetId: el.value, speaker, x: speaker === 'narrator' ? 0.04 : 0.72, y: 0.5, width: 0.22});
  } else if (el.matches('[data-screenshot]')) { if (el.value) active().screenshot = {file: el.value, focusX: 50, focusY: 50, zoom: 1}; else delete active().screenshot; }
  else if (el.matches('[data-upload]')) {
    const file = el.files[0]; if (!file) return;
    await perform(async () => {
      if (file.size > 10_000_000) throw new Error('Choose an image smaller than 10 MB.');
      const encoded = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file); });
      data = await request({id: projectId, action: 'upload', data: encoded});
      active().screenshot = {file: data.uploadedFile, focusX: 50, focusY: 50, zoom: 1}; setDirty();
      notice = 'Screenshot imported. Adjust its crop and save the scene.';
    }); return;
  } else return;
  setDirty(); render();
});
const perform = async (fn) => {
  if (pending) return;
  pending = true;
  try { await fn(); } catch (error) { notice = error.message || 'Something went wrong. Your edits are still here.'; }
  finally { pending = false; render(); }
};
app.addEventListener('click', async (event) => {
  const el = event.target.closest('button'); if (!el || el.disabled || pending) return;
  if (el.hasAttribute('data-new')) { if (dirty && !confirm('Start a new project and discard unsaved edits?')) return; creating = true; render(); document.querySelector('#new-project input').focus(); return; }
  if (el.hasAttribute('data-cancel-create')) { creating = false; render(); return; }
  if (el.dataset.select !== undefined) { selected = Number(el.dataset.select); render(); return; }
  if (el.hasAttribute('data-save')) {
    await perform(async () => {
      const invalid = [...app.querySelectorAll('.scene-inspector input')].find((input) => !input.checkValidity());
      if (invalid) throw new Error('Check the scene title and duration before saving.');
      draft.productionType ??= 'education';
      data = await request({id: projectId, action: 'save', spec: draft, revision: data.revision, requireDesign: data.review.requireDesign, requireScript: data.review.requireScript});
      draft = structuredClone(data.spec); dirty = false; notice = 'Project saved. Generate previews to review the composition.';
    }); return;
  }
  if (el.dataset.production) {
    await perform(async () => { data = await request({id: projectId, action: el.dataset.production}); notice = `${el.textContent.trim()} — saved.`; }); return;
  }
  if (running()) return;
  if (el.dataset.type) {
    draft.productionType = el.dataset.type;
    const preset = data.productionTypes.find((t) => t.id === el.dataset.type);
    draft.scenes.forEach((s, i) => { s.layout = preset.layouts[i % preset.layouts.length]; s.motion ??= 'reveal'; if (s.board === 'editorial') s.board = 'paper'; });
  } else if (el.hasAttribute('data-add') || el.hasAttribute('data-duplicate')) {
    const s = structuredClone(active()); s.id = `scene-${crypto.randomUUID().slice(0, 8)}`;
    if (el.hasAttribute('data-add')) { s.title = 'Explain the next step'; s.narration = s.title; s.dialogue = [{speaker: 'narrator', text: 'Here is the next step.', startFrame: 0, endFrame: s.durationInFrames, pauseAfterMs: 300}]; delete s.screenshot; s.visual = {kind: 'pipeline', label: s.title, nodes: ['Start', 'Action', 'Result']}; s.beats = s.visual.nodes.map((text, i) => ({frame: Math.floor(i / 3 * s.durationInFrames), action: 'reveal', text})); }
    draft.scenes.splice(selected + 1, 0, s); selected++;
  } else if (el.hasAttribute('data-remove')) { if (!confirm('Remove this scene from the draft? This takes effect when you save.')) return; draft.scenes.splice(selected, 1); selected = Math.max(0, selected - 1); }
  else if (el.dataset.move) { const next = selected + Number(el.dataset.move); [draft.scenes[selected], draft.scenes[next]] = [draft.scenes[next], draft.scenes[selected]]; selected = next; }
  else return;
  setDirty(); render();
});
app.addEventListener('submit', async (event) => {
  event.preventDefault(); if (!event.target.matches('#new-project')) return;
  const fields = new FormData(event.target);
  await perform(async () => { data = await request({action: 'create', ...Object.fromEntries(fields)}); projectId = data.spec.videoId; draft = structuredClone(data.spec); selected = 0; dirty = false; creating = false; notice = 'Project created. Choose your voices and build the first scene.'; history.replaceState(null, '', `/?id=${projectId}`); });
});
window.addEventListener('beforeunload', (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
load().then(render).catch((error) => { app.innerHTML = `<main class="error-state"><h1>Cannot open the studio</h1><p>${esc(error.message)}</p><a href="/">Open default project</a></main>`; });
window.setInterval(async () => {
  if (!data || pending || !running()) return;
  try { await load(!dirty); render(); } catch (error) { notice = `Connection interrupted: ${error.message}`; render(); }
}, 2500);
