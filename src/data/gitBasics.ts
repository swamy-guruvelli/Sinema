export type GitSpeaker = 'hero' | 'sidekick';

export type GitBeat = {
  id: string;
  startFrame: number;
  endFrame: number;
  speaker: GitSpeaker;
  label: string;
  line: string;
  action: 'hook' | 'working' | 'stage' | 'commit' | 'status' | 'recap' | 'button';
};

export const GIT_BASICS_BEATS: GitBeat[] = [
  {id: 'save-point', startFrame: 0, endFrame: 150, speaker: 'hero', label: 'THE BIG IDEA', line: 'Git is a save-point machine for your code.', action: 'hook'},
  {id: 'not-a-time-machine', startFrame: 150, endFrame: 300, speaker: 'sidekick', label: 'SIDEKICK CHECK', line: 'So… Ctrl+S with a tiny time machine?', action: 'working'},
  {id: 'working-tree', startFrame: 300, endFrame: 450, speaker: 'hero', label: '1 / EDIT', line: 'First, edit a file. Those changes live in your working tree.', action: 'working'},
  {id: 'stage-it', startFrame: 450, endFrame: 600, speaker: 'sidekick', label: '2 / STAGE', line: 'Then git add picks what goes into the next save point.', action: 'stage'},
  {id: 'commit-it', startFrame: 600, endFrame: 780, speaker: 'hero', label: '3 / COMMIT', line: 'Git commit seals that bundle with a message you can understand later.', action: 'commit'},
  {id: 'check-status', startFrame: 780, endFrame: 930, speaker: 'sidekick', label: 'THE CHECK-IN', line: 'And git status tells you what changed and what still needs attention.', action: 'status'},
  {id: 'tiny-recipe', startFrame: 930, endFrame: 1080, speaker: 'hero', label: 'THE TINY RECIPE', line: 'Edit. Add. Commit. Check status whenever you forget.', action: 'recap'},
  {id: 'button', startFrame: 1080, endFrame: 1200, speaker: 'sidekick', label: 'ONE LAST THING', line: 'Fine. But I still want the cape.', action: 'button'},
];

export const GIT_BASICS_DURATION_IN_FRAMES = GIT_BASICS_BEATS[GIT_BASICS_BEATS.length - 1].endFrame;

export const gitBeatAt = (frame: number): GitBeat =>
  GIT_BASICS_BEATS.find(({startFrame, endFrame}) => frame >= startFrame && frame < endFrame)
  ?? GIT_BASICS_BEATS[GIT_BASICS_BEATS.length - 1];
