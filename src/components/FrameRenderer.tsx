import React, {useMemo} from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import characterAssets from '../data/characterAssets.json';
import characterPoses from '../data/characterPoses.json';
import type {VideoScene} from '../data/videoSpec';
import {BOARD_STYLES, fontStack, utilityFontStack} from './theme';
import {EducationalVisual} from './EducationalVisual';
import {createDialogueCaptionPages} from './captionTiming';
import TokenBucketEditorial from './TokenBucketEditorial';

const MINDKRAFT_BEAT_DETAILS: Record<string, string[]> = {
  'mindkraft-problem': ['the loop that drains attention', 'roles + applications together', 'a calmer next step'],
  'mindkraft-matching': ['tell it what matters', 'focus on better-fit roles', 'less noise to sort through'],
  'mindkraft-application': ['start with the real brief', 'highlight what matters', 'keep the details accurate'],
  'mindkraft-control': ['prepare without autopilot', 'check before you send', 'you choose when it is ready'],
  'mindkraft-tracking': ['remember what you sent', 'see what changed', 'know what to do now'],
  'mindkraft-tips': ['ask where you feel stuck', 'learn from job seekers', 'put the idea to work'],
  'mindkraft-payoff': ['stop starting from zero', 'spend time where it matters', 'keep control of progress'],
};

const characterRole = (speaker?: string) =>
  speaker?.toLowerCase() === 'stewie' || speaker?.toLowerCase() === 'skeptic' ? 'skeptic' : 'narrator';

// Percentage regions reserve separate space for the visual, captions and steps.
// A portrait shot is composed independently; it is never a cropped landscape shot.
type FrameRendererProps = {scene: VideoScene; vertical?: boolean; transitionOutFrames?: number};

const StandardFrameRenderer: React.FC<FrameRendererProps> = ({scene, vertical = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const palette = BOARD_STYLES[scene.board];
  const layout = scene.layout ?? 'focus';
  const motion = scene.motion ?? 'reveal';
  const beatIndex = Math.max(0, scene.beats.filter((beat) => beat.frame <= frame).length - 1);
  const captionPages = useMemo(() => createDialogueCaptionPages(scene.dialogue, scene.durationInFrames, fps), [scene.dialogue, scene.durationInFrames, fps]);
  const captionPage = captionPages.find((page) => frame >= page.startFrame && frame < page.endFrame);
  const line = captionPage ? scene.dialogue?.[captionPage.lineIndex] : undefined;
  const lineIndex = captionPage?.lineIndex ?? -1;
  const progress = interpolate(frame, [0, Math.max(1, scene.durationInFrames - 1)], [0, 1], {extrapolateRight: 'clamp'});
  const hasCharacters = scene.characters.length > 0;
  const mindKraftChapters = scene.visual?.browser?.variant === 'mindkraft-process';
  const mindKraftFlow = scene.visual?.browser?.variant === 'mindkraft-flow';
  const mindKraftStory = scene.visual?.browser?.variant === 'mindkraft-story';
  const centeredVerticalPipeline = vertical && layout === 'stage' && hasCharacters && scene.visual?.kind === 'pipeline';
  const visualRegion: React.CSSProperties = vertical
    ? centeredVerticalPipeline
      ? {left: '29%', right: '29%', top: '31%', bottom: '21%'}
      : {left: '6%', right: layout === 'split' && hasCharacters ? '32%' : '9%', top: '13%', bottom: hasCharacters ? layout === 'stage' ? '56%' : layout === 'split' ? '24%' : '36%' : mindKraftStory ? '22%' : '26%'}
    : {left: '5%', right: layout === 'split' && hasCharacters ? '29%' : '5%', top: '18%', bottom: layout === 'stage' && hasCharacters ? '39%' : '29%'};
  const image = scene.screenshot;
  const zoom = Math.max(image?.zoom ?? 1, motion === 'pan' ? 1.2 : 1) + (motion === 'zoom' ? progress * 0.18 : 0);
  const pan = motion === 'pan' ? (progress - 0.5) * 16 : 0;
  const nodes = scene.visual?.nodes ?? scene.beats.map((beat) => beat.text ?? beat.action);
  const entry = motion === 'still'
    ? 1
    : interpolate(frame, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const visualEntry = motion === 'still' ? 1 : 0.45 + entry * 0.55;
  const headerEntry = motion === 'still' ? 1 : 0.72 + entry * 0.28;

  const captionTimeMs = captionPage ? Math.max(0, (frame - captionPage.startFrame) / fps * 1000) + captionPage.startMs : 0;
  const captionBackground = scene.board === 'editorial' ? '#fffdf7' : palette.ink;
  const captionForeground = scene.board === 'editorial' ? '#16212b' : '#fffdf7';

  return <AbsoluteFill style={{background: palette.background, color: palette.ink, fontFamily: fontStack, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 23px, rgba(22,33,43,.035) 23px 24px)'}} />
    <header className="frame-header" style={{position: 'absolute', left: '6%', right: '9%', top: vertical ? '4.5%' : '5%', opacity: headerEntry, translate: `0px ${(1 - entry) * -8}px`}}>
      <div style={{fontFamily: utilityFontStack, fontSize: vertical ? 22 : 20, color: palette.accent, letterSpacing: 3}}>MINDKRAFT</div>
      <h1 style={{fontSize: vertical ? 52 : 60, lineHeight: 1.12, margin: '12px 0 0', overflowWrap: 'anywhere'}}>{scene.title}</h1>
    </header>
    <section className="frame-visual" style={{position: 'absolute', ...visualRegion, overflow: 'hidden', border: `3px solid ${palette.accent}`, background: palette.panel, borderRadius: 12, opacity: visualEntry, translate: `0px ${(1 - entry) * 18}px`, scale: `${0.98 + entry * 0.02}`}}>
      {image ? <>
        <div style={{height: 44, display: 'flex', alignItems: 'center', padding: '0 22px', background: palette.ink, color: palette.background, fontFamily: utilityFontStack, fontSize: 20, overflow: 'hidden'}}>{scene.visual?.browser?.path ?? scene.visual?.label ?? 'Website walkthrough'}</div>
        <div style={{position: 'absolute', inset: '44px 0 0', overflow: 'hidden'}}>
          <Img src={staticFile(image.file)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: `${image.focusX}% ${image.focusY}%`, transformOrigin: `${image.focusX}% ${image.focusY}%`, transform: `scale(${zoom}) translateY(${pan}%)`}} />
        </div>
        <div style={{position: 'absolute', bottom: 20, left: 20, right: 20, padding: '14px 20px', background: palette.background, color: palette.ink, borderLeft: `6px solid ${palette.accent}`, fontSize: vertical ? 30 : 28}}>{scene.beats[beatIndex]?.text ?? scene.visual?.caption}</div>
      </> : scene.visual?.kind === 'browser' ? <EducationalVisual scene={scene} frame={frame} beatIndex={beatIndex} vertical={vertical} fill /> : nodes.length && (layout === 'sequence' || ['flow', 'pipeline'].includes(scene.visual?.kind ?? '')) ? <div style={{height: '100%', display: 'flex', flexDirection: vertical ? 'column' : 'row', justifyContent: 'center', alignItems: 'stretch', gap: vertical ? 0 : 10, padding: 32, boxSizing: 'border-box'}}>
        {nodes.map((node, index) => {
          const show = motion === 'still' ? 1 : spring({frame: frame - index * 10, fps, config: {damping: 20}});
          return <React.Fragment key={index}>
            <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, border: `3px solid ${palette.accent}`, background: index === beatIndex % nodes.length ? palette.accent : palette.background, color: index === beatIndex % nodes.length ? '#fffdf7' : palette.ink, transform: `translateY(${(1 - show) * 40}px) scale(${0.9 + show * 0.1})`, opacity: show}}>
              <span style={{fontFamily: utilityFontStack, fontSize: 22, opacity: 0.8}}>{String(index + 1).padStart(2, '0')}</span>
              <strong style={{fontSize: vertical ? 42 : 32, lineHeight: 1.15, overflowWrap: 'anywhere'}}>{node}</strong>
            </div>
            {index < nodes.length - 1 && <div style={{flex: '0 0 auto', alignSelf: 'center', margin: vertical ? '3px 0' : '0 4px', color: palette.accent, fontFamily: utilityFontStack, fontSize: vertical ? 22 : 34, fontWeight: 900, lineHeight: 1, opacity: index < beatIndex ? 1 : 0.42}}>{vertical ? '↓' : '→'}</div>}
          </React.Fragment>;
        })}
      </div> : scene.visual ? <EducationalVisual scene={scene} frame={frame} beatIndex={beatIndex} vertical={vertical} fill /> : <div style={{display: 'grid', placeItems: 'center', height: '100%', padding: 40, boxSizing: 'border-box', fontSize: vertical ? 64 : 72, textAlign: 'center'}}>{scene.beats[beatIndex]?.text ?? scene.title}</div>}
    </section>
    {[...scene.characters].sort((a, b) => Number(characterRole(a.speaker) === 'skeptic') - Number(characterRole(b.speaker) === 'skeptic')).map((character, index) => {
      const asset = characterAssets.find((item) => item.id === character.assetId);
      if (!asset) return null;
      const speaker = characterRole(character.speaker);
      const active = line ? characterRole(line.speaker) === speaker : false;
      const appear = motion === 'still' ? 1 : spring({frame: frame - (character.entranceFrame ?? 0), fps, config: {damping: 18}});
      const pose = active
        ? speaker === 'narrator' ? lineIndex % 2 === 0 ? 'speaking' : 'pointing' : lineIndex % 2 === 0 ? 'speaking' : 'reacting'
        : 'listening';
      const poseFile = (characterPoses[speaker] as Record<string, string>)[pose] ?? asset.file;
      const characterLeft = vertical ? speaker === 'skeptic' ? centeredVerticalPipeline ? '61%' : '70%' : '0%' : speaker === 'skeptic' ? '82%' : '2%';
      const characterTop = vertical ? '52%' : layout === 'stage' ? '62%' : '66%';
      const characterWidth = vertical ? '39%' : '16%';
      const characterHeight = vertical ? '30%' : layout === 'stage' ? '16%' : '12%';
      return <div key={`${character.assetId}-${index}`} style={{position: 'absolute', left: characterLeft, top: characterTop, width: characterWidth, height: characterHeight, opacity: appear, transform: `translateY(${(1 - appear) * 70}px)`, transformOrigin: 'bottom'}}>
        <Img src={staticFile(poseFile)} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', transform: speaker === 'skeptic' ? 'scaleX(-1)' : undefined}} />
      </div>;
    })}
    {captionPage && <div className="frame-caption" style={{position: 'absolute', left: vertical ? '28%' : '9%', right: vertical ? '28%' : '12%', top: vertical ? '80%' : '80%', height: vertical ? '9%' : '9%', display: 'grid', placeItems: 'center', padding: '6px 18px', boxSizing: 'border-box', background: captionBackground, color: captionForeground, borderRadius: 6, fontSize: (captionPage.text.length ?? 0) > 160 ? vertical ? 27 : 29 : vertical ? 31 : 33, lineHeight: 1.18, textAlign: 'center', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', opacity: entry, translate: `0px ${(1 - entry) * 8}px`}}>
      <span>{captionPage.tokens.map((token, index) => <span key={`${token.fromMs}-${index}`} style={{color: token.fromMs <= captionTimeMs && token.toMs > captionTimeMs ? palette.accent : captionForeground}}>{token.text}</span>)}</span>
    </div>}
    {!mindKraftFlow && !mindKraftStory && <div style={{position: 'absolute', left: '6%', right: '9%', top: mindKraftChapters ? (vertical ? '88.5%' : '90.5%') : (vertical ? '89%' : '92%'), height: mindKraftChapters ? (vertical ? '7.5%' : '8%') : undefined, display: 'flex', gap: mindKraftChapters ? 12 : 10}}>
      {scene.beats.map((beat, index) => {
        const active = index === beatIndex;
        const detail = MINDKRAFT_BEAT_DETAILS[scene.id]?.[index];
        return <div className="frame-beat-card" key={index} style={{flex: 1, minWidth: 0, padding: mindKraftChapters ? '14px 16px' : '10px 12px', boxSizing: 'border-box', borderTop: `${mindKraftChapters ? 6 : 5}px solid ${active ? palette.accent : palette.muted}`, border: mindKraftChapters ? `1px solid ${active ? palette.accent : 'rgba(255,253,247,0.18)'}` : undefined, borderTopWidth: mindKraftChapters ? 6 : undefined, borderRadius: mindKraftChapters ? 8 : undefined, background: mindKraftChapters ? active ? palette.accent : 'rgba(255,253,247,0.07)' : undefined, color: mindKraftChapters && active ? palette.ink : undefined, fontFamily: utilityFontStack, fontSize: vertical ? 21 : 20, lineHeight: 1.15, overflow: 'hidden', opacity: entry, translate: `0px ${(1 - entry) * 10}px`}}>
          <div style={{fontSize: mindKraftChapters ? 13 : undefined, letterSpacing: mindKraftChapters ? 1.4 : undefined, opacity: mindKraftChapters ? 0.72 : undefined}}>0{index + 1}</div>
          <div style={{marginTop: mindKraftChapters ? 8 : undefined, fontWeight: 900, fontSize: mindKraftChapters ? (vertical ? 18 : 17) : undefined, overflowWrap: 'anywhere'}}>{beat.text ?? beat.action}</div>
          {mindKraftChapters && detail && <div style={{marginTop: 7, fontFamily: fontStack, fontSize: vertical ? 16 : 14, lineHeight: 1.15, opacity: 0.78, overflowWrap: 'anywhere'}}>{detail}</div>}
        </div>;
      })}
    </div>}
    </div>
  </AbsoluteFill>;
};

export const FrameRenderer: React.FC<FrameRendererProps> = (props) =>
  props.scene.layout === 'token-bucket-editorial' && props.scene.visual?.kind === 'tokenBucket'
    ? <TokenBucketEditorial scene={props.scene} />
    : <StandardFrameRenderer {...props} />;
