import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {COLORS, fontStack, utilityFontStack} from '../components/theme';

export type RichExplainGitBasicsProps = {
  includeAudio?: boolean;
};

const FPS = 30;
const ART = 'assets/generated-explain/git-save-lab.png';

type Chapter = {
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  caption: string;
  accent: string;
};

const chapters: Chapter[] = [
  {
    start: 0,
    end: 120,
    eyebrow: 'THE BIG IDEA',
    title: 'Git is a save-point machine.',
    caption: 'Why Git? It stops final_final_v7 chaos.',
    accent: COLORS.terracotta,
  },
  {
    start: 120,
    end: 270,
    eyebrow: '01 / START THE HISTORY',
    title: 'Turn a folder into a repository.',
    caption: 'git init creates the hidden history store.',
    accent: COLORS.teal,
  },
  {
    start: 270,
    end: 450,
    eyebrow: '02 / MAKE A CHECKPOINT',
    title: 'Choose the change. Name the save.',
    caption: 'git add stages it; git commit saves it.',
    accent: COLORS.terracotta,
  },
  {
    start: 450,
    end: 600,
    eyebrow: '03 / EXPERIMENT SAFELY',
    title: 'Branches protect main.',
    caption: 'So you can break things professionally.',
    accent: COLORS.yellow,
  },
  {
    start: 600,
    end: 750,
    eyebrow: '04 / SHARE THE HISTORY',
    title: 'Push up. Pull down.',
    caption: 'GitHub is the remote copy your team can share.',
    accent: COLORS.teal,
  },
  {
    start: 750,
    end: 900,
    eyebrow: 'THE TINY RECIPE',
    title: 'Edit. Add. Commit. Branch. Push.',
    caption: 'Git remembers the good parts — and the mistakes.',
    accent: COLORS.saffron,
  },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

const currentChapter = (frame: number) =>
  chapters.find((chapter) => frame >= chapter.start && frame < chapter.end) ?? chapters[chapters.length - 1];

const chapterLocal = (frame: number, chapter: Chapter) => frame - chapter.start;

const ChapterHeader: React.FC<{chapter: Chapter; frame: number}> = ({chapter, frame}) => {
  const local = chapterLocal(frame, chapter);
  const entry = ease(reveal(local, 0, 20));
  return (
    <div
      style={{
        position: 'absolute',
        left: 78,
        top: 58,
        zIndex: 10,
        maxWidth: 760,
        opacity: entry,
        translate: `0 ${((1 - entry) * 22).toFixed(2)}px`,
      }}
    >
      <div style={{color: chapter.accent, fontFamily: utilityFontStack, fontSize: 17, fontWeight: 900, letterSpacing: 3}}>{chapter.eyebrow}</div>
      <div style={{marginTop: 11, color: COLORS.ink, fontFamily: fontStack, fontSize: 56, lineHeight: 0.98, fontWeight: 900, letterSpacing: -1.2}}>{chapter.title}</div>
    </div>
  );
};

const CaptionBar: React.FC<{chapter: Chapter; frame: number}> = ({chapter, frame}) => {
  const local = chapterLocal(frame, chapter);
  const entry = ease(reveal(local, 12, 28));
  return (
    <div
      style={{
        position: 'absolute',
        left: 78,
        right: 78,
        bottom: 42,
        zIndex: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '17px 23px 18px',
        opacity: entry,
        translate: `0 ${((1 - entry) * 14).toFixed(2)}px`,
        background: 'rgba(22,33,43,0.94)',
        border: `3px solid ${COLORS.ink}`,
        boxShadow: '8px 8px 0 rgba(22,33,43,0.18)',
        color: COLORS.white,
        fontFamily: fontStack,
        fontSize: 28,
        lineHeight: 1.08,
        fontWeight: 800,
      }}
    >
      <span style={{width: 13, height: 48, flex: '0 0 auto', background: chapter.accent, display: 'block'}} />
      <span>{chapter.caption}</span>
    </div>
  );
};

const CommandPill: React.FC<{label: string; frame: number; start: number; accent: string}> = ({label, frame, start, accent}) => {
  const progress = ease(reveal(frame, start, start + 18));
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '13px 18px 12px',
        opacity: progress,
        translate: `0 ${((1 - progress) * 16).toFixed(2)}px`,
        rotate: '-1deg',
        background: accent,
        border: `3px solid ${COLORS.ink}`,
        boxShadow: '5px 5px 0 rgba(22,33,43,0.2)',
        color: COLORS.ink,
        fontFamily: 'Consolas, monospace',
        fontSize: 25,
        fontWeight: 900,
      }}
    >
      {label}
    </div>
  );
};

const HookVisual: React.FC<{frame: number; chapter: Chapter}> = ({frame, chapter}) => {
  const local = chapterLocal(frame, chapter);
  const stamp = ease(reveal(local, 40, 66));
  const files = ease(reveal(local, 17, 38));
  return (
    <div style={{position: 'absolute', left: 78, top: 300, zIndex: 8, display: 'flex', alignItems: 'center', gap: 25}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8, opacity: files, translate: `0 ${((1 - files) * 18).toFixed(2)}px`}}>
        {['final_v5', 'final_v6', 'final_v7?'].map((file, index) => (
          <div key={file} style={{padding: '10px 15px', background: index === 2 ? '#f5d9c2' : 'rgba(255,253,247,0.92)', border: `2px solid ${COLORS.ink}`, color: COLORS.ink, fontFamily: 'Consolas, monospace', fontSize: 19, textDecoration: index === 2 ? 'none' : 'line-through'}}>{file}.js</div>
        ))}
      </div>
      <div style={{fontFamily: utilityFontStack, color: chapter.accent, fontSize: 48, fontWeight: 900, opacity: files}}>→</div>
      <div style={{padding: 18, opacity: stamp, scale: `${0.82 + stamp * 0.18}`, rotate: '-7deg', border: `5px solid ${chapter.accent}`, color: chapter.accent, fontFamily: utilityFontStack, fontSize: 24, fontWeight: 900, letterSpacing: 1.5, textAlign: 'center', background: 'rgba(255,253,247,0.86)'}}>SAFE<br /><span style={{fontSize: 16}}>SAVE POINT</span></div>
    </div>
  );
};

const InitVisual: React.FC<{frame: number; chapter: Chapter}> = ({frame, chapter}) => {
  const local = chapterLocal(frame, chapter);
  const folder = ease(reveal(local, 20, 40));
  const repo = ease(reveal(local, 52, 76));
  return (
    <div style={{position: 'absolute', left: 88, top: 300, zIndex: 8, display: 'flex', alignItems: 'center', gap: 28}}>
      <div style={{width: 230, padding: 18, opacity: folder, translate: `0 ${((1 - folder) * 20).toFixed(2)}px`, background: 'rgba(255,253,247,0.94)', border: `3px solid ${COLORS.ink}`, boxShadow: '6px 6px 0 rgba(22,33,43,0.16)'}}>
        <div style={{fontFamily: utilityFontStack, color: COLORS.mutedInk, fontSize: 14, fontWeight: 900, letterSpacing: 2}}>WORKING FOLDER</div>
        <div style={{marginTop: 15, display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'Consolas, monospace', fontSize: 17}}><span>src/</span><span>app.js</span><span>README.md</span></div>
      </div>
      <div style={{color: chapter.accent, fontSize: 46, fontWeight: 900, opacity: repo}}>→</div>
      <div style={{width: 250, padding: 18, opacity: repo, scale: `${0.86 + repo * 0.14}`, background: COLORS.ink, border: `3px solid ${COLORS.ink}`, color: COLORS.white, boxShadow: '8px 8px 0 rgba(22,33,43,0.22)'}}>
        <div style={{fontFamily: utilityFontStack, color: chapter.accent, fontSize: 14, fontWeight: 900, letterSpacing: 2}}>.GIT / HISTORY</div>
        <div style={{marginTop: 18, fontFamily: 'Consolas, monospace', fontSize: 18, lineHeight: 1.55}}>tracked files<br />named checkpoints<br />a way back</div>
      </div>
      <CommandPill label="git init" frame={local} start={76} accent={chapter.accent} />
    </div>
  );
};

const CheckpointVisual: React.FC<{frame: number; chapter: Chapter}> = ({frame, chapter}) => {
  const local = chapterLocal(frame, chapter);
  const code = ease(reveal(local, 18, 38));
  const add = ease(reveal(local, 52, 70));
  const commit = ease(reveal(local, 84, 108));
  return (
    <div style={{position: 'absolute', left: 78, top: 286, zIndex: 8, display: 'flex', alignItems: 'center', gap: 22}}>
      <div style={{width: 410, padding: '18px 22px 20px', opacity: code, translate: `0 ${((1 - code) * 18).toFixed(2)}px`, background: 'rgba(22,33,43,0.96)', border: `3px solid ${COLORS.ink}`, boxShadow: '7px 7px 0 rgba(22,33,43,0.2)', fontFamily: 'Consolas, monospace', fontSize: 18, lineHeight: 1.6, color: COLORS.white}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: COLORS.yellow, fontFamily: utilityFontStack, fontSize: 13, fontWeight: 900, letterSpacing: 2}}><span>APP.JS</span><span>MODIFIED</span></div>
        <div><span style={{color: COLORS.mutedInk}}>01  </span><span style={{color: COLORS.terracotta}}>const</span> hello = <span style={{color: '#c9ddbd'}}>&quot;world&quot;</span>;</div>
        <div style={{paddingLeft: 38, borderLeft: `5px solid ${COLORS.terracotta}`, color: COLORS.yellow}}>console.log(hello);</div>
        <div><span style={{color: COLORS.mutedInk}}>03  </span><span style={{color: COLORS.terracotta}}>const</span> mood = <span style={{color: '#c9ddbd'}}>&quot;curious&quot;</span>;</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
        <CommandPill label="git add app.js" frame={local} start={52} accent={COLORS.teal} />
        <CommandPill label={'git commit -m "first hello"'} frame={local} start={84} accent={COLORS.terracotta} />
        <div style={{alignSelf: 'center', opacity: commit, scale: `${0.78 + commit * 0.22}`, rotate: '5deg', padding: '13px 16px', border: `5px solid ${COLORS.terracotta}`, background: 'rgba(255,253,247,0.9)', color: COLORS.terracotta, fontFamily: utilityFontStack, fontSize: 18, fontWeight: 900, textAlign: 'center'}}>COMMIT<br /><span style={{fontSize: 12}}>sealed + labeled</span></div>
      </div>
    </div>
  );
};

const BranchVisual: React.FC<{frame: number; chapter: Chapter}> = ({frame, chapter}) => {
  const local = chapterLocal(frame, chapter);
  const draw = ease(reveal(local, 18, 68));
  const active = ease(reveal(local, 70, 100));
  return (
    <div style={{position: 'absolute', left: 92, right: 92, top: 300, zIndex: 8, padding: 20, background: 'rgba(255,253,247,0.72)', border: `3px solid ${COLORS.ink}`, boxShadow: '7px 7px 0 rgba(22,33,43,0.16)'}}>
      <svg viewBox="0 0 1000 230" width="100%" height="230" role="img" aria-label="A main branch and a feature branch">
        <path d="M 55 82 H 930" fill="none" stroke={COLORS.ink} strokeWidth="7" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - draw} />
        <path d="M 245 82 C 315 82, 340 164, 430 164 H 820" fill="none" stroke={chapter.accent} strokeWidth="8" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - active} />
        {[130, 245, 560, 790, 930].map((x) => <circle key={`main-${x}`} cx={x} cy="82" r="13" fill={COLORS.ink} opacity={draw} />)}
        {[430, 610, 820].map((x) => <circle key={`feature-${x}`} cx={x} cy="164" r="13" fill={chapter.accent} opacity={active} />)}
        <text x="70" y="53" fill={COLORS.ink} style={{fontFamily: utilityFontStack, fontSize: 18, fontWeight: 900, letterSpacing: 2}}>MAIN</text>
        <text x="470" y="211" fill={chapter.accent} style={{fontFamily: utilityFontStack, fontSize: 18, fontWeight: 900, letterSpacing: 2}}>FEATURE / SAFE TO EXPERIMENT</text>
        <circle cx={active ? 430 + Math.min(1, Math.max(0, (local - 70) / 70)) * 390 : 245} cy={active ? 164 : 82} r="10" fill={COLORS.yellow} opacity={Math.max(draw, active)} />
      </svg>
    </div>
  );
};

const RemoteVisual: React.FC<{frame: number; chapter: Chapter}> = ({frame, chapter}) => {
  const local = chapterLocal(frame, chapter);
  const entry = ease(reveal(local, 20, 42));
  const move = ease(reveal(local, 58, 104));
  return (
    <div style={{position: 'absolute', left: 160, right: 160, top: 314, zIndex: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32}}>
      <div style={{width: 265, padding: 20, opacity: entry, translate: `0 ${((1 - entry) * 18).toFixed(2)}px`, background: COLORS.ink, color: COLORS.white, border: `3px solid ${COLORS.ink}`, boxShadow: '7px 7px 0 rgba(22,33,43,0.18)'}}><div style={{color: chapter.accent, fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900, letterSpacing: 2}}>YOUR MACHINE</div><div style={{marginTop: 13, fontFamily: 'Consolas, monospace', fontSize: 18, lineHeight: 1.5}}>local repo<br />commits ready<br />to share</div></div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: move}}><div style={{fontFamily: 'Consolas, monospace', fontSize: 19, fontWeight: 900, color: COLORS.ink}}>git push →</div><div style={{fontFamily: 'Consolas, monospace', fontSize: 19, fontWeight: 900, color: COLORS.ink}}>← git pull</div><div style={{width: 155, height: 5, background: chapter.accent, position: 'relative'}}><span style={{position: 'absolute', left: `${move * 110}px`, top: -7, width: 18, height: 18, borderRadius: '50%', background: COLORS.yellow, border: `3px solid ${COLORS.ink}`}} /></div></div>
      <div style={{width: 265, padding: 20, opacity: entry, translate: `0 ${((1 - entry) * -18).toFixed(2)}px`, background: 'rgba(255,253,247,0.96)', color: COLORS.ink, border: `3px solid ${COLORS.ink}`, boxShadow: '7px 7px 0 rgba(22,33,43,0.18)'}}><div style={{color: chapter.accent, fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900, letterSpacing: 2}}>SHARED REMOTE</div><div style={{marginTop: 13, fontFamily: 'Consolas, monospace', fontSize: 18, lineHeight: 1.5}}>GitHub copy<br />same history<br />new teammates</div></div>
    </div>
  );
};

const RecapVisual: React.FC<{frame: number; chapter: Chapter}> = ({frame, chapter}) => {
  const local = chapterLocal(frame, chapter);
  const steps = [['EDIT', 'change the file', COLORS.terracotta], ['ADD', 'choose the change', COLORS.teal], ['COMMIT', 'name the save', COLORS.saffron], ['BRANCH', 'experiment safely', COLORS.yellow], ['PUSH', 'share the history', COLORS.teal]];
  return (
    <div style={{position: 'absolute', left: 78, right: 78, top: 286, zIndex: 8, display: 'flex', gap: 10}}>
      {steps.map(([label, detail, accent], index) => {
        const item = ease(reveal(local, 15 + index * 10, 34 + index * 10));
        return <div key={label} style={{flex: 1, minWidth: 0, opacity: item, translate: `0 ${((1 - item) * 22).toFixed(2)}px`, padding: '15px 13px 17px', background: index === 2 ? COLORS.ink : 'rgba(255,253,247,0.92)', color: index === 2 ? COLORS.white : COLORS.ink, border: `3px solid ${COLORS.ink}`, boxShadow: index === 2 ? '7px 7px 0 rgba(22,33,43,0.2)' : '4px 4px 0 rgba(22,33,43,0.12)'}}><div style={{color: index === 2 ? COLORS.yellow : accent, fontFamily: utilityFontStack, fontSize: 17, fontWeight: 900, letterSpacing: 1.6}}>{label}</div><div style={{marginTop: 12, fontFamily: fontStack, fontSize: 18, lineHeight: 1.08, fontWeight: 800}}>{detail}</div></div>;
      })}
    </div>
  );
};

export const RichExplainGitBasics: React.FC<RichExplainGitBasicsProps> = ({includeAudio = true}) => {
  const frame = useCurrentFrame();
  const chapter = currentChapter(frame);
  const local = chapterLocal(frame, chapter);
  const artProgress = frame / (chapters[chapters.length - 1].end - 1);
  const sectionNumber = chapters.indexOf(chapter) + 1;
  const previous = frame > chapter.start + 1 ? reveal(local, 0, 16) : 1;
  const artScale = 1.045 + artProgress * 0.055;

  return (
    <AbsoluteFill style={{background: '#e8dbc6', color: COLORS.ink, fontFamily: fontStack, overflow: 'hidden'}}>
      <Img src={staticFile(ART)} style={{position: 'absolute', inset: -32, width: 'calc(100% + 64px)', height: 'calc(100% + 64px)', objectFit: 'cover', scale: artScale, translate: `${((artProgress - 0.5) * -20).toFixed(2)}px ${((artProgress - 0.5) * 12).toFixed(2)}px`, opacity: previous}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,253,247,0.18) 0%, rgba(255,253,247,0.03) 42%, rgba(22,33,43,0.12) 100%)'}} />
      <div style={{position: 'absolute', left: 78, right: 78, top: 28, zIndex: 11, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: COLORS.ink, fontFamily: utilityFontStack, fontSize: 13, fontWeight: 900, letterSpacing: 2.2}}>
        <span style={{padding: '8px 11px 7px', background: COLORS.terracotta, border: `3px solid ${COLORS.ink}`, color: COLORS.white}}>SINEMA / EXPLAINER PILOT</span>
        <span>GIT · {String(sectionNumber).padStart(2, '0')} / 06 · 30 SEC</span>
      </div>
      <ChapterHeader chapter={chapter} frame={frame} />
      {chapter.start === 0 && <HookVisual frame={frame} chapter={chapter} />}
      {chapter.start === 120 && <InitVisual frame={frame} chapter={chapter} />}
      {chapter.start === 270 && <CheckpointVisual frame={frame} chapter={chapter} />}
      {chapter.start === 450 && <BranchVisual frame={frame} chapter={chapter} />}
      {chapter.start === 600 && <RemoteVisual frame={frame} chapter={chapter} />}
      {chapter.start === 750 && <RecapVisual frame={frame} chapter={chapter} />}
      <CaptionBar chapter={chapter} frame={frame} />
      <div style={{position: 'absolute', right: 78, top: 126, zIndex: 10, width: 90, height: 90, borderRadius: '50%', background: chapter.accent, border: `4px solid ${COLORS.ink}`, display: 'grid', placeItems: 'center', rotate: `${Math.sin(frame / 24) * 2}deg`, boxShadow: '6px 6px 0 rgba(22,33,43,0.18)', color: COLORS.ink, fontFamily: utilityFontStack, fontSize: 20, fontWeight: 900}}>{String(sectionNumber).padStart(2, '0')}</div>
      <div style={{position: 'absolute', left: 78, right: 78, bottom: 20, zIndex: 13, height: 3, background: 'rgba(22,33,43,0.22)'}}><div style={{height: '100%', width: `${((frame + 1) / 900) * 100}%`, background: COLORS.terracotta}} /></div>
      {includeAudio && <Audio src={staticFile('audio/videos/gitbasics/narration.wav')} volume={0.88} />}
    </AbsoluteFill>
  );
};
