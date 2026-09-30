import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import team from '../data/productionTeam.json';
import {BOARD_STYLES, COLORS, fontStack, utilityFontStack} from '../components/theme';

type ProductionTab = (typeof team.tabs)[number];
const tabs = team.tabs as ProductionTab[];
const TAB_DURATION = 60;

export const getProductionBoardDuration = () => tabs.length * TAB_DURATION;

const tabColor = (color: string) => COLORS[color as keyof typeof COLORS] ?? COLORS.ink;

export const ProductionBoard: React.FC = () => {
  const frame = useCurrentFrame();
  const activeIndex = Math.min(tabs.length - 1, Math.floor(frame / TAB_DURATION));
  const active = tabs[activeIndex];
  const localFrame = frame - activeIndex * TAB_DURATION;
  const reveal = interpolate(localFrame, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const accent = tabColor(active.color);

  return (
    <AbsoluteFill style={{background: COLORS.cream, color: COLORS.ink, fontFamily: fontStack, padding: 52, boxSizing: 'border-box', backgroundImage: 'repeating-linear-gradient(0deg, rgba(22,33,43,0.022) 0 1px, transparent 1px 7px)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
        <div>
          <div style={{fontFamily: utilityFontStack, color: COLORS.terracotta, fontSize: 14, fontWeight: 900, letterSpacing: 3}}>SAMITHGATH / CODEX PRODUCTION DESK</div>
          <div style={{marginTop: 8, fontSize: 48, fontWeight: 900, lineHeight: 0.98}}>A small team for every story.</div>
        </div>
        <div style={{fontFamily: utilityFontStack, fontSize: 13, fontWeight: 900, letterSpacing: 1.4, color: COLORS.mutedInk}}>VIDEO IR / {team.project.toUpperCase()}</div>
      </div>

      <div role="tablist" aria-label="Production roles" style={{display: 'flex', gap: 8, marginTop: 30, borderBottom: `3px solid ${COLORS.ink}`, paddingBottom: 10}}>
        {tabs.map((tab, index) => (
          <div key={tab.id} role="tab" aria-selected={index === activeIndex} style={{padding: '9px 12px', background: index === activeIndex ? tabColor(tab.color) : COLORS.white, color: index === activeIndex ? COLORS.white : COLORS.mutedInk, border: `2px solid ${index === activeIndex ? tabColor(tab.color) : COLORS.ink}`, fontFamily: utilityFontStack, fontSize: 12, fontWeight: 900, letterSpacing: 0.8, whiteSpace: 'nowrap'}}>
            {tab.label.toUpperCase()}
          </div>
        ))}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1.5fr 0.8fr', gap: 26, flex: 1, minHeight: 0, marginTop: 30, opacity: reveal, transform: `translateY(${(1 - reveal) * 16}px)`}}>
        <div style={{background: COLORS.white, border: `4px solid ${COLORS.ink}`, boxShadow: '9px 10px 0 rgba(22,33,43,0.14)', padding: 30, minHeight: 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `3px solid ${accent}`, paddingBottom: 16}}>
            <div style={{fontFamily: utilityFontStack, color: accent, fontSize: 15, fontWeight: 900, letterSpacing: 2}}>{active.stage.toUpperCase()}</div>
            <div style={{fontFamily: utilityFontStack, color: COLORS.mutedInk, fontSize: 12, fontWeight: 900}}>TAB {activeIndex + 1} / {tabs.length}</div>
          </div>
          <div style={{marginTop: 24, fontSize: 40, fontWeight: 900}}>{active.label}</div>
          <div style={{marginTop: 24, padding: 22, background: COLORS.cream, borderLeft: `9px solid ${accent}`, fontSize: 26, lineHeight: 1.18, fontWeight: 700}}>{active.prompt}</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 28}}>
            <div><div style={{fontFamily: utilityFontStack, color: COLORS.mutedInk, fontSize: 12, fontWeight: 900, letterSpacing: 1.4}}>READS</div>{active.inputs.map((item) => <div key={item} style={{marginTop: 8, fontSize: 19, fontWeight: 800}}>→ {item}</div>)}</div>
            <div><div style={{fontFamily: utilityFontStack, color: COLORS.mutedInk, fontSize: 12, fontWeight: 900, letterSpacing: 1.4}}>DELIVERS</div>{active.outputs.map((item) => <div key={item} style={{marginTop: 8, fontSize: 19, fontWeight: 800}}>✓ {item}</div>)}</div>
          </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
          <div style={{background: COLORS.ink, color: COLORS.white, padding: 22, border: `4px solid ${COLORS.ink}`}}>
            <div style={{fontFamily: utilityFontStack, color: COLORS.yellow, fontSize: 12, fontWeight: 900, letterSpacing: 1.7}}>HANDOFF CONTRACT</div>
            <div style={{marginTop: 14, fontSize: 22, lineHeight: 1.2, fontWeight: 800}}>Notes become structured data. Structured data becomes a deterministic render.</div>
          </div>
          <div style={{background: BOARD_STYLES.lesson.panel, padding: 22, border: `3px solid ${COLORS.ink}`, flex: 1}}>
            <div style={{fontFamily: utilityFontStack, color: COLORS.teal, fontSize: 12, fontWeight: 900, letterSpacing: 1.7}}>NON-NEGOTIABLES</div>
            {['Read the style system', 'Reuse approved assets', 'One visual owner per line', 'Validate before render', 'QA before release'].map((item) => <div key={item} style={{marginTop: 14, fontSize: 19, fontWeight: 800}}>□ {item}</div>)}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
