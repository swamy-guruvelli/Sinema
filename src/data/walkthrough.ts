export type LocatorSpec =
  | {kind: 'role'; role: string; name: string; exact?: boolean}
  | {kind: 'label'; value: string}
  | {kind: 'text'; value: string; exact?: boolean}
  | {kind: 'css'; value: string};

export type WalkthroughAction = 'navigate' | 'click' | 'fill' | 'press' | 'scroll' | 'wait';

export type WalkthroughStep = {
  id: string;
  action: WalkthroughAction;
  target?: LocatorSpec;
  value?: string;
  narration: string;
  caption?: string;
  zoom?: number;
  preDelayMs?: number;
  minHoldMs?: number;
  waitFor?: LocatorSpec;
  assertText?: string;
  sensitive?: boolean;
};

export type CursorPoint = {timeMs: number; x: number; y: number};
export type TargetRect = {x: number; y: number; width: number; height: number};

export type CaptureStep = Omit<WalkthroughStep, 'value'> & {
  screenshotBefore?: string;
  screenshotAfter: string;
  targetRect?: TargetRect;
  cursorPath: CursorPoint[];
  startMs: number;
  endMs: number;
};

export type WalkthroughManifest = {
  id: string;
  title: string;
  sourceUrl: string;
  viewport: {width: number; height: number};
  fps: number;
  steps: CaptureStep[];
  capturedAt?: string;
};

export type WalkthroughDialogueLine = {
  stepId: string;
  speaker: 'narrator';
  text: string;
  pauseAfterMs?: number;
};

export type WalkthroughAudioLine = WalkthroughDialogueLine & {
  file: string;
  durationMs: number;
  startMs: number;
  endMs: number;
};

export type WalkthroughAudioMetadata = {
  sampleRate: number;
  assembledFile: string;
  backgroundFile?: string;
  lines: WalkthroughAudioLine[];
};

export type WalkthroughWorkflow = {
  id: string;
  title: string;
  baseUrl?: string;
  viewport: {width: number; height: number};
  steps: WalkthroughStep[];
  dialogue: WalkthroughDialogueLine[];
};

export type WalkthroughTimelineItem = {
  step: CaptureStep;
  startMs: number;
  endMs: number;
  durationMs: number;
};

export const WALKTHROUGH_FPS = 30;
export const WALKTHROUGH_VIEWPORT = {width: 1920, height: 1080};

export const getWalkthroughTimeline = (
  manifest: WalkthroughManifest,
  audio?: WalkthroughAudioMetadata,
): WalkthroughTimelineItem[] => {
  let cursorMs = 0;
  return manifest.steps.map((step) => {
    const line = audio?.lines.find((candidate) => candidate.stepId === step.id);
    const measuredMs = line ? line.durationMs + (line.pauseAfterMs ?? 0) : 0;
    const durationMs = Math.max(step.endMs - step.startMs, measuredMs, 1);
    const item = {step, startMs: cursorMs, endMs: cursorMs + durationMs, durationMs};
    cursorMs = item.endMs;
    return item;
  });
};

export const getWalkthroughDurationInFrames = (
  manifest: WalkthroughManifest,
  audio?: WalkthroughAudioMetadata,
): number => Math.max(
  1,
  Math.ceil((getWalkthroughTimeline(manifest, audio).at(-1)?.endMs ?? 0) / 1000 * (manifest.fps || WALKTHROUGH_FPS)),
);

export const validateWalkthroughManifest = (manifest: unknown): string[] => {
  const failures: string[] = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest must be an object'];
  const candidate = manifest as Partial<WalkthroughManifest>;
  if (!candidate.id) failures.push('manifest.id is required');
  if (!candidate.sourceUrl) failures.push('manifest.sourceUrl is required');
  if (!candidate.viewport || candidate.viewport.width !== 1920 || candidate.viewport.height !== 1080) {
    failures.push('manifest.viewport must be 1920x1080');
  }
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) {
    failures.push('manifest.steps must contain at least one step');
    return failures;
  }

  const seen = new Set<string>();
  for (const [index, rawStep] of candidate.steps.entries()) {
    const step = rawStep as Partial<CaptureStep>;
    const label = `step ${index + 1}`;
    if (!step.id) failures.push(`${label}: id is required`);
    if (step.id && seen.has(step.id)) failures.push(`${label}: duplicate id ${step.id}`);
    if (step.id) seen.add(step.id);
    if (!step.narration) failures.push(`${label}: narration is required`);
    if (!step.screenshotAfter) failures.push(`${label}: screenshotAfter is required`);
    if (!['navigate', 'click', 'fill', 'press', 'scroll', 'wait'].includes(step.action ?? '')) failures.push(`${label}: invalid action ${step.action}`);
    if (['click', 'fill', 'press', 'scroll'].includes(step.action ?? '') && !step.target) failures.push(`${label}: target is required for ${step.action}`);
    if (!Array.isArray(step.cursorPath) || step.cursorPath.length === 0) failures.push(`${label}: cursorPath is required`);
    if (!Number.isFinite(step.startMs) || !Number.isFinite(step.endMs) || (step.endMs ?? 0) <= (step.startMs ?? 0)) {
      failures.push(`${label}: endMs must be greater than startMs`);
    }
    if (step.targetRect) {
      const {x, y, width, height} = step.targetRect;
      if (![x, y, width, height].every(Number.isFinite) || x < 0 || y < 0 || width <= 0 || height <= 0) {
        failures.push(`${label}: targetRect must contain finite positive coordinates`);
      }
      if ((x + width) > 1920 || (y + height) > 1080) failures.push(`${label}: targetRect is outside the viewport`);
    }
    if (step.cursorPath) {
      let previous = -1;
      for (const point of step.cursorPath) {
        if (!Number.isFinite(point.timeMs) || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
          failures.push(`${label}: cursorPath contains invalid coordinates`);
          break;
        }
        if (point.timeMs < previous) {
          failures.push(`${label}: cursorPath times must be ordered`);
          break;
        }
        previous = point.timeMs;
      }
    }
  }
  return failures;
};

export const assertWalkthroughManifest = (manifest: unknown): asserts manifest is WalkthroughManifest => {
  const failures = validateWalkthroughManifest(manifest);
  if (failures.length) throw new Error(`Invalid walkthrough manifest:\n${failures.join('\n')}`);
};
