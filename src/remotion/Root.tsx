import React from "react";
import { Composition } from "remotion";
import { z } from "zod";
import { FORMAT_DIMENSIONS, scenarioDurationInFrames, scenarioSchema, type Scenario, type VideoFormat } from "../scenario/schema";
import { phoneAppAdScenario } from "../scenario/examples/phone-app-ad";
import type { VideoCompositionProps } from "./compositions/VideoComposition";
import { VideoVertical } from "./compositions/VideoVertical";
import { VideoLandscape } from "./compositions/VideoLandscape";
import { VideoSquare } from "./compositions/VideoSquare";

/**
 * `z.custom` (rather than the full `scenarioSchema`) keeps `z.input` and
 * `z.output` identical to `Scenario`, so TypeScript can align this schema
 * with `VideoCompositionProps` exactly — while still validating at runtime
 * against `scenarioSchema` (a `Scenario` is a large discriminated-union
 * document meant to be produced by `brief-to-scenario.ts` or hand-authored
 * JSON, not hand-edited field-by-field in the Studio props panel, so no
 * generated form is needed here).
 */
const compositionPropsSchema = z.object({
  scenario: z.custom<Scenario>((value) => scenarioSchema.safeParse(value).success, {
    message: "scenario ne respecte pas scenarioSchema",
  }),
});

/**
 * Dimensions, fps and duration are never hard-coded per composition: they
 * are all derived from the `Scenario` passed as props, via Remotion's
 * `calculateMetadata`. Rendering the same scenario through a different
 * composition id changes nothing except the forced `format`.
 *
 * The three `calculateMetadata` callbacks below stay inline (not factored
 * into a shared typed function) so TypeScript can contextually infer their
 * `props` parameter from each `<Composition>`'s own generic instantiation —
 * extracting them into an independently-typed helper defeats that
 * inference and collapses `Props` back to `Record<string, unknown>`.
 */
function computeMetadata(scenario: Scenario, format: VideoFormat) {
  const resolved: Scenario = { ...scenario, format };
  const { width, height } = FORMAT_DIMENSIONS[format];
  return {
    props: { scenario: resolved },
    durationInFrames: scenarioDurationInFrames(resolved),
    fps: resolved.fps,
    width,
    height,
  };
}

export const RemotionRoot: React.FC = () => (
  <>
    <Composition<typeof compositionPropsSchema, VideoCompositionProps>
      id="VideoVertical"
      component={VideoVertical}
      schema={compositionPropsSchema}
      defaultProps={{ scenario: phoneAppAdScenario }}
      calculateMetadata={({ props }) => computeMetadata(props.scenario, "vertical")}
    />
    <Composition<typeof compositionPropsSchema, VideoCompositionProps>
      id="VideoLandscape"
      component={VideoLandscape}
      schema={compositionPropsSchema}
      defaultProps={{ scenario: phoneAppAdScenario }}
      calculateMetadata={({ props }) => computeMetadata(props.scenario, "landscape")}
    />
    <Composition<typeof compositionPropsSchema, VideoCompositionProps>
      id="VideoSquare"
      component={VideoSquare}
      schema={compositionPropsSchema}
      defaultProps={{ scenario: phoneAppAdScenario }}
      calculateMetadata={({ props }) => computeMetadata(props.scenario, "square")}
    />
  </>
);
