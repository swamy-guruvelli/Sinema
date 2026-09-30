const app = document.querySelector('#app');
const colors = {terracotta: '#c9573e', blue: '#2e6d9f', yellow: '#f1c453', teal: '#157f80', green: '#5f8750', saffron: '#ed8b35'};
let state;
let view = 'review';
let roleId = 'director';
let boardId = 'paper';
let busy = false;
let noteBusy = false;
const noteDrafts = {};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'}[character]));
const role = () => state.team.tabs.find((tab) => tab.id === roleId) ?? state.team.tabs[0];
const board = () => state.boards[boardId] ?? state.boards.paper;
const scene = () => state.scenes.find((item) => item.board === boardId);
const color = (name) => colors[name] ?? colors.terracotta;
const list = (items) => `<ul class="clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
const formatDuration = (milliseconds) => {
  if (!Number.isFinite(milliseconds)) return '—';
  const totalSeconds = Math.round(milliseconds / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
};
const formatDraftDuration = (seconds) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}` : '—';

const renderTeam = () => {
  const active = role();
  const accent = color(active.color);
  const savedNote = state.notes?.[active.id];
  const noteValue = noteDrafts[active.id] ?? savedNote?.text ?? '';
  const noteStatus = savedNote?.updatedAt ? `Saved ${new Date(savedNote.updatedAt).toLocaleString()}` : 'Not saved yet';
  return `
    <div class="view-header">
      <div><div class="eyebrow">LIVE PRODUCTION TEAM</div><h1>A small team for every story.</h1></div>
      <p>Choose an agent to inspect its brief, inputs, and handoff. This is the same contract Codex uses while building the Remotion video.</p>
    </div>
    <div class="role-layout">
      <div class="role-tabs" role="tablist" aria-label="Production roles">
        ${state.team.tabs.map((tab) => `<button class="role-tab" type="button" role="tab" aria-selected="${tab.id === active.id}" aria-controls="role-panel" tabindex="${tab.id === active.id ? 0 : -1}" data-role="${escapeHtml(tab.id)}"><span>${escapeHtml(tab.stage)}</span>${escapeHtml(tab.label)}</button>`).join('')}
      </div>
      <section class="role-panel" id="role-panel" style="--accent: ${accent}" aria-labelledby="active-role">
        <div class="panel-top"><div class="section-label">${escapeHtml(active.stage)}</div><div class="utility">AGENT ${String(state.team.tabs.indexOf(active) + 1).padStart(2, '0')} / ${String(state.team.tabs.length).padStart(2, '0')}</div></div>
        <h2 id="active-role">${escapeHtml(active.label)}</h2>
        <div class="prompt-card">${escapeHtml(active.prompt)}</div>
        <div class="two-column">
          <div class="list-block"><div class="meta-label">Reads</div>${list(active.inputs)}</div>
          <div class="list-block"><div class="meta-label">Delivers</div>${list(active.outputs)}</div>
        </div>
        <section class="notes-card" aria-labelledby="notes-title">
          <div class="notes-heading"><div><div class="meta-label">Codex handoff note</div><h3 id="notes-title">Changes or actions for this stage</h3></div><div class="note-status">${escapeHtml(noteStatus)}</div></div>
          <label class="sr-only" for="stage-notes">Notes for the ${escapeHtml(active.label)} agent</label>
          <textarea id="stage-notes" maxlength="2000" placeholder="Example: keep the character still, use one slow pan, and make the voice younger.">${escapeHtml(noteValue)}</textarea>
          <div class="notes-footer"><span>Saved notes are written to props/production-notes.json for Codex.</span><button class="action-button" type="button" data-save-note="${escapeHtml(active.id)}" ${noteBusy ? 'disabled' : ''}>${noteBusy ? 'Saving...' : 'Save note'}</button></div>
        </section>
      </section>
    </div>
    <div class="handoff">
      <div class="dark-card"><div class="meta-label">Handoff contract</div><p>Notes become structured data. Structured data becomes a deterministic render.</p></div>
      <div class="light-card"><div class="meta-label">Current discipline</div><p>Approve the design, then let Codex keep building from the approved registry.</p></div>
    </div>`;
};

const renderBoards = () => {
  const active = board();
  const activeScene = scene();
  const preview = state.previews[boardId];
  const style = `--board-bg: ${active.background}; --board-ink: ${active.ink}; --board-accent: ${active.accent};`;
  return `
    <div class="view-header"><div><div class="eyebrow">BOARD LIBRARY</div><h1>One style system. Different boards.</h1></div><p>Switch the visual surface without changing the video contract. Each board remains deterministic and reusable.</p></div>
    <div class="board-tabs" role="tablist" aria-label="Board designs">${Object.keys(state.boards).map((id) => `<button class="board-tab" type="button" role="tab" aria-selected="${id === boardId}" data-board="${id}">${id}</button>`).join('')}</div>
    <div class="board-card" style="${style}">
      <section class="board-copy" aria-labelledby="board-title"><div class="board-kicker"><span class="board-swatch"></span>${escapeHtml(boardId)} board</div><h2 id="board-title">${escapeHtml(activeScene?.title ?? 'Board ready for a new scene')}</h2><p>${escapeHtml(activeScene?.narration ?? 'No scene is assigned to this board yet. The board is available for the next approved story beat.')}</p>${activeScene ? `<ul class="beat-list">${activeScene.beats.map((beat) => `<li><span class="beat-frame">${String(beat.frame).padStart(3, '0')}f</span><span>${escapeHtml(beat.text ?? beat.action)}${beat.speaker ? ` / ${escapeHtml(beat.speaker)}` : ''}</span></li>`).join('')}</ul>` : ''}</section>
      <aside class="board-preview"><h3>Rendered preview</h3>${preview ? `<video controls preload="metadata" src="/out/board-${escapeHtml(boardId)}.mp4" aria-label="${escapeHtml(boardId)} board preview"></video><div class="utility">Preview is available from the last render.</div>` : `<div class="preview-placeholder">This board is registered and ready. Render it with <strong>npm run render:board -- ${escapeHtml(boardId)}</strong> to place a preview here.</div>`}</aside>
    </div>`;
};

const renderReview = () => {
  const approved = state.approval.status === 'approved';
  const draft = state.draft ?? {};
  const audio = state.audio;
  return `
    <div class="view-header"><div><div class="eyebrow">REVIEW BEFORE RENDER</div><h1>See the ingredients first.</h1></div><p>Review the current visual assets, listen to the India narration, and use Team for stage notes. Video rendering stays behind the approval gate.</p></div>
    <section class="draft-strip" aria-label="Current draft"><div><div class="meta-label">Current draft</div><strong>${escapeHtml(draft.id ?? 'No draft')}</strong></div><div><div class="meta-label">Timeline</div><strong>${formatDraftDuration(draft.durationSeconds)} / ${draft.totalFrames ?? '—'} frames</strong></div><div><div class="meta-label">Audio</div><strong>${audio ? `${formatDuration(audio.durationMs)} ready` : 'Not generated'}</strong></div><div><div class="meta-label">Render rule</div><strong>${approved ? 'Visual approval open' : 'Locked until approval'}</strong></div></section>
    <section class="review-gate ${approved ? 'is-approved' : 'is-locked'}" aria-labelledby="gate-title"><div><div class="meta-label">Asset gate</div><h2 id="gate-title">${approved ? 'Visual assets approved' : 'Rendering is locked'}</h2><p>${approved ? `Approved ${new Date(state.approval.approvedAt).toLocaleString()}. Revoke approval if you want to revise the visual set before the next render.` : 'Review every visual asset and the audio below. Approving the current registry is the only action that unlocks a long render.'}</p></div><div class="gate-actions"><span class="gate-state">${approved ? 'READY' : 'LOCKED'}</span><button class="action-button ${approved ? 'secondary' : ''}" type="button" data-approval="${approved ? 'pending' : 'approved'}" ${busy ? 'disabled' : ''}>${busy ? 'Saving...' : approved ? 'Revoke approval' : 'Approve current designs'}</button></div></section>
    <section class="review-section" aria-labelledby="asset-review-title"><div class="section-heading"><div><div class="eyebrow">01 / VISUAL ASSETS</div><h2 id="asset-review-title">Inspect every design before it enters a scene.</h2></div><p>${state.assets.length} registered renderable assets. The renderer uses these exact files and hashes.</p></div><div class="approval-grid">${state.assets.map((asset) => `<article class="approval-card"><img src="/${escapeHtml(asset.file)}" alt="${escapeHtml(asset.label)} visual asset" loading="lazy"><div class="approval-card-body"><div class="asset-card-top"><span class="asset-index">${String(state.assets.indexOf(asset) + 1).padStart(2, '0')}</span><span class="asset-state">${approved && asset.approved ? 'HASH LOCKED' : 'REVIEW'}</span></div><h3>${escapeHtml(asset.label)}</h3><p>${escapeHtml(asset.role)}</p></div></article>`).join('')}</div></section>
    <section class="review-section voice-review" aria-labelledby="voice-review-title"><div class="section-heading"><div><div class="eyebrow">02 / VOICE REFERENCES</div><h2 id="voice-review-title">Choose the sound of each character.</h2></div><p>These are local Chatterbox demo references for testing. Replace them with owned or licensed references before publishing.</p></div><div class="voice-grid">${(state.voices ?? []).map((voice, index) => `<article class="voice-card"><div class="audio-line-top"><span class="asset-index">${String(index + 1).padStart(2, '0')}</span><span class="audio-time">${escapeHtml(voice.id)}</span></div><h3>${escapeHtml(voice.label ?? voice.id)}</h3><p>${escapeHtml(voice.persona ?? 'Reference voice')}</p>${voice.exists ? `<audio controls preload="metadata" src="${escapeHtml(voice.url)}" aria-label="${escapeHtml(voice.label ?? voice.id)} voice reference"></audio>` : '<div class="empty-state"><strong>Missing WAV</strong></div>'}</article>`).join('')}</div></section>
    <section class="review-section audio-review" aria-labelledby="audio-review-title"><div class="section-heading"><div><div class="eyebrow">03 / AUDIO CHECK</div><h2 id="audio-review-title">Hear the story before we animate it.</h2></div><p>Listen to the full narration or check each scene line independently.</p></div>${audio ? `<div class="audio-master"><div><div class="meta-label">Full narration</div><strong>${formatDuration(audio.durationMs)} / ${audio.sampleRate ? `${audio.sampleRate} Hz` : 'local WAV'}</strong></div><audio controls preload="metadata" src="${escapeHtml(audio.url)}" aria-label="Full India story narration"></audio></div><div class="audio-line-grid">${audio.lines.map((line, index) => `<article class="audio-line-card"><div class="audio-line-top"><span class="asset-index">${String(index + 1).padStart(2, '0')}</span><span class="audio-time">${formatDuration(line.durationMs)}</span></div><div class="meta-label">${escapeHtml(line.sceneTitle)}</div><h3>${escapeHtml(line.speaker)}</h3><p>${escapeHtml(line.text)}</p><audio controls preload="metadata" src="${escapeHtml(line.url)}" aria-label="${escapeHtml(line.sceneTitle)} narration"></audio></article>`).join('')}</div>` : `<div class="empty-state"><strong>Audio is not ready yet.</strong><p>Generate narration from the current video specification, then refresh this desk.</p></div>`}</section>
    <section class="review-section script-review" aria-labelledby="script-review-title"><div class="section-heading"><div><div class="eyebrow">04 / STORY CHECK</div><h2 id="script-review-title">Confirm the words and board handoffs.</h2></div><p>This is the structured input Codex will use after approval.</p></div><div class="script-grid">${state.scenes.map((item, index) => `<article class="script-card"><div class="script-card-top"><span class="asset-index">${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(item.board)} / ${item.durationInFrames}f</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.narration)}</p><ul>${item.beats.map((beat) => `<li><span>${String(beat.frame).padStart(3, '0')}f</span>${escapeHtml(beat.text ?? beat.action)}</li>`).join('')}</ul></article>`).join('')}</div></section>`;
};

const render = () => {
  if (!state) return;
  const approved = state.approval.status === 'approved';
  const viewContent = view === 'boards' ? renderBoards() : view === 'review' ? renderReview() : renderTeam();
  const draft = state.draft ?? {};
  app.innerHTML = `<div class="app-shell"><header class="topbar"><div class="brand-lockup"><div class="brand-mark" aria-hidden="true">SG</div><div><div class="eyebrow">SAMITHGATH / CODEX</div><div class="brand-title">Production desk</div></div></div><div class="topbar-meta">Local file-backed workspace<br>${escapeHtml(draft.id ?? 'No active draft')} / ${escapeHtml(state.team.project)}</div></header><div class="control-strip"><nav class="nav-list" aria-label="Workspace sections"><button class="nav-button" type="button" aria-current="${view === 'team' ? 'page' : 'false'}" data-view="team">Team <small>01</small></button><button class="nav-button" type="button" aria-current="${view === 'boards' ? 'page' : 'false'}" data-view="boards">Boards <small>02</small></button><button class="nav-button" type="button" aria-current="${view === 'review' ? 'page' : 'false'}" data-view="review">Review <small>${approved ? 'OK' : '!'}</small></button></nav><div class="status-card"><div class="utility"><span class="status-dot ${approved ? '' : 'is-locked'}"></span>${approved ? 'Visual gate open' : 'Visual gate locked'}</div><h2>${approved ? 'Assets approved' : 'Review before render'}</h2><p>${escapeHtml(draft.id ?? 'Current draft')} · ${formatDraftDuration(draft.durationSeconds)} · ${state.audio ? 'audio ready' : 'audio missing'}</p><div class="status-actions"><button class="status-link" type="button" data-view="review">Open review</button><button class="status-link" type="button" data-refresh>Refresh files</button></div></div></div><main class="content" id="main-content">${viewContent}<footer class="footer"><span>Style system ${escapeHtml(state.styleVersion ?? 'samithgath')}</span><span>Last file read ${escapeHtml(new Date(state.generatedAt).toLocaleTimeString())}</span><span>Local only / no external data sent</span></footer></main></div>`;
  const controlStrip = app.querySelector('.control-strip');
  const statusCard = controlStrip?.querySelector('.status-card');
  if (controlStrip && statusCard) {
    const statusDock = document.createElement('div');
    statusDock.className = 'status-dock';
    statusDock.append(statusCard);
    controlStrip.after(statusDock);
  }
};

const showToast = (message) => {
  const existing = document.querySelector('.toast');
  existing?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3200);
};

const loadState = async () => {
  const response = await fetch('/api/state', {cache: 'no-store'});
  if (!response.ok) throw new Error(`Workspace request failed (${response.status}).`);
  state = await response.json();
  render();
};

app.addEventListener('click', async (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.view) { view = target.dataset.view; render(); return; }
  if (target.dataset.refresh !== undefined) {
    await loadState();
    showToast('Workspace refreshed from the current files.');
    return;
  }
  if (target.dataset.role) { roleId = target.dataset.role; view = 'team'; render(); return; }
  if (target.dataset.board) { boardId = target.dataset.board; render(); return; }
  if (target.dataset.approval) {
    if (target.dataset.approval === 'pending' && !window.confirm('Revoke the current character approval and lock long renders?')) return;
    busy = true;
    render();
    try {
      const response = await fetch('/api/approval', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({status: target.dataset.approval})});
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Approval update failed.');
      state = payload;
      showToast(state.approval.status === 'approved' ? 'Character designs approved. Long renders are unlocked.' : 'Approval revoked.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Approval update failed.');
    } finally {
      busy = false;
      view = 'approval';
      render();
    }
    return;
  }
  if (target.dataset.saveNote) {
    const input = document.querySelector('#stage-notes');
    const roleToSave = target.dataset.saveNote;
    const note = input?.value ?? '';
    noteDrafts[roleToSave] = note;
    noteBusy = true;
    render();
    try {
      const response = await fetch('/api/notes', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({roleId: roleToSave, note})});
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Note could not be saved.');
      state = payload;
      showToast(`Note saved for ${roleToSave}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Note could not be saved.');
    } finally {
      noteBusy = false;
      render();
    }
  }
});

app.addEventListener('keydown', (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab || !['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return;
  const tabs = [...tab.parentElement.querySelectorAll('[role="tab"]')];
  const next = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
  const index = (tabs.indexOf(tab) + next + tabs.length) % tabs.length;
  event.preventDefault();
  tabs[index].focus();
  tabs[index].click();
});

loadState().catch((error) => {
  app.innerHTML = `<main class="error-state"><div class="eyebrow">PRODUCTION DESK OFFLINE</div><h1>Could not load the workspace.</h1><p>${escapeHtml(error instanceof Error ? error.message : 'Unexpected error.')} Start it with <strong>npm run web</strong>, then reload this page.</p><button class="action-button" type="button" onclick="location.reload()">Retry</button></main>`;
});

window.setInterval(() => {
  if (document.activeElement?.matches('textarea, input')) return;
  loadState().catch(() => {});
}, 5000);
