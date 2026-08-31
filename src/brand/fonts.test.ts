import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BRAND_FONTS } from "./fonts";
import { brandThemePresets } from "./presets";

/** Familles réellement embarquées (fichiers woff2 présents dans public/). */
const shippedFamilies = new Set(BRAND_FONTS.map((f) => f.family));

/** Mots-clés génériques CSS admis comme *fallback* (jamais en première position). */
const genericKeywords = new Set(["serif", "sans-serif", "monospace", "system-ui", "ui-monospace", "ui-serif", "ui-sans-serif"]);

/** Extrait la première famille d'une pile CSS `"'Space Grotesk', 'Inter', sans-serif"` -> `Space Grotesk`. */
function primaryFamily(stack: string): string {
  return (stack.split(",")[0] ?? "").trim().replace(/^['"]|['"]$/g, "");
}

describe("polices embarquées", () => {
  it("chaque fichier woff2 déclaré dans BRAND_FONTS existe réellement sous public/", () => {
    for (const font of BRAND_FONTS) {
      const filePath = path.resolve(__dirname, "../../public", font.file);
      expect(existsSync(filePath), `manquant: public/${font.file}`).toBe(true);
    }
  });

  it("la famille primaire de chaque typographie de preset est réellement embarquée (jamais un nom non fourni)", () => {
    for (const [id, theme] of Object.entries(brandThemePresets)) {
      for (const role of ["heading", "body", "label"] as const) {
        const value = theme.typography[role];
        if (!value) continue;
        const primary = primaryFamily(value);
        expect(
          shippedFamilies.has(primary),
          `preset "${id}" — typography.${role} commence par "${primary}", qui n'est pas une police embarquée (${[...shippedFamilies].join(", ")})`,
        ).toBe(true);
      }
    }
  });

  it("chaque pile de polices se termine par un fallback générique", () => {
    for (const [id, theme] of Object.entries(brandThemePresets)) {
      for (const role of ["heading", "body", "label"] as const) {
        const value = theme.typography[role];
        if (!value) continue;
        const last = (value.split(",").pop() ?? "").trim().replace(/^['"]|['"]$/g, "").toLowerCase();
        // Georgia (serif) est un fallback système acceptable en avant-dernier,
        // mais la pile doit finir par un mot-clé générique CSS.
        expect(
          genericKeywords.has(last),
          `preset "${id}" — typography.${role} ne finit pas par un générique CSS (trouvé "${last}")`,
        ).toBe(true);
      }
    }
  });
});
