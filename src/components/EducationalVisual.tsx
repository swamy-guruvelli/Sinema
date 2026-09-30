import React from 'react';
import {Img, interpolate, staticFile} from 'remotion';
import type {VideoScene, VideoVisual} from '../data/videoSpec';
import {COLORS, BOARD_STYLES, utilityFontStack} from './theme';
import {MindKraftStoryVisual} from './MindKraftStoryVisual';

type Palette = {ink: string; muted: string; accent: string};

const reveal = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const NodeBox: React.FC<{x: number; y: number; width: number; label: string; detail?: string; active?: boolean; palette: Palette}> = ({x, y, width, label, detail, active = false, palette}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect width={width} height="66" rx="3" fill={active ? palette.accent : 'transparent'} stroke={active ? palette.ink : palette.muted} strokeWidth="2" />
    <circle cx="16" cy="18" r="6" fill={active ? COLORS.white : palette.accent} />
    <text x="31" y="22" fill={active ? COLORS.white : palette.ink} style={{fontFamily: utilityFontStack, fontSize: 16, fontWeight: 900, letterSpacing: 1}}>{label.toUpperCase()}</text>
    {detail && <text x="16" y="48" fill={active ? COLORS.white : palette.muted} style={{fontFamily: utilityFontStack, fontSize: 12, fontWeight: 700}}>{detail}</text>}
  </g>
);

const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; label?: string; palette: Palette; markerId: string; active?: boolean}> = ({x1, y1, x2, y2, label, palette, markerId, active = false}) => (
  <g>
    <path d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`} fill="none" stroke={active ? palette.accent : palette.muted} strokeWidth={active ? 4 : 2} markerEnd={`url(#${markerId})`} />
    {label && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} fill={palette.accent} textAnchor="middle" style={{fontFamily: utilityFontStack, fontSize: 12, fontWeight: 900, letterSpacing: 1}}>{label.toUpperCase()}</text>}
  </g>
);

const CodebaseVisual: React.FC<{visual: VideoVisual; palette: Palette; dark: boolean; markerId: string}> = ({visual, palette, dark, markerId}) => {
  const files = visual.files ?? ['src/index.ts', 'src/app.ts', 'README.md'];
  const code = visual.code ?? ['const repo = open();', 'repo.track(changes);', 'repo.save(point);'];
  return (
    <>
      <rect x="28" y="48" width="320" height="208" rx="4" fill={dark ? 'rgba(3,12,18,0.9)' : 'rgba(255,253,247,0.94)'} stroke={palette.muted} strokeWidth="2" />
      <text x="48" y="77" fill={palette.accent} style={{fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900, letterSpacing: 2}}>CODEBASE</text>
      {files.map((file, index) => (
        <g key={file} transform={`translate(48 ${104 + index * 29})`}>
          <rect width="12" height="14" fill={palette.accent} opacity="0.9" />
          <path d="M 4 4 H 8 M 4 8 H 8" stroke={dark ? COLORS.ink : COLORS.white} strokeWidth="1.5" />
          <text x="23" y="12" fill={palette.ink} style={{fontFamily: 'Consolas, monospace', fontSize: 15}}>{file}</text>
        </g>
      ))}
      <Arrow x1={360} y1={151} x2={618} y2={151} label={visual.command ?? 'git init'} palette={palette} markerId={markerId} active />
      <NodeBox x={640} y={118} width={300} label="Git repository" detail="history + checkpoints" active palette={palette} />
      <rect x="386" y="190" width="218" height="66" rx="4" fill={dark ? 'rgba(3,12,18,0.9)' : 'rgba(255,253,247,0.94)'} stroke={palette.muted} strokeWidth="2" />
      {code.map((line, index) => <text key={line} x="402" y={212 + index * 17} fill={palette.ink} style={{fontFamily: 'Consolas, monospace', fontSize: 13}}>{line}</text>)}
    </>
  );
};

const FlowVisual: React.FC<{visual: VideoVisual; palette: Palette; beatIndex: number; frame: number; scene: VideoScene; markerId: string}> = ({visual, palette, beatIndex, frame, scene, markerId}) => {
  const nodes = visual.nodes ?? ['WORKING TREE', 'STAGE', 'COMMIT'];
  const width = Math.min(190, 820 / nodes.length);
  const gap = nodes.length === 1 ? 0 : (920 - width * nodes.length) / (nodes.length - 1);
  const startX = 40;
  const activeSegment = Math.min(beatIndex, Math.max(0, nodes.length - 2));
  const startBeat = scene.beats[beatIndex]?.frame ?? 0;
  const endBeat = scene.beats[beatIndex + 1]?.frame ?? scene.durationInFrames;
  const packetProgress = reveal(frame, startBeat, Math.max(startBeat + 1, endBeat));
  return (
    <>
      {nodes.map((node, index) => {
        const x = startX + index * (width + gap);
        return <React.Fragment key={node}>
          {index < nodes.length - 1 && <Arrow x1={x + width} y1={151} x2={x + width + gap} y2={151} palette={palette} markerId={markerId} active={index < beatIndex} />}
          <NodeBox x={x} y={118} width={width} label={node} detail={index === activeSegment ? 'current step' : 'next responsibility'} active={index === beatIndex || (beatIndex >= nodes.length - 1 && index === nodes.length - 1)} palette={palette} />
        </React.Fragment>;
      })}
      {nodes.length > 1 && <circle cx={startX + activeSegment * (width + gap) + width + gap * packetProgress} cy="151" r="7" fill={palette.accent} opacity="0.9" />}
    </>
  );
};

const BranchVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene; markerId: string}> = ({palette, frame, scene, markerId}) => {
  const mainProgress = reveal(frame, 0, 18);
  const branchProgress = reveal(frame, 24, 52);
  const active = scene.beats.findIndex((beat) => beat.frame <= frame) >= 1;
  return (
    <>
      <text x="58" y="65" fill={palette.accent} style={{fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900, letterSpacing: 2}}>MAIN / FEATURE</text>
      <path d="M 82 135 H 910" fill="none" stroke={palette.muted} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - mainProgress} markerEnd={`url(#${markerId})`} />
      <path d="M 300 135 C 365 135, 395 218, 480 218 H 760" fill="none" stroke={active ? palette.accent : palette.muted} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - branchProgress} markerEnd={`url(#${markerId})`} />
      {[180, 300, 610, 850].map((x) => <circle key={x} cx={x} cy="135" r="10" fill={palette.accent} />)}
      {[480, 620, 760].map((x) => <circle key={x} cx={x} cy="218" r="10" fill={active ? palette.accent : palette.muted} />)}
      <text x="96" y="112" fill={palette.ink} style={{fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900}}>main</text>
      <text x="486" y="250" fill={palette.accent} style={{fontFamily: utilityFontStack, fontSize: 14, fontWeight: 900}}>feature/login</text>
      <text x="348" y="164" fill={palette.accent} style={{fontFamily: utilityFontStack, fontSize: 12, fontWeight: 900}}>git switch -c</text>
      <circle cx={active ? 530 : 240} cy={active ? 218 : 135} r="7" fill={COLORS.white} stroke={palette.ink} strokeWidth="2" />
    </>
  );
};

const RemoteVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene; markerId: string}> = ({palette, frame, scene, markerId}) => {
  const progress = reveal(frame, scene.beats[0]?.frame ?? 0, scene.beats[1]?.frame ?? scene.durationInFrames);
  return (
    <>
      <NodeBox x={70} y={118} width={270} label="Local repo" detail="your working copy" active={scene.beats[0]?.speaker === 'skeptic'} palette={palette} />
      <NodeBox x={660} y={118} width={270} label="Origin / GitHub" detail="shared remote copy" active={scene.beats[1]?.speaker === 'narrator'} palette={palette} />
      <Arrow x1={350} y1={136} x2={650} y2={136} label="git push" palette={palette} markerId={markerId} active />
      <Arrow x1={650} y1={166} x2={350} y2={166} label="git pull" palette={palette} markerId={markerId} active />
      <circle cx={350 + 300 * progress} cy="136" r="7" fill={palette.accent} />
      <circle cx={650 - 300 * progress} cy="166" r="7" fill={palette.accent} opacity="0.8" />
    </>
  );
};

type MindKraftFlow = {
  eyebrow: string;
  headline: string;
  result: string;
  steps: Array<{label: string; detail: string}>;
};

const MINDKRAFT_FLOWS: Record<string, MindKraftFlow> = {
  problem: {
    eyebrow: 'THE STARTING POINT',
    headline: 'Bring the search into one place',
    result: 'One calmer workspace',
    steps: [
      {label: 'Roles', detail: 'matched to your goals'},
      {label: 'Applications', detail: 'tailored for each role'},
      {label: 'Next step', detail: 'visible, not forgotten'},
    ],
  },
  matching: {
    eyebrow: 'STEP ONE',
    headline: 'Tell MindKraft what you want',
    result: 'Less noise. Better fit.',
    steps: [
      {label: 'Your profile', detail: 'experience and goals'},
      {label: 'Preferences', detail: 'the role you want next'},
      {label: 'Roles that fit', detail: 'focused opportunities'},
    ],
  },
  application: {
    eyebrow: 'STEP TWO',
    headline: 'Make the application relevant',
    result: 'Tailored, not generic',
    steps: [
      {label: 'Choose a role', detail: 'start with the real brief'},
      {label: 'Tailor the CV', detail: 'highlight what matters'},
      {label: 'Get feedback', detail: 'keep every detail accurate'},
    ],
  },
  control: {
    eyebrow: 'STEP THREE',
    headline: 'Support without autopilot',
    result: 'You decide when it is ready',
    steps: [
      {label: 'Draft', detail: 'prepare the application'},
      {label: 'Review', detail: 'check every detail'},
      {label: 'Approve', detail: 'choose when to submit'},
    ],
  },
  tracking: {
    eyebrow: 'STEP FOUR',
    headline: 'Keep the whole journey visible',
    result: 'Less chasing. More clarity.',
    steps: [
      {label: 'Applied', detail: 'the role you sent'},
      {label: 'Status', detail: 'what changed'},
      {label: 'Next action', detail: 'what to do now'},
    ],
  },
  tips: {
    eyebrow: 'STEP FIVE',
    headline: 'Learn as you go',
    result: 'Practical help to keep moving',
    steps: [
      {label: 'Question', detail: 'where you feel stuck'},
      {label: 'Community tip', detail: 'lessons from job seekers'},
      {label: 'Next move', detail: 'put the idea to work'},
    ],
  },
  payoff: {
    eyebrow: 'THE PAYOFF',
    headline: 'Wake up to progress',
    result: 'A clearer next step',
    steps: [
      {label: 'Search', detail: 'stop starting from zero'},
      {label: 'Focus', detail: 'spend time where it matters'},
      {label: 'Progress', detail: 'keep control of the journey'},
    ],
  },
};

const MINDKRAFT_FLOW_NODES = [
  {x: 22, y: 16, label: 'YOUR GOAL', detail: 'tell MindKraft what matters'},
  {x: 64, y: 35, label: 'ROLE MATCHER', detail: 'focused opportunities'},
  {x: 22, y: 54, label: 'APPLICATION', detail: 'tailored, not generic'},
  {x: 64, y: 73, label: 'TRACKING', detail: 'know what changed'},
  {x: 50, y: 90, label: 'NEXT STEP', detail: 'you stay in control'},
];

const mindKraftBezier = (from: {x: number; y: number}, to: {x: number; y: number}, t: number) => {
  const c1 = {x: from.x, y: from.y + (to.y - from.y) * 0.55};
  const c2 = {x: to.x, y: to.y - (to.y - from.y) * 0.55};
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * from.x + 3 * inverse ** 2 * t * c1.x + 3 * inverse * t ** 2 * c2.x + t ** 3 * to.x,
    y: inverse ** 3 * from.y + 3 * inverse ** 2 * t * c1.y + 3 * inverse * t ** 2 * c2.y + t ** 3 * to.y,
  };
};

const MindKraftFlowVisual: React.FC<{visual: VideoVisual; palette: Palette; frame: number; scene: VideoScene}> = ({visual, palette, frame, scene}) => {
  const browser = visual.browser;
  const nodeShow = MINDKRAFT_FLOW_NODES.map((_, index) => reveal(frame, index * 38, index * 38 + 22));
  const segment = Math.min(MINDKRAFT_FLOW_NODES.length - 2, Math.floor(interpolate(frame, [72, scene.durationInFrames - 42], [0, MINDKRAFT_FLOW_NODES.length - 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const segmentStart = 72 + segment * ((scene.durationInFrames - 114) / (MINDKRAFT_FLOW_NODES.length - 1));
  const packetProgress = reveal(frame, segmentStart, segmentStart + 62);
  const packet = mindKraftBezier(MINDKRAFT_FLOW_NODES[segment], MINDKRAFT_FLOW_NODES[segment + 1], packetProgress);
  const activeLabel = ['Collect the signal', 'Find the better fit', 'Shape the application', 'Keep the journey visible'][segment];
  return (
    <div style={{position: 'absolute', inset: 0, padding: '5% 6%', boxSizing: 'border-box', background: '#fffdf7', color: '#16212b', fontFamily: utilityFontStack}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: palette.accent, fontSize: 16, fontWeight: 900, letterSpacing: 2}}>
        <span>THE MINDKRAFT FLOW</span>
        <span style={{fontFamily: 'Consolas, monospace', fontSize: 14, opacity: 0.78}}>{browser?.path ?? 'mindkraft.co.uk'}</span>
      </div>
      <div style={{marginTop: 12, fontSize: 30, lineHeight: 1.05, fontWeight: 900}}>From scattered effort to a clearer next step</div>
      <div style={{position: 'absolute', left: '6%', right: '6%', top: '17%', bottom: '4%'}}>
        <svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {MINDKRAFT_FLOW_NODES.slice(0, -1).map((node, index) => {
            const next = MINDKRAFT_FLOW_NODES[index + 1];
            const from = {x: node.x, y: node.y + 7};
            const to = {x: next.x, y: next.y - 7};
            const c1 = {x: from.x, y: from.y + (to.y - from.y) * 0.55};
            const c2 = {x: to.x, y: to.y - (to.y - from.y) * 0.55};
            const active = index <= segment;
            return <path key={node.label} d={`M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`} fill="none" stroke={active ? palette.accent : '#b6bec2'} strokeWidth={active ? 1.3 : 0.8} strokeDasharray={active ? undefined : '2 2'} opacity={active ? 1 : 0.62} />;
          })}
          <circle cx={packet.x} cy={packet.y} r="1.7" fill={palette.accent} opacity={0.95} />
          <circle cx={packet.x} cy={packet.y} r="3.4" fill="none" stroke={palette.accent} strokeWidth="0.7" opacity="0.35" />
        </svg>
        {MINDKRAFT_FLOW_NODES.map((node, index) => {
          const active = index === segment || (segment === MINDKRAFT_FLOW_NODES.length - 2 && index === MINDKRAFT_FLOW_NODES.length - 1);
          return <div key={node.label} style={{position: 'absolute', left: `${node.x}%`, top: `${node.y}%`, width: '34%', minHeight: 78, padding: '13px 16px', boxSizing: 'border-box', borderRadius: 10, border: `2px solid ${active ? palette.accent : '#aab3b7'}`, background: active ? palette.accent : '#eef1f2', boxShadow: active ? '0 8px 0 rgba(22,33,43,0.12)' : 'none', opacity: nodeShow[index], scale: `${0.92 + nodeShow[index] * 0.08}`, translate: '-50% -50%', transformOrigin: 'center center', color: '#16212b'}}>
            <div style={{fontSize: 12, fontWeight: 900, letterSpacing: 1.2, opacity: 0.62}}>0{index + 1}</div>
            <div style={{marginTop: 6, fontSize: 17, lineHeight: 1.05, fontWeight: 900}}>{node.label}</div>
            <div style={{marginTop: 5, fontSize: 13, lineHeight: 1.1, fontWeight: 700, opacity: 0.72}}>{node.detail}</div>
          </div>;
        })}
        <div style={{position: 'absolute', left: '50%', bottom: '-1%', translate: '-50% 0', padding: '9px 16px', borderRadius: 999, background: '#16212b', color: COLORS.white, fontSize: 14, fontWeight: 900, whiteSpace: 'nowrap'}}>{activeLabel}</div>
      </div>
    </div>
  );
};

const MindKraftBlocksVisual: React.FC<{visual: VideoVisual; palette: Palette; frame: number; scene: VideoScene; beatIndex: number}> = ({visual, palette, frame, scene, beatIndex}) => {
  const browser = visual.browser;
  const flow = MINDKRAFT_FLOWS[browser?.flow ?? 'problem'] ?? MINDKRAFT_FLOWS.problem;
  const blockInk = '#16212b';
  const blockMuted = '#5a6570';
  const activeIndex = Math.min(beatIndex, flow.steps.length - 1);
  const centers = [20, 50, 80];
  const startFrame = scene.beats[activeIndex]?.frame ?? 0;
  const fromX = centers[Math.max(0, activeIndex - 1)];
  const cursorX = interpolate(frame, [startFrame, startFrame + 24], [fromX, centers[activeIndex]], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pulse = 1 + Math.sin(Math.max(0, frame - startFrame) / 6) * 0.025;
  const show = (index: number) => reveal(frame, index * 10, index * 10 + 18);
  return (
    <div style={{position: 'absolute', inset: 0, padding: '3.5% 4%', boxSizing: 'border-box', background: 'rgba(255,253,247,0.96)', color: blockInk, fontFamily: utilityFontStack}}>
      <div style={{height: '10%', display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', boxSizing: 'border-box', background: '#16212b', color: COLORS.white, borderRadius: 10}}>
        <span style={{color: palette.accent, fontSize: 24}}>●</span>
        <span style={{fontFamily: 'Consolas, monospace', fontSize: 20}}>{browser?.path ?? 'mindkraft.co.uk'}</span>
        <span style={{marginLeft: 'auto', fontSize: 16, opacity: 0.7}}>MINDKRAFT WORKSPACE</span>
      </div>
      <div style={{marginTop: '5%', color: palette.accent, fontSize: 18, fontWeight: 900, letterSpacing: 2}}>{flow.eyebrow}</div>
      <div style={{marginTop: 10, fontSize: 34, lineHeight: 1.05, fontWeight: 900}}>{flow.headline}</div>
      <div style={{position: 'relative', height: '43%', marginTop: '6%', display: 'flex', gap: '3%', alignItems: 'stretch'}}>
        {flow.steps.map((step, index) => {
          const active = index === activeIndex;
          const cardShow = show(index);
          return <React.Fragment key={step.label}>
            <div style={{flex: 1, minWidth: 0, opacity: cardShow, transform: `translateY(${(1 - cardShow) * 22}px) scale(${active ? pulse : 1})`, transformOrigin: 'center bottom', padding: 22, boxSizing: 'border-box', borderRadius: 12, border: `3px solid ${active ? palette.accent : '#9aa3a9'}`, background: active ? palette.accent : '#eef1f2', color: blockInk, boxShadow: active ? '0 10px 0 rgba(22,33,43,0.12)' : 'none'}}>
              <div style={{fontSize: 18, fontWeight: 900, opacity: 0.7}}>0{index + 1}</div>
              <div style={{marginTop: 22, fontSize: 28, lineHeight: 1.05, fontWeight: 900}}>{step.label}</div>
              <div style={{marginTop: 14, fontSize: 18, lineHeight: 1.2, fontWeight: 700, opacity: 0.75}}>{step.detail}</div>
            </div>
            {index < flow.steps.length - 1 && <div style={{position: 'absolute', left: `${31 + index * 34}%`, top: '45%', color: palette.accent, fontSize: 36, fontWeight: 900, zIndex: 2}}>→</div>}
          </React.Fragment>;
        })}
        <div style={{position: 'absolute', left: `${cursorX}%`, top: '42%', width: 40, height: 48, zIndex: 5, pointerEvents: 'none', transform: 'translate(-8px, -4px) rotate(-12deg)', scale: `${pulse}`}}>
          <svg viewBox="0 0 40 48" width="40" height="48"><path d="M4 3 L35 29 L22 30 L17 45 Z" fill={palette.ink} stroke={COLORS.white} strokeWidth="2" /></svg>
          <div style={{position: 'absolute', left: 24, top: 32, padding: '4px 8px', borderRadius: 8, background: palette.ink, color: COLORS.white, fontSize: 12, fontWeight: 900}}>click</div>
        </div>
      </div>
      <div style={{marginTop: '5%', padding: '18px 22px', borderLeft: `8px solid ${palette.accent}`, background: '#16212b', color: COLORS.white, borderRadius: 8, fontSize: 24, fontWeight: 900}}>{flow.result}</div>
      <div style={{marginTop: 16, fontSize: 16, color: blockMuted, fontWeight: 700}}>One visible step at a time.</div>
    </div>
  );
};

const BrowserVisual: React.FC<{visual: VideoVisual; palette: Palette; frame: number; scene: VideoScene; markerId: string}> = ({visual, palette, frame, scene, markerId}) => {
  const browser = visual.browser ?? {path: 'aws.amazon.com/getting-started', excerpt: visual.label, analogy: visual.caption ?? 'A simple cloud building block.', action: 'highlight the useful bit'};
  const excerptProgress = reveal(frame, scene.beats[1]?.frame ?? 0, (scene.beats[1]?.frame ?? 0) + 24);
  const analogyProgress = reveal(frame, scene.beats[2]?.frame ?? 0, (scene.beats[2]?.frame ?? 0) + 24);
  const cursorX = interpolate(frame, [scene.beats[0]?.frame ?? 0, scene.beats[1]?.frame ?? 1], [210, 610], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <>
      <rect x="42" y="48" width="916" height="228" rx="8" fill={COLORS.white} stroke={palette.ink} strokeWidth="3" />
      <rect x="42" y="48" width="916" height="38" rx="8" fill={palette.ink} />
      <circle cx="66" cy="67" r="6" fill={COLORS.terracotta} />
      <circle cx="86" cy="67" r="6" fill={COLORS.yellow} />
      <circle cx="106" cy="67" r="6" fill={COLORS.teal} />
      <rect x="140" y="58" width="560" height="19" rx="9" fill="rgba(255,253,247,0.12)" />
      <text x="158" y="72" fill={COLORS.white} style={{fontFamily: 'Consolas, monospace', fontSize: 11}}>{browser.path}</text>
      <rect x="42" y="86" width="916" height="190" fill={COLORS.cream} />
      <rect x="62" y="106" width="116" height="150" fill={palette.ink} opacity="0.08" />
      <text x="78" y="128" fill={palette.accent} style={{fontFamily: utilityFontStack, fontSize: 10, fontWeight: 900, letterSpacing: 1.5}}>{browser.guideLabel ?? 'OFFICIAL GUIDE'}</text>
      {[0, 1, 2, 3].map((index) => <rect key={index} x="78" y={148 + index * 22} width={index === 1 ? 76 : 54} height="8" rx="4" fill={index === 1 ? palette.accent : palette.muted} opacity={index === 1 ? 0.9 : 0.45} />)}
      <text x="208" y="126" fill={palette.muted} style={{fontFamily: utilityFontStack, fontSize: 10, fontWeight: 900, letterSpacing: 1.5}}>GETTING STARTED</text>
      <text x="208" y="155" fill={palette.ink} style={{fontFamily: utilityFontStack, fontSize: 23, fontWeight: 900}}>{visual.label}</text>
      <rect x="204" y="169" width={Math.min(560, Math.max(250, browser.excerpt.length * 7.4))} height="31" rx="4" fill={palette.accent} opacity={0.12 + excerptProgress * 0.16} />
      <text x="218" y="191" fill={palette.ink} style={{fontFamily: utilityFontStack, fontSize: 16, fontWeight: 900}}>{browser.excerpt}</text>
      <text x="208" y="224" fill={palette.muted} style={{fontFamily: utilityFontStack, fontSize: 12, fontWeight: 700}}>{browser.action}</text>
      <circle cx={cursorX} cy="188" r="8" fill={palette.accent} opacity={0.35 + excerptProgress * 0.65} />
      <path d={`M ${cursorX - 4} 181 L ${cursorX + 5} 197 L ${cursorX + 1} 194 L ${cursorX - 2} 202 L ${cursorX - 7} 199 L ${cursorX - 4} 191 Z`} fill={palette.ink} opacity="0.9" />
      <rect x="208" y="238" width="476" height="27" rx="13" fill={palette.accent} opacity={analogyProgress * 0.95} />
      <text x="226" y="256" fill={COLORS.white} opacity={analogyProgress} style={{fontFamily: utilityFontStack, fontSize: 13, fontWeight: 900}}>{browser.analogy}</text>
      <rect x="720" y="108" width="210" height="138" rx="6" fill={palette.accent} opacity="0.12" stroke={palette.accent} strokeWidth="2" />
      <text x="742" y="135" fill={palette.accent} style={{fontFamily: utilityFontStack, fontSize: 11, fontWeight: 900, letterSpacing: 1.5}}>PLAIN ENGLISH</text>
      <text x="742" y="166" fill={palette.ink} style={{fontFamily: utilityFontStack, fontSize: 18, fontWeight: 900}}>{browser.analogy}</text>
      <path d="M 690 177 H 716" stroke={palette.accent} strokeWidth="3" markerEnd={`url(#${markerId})`} opacity={analogyProgress} />
    </>
  );
};

export const EducationalVisual: React.FC<{scene: VideoScene; frame: number; beatIndex: number; vertical?: boolean; fill?: boolean}> = ({scene, frame, beatIndex, vertical = false, fill = false}) => {
  const visual = scene.visual;
  if (!visual) return null;
  if (visual.kind === 'browser' && visual.browser?.variant === 'mindkraft-story') {
    return <div style={{position: 'absolute', inset: 0, zIndex: 2, opacity: reveal(frame, 4, 20), translate: `0px ${(1 - reveal(frame, 4, 20)) * 16}px`}}><MindKraftStoryVisual visual={visual} palette={BOARD_STYLES[scene.board]} frame={frame} scene={scene} beatIndex={beatIndex} /></div>;
  }
  if (visual.kind === 'browser' && visual.browser?.variant === 'mindkraft-flow') {
    return <div style={{position: 'absolute', left: fill ? 0 : vertical ? 54 : 480, right: fill ? 0 : vertical ? 54 : 480, top: fill ? 0 : vertical ? 330 : 238, height: fill ? '100%' : 330, zIndex: 2, opacity: reveal(frame, 4, 20), transform: `translateY(${(1 - reveal(frame, 4, 20)) * 16}px)`}}><MindKraftFlowVisual visual={visual} palette={BOARD_STYLES[scene.board]} frame={frame} scene={scene} /></div>;
  }
  if (visual.kind === 'browser' && visual.browser?.variant === 'mindkraft-process') {
    return <div style={{position: 'absolute', left: fill ? 0 : vertical ? 54 : 480, right: fill ? 0 : vertical ? 54 : 480, top: fill ? 0 : vertical ? 330 : 238, height: fill ? '100%' : 330, zIndex: 2, opacity: reveal(frame, 4, 20), transform: `translateY(${(1 - reveal(frame, 4, 20)) * 16}px)`}}><MindKraftBlocksVisual visual={visual} palette={BOARD_STYLES[scene.board]} frame={frame} scene={scene} beatIndex={beatIndex} /></div>;
  }
  const dark = scene.board === 'editorial';
  const board = BOARD_STYLES[scene.board];
  const palette = {ink: board.ink, muted: board.muted, accent: board.accent};
  const markerId = `edu-arrow-${scene.id}`;
  const assetFile = dark ? 'assets/open-source/git-icon-white.svg' : 'assets/open-source/git-logo.svg';
  const showGitLogo = /git/i.test(`${visual.label} ${visual.command ?? ''} ${scene.narration}`);
  return (
    <div style={{position: 'absolute', left: fill ? 0 : vertical ? 54 : 480, right: fill ? 0 : vertical ? 54 : 480, top: fill ? 0 : vertical ? 330 : 238, height: fill ? '100%' : 330, zIndex: 2, opacity: reveal(frame, 4, 20), transform: `translateY(${(1 - reveal(frame, 4, 20)) * 16}px)`}}>
      <svg viewBox="0 0 1000 300" width="100%" height="100%" role="img" aria-label={visual.label}>
        <defs>
          <marker id={markerId} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" fill={palette.accent} /></marker>
          <pattern id={`${markerId}-grid`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke={palette.muted} strokeOpacity="0.12" strokeWidth="1" /></pattern>
        </defs>
        <rect x="12" y="16" width="976" height="270" rx="5" fill={dark ? 'rgba(3,12,18,0.46)' : 'rgba(255,253,247,0.48)'} stroke={palette.muted} strokeOpacity="0.46" strokeWidth="2" />
        <rect x="12" y="16" width="976" height="270" rx="5" fill={`url(#${markerId}-grid)`} />
        <text x="34" y="38" fill={palette.accent} style={{fontFamily: utilityFontStack, fontSize: 12, fontWeight: 900, letterSpacing: 2}}>{visual.label.toUpperCase()}</text>
        {visual.kind === 'codebase' && <CodebaseVisual visual={visual} palette={palette} dark={dark} markerId={markerId} />}
        {(visual.kind === 'flow' || visual.kind === 'pipeline') && <FlowVisual visual={visual} palette={palette} beatIndex={beatIndex} frame={frame} scene={scene} markerId={markerId} />}
        {visual.kind === 'branch' && <BranchVisual palette={palette} frame={frame} scene={scene} markerId={markerId} />}
        {visual.kind === 'remote' && <RemoteVisual palette={palette} frame={frame} scene={scene} markerId={markerId} />}
        {visual.kind === 'browser' && <BrowserVisual visual={visual} palette={palette} frame={frame} scene={scene} markerId={markerId} />}
        {visual.caption && <text x="34" y="278" fill={palette.muted} style={{fontFamily: utilityFontStack, fontSize: 12, fontWeight: 700}}>{visual.caption}</text>}
      </svg>
      {showGitLogo && <Img src={staticFile(assetFile)} alt="Git open-source logo" style={{position: 'absolute', top: 24, right: 26, width: 62, height: 38, objectFit: 'contain', opacity: 0.9}} />}
    </div>
  );
};
