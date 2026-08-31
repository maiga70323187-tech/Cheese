import type { BrandTheme } from "../schema";

/**
 * "Minimaliste" — fond clair quasi blanc cassé, contraste doux, mouvement
 * sobre. Sert aussi de contre-exemple : ce thème n'a pas à séparer un fond
 * du noir puisqu'il n'est pas sombre (separationFromBlack reste défini pour
 * satisfaire le schéma mais n'est pas contraint par le test de lisibilité).
 */
export const minimalLight: BrandTheme = {
  id: "minimal-light",
  name: "Minimal Light",
  description: "Identité minimaliste : fond clair, typographie sobre, mouvement discret.",
  colors: {
    background: "#f7f6f3",
    backgroundSecondary: "#efeee9",
    surface: "#ffffff",
    text: "#1c1b19",
    textMuted: "#6b6862",
    primary: "#1c1b19",
    secondary: "#8a8680",
    success: "#2f8f5b",
    warning: "#b8791f",
    danger: "#b23a3a",
  },
  typography: {
    heading: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    label: "'Inter', system-ui, sans-serif",
    titleScale: [72, 52, 36, 24, 18],
  },
  spacing: [4, 8, 16, 24, 40, 56, 80],
  radius: {
    small: 2,
    medium: 6,
    large: 12,
  },
  shadows: {
    soft: "0 2px 8px rgba(20, 20, 20, 0.06)",
    elevated: "0 12px 32px rgba(20, 20, 20, 0.1)",
  },
  motion: {
    entrance: "fade",
    durationFrames: 20,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  background: {
    type: "solid",
    colors: ["#f7f6f3"],
    separationFromBlack: 1,
    vignette: 0.05,
    glow: false,
    particles: false,
  },
};
