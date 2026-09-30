import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import characterAssets from '../data/characterAssets.json';
import type {VideoScene} from '../data/videoSpec';
import {BOARD_STYLES, COLORS, MOTION, fontStack, utilityFontStack} from './theme';
import {EducationalVisual} from './EducationalVisual';

type CharacterAsset = {id: string; file: string};

const assets = characterAssets as CharacterAsset[];

const reveal = (frame: number, start: number, duration = MOTION.revealFrames) =>
  interpolate(frame, [start, start + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const activeBeat = (scene: VideoScene, frame: number) =>
  scene.beats.filter((beat) => beat.frame <= frame).at(-1) ?? scene.beats[0];

const activeDialogue = (scene: VideoScene, frame: number) =>
  scene.dialogue?.find((line) => frame >= (line.startFrame ?? 0) && frame < (line.endFrame ?? scene.durationInFrames));

const subtitleChunk = (line: NonNullable<VideoScene['dialogue']>[number] | undefined, frame: number) => {
  if (!line) return '';
  // Keep the dialogue sentence intact. The audio-derived line timing already
  // gives it a precise window, and whole-line subtitles avoid awkward one- or
  // two-word leftovers at the end of a card.
  return line.text.trim();
};

const boardStyle = (board: VideoScene['board']) => BOARD_STYLES[board];

const CharacterLayer: React.FC<{assetId: string; speaker?: string; x: number; y: number; width: number; frame: number; zIndex: number; activeSpeaker?: string}> = ({assetId, speaker, x, y, width, frame, zIndex, activeSpeaker}) => {
  const asset = assets.find((candidate) => candidate.id === assetId);
  if (!asset) return null;
  const isActive = !activeSpeaker || !speaker || activeSpeaker === speaker;
  const shakeX = isActive ? Math.sin((frame / MOTION.talkingFrames) * Math.PI * 2) * MOTION.talkingAmplitudePx : 0;
  const shakeY = isActive ? Math.sin((frame / (MOTION.talkingFrames * 0.72)) * Math.PI * 2) * 1.2 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${width * 100}%`,
        height: `${width * 100}%`,
        opacity: 1,
        transform: `translate3d(${shakeX}px, ${shakeY}px, 0)`,
        transformOrigin: 'center bottom',
        zIndex,
      }}
    >
      <Img
        src={staticFile(asset.file)}
        alt={assetId}
        style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', transform: speaker === 'skeptic' ? 'scaleX(-1)' : undefined}}
      />
    </div>
  );
};

export const BoardRenderer: React.FC<{scene: VideoScene; transitionOutFrames?: number; vertical?: boolean}> = ({scene, transitionOutFrames = 0, vertical = false}) => {
  const frame = useCurrentFrame();
  const style = boardStyle(scene.board);
  const beat = activeBeat(scene, frame);
  const dialogue = activeDialogue(scene, frame);
  const beatProgress = reveal(frame, beat?.frame ?? 0, 14);
  const beatIndex = Math.max(0, scene.beats.findIndex((candidate) => candidate === beat));
  const sceneIn = reveal(frame, 0, 12);
  const subtitle = subtitleChunk(dialogue, frame);
  const sceneOut = transitionOutFrames > 0
    ? interpolate(frame, [scene.durationInFrames, scene.durationInFrames + transitionOutFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  const sceneOpacity = Math.min(sceneIn, sceneOut);
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity: sceneOpacity, background: style.background, color: style.ink, fontFamily: fontStack, transform: `translateX(${(1 - sceneIn) * 18}px)`}}>
      <AbsoluteFill
        style={{
          padding: vertical ? '38px 48px 28px' : '42px 58px 34px',
          boxSizing: 'border-box',
          backgroundImage: scene.board === 'editorial'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent 42%), linear-gradient(90deg, rgba(0,0,0,0.18), transparent 55%, rgba(0,0,0,0.2))'
            : 'repeating-linear-gradient(0deg, rgba(22,33,43,0.022) 0 1px, transparent 1px 7px)',
        }}
      >
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: vertical ? 12 : 30}}>
          <div>
            <div style={{color: style.accent, fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900, letterSpacing: 3}}>MINDKRAFT / {scene.board.toUpperCase()} BOARD</div>
            <div style={{marginTop: 10, maxWidth: vertical ? '100%' : 1050, fontSize: vertical ? 42 : 51, lineHeight: 0.98, fontWeight: 900}}>{scene.title}</div>
          </div>
          <div style={{padding: '9px 12px', border: `2px solid ${style.accent}`, color: style.accent, fontFamily: utilityFontStack, fontSize: 12, fontWeight: 900, letterSpacing: 1.5}}>STYLE LOCKED</div>
        </div>

        <div style={{position: 'absolute', left: vertical ? 48 : 58, right: vertical ? 48 : 58, top: vertical ? 300 : 190, bottom: vertical ? 250 : 190, border: `3px ${scene.board === 'editorial' ? 'solid' : 'dashed'} ${scene.board === 'editorial' ? 'rgba(255,250,240,0.28)' : 'rgba(22,33,43,0.2)'}`, background: style.panel, boxShadow: scene.board === 'lesson' ? '12px 13px 0 rgba(22,33,43,0.12)' : undefined}} />
        {scene.characters.map((character) => (
          <CharacterLayer
            key={`${scene.id}-${character.assetId}`}
            assetId={character.assetId}
            speaker={character.speaker}
            x={scene.visual ? (vertical ? (character.speaker === 'skeptic' ? 0.70 : 0.04) : (character.speaker === 'skeptic' ? 0.76 : 0.04)) : character.x}
            y={scene.visual ? (vertical ? 0.40 : 0.26) : character.y}
            width={scene.visual ? (vertical ? 0.26 : 0.22) : character.width}
            frame={frame}
            zIndex={character.zIndex ?? 3}
            activeSpeaker={dialogue?.speaker ?? beat?.speaker}
          />
        ))}

        <EducationalVisual scene={scene} frame={frame} beatIndex={beatIndex} vertical={vertical} />

        {vertical ? (
          <>
            {dialogue && <div style={{position: 'absolute', left: 64, right: 64, top: 1305, zIndex: 7, display: 'flex', justifyContent: 'center'}}>
              <div style={{width: '100%', maxWidth: 930, minHeight: 86, boxSizing: 'border-box', padding: '17px 24px 19px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: style.accent, color: COLORS.white, border: `3px solid ${COLORS.ink}`, boxShadow: '7px 8px 0 rgba(22,33,43,0.16)', fontFamily: fontStack, fontSize: 25, lineHeight: 1.16, fontWeight: 800}}>
                {subtitle}
              </div>
            </div>}
            <div style={{position: 'absolute', left: 64, right: 64, top: 1455, display: 'flex', alignItems: 'stretch', zIndex: 7}}>
              {scene.beats.map((candidate, index) => {
                const active = index === beatIndex;
                return (
                  <React.Fragment key={`${scene.id}-vertical-flow-${index}`}>
                    <div style={{display: 'flex', minWidth: 0, flex: 1, alignItems: 'stretch', opacity: active ? 1 : 0.62}}>
                      <div style={{width: '100%', padding: '9px 10px 11px', background: active ? style.accent : scene.board === 'editorial' ? 'rgba(255,253,247,0.08)' : 'rgba(255,253,247,0.72)', color: active ? COLORS.white : style.ink, border: `2px solid ${active ? COLORS.ink : style.muted}`, boxShadow: active ? '4px 5px 0 rgba(22,33,43,0.16)' : undefined}}>
                        <div style={{marginBottom: 5, color: active ? COLORS.white : style.accent, fontFamily: utilityFontStack, fontSize: 10, fontWeight: 900, letterSpacing: 1.3}}>STEP {String(index + 1).padStart(2, '0')}</div>
                        <div style={{fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase', whiteSpace: 'pre-line'}}>{candidate.text ?? candidate.action}</div>
                      </div>
                    </div>
                    {index < scene.beats.length - 1 && <div style={{width: 22, alignSelf: 'center', height: 3, background: index < beatIndex ? style.accent : style.muted, opacity: index < beatIndex ? 1 : 0.4}} />}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {dialogue && <div style={{position: 'absolute', left: 300, right: 300, top: 755, zIndex: 8, display: 'flex', justifyContent: 'center'}}>
              <div style={{width: '100%', maxWidth: 1320, minHeight: 74, boxSizing: 'border-box', padding: '15px 24px 17px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: style.accent, color: COLORS.white, border: `3px solid ${COLORS.ink}`, boxShadow: '7px 8px 0 rgba(22,33,43,0.16)', fontFamily: fontStack, fontSize: 28, lineHeight: 1.12, fontWeight: 800}}>
                {subtitle}
              </div>
            </div>}
            <div style={{position: 'absolute', left: 118, right: 118, top: 610, display: 'flex', alignItems: 'stretch', zIndex: 7}}>
              {scene.beats.map((candidate, index) => {
                const active = index === beatIndex;
                return (
                  <React.Fragment key={`${scene.id}-flow-${index}`}>
                    <div style={{display: 'flex', minWidth: 0, flex: 1, alignItems: 'stretch', opacity: active ? 1 : 0.62}}>
                      <div style={{width: '100%', padding: '9px 10px 11px', background: active ? style.accent : scene.board === 'editorial' ? 'rgba(255,253,247,0.08)' : 'rgba(255,253,247,0.72)', color: active ? COLORS.white : style.ink, border: `2px solid ${active ? COLORS.ink : style.muted}`, boxShadow: active ? '4px 5px 0 rgba(22,33,43,0.16)' : undefined}}>
                        <div style={{marginBottom: 5, color: active ? COLORS.white : style.accent, fontFamily: utilityFontStack, fontSize: 10, fontWeight: 900, letterSpacing: 1.3}}>STEP {String(index + 1).padStart(2, '0')}</div>
                        <div style={{fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase', whiteSpace: 'pre-line'}}>{candidate.text ?? candidate.action}</div>
                      </div>
                    </div>
                    {index < scene.beats.length - 1 && <div style={{width: 22, alignSelf: 'center', height: 3, background: index < beatIndex ? style.accent : style.muted, opacity: index < beatIndex ? 1 : 0.4}} />}
                  </React.Fragment>
                );
              })}
            </div>
          </>
        )}

        {!vertical && beat?.text && (
          <div style={{position: 'absolute', left: vertical ? 64 : 118, right: vertical ? 64 : 118, bottom: vertical ? 135 : 78, zIndex: 10, opacity: beatProgress, transform: `translateY(${(1 - beatProgress) * 12}px)`}}>
            <div style={{display: 'inline-block', maxWidth: vertical ? 900 : 1200, padding: '15px 22px 17px', background: style.accent, color: COLORS.white, border: `3px solid ${COLORS.ink}`, boxShadow: '7px 8px 0 rgba(22,33,43,0.16)', fontFamily: fontStack, fontSize: vertical ? 26 : 30, lineHeight: 1.05, fontWeight: 900, whiteSpace: 'pre-line'}}>
              {beat.text}
            </div>
          </div>
        )}

        <div style={{position: 'absolute', left: vertical ? 50 : 60, right: vertical ? 50 : 60, bottom: vertical ? 26 : 32, display: 'flex', justifyContent: 'space-between', color: style.muted, fontFamily: utilityFontStack, fontSize: 12, fontWeight: 900, letterSpacing: 1.2}}>
          <span>{scene.narration}</span>
          <span>30 FPS / {scene.board.toUpperCase()}</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
