import React from 'react';
import {BoardRenderer} from '../components/BoardRenderer';
import type {VideoScene} from '../data/videoSpec';

export type BoardPreviewProps = {scene: VideoScene};

export const BoardPreview: React.FC<BoardPreviewProps> = ({scene}) => <BoardRenderer scene={scene} />;
