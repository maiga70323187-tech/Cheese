import { describe, expect, it } from "vitest";
import { brandThemeSchema, safeParseBrandTheme } from "./schema";
import { brandThemePresets, listBrandThemes } from "./presets/index";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

/** Relative luminance (WCAG), 0 = black, 1 = white. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const linear = (c: number) => {
    const normalized = c / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

describe("brandThemeSchema", () => {
  it("accepts every shipped preset", () => {
    for (const theme of listBrandThemes()) {
      expect(() => brandThemeSchema.parse(theme)).not.toThrow();
    }
  });

  it("rejects a theme with an invalid hex color", () => {
    const invalid = {
      ...brandThemePresets["premium-tech"],
      colors: { ...brandThemePresets["premium-tech"]!.colors, primary: "not-a-color" },
    };
    const result = safeParseBrandTheme(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects a theme missing required fields", () => {
    const result = safeParseBrandTheme({ id: "incomplete" });
    expect(result.success).toBe(false);
  });

  it("every color is a well-formed hex string", () => {
    for (const theme of listBrandThemes()) {
      for (const [role, value] of Object.entries(theme.colors)) {
        if (value === undefined) continue;
        expect(value, `${theme.id}.colors.${role}`).toMatch(/^#[0-9a-fA-F]{3,8}$/);
      }
    }
  });
});

describe("premium background never disappears into black", () => {
  const darkPresetIds = ["luxury-dark", "premium-tech", "vibrant-startup", "crimson-glow", "emerald-glow"];

  it.each(darkPresetIds)("%s background stays measurably above pure black", (id) => {
    const theme = brandThemePresets[id]!;
    const luminance = relativeLuminance(theme.colors.background);
    // Pure black has luminance 0. Premium dark themes must sit clearly above it.
    expect(luminance).toBeGreaterThan(0.01);
    expect(theme.background.separationFromBlack).toBeGreaterThan(0);
  });

  it.each(darkPresetIds)("%s subject (primary) reads clearly against the background", (id) => {
    const theme = brandThemePresets[id]!;
    const bgLuminance = relativeLuminance(theme.colors.background);
    const primaryLuminance = relativeLuminance(theme.colors.primary);
    // The accent used to draw the eye (glow, CTA, phone rim light) must be
    // meaningfully brighter than the backdrop it sits on.
    expect(primaryLuminance - bgLuminance).toBeGreaterThan(0.05);
  });
});
