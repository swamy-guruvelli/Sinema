import React, {useMemo} from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import characterAssets from '../data/characterAssets.json';
import characterPoses from '../data/characterPoses.json';
import type {TokenBucketVisual, VideoScene} from '../data/videoSpec';
import {createDialogueCaptionPages} from './captionTiming';
import {fontStack, utilityFontStack} from './theme';

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, Math.max(start + 1, end)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const characterRole = (speaker?: string) =>
  speaker?.toLowerCase() === 'stewie' || speaker?.toLowerCase() === 'skeptic' ? 'skeptic' : 'narrator';

const TokenBucketEditorial: React.FC<{scene: VideoScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const visual = scene.visual as TokenBucketVisual;
  const background = visual.background ?? {color: '#F4F0DC', lineColor: '#DDD8BF', lineSpacing: 52};
  const panel = visual.panel ?? {
    x: 0.22,
    y: 0.185,
    width: 0.57,
    height: 0.605,
    borderColor: '#168C88',
    borderWidth: 3,
    cornerRadius: 20,
    padding: 0.03,
    stackGap: 0.015,
  };
  const steps = visual.steps ?? [];
  const connectors = visual.connectors ?? {enabled: true, style: 'arrow', color: panel.borderColor, opacity: 0.7};
  const footerLayout = visual.footerLayout ?? {
    x: 0.065,
    y: 0.895,
    width: 0.87,
    height: 0.08,
    columns: 4,
    fontSize: 20,
    lineHeight: 1.15,
    textColor: '#14262C',
    accentColor: panel.borderColor,
  };
  const portrait = height >= width;
  const showStepDetails = visual.showStepDetails ?? !portrait;
  const captionPages = useMemo(() => createDialogueCaptionPages(scene.dialogue, scene.durationInFrames, fps), [scene.dialogue, scene.durationInFrames, fps]);
  const captionPage = captionPages.find((page) => frame >= page.startFrame && frame < page.endFrame);
  const captionTimeMs = captionPage ? Math.max(0, (frame - captionPage.startFrame) / fps * 1000) + captionPage.startMs : 0;
  const captionText = captionPage?.text ?? visual.caption;
  const panelShow = reveal(frame, 8, 26);
  const panelPadding = width * panel.padding;
  const stackGap = height * panel.stackGap;
  const stepMotion = (id: string, index: number) => {
    const beat = scene.beats.find((candidate) => candidate.target === id);
    return reveal(frame, beat?.frame ?? 24 + index * 18, (beat?.frame ?? 24 + index * 18) + 16);
  };
  const linedPaper = background.style === 'warm-lined-paper';
  const lineSpacing = Math.max(2, background.lineSpacing);
  const characters = [...scene.characters].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  const activeStepId = steps
    .map((step) => ({step, beat: scene.beats.find((candidate) => candidate.target === step.id)}))
    .filter(({beat}) => beat && frame >= beat.frame)
    .at(-1)?.step.id;
  const captionLayout = portrait
    ? {x: 0.22, y: 0.805, width: 0.56, height: 0.075}
    : {x: 0.16, y: 0.80, width: 0.68, height: 0.10};

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: background.color, color: '#14262C', fontFamily: fontStack, backgroundImage: linedPaper ? `repeating-linear-gradient(0deg, transparent 0 ${lineSpacing - 1}px, ${background.lineColor} ${lineSpacing - 1}px ${lineSpacing}px)` : undefined}}>
      <header style={{position: 'absolute', left: portrait ? '6.5%' : '8%', right: portrait ? '6.5%' : '8%', top: portrait ? '4.3%' : '4.5%', zIndex: 1, opacity: reveal(frame, 0, 18), translate: `0px ${(1 - reveal(frame, 0, 18)) * -12}px`}}>
        <div style={{fontFamily: utilityFontStack, fontSize: portrait ? Math.max(20, width * 0.021) : 22, color: panel.borderColor, letterSpacing: 2.5, fontWeight: 900}}>{visual.eyebrow ?? 'MINDKRAFT'}</div>
        <h1 style={{margin: '10px 0 0', fontSize: portrait ? Math.max(58, width * 0.073) : 56, lineHeight: 1.05, letterSpacing: portrait ? -1.8 : -1.2, overflowWrap: 'anywhere'}}>{visual.label || scene.title}</h1>
      </header>

      <section style={{position: 'absolute', left: `${panel.x * 100}%`, top: `${panel.y * 100}%`, width: `${panel.width * 100}%`, height: `${panel.height * 100}%`, boxSizing: 'border-box', padding: panelPadding, display: 'flex', flexDirection: 'column', border: `${panel.borderWidth}px solid ${panel.borderColor}`, borderRadius: panel.cornerRadius, background: '#FFFDF7', opacity: panelShow, scale: `${0.98 + panelShow * 0.02}`, translate: `0px ${(1 - panelShow) * 14}px`, zIndex: 2}}>
        {steps.map((step, index) => {
          const show = stepMotion(step.id, index);
          const nextShow = index < steps.length - 1 ? stepMotion(steps[index + 1].id, index + 1) : 0;
          const connectorShow = Math.min(show, nextShow);
          const active = activeStepId === step.id;
          const emphasis = active ? 1 + Math.sin(frame / 7) * 0.008 : 1;
          const fill = active ? step.activeFill ?? panel.borderColor : step.fill;
          const textColor = active ? step.activeTextColor ?? '#FFFFFF' : step.textColor;
          return (
            <React.Fragment key={step.id}>
              <div style={{flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: width * 0.012, boxSizing: 'border-box', padding: `${width * 0.018}px ${width * 0.02}px`, background: fill, color: textColor, border: `2px solid ${step.borderColor}`, borderRadius: 14, opacity: show, scale: `${(0.96 + show * 0.04) * emphasis}`, translate: `0px ${(1 - show) * 18}px`, boxShadow: active ? `0 7px 0 ${panel.borderColor}33` : 'none'}}>
                <div style={{alignSelf: 'flex-start', minWidth: width * 0.03, paddingTop: 2, fontFamily: utilityFontStack, fontSize: Math.max(18, width * 0.026), fontWeight: 900, letterSpacing: 1}}>{step.number}</div>
                <div style={{minWidth: 0}}>
                  <div style={{fontSize: Math.max(24, width * 0.044), lineHeight: 1, fontWeight: 900, overflowWrap: 'anywhere'}}>{step.label}</div>
                  {showStepDetails && <div style={{marginTop: width * 0.012, fontFamily: utilityFontStack, fontSize: Math.max(13, width * 0.015), lineHeight: 1.1, fontWeight: 900, letterSpacing: 1.1, opacity: 0.78, overflowWrap: 'anywhere'}}>{step.detail}</div>}
                </div>
              </div>
              {index < steps.length - 1 && <div style={{height: stackGap, flex: `0 0 ${stackGap}px`, display: 'grid', placeItems: 'center', opacity: panelShow * connectorShow}}>{connectors.enabled && (connectors.style === 'arrow' ? <div style={{color: connectors.color, opacity: connectors.opacity, fontFamily: utilityFontStack, fontSize: Math.max(22, width * 0.028), lineHeight: 1, fontWeight: 900, transform: `translateY(${(1 - nextShow) * 4}px)`}}>↓</div> : <div style={{height: '100%', borderLeft: `2px dotted ${connectors.color}`, opacity: connectors.opacity}} />)}</div>}
            </React.Fragment>
          );
        })}
      </section>

      {characters.map((character, index) => {
        const asset = characterAssets.find((item) => item.id === character.assetId);
        if (!asset) return null;
        const speaker = characterRole(character.speaker);
        const activeLine = captionPage ? scene.dialogue?.[captionPage.lineIndex] : undefined;
        const active = activeLine ? characterRole(activeLine.speaker) === speaker : false;
        const appear = spring({frame: frame - (character.entranceFrame ?? 0), fps, config: {damping: 18}});
        const pose = active ? speaker === 'narrator' ? captionPage && captionPage.lineIndex % 2 === 0 ? 'speaking' : 'pointing' : captionPage && captionPage.lineIndex % 2 === 0 ? 'speaking' : 'reacting' : 'listening';
        const poseFile = (characterPoses[speaker] as Record<string, string>)[pose] ?? asset.file;
        const idle = character.animation === 'subtle-idle' ? Math.sin(frame / 42 + index) * 2 : 0;
        const charHeight = character.height ?? 0.25;
        const bottomAnchored = character.anchor === 'bottom';
        const characterPosition = bottomAnchored ? {bottom: `${(1 - character.y) * 100}%`} : {top: `${character.y * 100}%`};
        return (
          <React.Fragment key={`${character.assetId}-${index}`}>
            <div style={{position: 'absolute', left: `${character.x * 100}%`, ...characterPosition, width: `${character.width * 100}%`, height: `${charHeight * 100}%`, opacity: appear, translate: `0px ${(1 - appear) * 70 + idle}px`, transformOrigin: 'bottom', zIndex: character.zIndex ?? 4}}>
              <Img src={staticFile(poseFile)} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: character.anchor === 'top' ? 'center top' : 'center bottom', transform: speaker === 'skeptic' ? 'scaleX(-1)' : undefined}} />
            </div>
          </React.Fragment>
        );
      })}

      {captionText && <div style={{position: 'absolute', left: `${captionLayout.x * 100}%`, top: `${captionLayout.y * 100}%`, width: `${captionLayout.width * 100}%`, height: `${captionLayout.height * 100}%`, boxSizing: 'border-box', padding: `${height * 0.012}px ${width * 0.02}px`, display: 'grid', placeItems: 'center', background: '#14262C', color: '#FFFFFF', borderRadius: 15, opacity: captionPage ? reveal(frame, captionPage.startFrame, captionPage.startFrame + 10) : reveal(frame, 18, 30), zIndex: 6, fontSize: portrait ? Math.max(23, width * 0.028) : 28, lineHeight: 1.12, fontWeight: 800, textAlign: 'center'}}>
        {captionPage ? <span>{captionPage.tokens.map((token, index) => <span key={`${token.fromMs}-${index}`} style={{color: token.fromMs <= captionTimeMs && token.toMs > captionTimeMs ? panel.borderColor : '#FFFFFF'}}>{token.text}</span>)}</span> : captionText}
      </div>}

      {visual.footer && <div style={{position: 'absolute', left: `${footerLayout.x * 100}%`, top: `${footerLayout.y * 100}%`, width: `${footerLayout.width * 100}%`, height: `${footerLayout.height * 100}%`, display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, footerLayout.columns)}, minmax(0, 1fr))`, gap: width * 0.018, boxSizing: 'border-box', opacity: reveal(frame, 24, 40), zIndex: 5, color: footerLayout.textColor, fontFamily: utilityFontStack, fontSize: footerLayout.fontSize, lineHeight: footerLayout.lineHeight, fontWeight: 900}}>
        {visual.footer.map((item, index) => <div key={item.number} style={{minWidth: 0, padding: `0 ${width * 0.012}px`, borderRight: index < visual.footer!.length - 1 ? `2px solid ${footerLayout.accentColor}99` : undefined}}><div style={{color: footerLayout.accentColor, letterSpacing: 1}}>{item.number}</div><div style={{marginTop: 3, overflowWrap: 'anywhere'}}>{item.text}</div></div>)}
      </div>}
    </div>
  );
};

export default TokenBucketEditorial;
