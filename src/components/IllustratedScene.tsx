import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export type CameraMotion = {
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
  fromScale?: number;
  toScale?: number;
  startFrame?: number;
  endFrame?: number;
};

type IllustratedSceneProps = {
  background: string;
  durationInFrames: number;
  camera?: CameraMotion;
  children: React.ReactNode;
};

type IllustratedLayerProps = {
  src: string;
  width: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  enterStart?: number;
  enterEnd?: number;
  exitStart?: number;
  exitEnd?: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
  sway?: number;
  opacity?: number;
  children?: React.ReactNode;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const IllustratedScene: React.FC<IllustratedSceneProps> = ({
  background,
  durationInFrames,
  camera = {},
  children,
}) => {
  const frame = useCurrentFrame();
  const start = camera.startFrame ?? 0;
  const end = camera.endFrame ?? durationInFrames;
  const progress = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(progress, [0, 1], [camera.fromX ?? 0, camera.toX ?? 0]);
  const y = interpolate(progress, [0, 1], [camera.fromY ?? 0, camera.toY ?? 0]);
  const scale = interpolate(progress, [0, 1], [camera.fromScale ?? 1, camera.toScale ?? 1]);

  return (
    <AbsoluteFill style={{backgroundColor: '#2d201b', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <Img
          src={staticFile(background)}
          style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
        />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(16, 21, 28, 0.04), rgba(27, 15, 12, 0.22))'}} />
        {children}
      </AbsoluteFill>
      <AbsoluteFill
        aria-hidden="true"
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(18, 12, 10, 0.32) 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)',
          mixBlendMode: 'multiply',
          opacity: 0.72,
        }}
      />
    </AbsoluteFill>
  );
};

export const IllustratedLayer: React.FC<IllustratedLayerProps> = ({
  src,
  width,
  left,
  right,
  top,
  bottom,
  enterStart = 0,
  enterEnd = enterStart + 24,
  exitStart,
  exitEnd,
  offsetX = 80,
  offsetY = 30,
  rotation = 0,
  sway = 0,
  opacity = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [enterStart, enterEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exit = exitStart === undefined || exitEnd === undefined
    ? 1
    : interpolate(frame, [exitStart, exitEnd], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
  const swayOffset = sway === 0 ? 0 : Math.sin((frame + enterStart) / 24) * sway;
  const lift = (1 - enter) * offsetY;
  const slide = (1 - enter) * offsetX;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        right,
        top,
        bottom,
        width,
        opacity: clamp(enter) * clamp(exit) * opacity,
        transform: `translate3d(${slide}px, ${lift + swayOffset}px, 0) rotate(${rotation}deg)`,
        transformOrigin: '50% 100%',
        filter: 'drop-shadow(0 18px 14px rgba(24, 15, 11, 0.3))',
      }}
    >
      <Img src={staticFile(src)} style={{width: '100%', height: 'auto', display: 'block'}} />
      {children}
    </div>
  );
};
