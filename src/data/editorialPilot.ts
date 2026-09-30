export type EditorialSpeaker = 'host' | 'sidekick';

export type EditorialShot = {
  id: string;
  startFrame: number;
  endFrame: number;
  focus: 'brick' | 'grid' | 'drain' | 'all';
  speaker: EditorialSpeaker;
};

export const EDITORIAL_SHOTS: EditorialShot[] = [
  {id: 'cold-open', startFrame: 0, endFrame: 225, focus: 'brick', speaker: 'host'},
  {id: 'low-bar', startFrame: 225, endFrame: 450, focus: 'brick', speaker: 'sidekick'},
  {id: 'street-plan', startFrame: 450, endFrame: 675, focus: 'grid', speaker: 'host'},
  {id: 'hidden-drain', startFrame: 675, endFrame: 900, focus: 'drain', speaker: 'sidekick'},
  {id: 'proof', startFrame: 900, endFrame: 1125, focus: 'all', speaker: 'host'},
  {id: 'punchline', startFrame: 1125, endFrame: 1350, focus: 'drain', speaker: 'sidekick'},
];

export const EDITORIAL_DURATION_IN_FRAMES = 1350;
