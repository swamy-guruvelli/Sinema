import React from 'react';
import {Composition} from 'remotion';
import {IndiaHistory, type IndiaHistoryProps} from './compositions/IndiaHistory';
import {DoodleMotionTest, type DoodleMotionTestProps} from './compositions/DoodleMotionTest';
import {DoodleStoryTest, type DoodleStoryTestProps} from './compositions/DoodleStoryTest';
import {EditorialCartoonPilot, type EditorialCartoonPilotProps} from './compositions/EditorialCartoonPilot';
import {GitBasics, type GitBasicsProps} from './compositions/GitBasics';
import {BrowserWalkthrough, type BrowserWalkthroughProps} from './compositions/BrowserWalkthrough';
import {CharacterApproval, getCharacterApprovalDuration, type CharacterApprovalManifest, type CharacterApprovalProps} from './compositions/CharacterApproval';
import {GeneratedVideo, type GeneratedVideoProps, generatedVideoDuration} from './compositions/GeneratedVideo';
import {BoardPreview, type BoardPreviewProps} from './compositions/BoardPreview';
import {ProductionBoard, getProductionBoardDuration} from './compositions/ProductionBoard';
import {RichExplainGitBasics, type RichExplainGitBasicsProps} from './compositions/RichExplainGitBasics';
import type {VideoSpec} from './data/videoSpec';
import characterApproval from '../props/character-approval.json';
import edaVideo from '../videos/eda/video.json';
import {DEMO_MINDKRAFT_TOUR_MANIFEST} from './data/mindkraftTour';
import {getWalkthroughDurationInFrames} from './data/walkthrough';
import {
  getSceneDuration,
  getScenes,
  PILOT_SCENE_IDS,
  TOTAL_DURATION_IN_FRAMES,
} from './data/sceneManifest';

const defaultProps: IndiaHistoryProps = {sceneIds: PILOT_SCENE_IDS, includeAudio: true};
const doodleTestProps: DoodleMotionTestProps = {includeAudio: true};
const doodleStoryTestProps: DoodleStoryTestProps = {includeAudio: true};
const editorialCartoonPilotProps: EditorialCartoonPilotProps = {includeAudio: true};
const gitBasicsProps: GitBasicsProps = {};
const browserWalkthroughProps: BrowserWalkthroughProps = {manifest: DEMO_MINDKRAFT_TOUR_MANIFEST, includeAudio: true};
const characterApprovalProps: CharacterApprovalProps = {approval: characterApproval as CharacterApprovalManifest};
const exampleVideoSpec = edaVideo as unknown as VideoSpec;
const generatedVideoProps: GeneratedVideoProps = {spec: exampleVideoSpec, includeAudio: true};
const boardScenes = {
  paper: exampleVideoSpec.scenes.find((scene) => scene.board === 'paper')!,
  editorial: exampleVideoSpec.scenes.find((scene) => scene.board === 'editorial')!,
  lesson: exampleVideoSpec.scenes.find((scene) => scene.board === 'lesson')!,
};
const paperBoardProps: BoardPreviewProps = {scene: boardScenes.paper};
const editorialBoardProps: BoardPreviewProps = {scene: boardScenes.editorial};
const lessonBoardProps: BoardPreviewProps = {scene: boardScenes.lesson};
const richExplainGitBasicsProps: RichExplainGitBasicsProps = {includeAudio: true};

const approvalGate = <Props extends object>(Component: React.ComponentType<Props>): React.FC<Props> => {
  const Gated: React.FC<Props> = (props) => (
    characterApproval.status === 'approved'
      ? <Component {...props} />
      : <CharacterApproval approval={characterApproval as CharacterApprovalManifest} />
  );
  Gated.displayName = `ApprovalGate(${Component.displayName ?? Component.name ?? 'Composition'})`;
  return Gated;
};

const GatedGitBasics = approvalGate(GitBasics);
const GatedIndiaHistory = approvalGate(IndiaHistory);
const GatedDoodleMotionTest = approvalGate(DoodleMotionTest);
const GatedDoodleStoryTest = approvalGate(DoodleStoryTest);
const GatedEditorialCartoonPilot = approvalGate(EditorialCartoonPilot);
const GatedBrowserWalkthrough = approvalGate(BrowserWalkthrough);
const GatedGeneratedVideo = approvalGate(GeneratedVideo);
const GatedBoardPreview = approvalGate(BoardPreview);

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GitBasics"
        component={GatedGitBasics}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={gitBasicsProps}
      />
      <Composition
        id="IndiaHistory"
        component={GatedIndiaHistory}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={({props}) => ({
          durationInFrames: getScenes(props.sceneIds).reduce(
            (total, scene) => total + getSceneDuration(scene.id),
            0,
          ),
        })}
      />
      <Composition
        id="DoodleMotionTest"
        component={GatedDoodleMotionTest}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={doodleTestProps}
      />
      <Composition
        id="DoodleStoryTest"
        component={GatedDoodleStoryTest}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={doodleStoryTestProps}
      />
      <Composition
        id="EditorialCartoonPilot"
        component={GatedEditorialCartoonPilot}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={editorialCartoonPilotProps}
      />
      <Composition
        id="BrowserWalkthrough"
        component={GatedBrowserWalkthrough}
        durationInFrames={getWalkthroughDurationInFrames(DEMO_MINDKRAFT_TOUR_MANIFEST)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={browserWalkthroughProps}
        calculateMetadata={({props}) => ({
          durationInFrames: getWalkthroughDurationInFrames(props.manifest, props.audioMetadata),
        })}
      />
      <Composition
        id="CharacterApproval"
        component={CharacterApproval}
        durationInFrames={getCharacterApprovalDuration()}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={characterApprovalProps}
      />
      <Composition
        id="GeneratedVideo"
        component={GatedGeneratedVideo}
        durationInFrames={generatedVideoDuration(exampleVideoSpec)}
        fps={exampleVideoSpec.fps}
        width={exampleVideoSpec.format === 'youtube-9x16' ? 1080 : 1920}
        height={exampleVideoSpec.format === 'youtube-9x16' ? 1920 : 1080}
        defaultProps={generatedVideoProps}
        calculateMetadata={({props}) => ({
          durationInFrames: generatedVideoDuration(props.spec),
          fps: props.spec.fps,
          width: props.spec.format === 'youtube-9x16' ? 1080 : 1920,
          height: props.spec.format === 'youtube-9x16' ? 1920 : 1080,
        })}
      />
      <Composition
        id="BoardPaper"
        component={GatedBoardPreview}
        durationInFrames={boardScenes.paper.durationInFrames}
        fps={exampleVideoSpec.fps}
        width={1920}
        height={1080}
        defaultProps={paperBoardProps}
      />
      <Composition
        id="BoardEditorial"
        component={GatedBoardPreview}
        durationInFrames={boardScenes.editorial.durationInFrames}
        fps={exampleVideoSpec.fps}
        width={1920}
        height={1080}
        defaultProps={editorialBoardProps}
      />
      <Composition
        id="BoardLesson"
        component={GatedBoardPreview}
        durationInFrames={boardScenes.lesson.durationInFrames}
        fps={exampleVideoSpec.fps}
        width={1920}
        height={1080}
        defaultProps={lessonBoardProps}
      />
      <Composition
        id="ProductionBoard"
        component={ProductionBoard}
        durationInFrames={getProductionBoardDuration()}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RichExplainGitBasics"
        component={RichExplainGitBasics}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={richExplainGitBasicsProps}
      />
    </>
  );
};
