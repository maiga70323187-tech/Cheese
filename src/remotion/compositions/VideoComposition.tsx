import React from "react";
import { AbsoluteFill } from "remotion";
import type { Scenario } from "../../scenario/schema";
import { SceneSequence } from "../../engine/SceneSequence";

export type VideoCompositionProps = {
  scenario: Scenario;
};

/** Shared root rendered by VideoVertical / VideoLandscape / VideoSquare — the only difference between them is the format baked into `scenario.format` by `calculateMetadata`. */
export const VideoComposition: React.FC<VideoCompositionProps> = ({ scenario }) => (
  <AbsoluteFill>
    <SceneSequence scenario={scenario} />
  </AbsoluteFill>
);
