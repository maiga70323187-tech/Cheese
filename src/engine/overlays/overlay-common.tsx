import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { BrandTheme } from "../../brand/schema";

export type OverlayPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right" | "bottom-center";

/**
 * Entrée/sortie temporisées d'un overlay : apparition (fondu + glissement
 * vers le haut) sur les premières frames, maintien, puis disparition
 * symétrique sur les dernières. `durationInFrames` vient de la `<Sequence>`
 * de la scène (Remotion la fournit au contexte), donc la sortie se cale
 * toujours sur la fin réelle de la scène. Fonction pure de la frame.
 */
export function useOverlayAnim(): { opacity: number; slide: number } {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inDur = 12;
  const outDur = 12;

  const enter = interpolate(frame, [0, inDur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exit = interpolate(frame, [durationInFrames - outDur, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(enter, exit);

  const slideIn = interpolate(frame, [0, inDur], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slideOut = interpolate(frame, [durationInFrames - outDur, durationInFrames], [0, 20], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { opacity, slide: slideIn + slideOut };
}

function anchorStyle(position: OverlayPosition, pad: number): React.CSSProperties {
  const vertical = position.startsWith("top") ? "flex-start" : "flex-end";
  const horizontal = position.endsWith("left") ? "flex-start" : position.endsWith("right") ? "flex-end" : "center";
  return { justifyContent: vertical, alignItems: horizontal, padding: pad };
}

/**
 * Cadre commun aux overlays : `AbsoluteFill` SANS fond premium (donc
 * transparent — c'est ce qui permet l'export MOV alpha), l'élément ancré à
 * un coin/centre avec des marges de sécurité (≈7% du plus petit côté, comme
 * le recommande Hera pour ne pas coller aux bords), et l'animation d'entrée/
 * sortie appliquée au wrapper.
 */
export const OverlayFrame: React.FC<{ position: OverlayPosition; children: React.ReactNode }> = ({ position, children }) => {
  const { width, height } = useVideoConfig();
  const anim = useOverlayAnim();
  const pad = Math.round(Math.min(width, height) * 0.07);

  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: "column", ...anchorStyle(position, pad) }}>
      <div style={{ opacity: anim.opacity, transform: `translateY(${anim.slide}px)`, maxWidth: "86%" }}>{children}</div>
    </AbsoluteFill>
  );
};

/** Fond de carte lisible sur n'importe quelle vidéo (surface opaque + ombre). */
export function cardStyle(theme: BrandTheme): React.CSSProperties {
  return {
    background: theme.colors.surface,
    borderRadius: theme.radius.large ?? 22,
    boxShadow: theme.shadows.elevated ?? "0 20px 60px rgba(0,0,0,0.35)",
    border: `1px solid ${theme.colors.primary}22`,
  };
}
