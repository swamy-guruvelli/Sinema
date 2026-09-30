import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {DOODLE_STORY_SCENES, type PaperScene} from '../data/doodleStoryTest';
import {SketchArrow, SketchBoard, SketchCircle, SketchPath} from '../components/Sketch';
import {COLORS, fontStack} from '../components/theme';

export type DoodleStoryTestProps = {includeAudio?: boolean};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Written: React.FC<{
  children: React.ReactNode;
  x: number;
  y: number;
  progress: number;
  size?: number;
  color?: string;
  rotate?: number;
  anchor?: 'start' | 'middle' | 'end';
}> = ({children, x, y, progress, size = 25, color = COLORS.ink, rotate = 0, anchor = 'start'}) => (
  <text
    x={x}
    y={y}
    fill={color}
    opacity={progress}
    fontFamily={fontStack}
    fontSize={size}
    fontWeight="900"
    textAnchor={anchor}
    transform={`rotate(${rotate} ${x} ${y}) translate(0 ${(1 - progress) * 8})`}
  >
    {children}
  </text>
);

const Pencil: React.FC<{x: number; y: number; angle?: number; progress: number}> = ({x, y, angle = -18, progress}) => (
  <g opacity={progress} transform={`translate(${x} ${y}) rotate(${angle})`}>
    <path d="M0 0 L72 -8 L84 5 L12 15 Z" fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth="3" />
    <path d="M72 -8 L91 0 L84 5 Z" fill={COLORS.cream} stroke={COLORS.ink} strokeWidth="3" />
    <path d="M0 0 L-14 8 L12 15 Z" fill={COLORS.ink} stroke={COLORS.ink} strokeWidth="2" />
    <path d="M25 -4 L37 9 M46 -6 L58 7" stroke={COLORS.terracotta} strokeWidth="4" opacity="0.75" />
  </g>
);

const PageHeader: React.FC<{scene: PaperScene; frame: number}> = ({scene, frame}) => {
  const title = reveal(frame, 0, 32);
  const line = reveal(frame, 18, 58);
  const sheetNumber = DOODLE_STORY_SCENES.findIndex(({id}) => id === scene.id) + 1;
  return (
    <>
      <Written x={82} y={76} progress={title} size={16} color={COLORS.terracotta} rotate={-2}>
        SHEET {sheetNumber} / {scene.cue.toUpperCase()}
      </Written>
      <Written x={82} y={126} progress={title} size={38} rotate={-1.4}>
        {scene.title}
      </Written>
      <SketchPath d="M82 151 Q310 137 552 151" stroke={COLORS.terracotta} strokeWidth={4} progress={line} roughness={3} seed={`paper-header-${scene.id}`} />
    </>
  );
};

const MapPage: React.FC<{frame: number}> = ({frame}) => {
  const map = reveal(frame, 20, 112);
  const river = reveal(frame, 74, 157);
  const route = reveal(frame, 108, 181);
  const pins = reveal(frame, 148, 190);
  const note = reveal(frame, 156, 205);
  const pencil = reveal(frame, 18, 190);
  return (
    <svg viewBox="0 0 1600 850" width="100%" height="100%" preserveAspectRatio="none">
      <PageHeader scene={DOODLE_STORY_SCENES[0]} frame={frame} />
      <SketchPath d="M285 215 C335 160 430 148 508 181 C579 211 623 264 716 278 C823 294 906 349 889 424 C878 476 913 519 874 574 C838 624 768 640 733 705 C704 759 652 780 616 730 C579 678 554 636 504 609 C447 578 389 539 365 482 C345 435 310 403 274 355 C240 310 248 254 285 215 Z" fill="#ead7a8" stroke={COLORS.ink} strokeWidth={7} progress={map} roughness={4} seed="paper-map-outline" />
      <SketchPath d="M355 212 Q441 235 520 223 T665 242" stroke={COLORS.green} strokeWidth={5} progress={map} opacity={0.8} roughness={3} seed="paper-map-hills" />
      <SketchPath d="M648 166 Q601 240 627 319 T661 478 Q679 548 735 618" stroke={COLORS.teal} strokeWidth={8} progress={river} roughness={3} seed="paper-map-river" />
      <SketchArrow x1={342} y1={327} x2={774} y2={526} bend={-50} color={COLORS.terracotta} progress={route} seed="paper-map-route" />
      <g opacity={pins}>
        <SketchCircle cx={344} cy={327} rx={28} ry={23} color={COLORS.teal} strokeWidth={4} progress={pins} seed="paper-map-pin-hills" />
        <circle cx="344" cy="327" r="15" fill={COLORS.white} stroke={COLORS.ink} strokeWidth="5" />
        <Written x={385} y={335} progress={pins} size={23} rotate={-3}>HILLS</Written>
      </g>
      <g opacity={pins}>
        <SketchCircle cx={774} cy={526} rx={28} ry={23} color={COLORS.saffron} strokeWidth={4} progress={pins} seed="paper-map-pin-city" />
        <circle cx="774" cy="526" r="17" fill={COLORS.saffron} stroke={COLORS.ink} strokeWidth="5" />
        <Written x={816} y={535} progress={pins} size={23} rotate={2}>CITY</Written>
      </g>
      <Written x={1060} y={275} progress={note} size={28} color={COLORS.teal} rotate={-4}>RIVER -&gt; CITY</Written>
      <SketchPath d="M1042 292 Q1140 274 1278 292" stroke={COLORS.teal} strokeWidth={3} progress={note} roughness={3} seed="paper-map-note-line" />
      <Written x={1050} y={372} progress={reveal(frame, 175, 210)} size={25} color={COLORS.terracotta} rotate={3}>WHY SO CLEAN?</Written>
      <SketchArrow x1={1034} y1={388} x2={838} y2={505} bend={20} color={COLORS.terracotta} progress={reveal(frame, 175, 210)} seed="paper-map-note-arrow" />
      <Pencil x={950 + pencil * 470} y={600 - pencil * 220} angle={-18 + pencil * 8} progress={pencil} />
    </svg>
  );
};

const StreetPlanPage: React.FC<{frame: number}> = ({frame}) => {
  const street = reveal(frame, 18, 110);
  const house = reveal(frame, 70, 145);
  const drain = reveal(frame, 123, 198);
  const labels = reveal(frame, 170, 230);
  return (
    <svg viewBox="0 0 1600 850" width="100%" height="100%" preserveAspectRatio="none">
      <PageHeader scene={DOODLE_STORY_SCENES[1]} frame={frame} />
      <SketchPath d="M180 278 Q495 260 820 278 T1420 272" stroke={COLORS.ink} strokeWidth={8} progress={street} roughness={4} seed="paper-street-top" />
      <SketchPath d="M180 548 Q500 530 830 549 T1420 541" stroke={COLORS.ink} strokeWidth={8} progress={street} roughness={4} seed="paper-street-bottom" />
      <SketchPath d="M250 170 Q242 406 255 680" stroke={COLORS.ink} strokeWidth={5} progress={street} roughness={3} seed="paper-street-left" />
      <SketchPath d="M1370 160 Q1380 400 1362 675" stroke={COLORS.ink} strokeWidth={5} progress={street} roughness={3} seed="paper-street-right" />
      <SketchPath d="M288 420 Q500 403 735 420 T1330 411" stroke={COLORS.teal} strokeWidth={7} progress={drain} roughness={3} seed="paper-street-water" />
      <SketchArrow x1={315} y1={418} x2={1290} y2={412} bend={-18} color={COLORS.teal} progress={drain} seed="paper-street-water-arrow" />
      <g opacity={house}>
        <SketchPath d="M656 533 L656 343 L910 343 L910 534" stroke={COLORS.ink} strokeWidth={6} progress={house} roughness={3} seed="paper-house-box" />
        <SketchPath d="M624 346 L783 230 L942 346" stroke={COLORS.terracotta} strokeWidth={7} progress={house} roughness={3} seed="paper-house-roof" />
        <SketchPath d="M756 533 L756 435 L819 435 L819 533" stroke={COLORS.ink} strokeWidth={5} progress={house} roughness={3} seed="paper-house-door" />
        <SketchPath d="M688 393 L728 393 L728 432 L688 432 Z M844 393 L884 393 L884 432 L844 432 Z" stroke={COLORS.teal} strokeWidth={5} progress={house} roughness={2} seed="paper-house-windows" />
      </g>
      <SketchPath d="M620 596 Q786 579 950 596 T1284 590" stroke={COLORS.terracotta} strokeWidth={6} progress={drain} roughness={3} seed="paper-drain-line" />
      <SketchPath d="M640 626 Q792 609 956 626 T1275 620" stroke={COLORS.teal} strokeWidth={4} progress={drain} roughness={2} seed="paper-drain-water" />
      <Written x={644} y={318} progress={labels} size={24} color={COLORS.terracotta} rotate={-2}>HOUSE</Written>
      <Written x={1010} y={618} progress={labels} size={24} color={COLORS.teal} rotate={2}>COVERED DRAIN</Written>
      <Written x={292} y={238} progress={labels} size={22} color={COLORS.mutedInk} rotate={-3}>STREET PLAN</Written>
      <SketchArrow x1={997} y1={608} x2={938} y2={590} bend={8} color={COLORS.teal} progress={labels} seed="paper-drain-label-arrow" />
      <Pencil x={1020 + reveal(frame, 18, 230) * 420} y={650 - reveal(frame, 18, 230) * 240} angle={-15} progress={reveal(frame, 18, 230)} />
    </svg>
  );
};

const HiddenSystemPage: React.FC<{frame: number}> = ({frame}) => {
  const ground = reveal(frame, 12, 72);
  const blocks = reveal(frame, 40, 115);
  const well = reveal(frame, 88, 145);
  const drain = reveal(frame, 112, 178);
  const details = reveal(frame, 162, 215);
  return (
    <svg viewBox="0 0 1600 850" width="100%" height="100%" preserveAspectRatio="none">
      <PageHeader scene={DOODLE_STORY_SCENES[2]} frame={frame} />
      <SketchPath d="M160 320 Q470 302 790 321 T1440 313" stroke={COLORS.ink} strokeWidth={9} progress={ground} roughness={4} seed="paper-cutaway-ground" />
      <SketchPath d="M160 640 Q470 622 790 641 T1440 633" stroke={COLORS.ink} strokeWidth={6} progress={ground} roughness={3} seed="paper-cutaway-floor" />
      <g opacity={blocks}>
        <SketchPath d="M228 318 L228 200 L450 200 L450 317 M520 317 L520 164 L760 164 L760 317 M1018 314 L1018 190 L1260 190 L1260 315" stroke={COLORS.terracotta} strokeWidth={7} progress={blocks} roughness={3} seed="paper-cutaway-buildings" />
        <SketchPath d="M210 380 L488 380 M510 418 L793 418 M1000 374 L1284 374" stroke={COLORS.mutedInk} strokeWidth={5} progress={blocks} roughness={2} seed="paper-cutaway-streets" />
      </g>
      <SketchPath d="M215 510 Q450 481 700 510 T1120 505 Q1260 487 1390 510" stroke={COLORS.ink} strokeWidth={10} progress={drain} roughness={4} seed="paper-cutaway-drain" />
      <SketchPath d="M240 510 Q470 490 690 510 T1100 505 Q1260 493 1370 510" stroke={COLORS.teal} strokeWidth={6} progress={drain} roughness={3} seed="paper-cutaway-water" />
      <SketchArrow x1={282} y1={510} x2={1312} y2={510} bend={-22} color={COLORS.teal} progress={drain} seed="paper-cutaway-water-arrow" />
      <g opacity={well}>
        <SketchCircle cx={900} cy={442} rx={46} ry={22} color={COLORS.teal} strokeWidth={6} progress={well} seed="paper-well-ring" />
        <SketchPath d="M854 442 L854 606 Q900 634 946 606 L946 442" stroke={COLORS.ink} strokeWidth={6} progress={well} roughness={3} seed="paper-well-shaft" />
        <SketchPath d="M870 580 Q900 565 930 580" stroke={COLORS.teal} strokeWidth={5} progress={well} roughness={2} seed="paper-well-water" />
      </g>
      <Written x={225} y={710} progress={details} size={26} color={COLORS.teal} rotate={-2}>WATER UNDER THE STREET</Written>
      <Written x={960} y={695} progress={details} size={24} color={COLORS.terracotta} rotate={3}>COVERED, NOT MAGIC</Written>
      <SketchArrow x1={885} y1={680} x2={900} y2={615} bend={-12} color={COLORS.terracotta} progress={details} seed="paper-well-label-arrow" />
      <Pencil x={330 + reveal(frame, 12, 215) * 920} y={220 + Math.sin(frame / 8) * 14} angle={-14} progress={reveal(frame, 12, 215)} />
    </svg>
  );
};

const ButtonPage: React.FC<{frame: number}> = ({frame}) => {
  const idea = reveal(frame, 18, 82);
  const lines = reveal(frame, 55, 128);
  const finalNote = reveal(frame, 122, 164);
  const pencil = reveal(frame, 18, 164);
  return (
    <svg viewBox="0 0 1600 850" width="100%" height="100%" preserveAspectRatio="none">
      <PageHeader scene={DOODLE_STORY_SCENES[3]} frame={frame} />
      <SketchPath d="M270 285 Q540 206 810 287 T1325 282" stroke={COLORS.teal} strokeWidth={9} progress={idea} roughness={4} seed="paper-button-water" />
      <SketchArrow x1={300} y1={284} x2={1270} y2={282} bend={-70} color={COLORS.teal} progress={idea} seed="paper-button-water-arrow" />
      <SketchPath d="M484 540 Q670 474 850 540 T1204 536" stroke={COLORS.terracotta} strokeWidth={8} progress={lines} roughness={4} seed="paper-button-street" />
      <SketchPath d="M670 370 L670 547 M920 370 L920 547" stroke={COLORS.ink} strokeWidth={6} progress={lines} roughness={3} seed="paper-button-street-crossings" />
      <SketchCircle cx={670} cy={370} rx={27} ry={21} color={COLORS.saffron} strokeWidth={4} progress={lines} seed="paper-button-pin-a" />
      <SketchCircle cx={920} cy={370} rx={27} ry={21} color={COLORS.saffron} strokeWidth={4} progress={lines} seed="paper-button-pin-b" />
      <Written x={540} y={638} progress={finalNote} size={31} color={COLORS.terracotta} rotate={-3}>LABEL THE DRAIN</Written>
      <SketchPath d="M530 655 Q770 680 1012 654" stroke={COLORS.terracotta} strokeWidth={4} progress={finalNote} roughness={3} seed="paper-button-underline" />
      <Written x={1120} y={404} progress={finalNote} size={28} color={COLORS.teal} rotate={4}>NOT A RIVER</Written>
      <SketchArrow x1={1110} y1={420} x2={930} y2={526} bend={18} color={COLORS.teal} progress={finalNote} seed="paper-button-note-arrow" />
      <Pencil x={390 + pencil * 680} y={270 + Math.sin(frame / 7) * 10} angle={-14} progress={pencil} />
    </svg>
  );
};

const SceneDrawing: React.FC<{scene: PaperScene; frame: number}> = ({scene, frame}) => {
  if (scene.id === 'map') return <MapPage frame={frame} />;
  if (scene.id === 'street-plan') return <StreetPlanPage frame={frame} />;
  if (scene.id === 'hidden-system') return <HiddenSystemPage frame={frame} />;
  return <ButtonPage frame={frame} />;
};

const PaperSheet: React.FC<{scene: PaperScene; index: number; frame: number}> = ({scene, index, frame}) => {
  if (frame < scene.startFrame || frame > scene.endFrame) return null;
  const localFrame = frame - scene.startFrame;
  const enter = reveal(localFrame, 0, 24);
  const exit = reveal(frame, scene.endFrame - 36, scene.endFrame);
  const crease = reveal(frame, scene.endFrame - 48, scene.endFrame - 4);
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 44,
        width: 1792,
        height: 992,
        opacity: 1 - exit * 0.82,
        zIndex: index,
        transform: `translate3d(${(1 - enter) * -150 + exit * 1360}px, ${(1 - enter) * -70 - exit * 260}px, 0) rotate(${-1.1 + exit * 30}deg) scale(${1 - exit * 0.25}) skewX(${exit * 7}deg)`,
        transformOrigin: '50% 50%',
        backgroundColor: COLORS.cream,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(22,33,43,0.022) 0 1px, transparent 1px 7px)',
        border: '2px solid rgba(22,33,43,0.24)',
        boxShadow: '14px 18px 0 rgba(22,33,43,0.14), 0 3px 16px rgba(22,33,43,0.12)',
        overflow: 'hidden',
      }}
    >
      <SceneDrawing scene={scene} frame={localFrame} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: crease,
          background: 'repeating-linear-gradient(112deg, transparent 0 116px, rgba(22,33,43,0.07) 118px 121px, transparent 123px 216px)',
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
      <svg viewBox="0 0 1600 850" width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity: crease, pointerEvents: 'none'}}>
        <SketchPath d="M130 40 Q430 420 1460 800 M1480 40 Q1190 430 120 800 M690 0 Q800 410 910 850" stroke={COLORS.ink} strokeWidth={4} progress={crease} opacity={0.16} roughness={5} seed={`paper-crease-${scene.id}`} />
      </svg>
    </div>
  );
};

export const DoodleStoryTest: React.FC<DoodleStoryTestProps> = ({includeAudio = true}) => {
  const frame = useCurrentFrame();
  return (
    <SketchBoard>
      <AbsoluteFill>
        {DOODLE_STORY_SCENES.map((scene, index) => (
          <PaperSheet key={scene.id} scene={scene} index={index} frame={frame} />
        ))}
        {includeAudio && <Audio src={staticFile('audio/doodle-story-test.wav')} volume={0.84} />}
      </AbsoluteFill>
    </SketchBoard>
  );
};
