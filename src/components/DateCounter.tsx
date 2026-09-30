import React from 'react';
import {COLORS, fontStack} from './theme';

type DateCounterProps = {
  label: string;
  progress?: number;
  eyebrow?: string;
};

export const DateCounter: React.FC<DateCounterProps> = ({label, progress = 1, eyebrow}) => (
  <div style={{fontFamily: fontStack, color: COLORS.ink, opacity: Math.max(0, Math.min(1, progress)), transform: `rotate(-1deg) translateY(${(1 - Math.max(0, Math.min(1, progress))) * 16}px)`}}>
    {eyebrow && <div style={{fontSize: 19, letterSpacing: 2, fontWeight: 800, color: COLORS.terracotta, textTransform: 'uppercase'}}>{eyebrow}</div>}
    <div style={{fontSize: 50, lineHeight: 1, fontWeight: 900, letterSpacing: -2, textShadow: '1px 1px 0 rgba(22,33,43,0.12)'}}>{label}</div>
    <div style={{width: '82%', marginTop: 10, borderTop: `4px solid ${COLORS.ink}`, transform: 'rotate(1deg)'}} />
  </div>
);
