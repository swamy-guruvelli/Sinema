import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {IllustratedCaption} from '../components/IllustratedCaption';
import {IllustratedLayer, IllustratedScene} from '../components/IllustratedScene';
import {Map, type MapLocation} from '../components/Map';
import {SceneTransition} from '../components/SceneTransition';
import {SketchArrow, SketchPath} from '../components/Sketch';
import {COLORS, fontStack} from '../components/theme';

const locations: MapLocation[] = [
  {id: 'harappa', label: 'Harappa', x: 298, y: 122},
  {id: 'mohenjo-daro', label: 'Mohenjo-daro', x: 258, y: 184},
  {id: 'dholavira', label: 'Dholavira', x: 347, y: 276},
  {id: 'lothal', label: 'Lothal', x: 380, y: 325},
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

const CityPlan: React.FC<{progress: number}> = ({progress}) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      padding: '18px 22px',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(45, 29, 23, 0.82)',
      border: '1px solid rgba(255, 222, 164, 0.58)',
      boxShadow: '0 12px 26px rgba(29, 14, 9, 0.24)',
    }}
  >
    <div style={{color: '#ffd083', fontFamily: 'Arial, sans-serif', fontSize: 16, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase'}}>City planning?!</div>
    <svg viewBox="0 0 620 230" width="100%" height="calc(100% - 34px)" role="img" aria-label="Animated Harappan city grid" style={{marginTop: 9, overflow: 'visible'}}>
      <rect x="9" y="9" width="602" height="206" rx="5" fill="rgba(239, 201, 133, 0.14)" stroke="#ffe3ab" strokeWidth="2" opacity={progress} />
      {[42, 86, 130, 174].map((y, index) => (
        <SketchPath key={`h-${y}`} d={`M22 ${y} H598`} stroke={index === 0 ? '#e98c4d' : '#ffe7bb'} strokeWidth={index === 0 ? 5 : 3} progress={progress} roughness={2} seed={`city-h-${index}`} />
      ))}
      {[72, 164, 256, 348, 440, 532].map((x, index) => (
        <SketchPath key={`v-${x}`} d={`M${x} 22 V202`} stroke="#ffe7bb" strokeWidth={3} progress={progress} roughness={2} seed={`city-v-${index}`} />
      ))}
      <SketchPath d="M18 199 Q180 189 306 199 T602 197" stroke="#62b5b0" strokeWidth={8} progress={progress} roughness={2} seed="city-drain" />
      <text x="310" y="194" textAnchor="middle" fill="#b9eee1" fontFamily={fontStack} fontSize="18" fontWeight="900" letterSpacing="3" opacity={progress}>DRAINAGE</text>
    </svg>
  </div>
);

const DrainageGag: React.FC<{progress: number}> = ({progress}) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      padding: '16px 22px',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(35, 33, 28, 0.78)',
      border: '1px solid rgba(185, 238, 225, 0.65)',
      boxShadow: '0 12px 26px rgba(29, 14, 9, 0.2)',
    }}
  >
    <div style={{color: '#b9eee1', fontFamily: 'Arial, sans-serif', fontSize: 16, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase'}}>A drain. In 2600 BCE.</div>
    <svg viewBox="0 0 700 155" width="100%" height="calc(100% - 28px)" role="img" aria-label="A cutaway sketch of an ancient drainage system" style={{marginTop: 6, overflow: 'visible'}}>
      <SketchPath d="M30 32 H260 V113 H30 Z" fill="rgba(255, 239, 202, 0.16)" stroke="#ffe8bc" strokeWidth={4} progress={1} roughness={2} seed="drain-house" />
      <SketchPath d="M66 54 H220 V88 H282 V113 H635" stroke="#62b5b0" strokeWidth={10} progress={progress} roughness={2} seed="drain-water" />
      <SketchPath d="M220 48 V88 M282 88 V113" stroke="#ffe8bc" strokeWidth={4} progress={progress} roughness={2} seed="drain-cutaway" />
      <SketchArrow x1={488} y1={32} x2={575} y2={104} bend={-25} progress={progress} color="#62b5b0" seed="drain-arrow" />
      <text x="442" y="142" fill="#fff0cf" fontFamily={fontStack} fontSize="19" fontWeight="800" transform="rotate(2 442 142)">honestly, impressive</text>
    </svg>
  </div>
);

const TradeTag: React.FC<{children: React.ReactNode; color: string; rotate: number}> = ({children, color, rotate}) => (
  <div style={{padding: '11px 16px', color: '#fff4dc', backgroundColor: `${color}dd`, border: '1px solid rgba(255, 238, 205, 0.75)', boxShadow: '0 6px 10px rgba(35, 16, 10, 0.18)', fontFamily: fontStack, fontSize: 18, fontWeight: 800, transform: `rotate(${rotate}deg)`}}>{children}</div>
);

export const Scene02IndusValley: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const mapProgress = interpolate(frame, [0, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cityProgress = interpolate(frame, [68, 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const gagProgress = interpolate(frame, [176, 250], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const gagVisibility = interpolate(frame, [330, 370], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tradeProgress = interpolate(frame, [248, 342], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const historianProgress = interpolate(frame, [355, 442], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const historianVisibility = interpolate(frame, [470, 510], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const declineProgress = interpolate(frame, [482, 570], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneTransition durationInFrames={durationInFrames}>
      <IllustratedScene
        background="assets/scene-02/background.png"
        durationInFrames={durationInFrames}
        camera={{fromX: 4, toX: 8, fromY: 2, toY: -8, fromScale: 1, toScale: 1.06}}
      >
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(25, 18, 15, 0.64) 0%, rgba(25, 18, 15, 0.18) 58%, rgba(25, 18, 15, 0.24) 100%)'}} />

        <FadeInText progress={mapProgress} style={{position: 'absolute', left: 86, top: 48, color: '#ffd083', fontFamily: 'Arial, sans-serif', fontSize: 16, fontWeight: 800, letterSpacing: 3}}>
          SECTION 02 / c. 2600–1900 BCE
        </FadeInText>
        <div style={{position: 'absolute', left: 84, top: 90}}>
          <IllustratedCaption eyebrow="Urban civilization" progress={mapProgress} width={840}>
            The Harappans built cities on purpose.
          </IllustratedCaption>
        </div>

        <div style={{position: 'absolute', left: 72, top: 320, width: 595, height: 430, padding: 18, boxSizing: 'border-box', opacity: mapProgress, transform: `translateY(${(1 - mapProgress) * 24}px)`, backgroundColor: 'rgba(43, 29, 23, 0.58)', border: '1px solid rgba(255, 222, 169, 0.58)', boxShadow: '0 15px 30px rgba(25, 13, 9, 0.24)'}}>
          <div style={{color: '#ffe1a5', fontFamily: 'Arial, sans-serif', fontSize: 15, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase'}}>Four cities, one network</div>
          <div style={{height: 350, marginTop: 8}}><Map locations={locations} highlighted={locations.map(({id}) => id)} accent={COLORS.yellow} drawProgress={mapProgress} style={{filter: 'sepia(0.25) saturate(0.76)'}} /></div>
        </div>

        <div style={{position: 'absolute', right: 86, top: 246, width: 720, height: 316, opacity: cityProgress, transform: `translateY(${(1 - cityProgress) * 26}px) rotate(0.5deg)`}}>
          <CityPlan progress={cityProgress} />
        </div>

        <div style={{position: 'absolute', right: 84, top: 586, width: 770, height: 224, opacity: gagProgress * gagVisibility, transform: `translateY(${(1 - gagProgress) * 24}px) rotate(-0.5deg)`}}>
          <DrainageGag progress={gagProgress} />
        </div>

        <FadeInText progress={tradeProgress} style={{position: 'absolute', left: 104, top: 798, color: '#ffe0a3', fontFamily: 'Arial, sans-serif', fontSize: 16, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase'}}>
          Also: they traded
          <div style={{display: 'flex', gap: 12, marginTop: 14}}>
            <TradeTag color={COLORS.teal} rotate={-2}>WEIGHTS</TradeTag>
            <TradeTag color={COLORS.saffron} rotate={2}>COTTON</TradeTag>
            <TradeTag color={COLORS.terracotta} rotate={-3}>SEALS</TradeTag>
          </div>
        </FadeInText>

        <IllustratedLayer
          src="assets/scene-02/historian.png"
          width={285}
          right={92}
          bottom={-50}
          enterStart={355}
          enterEnd={442}
          exitStart={470}
          exitEnd={510}
          offsetX={110}
          offsetY={38}
          rotation={2}
          sway={1.5}
        />
        <FadeInText progress={historianProgress * historianVisibility} style={{position: 'absolute', right: 342, bottom: 218, width: 302, padding: '15px 18px', color: '#2c1d17', backgroundColor: 'rgba(255, 239, 202, 0.92)', borderRadius: 8, boxShadow: '0 10px 18px rgba(30, 15, 9, 0.22)', fontFamily: fontStack, fontSize: 19, lineHeight: 1.2, fontWeight: 800, transform: `translateY(${(1 - historianProgress) * 14}px) rotate(-2deg)`}}>
          Cool drawing of a unicorn.
          <div style={{position: 'absolute', right: -10, bottom: -10, width: 20, height: 20, backgroundColor: 'rgba(255, 239, 202, 0.92)', transform: 'rotate(45deg)'}} />
        </FadeInText>

        <div style={{position: 'absolute', left: 88, right: 88, bottom: 42, opacity: declineProgress, transform: `translateY(${(1 - declineProgress) * 24}px)`, padding: '13px 20px', backgroundColor: 'rgba(30, 23, 20, 0.6)', borderLeft: '5px solid #e98c4d'}}>
          <IllustratedCaption eyebrow="Then, gradually" progress={declineProgress} width="100%" style={{textShadow: '0 2px 7px rgba(20, 10, 7, 0.55)'}}>
            No giant “END CIVILIZATION” button. Just change.
          </IllustratedCaption>
        </div>
      </IllustratedScene>
    </SceneTransition>
  );
};
