import dialogueData from './dialogue.json';

export type SceneStatus = 'draft' | 'approved';

export type DialogueLine = {
  speaker: string;
  text: string;
  pauseAfterMs?: number;
};

export const DIALOGUE = dialogueData as unknown as Record<string, DialogueLine[]>;

export type BeatSpec = {
  frame: number;
  action: string;
  text?: string;
  asset?: string;
};

export type SceneSpec = {
  id: string;
  title: string;
  period: string;
  durationInFrames: number;
  narration: string;
  dialogue?: DialogueLine[];
  beats: BeatSpec[];
  assets: string[];
  audioFile?: string;
  status: SceneStatus;
};

const planned = (id: string, title: string, period: string, narration: string): SceneSpec => ({
  id,
  title,
  period,
  durationInFrames: 900,
  narration,
  beats: [{frame: 0, action: 'Planned scene; expand from the India history script.'}],
  assets: [],
  audioFile: `audio/scene-${id}.wav`,
  status: 'draft',
});

export const SCENES: SceneSpec[] = [
  {
    id: '01',
    title: 'BEFORE INDIA WAS INDIA',
    period: 'c. 7000–2600 BCE',
    durationInFrames: 360,
    narration:
      'Thousands of years ago, farming communities grew into settlements. Then the Indian subcontinent started building cities.',
    beats: [
      {frame: 0, action: 'South Asia map appears with a hand-drawn title.', text: 'INDIA'},
      {frame: 72, action: 'Camera pulls back to reveal an absurdly long timeline.', text: '5,000 YEARS OF HISTORY'},
      {frame: 168, action: 'Early farming settlement pops onto the map.', text: 'FARMERS → SETTLEMENTS → CITIES'},
      {frame: 270, action: 'Indus Valley title lands as the map settles.'},
    ],
    assets: ['assets/scene-01/background.png', 'assets/scene-01/farmer.png'],
    audioFile: 'audio/scene-01.wav',
    dialogue: DIALOGUE['01'],
    status: 'approved',
  },
  {
    id: '02',
    title: 'INDUS VALLEY CIVILIZATION',
    period: 'c. 2600–1900 BCE',
    durationInFrames: 600,
    narration:
      'The Harappans built planned cities, traded widely, standardized weights, and made a drainage system good enough to win an argument with a pyramid.',
    beats: [
      {frame: 0, action: 'Map highlights Harappa, Mohenjo-daro, Dholavira and Lothal.'},
      {frame: 120, action: 'City grid draws itself in with streets and drains.', text: 'WE HAVE PLUMBING'},
      {frame: 282, action: 'Trade goods and standardized weights orbit the city.'},
      {frame: 390, action: 'Historian examines an unreadable seal.', text: 'COOL DRAWING OF A UNICORN'},
      {frame: 510, action: 'City lights dim while climate and river arrows suggest gradual change.'},
    ],
    assets: ['assets/scene-02/background.png', 'assets/scene-02/historian.png'],
    audioFile: 'audio/scene-02.wav',
    dialogue: DIALOGUE['02'],
    status: 'approved',
  },
  planned('03', 'THE VEDIC PERIOD', 'c. 1500–600 BCE', 'Indo-Aryan languages, Vedic traditions, expanding agriculture and larger political units reshape northern India.'),
  planned('04', 'BUDDHA, MAHAVIRA AND THE AGE OF BIG QUESTIONS', '6th–5th centuries BCE', 'Mahavira and Siddhartha Gautama offer paths through a world asking very large questions.'),
  planned('05', 'MAGADHA GETS BIG', '6th–4th centuries BCE', 'Fertile land, rivers and ambitious rulers turn Magadha into the state to remember.'),
  planned('06', 'THE MAURYAN EMPIRE', 'c. 321–185 BCE', 'Chandragupta Maurya and the Mauryan state build one of the subcontinent’s first great empires.'),
  planned('07', 'ASHOKA', '3rd century BCE', 'After a devastating war, Ashoka makes Buddhist ethics and public works part of imperial policy.'),
  planned('08', 'EVERYONE IS HERE', 'c. 200 BCE–300 CE', 'Trade routes, new dynasties and cultural exchange make the subcontinent wonderfully crowded.'),
  planned('09', 'THE GUPTA AGE', 'c. 4th–6th centuries CE', 'The Gupta period brings influential work in science, mathematics, literature and art.'),
  planned('10', 'THE SOUTH GETS EXTREMELY BUSY', 'c. 600–1200 CE', 'Chalukyas, Pallavas, Cholas and many other powers build states, temples and trade networks.'),
  planned('11', 'ENTER DELHI', '1206 CE', 'The Delhi Sultanate arrives, expands and changes the political map repeatedly.'),
  planned('12', 'VIJAYANAGARA', '14th–17th centuries', 'Vijayanagara becomes a major southern power with a capital famous for its scale and wealth.'),
  planned('13', 'THE MUGHAL EMPIRE', '1526', 'Babur’s victory at Panipat begins the Mughal chapter of the story.'),
  planned('14', 'AKBAR', '1556–1605', 'Akbar expands the empire and experiments with administration, diplomacy and religious discussion.'),
  planned('15', 'AURANGZEB AND THE BIG EMPIRE PROBLEM', '1658–1707', 'An enormous empire meets the familiar historical problem of governing an enormous empire.'),
  planned('16', 'THE COMPANY', '1600s–1700s', 'A trading company arrives, acquires leverage and begins behaving like a government.'),
  planned('17', 'BRITISH EXPANSION', 'late 18th–19th centuries', 'The East India Company and then the British state expand control across much of the subcontinent.'),
  planned('18', 'THE REBELLION OF 1857', '1857', 'Sepoys and other groups rebel at Meerut, creating a crisis that ends Company rule.'),
  planned('19', 'THE RAJ', '1858–1914', 'The British Crown takes direct control while railways, extraction and new political movements grow.'),
  planned('20', 'WORLD WAR I AND GANDHI', '1914–1919', 'Indian soldiers serve overseas, and Gandhi becomes a central figure in mass politics.'),
  planned('21', 'WORLD WAR II', '1939–1945', 'The war intensifies demands for independence and leaves Britain weaker.'),
  planned('22', 'PARTITION', '1947', 'Independence arrives alongside Partition, one of the largest and most traumatic migrations in modern history.'),
  planned('23', 'BUILDING INDIA', '1947–1950', 'Princely states are integrated and a new constitution turns independence into a republic.'),
  planned('24', "NEHRU'S INDIA", '1950s–1960s', 'Secular democracy, industrialization, science and state-led planning define the early republic.'),
  planned('25', 'WARS, FOOD AND POLITICAL CHANGE', '1960s–1970s', 'Wars, food policy and political shifts test the young republic.'),
  planned('26', '1980s: THINGS GET DIFFICULT', '1980s', 'The decade brings political violence, social change and difficult national questions.'),
  planned('27', '1991: ECONOMY.EXE HAS BEEN UPDATED', '1991', 'A balance-of-payments crisis leads to major economic reforms and a new direction.'),
  planned('28', 'INDIA ENTERS THE 21ST CENTURY', '2000s–today', 'Technology, urbanization, elections and an enormous diversity of experiences define a changing India.'),
  planned('29', 'SO... WHAT IS INDIA?', 'The present', 'India is not one simple story but a layered argument about identity, democracy and belonging.'),
  planned('30', 'FINAL TIMELINE SPEEDRUN', '5,000 years in review', 'The entire timeline races past once more, because apparently thirty sections were not enough.'),
];

export const ALL_SCENE_IDS = SCENES.map((scene) => scene.id);
export const PILOT_SCENE_IDS = ['01', '02'];
export const TOTAL_DURATION_IN_FRAMES = SCENES.reduce(
  (total, scene) => total + scene.durationInFrames,
  0,
);

export const getScenes = (sceneIds: string[] = ALL_SCENE_IDS): SceneSpec[] => {
  const selected = sceneIds.map((id) => SCENES.find((scene) => scene.id === id));
  if (selected.some((scene): scene is undefined => !scene)) {
    throw new Error(`Unknown scene id in ${sceneIds.join(', ')}`);
  }
  return selected as SceneSpec[];
};

export const getSceneDuration = (sceneId: string): number => {
  const scene = SCENES.find(({id}) => id === sceneId);
  if (!scene) throw new Error(`Unknown scene id: ${sceneId}`);
  return scene.durationInFrames;
};
