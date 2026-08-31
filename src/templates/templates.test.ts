import { describe, expect, it } from "vitest";
import { listTemplates, getTemplate, videoTemplates } from "./index";
import { safeParseScenario } from "../scenario/schema";
import { brandThemePresets } from "../brand/presets";

describe("bibliothèque de templates", () => {
  it("expose au moins 6 templates, tous avec prompt et checklist", () => {
    const all = listTemplates();
    expect(all.length).toBeGreaterThanOrEqual(6);
    for (const t of all) {
      expect(t.startingPrompt.length).toBeGreaterThan(20);
      expect(t.assetChecklist.length).toBeGreaterThan(0);
    }
  });

  it("chaque template construit un scénario valide (durées qui somment, schéma respecté)", () => {
    for (const t of listTemplates()) {
      const scenario = t.build();
      const res = safeParseScenario(scenario);
      expect(res.success, `template ${t.id} invalide`).toBe(true);
      const sum = scenario.scenes.reduce((s, sc) => s + sc.durationInSeconds, 0);
      expect(Math.abs(sum - scenario.durationInSeconds), `durées de ${t.id}`).toBeLessThan(0.05);
    }
  });

  it("applique les surcharges de thème et de format", () => {
    const scenario = getTemplate("product-launch")!.build({ themeId: "crimson-glow", format: "vertical" });
    expect(scenario.themeId).toBe("crimson-glow");
    expect(scenario.format).toBe("vertical");
  });

  it("les thèmes recommandés/par défaut existent dans les presets", () => {
    const scenario = videoTemplates["data-report"]!.build();
    expect(brandThemePresets[scenario.themeId]).toBeDefined();
  });
});
