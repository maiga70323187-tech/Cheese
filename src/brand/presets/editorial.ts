import type { BrandTheme } from "../schema";

/**
 * "Éditorial" — papier crème, encre profonde, accent bordeaux ; typographie
 * serif dominante, mouvement lent façon page qui se tourne.
 */
export const editorial: BrandTheme = {
  id: "editorial",
  name: "Editorial",
  description: "Identité éditoriale : papier crème, encre profonde, accents bordeaux.",
  colors: {
    background: "#efe9de",
    backgroundSecondary: "#e5ddcd",
    surface: "#faf7f0",
    text: "#241f1a",
    textMuted: "#6f6455",
    primary: "#7a2331",
    secondary: "#3c3a2f",
    success: "#3d6b4f",
    warning: "#a3711f",
    danger: "#7a2331",
  },
  typography: {
    heading: "Tiempos Headline",
    body: "Tiempos Text",
    label: "Inter",
    titleScale: [80, 56, 38, 26, 19],
  },
  spacing: [4, 8, 16, 28, 44, 64, 88],
  radius: {
    small: 0,
    medium: 2,
    large: 4,
  },
  shadows: {
    soft: "0 4px 14px rgba(36, 31, 26, 0.1)",
    elevated: "0 16px 40px rgba(36, 31, 26, 0.16)",
  },
  motion: {
    entrance: "slide",
    durationFrames: 30,
    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
  },
  background: {
    type: "solid",
    colors: ["#efe9de"],
    separationFromBlack: 0.95,
    vignette: 0.12,
    grain: 0.1,
    glow: false,
    particles: false,
  },
};
