import type { BrandTheme } from "../schema";

/**
 * "Technologie" — bleu nuit profond, cyan électrique, mouvement rapide et
 * précis façon interface produit.
 */
export const premiumTech: BrandTheme = {
  id: "premium-tech",
  name: "Premium Tech",
  description: "Identité technologie : bleu nuit, cyan électrique, animations précises.",
  colors: {
    background: "#131d36",
    backgroundSecondary: "#182544",
    surface: "#1c2c52",
    text: "#eaf2ff",
    textMuted: "#8fa2c4",
    primary: "#3fd0ff",
    secondary: "#7c6bff",
    success: "#3fe0a8",
    warning: "#f2b544",
    danger: "#ff5c72",
  },
  typography: {
    heading: "Space Grotesk",
    body: "Inter",
    label: "IBM Plex Mono",
    titleScale: [88, 60, 40, 28, 20],
  },
  spacing: [4, 8, 12, 20, 32, 48, 72, 104],
  radius: {
    small: 6,
    medium: 14,
    large: 28,
  },
  shadows: {
    soft: "0 6px 20px rgba(0, 0, 0, 0.4)",
    elevated: "0 20px 56px rgba(0, 0, 0, 0.55)",
    glow: "0 0 96px rgba(63, 208, 255, 0.35)",
  },
  motion: {
    entrance: "spring",
    durationFrames: 24,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    spring: { damping: 16, mass: 0.8, stiffness: 170 },
  },
  background: {
    type: "gradient",
    colors: ["#131d36", "#182544", "#1c2c52"],
    separationFromBlack: 0.2,
    vignette: 0.45,
    grain: 0.04,
    glow: true,
    particles: true,
  },
};
