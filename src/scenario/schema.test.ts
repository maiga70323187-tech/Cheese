import { describe, expect, it } from "vitest";
import { safeParseScenario, scenarioDurationInFrames, sceneFrameRanges } from "./schema";
import { phoneAppAdScenario } from "./examples/phone-app-ad";

describe("scenarioSchema", () => {
  it("accepts the reference phone-app-ad scenario", () => {
    const result = safeParseScenario(phoneAppAdScenario);
    expect(result.success).toBe(true);
  });

  it("rejects an unknown scene type", () => {
    const invalid = {
      ...phoneAppAdScenario,
      scenes: [{ type: "not-a-scene", durationInSeconds: 2 }],
    };
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a scenario whose scene durations don't sum to durationInSeconds", () => {
    const invalid = {
      ...phoneAppAdScenario,
      durationInSeconds: 999,
    };
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a scene with a non-positive duration", () => {
    const invalid = {
      ...phoneAppAdScenario,
      scenes: [{ type: "intro", durationInSeconds: 0, title: "x" }],
    };
    const result = safeParseScenario(invalid);
    expect(result.success).toBe(false);
  });

  it("computes a deterministic total frame count from fps and duration", () => {
    expect(scenarioDurationInFrames(phoneAppAdScenario)).toBe(360); // 12s * 30fps
  });

  it("lays out scenes back-to-back with no gap or overlap", () => {
    const ranges = sceneFrameRanges(phoneAppAdScenario);
    expect(ranges).toHaveLength(3);
    expect(ranges[0]!.from).toBe(0);
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i]!.from).toBe(ranges[i - 1]!.from + ranges[i - 1]!.durationInFrames);
    }
    const total = ranges.reduce((sum, r) => sum + r.durationInFrames, 0);
    expect(total).toBe(scenarioDurationInFrames(phoneAppAdScenario));
  });
});
