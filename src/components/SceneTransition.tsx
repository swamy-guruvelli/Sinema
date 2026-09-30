import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

type SceneTransitionProps = {
  durationInFrames: number;
  children: React.ReactNode;
};

export const SceneTransition: React.FC<SceneTransitionProps> = ({durationInFrames, children}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [durationInFrames - 24, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lift = interpolate(frame, [0, 24], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut), transform: `translateY(${lift}px)`}}>{children}</AbsoluteFill>;
};
