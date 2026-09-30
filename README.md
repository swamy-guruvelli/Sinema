# Sinema

Sinema is a local-first video studio for turning a structured story into a reviewed, narrated Remotion render. A project is mostly a small `videos/<id>/video.json` document: scenes, timing, layout, dialogue, characters, screenshots, and optional audio.

It is designed for people making educational videos, animated explainers, and website walkthroughs. It is not a hosted video service and it does not need a database.

## What the app does

The simplest workflow is:

1. Choose or create a project in the local Studio.
2. Edit scenes, dialogue, layout, orientation, and local media.
3. Generate still previews and approve the design.
4. Approve the script, generate optional narration, and listen to it.
5. Render one MP4 with Remotion.

The approvals are file-backed. That keeps the workflow inspectable and makes a project easy to version, copy, or edit with another tool.

## Who uses it

- A creator or editor writes the story and adjusts scenes.
- A producer or reviewer checks frame previews, timing, dialogue, and audio.
- A maintainer adds renderer components, boards, validation rules, or scripts.

Viewers only consume the final MP4; they do not need to run Sinema.

## Architecture

Sinema has four small layers:

- **Project data:** `videos/<id>/video.json` is the intermediate representation. `brand/style-system.json`, `src/data/`, and registered assets provide the visual and timing contracts.
- **Studio:** `web/` is a dependency-light browser UI. `scripts/web-server.mjs` serves it on `127.0.0.1:4173`; `scripts/studio-api.mjs` validates changes and writes project JSON and review state. There is no database.
- **Renderer:** `src/Root.tsx` registers Remotion compositions. `GeneratedVideo` turns a video spec into timed `FrameRenderer` or `BoardRenderer` scenes. `scripts/render.mjs` runs validation, approval checks, and the Remotion CLI, then writes a generated video.
- **Optional narration:** Chatterbox is an optional local Python path for narration. It is not required for Studio or rendering when a project already has audio or is rendered without audio.

The normal data flow is:

`video.json` → Studio edits and validation → PNG review → optional narration → Remotion composition → MP4

## How the automation works

The asset helper (`scripts/asset-agent.mjs`) is deterministic, not an AI agent. It fetches only registered HTTPS assets from an allowlist, records the source and SHA-256 hash, and writes a manifest. The production team entries in `src/data/productionTeam.json` are review prompts and stage labels; they organize work but are not autonomous services.

## Quick start

The smallest useful setup needs Node.js and the checked-in npm lockfile:

```powershell
npm install
npm run typecheck
npm run validate:video -- eda
npm run web
```

Open `http://127.0.0.1:4173`. For the Remotion authoring studio instead, run `npm run dev`.

To render a project after its assets and approvals are ready:

```powershell
npm run render:video -- eda
```

## Examples

<video controls preload="metadata" width="320" src="./out/eda-reels.mp4"></video>

[Play the EDA reels example](./out/eda-reels.mp4)

<video controls preload="metadata" width="320" src="./out/mindkraft-explainer-reels.mp4"></video>

[Play the MindKraft explainer reels example](./out/mindkraft-explainer-reels.mp4)

The Python environment in `requirements-tts.txt` is optional. Install it only when you want local Chatterbox narration. The project uses the official [Chatterbox repository](https://github.com/resemble-ai/chatterbox); follow its current setup and model instructions before installing or redistributing model files. You can edit and render without Chatterbox when a project already has audio or when you render without audio.

## Repository map

| Path | Purpose |
| --- | --- |
| `src/` | Remotion compositions, reusable visual components, data contracts, and registered assets |
| `videos/` | Project specs and review state |
| `web/` | Local Studio and review-desk browser client |
| `scripts/` | Validation, asset, audio, capture, and render commands |
| `public/assets/` | Visual assets used by compositions |
| `brand/` | Shared style tokens and board definitions |
| `package.json`, `package-lock.json` | Node dependencies and reproducible versions |
| `requirements-tts.txt` | Optional Python narration dependencies |

## Useful commands

```powershell
npm run typecheck
npm run validate:video -- eda
npm run test:studio
npm run assets:scan
npm run render:character-approval
npm run render:video -- eda
```

Use `npm run audio:chatterbox:video -- <project-id>` after installing the optional Python dependencies.

## Licensing

Original Sinema source code is released under the MIT License in [`LICENSE`](./LICENSE). That license does not relicense bundled media, logos, model checkpoints, or dependencies. See [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md), `assets/open-source.json`, and each asset manifest before redistributing a render or a packaged build.

Several dependencies have material terms that should be checked before commercial redistribution: Remotion has its own license and may require a company license; GSAP uses its standard no-charge license; and `ffmpeg-static` distributes GPL-licensed FFmpeg binaries. The optional Chatterbox/PyTorch stack has its own licenses and model/data terms.
