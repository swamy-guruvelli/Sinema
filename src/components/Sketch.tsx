import React from 'react';
import {COLORS, fontStack} from './theme';

export const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));

const hash = (value: string): number => {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result);
};

const offset = (seed: string, amount: number): {x: number; y: number} => {
  const value = hash(seed);
  return {
    x: ((value % 11) - 5) * amount * 0.18,
    y: (((Math.floor(value / 11) % 11) - 5) * amount * 0.18),
  };
};

type SketchBoardProps = {
  children: React.ReactNode;
};

export const SketchBoard: React.FC<SketchBoardProps> = ({children}) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: COLORS.paper,
      color: COLORS.ink,
      fontFamily: fontStack,
      backgroundImage: [
        'radial-gradient(circle at 12% 18%, rgba(201,87,62,0.08) 0 2px, transparent 3px)',
        'radial-gradient(circle at 84% 76%, rgba(21,127,128,0.07) 0 1px, transparent 2px)',
        'repeating-linear-gradient(0deg, rgba(22,33,43,0.018) 0 1px, transparent 1px 6px)',
      ].join(','),
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 24,
        border: `2px dashed rgba(22,33,43,0.18)`,
        transform: 'rotate(-0.35deg)',
        pointerEvents: 'none',
      }}
    />
    <div style={{position: 'relative', width: '100%', height: '100%'}}>{children}</div>
  </div>
);

type SketchPathProps = {
  d: string;
  progress?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
  roughness?: number;
  seed?: string;
};

export const SketchPath: React.FC<SketchPathProps> = ({
  d,
  progress = 1,
  stroke = COLORS.ink,
  strokeWidth = 5,
  fill = 'none',
  opacity = 1,
  roughness = 2,
  seed = d,
}) => {
  const safeProgress = clamp01(progress);
  const jitter = offset(seed, roughness);
  return (
    <g opacity={opacity}>
      {fill !== 'none' && <path d={d} fill={fill} opacity={safeProgress} />}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - safeProgress}
      />
      {roughness > 0 && (
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={Math.max(1, strokeWidth * 0.55)}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - safeProgress}
          opacity={0.36}
          transform={`translate(${jitter.x} ${jitter.y})`}
        />
      )}
    </g>
  );
};

type SketchArrowProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  bend?: number;
  color?: string;
  progress?: number;
  seed?: string;
};

export const SketchArrow: React.FC<SketchArrowProps> = ({
  x1,
  y1,
  x2,
  y2,
  bend = 0,
  color = COLORS.terracotta,
  progress = 1,
  seed = `${x1}-${y1}-${x2}-${y2}`,
}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 17;
  const head = `M${x2 - Math.cos(angle - 0.5) * size} ${y2 - Math.sin(angle - 0.5) * size} L${x2} ${y2} L${x2 - Math.cos(angle + 0.5) * size} ${y2 - Math.sin(angle + 0.5) * size}`;
  const curve = `M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + bend} ${x2} ${y2}`;
  return (
    <g>
      <SketchPath d={curve} stroke={color} strokeWidth={5} progress={progress} seed={`${seed}-line`} />
      <SketchPath d={head} stroke={color} strokeWidth={5} progress={Math.max(0, (progress - 0.55) / 0.45)} seed={`${seed}-head`} />
    </g>
  );
};

type SketchCircleProps = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  progress?: number;
  color?: string;
  strokeWidth?: number;
  seed?: string;
};

export const SketchCircle: React.FC<SketchCircleProps> = ({
  cx,
  cy,
  rx,
  ry,
  progress = 1,
  color = COLORS.terracotta,
  strokeWidth = 6,
  seed = `${cx}-${cy}`,
}) => {
  const d = `M${cx - rx} ${cy} C${cx - rx * 0.92} ${cy - ry * 1.08} ${cx + rx * 0.82} ${cy - ry * 1.04} ${cx + rx} ${cy - 2} C${cx + rx * 1.04} ${cy + ry * 0.78} ${cx - rx * 0.8} ${cy + ry * 1.08} ${cx - rx} ${cy}`;
  return <SketchPath d={d} stroke={color} strokeWidth={strokeWidth} progress={progress} seed={seed} />;
};

type SketchNoteProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  color?: string;
};

export const SketchNote: React.FC<SketchNoteProps> = ({children, style, color = COLORS.ink}) => (
  <div
    style={{
      display: 'inline-block',
      padding: '12px 18px 14px',
      color,
      border: `3px solid ${color}`,
      borderRadius: '46% 54% 49% 51%',
      transform: 'rotate(-1.5deg)',
      fontSize: 25,
      fontWeight: 800,
      lineHeight: 1.08,
      background: 'rgba(255,253,247,0.58)',
      ...style,
    }}
  >
    {children}
  </div>
);
