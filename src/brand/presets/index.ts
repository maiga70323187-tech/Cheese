import type { BrandTheme } from "../schema";
import { luxuryDark } from "./luxury-dark";
import { premiumTech } from "./premium-tech";
import { minimalLight } from "./minimal-light";
import { editorial } from "./editorial";
import { vibrantStartup } from "./vibrant-startup";
import { crimsonGlow } from "./crimson-glow";
import { emeraldGlow } from "./emerald-glow";

export { luxuryDark, premiumTech, minimalLight, editorial, vibrantStartup, crimsonGlow, emeraldGlow };

export const brandThemePresets: Record<string, BrandTheme> = {
  [luxuryDark.id]: luxuryDark,
  [premiumTech.id]: premiumTech,
  [minimalLight.id]: minimalLight,
  [editorial.id]: editorial,
  [vibrantStartup.id]: vibrantStartup,
  [crimsonGlow.id]: crimsonGlow,
  [emeraldGlow.id]: emeraldGlow,
};

export function getBrandTheme(themeId: string): BrandTheme {
  const theme = brandThemePresets[themeId];
  if (!theme) {
    const available = Object.keys(brandThemePresets).join(", ");
    throw new Error(`Charte graphique inconnue: "${themeId}". Chartes disponibles: ${available}`);
  }
  return theme;
}

export function listBrandThemes(): BrandTheme[] {
  return Object.values(brandThemePresets);
}
