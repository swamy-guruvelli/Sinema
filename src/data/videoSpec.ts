import styleSystem from '../../brand/style-system.json';
import type {Caption} from '@remotion/captions';

export const BOARD_IDS = Object.keys(styleSystem.boards) as Array<keyof typeof styleSystem.boards>;
export type BoardId = keyof typeof styleSystem.boards;

export type VideoBeat = {
  frame: number;
  action: 'reveal' | 'draw' | 'pop' | 'hold' | 'emphasis';
  target?: string;
  text?: string;
  speaker?: string;
};

export type VideoDialogueLine = {
  speaker: string;
  text: string;
  pauseAfterMs?: number;
  startFrame?: number;
  endFrame?: number;
  /** Optional word-level timings relative to this dialogue line. */
  captions?: Caption[];
};

export type VideoCharacter = {
  assetId: string;
  speaker?: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  entranceFrame?: number;
  anchor?: 'top' | 'center' | 'bottom' | string;
  zIndex?: number;
  animation?: string;
};

export type TokenBucketVisual = {
  kind: 'tokenBucket';
  label: string;
  caption?: string;
  eyebrow?: string;
  background: {
    style?: string;
    color: string;
    lineColor: string;
    lineSpacing: number;
  };
  panel: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderColor: string;
    borderWidth: number;
    cornerRadius: number;
    padding: number;
    stackGap: number;
  };
  showStepDetails?: boolean;
  steps: Array<{
    id: string;
    number: string;
    label: string;
    detail: string;
    fill: string;
    textColor: string;
    borderColor: string;
    activeFill?: string;
    activeTextColor?: string;
  }>;
  connectors?: {
    enabled: boolean;
    style: string;
    color: string;
    opacity: number;
  };
  footer?: Array<{number: string; text: string}>;
  footerLayout?: {
    x: number;
    y: number;
    width: number;
    height: number;
    columns: number;
    fontSize: number;
    lineHeight: number;
    textColor: string;
    accentColor: string;
  };
};

export type VideoVisual = {
  kind: 'codebase' | 'flow' | 'branch' | 'remote' | 'pipeline' | 'browser' | 'tokenBucket';
  label: string;
  caption?: string;
  eyebrow?: string;
  background?: TokenBucketVisual['background'];
  panel?: TokenBucketVisual['panel'];
  steps?: TokenBucketVisual['steps'];
  connectors?: TokenBucketVisual['connectors'];
  footer?: TokenBucketVisual['footer'];
  footerLayout?: TokenBucketVisual['footerLayout'];
  command?: string;
  files?: string[];
  code?: string[];
  nodes?: string[];
  browser?: {
    path: string;
    guideLabel?: string;
    excerpt: string;
    analogy: string;
    action: string;
    variant?: 'mindkraft-process' | 'mindkraft-flow' | 'mindkraft-story';
    flow?: string;
  };
};

export type VideoScene = {
  id: string;
  title: string;
  narration: string;
  board: BoardId;
  durationInFrames: number;
  beats: VideoBeat[];
  characters: VideoCharacter[];
  visual?: VideoVisual;
  dialogue?: VideoDialogueLine[];
  layout?: 'focus' | 'split' | 'stage' | 'sequence' | 'token-bucket-editorial';
  motion?: 'reveal' | 'zoom' | 'pan' | 'still';
  screenshot?: {file: string; focusX: number; focusY: number; zoom: number};
};

export type VideoSpec = {
  version: number;
  productionType?: 'animation' | 'education' | 'walkthrough';
  videoId: string;
  format: 'youtube-16x9' | 'youtube-9x16';
  fps: number;
  styleVersion: string;
  voiceReferences?: Record<string, string>;
  audio?: {
    file: string;
    metadataFile?: string;
    volume?: number;
    backgroundFile?: string;
    backgroundVolume?: number;
  };
  scenes: VideoScene[];
};

export const getVideoDuration = (spec: VideoSpec): number =>
  spec.scenes.reduce((total, scene) => total + scene.durationInFrames, 0);
