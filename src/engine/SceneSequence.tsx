import React from "react";
import { Sequence } from "remotion";
import { getBrandTheme } from "../brand/presets/index";
import { sceneFrameRanges, type Scenario } from "../scenario/schema";
import { BrandThemeProvider } from "./theme-context";
import { renderScene } from "./registry";

export interface SceneSequenceProps {
  scenario: Scenario;
}

/**
 * The single composition every VideoVertical/Landscape/Square wraps: takes a
 * validated Scenario, resolves its theme, and lays each scene out as a
 * `<Sequence>` back-to-back at the scenario's fps — the same source of truth
 * used by `sceneFrameRanges()` in tests.
 */
export const SceneSequence: React.FC<SceneSequenceProps> = ({ scenario }) => {
  const theme = getBrandTheme(scenario.themeId);
  const ranges = sceneFrameRanges(scenario);

  return (
    <BrandThemeProvider theme={theme}>
      {ranges.map((range, index) => (
        <Sequence key={index} from={range.from} durationInFrames={range.durationInFrames}>
          {renderScene(range.scene, theme)}
        </Sequence>
      ))}
    </BrandThemeProvider>
  );
};
