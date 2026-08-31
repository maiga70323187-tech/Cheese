import { describe, expect, it } from "vitest";
import { DASHBOARD_PRESETS, resolveDashboardPreset } from "./dashboard-data";
import type { DashboardVariant } from "./dashboard-data";

const VARIANTS: DashboardVariant[] = ["analytics", "sales", "social", "finance"];

describe("dashboard-data", () => {
  it.each(VARIANTS)("%s preset has a title, at least one metric and at least one bar", (variant) => {
    const preset = DASHBOARD_PRESETS[variant];
    expect(preset.title.length).toBeGreaterThan(0);
    expect(preset.metrics.length).toBeGreaterThan(0);
    expect(preset.bars.length).toBeGreaterThan(0);
    for (const bar of preset.bars) {
      expect(bar).toBeGreaterThan(0);
      expect(bar).toBeLessThanOrEqual(1);
    }
  });

  it("resolveDashboardPreset falls back to the variant's defaults when no override is given", () => {
    const resolved = resolveDashboardPreset("analytics");
    expect(resolved).toEqual(DASHBOARD_PRESETS["analytics"]);
  });

  it("resolveDashboardPreset applies a scenario-provided title/metrics override without touching bars", () => {
    const resolved = resolveDashboardPreset("sales", {
      title: "Q4",
      metrics: [{ label: "Custom", value: "1" }],
    });
    expect(resolved.title).toBe("Q4");
    expect(resolved.metrics).toEqual([{ label: "Custom", value: "1" }]);
    expect(resolved.bars).toEqual(DASHBOARD_PRESETS["sales"].bars);
  });
});
