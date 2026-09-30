import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Caption} from '../components/Caption';
import {DateCounter} from '../components/DateCounter';
import {SceneTransition} from '../components/SceneTransition';
import {Timeline} from '../components/Timeline';
import {COLORS, fontStack} from '../components/theme';
import type {SceneSpec} from '../data/sceneManifest';

export const PlaceholderScene: React.FC<{scene: SceneSpec}> = ({scene}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <SceneTransition durationInFrames={scene.durationInFrames}>
      <div style={{width: '100%', height: '100%', padding: 86, boxSizing: 'border-box', background: COLORS.paper, fontFamily: fontStack, color: COLORS.ink}}>
        <div style={{position: 'absolute', inset: 0, opacity: 0.24, background: 'linear-gradient(135deg, transparent 0 48%, rgba(201,87,62,0.15) 48% 52%, transparent 52%)'}} />
        <div style={{position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <DateCounter eyebrow={`Section ${scene.id}`} label={scene.period} progress={progress} />
          <div style={{padding: '12px 20px', border: `3px solid ${COLORS.terracotta}`, color: COLORS.terracotta, fontWeight: 900, letterSpacing: 3}}>DRAFT SCENE</div>
        </div>
        <div style={{position: 'relative', marginTop: 125, maxWidth: 1250}}>
          <Caption eyebrow="Planned adaptation">{scene.title}</Caption>
          <div style={{marginTop: 36, maxWidth: 900, fontSize: 30, lineHeight: 1.25, fontWeight: 700, opacity: progress}}>{scene.narration}</div>
        </div>
        <div style={{position: 'absolute', left: 86, right: 86, bottom: 90}}>
          <Timeline events={[{label: 'scripted', detail: 'read'}, {label: 'visuals', detail: 'next'}, {label: 'render', detail: 'preview'}]} activeIndex={0} progress={progress} />
        </div>
      </div>
    </SceneTransition>
  );
};
