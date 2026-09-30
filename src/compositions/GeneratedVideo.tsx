import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {BoardRenderer} from '../components/BoardRenderer';
import {FrameRenderer} from '../components/FrameRenderer';
import {getVideoDuration, type VideoSpec} from '../data/videoSpec';

export type GeneratedVideoProps = {
  spec: VideoSpec;
  includeAudio?: boolean;
};

export const GeneratedVideo: React.FC<GeneratedVideoProps> = ({spec, includeAudio = true}) => {
  let startFrame = 0;
  const transitionFrames = 14;
  return (
    <AbsoluteFill>
      {spec.scenes.map((scene, index) => {
        const Renderer = spec.productionType ? FrameRenderer : BoardRenderer;
        const from = startFrame;
        startFrame += scene.durationInFrames;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={scene.durationInFrames + (index < spec.scenes.length - 1 ? transitionFrames : 0)}>
            <Renderer
              scene={scene}
              transitionOutFrames={index < spec.scenes.length - 1 ? transitionFrames : 0}
              vertical={spec.format === 'youtube-9x16'}
            />
          </Sequence>
        );
      })}
      {includeAudio && spec.audio?.file && <Audio src={staticFile(spec.audio.file)} volume={spec.audio.volume ?? 0.84} />}
      {includeAudio && spec.audio?.backgroundFile && <Audio src={staticFile(spec.audio.backgroundFile)} loop volume={spec.audio.backgroundVolume ?? 0.08} />}
    </AbsoluteFill>
  );
};

export const generatedVideoDuration = getVideoDuration;
