import React from 'react';
import {COLORS, fontStack} from './theme';
import {SketchPath} from './Sketch';

export type TimelineEvent = {label: string; detail?: string};

type TimelineProps = {
  events: TimelineEvent[];
  activeIndex?: number;
  progress?: number;
};

export const Timeline: React.FC<TimelineProps> = ({events, activeIndex = 0, progress = 1}) => {
  const safeProgress = Math.max(0, Math.min(1, progress));
  return (
    <div style={{position: 'relative', width: '100%', height: 154, fontFamily: fontStack}}>
      <svg viewBox="0 0 1000 100" width="100%" height="100" preserveAspectRatio="none" aria-hidden="true" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <SketchPath d="M28 44 Q250 34 500 46 T972 42" stroke="#ddceb0" strokeWidth={8} progress={1} roughness={2} seed="timeline-base" />
        <SketchPath d="M28 44 Q250 34 500 46 T972 42" stroke={COLORS.terracotta} strokeWidth={8} progress={safeProgress} roughness={2} seed="timeline-progress" />
      </svg>
      {events.map((event, index) => {
        const x = events.length === 1 ? 0 : (index / (events.length - 1)) * 100;
        const active = index <= activeIndex;
        return (
          <div key={`${event.label}-${index}`} style={{position: 'absolute', left: `${x}%`, top: 16, width: 140, transform: `translateX(-50%) rotate(${index % 2 ? 1.2 : -1.2}deg)`, textAlign: 'center', opacity: active || index === activeIndex + 1 ? 1 : 0.65}}>
            <div style={{margin: '0 auto 14px', width: active ? 30 : 24, height: active ? 30 : 24, borderRadius: '50%', background: active ? COLORS.terracotta : COLORS.cream, border: `4px solid ${COLORS.ink}`, boxSizing: 'border-box'}} />
            <div style={{fontSize: 19, lineHeight: 1.1, fontWeight: 800, color: COLORS.ink}}>{event.label}</div>
            {event.detail && <div style={{marginTop: 4, fontSize: 15, color: COLORS.mutedInk}}>{event.detail}</div>}
          </div>
        );
      })}
    </div>
  );
};
