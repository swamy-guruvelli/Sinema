import React from 'react';
import {COLORS, fontStack} from './theme';
import {clamp01, SketchPath} from './Sketch';

export type MapLocation = {
  id: string;
  label: string;
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
};

type MapProps = {
  locations?: MapLocation[];
  highlighted?: string[];
  showLabels?: boolean;
  accent?: string;
  drawProgress?: number;
  style?: React.CSSProperties;
};

const SOUTH_ASIA = 'M260 70 C315 42 382 50 424 84 C465 116 505 145 551 166 C589 184 612 220 605 254 C598 286 620 314 595 343 C571 369 548 399 528 436 C510 467 483 483 457 451 C437 427 424 400 401 381 C373 357 340 342 313 319 C286 297 274 266 257 239 C237 208 215 186 220 154 C224 119 235 91 260 70 Z';
const NORTH_WEST = 'M258 70 C219 53 173 65 142 91 C114 115 103 146 113 171 C125 197 153 203 182 192 L223 174 C246 159 264 133 274 105 Z';

export const Map: React.FC<MapProps> = ({
  locations = [],
  highlighted = [],
  showLabels = true,
  accent = COLORS.saffron,
  drawProgress = 1,
  style,
}) => {
  const highlightedSet = new Set(highlighted);
  const safeDrawProgress = clamp01(drawProgress);
  return (
    <svg
      viewBox="0 0 760 520"
      role="img"
      aria-label="Stylized map of South Asia"
      style={{width: '100%', height: '100%', overflow: 'visible', ...style}}
    >
      <SketchPath d="M74 424 C180 397 260 419 354 407 C465 393 564 398 683 367" stroke={COLORS.ink} strokeWidth={3} progress={safeDrawProgress} opacity={0.22} roughness={3} seed="map-coast" />
      <SketchPath d={NORTH_WEST} fill={highlightedSet.has('north-west') ? accent : '#d8c49a'} stroke={COLORS.ink} strokeWidth={5} progress={safeDrawProgress} roughness={3} seed="north-west" />
      <SketchPath d={SOUTH_ASIA} fill={highlightedSet.has('south-asia') || highlightedSet.has('india') ? accent : '#e7d5aa'} stroke={COLORS.ink} strokeWidth={5} progress={safeDrawProgress} roughness={3} seed="south-asia" />
      <SketchPath d="M275 106 C320 150 364 166 421 184 C462 198 517 204 594 254" stroke={COLORS.ink} strokeWidth={3} progress={safeDrawProgress} opacity={0.38} roughness={2} seed="map-river-1" />
      <SketchPath d="M310 317 C350 286 389 272 455 273 C505 274 551 296 594 342" stroke={COLORS.ink} strokeWidth={3} progress={safeDrawProgress} opacity={0.38} roughness={2} seed="map-river-2" />
      <SketchPath d="M442 377 C458 403 478 423 504 445" stroke={COLORS.ink} strokeWidth={3} progress={safeDrawProgress} opacity={0.3} roughness={2} seed="map-river-3" />
      {showLabels && <text x="369" y="250" fill={COLORS.ink} fontFamily={fontStack} fontSize="25" fontWeight="700" textAnchor="middle" opacity={safeDrawProgress * 0.48} transform="rotate(-3 369 250)">INDIAN SUBCONTINENT?</text>}
      {locations.map((location) => {
        const active = highlightedSet.has(location.id);
        const locationProgress = clamp01(safeDrawProgress * 1.45 - locations.indexOf(location) * 0.12);
        return (
          <g key={location.id} opacity={locationProgress}>
            <circle cx={location.x} cy={location.y} r={active ? 12 : 8} fill={active ? COLORS.terracotta : COLORS.white} stroke={COLORS.ink} strokeWidth="4" />
            {showLabels && (
              <text
                x={location.x + 18}
                y={location.y + 8}
                fill={COLORS.ink}
                fontFamily={fontStack}
                fontSize="23"
                fontWeight="700"
                textAnchor={location.anchor ?? 'start'}
                transform={`rotate(-2 ${location.x + 18} ${location.y + 8})`}
              >
                {location.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
