import React from 'react';
import {COLORS} from './theme';

export type DoodlePose = 'farmer' | 'harappan' | 'historian';

type DoodleCharacterProps = {
  pose: DoodlePose;
  label?: string;
  accent?: string;
  style?: React.CSSProperties;
};

export const DoodleCharacter: React.FC<DoodleCharacterProps> = ({pose, label, accent = COLORS.saffron, style}) => {
  const isHistorian = pose === 'historian';
  const isFarmer = pose === 'farmer';
  const isHarappan = pose === 'harappan';
  return (
    <div style={{width: 180, color: COLORS.ink, ...style}}>
      <svg viewBox="0 0 180 250" width="180" height="250" aria-label={label ?? `${pose} doodle character`} role="img" style={{transform: 'rotate(-1deg)', overflow: 'visible'}}>
        {isFarmer && <path d="M23 47 Q90 8 157 47" fill="none" stroke={COLORS.ink} strokeWidth="8" strokeLinecap="round" />}
        {isHistorian && <path d="M25 55 Q90 25 155 55" fill="none" stroke={COLORS.ink} strokeWidth="8" strokeLinecap="round" />}
        {isHarappan && <path d="M43 48 Q90 19 137 48 M54 39 Q90 54 126 39" fill="none" stroke={COLORS.ink} strokeWidth="6" strokeLinecap="round" />}
        <circle cx="90" cy="71" r="38" fill={COLORS.cream} stroke={COLORS.ink} strokeWidth="6" />
        <circle cx="76" cy="69" r="4" fill={COLORS.ink} />
        <circle cx="104" cy="69" r="4" fill={COLORS.ink} />
        <path d={isHistorian ? 'M75 87 Q90 78 105 87' : 'M76 87 Q90 98 104 87'} fill="none" stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
        {isHistorian && <path d="M49 67 Q90 49 131 67" fill="none" stroke={COLORS.ink} strokeWidth="5" />}
        <path d="M60 112 L47 185 L133 185 L120 112" fill={accent} stroke={COLORS.ink} strokeWidth="6" strokeLinejoin="round" />
        <path d={isFarmer ? 'M50 126 L18 167 M130 126 L164 143' : isHistorian ? 'M50 130 L19 164 M130 130 L162 158' : 'M50 127 L17 153 M130 127 L163 153'} fill="none" stroke={COLORS.ink} strokeWidth="7" strokeLinecap="round" />
        <path d="M77 185 L70 235 M103 185 L110 235" fill="none" stroke={COLORS.ink} strokeWidth="7" strokeLinecap="round" />
        {isHistorian && <rect x="126" y="149" width="34" height="27" rx="3" fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth="5" transform="rotate(12 126 149)" />}
        {isFarmer && <path d="M21 169 L4 191 M21 169 L30 192" fill="none" stroke={COLORS.green} strokeWidth="5" strokeLinecap="round" />}
        <path d="M35 239 Q88 231 145 239" fill="none" stroke={COLORS.ink} strokeWidth="3" strokeLinecap="round" opacity="0.42" />
        <path d="M57 57 L68 53 M112 53 L123 57" fill="none" stroke={COLORS.ink} strokeWidth="3" strokeLinecap="round" opacity="0.62" />
      </svg>
      {label && <div style={{marginTop: -24, textAlign: 'center', fontSize: 16, fontWeight: 800, letterSpacing: 1}}>{label}</div>}
    </div>
  );
};
