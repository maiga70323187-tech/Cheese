import type { BrandTheme } from "../schema";

/**
 * "Luxe et haut de gamme" — anthracite bleuté (jamais noir pur), or discret,
 * mouvement lent et posé.
 */
export const luxuryDark: BrandTheme = {
  id: "luxury-dark",
  name: "Luxury Dark",
  description: "Identité luxe et haut de gamme : anthracite bleuté, accents or, mouvement posé.",
  colors: {
    background: "#191c2c",
    backgroundSecondary: "#22273b",
    surface: "#262b40",
    text: "#f5f1e8",
    textMuted: "#9a9488",
    primary: "#c9a24b",
    secondary: "#8a7752",
    success: "#5fae7f",
    warning: "#d9a441",
    danger: "#c0555a",
  },
  typography: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    label: "'Inter', system-ui, sans-serif",
    titleScale: [96, 64, 44, 30, 22],
  },
  spacing: [4, 8, 16, 24, 32, 48, 64, 96],
  radius: {
    small: 4,
    medium: 10,
    large: 24,
  },
  shadows: {
    soft: "0 8px 24px rgba(0, 0, 0, 0.35)",
    elevated: "0 24px 64px rgba(0, 0, 0, 0.5)",
    glow: "0 0 120px rgba(201, 162, 75, 0.25)",
  },
  motion: {
    entrance: "reveal",
    durationFrames: 36,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    spring: { damping: 22, mass: 1.1, stiffness: 90 },
  },
  background: {
    type: "radial",
    colors: ["#191c2c", "#22273b", "#2a2f47"],
    separationFromBlack: 0.22,
    vignette: 0.55,
    grain: 0.08,
    glow: true,
    particles: true,
  },
};
