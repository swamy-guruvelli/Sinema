import React from 'react';
import {COLORS, fontStack} from './theme';

type SpeechBubbleProps = {
  children: React.ReactNode;
  tone?: 'light' | 'dark';
  style?: React.CSSProperties;
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({children, tone = 'light', style}) => {
  const dark = tone === 'dark';
  return (
    <div style={{position: 'relative', padding: '19px 25px', border: `4px solid ${COLORS.ink}`, borderRadius: '46% 54% 49% 51%', background: dark ? COLORS.ink : COLORS.white, color: dark ? COLORS.white : COLORS.ink, fontFamily: fontStack, fontSize: 25, lineHeight: 1.15, fontWeight: 800, transform: 'rotate(1deg)', ...style}}>
      <span style={{position: 'absolute', left: 30, bottom: -18, width: 26, height: 26, background: dark ? COLORS.ink : COLORS.white, borderRight: `4px solid ${COLORS.ink}`, borderBottom: `4px solid ${COLORS.ink}`, transform: 'rotate(45deg)'}} />
      <span style={{position: 'relative'}}>{children}</span>
    </div>
  );
};
