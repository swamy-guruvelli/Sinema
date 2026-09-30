export type DoodleTestBeat = {
  startFrame: number;
  endFrame: number;
  speaker: 'narrator' | 'historian' | 'skeptic';
  text: string;
  action: string;
};

export const DOODLE_TEST_BEATS: DoodleTestBeat[] = [
  {
    startFrame: 0,
    endFrame: 96,
    speaker: 'narrator',
    text: 'Let\'s test a map that refuses to sit still.',
    action: 'The title scribbles on while the paper gives a small hand-held jolt.',
  },
  {
    startFrame: 90,
    endFrame: 192,
    speaker: 'historian',
    text: 'Start with a route. Draw the line, then let the places pop in.',
    action: 'A route is drawn between three locations and the first pin lands with a bounce.',
  },
  {
    startFrame: 184,
    endFrame: 276,
    speaker: 'skeptic',
    text: 'Pop in? Please don\'t make another PowerPoint.',
    action: 'The skeptic appears as a scribbled reaction while the map wobbles back.',
  },
  {
    startFrame: 270,
    endFrame: 390,
    speaker: 'historian',
    text: 'Relax. The map wiggles, the ink breathes, and the traveler gets lost on purpose.',
    action: 'A tiny traveler follows the route, overshoots a turn, and corrects course.',
  },
  {
    startFrame: 384,
    endFrame: 480,
    speaker: 'skeptic',
    text: 'That is not a navigation system.',
    action: 'The traveler freezes, looks around, and the route gives one comic shake.',
  },
  {
    startFrame: 474,
    endFrame: 594,
    speaker: 'narrator',
    text: 'It is a history video. A little chaos is a feature.',
    action: 'A city grows from a pin, with loose buildings and a looping arrow.',
  },
  {
    startFrame: 588,
    endFrame: 708,
    speaker: 'historian',
    text: 'Watch the water run from the hills to the city.',
    action: 'A blue river draws itself in, then ripples toward the city drain.',
  },
  {
    startFrame: 702,
    endFrame: 804,
    speaker: 'skeptic',
    text: 'Okay, that actually feels alive.',
    action: 'The character nods, the map breathes, and three ink marks celebrate.',
  },
  {
    startFrame: 798,
    endFrame: 900,
    speaker: 'narrator',
    text: 'Now we can tune the rhythm before building all thirty sections.',
    action: 'The map and character settle into a final hand-drawn storyboard frame.',
  },
];
