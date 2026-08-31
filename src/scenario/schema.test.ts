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

describe("scènes graphiques", () => {
  function wrap(scene: Record<string, unknown>) {
    return safeParseScenario({ format: "landscape", fps: 30, durationInSeconds: 3, themeId: "premium-tech", scenes: [{ durationInSeconds: 3, ...scene }] });
  }

  it("accepte bar-chart / line-chart / comparison bien formés", () => {
    expect(wrap({ type: "bar-chart", data: [{ label: "A", value: 1 }, { label: "B", value: 2 }] }).success).toBe(true);
    expect(wrap({ type: "line-chart", data: [{ label: "J", value: 5 }, { label: "F", value: 9 }] }).success).toBe(true);
    expect(wrap({ type: "comparison", before: { label: "Avant", value: 5 }, after: { label: "Après", value: 1 } }).success).toBe(true);
  });

  it("applique betterWhen: 'higher' par défaut sur comparison", () => {
    const res = wrap({ type: "comparison", before: { label: "a", value: 1 }, after: { label: "b", value: 2 } });
    expect(res.success).toBe(true);
    if (res.success) {
      const scene = res.data.scenes[0]!;
      expect(scene.type === "comparison" && scene.betterWhen).toBe("higher");
    }
  });

  it("rejette un bar-chart avec moins de 2 points ou une valeur non numérique", () => {
    expect(wrap({ type: "bar-chart", data: [{ label: "A", value: 1 }] }).success).toBe(false);
    expect(wrap({ type: "bar-chart", data: [{ label: "A", value: "beaucoup" }, { label: "B", value: 2 }] }).success).toBe(false);
  });
});
