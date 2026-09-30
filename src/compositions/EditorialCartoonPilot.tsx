import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLORS} from '../components/theme';
import {EDITORIAL_SHOTS, type EditorialShot, type EditorialSpeaker} from '../data/editorialPilot';

export type EditorialCartoonPilotProps = {includeAudio?: boolean};

type Mood = 'confident' | 'skeptic' | 'surprised' | 'defeated';
type Gesture = 'point' | 'present' | 'down' | 'listen' | 'shrug';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const pop = (frame: number, start: number, duration = 24) => {
  const progress = clamp((frame - start) / duration);
  if (frame < start) return 0;
  return 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 2.15);
};

const shotAt = (frame: number): EditorialShot =>
  EDITORIAL_SHOTS.find(({startFrame, endFrame}) => frame >= startFrame && frame < endFrame)
  ?? EDITORIAL_SHOTS[EDITORIAL_SHOTS.length - 1];

const speakerForShot = (shot: EditorialShot, frame: number): EditorialSpeaker => {
  if (shot.id === 'proof' && frame - shot.startFrame > 150) return 'sidekick';
  if (shot.id === 'punchline' && frame - shot.startFrame > 138) return 'host';
  return shot.speaker;
};

const photoForShot = (shot: EditorialShot) => {
  if (shot.focus === 'grid' || shot.focus === 'drain') return 'assets/editorial/mohenjo-daro.jpg';
  return 'assets/editorial/harappa.jpg';
};

const PhotoPlate: React.FC<{shot: EditorialShot; frame: number}> = ({shot, frame}) => {
  const drift = Math.sin((frame - shot.startFrame) / 105) * 8;
  const push = 1.06 + Math.min(0.035, Math.max(0, frame - shot.startFrame) / 7000);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#19232c'}}>
      <Img
        src={staticFile(photoForShot(shot))}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: shot.focus === 'drain' ? 'center 62%' : 'center center',
          filter: 'saturate(0.72) sepia(0.12) contrast(0.94) brightness(0.78)',
          transform: `scale(${push}) translate3d(${drift}px, 0, 0)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: [
            'linear-gradient(180deg, rgba(16, 26, 34, 0.18) 0%, rgba(16, 26, 34, 0.06) 38%, rgba(16, 26, 34, 0.72) 100%)',
            'linear-gradient(90deg, rgba(12, 19, 25, 0.58) 0%, rgba(12, 19, 25, 0.04) 39%, rgba(12, 19, 25, 0.32) 100%)',
          ].join(','),
        }}
      />
      <div style={{position: 'absolute', inset: 34, border: '2px solid rgba(255,250,240,0.55)', borderRadius: 28, boxShadow: 'inset 0 0 0 9px rgba(20,32,42,0.18)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 186, background: 'linear-gradient(180deg, rgba(220,186,133,0), rgba(17,27,34,0.72))'}} />
      <div style={{position: 'absolute', left: 84, right: 84, bottom: 102, height: 18, borderRadius: 18, background: 'rgba(242,210,155,0.16)', boxShadow: '0 7px 0 rgba(14,22,28,0.25)'}} />
    </AbsoluteFill>
  );
};

type CharacterProps = {
  kind: 'host' | 'sidekick';
  frame: number;
  speaking: boolean;
  mood: Mood;
  gesture: Gesture;
};

const Mouth: React.FC<{frame: number; speaking: boolean; mood: Mood; host: boolean}> = ({frame, speaking, mood, host}) => {
  if (!speaking) {
    if (mood === 'defeated') return <path d="M116 164 Q132 153 149 164" fill="none" stroke={COLORS.ink} strokeWidth="5" strokeLinecap="round" />;
    if (mood === 'surprised') return <ellipse cx="132" cy="155" rx="11" ry="16" fill={COLORS.ink} />;
    if (mood === 'skeptic') return <path d="M117 156 Q132 151 148 156" fill="none" stroke={COLORS.ink} strokeWidth="5" strokeLinecap="round" />;
    return <path d="M119 155 H145" fill="none" stroke={COLORS.ink} strokeWidth="5" strokeLinecap="round" />;
  }

  // Limited phoneme cycle: closed, open, rounded, wide, and closed again.
  // It reads as speech without pretending to be word-level lip tracking.
  const shape = Math.floor((frame + (host ? 0 : 3)) / 3) % 5;
  if (shape === 0 || shape === 4) return <path d="M117 155 Q132 162 147 155" fill="none" stroke={COLORS.ink} strokeWidth="5" strokeLinecap="round" />;
  if (shape === 1) return <path d="M112 149 Q132 136 152 149 Q132 177 112 149 Z" fill={COLORS.ink} />;
  if (shape === 2) return <ellipse cx="132" cy="154" rx="14" ry="19" fill={COLORS.ink} />;
  return <path d="M107 149 Q132 135 157 149 Q132 178 107 149 Z" fill={COLORS.ink} stroke={COLORS.ink} strokeWidth="3" />;
};

const GestureArms: React.FC<{gesture: Gesture; frame: number; host: boolean}> = ({gesture, frame, host}) => {
  const wave = Math.sin(frame / 7.5) * 5;
  const hand = host ? COLORS.yellow : '#e7ad7e';
  const arm = host ? '#243f58' : '#9f473d';

  if (gesture === 'point') return (
    <g fill="none" stroke={arm} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M229 252 Q270 ${228 + wave} 300 ${170 + wave}`} />
      <path d="M300 170 L320 165 M300 170 L317 178" stroke={hand} strokeWidth="8" />
      <circle cx="300" cy={170 + wave} r="11" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
      <path d="M88 253 Q64 270 74 302" opacity="0.75" />
      <circle cx="75" cy="304" r="10" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
    </g>
  );

  if (gesture === 'down') return (
    <g fill="none" stroke={arm} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M229 251 Q278 270 285 ${315 + wave}`} />
      <path d="M285 315 L300 327 M285 315 L283 335" stroke={hand} strokeWidth="8" />
      <circle cx="285" cy={315 + wave} r="11" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
      <path d="M88 253 Q64 270 74 302" opacity="0.72" />
      <circle cx="75" cy="304" r="10" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
    </g>
  );

  if (gesture === 'present') return (
    <g fill="none" stroke={arm} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M229 252 Q270 ${242 + wave} 291 216`} />
      <path d="M289 213 Q307 204 318 216 M291 216 Q307 219 317 229 M289 218 Q301 232 310 236" stroke={hand} strokeWidth="7" />
      <circle cx="291" cy="216" r="11" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
      <path d="M88 253 Q60 231 53 205" opacity="0.72" />
      <circle cx="53" cy="204" r="10" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
    </g>
  );

  if (gesture === 'shrug') return (
    <g fill="none" stroke={arm} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
      <path d={`M91 251 Q53 ${228 + wave} 32 198`} />
      <path d="M229 251 Q269 227 292 199" />
      <circle cx="32" cy={198 + wave} r="12" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
      <circle cx="292" cy={199 + wave} r="12" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
    </g>
  );

  return (
    <g fill="none" stroke={arm} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round">
      <path d="M229 252 Q263 271 275 302" opacity="0.72" />
      <circle cx="275" cy="303" r="10" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
      <path d="M90 252 Q68 246 105 218" />
      <circle cx="105" cy="218" r="11" fill={hand} stroke={COLORS.ink} strokeWidth="4" />
    </g>
  );
};

const Character: React.FC<CharacterProps> = ({kind, frame, speaking, mood, gesture}) => {
  const host = kind === 'host';
  const bounce = speaking ? Math.sin(frame / 3.9) * 4 : Math.sin(frame / 19) * 1.2;
  const tilt = speaking ? Math.sin(frame / 10) * 1.1 : Math.sin(frame / 23) * 0.35;
  const entrance = pop(frame, shotAt(frame).startFrame, 18);
  const left = host ? 98 : 1372;
  const mirror = host ? 1 : -1;
  const blink = frame % 103 >= 98 && frame % 103 <= 100;
  const browLift = mood === 'surprised' ? -8 : mood === 'skeptic' ? 2 : 0;
  const skin = host ? '#e9b488' : '#c98259';
  return (
    <div
      style={{
        position: 'absolute',
        left,
        bottom: 102,
        width: 450,
        height: 570,
        opacity: clamp(entrance),
        transform: `translate3d(${(1 - clamp(entrance)) * (host ? -80 : 80)}px, ${bounce + (1 - clamp(entrance)) * 50}px, 0) rotate(${tilt}deg) scale(${0.95 + clamp(entrance) * 0.05})`,
        transformOrigin: '50% 100%',
        filter: 'drop-shadow(0 18px 10px rgba(7,18,24,0.25))',
      }}
    >
      <svg viewBox="0 0 320 420" width="100%" height="100%" style={{overflow: 'visible'}}>
        <g transform={`translate(${mirror === 1 ? 0 : 320} 0) scale(${mirror} 1)`}>
          <ellipse cx="160" cy="410" rx="95" ry="13" fill="rgba(5,14,18,0.36)" />
          <GestureArms gesture={gesture} frame={frame} host={host} />

          {host ? (
            <>
              <path d="M77 248 Q160 220 243 248 L263 392 Q160 418 57 392 Z" fill="#243f58" stroke={COLORS.ink} strokeWidth="6" />
              <path d="M125 242 L160 288 L195 242 L185 392 L135 392 Z" fill={COLORS.white} stroke={COLORS.ink} strokeWidth="5" />
              <path d="M135 245 L160 274 L185 245" fill="none" stroke={COLORS.yellow} strokeWidth="9" strokeLinecap="round" />
              <path d="M160 276 L160 380" stroke={COLORS.yellow} strokeWidth="8" strokeLinecap="round" />
              <path d="M84 297 Q110 314 127 300" fill="none" stroke={COLORS.teal} strokeWidth="7" strokeLinecap="round" />
              <circle cx="216" cy="314" r="13" fill={COLORS.terracotta} stroke={COLORS.ink} strokeWidth="4" />
            </>
          ) : (
            <>
              <path d="M74 246 Q160 220 246 246 L268 394 Q160 417 52 394 Z" fill="#9f473d" stroke={COLORS.ink} strokeWidth="6" />
              <path d="M105 242 L160 275 L215 242 L226 393 L94 393 Z" fill="#2b6264" stroke={COLORS.ink} strokeWidth="5" />
              <path d="M105 254 L121 392 M215 254 L199 392" stroke={COLORS.yellow} strokeWidth="8" strokeLinecap="round" />
              <path d="M104 304 Q160 321 216 304" fill="none" stroke="#e48b60" strokeWidth="8" strokeLinecap="round" />
              <circle cx="104" cy="326" r="12" fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth="4" />
            </>
          )}

          <path d="M88 137 Q75 170 91 228 Q160 255 229 228 Q245 171 232 137 Z" fill={skin} stroke={COLORS.ink} strokeWidth="6" />
          {host ? (
            <path d="M86 126 Q68 80 97 48 Q132 12 188 42 Q224 62 232 120 Q208 93 173 95 Q128 81 86 126 Z" fill="#243f58" stroke={COLORS.ink} strokeWidth="6" />
          ) : (
            <>
              <path d="M85 122 Q66 83 89 50 Q122 11 187 39 Q225 56 235 112 Q209 92 175 91 Q125 74 85 122 Z" fill="#6e3c3b" stroke={COLORS.ink} strokeWidth="6" />
              <circle cx="89" cy="82" r="19" fill="#6e3c3b" stroke={COLORS.ink} strokeWidth="5" />
              <circle cx="224" cy="78" r="18" fill="#6e3c3b" stroke={COLORS.ink} strokeWidth="5" />
            </>
          )}

          {host ? (
            <>
              <rect x="96" y="119" width="52" height="32" rx="12" fill="rgba(255,253,247,0.28)" stroke={COLORS.ink} strokeWidth="5" />
              <rect x="172" y="119" width="52" height="32" rx="12" fill="rgba(255,253,247,0.28)" stroke={COLORS.ink} strokeWidth="5" />
              <path d="M148 133 H172" stroke={COLORS.ink} strokeWidth="5" />
            </>
          ) : (
            <>
              <circle cx="119" cy="134" r="27" fill="rgba(255,253,247,0.16)" stroke={COLORS.teal} strokeWidth="7" />
              <circle cx="201" cy="134" r="27" fill="rgba(255,253,247,0.16)" stroke={COLORS.teal} strokeWidth="7" />
              <path d="M146 134 H174" stroke={COLORS.teal} strokeWidth="7" />
            </>
          )}

          {blink ? (
            <path d="M108 134 H133 M187 134 H212" stroke={COLORS.ink} strokeWidth="5" strokeLinecap="round" />
          ) : (
            <>
              <ellipse cx="120" cy="134" rx="5" ry="7" fill={COLORS.ink} />
              <ellipse cx="200" cy="134" rx="5" ry="7" fill={COLORS.ink} />
            </>
          )}
          <path d={`M101 ${112 + browLift} Q120 ${103 + browLift} 139 ${112 + browLift}`} fill="none" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
          <path d={`M181 ${112 + browLift} Q200 ${mood === 'skeptic' ? 105 + browLift : 103 + browLift} 219 ${mood === 'skeptic' ? 115 + browLift : 112 + browLift}`} fill="none" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />
          <path d="M160 145 Q153 160 161 164" fill="none" stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
          <Mouth frame={frame} speaking={speaking} mood={mood} host={host} />
          {host ? (
            <path d="M101 211 Q160 226 219 211" fill="none" stroke={COLORS.yellow} strokeWidth="10" strokeLinecap="round" />
          ) : (
            <path d="M101 207 Q160 225 219 207" fill="none" stroke={COLORS.teal} strokeWidth="11" strokeLinecap="round" />
          )}
        </g>
      </svg>
    </div>
  );
};

const gestureFor = (kind: 'host' | 'sidekick', shot: EditorialShot): Gesture => {
  if (kind === 'host') {
    if (shot.focus === 'drain') return 'down';
    if (shot.focus === 'grid') return 'present';
    return 'point';
  }
  if (shot.id === 'low-bar') return 'shrug';
  if (shot.id === 'hidden-drain') return 'point';
  if (shot.id === 'punchline') return 'present';
  return 'listen';
};

const BrickProp: React.FC<{frame: number; compact?: boolean}> = ({frame, compact = false}) => {
  const progress = reveal(frame, 12, compact ? 54 : 80);
  const scale = compact ? 0.78 : 1;
  return (
    <div style={{position: 'absolute', left: compact ? 680 : 735, top: compact ? 470 : 365, width: compact ? 240 : 330, height: 250, opacity: progress, transform: `scale(${scale * (0.8 + progress * 0.2)}) rotate(-2deg)`, transformOrigin: '50% 100%'}}>
      <svg viewBox="0 0 330 250" width="100%" height="100%">
        <ellipse cx="165" cy="230" rx="120" ry="14" fill="rgba(22,33,43,0.15)" />
        <g stroke={COLORS.ink} strokeWidth="5" strokeLinejoin="round">
          <rect x="36" y="148" width="112" height="62" rx="5" fill="#d96b4f" />
          <rect x="151" y="148" width="112" height="62" rx="5" fill="#e8865e" />
          <rect x="91" y="86" width="112" height="62" rx="5" fill="#c9573e" />
          <path d="M52 166 H132 M168 166 H248 M108 103 H188" stroke={COLORS.yellow} strokeWidth="6" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
};

const StreetGridProp: React.FC<{frame: number}> = ({frame}) => {
  const progress = reveal(frame, 12, 110);
  const route = reveal(frame, 78, 148);
  return (
    <div style={{position: 'absolute', left: 655, top: 300, width: 620, height: 420, opacity: progress, transform: `translateY(${(1 - progress) * 38}px) rotate(-2deg) scale(${0.9 + progress * 0.1})`, transformOrigin: '50% 100%'}}>
      <svg viewBox="0 0 620 420" width="100%" height="100%">
        <ellipse cx="310" cy="388" rx="240" ry="17" fill="rgba(22,33,43,0.14)" />
        <rect x="42" y="28" width="536" height="334" rx="24" fill="#e9d7a9" stroke={COLORS.ink} strokeWidth="7" />
        <path d="M98 95 H522 M98 182 H522 M98 270 H522 M184 62 V328 M312 62 V328 M440 62 V328" stroke={COLORS.ink} strokeWidth="8" strokeLinecap="round" opacity="0.82" />
        <path d="M112 313 Q210 249 312 188 T495 83" fill="none" stroke={COLORS.terracotta} strokeWidth="11" strokeLinecap="round" strokeDasharray="420" strokeDashoffset={420 * (1 - route)} />
        <circle cx="110" cy="312" r="15" fill={COLORS.teal} stroke={COLORS.ink} strokeWidth="5" />
        <circle cx="495" cy="83" r="17" fill={COLORS.saffron} stroke={COLORS.ink} strokeWidth="5" />
      </svg>
    </div>
  );
};

const DrainProp: React.FC<{frame: number; overflow?: boolean}> = ({frame, overflow = false}) => {
  const progress = reveal(frame, 12, 96);
  const water = reveal(frame, 72, overflow ? 155 : 128);
  return (
    <div style={{position: 'absolute', left: overflow ? 665 : 735, top: 330, width: overflow ? 600 : 430, height: 390, opacity: progress, transform: `translateY(${(1 - progress) * 42}px) scale(${0.9 + progress * 0.1})`, transformOrigin: '50% 100%'}}>
      <svg viewBox="0 0 430 390" width="100%" height="100%" overflow="visible">
        <ellipse cx="215" cy="368" rx="160" ry="16" fill="rgba(22,33,43,0.14)" />
        <path d="M72 74 V210 Q72 294 154 294 H282 Q358 294 358 216 V74" fill="none" stroke={COLORS.ink} strokeWidth="25" strokeLinecap="round" />
        <path d="M72 74 V210 Q72 294 154 294 H282 Q358 294 358 216 V74" fill="none" stroke="#dfe7e1" strokeWidth="13" strokeLinecap="round" />
        <path d="M96 88 V208 Q96 268 158 268 H276 Q334 268 334 208 V88" fill="none" stroke={COLORS.teal} strokeWidth="9" strokeLinecap="round" strokeDasharray="510" strokeDashoffset={510 * (1 - water)} />
        {overflow && <>
          <path d="M334 210 Q397 235 392 323" fill="none" stroke={COLORS.teal} strokeWidth="11" strokeLinecap="round" strokeDasharray="150" strokeDashoffset={150 * (1 - water)} />
          <circle cx="388" cy="336" r="13" fill={COLORS.teal} opacity={water} />
          <circle cx="410" cy="352" r="8" fill={COLORS.teal} opacity={water * 0.75} />
        </>}
      </svg>
    </div>
  );
};

const FactSignature: React.FC<{frame: number; shot: EditorialShot}> = ({frame, shot}) => {
  const progress = pop(frame, shot.startFrame + 14, 22);
  const positions = {
    brick: {left: 1050, top: 280},
    grid: {left: 1260, top: 260},
    drain: {left: 1195, top: 310},
    all: {left: 1030, top: 270},
  }[shot.focus];
  return (
    <svg viewBox="0 0 90 90" width="90" height="90" style={{position: 'absolute', ...positions, opacity: clamp(progress), transform: `rotate(${progress * 15 - 8}deg) scale(${0.7 + progress * 0.3})`}}>
      <path d="M45 8 L52 34 L80 22 L58 44 L83 58 L54 56 L58 84 L43 59 L22 78 L32 52 L7 45 L34 38 Z" fill="none" stroke={COLORS.terracotta} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="45" cy="45" r="7" fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth="3" />
    </svg>
  );
};

const Props: React.FC<{shot: EditorialShot; frame: number}> = ({shot, frame}) => {
  const local = frame - shot.startFrame;
  if (shot.focus === 'brick') return <BrickProp frame={local} compact={shot.id === 'low-bar'} />;
  if (shot.focus === 'grid') return <StreetGridProp frame={local} />;
  if (shot.focus === 'drain') return <DrainProp frame={local} overflow={shot.id === 'punchline'} />;
  return <>
    <BrickProp frame={local} compact />
    <StreetGridProp frame={local - 30} />
    <DrainProp frame={local - 52} />
  </>;
};

export const EditorialCartoonPilot: React.FC<EditorialCartoonPilotProps> = ({includeAudio = true}) => {
  const frame = useCurrentFrame();
  const shot = shotAt(frame);
  const speaker = speakerForShot(shot, frame);
  const cameraPunch = 1 + Math.max(0, Math.sin((frame - shot.startFrame) / 5)) * 0.004;
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#19232c'}}>
      <PhotoPlate shot={shot} frame={frame} />
      <AbsoluteFill style={{transform: `scale(${cameraPunch})`, transformOrigin: 'center center'}}>
        <Props shot={shot} frame={frame} />
        <Character kind="host" frame={frame} speaking={speaker === 'host'} mood={shot.id === 'punchline' ? 'surprised' : 'confident'} gesture={gestureFor('host', shot)} />
        <Character kind="sidekick" frame={frame} speaking={speaker === 'sidekick'} mood={shot.id === 'low-bar' || shot.id === 'hidden-drain' ? 'skeptic' : shot.id === 'punchline' ? 'defeated' : 'surprised'} gesture={gestureFor('sidekick', shot)} />
        <FactSignature frame={frame} shot={shot} />
      </AbsoluteFill>
      {includeAudio && <Audio src={staticFile('audio/editorial-pilot.wav')} volume={0.92} />}
      {includeAudio && <Audio src={staticFile('audio/editorial-pops.wav')} volume={0.82} />}
    </AbsoluteFill>
  );
};
