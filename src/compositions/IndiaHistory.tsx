import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {getScenes, type SceneSpec} from '../data/sceneManifest';
import {PlaceholderScene} from '../scenes/PlaceholderScene';
import {Scene01BeforeIndia} from '../scenes/Scene01BeforeIndia';
import {Scene02IndusValley} from '../scenes/Scene02IndusValley';

export type IndiaHistoryProps = {sceneIds: string[]; includeAudio?: boolean};

const SceneView: React.FC<{scene: SceneSpec}> = ({scene}) => {
  if (scene.id === '01') return <Scene01BeforeIndia durationInFrames={scene.durationInFrames} />;
  if (scene.id === '02') return <Scene02IndusValley durationInFrames={scene.durationInFrames} />;
  return <PlaceholderScene scene={scene} />;
};

export const IndiaHistory: React.FC<IndiaHistoryProps> = ({sceneIds, includeAudio = false}) => {
  const scenes = getScenes(sceneIds);
  let from = 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#f7f0df'}}>
      {scenes.map((scene) => {
        const start = from;
        from += scene.durationInFrames;
        return (
          <Sequence key={scene.id} from={start} durationInFrames={scene.durationInFrames} name={`Scene ${scene.id}`}>
            <SceneView scene={scene} />
            {includeAudio && scene.audioFile && <Audio src={staticFile(scene.audioFile)} volume={0.72} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
