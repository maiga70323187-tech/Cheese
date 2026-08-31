import type { BrandTheme } from "../schema";

/**
 * "Vert néon" — noir verdâtre profond, vert émeraude lumineux, cartes
 * data/finance en verre glow. Référence : cartes "Sales by Day" / courbes
 * de conversion vert néon sur fond noir.
 */
export const emeraldGlow: BrandTheme = {
  id: "emerald-glow",
  name: "Emerald Glow",
  description: "Identité vert néon : noir verdâtre, émeraude lumineux, cartes data en verre.",
  colors: {
    background: "#132018",
    backgroundSecondary: "#18291e",
    surface: "#1c2e23",
    text: "#eafff2",
    textMuted: "#9cc4ab",
    primary: "#32e17a",
    secondary: "#8cf0b0",
    success: "#32e17a",
    warning: "#ffcf5c",
    danger: "#ff6161",
  },
  typography: {
    heading: "General Sans",
    body: "Inter",
    label: "IBM Plex Mono",
    titleScale: [86, 58, 40, 27, 20],
  },
  spacing: [4, 8, 12, 20, 32, 48, 72],
  radius: {
    small: 8,
    medium: 20,
    large: 34,
  },
  shadows: {
    soft: "0 8px 22px rgba(4, 16, 10, 0.45)",
    elevated: "0 22px 56px rgba(4, 16, 10, 0.6)",
    glow: "0 0 100px rgba(50, 225, 122, 0.4)",
  },
  motion: {
    entrance: "spring",
    durationFrames: 22,
    easing: "cubic-bezier(0.18, 1, 0.32, 1)",
    spring: { damping: 14, mass: 0.8, stiffness: 190 },
  },
  background: {
    type: "radial",
    colors: ["#18291e", "#132018", "#1f3527"],
    separationFromBlack: 0.22,
    vignette: 0.45,
    grain: 0.03,
    glow: true,
    particles: false,
  },
};
