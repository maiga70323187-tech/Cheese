import React from "react";
import { AbsoluteFill } from "remotion";
import type { Scenario } from "../../scenario/schema";
import { SceneSequence } from "../../engine/SceneSequence";
import { ensureBrandFontsLoaded } from "../../brand/fonts";

export type VideoCompositionProps = {
  scenario: Scenario;
};

/** Shared root rendered by VideoVertical / VideoLandscape / VideoSquare — the only difference between them is the format baked into `scenario.format` by `calculateMetadata`. */
export const VideoComposition: React.FC<VideoCompositionProps> = ({ scenario }) => {
  // Charge les vraies polices embarquées (public/fonts) et bloque le rendu
  // jusqu'à ce qu'elles soient prêtes, sur chaque composition. Idempotent.
  ensureBrandFontsLoaded();

  return (
    <AbsoluteFill>
      <SceneSequence scenario={scenario} />
    </AbsoluteFill>
  );
};
