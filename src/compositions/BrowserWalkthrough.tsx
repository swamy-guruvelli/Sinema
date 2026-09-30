import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {WalkthroughBrowser} from '../components/WalkthroughBrowser';
import {fontStack} from '../components/theme';
import {
  getWalkthroughTimeline,
  type WalkthroughAudioMetadata,
  type WalkthroughManifest,
  type WalkthroughTimelineItem,
} from '../data/walkthrough';

export type BrowserWalkthroughProps = {
  manifest: WalkthroughManifest;
  includeAudio?: boolean;
  audioMetadata?: WalkthroughAudioMetadata;
};

const activeItem = (timeline: WalkthroughTimelineItem[], timeMs: number) => timeline.find((item) => timeMs >= item.startMs && timeMs < item.endMs) ?? timeline[timeline.length - 1];
const reveal = (frame: number, start: number, end: number) => interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const captionLines = (caption: string) => {
  const words = caption.split(' ');
  if (words.length < 8) return caption;
  const midpoint = Math.ceil(words.length / 2);
  return `${words.slice(0, midpoint).join(' ')}\n${words.slice(midpoint).join(' ')}`;
};

export const BrowserWalkthrough: React.FC<BrowserWalkthroughProps> = ({manifest, includeAudio = true, audioMetadata}) => {
  const frame = useCurrentFrame();
  const timeline = getWalkthroughTimeline(manifest, audioMetadata);
  const timeMs = frame / (manifest.fps || 30) * 1000;
  const item = activeItem(timeline, timeMs);
  const index = Math.max(0, timeline.indexOf(item));
  const localMs = timeMs - item.startMs;
  const step = item.step;
  const intro = reveal(frame, 0, 18);
  const caption = captionLines(step.caption || step.narration);
  const host = (() => { try { return new URL(manifest.sourceUrl).hostname.replace(/^www\./, ''); } catch { return 'mindkraft.co.uk'; } })();
  const progress = timeline.length > 1 ? index / (timeline.length - 1) : 1;

  return (
    <AbsoluteFill style={{backgroundColor: '#0e2735', color: '#f6f1e7', fontFamily: fontStack, overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: intro, backgroundImage: 'radial-gradient(circle at 8% 18%, rgba(227,139,104,.18) 0 2px, transparent 3px), radial-gradient(circle at 91% 84%, rgba(143,196,174,.18) 0 2px, transparent 3px), linear-gradient(135deg, rgba(255,255,255,.025), transparent 48%)'}} />
      <div style={{position: 'absolute', left: 54, top: 30, display: 'flex', alignItems: 'center', gap: 16, opacity: intro, zIndex: 12}}>
        <div style={{fontFamily: 'Arial, sans-serif', fontSize: 18, fontWeight: 800, letterSpacing: 3}}>MINDKRAFT</div>
        <div style={{width: 1, height: 20, background: 'rgba(246,241,231,.35)'}} />
        <div style={{fontFamily: 'Arial, sans-serif', fontSize: 12, letterSpacing: 2.4, color: '#b5cbc5'}}>PUBLIC SITE TOUR</div>
      </div>
      <div style={{position: 'absolute', right: 54, top: 34, color: '#b5cbc5', fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 2.3, zIndex: 12}}>AUTOPLAY · 30 SEC</div>
      <WalkthroughBrowser step={step} localMs={localMs} domain={host} />
      <div style={{position: 'absolute', left: 250, right: 250, bottom: 28, minHeight: 72, display: 'flex', alignItems: 'center', padding: '13px 28px', border: '1px solid rgba(14,39,53,.18)', borderRadius: 14, background: 'rgba(250,247,239,.97)', boxShadow: '0 14px 34px rgba(0,0,0,.22)', color: '#0e2735', whiteSpace: 'pre-line', textAlign: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif', fontSize: 25, lineHeight: 1.1, fontWeight: 800, zIndex: 10}}>
        {caption}
      </div>
      <div style={{position: 'absolute', left: 54, bottom: 37, color: '#b5cbc5', fontFamily: 'Arial, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 2}}>0{index + 1} / 0{timeline.length}</div>
      <div style={{position: 'absolute', left: 54, right: 54, bottom: 14, height: 3, borderRadius: 3, background: 'rgba(181,203,197,.2)', zIndex: 11}}>
        <div style={{width: `${Math.max(4, progress * 100)}%`, height: '100%', borderRadius: 3, background: '#e38b68'}} />
      </div>
      {includeAudio && audioMetadata?.assembledFile && <Audio src={staticFile(audioMetadata.assembledFile)} />}
      {includeAudio && audioMetadata?.backgroundFile && <Audio src={staticFile(audioMetadata.backgroundFile)} volume={0.12} />}
    </AbsoluteFill>
  );
};
