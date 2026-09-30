# Remotion animation loop

The legacy pilot uses a layered 2D illustrated language: original painterly backgrounds, transparent character cutouts, gentle camera pushes, warm cinematic overlays and hand-drawn explanatory diagrams. Its old visual assets have been removed for a fresh channel reset; treat the legacy compositions and `validate:legacy` command as reference material only. The new production path starts with fresh PNG character approval and then moves into the structured video specification described in the channel plan.

This project turns `india.md` into a typed scene catalog and renders it with Remotion.

## Fresh visual asset approval gate

The old visual assets have been removed. New renderable images belong under `public/assets`—characters, props, backgrounds, diagrams, and future visual assets. Before any long render, build and inspect the approval board:

```powershell
npm.cmd run assets:scan
npm.cmd run render:character-approval
```

Inspect `out/character-approval.mp4`; the board shows four visual assets per timed review page. After the asset set is accepted, unlock rendering with `npm.cmd run approve:characters`. The approval stores SHA-256 hashes, so adding or changing any registered visual asset locks long renders again until the full set is reviewed. Use `npm.cmd run revoke:characters` to lock the pipeline manually.

## Fresh video compiler path

The plan's intermediate representation is `videos/<id>/video.json`. Codex edits this data contract; `GeneratedVideo` selects registered boards and Remotion renders them. Validate and render a video with:

```powershell
npm.cmd run validate:video -- fresh-start
npm.cmd run audio:chatterbox:video -- fresh-start
npm.cmd run render:video -- fresh-start
```

After rendering, remove only disposable render caches with:

```powershell
npm.cmd run clean:cache
```

This removes the copied Remotion/FFmpeg binaries, generated render-props files, temporary audio-fit directories, and the webpack cache. It keeps finished videos, previews, reusable audio, source specs, browser captures, and the installed Remotion Chrome runtime. Use `npm.cmd run clean:cache -- --dry-run` to inspect what would be removed first.

The first short-story example from `india.md` is `india-60s-example`: an exact 60-second Indus Valley story across `paper`, `editorial`, and `lesson` boards. Use the same three commands with `india-60s-example` to validate, regenerate narration, or render it.

The small Git debate test from [`video_scripts/gitbasics.md`](./video_scripts/gitbasics.md) is `gitbasics`: a 30-second, six-slide argument between the narrator/Rick voice and skeptic/Stewie voice. Review it in its own desk with:

```powershell
npm.cmd run validate:video -- gitbasics
npm.cmd run audio:chatterbox:video -- gitbasics
npm.cmd run web -- gitbasics
```

The video audio command keeps the generated line files, fits each scene into its declared slot, and writes synchronized metadata under `public/audio/videos/gitbasics/`. Keep the visual approval gate pending until the boards and audio are accepted; do not run the render command during review.

The video audio command reads scene narration from `video.json`, uses the selected local Chatterbox reference voices, and writes an assembled narration file plus line timing metadata under `public/audio/videos/<id>/`.

For the current voice test, the Review desk exposes the selected Chatterbox samples as Rick & Morty (M), Peter Griffin (M), Stewie (M), plus neutral Female 1 and Female 2 references. They are temporary local test inputs; replace them with owned or explicitly licensed recordings before any public upload.

`paper`, `editorial`, and `lesson` are the first registered board IDs. The renderer owns their layout, tokens, motion, and asset lookup; a video spec may select a board per scene but cannot provide arbitrary React or unregistered character files.

Fresh renderer tokens live in [`brand/style-system.json`](./brand/style-system.json); board components import those tokens instead of inventing per-scene colors, fonts, or motion timings. Every render command rescans `public/assets` before checking approval, so an added or changed visual asset automatically locks long renders until the new approval board is reviewed.

The visual and comedy rules for future Shorts and longer videos are in [`VIDEO_STYLE_RULES.md`](./VIDEO_STYLE_RULES.md). Read those rules before adding a new character, map, asset, or dialogue exchange.

The Studio sidebar now exposes `BoardPaper`, `BoardEditorial`, `BoardLesson`, and `ProductionBoard` as separate review tabs. The first three are independent board compositions; `ProductionBoard` cycles through the internal team prompts in [`src/data/productionTeam.json`](./src/data/productionTeam.json): Director, Research, Story Writer, Storyboard, Asset Lead, Motion, Voice Director, Remotion, and QA Producer.

Render a short board review with `npm.cmd run render:board -- paper`, `npm.cmd run render:board -- editorial`, or `npm.cmd run render:board -- lesson`. Render the team desk with `npm.cmd run render:production-board`. These are review compositions; `npm.cmd run render:video -- fresh-start` remains the production export.

## Browser production desk

The local studio at `http://127.0.0.1:4173` is the working editor for the three production types: Animation, Educational video, and Website walkthrough. It stores projects in `videos/<id>/video.json` and review state in `videos/<id>/studio.json`.

The studio workflow is deliberately staged: choose orientation and voices, compose scenes, generate PNG frame previews, approve the designs, approve the script, generate and listen to narration, approve the audio, then render one MP4. Animation scenes offer stage, split, focus, and sequence layouts. Education scenes use animated diagrams and sequence cards. Walkthrough scenes accept local screenshots with focus-point and zoom controls. The editor keeps dialogue sentences intact for subtitles and lets the measured audio timing expand scenes instead of speeding speech up.

Create a new project from the **New video** button. The example project `studio-layout-demo` demonstrates all three frame directions and can be opened with `http://127.0.0.1:4173/?id=studio-layout-demo`.

For a live, clickable review workspace while Codex is editing the project, run:

```powershell
npm.cmd run web
```

Open `http://127.0.0.1:4173`. The Review view opens first and shows the current video draft, every registered PNG, full narration, scene-level audio, and the structured story beats. Team exposes the role prompts and stage notes; Boards switches between the registered board contracts. `Approve current designs` writes the same file-backed approval manifest used by Remotion; `Revoke approval` locks long renders again. The server binds to localhost only, auto-refreshes the file-backed state, and reads the current files on demand.

Each Team stage also has a `Changes or actions for this stage` note box. Save a note before moving on; Codex can read the current notes from [`props/production-notes.json`](./props/production-notes.json).

1. Read the script section you are editing.
2. Update `src/data/sceneManifest.ts`, `src/data/dialogue.json`, and the matching scene component.
3. Generate simple narration with `npm.cmd run audio:pilot`, or local conversational narration with `npm.cmd run audio:chatterbox`.
4. Run `npm.cmd run validate` and `npm.cmd run typecheck`.
5. Render a preview with `npm.cmd run render:pilot` or `npm.cmd run render:scene -- 01`.
6. Inspect the MP4 for safe margins, label readability, timing and visual consistency.
7. Move a scene from `draft` to `approved` only after review.

For the motion-language tests, run `npm.cmd run audio:chatterbox:test` then `npm.cmd run render:doodle-test`, or `npm.cmd run audio:chatterbox:story-test` then `npm.cmd run render:doodle-story-test`. The story test storyboard is in `src/data/doodleStoryTest.ts`.

The current format experiment is the 45-second limited-animation editorial cartoon pilot. It uses two recurring vector characters, one stable studio stage, three physical props, six timed shots, a recurring red fact signature, conversational Chatterbox voices, and small generated sound accents. Run `npm.cmd run audio:editorial:sfx`, then `npm.cmd run audio:chatterbox:editorial`, then `npm.cmd run render:editorial-pilot`. The source composition is `src/compositions/EditorialCartoonPilot.tsx`, with timing in `src/data/editorialPilot.ts` and dialogue in `src/data/dialogue.json`.

The pilot implements sections 1-2. Sections 3-30 are cataloged as draft scenes and render a clearly marked placeholder until their bespoke scene components are added.

Audio is clip-synced: each scene WAV starts at that scene's timeline offset. It is intentionally rough narration, not word-level caption sync. On Windows, set `$env:SINEMA_TTS_VOICE` before `npm.cmd run audio:pilot` to choose an installed SAPI voice.

For free local multi-speaker narration, create the optional environment with `python -m venv --system-site-packages .venv`, then `.venv\\Scripts\\python.exe -m pip install -r requirements-tts.txt`. Run `npm.cmd run audio:chatterbox` and then `npm.cmd run render:pilot`. The dialogue roles are in `src/data/dialogue.json`; the first run downloads the public Chatterbox-Nano checkpoint from Hugging Face. If the public download is rate-limited, set a free Hugging Face access token in `$env:HF_TOKEN` and rerun the command.

The fresh cast voice references can be recalibrated with `npm.cmd run audio:calibrate:voices`. The calibration uses the existing authorized WAVs, applies deterministic pitch/tempo adjustments toward the young-adult character direction, writes `public/audio/voices/voice-profiles.json`, and should be followed by `npm.cmd run audio:chatterbox:video -- fresh-start`.

## MindKraft public-site tour

The current browser video is a 30-second, autoplaying tour of public `mindkraft.co.uk` pages. It uses `scripts/capture-walkthrough.mjs` with Microsoft Edge at a fixed 1920x1080 viewport and the workflow in `src/data/mindkraftTour.json`. It only navigates and focuses visible public content; it never submits forms or waits for viewer input:

```powershell
npm.cmd run capture:walkthrough
npm.cmd run validate:walkthrough -- --capture
npm.cmd run audio:chatterbox:walkthrough
npm.cmd run render:walkthrough
```

Fresh captures write screenshots and the manifest under `render-assets/mindkraft-tour/`, a mirrored public asset directory, and `output/playwright/mindkraft-tour/trace.zip` plus failure diagnostics. The music bed is an original locally synthesized ambient loop, so it has no third-party usage restriction. The tour has no logo mascot layer; the narrator is the only voice.

## Chatterbox Studio

For custom narration and audiobooks, run the local editor:

```powershell
npm.cmd run chatterbox:studio
```

Open `http://127.0.0.1:4317`. Add one clean WAV reference per voice under `public/audio/voices`, choose a voice for each line, set pauses, and generate the assembled WAV. The same Chatterbox-Nano/Turbo checkpoint is reused for every speaker; different male voices only need different authorized reference recordings, not more model downloads.

Remotion licensing should be reviewed before this becomes a company product or the team grows beyond the free-use threshold.
