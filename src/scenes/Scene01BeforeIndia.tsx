import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {IllustratedCaption} from '../components/IllustratedCaption';
import {IllustratedLayer, IllustratedScene} from '../components/IllustratedScene';
import {Map} from '../components/Map';
import {SceneTransition} from '../components/SceneTransition';
import {Timeline} from '../components/Timeline';
import {COLORS, fontStack} from '../components/theme';

const timelineEvents = [
  {label: '7000 BCE', detail: 'farming'},
  {label: '2600 BCE', detail: 'cities'},
  {label: '1900 BCE', detail: 'change'},
  {label: 'today', detail: 'still here'},
];

const FadeInText: React.FC<{
  progress: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({progress, children, style}) => (
  <div
    style={{
      opacity: progress,
      transform: `translateY(${(1 - progress) * 18}px)`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Scene01BeforeIndia: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const titleProgress = interpolate(frame, [0, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mapProgress = interpolate(frame, [18, 116], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const timelineProgress = interpolate(frame, [52, 166], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const timelineVisibility = interpolate(frame, [148, 190], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const farmerProgress = interpolate(frame, [164, 207], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const farmerVisibility = interpolate(frame, [248, 286], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const indusProgress = interpolate(frame, [264, 322], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneTransition durationInFrames={durationInFrames}>
      <IllustratedScene
        background="assets/scene-01/background.png"
        durationInFrames={durationInFrames}
        camera={{fromX: 0, toX: 10, fromY: 2, toY: -8, fromScale: 1, toScale: 1.06}}
      >
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(23, 16, 16, 0.68) 0%, rgba(23, 16, 16, 0.18) 53%, rgba(23, 16, 16, 0.04) 100%)'}} />

        <FadeInText
          progress={titleProgress}
          style={{position: 'absolute', left: 94, top: 58, color: '#ffd083', fontFamily: 'Arial, sans-serif', fontSize: 17, fontWeight: 800, letterSpacing: 3}}
        >
          THE ENTIRE HISTORY OF INDIA
        </FadeInText>

        <div style={{position: 'absolute', left: 90, top: 136}}>
          <IllustratedCaption eyebrow="Before the name" progress={titleProgress} width={820}>
            INDIA?
          </IllustratedCaption>
          <FadeInText progress={titleProgress} style={{marginTop: 26, color: '#fff0d4', fontFamily: 'Arial, sans-serif', fontSize: 25, lineHeight: 1.35, fontWeight: 600}}>
            Population: enormous.<br />
            History: also enormous.
          </FadeInText>
          <div style={{width: 236, height: 5, marginTop: 24, backgroundColor: '#e98c4d', transform: 'rotate(-2deg)', opacity: titleProgress}} />
        </div>

        <div
          style={{
            position: 'absolute',
            right: 72,
            top: 70,
            width: 580,
            height: 388,
            padding: 22,
            boxSizing: 'border-box',
            opacity: mapProgress,
            transform: `translateY(${(1 - mapProgress) * 22}px) scale(${0.94 + mapProgress * 0.06})`,
            transformOrigin: 'center',
            backgroundColor: 'rgba(39, 26, 22, 0.56)',
            border: '1px solid rgba(255, 227, 179, 0.65)',
            boxShadow: '0 16px 30px rgba(28, 14, 10, 0.22)',
          }}
        >
          <div style={{color: '#ffe0a3', fontFamily: 'Arial, sans-serif', fontSize: 15, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase'}}>South Asia / the long view</div>
          <div style={{height: 308, marginTop: 8}}>
            <Map highlighted={['india']} accent={COLORS.saffron} drawProgress={mapProgress} style={{filter: 'sepia(0.28) saturate(0.8)'}} />
          </div>
        </div>

        <FadeInText
          progress={timelineProgress * timelineVisibility}
          style={{position: 'absolute', left: 88, top: 574, width: 850, padding: '18px 24px 8px', boxSizing: 'border-box', backgroundColor: 'rgba(38, 28, 24, 0.58)', borderLeft: '5px solid #e98c4d'}}
        >
          <div style={{color: '#ffd083', fontFamily: 'Arial, sans-serif', fontSize: 16, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase'}}>A very compressed timeline</div>
          <div style={{marginTop: 7, color: '#fff4dd', fontFamily: fontStack, fontSize: 22, fontWeight: 700}}>5,000 years in about 35 minutes</div>
          <div style={{marginTop: 14}}><Timeline events={timelineEvents} activeIndex={timelineProgress > 0.72 ? 1 : 0} progress={timelineProgress} /></div>
        </FadeInText>

        <IllustratedLayer
          src="assets/scene-01/farmer.png"
          width={306}
          left={1120}
          bottom={-28}
          enterStart={164}
          enterEnd={207}
          exitStart={248}
          exitEnd={286}
          offsetX={-120}
          offsetY={42}
          rotation={-2}
          sway={2}
        />
        <FadeInText
          progress={farmerProgress * farmerVisibility}
          style={{position: 'absolute', left: 1378, bottom: 188, width: 278, padding: '16px 20px', color: '#2c1d17', backgroundColor: 'rgba(255, 239, 202, 0.9)', borderRadius: 8, boxShadow: '0 10px 18px rgba(30, 15, 9, 0.2)', fontFamily: fontStack, fontSize: 21, lineHeight: 1.2, fontWeight: 800, transform: `translateY(${(1 - farmerProgress) * 16}px) rotate(2deg)`}}
        >
          That is my field.
          <div style={{position: 'absolute', left: 28, bottom: -12, width: 22, height: 22, backgroundColor: 'rgba(255, 239, 202, 0.9)', transform: 'rotate(45deg)'}} />
        </FadeInText>

        <FadeInText
          progress={farmerProgress * farmerVisibility}
          style={{position: 'absolute', left: 1000, bottom: 138, color: '#ffe0a3', fontFamily: 'Arial, sans-serif', fontSize: 16, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', transform: `rotate(-5deg) translateY(${(1 - farmerProgress) * 16}px)`}}
        >
          FARMING → SETTLEMENTS → CITIES
        </FadeInText>

        <div style={{position: 'absolute', left: 88, right: 88, bottom: 38, display: 'flex', alignItems: 'end', justifyContent: 'space-between', opacity: indusProgress, transform: `translateY(${(1 - indusProgress) * 24}px)`}}>
          <div>
            <div style={{color: '#ffd083', fontFamily: 'Arial, sans-serif', fontSize: 15, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase'}}>Next chapter</div>
            <div style={{marginTop: 5, color: '#fff6e3', fontFamily: 'Georgia, Times New Roman, serif', fontSize: 39, fontWeight: 700, textShadow: '0 3px 8px rgba(20, 10, 7, 0.55)'}}>THE INDUS VALLEY CIVILIZATION</div>
          </div>
          <div style={{color: '#ffe5b6', fontFamily: fontStack, fontSize: 18, fontWeight: 700, transform: 'rotate(2deg)'}}>okay, start at the beginning.</div>
        </div>
      </IllustratedScene>
    </SceneTransition>
  );
};
