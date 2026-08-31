import type { BrandTheme } from "../schema";

/**
 * "Rouge cinématographique" — noir rougeâtre profond, rouge incandescent en
 * accent, mouvement vif et anguleux ("kinetic", voir motion.ts).
 * Référence : montres/objets premium sur fond rouge sombre, cartes data
 * rouge/noir à barres LED.
 */
export const crimsonGlow: BrandTheme = {
  id: "crimson-glow",
  name: "Crimson Glow",
  description: "Identité rouge cinématographique : noir rougeâtre, incandescence rouge, mouvement vif.",
  colors: {
    background: "#301418",
    backgroundSecondary: "#3a171b",
    surface: "#3d1a1e",
    text: "#fbeeee",
    textMuted: "#c99a9d",
    primary: "#ff3b4e",
    secondary: "#ff7a54",
    success: "#4fd18b",
    warning: "#ffb444",
    danger: "#ff3b4e",
  },
  typography: {
    heading: "'Space Grotesk', 'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    label: "'Inter', system-ui, sans-serif",
    titleScale: [92, 62, 42, 28, 20],
  },
  spacing: [4, 8, 16, 24, 36, 52, 76],
  radius: {
    small: 8,
    medium: 18,
    large: 32,
  },
  shadows: {
    soft: "0 8px 22px rgba(20, 4, 6, 0.45)",
    elevated: "0 24px 60px rgba(20, 4, 6, 0.6)",
    glow: "0 0 110px rgba(255, 59, 78, 0.4)",
  },
  motion: {
    entrance: "kinetic",
    durationFrames: 20,
    easing: "cubic-bezier(0.3, 1.4, 0.5, 1)",
    spring: { damping: 12, mass: 0.75, stiffness: 210 },
  },
  background: {
    type: "radial",
    colors: ["#3a171b", "#301418", "#4a1c21"],
    separationFromBlack: 0.24,
    vignette: 0.5,
    grain: 0.09,
    glow: true,
    particles: true,
  },
};
