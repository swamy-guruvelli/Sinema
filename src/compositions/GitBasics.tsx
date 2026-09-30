import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {gitBeatAt, GIT_BASICS_BEATS, type GitBeat, type GitSpeaker} from '../data/gitBasics';
import {COLORS, fontStack} from '../components/theme';

export type GitBasicsProps = {};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const easeOut = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

const pop = (frame: number, start: number, duration = 22) => {
  if (frame < start) return 0;
  const progress = clamp((frame - start) / duration);
  return 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 2.1);
};

const speakerColor = (speaker: GitSpeaker) => speaker === 'hero' ? COLORS.terracotta : COLORS.teal;

const CharacterCutout: React.FC<{
  kind: GitSpeaker;
  frame: number;
  beat: GitBeat;
}> = ({kind, frame, beat}) => {
  const isHero = kind === 'hero';
  const speaking = beat.speaker === kind;
  const entrance = easeOut(pop(frame, beat.startFrame - 18, 28));
  const beatFrame = Math.max(0, frame - beat.startFrame);
  const sync = Math.sin((beatFrame + (isHero ? 0 : 4)) / (speaking ? 3.9 : 10.5));
  const bounce = speaking ? sync * 4.5 : Math.sin(beatFrame / 18) * 1.2;
  const tilt = speaking ? sync * 0.9 : Math.sin(beatFrame / 22) * 0.25;
  const lean = speaking ? (isHero ? 3 : -3) : (isHero ? -1 : 1);
  const spec = isHero
    ? {left: 32, top: 7, scale: 1.68, width: 410, height: 690}
    : {left: 654, top: 5, scale: 2.42, width: 318, height: 528};
  const sourceWidth = 817 * spec.scale;
  const sourceHeight = 461 * spec.scale;
  const baseLeft = isHero ? 36 : 1568;
  const baseBottom = isHero ? 57 : 75;
  const exit = frame >= beat.endFrame - 18 ? reveal(frame, beat.endFrame - 18, beat.endFrame) : 0;
  const xExit = exit * (isHero ? -72 : 72);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: baseLeft,
        bottom: baseBottom,
        width: spec.width,
        height: spec.height,
        zIndex: 3,
        opacity: clamp(entrance) * (1 - exit * 0.82),
        transform: `translate3d(${xExit + lean}px, ${bounce + (1 - entrance) * 30}px, 0) rotate(${tilt}deg) scale(${0.96 + entrance * 0.04})`,
        transformOrigin: '50% 100%',
        filter: 'drop-shadow(0 18px 9px rgba(22,33,43,0.2))',
      }}
    >
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <svg viewBox={`0 0 ${spec.width} ${spec.height}`} width="100%" height="100%" preserveAspectRatio="none" style={{overflow: 'visible'}}>
          <defs>
            <filter id={`remove-paper-${kind}`} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -2.5 -2.5 -2.5 0 7.15" />
            </filter>
          </defs>
          <image
            href={staticFile('assets/characters/design.png')}
            x={-spec.left * spec.scale}
            y={-spec.top * spec.scale}
            width={sourceWidth}
            height={sourceHeight}
            preserveAspectRatio="none"
            filter={`url(#remove-paper-${kind})`}
          />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          left: isHero ? 132 : 57,
          bottom: 2,
          padding: '6px 11px 5px',
          border: `2px solid ${COLORS.ink}`,
          backgroundColor: speakerColor(kind),
          color: COLORS.white,
          fontFamily: 'Trebuchet MS, Arial, sans-serif',
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 2,
          transform: `rotate(${isHero ? -3 : 3}deg)`,
        }}
      >
        {isHero ? 'HERO' : 'SIDEKICK'}
      </div>
    </div>
  );
};

const SpeechBubble: React.FC<{beat: GitBeat; frame: number}> = ({beat, frame}) => {
  const progress = easeOut(reveal(frame, beat.startFrame + 8, beat.startFrame + 28));
  const left = beat.speaker === 'hero' ? 430 : 840;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 204,
        width: 650,
        minHeight: 120,
        padding: '20px 28px 22px',
        zIndex: 7,
        opacity: progress,
        transform: `translateY(${(1 - progress) * -18}px) rotate(${beat.speaker === 'hero' ? -1 : 1}deg)`,
        backgroundColor: COLORS.white,
        border: `4px solid ${COLORS.ink}`,
        borderRadius: '24px 32px 25px 30px',
        boxShadow: '8px 8px 0 rgba(22,33,43,0.14)',
        fontFamily: fontStack,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: speakerColor(beat.speaker), fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: 2}}>
        <span style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: speakerColor(beat.speaker), border: `2px solid ${COLORS.ink}`}} />
        {beat.speaker === 'hero' ? 'HERO' : 'SIDEKICK'} / {beat.label}
      </div>
      <div style={{fontSize: 30, lineHeight: 1.13, fontWeight: 900, color: COLORS.ink}}>{beat.line}</div>
      <span
        style={{
          position: 'absolute',
          bottom: -18,
          left: beat.speaker === 'hero' ? 78 : 510,
          width: 28,
          height: 28,
          backgroundColor: COLORS.white,
          borderRight: `4px solid ${COLORS.ink}`,
          borderBottom: `4px solid ${COLORS.ink}`,
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  );
};

const WindowChrome: React.FC<{frame: number}> = ({frame}) => {
  const progress = easeOut(reveal(frame, 0, 20));
  return (
    <div style={{height: 68, display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', borderBottom: `3px solid ${COLORS.ink}`, opacity: progress}}>
      <div style={{display: 'flex', gap: 8}}>
        {[COLORS.terracotta, COLORS.yellow, COLORS.teal].map((color) => <span key={color} style={{width: 15, height: 15, borderRadius: '50%', backgroundColor: color, border: `2px solid ${COLORS.ink}`}} />)}
      </div>
      <div style={{padding: '8px 14px 7px', border: `2px solid ${COLORS.ink}`, borderBottom: 'none', backgroundColor: COLORS.cream, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 800, letterSpacing: 1.2}}>hello-git / terminal</div>
      <div style={{marginLeft: 'auto', color: COLORS.mutedInk, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 13, fontWeight: 800, letterSpacing: 1.5}}>LOCAL / SAFE TO EXPERIMENT</div>
    </div>
  );
};

const CodeLine: React.FC<{number: string; children: React.ReactNode; active?: boolean; progress: number}> = ({number, children, active = false, progress}) => (
  <div style={{display: 'flex', alignItems: 'center', minHeight: 42, opacity: progress, transform: `translateX(${(1 - progress) * 16}px)`, fontFamily: 'Consolas, monospace', fontSize: 20}}>
    <span style={{width: 44, color: COLORS.mutedInk, textAlign: 'right', marginRight: 20}}>{number}</span>
    <span style={{width: 7, height: 28, marginRight: 12, backgroundColor: active ? COLORS.terracotta : 'transparent'}} />
    <span style={{color: active ? COLORS.ink : '#425462'}}>{children}</span>
  </div>
);

const CodePane: React.FC<{frame: number; action: GitBeat['action']}> = ({frame, action}) => {
  const lineProgress = easeOut(reveal(frame, 18, 50));
  const modified = action === 'working' || action === 'stage';
  return (
    <div style={{flex: '1 1 61%', padding: '34px 34px 30px', borderRight: `3px solid ${COLORS.ink}`, backgroundColor: '#fbf6e8'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25}}>
        <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', color: COLORS.ink, fontSize: 17, fontWeight: 900}}>APP.JS</div>
        <div style={{padding: '6px 10px', border: `2px solid ${COLORS.ink}`, backgroundColor: modified ? '#f5d9c2' : '#d9e9d4', color: COLORS.ink, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 12, fontWeight: 900, letterSpacing: 1.4}}>{modified ? 'MODIFIED' : 'SAVED'}</div>
      </div>
      <CodeLine number="01" progress={lineProgress}><span style={{color: COLORS.terracotta}}>const</span> hello = <span style={{color: COLORS.teal}}>&quot;world&quot;</span>;</CodeLine>
      <CodeLine number="02" progress={lineProgress}><span style={{color: COLORS.terracotta}}>const</span> mood = <span style={{color: COLORS.teal}}>&quot;curious&quot;</span>;</CodeLine>
      <CodeLine number="03" progress={lineProgress} active={modified}><span style={{color: COLORS.terracotta}}>console</span>.log(hello, mood);</CodeLine>
      <CodeLine number="04" progress={lineProgress}> </CodeLine>
      <div style={{marginTop: 22, paddingTop: 18, borderTop: `2px dashed rgba(22,33,43,0.26)`, color: COLORS.mutedInk, fontFamily: fontStack, fontSize: 20, fontWeight: 700, transform: 'rotate(-1deg)'}}>
        {modified ? 'You changed the file. Git has noticed.' : 'A committed file is a calm file.'}
      </div>
    </div>
  );
};

const CommandChip: React.FC<{children: React.ReactNode; progress: number; tone?: string}> = ({children, progress, tone = COLORS.ink}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', padding: '12px 15px', opacity: progress, transform: `translateY(${(1 - progress) * 12}px) rotate(-1deg)`, backgroundColor: tone, color: COLORS.white, border: `3px solid ${COLORS.ink}`, boxShadow: '4px 4px 0 rgba(22,33,43,0.18)', fontFamily: 'Consolas, monospace', fontSize: 22, fontWeight: 800}}>{children}</div>
);

const SidePanel: React.FC<{frame: number; beat: GitBeat}> = ({frame, beat}) => {
  const progress = easeOut(reveal(frame, 32, 62));
  const local = frame - beat.startFrame;
  if (beat.action === 'hook') {
    return <div style={{flex: '1 1 39%', padding: 34, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
      <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: 2, color: COLORS.terracotta}}>A BETTER MENTAL MODEL</div>
      <div style={{fontFamily: fontStack, fontSize: 38, lineHeight: 1.03, fontWeight: 900}}>Save points you can name.</div>
      <CommandChip progress={progress} tone={COLORS.terracotta}>git commit</CommandChip>
    </div>;
  }
  if (beat.action === 'stage') {
    return <div style={{flex: '1 1 39%', padding: 34, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16}}>
      <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: 2, color: COLORS.teal}}>THE STAGING AREA</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 11}}>
        {['app.js', 'README.md'].map((file, index) => {
          const item = easeOut(reveal(local, 26 + index * 12, 52 + index * 12));
          const selected = index === 0;
          return <div key={file} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: item, padding: '10px 12px', border: `2px solid ${COLORS.ink}`, backgroundColor: selected ? '#f5d9c2' : COLORS.cream, fontFamily: 'Consolas, monospace', fontSize: 17}}>
            <span style={{width: 19, height: 19, border: `2px solid ${COLORS.ink}`, backgroundColor: selected ? COLORS.terracotta : COLORS.white, color: COLORS.white, fontSize: 14, lineHeight: '15px', textAlign: 'center'}}>{selected ? '✓' : ''}</span>
            {file}
          </div>;
        })}
      </div>
      <CommandChip progress={progress} tone={COLORS.teal}>git add app.js</CommandChip>
    </div>;
  }
  if (beat.action === 'commit') {
    const stamp = easeOut(reveal(local, 54, 88));
    return <div style={{flex: '1 1 39%', padding: 34, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16}}>
      <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: 2, color: COLORS.terracotta}}>A NAMED SAVE POINT</div>
      <CommandChip progress={progress} tone={COLORS.terracotta}>git commit -m &quot;first hello&quot;</CommandChip>
      <div style={{alignSelf: 'center', opacity: stamp, transform: `rotate(-8deg) scale(${0.78 + stamp * 0.22})`, padding: '14px 16px', border: `5px solid ${COLORS.terracotta}`, color: COLORS.terracotta, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 22, fontWeight: 900, letterSpacing: 1.5}}>COMMIT 01<br /><span style={{fontSize: 14}}>sealed + labeled</span></div>
    </div>;
  }
  if (beat.action === 'status') {
    return <div style={{flex: '1 1 39%', padding: 34, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 15}}>
      <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: 2, color: COLORS.teal}}>ASK GIT WHAT IT SEES</div>
      <div style={{padding: 18, backgroundColor: COLORS.ink, color: COLORS.white, border: `3px solid ${COLORS.ink}`, fontFamily: 'Consolas, monospace', fontSize: 17, lineHeight: 1.55, opacity: progress}}>
        <div style={{color: '#c9ddbd'}}>$ git status</div>
        <div style={{marginTop: 8}}>On branch main</div>
        <div style={{color: COLORS.yellow}}>working tree clean</div>
      </div>
    </div>;
  }
  if (beat.action === 'recap') {
    return <div style={{flex: '1 1 39%', padding: 34, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10}}>
      {[
        ['EDIT', 'change the file', COLORS.terracotta],
        ['ADD', 'choose the change', COLORS.teal],
        ['COMMIT', 'name the save point', COLORS.saffron],
      ].map(([verb, description, color], index) => {
        const item = easeOut(reveal(local, 14 + index * 16, 38 + index * 16));
        return <div key={verb} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: item, transform: `translateX(${(1 - item) * 18}px)`}}>
          <div style={{minWidth: 126, padding: '10px 12px', backgroundColor: color, border: `3px solid ${COLORS.ink}`, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 18, fontWeight: 900, textAlign: 'center'}}>{verb}</div>
          <div style={{fontFamily: fontStack, fontSize: 19, fontWeight: 800}}>{description}</div>
        </div>;
      })}
    </div>;
  }
  return <div style={{flex: '1 1 39%', padding: 34, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18}}>
    <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: 2, color: COLORS.teal}}>THE PROMISE</div>
    <div style={{fontFamily: fontStack, fontSize: 38, lineHeight: 1.03, fontWeight: 900}}>Messy edits are okay.</div>
    <div style={{fontFamily: 'Consolas, monospace', fontSize: 19, color: COLORS.mutedInk}}>{'// because you can always commit the good part'}</div>
  </div>;
};

const LessonBoard: React.FC<{beat: GitBeat; frame: number}> = ({beat, frame}) => (
  <div
    style={{
      position: 'absolute',
      left: 350,
      top: 330,
      width: 1220,
      height: 566,
      zIndex: 4,
      overflow: 'hidden',
      backgroundColor: COLORS.white,
      border: `5px solid ${COLORS.ink}`,
      borderRadius: 18,
      boxShadow: '13px 15px 0 rgba(22,33,43,0.16)',
      transform: 'rotate(-0.35deg)',
    }}
  >
    <WindowChrome frame={frame - beat.startFrame} />
    <div style={{display: 'flex', height: 'calc(100% - 68px)'}}>
      <CodePane frame={frame - beat.startFrame} action={beat.action} />
      <SidePanel frame={frame - beat.startFrame} beat={beat} />
    </div>
  </div>
);

const Background: React.FC<{frame: number; beat: GitBeat}> = ({frame, beat}) => {
  const ink = easeOut(reveal(frame, 0, 24));
  const section = GIT_BASICS_BEATS.findIndex(({id}) => id === beat.id) + 1;
  return (
    <AbsoluteFill style={{backgroundColor: COLORS.paper, color: COLORS.ink, fontFamily: fontStack, overflow: 'hidden', backgroundImage: ['radial-gradient(circle at 15% 19%, rgba(201,87,62,0.10) 0 2px, transparent 3px)', 'radial-gradient(circle at 87% 79%, rgba(21,127,128,0.09) 0 1px, transparent 2px)', 'repeating-linear-gradient(0deg, rgba(22,33,43,0.022) 0 1px, transparent 1px 7px)'].join(',')}}>
      <div style={{position: 'absolute', inset: 26, border: `2px dashed rgba(22,33,43,0.18)`, opacity: ink, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 70, top: 45, display: 'flex', alignItems: 'center', gap: 13, opacity: ink}}>
        <div style={{padding: '8px 10px 7px', border: `3px solid ${COLORS.ink}`, backgroundColor: COLORS.terracotta, color: COLORS.white, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 15, fontWeight: 900, letterSpacing: 2}}>GIT</div>
        <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 15, fontWeight: 900, letterSpacing: 2}}>FIELD NOTES / FIRST COMMIT</div>
      </div>
      <div style={{position: 'absolute', right: 70, top: 49, color: COLORS.mutedInk, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 14, fontWeight: 900, letterSpacing: 2, opacity: ink}}>LESSON {String(section).padStart(2, '0')} / 08</div>
      <div style={{position: 'absolute', left: 72, top: 132, opacity: ink}}>
        <div style={{fontFamily: 'Trebuchet MS, Arial, sans-serif', color: COLORS.terracotta, fontSize: 16, fontWeight: 900, letterSpacing: 3}}>VERSION CONTROL WITHOUT THE MYSTIQUE</div>
        <div style={{marginTop: 8, fontSize: 48, lineHeight: 0.98, fontWeight: 900, letterSpacing: -1}}>Your first save point.</div>
      </div>
      <div style={{position: 'absolute', right: 76, top: 142, width: 180, height: 80, borderTop: `3px solid ${COLORS.teal}`, borderBottom: `3px solid ${COLORS.teal}`, transform: 'rotate(4deg)', opacity: ink * 0.7}}>
        <div style={{paddingTop: 14, color: COLORS.teal, fontFamily: 'Consolas, monospace', fontSize: 14, lineHeight: 1.5}}>no graphs.<br />just good saves.</div>
      </div>
      <div style={{position: 'absolute', left: 72, bottom: 31, color: COLORS.mutedInk, fontFamily: 'Trebuchet MS, Arial, sans-serif', fontSize: 13, fontWeight: 900, letterSpacing: 1.5, opacity: ink}}>EDIT / STAGE / COMMIT / CHECK</div>
      <div style={{position: 'absolute', right: 70, bottom: 30, color: COLORS.mutedInk, fontFamily: 'Consolas, monospace', fontSize: 13, opacity: ink}}>30 FPS / 40 SEC</div>
    </AbsoluteFill>
  );
};

export const GitBasics: React.FC<GitBasicsProps> = () => {
  const frame = useCurrentFrame();
  const beat = gitBeatAt(frame);
  return (
    <AbsoluteFill>
      <Background frame={frame} beat={beat} />
      <LessonBoard beat={beat} frame={frame} />
      <SpeechBubble beat={beat} frame={frame} />
      <CharacterCutout kind="hero" frame={frame} beat={beat} />
      <CharacterCutout kind="sidekick" frame={frame} beat={beat} />
    </AbsoluteFill>
  );
};
