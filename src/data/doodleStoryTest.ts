export type PaperScene = {
  id: string;
  startFrame: number;
  endFrame: number;
  title: string;
  cue: string;
};

export const DOODLE_STORY_SCENES: PaperScene[] = [
  {
    id: 'map',
    startFrame: 0,
    endFrame: 210,
    title: 'THE DRAINAGE MYSTERY',
    cue: 'map first',
  },
  {
    id: 'street-plan',
    startFrame: 210,
    endFrame: 495,
    title: 'FOLLOW THE WATER',
    cue: 'street plan',
  },
  {
    id: 'hidden-system',
    startFrame: 495,
    endFrame: 720,
    title: 'THE HIDDEN SYSTEM',
    cue: 'under the street',
  },
  {
    id: 'button',
    startFrame: 720,
    endFrame: 900,
    title: 'THE PLAN WORKS',
    cue: 'label the drain',
  },
];
