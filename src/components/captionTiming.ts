import {createTikTokStyleCaptions, type Caption, type TikTokPage} from '@remotion/captions';
import type {VideoDialogueLine} from '../data/videoSpec';

export type DialogueCaptionPage = TikTokPage & {
  lineIndex: number;
  startFrame: number;
  endFrame: number;
};

const wordWeight = (word: string): number => {
  const letters = word.replace(/[.,!?;:]+$/g, '').length;
  const punctuationPause = /[.,!?;:]$/.test(word) ? 2 : 0;
  return Math.max(1, letters + punctuationPause);
};

// The audio generator knows the exact line duration but does not emit token timings.
// Weighting by word length gives stable word-level timing without speeding or trimming speech.
export const estimateWordCaptions = (text: string, durationMs: number): Caption[] => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const weights = words.map(wordWeight);
  const totalWeight = Math.max(1, weights.reduce((sum, weight) => sum + weight, 0));
  let cursor = 0;

  return words.map((word, index) => {
    const startMs = Math.round(cursor);
    cursor += durationMs * (weights[index] / totalWeight);
    const endMs = index === words.length - 1 ? Math.round(durationMs) : Math.max(startMs + 1, Math.round(cursor));
    return {
      text: index === 0 ? word : ` ${word}`,
      startMs,
      endMs,
      timestampMs: null,
      confidence: null,
      pageBreakAfter: index === words.length - 1,
    };
  });
};

export const createDialogueCaptionPages = (
  dialogue: VideoDialogueLine[] = [],
  durationInFrames: number,
  fps: number,
): DialogueCaptionPage[] => dialogue.flatMap((line, lineIndex) => {
  const startFrame = Math.max(0, line.startFrame ?? 0);
  const endFrame = Math.min(durationInFrames, Math.max(startFrame + 1, line.endFrame ?? durationInFrames));
  const durationMs = Math.max(1, (endFrame - startFrame) / fps * 1000);
  const captions = line.captions?.length ? line.captions : estimateWordCaptions(line.text, durationMs);
  const {pages} = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: Number.MAX_SAFE_INTEGER,
  });

  return pages.map((page) => ({
    ...page,
    lineIndex,
    startFrame: startFrame + Math.floor(page.startMs / 1000 * fps),
    endFrame: Math.min(endFrame, startFrame + Math.max(1, Math.ceil((page.startMs + page.durationMs) / 1000 * fps))),
  }));
});
