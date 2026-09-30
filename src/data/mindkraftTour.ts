import workflowData from './mindkraftTour.json';
import type {CaptureStep, WalkthroughManifest, WalkthroughWorkflow} from './walkthrough';

export const MINDKRAFT_TOUR_WORKFLOW = workflowData as WalkthroughWorkflow;

const demoTarget = (x: number, y: number, width: number, height: number) => ({x, y, width, height});
const demoPath = (x: number, y: number) => [
  {timeMs: 0, x: 960, y: 540},
  {timeMs: 260, x: x - 58, y: y - 22},
  {timeMs: 520, x, y},
];

const demoTargets = [
  demoTarget(548, 461, 169, 51),
  demoTarget(604, 150, 713, 49),
  demoTarget(375, 977, 561, 51),
  demoTarget(393, 188, 334, 74),
  demoTarget(714, 682, 109, 21),
  demoTarget(535, 350, 650, 50),
];

let demoStartMs = 0;
const demoSteps: CaptureStep[] = MINDKRAFT_TOUR_WORKFLOW.steps.map((step, index) => {
  const holdMs = step.minHoldMs ?? 5000;
  const targetRect = demoTargets[index];
  const point = {x: targetRect.x + targetRect.width / 2, y: targetRect.y + targetRect.height / 2};
  const captureStep: CaptureStep = {
    ...step,
    screenshotAfter: 'assets/walkthrough-placeholder.svg',
    targetRect,
    cursorPath: demoPath(point.x, point.y),
    startMs: demoStartMs,
    endMs: demoStartMs + holdMs,
  };
  demoStartMs += holdMs;
  return captureStep;
});

export const DEMO_MINDKRAFT_TOUR_MANIFEST: WalkthroughManifest = {
  id: MINDKRAFT_TOUR_WORKFLOW.id,
  title: MINDKRAFT_TOUR_WORKFLOW.title,
  sourceUrl: MINDKRAFT_TOUR_WORKFLOW.baseUrl ?? 'https://mindkraft.co.uk',
  viewport: MINDKRAFT_TOUR_WORKFLOW.viewport,
  fps: 30,
  steps: demoSteps,
};
