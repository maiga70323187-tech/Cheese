import React, { createContext, useContext } from "react";
import type { BrandTheme } from "../brand/schema";

const BrandThemeContext = createContext<BrandTheme | null>(null);

export const BrandThemeProvider: React.FC<{ theme: BrandTheme; children: React.ReactNode }> = ({
  theme,
  children,
}) => <BrandThemeContext.Provider value={theme}>{children}</BrandThemeContext.Provider>;

/**
 * Every scene reads its colors/typography/motion through this hook — never
 * from an imported constant. Swapping the theme swaps the whole video.
 */
export function useBrandTheme(): BrandTheme {
  const theme = useContext(BrandThemeContext);
  if (!theme) {
    throw new Error("useBrandTheme() must be called within a <BrandThemeProvider>.");
  }
  return theme;
}
