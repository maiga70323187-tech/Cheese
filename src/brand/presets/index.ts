import type { BrandTheme } from "../schema";
import { luxuryDark } from "./luxury-dark";
import { premiumTech } from "./premium-tech";
import { minimalLight } from "./minimal-light";
import { editorial } from "./editorial";
import { vibrantStartup } from "./vibrant-startup";

export { luxuryDark, premiumTech, minimalLight, editorial, vibrantStartup };

export const brandThemePresets: Record<string, BrandTheme> = {
  [luxuryDark.id]: luxuryDark,
  [premiumTech.id]: premiumTech,
  [minimalLight.id]: minimalLight,
  [editorial.id]: editorial,
  [vibrantStartup.id]: vibrantStartup,
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
