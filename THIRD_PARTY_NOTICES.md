# Third-party notices

Sinema's original source is MIT-licensed. This file records the important third-party software and media used by the repository. These notices do not change the license of any dependency or asset.

The complete npm dependency graph, exact versions, integrity hashes, and the license metadata reported by npm are kept in [`package-lock.json`](./package-lock.json). The tables below call out direct dependencies and license-sensitive items so a public release does not hide the material exceptions in a transitive dependency tree.

## Direct Node.js dependencies

| Package | Version | License / notice | Project |
| --- | ---: | --- | --- |
| `@remotion/captions` | 4.0.525 | MIT | [Remotion](https://github.com/remotion-dev/remotion) |
| `@remotion/cli` | 4.0.525 | Remotion License | [Remotion license](https://www.remotion.dev/license) |
| `@remotion/gsap` | 4.0.525 | MIT | [Remotion](https://github.com/remotion-dev/remotion) |
| `@remotion/media` | 4.0.525 | Remotion project terms | [Remotion license](https://www.remotion.dev/license) |
| `gsap` | 3.15.0 | Standard no-charge license | [GSAP licensing](https://gsap.com/standard-license/) |
| `react` | 19.3.0 | MIT | [React](https://github.com/facebook/react) |
| `react-dom` | 19.3.0 | MIT | [React](https://github.com/facebook/react) |

## Direct development and rendering dependencies

| Package | Version | License / notice | Project |
| --- | ---: | --- | --- |
| `@types/react` | 19.3.0 | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `@types/react-dom` | 19.3.0 | MIT | [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) |
| `ffmpeg-static` | 5.3.0 | GPL-3.0-or-later; the package distributes FFmpeg binaries | [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) |
| `ffprobe-static` | 3.1.0 | MIT | [ffprobe-static](https://github.com/joshwnj/ffprobe-static) |
| `playwright` | 1.63.0 | Apache-2.0 | [Playwright](https://github.com/microsoft/playwright) |
| `typescript` | 5.9.3 | Apache-2.0 | [TypeScript](https://github.com/microsoft/TypeScript) |

## Optional Python narration stack

These packages are installed only from `requirements-tts.txt` for local narration. The project points to the official [Chatterbox repository](https://github.com/resemble-ai/chatterbox). The Python environment brings additional transitive packages; use the installed distribution metadata and review model terms before shipping a model or generated voice commercially.

| Package | Version / pin | License / notice | Project |
| --- | --- | --- | --- |
| `chatterbox-tts` | Git commit `5de7a54aa4e5e2baadb0182dde554908b48b85c2` | MIT; voice samples and model checkpoints have separate terms | [Chatterbox](https://github.com/resemble-ai/chatterbox) |
| `torch` | 2.6.0 | BSD-3-Clause | [PyTorch](https://github.com/pytorch/pytorch) |
| `torchaudio` | 2.6.0 | BSD-style | [TorchAudio](https://github.com/pytorch/audio) |
| `torchvision` | 0.21.0 | BSD | [TorchVision](https://github.com/pytorch/vision) |

## Other license families in the npm lockfile

The lockfile includes transitive packages under MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, MPL-2.0, Unlicense, Python-2.0, CC-BY-4.0, and the Remotion and GSAP terms above. Examples of packages that deserve special attention are:

- `@mediabunny/*` and `mediabunny` — MPL-2.0.
- `caniuse-lite` — CC-BY-4.0.
- `dotenv` and `entities` — BSD-2-Clause.
- `source-map`, `source-map-js`, and `@xtuc/ieee754` — BSD-3-Clause.
- `argparse` — Python-2.0.
- `fs-monkey` and `memfs` — Unlicense.
- Remotion compositor, media, renderer, and studio packages — follow the package metadata and [Remotion's license](https://www.remotion.dev/license); do not treat the whole Remotion tree as MIT.

For a complete package-by-package inventory, inspect every `packages.*` entry in `package-lock.json`; do not replace that inventory with a hand-maintained summary after dependency changes.

## Bundled and referenced media

### Git artwork

The Git artwork registered in [`assets/open-source.json`](./assets/open-source.json) is attributed to Jason Long and is recorded as CC BY 3.0. The local manifest contains the source URLs and hashes. Git names and logos remain trademarks of their respective owners; this notice is not an endorsement.

### Voice references

The WAV files described by [`public/audio/voices/README.md`](./public/audio/voices/README.md) and `voice-profiles.json` are temporary Chatterbox demo references, including samples labelled after recognizable fictional characters. They are not covered by Sinema's MIT license. Remove them before publishing unless you have verified permission to redistribute both the recordings and their intended use as voice references.

### Screenshots, music, generated audio, and model output

Screenshots, website captures, music, generated narration, and model checkpoints must be cleared independently. A source URL or a generated file is not, by itself, permission to redistribute it. Keep attribution and license information beside any asset that remains in a public checkout.

## Maintenance

When a dependency changes, update `package-lock.json`, re-check package license metadata, and update this file if a direct dependency, license-sensitive package, asset source, or model changes. This document is an attribution aid, not legal advice.
