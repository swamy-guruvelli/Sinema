import React from 'react';
import {COLORS, fontStack} from './theme';

type CaptionProps = {
  children: React.ReactNode;
  eyebrow?: string;
  style?: React.CSSProperties;
};

export const Caption: React.FC<CaptionProps> = ({children, eyebrow, style}) => (
  <div style={{fontFamily: fontStack, color: COLORS.ink, transform: 'rotate(-1deg)', ...style}}>
    {eyebrow && <div style={{marginBottom: 9, color: COLORS.terracotta, fontSize: 22, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase'}}>{eyebrow}</div>}
    <div style={{fontSize: 42, lineHeight: 1.06, fontWeight: 900, letterSpacing: -1, textShadow: '1px 1px 0 rgba(22,33,43,0.12)'}}>{children}</div>
    <svg viewBox="0 0 420 16" width="100%" height="16" aria-hidden="true" style={{display: 'block', marginTop: 8, overflow: 'visible'}}>
      <path d="M3 8 Q100 1 205 8 T417 7" fill="none" stroke={COLORS.terracotta} strokeWidth="4" strokeLinecap="round" opacity="0.78" />
    </svg>
  </div>
);
