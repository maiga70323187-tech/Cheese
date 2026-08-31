import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import type { EntityKind } from "../../assets/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { useEntrance, oscillate } from "../motion";

export interface AssetShowcaseProps {
  theme: BrandTheme;
  /** Chemin `public/` (staticFile) ou URL absolue d'un asset déjà résolu. */
  src: string;
  entityKind: EntityKind;
  label?: string;
  caption?: string;
}

/** Une URL absolue est utilisée telle quelle ; sinon on la sert depuis public/ via staticFile. */
function resolveSrc(src: string): string {
  return /^https?:\/\//.test(src) ? src : staticFile(src);
}

/**
 * Cadrage par famille d'entité :
 * - `brand`        : logo contenu (jamais rogné), pas de fond, halo doux
 * - `person`       : portrait en médaillon circulaire rogné, anneau lumineux
 * - `illustration` : image en carte arrondie, légèrement plus grande
 */
function framingFor(kind: EntityKind, theme: BrandTheme): {
  size: string;
  borderRadius: number | string;
  objectFit: React.CSSProperties["objectFit"];
  ring: boolean;
} {
  switch (kind) {
    case "brand":
      return { size: "55%", borderRadius: theme.radius.large ?? 28, objectFit: "contain", ring: false };
    case "person":
      return { size: "62%", borderRadius: "50%", objectFit: "cover", ring: true };
    case "illustration":
    default:
      return { size: "74%", borderRadius: theme.radius.large ?? 28, objectFit: "cover", ring: false };
  }
}

/**
 * Anime un asset résolu (logo SVG, portrait détouré, illustration) en 2.5D :
 * entrée `useEntrance` (pilotée par `theme.motion`), léger flottement +
 * parallaxe déterministes (`oscillate`, fonction pure de la frame), sur le
 * fond premium. Le SVG d'un vrai logo s'anime parfaitement par cette voie.
 *
 * L'asset est consommé comme une référence déjà résolue (chemin/URL) : la
 * résolution en ligne (Brandfetch/Wikimedia/Openverse) a lieu en amont du
 * rendu (voir `src/assets/` et ASSETS.md), ce qui garde le rendu
 * déterministe et vérifiable hors-ligne.
 */
export const AssetShowcase: React.FC<AssetShowcaseProps> = ({ theme, src, entityKind, label, caption }) => {
  const frame = useCurrentFrame();
  const media = useEntrance(theme);
  const labelEntrance = useEntrance(theme, Math.round(theme.motion.durationFrames * 0.5));

  const float = oscillate(frame, 220, -10, 10);
  const parallax = oscillate(frame, 340, -6, 6);
  const glowPulse = oscillate(frame, 180, 0.3, 0.55);
  const framing = framingFor(entityKind, theme);

  return (
    <PremiumBackground theme={theme}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: theme.spacing[6] ?? 64,
          textAlign: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            width: framing.size,
            aspectRatio: "1 / 1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: media.opacity,
            transform: `${media.transform} translateY(${float}px) translateX(${parallax}px)`,
          }}
        >
          {/* Halo derrière l'asset — se détache toujours du fond (couleur primaire). */}
          <div
            style={{
              position: "absolute",
              inset: "6%",
              borderRadius: framing.borderRadius,
              background: `radial-gradient(circle at 50% 45%, ${theme.colors.primary}${Math.round(glowPulse * 100)
                .toString(16)
                .padStart(2, "0")}, transparent 70%)`,
              filter: "blur(28px)",
            }}
          />
          <Img
            src={resolveSrc(src)}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              objectFit: framing.objectFit,
              borderRadius: framing.borderRadius,
              boxShadow: entityKind === "brand" ? undefined : theme.shadows.elevated,
              border: framing.ring ? `4px solid ${theme.colors.primary}` : undefined,
              background: entityKind === "brand" ? "transparent" : theme.colors.surface,
            }}
          />
        </div>

        {label && (
          <div
            style={{
              fontFamily: theme.typography.heading,
              fontSize: theme.typography.titleScale[2] ?? 44,
              fontWeight: 700,
              color: theme.colors.text,
              marginTop: theme.spacing[4] ?? 36,
              opacity: labelEntrance.opacity,
              transform: labelEntrance.transform,
            }}
          >
            {label}
          </div>
        )}
        {caption && (
          <div
            style={{
              fontFamily: theme.typography.label ?? theme.typography.body,
              fontSize: theme.typography.titleScale[4] ?? 18,
              color: theme.colors.textMuted ?? theme.colors.text,
              marginTop: theme.spacing[2] ?? 12,
              maxWidth: "80%",
              opacity: labelEntrance.opacity * 0.9,
            }}
          >
            {caption}
          </div>
        )}
      </AbsoluteFill>
    </PremiumBackground>
  );
};
