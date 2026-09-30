import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DOODLE_TEST_BEATS} from '../data/doodleTest';
import {COLORS, fontStack} from '../components/theme';
import {SketchArrow, SketchBoard, SketchCircle, SketchNote, SketchPath} from '../components/Sketch';
import {SpeechBubble} from '../components/SpeechBubble';

export type DoodleMotionTestProps = {includeAudio?: boolean};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const pop = (frame: number, start: number, duration = 24) => {
  if (frame < start) return 0;
  const t = clamp((frame - start) / duration);
  return 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 2.25);
};

const quadPoint = (t: number, a: {x: number; y: number}, b: {x: number; y: number}, c: {x: number; y: number}) => ({
  x: Math.pow(1 - t, 2) * a.x + 2 * (1 - t) * t * b.x + Math.pow(t, 2) * c.x,
  y: Math.pow(1 - t, 2) * a.y + 2 * (1 - t) * t * b.y + Math.pow(t, 2) * c.y,
});

const TEST_MAP = 'M205 73 C255 39 329 47 376 84 C423 120 467 158 526 177 C584 196 618 233 605 272 C592 309 617 337 590 370 C563 403 530 422 511 463 C493 502 464 513 437 475 C414 443 400 413 374 393 C345 370 307 352 282 322 C256 292 246 262 223 233 C201 205 178 182 185 145 C190 113 189 88 205 73 Z';
const ROUTE = 'M255 177 Q353 122 433 217 T557 335';
const RIVER = 'M455 87 Q432 157 452 216 T492 342 Q509 384 557 420';

type Location = {id: string; label: string; x: number; y: number; start: number; tilt: number};

const LOCATIONS: Location[] = [
  {id: 'hills', label: 'HILLS', x: 255, y: 177, start: 146, tilt: -5},
  {id: 'crossing', label: 'CROSSING', x: 433, y: 217, start: 178, tilt: 3},
  {id: 'city', label: 'CITY', x: 557, y: 335, start: 214, tilt: -3},
];

const ActiveBeat: React.FC<{frame: number}> = ({frame}) => {
  const beat = DOODLE_TEST_BEATS.find(({startFrame, endFrame}) => frame >= startFrame && frame < endFrame)
    ?? DOODLE_TEST_BEATS[DOODLE_TEST_BEATS.length - 1];
  const lineProgress = Math.min(reveal(frame, beat.startFrame, beat.startFrame + 12), reveal(beat.endFrame, beat.endFrame - 18, beat.endFrame));
  const tone = beat.speaker === 'skeptic' ? 'light' : 'dark';
  const speakerColor = beat.speaker === 'skeptic' ? COLORS.terracotta : beat.speaker === 'historian' ? COLORS.teal : COLORS.saffron;
  return (
    <div
      style={{
        position: 'absolute',
        left: 1155,
        top: 690,
        width: 620,
        opacity: lineProgress,
        transform: `translate3d(${(1 - lineProgress) * 30}px, ${(1 - lineProgress) * 14}px, 0) rotate(${beat.speaker === 'skeptic' ? -1 : 1}deg)`,
      }}
    >
      <div style={{marginBottom: 10, color: speakerColor, fontFamily: fontStack, fontSize: 18, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase'}}>
        {beat.speaker}
      </div>
      <SpeechBubble tone={tone} style={{fontSize: 27, lineHeight: 1.12, padding: '20px 25px'}}>{beat.text}</SpeechBubble>
    </div>
  );
};

export const LivingMap: React.FC<{frame: number}> = ({frame}) => {
  const mapDraw = reveal(frame, 35, 155);
  const routeDraw = reveal(frame, 108, 244);
  const travelProgress = reveal(frame, 250, 428);
  const riverDraw = reveal(frame, 590, 710);
  const breathing = 1 + Math.sin(frame / 11) * 0.009;
  const mapTilt = Math.sin(frame / 23) * 0.7;
  const traveler = quadPoint(travelProgress, {x: 255, y: 177}, {x: 360, y: 113}, {x: 557, y: 335});
  return (
    <svg viewBox="0 0 820 570" width="100%" height="100%" role="img" aria-label="Living hand-drawn map test">
      <g transform={`translate(10 8) rotate(${mapTilt} 400 280) scale(${breathing})`}>
        <SketchPath d="M88 474 Q270 451 422 463 T735 443" stroke={COLORS.ink} strokeWidth={4} progress={1} opacity={0.18} roughness={3} seed="test-shadow" />
        <SketchPath d={TEST_MAP} fill="#e9d7a9" stroke={COLORS.ink} strokeWidth={7} progress={mapDraw} roughness={4} seed="test-map-outline" />
        <SketchPath d="M270 80 Q315 112 352 143 T442 178" stroke={COLORS.green} strokeWidth={5} progress={mapDraw} opacity={0.8} roughness={3} seed="test-hills" />
        <SketchPath d={RIVER} stroke={COLORS.teal} strokeWidth={8} progress={riverDraw} opacity={0.9} roughness={3} seed="test-river" />
        <SketchPath d={ROUTE} stroke={COLORS.terracotta} strokeWidth={7} progress={routeDraw} roughness={3} seed="test-route" />
        <SketchArrow x1={478} y1={262} x2={534} y2={306} bend={12} color={COLORS.terracotta} progress={routeDraw} seed="test-route-arrow" />
        {LOCATIONS.map((location) => {
          const pinProgress = pop(frame, location.start, 26);
          const pulse = 1 + Math.max(0, Math.sin((frame - location.start) / 8)) * 0.1;
          return (
            <g key={location.id} opacity={clamp(pinProgress)} transform={`translate(${location.x} ${location.y}) scale(${pinProgress * pulse})`}>
              <circle r="17" fill={location.id === 'city' ? COLORS.saffron : COLORS.white} stroke={COLORS.ink} strokeWidth="5" />
              <SketchCircle cx={0} cy={0} rx={26} ry={23} color={location.id === 'city' ? COLORS.saffron : COLORS.teal} strokeWidth={3} progress={clamp(reveal(frame, location.start + 8, location.start + 24))} seed={`test-ring-${location.id}`} />
              <text x="32" y="7" fill={COLORS.ink} fontFamily={fontStack} fontSize="22" fontWeight="900" transform={`rotate(${location.tilt} 32 7)`}>{location.label}</text>
            </g>
          );
        })}
        {frame >= 250 && (
          <g transform={`translate(${traveler.x} ${traveler.y}) rotate(${Math.sin(frame / 4) * 5})`}>
            <path d="M-18 5 Q0 -13 18 5 L13 30 L-13 30 Z" fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth="4" />
            <circle cx="-6" cy="-3" r="3" fill={COLORS.ink} />
            <circle cx="6" cy="-3" r="3" fill={COLORS.ink} />
            <path d="M-7 10 Q0 15 7 10 M-13 30 L-22 43 M13 30 L23 40" fill="none" stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
            <path d="M-18 2 L-34 -9 M18 2 L34 -7" fill="none" stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
          </g>
        )}
        {frame >= 500 && (
          <g transform={`translate(557 335) scale(${pop(frame, 500, 30)})`}>
            {[[-54, 22, 38, 56], [-17, -12, 42, 90], [28, 26, 42, 52]].map(([x, y, width, height], index) => (
              <g key={index}>
                <rect x={x} y={y} width={width} height={height} fill={index === 1 ? COLORS.terracotta : COLORS.cream} stroke={COLORS.ink} strokeWidth="4" />
                <path d={`M${x + 8} ${y + 18} H${x + width - 8} M${x + 8} ${y + 31} H${x + width - 8}`} stroke={COLORS.ink} strokeWidth="3" opacity="0.65" />
              </g>
            ))}
            <text x="-8" y="113" textAnchor="middle" fill={COLORS.ink} fontFamily={fontStack} fontSize="21" fontWeight="900" transform="rotate(-3 -8 113)">CITY</text>
          </g>
        )}
        {frame >= 620 && [0, 1, 2, 3].map((index) => {
          const rippleProgress = reveal(frame, 620 + index * 13, 650 + index * 13);
          return <SketchCircle key={index} cx={490 + index * 14} cy={363 + index * 11} rx={10 + index * 4} ry={5 + index * 2} color={COLORS.teal} strokeWidth={3} progress={rippleProgress} seed={`ripple-${index}`} />;
        })}
      </g>
    </svg>
  );
};

export const OpenDoodleActor: React.FC<{
  src: string;
  frame: number;
  startFrame: number;
  endFrame: number;
  left: number;
  top: number;
  width: number;
  rotation?: number;
  label?: string;
}> = ({src, frame, startFrame, endFrame, left, top, width, rotation = 0, label}) => {
  const entrance = pop(frame, startFrame, 30);
  const exit = reveal(frame, endFrame, endFrame + 24);
  const visible = clamp(entrance) * (1 - exit);
  const bob = Math.sin((frame - startFrame) / 7) * 4;
  const tilt = rotation + Math.sin((frame - startFrame) / 18) * 1.2;
  return (
    <div style={{position: 'absolute', left, top, width, opacity: visible, transform: `translate3d(${(1 - clamp(entrance)) * 70}px, ${bob + (1 - clamp(entrance)) * 30}px, 0) rotate(${tilt}deg) scale(${0.88 + clamp(entrance) * 0.12})`, transformOrigin: '50% 100%'}}>
      <Img src={staticFile(src)} style={{width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 10px 8px rgba(22,33,43,0.12))'}} />
      {label && <div style={{marginTop: -8, color: COLORS.ink, fontFamily: fontStack, fontSize: 19, fontWeight: 900, textAlign: 'center', letterSpacing: 2, transform: 'rotate(-2deg)'}}>{label}</div>}
    </div>
  );
};

const MapBuddy: React.FC<{frame: number}> = ({frame}) => (
  <OpenDoodleActor
    src="assets/open-doodles/sitting-reading.svg"
    frame={frame}
    startFrame={155}
    endFrame={804}
    left={1370}
    top={210}
    width={330}
    rotation={-2}
    label="HISTORIAN"
  />
);

export const DoodleMotionTest: React.FC<DoodleMotionTestProps> = ({includeAudio = true}) => {
  const frame = useCurrentFrame();
  const titleProgress = reveal(frame, 0, 42);
  const endProgress = reveal(frame, 816, 872);
  const driftX = Math.sin(frame / 37) * 5;
  const driftY = Math.cos(frame / 43) * 3;
  const celebration = reveal(frame, 704, 748);
  return (
    <SketchBoard>
      <AbsoluteFill style={{transform: `translate3d(${driftX}px, ${driftY}px, 0)`}}>
        <div style={{position: 'absolute', left: 88, top: 54, color: COLORS.terracotta, fontFamily: fontStack, fontSize: 18, fontWeight: 900, letterSpacing: 4, transform: `rotate(-2deg) translateY(${(1 - titleProgress) * 16}px)`, opacity: titleProgress}}>
          MOTION TEST / 30 SECONDS
        </div>
        <div style={{position: 'absolute', left: 84, top: 92, opacity: titleProgress, transform: `scale(${0.92 + titleProgress * 0.08}) rotate(-1deg)`, transformOrigin: 'left center'}}>
          <SketchNote color={COLORS.ink} style={{fontSize: 43, padding: '13px 25px 15px', background: 'rgba(255,253,247,0.72)'}}>A MAP THAT MOVES</SketchNote>
        </div>
        <div style={{position: 'absolute', left: 100, top: 184, width: 1000, height: 690, transform: `rotate(${Math.sin(frame / 29) * 0.35}deg)`, transformOrigin: 'center center'}}>
          <LivingMap frame={frame} />
        </div>
        <div style={{position: 'absolute', left: 106, top: 834, color: COLORS.mutedInk, fontFamily: fontStack, fontSize: 20, fontWeight: 800, transform: `rotate(-2deg)`, opacity: reveal(frame, 105, 175)}}>
          route first · reaction second · detail third
        </div>
        <MapBuddy frame={frame} />
        <OpenDoodleActor src="assets/open-doodles/clumsy.svg" frame={frame} startFrame={184} endFrame={276} left={1120} top={215} width={250} rotation={4} label="SKEPTIC" />
        <OpenDoodleActor src="assets/open-doodles/float.svg" frame={frame} startFrame={270} endFrame={480} left={710} top={118} width={250} rotation={-7} label="LOST?" />
        <OpenDoodleActor src="assets/open-doodles/dog-jump.svg" frame={frame} startFrame={500} endFrame={730} left={705} top={650} width={250} rotation={3} label="FOLLOW THE WATER" />
        <div style={{position: 'absolute', left: 1120, top: 122, width: 580, opacity: reveal(frame, 110, 164), transform: `rotate(2deg) translateY(${(1 - reveal(frame, 110, 164)) * 22}px)`}}>
          <SketchNote color={COLORS.teal} style={{fontSize: 23, background: 'rgba(255,253,247,0.66)'}}>No frozen cards. Everything reacts.</SketchNote>
        </div>
        <ActiveBeat frame={frame} />
        <div style={{position: 'absolute', left: 1080, top: 570, opacity: celebration, transform: `scale(${0.6 + celebration * 0.4}) rotate(-4deg)`, transformOrigin: 'center'}}>
          <SketchArrow x1={10} y1={75} x2={155} y2={12} bend={-18} color={COLORS.saffron} progress={celebration} seed="celebrate-arrow" />
          <SketchNote color={COLORS.saffron} style={{fontSize: 27, marginLeft: 125}}>alive!</SketchNote>
        </div>
        <div style={{position: 'absolute', left: 1060, top: 480, opacity: endProgress, transform: `translateY(${(1 - endProgress) * 24}px) rotate(-2deg)`}}>
          <SketchPath d="M0 8 Q82 -18 170 10 T340 5" stroke={COLORS.terracotta} strokeWidth={5} progress={endProgress} roughness={3} seed="test-end-line" />
          <div style={{marginTop: 8, color: COLORS.ink, fontFamily: fontStack, fontSize: 28, fontWeight: 900}}>Tune the rhythm.</div>
          <div style={{marginTop: 5, color: COLORS.mutedInk, fontFamily: fontStack, fontSize: 19, fontWeight: 700}}>Then scale the style to India.</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(circle at 77% 63%, rgba(237,139,53,${0.08 * celebration}) 0 4px, transparent 5px), radial-gradient(circle at 71% 60%, rgba(21,127,128,${0.08 * celebration}) 0 3px, transparent 4px)`}} />
      {includeAudio && <Audio src={staticFile('audio/doodle-test.wav')} volume={0.82} />}
    </SketchBoard>
  );
};
