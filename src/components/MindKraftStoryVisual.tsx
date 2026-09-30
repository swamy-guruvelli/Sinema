import React from 'react';
import {interpolate, spring, useVideoConfig} from 'remotion';
import type {VideoScene, VideoVisual} from '../data/videoSpec';
import {COLORS, utilityFontStack} from './theme';

type Palette = {ink: string; muted: string; accent: string};

const reveal = (frame: number, start: number, duration = 18) =>
  interpolate(frame, [start, start + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const rise = (frame: number, start: number, duration = 18, distance = 20): React.CSSProperties => {
  const progress = reveal(frame, start, duration);
  return {
    opacity: progress,
    translate: `0px ${(1 - progress) * distance}px`,
    scale: `${0.96 + progress * 0.04}`,
  };
};

const SectionLabel: React.FC<{children: React.ReactNode; color: string}> = ({children, color}) => (
  <div style={{fontSize: 13, fontWeight: 900, letterSpacing: 1.5, color}}>{children}</div>
);

type FlowStep = {label: string; detail: string};

const FLOW_RAILS: Record<string, FlowStep[]> = {
  comparison: [
    {label: 'ROLE DATA', detail: 'new opportunities'},
    {label: 'FIT SIGNAL', detail: 'skills + sponsorship'},
    {label: 'NEXT ACTION', detail: 'one place to continue'},
  ],
  morning: [
    {label: 'PROFILE', detail: 'your goals + experience'},
    {label: 'BRIEF', detail: 'new roles worth opening'},
    {label: 'MATCH', detail: 'why this fits you'},
  ],
  tailor: [
    {label: 'ROLE BRIEF', detail: 'the real requirements'},
    {label: 'RESUME', detail: 'relevant experience'},
    {label: 'APPLICATION', detail: 'ready to review'},
  ],
  review: [
    {label: 'SUGGESTION', detail: 'a useful starting point'},
    {label: 'YOUR REVIEW', detail: 'check every detail'},
    {label: 'APPROVAL', detail: 'you choose to send'},
  ],
  tracking: [
    {label: 'APPLIED', detail: 'role sent'},
    {label: 'STATUS', detail: 'what changed'},
    {label: 'NEXT ACTION', detail: 'what to do now'},
  ],
  tips: [
    {label: 'QUESTION', detail: 'where you feel stuck'},
    {label: 'PRACTICAL TIP', detail: 'a lesson to use'},
    {label: 'NEXT MOVE', detail: 'put it to work'},
  ],
  payoff: [
    {label: 'DISCOVER', detail: 'find a role'},
    {label: 'MATCH + TAILOR', detail: 'make it relevant'},
    {label: 'FOLLOW UP', detail: 'keep moving'},
  ],
};

const FLOW_INSIGHTS: Record<string, string> = {
  review: 'Suggestions become actions only after you check the details.',
  tracking: 'Every update lands beside the role it belongs to.',
  tips: 'A useful lesson becomes part of the next application.',
  payoff: 'The next move stays visible instead of getting lost in tabs.',
};

const JourneyRail: React.FC<{palette: Palette; frame: number; scene: VideoScene; flow: string}> = ({palette, frame, scene, flow}) => {
  const steps = FLOW_RAILS[flow] ?? FLOW_RAILS.payoff;
  const positions = [16, 50, 84];
  const activeIndex = Math.min(steps.length - 1, scene.beats.reduce((active, beat, index) => frame >= beat.frame ? index : active, 0));
  const segmentStart = scene.beats[activeIndex]?.frame ?? 0;
  const segmentEnd = scene.beats[activeIndex + 1]?.frame ?? scene.durationInFrames;
  const packetProgress = activeIndex === steps.length - 1
    ? 1
    : interpolate(frame, [segmentStart, segmentEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const packetLeft = activeIndex === steps.length - 1
    ? positions[positions.length - 1]
    : interpolate(packetProgress, [0, 1], [positions[activeIndex], positions[activeIndex + 1]]);
  const payload = ['ROLE', 'FIT', 'NEXT'][activeIndex] ?? 'NEXT';

  return (
    <div style={{position: 'absolute', left: '5%', right: '5%', top: '81%', padding: '12px 14px 14px', boxSizing: 'border-box', border: '2px solid #d8dfdd', borderRadius: 14, background: '#f1f4f3'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#5a6570', fontSize: 11, fontWeight: 900, letterSpacing: 1.3}}>
        <span>LIVE DATA FLOW</span>
        <span style={{color: palette.accent}}>PAYLOAD: {payload}</span>
      </div>
      <div style={{position: 'relative', height: 70, marginTop: 9}}>
        <div style={{position: 'absolute', left: '13%', right: '13%', top: 31, height: 4, borderRadius: 4, background: '#cbd3d3'}} />
        <div style={{position: 'absolute', left: `${packetLeft}%`, top: 24, width: 15, height: 15, borderRadius: 5, background: palette.accent, boxShadow: `0 0 0 4px rgba(224,167,47,0.2)`, translate: '-50% 0', zIndex: 2}} />
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, height: '100%', position: 'relative'}}>
          {steps.map((step, index) => {
            const active = index === activeIndex;
            const show = reveal(frame, scene.beats[index]?.frame ?? index * 24, 16);
            return <div key={step.label} style={{opacity: show, minWidth: 0, padding: '8px 9px', boxSizing: 'border-box', borderRadius: 9, border: `2px solid ${active ? palette.accent : '#aab5b5'}`, background: active ? palette.accent : '#fffdf7', color: '#16212b', scale: `${0.96 + show * 0.04}`}}>
              <div style={{fontSize: 10, fontWeight: 900, letterSpacing: 0.7, opacity: active ? 0.7 : 0.56}}>0{index + 1}</div>
              <div style={{marginTop: 4, fontSize: 12, lineHeight: 1.05, fontWeight: 900, overflowWrap: 'anywhere'}}>{step.label}</div>
              <div style={{marginTop: 3, fontSize: 10, lineHeight: 1.05, color: active ? '#16212b' : '#5a6570', fontWeight: 700, overflowWrap: 'anywhere'}}>{step.detail}</div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
};

const StoryFrame: React.FC<{eyebrow: string; title: string; children: React.ReactNode; palette: Palette; frame: number; scene: VideoScene; flow: string}> = ({eyebrow, title, children, palette, frame, scene, flow}) => {
  const insight = FLOW_INSIGHTS[flow];
  const insightProgress = reveal(frame, scene.beats[1]?.frame ?? 70, 18);
  return (
    <div style={{position: 'absolute', inset: 0, padding: '4% 5%', boxSizing: 'border-box', background: '#fffdf7', color: '#16212b', fontFamily: utilityFontStack}}>
      <div style={{color: '#e0a72f', fontSize: 15, fontWeight: 900, letterSpacing: 2}}>{eyebrow}</div>
      <div style={{marginTop: 9, fontSize: 31, lineHeight: 1.05, fontWeight: 900}}>{title}</div>
      {children}
      {insight && <div style={{position: 'absolute', left: '5%', right: '5%', top: '63%', padding: '12px 16px', boxSizing: 'border-box', borderLeft: `6px solid ${palette.accent}`, borderRadius: 8, background: '#eef1f2', opacity: insightProgress, translate: `0px ${(1 - insightProgress) * 14}px`}}>
        <div style={{fontSize: 10, color: '#5a6570', fontWeight: 900, letterSpacing: 1.3}}>WHAT THIS STEP ADDS</div>
        <div style={{marginTop: 5, fontSize: 16, lineHeight: 1.1, fontWeight: 900}}>{insight}</div>
      </div>}
      <JourneyRail palette={palette} frame={frame} scene={scene} flow={flow} />
    </div>
  );
};

const ComparisonVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene}> = ({palette, frame, scene}) => {
  const rows = [
    {old: 'Job boards + tabs', next: 'One morning brief'},
    {old: 'Manual matching', next: 'Skills-based matches'},
    {old: 'Resume from zero', next: 'Tailored application'},
  ];
  return (
    <StoryFrame eyebrow="THE DIFFERENCE" title="Same job search. A clearer morning." palette={palette} frame={frame} scene={scene} flow="comparison">
      <div style={{marginTop: '5%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        <div style={{padding: '14px 16px', borderRadius: 10, background: '#f2e9e2', color: '#8d4e3c'}}><SectionLabel color="#8d4e3c">THE TRADITIONAL ROUTE</SectionLabel><div style={{marginTop: 6, fontSize: 17, fontWeight: 800}}>Many places to remember</div></div>
        <div style={{padding: '14px 16px', borderRadius: 10, background: palette.accent, color: '#16212b'}}><SectionLabel color="#16212b">WITH MINDKRAFT</SectionLabel><div style={{marginTop: 6, fontSize: 17, fontWeight: 900}}>One place to continue</div></div>
      </div>
      <div style={{marginTop: 14, height: '60%', display: 'grid', gridTemplateRows: 'repeat(3, minmax(0, 1fr))', gap: 14}}>
        {rows.map((row, index) => {
          const progress = reveal(frame, scene.beats[index]?.frame ?? index * 80, 20);
          const oldShift = index === 0 ? 0 : (1 - progress) * 12;
          return <div key={row.old} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'stretch', ...rise(frame, scene.beats[index]?.frame ?? index * 80, 20, 14)}}>
            <div style={{position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 22px', border: '2px solid #d3b7ac', borderRadius: 9, background: '#fff8f4', color: '#573b35', overflow: 'hidden'}}>
              <div style={{fontSize: 11, fontWeight: 900, letterSpacing: 1.2, opacity: 0.62}}>SCATTERED</div>
              <div style={{marginTop: 7, fontSize: 19, fontWeight: 900, translate: `${oldShift}px 0`}}>{row.old}</div>
              <div style={{position: 'absolute', right: 16, bottom: 12, display: 'flex', gap: 4, opacity: 0.7}}>{[0, 1, 2].map((dot) => <span key={dot} style={{width: 6, height: 6, borderRadius: '50%', background: '#c87b62'}} />)}</div>
            </div>
            <div style={{position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 22px', border: `2px solid ${palette.accent}`, borderRadius: 9, background: '#fffdf7', overflow: 'hidden'}}>
              <div style={{fontSize: 11, fontWeight: 900, letterSpacing: 1.2, color: palette.accent}}>TOGETHER</div>
              <div style={{marginTop: 7, fontSize: 19, fontWeight: 900}}>{row.next}</div>
              <div style={{position: 'absolute', right: 16, bottom: 11, width: `${progress * 34}px`, height: 4, borderRadius: 4, background: palette.accent}} />
            </div>
          </div>;
        })}
      </div>
      <div style={{marginTop: 14, display: 'flex', justifyContent: 'center', opacity: reveal(frame, scene.dialogue?.[1]?.startFrame ?? scene.beats[2]?.frame ?? 300, 22)}}>
        <div style={{padding: '9px 16px', borderRadius: 999, background: '#16212b', color: COLORS.white, fontSize: 14, fontWeight: 900}}>The search becomes a routine, not a scavenger hunt.</div>
      </div>
    </StoryFrame>
  );
};

const MorningBriefVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene}> = ({palette, frame, scene}) => {
  const {fps} = useVideoConfig();
  const envelopeProgress = spring({frame: frame - (scene.beats[0]?.frame ?? 0), fps, config: {damping: 18, stiffness: 130}});
  const open = reveal(frame, scene.beats[1]?.frame ?? 70, 18);
  const match = reveal(frame, scene.beats[2]?.frame ?? 176, 20);
  return (
    <StoryFrame eyebrow="THE MORNING BRIEF" title="Wake up to a useful starting point." palette={palette} frame={frame} scene={scene} flow="morning">
      <div style={{position: 'relative', height: '76%', marginTop: '4%'}}>
        <div style={{position: 'absolute', left: '5%', top: '6%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(224,167,47,0.18)'}} />
        <div style={{position: 'absolute', left: '8%', top: '16%', fontSize: 16, fontWeight: 900, color: palette.muted}}>8:00 AM</div>
        <div style={{position: 'absolute', left: `${8 + envelopeProgress * 22}%`, top: `${30 - envelopeProgress * 8}%`, width: 112, height: 76, padding: 14, boxSizing: 'border-box', borderRadius: 12, background: palette.accent, color: '#16212b', opacity: 1 - open * 0.55, scale: `${0.92 + envelopeProgress * 0.08}`}}>
          <div style={{fontSize: 12, fontWeight: 900}}>NEW BRIEF</div>
          <div style={{marginTop: 9, height: 2, background: '#16212b', opacity: 0.45}} />
          <div style={{marginTop: 6, width: 54, height: 2, background: '#16212b', opacity: 0.45}} />
        </div>
        <div style={{position: 'absolute', right: '9%', top: 0, width: '46%', height: '100%', padding: '22px 18px', boxSizing: 'border-box', border: '8px solid #16212b', borderRadius: 32, background: '#f1f4f3', boxShadow: '0 12px 0 rgba(22,33,43,0.12)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 900, color: palette.muted}}><span>MindKraft</span><span>8:01</span></div>
          <div style={{marginTop: 18, padding: '14px 12px', borderRadius: 12, background: '#16212b', color: COLORS.white, ...rise(frame, scene.beats[1]?.frame ?? 70, 18, 16)}}>
            <div style={{fontSize: 11, color: palette.accent, fontWeight: 900, letterSpacing: 1}}>GOOD MORNING</div>
            <div style={{marginTop: 7, fontSize: 21, fontWeight: 900}}>Your job brief is ready</div>
            <div style={{marginTop: 8, fontSize: 13, lineHeight: 1.2, opacity: 0.76}}>New roles, sponsorship, and your best matches.</div>
          </div>
          <div style={{marginTop: 14, padding: 12, borderRadius: 10, background: '#fffdf7', border: `2px solid ${palette.accent}`, opacity: open, translate: `0px ${(1 - open) * 16}px`}}>
            <div style={{fontSize: 11, fontWeight: 900, color: palette.accent, letterSpacing: 1}}>3 NEW OPPORTUNITIES</div>
            <div style={{marginTop: 8, fontSize: 17, fontWeight: 900}}>Sponsorship checked</div>
            <div style={{marginTop: 5, fontSize: 13, color: palette.muted}}>Ready for a closer look.</div>
          </div>
          <div style={{marginTop: 12, padding: 12, borderRadius: 10, background: palette.accent, opacity: match, translate: `0px ${(1 - match) * 18}px`}}>
            <div style={{fontSize: 11, fontWeight: 900, letterSpacing: 1}}>WHY THIS MATCHES</div>
            <div style={{marginTop: 7, fontSize: 17, fontWeight: 900}}>Skills + experience</div>
            <div style={{marginTop: 5, fontSize: 13, color: '#16212b', opacity: 0.72}}>A reason to spend time here.</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: '4%', right: '53%', bottom: '5%', padding: '14px 16px', borderLeft: `6px solid ${palette.accent}`, background: '#eef1f2', opacity: match, translate: `0px ${(1 - match) * 12}px`}}>
          <div style={{fontSize: 12, color: palette.accent, fontWeight: 900, letterSpacing: 1}}>NO TAB HUNTING</div>
          <div style={{marginTop: 7, fontSize: 19, fontWeight: 900}}>Start with the roles that make sense.</div>
        </div>
      </div>
    </StoryFrame>
  );
};

const TailorVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene}> = ({palette, frame, scene}) => {
  const role = reveal(frame, scene.beats[0]?.frame ?? 0, 18);
  const resume = reveal(frame, scene.beats[1]?.frame ?? 70, 20);
  const extension = reveal(frame, scene.beats[2]?.frame ?? 131, 20);
  const lineProgress = reveal(frame, scene.beats[2]?.frame ?? 131, 30);
  return (
    <StoryFrame eyebrow="TAILOR THE DETAILS" title="The role becomes the starting point." palette={palette} frame={frame} scene={scene} flow="tailor">
      <div style={{position: 'relative', height: '76%', marginTop: '5%'}}>
        <div style={{position: 'absolute', left: 0, top: '11%', width: '37%', height: '65%', padding: 18, boxSizing: 'border-box', borderRadius: 12, border: '2px solid #9aa3a9', background: '#eef1f2', ...rise(frame, scene.beats[0]?.frame ?? 0, 18, 18)}}>
          <SectionLabel color={palette.accent}>ROLE BRIEF</SectionLabel>
          <div style={{marginTop: 14, fontSize: 23, fontWeight: 900}}>Frontend Engineer</div>
          <div style={{marginTop: 8, fontSize: 14, color: palette.muted}}>Skills that matter for this role</div>
          {['React', 'TypeScript', 'Accessibility'].map((item, index) => <div key={item} style={{marginTop: 12, padding: '8px 10px', borderRadius: 7, background: '#fffdf7', fontSize: 14, fontWeight: 800, opacity: reveal(frame, (scene.beats[0]?.frame ?? 0) + 24 + index * 10, 12)}}>{item}</div>)}
        </div>
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d="M 38 48 C 47 48, 50 48, 59 48" fill="none" stroke={palette.accent} strokeWidth="1.3" strokeDasharray="2 2" opacity={lineProgress} />
          <circle cx={38 + lineProgress * 21} cy="48" r="2.1" fill={palette.accent} opacity={lineProgress} />
        </svg>
        <div style={{position: 'absolute', right: 0, top: '4%', width: '43%', height: '76%', padding: 18, boxSizing: 'border-box', borderRadius: 12, border: `3px solid ${palette.accent}`, background: '#fffdf7', ...rise(frame, scene.beats[1]?.frame ?? 70, 20, 20)}}>
          <SectionLabel color={palette.accent}>TAILORED RESUME</SectionLabel>
          <div style={{marginTop: 14, fontSize: 21, fontWeight: 900}}>Your experience</div>
          <div style={{marginTop: 5, fontSize: 13, color: palette.muted}}>Reordered for this role</div>
          {['React projects', 'TypeScript delivery', 'Accessible UI'].map((item, index) => {
            const mark = reveal(frame, (scene.beats[1]?.frame ?? 70) + 22 + index * 13, 14);
            return <div key={item} style={{marginTop: 18, display: 'flex', gap: 8, alignItems: 'center', opacity: mark}}><span style={{width: 15, height: 15, borderRadius: 4, background: palette.accent}} /><span style={{fontSize: 14, fontWeight: 800}}>{item}</span></div>;
          })}
          <div style={{position: 'absolute', left: 18, right: 18, bottom: 14, height: 5, borderRadius: 5, background: '#e5e9e9', overflow: 'hidden'}}><div style={{height: '100%', width: `${extension * 100}%`, background: palette.accent}} /></div>
        </div>
        <div style={{position: 'absolute', left: '24%', bottom: '1%', padding: '11px 16px', borderRadius: 999, background: '#16212b', color: COLORS.white, fontSize: 14, fontWeight: 900, opacity: extension, translate: `0px ${(1 - extension) * 15}px`}}>Browser extension: assist while you explore</div>
      </div>
    </StoryFrame>
  );
};

const ReviewVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene}> = ({palette, frame, scene}) => {
  const suggestion = reveal(frame, scene.beats[0]?.frame ?? 0, 18);
  const review = reveal(frame, scene.beats[1]?.frame ?? 64, 18);
  const approve = reveal(frame, scene.beats[2]?.frame ?? 170, 20);
  return (
    <StoryFrame eyebrow="SUPPORT, NOT AUTOPILOT" title="MindKraft helps. You still decide." palette={palette} frame={frame} scene={scene} flow="review">
      <div style={{position: 'relative', height: '76%', marginTop: '5%'}}>
        <div style={{position: 'absolute', left: '4%', top: '16%', width: '38%', padding: 18, borderRadius: 12, background: '#eef1f2', border: '2px solid #9aa3a9', opacity: suggestion, translate: `0px ${(1 - suggestion) * 16}px`}}>
          <SectionLabel color={palette.accent}>MINDKRAFT SUGGESTS</SectionLabel>
          <div style={{marginTop: 14, fontSize: 21, fontWeight: 900}}>Highlight the experience that fits.</div>
          <div style={{marginTop: 13, height: 8, width: '86%', borderRadius: 8, background: '#cbd3d3'}} />
          <div style={{marginTop: 8, height: 8, width: '64%', borderRadius: 8, background: palette.accent, opacity: 0.8}} />
        </div>
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}><path d="M 44 45 C 48 45, 52 45, 58 45" fill="none" stroke={palette.accent} strokeWidth="1.3" strokeDasharray="2 2" opacity={review} /><circle cx={44 + review * 14} cy="45" r="2.2" fill={palette.accent} opacity={review} /></svg>
        <div style={{position: 'absolute', right: '4%', top: '6%', width: '40%', padding: 18, borderRadius: 12, background: '#fffdf7', border: `3px solid ${palette.accent}`, opacity: review, translate: `0px ${(1 - review) * 16}px`}}>
          <SectionLabel color={palette.accent}>YOUR REVIEW</SectionLabel>
          {['Check the role', 'Check the details', 'Choose what to send'].map((item, index) => <div key={item} style={{display: 'flex', gap: 9, alignItems: 'center', marginTop: 15, fontSize: 14, fontWeight: 800, opacity: reveal(frame, (scene.beats[1]?.frame ?? 64) + index * 18, 12)}}><span style={{width: 17, height: 17, borderRadius: 5, border: `2px solid ${palette.accent}`, boxSizing: 'border-box'}} />{item}</div>)}
        </div>
        <div style={{position: 'absolute', left: '30%', bottom: '8%', padding: '14px 20px', borderRadius: 10, background: approve ? palette.accent : '#16212b', color: approve ? '#16212b' : COLORS.white, fontSize: 18, fontWeight: 900, opacity: approve, scale: `${0.94 + approve * 0.06}`}}>Ready when you are</div>
      </div>
    </StoryFrame>
  );
};

const TrackingVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene}> = ({palette, frame, scene}) => {
  const applied = reveal(frame, scene.beats[0]?.frame ?? 0, 18);
  const status = reveal(frame, scene.beats[1]?.frame ?? 90, 18);
  const next = reveal(frame, scene.beats[2]?.frame ?? 153, 18);
  return (
    <StoryFrame eyebrow="KEEP THE JOURNEY VISIBLE" title="After you apply, the next step stays close." palette={palette} frame={frame} scene={scene} flow="tracking">
      <div style={{position: 'relative', height: '76%', marginTop: '5%'}}>
        <div style={{position: 'absolute', left: '7%', right: '7%', top: '34%', height: 6, borderRadius: 6, background: '#d6dddd'}}><div style={{height: '100%', width: `${next * 100}%`, background: palette.accent, borderRadius: 6}} /></div>
        {[
          {label: 'APPLIED', detail: 'role sent', progress: applied, left: '12%'},
          {label: 'STATUS', detail: 'what changed', progress: status, left: '50%'},
          {label: 'NEXT ACTION', detail: 'what to do now', progress: next, left: '88%'},
        ].map((item) => <div key={item.label} style={{position: 'absolute', left: item.left, top: '25%', width: 21, height: 21, borderRadius: '50%', background: item.progress ? palette.accent : '#d6dddd', border: '5px solid #fffdf7', boxShadow: `0 0 0 2px ${item.progress ? palette.accent : '#9aa3a9'}`, translate: '-50% 0', scale: `${0.86 + item.progress * 0.14}`}} />)}
        <div style={{position: 'absolute', left: '3%', top: '48%', width: '28%', padding: 16, borderRadius: 10, background: '#eef1f2', border: '2px solid #9aa3a9', opacity: applied, translate: `0px ${(1 - applied) * 14}px`}}><SectionLabel color={palette.accent}>ROLE</SectionLabel><div style={{marginTop: 8, fontSize: 18, fontWeight: 900}}>Frontend Engineer</div><div style={{marginTop: 5, fontSize: 13, color: palette.muted}}>sent this morning</div></div>
        <div style={{position: 'absolute', left: '36%', top: '48%', width: '28%', padding: 16, borderRadius: 10, background: '#fffdf7', border: `2px solid ${palette.accent}`, opacity: status, translate: `0px ${(1 - status) * 14}px`}}><SectionLabel color={palette.accent}>INBOX</SectionLabel><div style={{marginTop: 8, fontSize: 18, fontWeight: 900}}>New message</div><div style={{marginTop: 5, fontSize: 13, color: palette.muted}}>one place to see it</div></div>
        <div style={{position: 'absolute', right: '3%', top: '48%', width: '28%', padding: 16, borderRadius: 10, background: palette.accent, opacity: next, translate: `0px ${(1 - next) * 14}px`}}><SectionLabel color="#16212b">NEXT</SectionLabel><div style={{marginTop: 8, fontSize: 18, fontWeight: 900}}>Prepare for the reply</div><div style={{marginTop: 5, fontSize: 13, color: '#16212b', opacity: 0.72}}>no tab hunting</div></div>
      </div>
    </StoryFrame>
  );
};

const TipsVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene}> = ({palette, frame, scene}) => {
  const question = reveal(frame, scene.beats[0]?.frame ?? 0, 18);
  const tip = reveal(frame, scene.beats[1]?.frame ?? 110, 18);
  const move = reveal(frame, scene.beats[2]?.frame ?? 206, 18);
  return (
    <StoryFrame eyebrow="PRACTICAL HELP" title="When you get stuck, the process keeps teaching." palette={palette} frame={frame} scene={scene} flow="tips">
      <div style={{position: 'relative', height: '76%', marginTop: '5%'}}>
        <div style={{position: 'absolute', left: '7%', top: '17%', width: '31%', padding: 18, borderRadius: 15, background: '#eef1f2', border: '2px solid #9aa3a9', opacity: question, translate: `0px ${(1 - question) * 16}px`}}>
          <SectionLabel color={palette.accent}>YOUR QUESTION</SectionLabel>
          <div style={{marginTop: 14, fontSize: 21, fontWeight: 900, lineHeight: 1.15}}>How do I make this application stronger?</div>
        </div>
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}><path d="M 39 43 C 47 43, 52 43, 61 43" fill="none" stroke={palette.accent} strokeWidth="1.3" strokeDasharray="2 2" opacity={tip} /><circle cx={39 + tip * 22} cy="43" r="2.2" fill={palette.accent} opacity={tip} /></svg>
        <div style={{position: 'absolute', right: '6%', top: '5%', width: '38%', padding: 18, borderRadius: 15, background: '#16212b', color: COLORS.white, opacity: tip, translate: `0px ${(1 - tip) * 16}px`}}>
          <SectionLabel color={palette.accent}>A USEFUL TIP</SectionLabel>
          <div style={{marginTop: 13, fontSize: 20, fontWeight: 900, lineHeight: 1.15}}>Lead with the result, then show how you made it happen.</div>
          <div style={{marginTop: 14, height: 5, width: '72%', borderRadius: 5, background: palette.accent}} />
        </div>
        <div style={{position: 'absolute', left: '25%', bottom: '7%', padding: '13px 18px', borderRadius: 999, background: palette.accent, color: '#16212b', fontSize: 16, fontWeight: 900, opacity: move, translate: `0px ${(1 - move) * 15}px`}}>Put the idea to work on the next step.</div>
      </div>
    </StoryFrame>
  );
};

const PayoffVisual: React.FC<{palette: Palette; frame: number; scene: VideoScene}> = ({palette, frame, scene}) => {
  const flow = reveal(frame, scene.beats[0]?.frame ?? 0, 22);
  const focus = reveal(frame, scene.beats[1]?.frame ?? 150, 20);
  const free = reveal(frame, scene.beats[2]?.frame ?? 230, 20);
  const steps = ['DISCOVER', 'MATCH', 'TAILOR', 'REVIEW', 'FOLLOW UP'];
  return (
    <StoryFrame eyebrow="THE PAYOFF" title="A clearer routine for your next move." palette={palette} frame={frame} scene={scene} flow="payoff">
      <div style={{position: 'relative', height: '76%', marginTop: '5%'}}>
        <div style={{position: 'absolute', left: '6%', right: '6%', top: '38%', height: 5, borderRadius: 5, background: '#d6dddd'}}><div style={{height: '100%', width: `${flow * 100}%`, background: palette.accent, borderRadius: 5}} /></div>
        {steps.map((step, index) => {
          const item = reveal(frame, (scene.beats[0]?.frame ?? 0) + index * 18, 14);
          return <div key={step} style={{position: 'absolute', left: `${8 + index * 21}%`, top: '31%', textAlign: 'center', opacity: item, scale: `${0.9 + item * 0.1}`}}><div style={{margin: '0 auto', width: 28, height: 28, borderRadius: '50%', background: palette.accent, border: '5px solid #fffdf7', boxShadow: `0 0 0 2px ${palette.accent}`}} /><div style={{marginTop: 13, fontSize: 13, fontWeight: 900, letterSpacing: 1}}>{step}</div></div>;
        })}
        <div style={{position: 'absolute', left: '16%', right: '16%', bottom: '5%', display: 'flex', justifyContent: 'center', gap: 12, opacity: focus, translate: `0px ${(1 - focus) * 14}px`}}><div style={{padding: '11px 16px', borderRadius: 9, background: '#16212b', color: COLORS.white, fontSize: 16, fontWeight: 900}}>Less searching in circles</div><div style={{padding: '11px 16px', borderRadius: 9, background: palette.accent, color: '#16212b', fontSize: 16, fontWeight: 900}}>More focused progress</div></div>
        <div style={{position: 'absolute', right: '5%', top: '1%', padding: '10px 15px', borderRadius: 999, background: '#16212b', color: palette.accent, fontSize: 15, fontWeight: 900, opacity: free, scale: `${0.88 + free * 0.12}`}}>CORE TOOLS: FREE</div>
      </div>
    </StoryFrame>
  );
};

export const MindKraftStoryVisual: React.FC<{visual: VideoVisual; palette: Palette; frame: number; scene: VideoScene; beatIndex: number}> = ({visual, palette, frame, scene}) => {
  const mode = visual.browser?.flow ?? scene.id;
  const common = {palette, frame, scene};
  if (mode === 'comparison' || scene.id === 'mindkraft-problem') return <ComparisonVisual {...common} />;
  if (mode === 'morning' || scene.id === 'mindkraft-matching') return <MorningBriefVisual {...common} />;
  if (mode === 'tailor' || scene.id === 'mindkraft-application') return <TailorVisual {...common} />;
  if (mode === 'review' || scene.id === 'mindkraft-control') return <ReviewVisual {...common} />;
  if (mode === 'tracking' || scene.id === 'mindkraft-tracking') return <TrackingVisual {...common} />;
  if (mode === 'tips' || scene.id === 'mindkraft-tips') return <TipsVisual {...common} />;
  return <PayoffVisual {...common} />;
};
