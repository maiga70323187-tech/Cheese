import type { BrandTheme } from "../schema";

/**
 * "Énergique et coloré" — violet profond en fond (jamais noir), dégradé
 * magenta/orange, mouvement rapide et rebondissant.
 */
export const vibrantStartup: BrandTheme = {
  id: "vibrant-startup",
  name: "Vibrant Startup",
  description: "Identité énergique et colorée : violet profond, dégradés magenta/orange, mouvement rebondissant.",
  colors: {
    background: "#251c48",
    backgroundSecondary: "#2f2258",
    surface: "#362962",
    text: "#ffffff",
    textMuted: "#c8bdea",
    primary: "#ff5da2",
    secondary: "#ff9a3d",
    success: "#3ee08c",
    warning: "#ffcb47",
    danger: "#ff5c5c",
  },
  typography: {
    heading: "Clash Display",
    body: "Inter",
    label: "Inter",
    titleScale: [92, 62, 42, 28, 20],
  },
  spacing: [4, 8, 16, 24, 36, 52, 76],
  radius: {
    small: 10,
    medium: 20,
    large: 36,
  },
  shadows: {
    soft: "0 8px 24px rgba(22, 15, 43, 0.4)",
    elevated: "0 24px 64px rgba(22, 15, 43, 0.55)",
    glow: "0 0 110px rgba(255, 93, 162, 0.4)",
  },
  motion: {
    entrance: "scale",
    durationFrames: 22,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    spring: { damping: 10, mass: 0.7, stiffness: 220 },
  },
  background: {
    type: "gradient",
    colors: ["#251c48", "#2f2258", "#3d2468"],
    separationFromBlack: 0.28,
    vignette: 0.35,
    grain: 0.05,
    glow: true,
    particles: true,
  },
};
