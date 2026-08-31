import React from "react";
import { AbsoluteFill } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { useEntrance } from "../motion";

/** Formate une valeur numérique animée en respectant l'unité et un nombre de décimales stable. */
export function formatValue(value: number, unit: string | undefined, decimals: number): string {
  const rounded = value.toFixed(decimals);
  // Espace fine insécable avant une unité alphabétique (%, K€ collés ; " points" espacé).
  if (!unit) return rounded;
  return /^[%°]/.test(unit) || unit.length <= 2 ? `${rounded}${unit}` : `${rounded} ${unit}`;
}

/** Nombre de décimales adapté : 0 si toutes les valeurs sont entières, sinon 1. */
export function decimalsFor(values: number[]): number {
  return values.every((v) => Number.isInteger(v)) ? 0 : 1;
}

export interface ChartFrameProps {
  theme: BrandTheme;
  title?: string;
  source?: string;
  children: React.ReactNode;
}

/**
 * Habillage commun aux scènes graphiques : fond premium, titre en typographie
 * de titre, zone de tracé centrée, et note de source en bas (Hera insiste sur
 * le crédit systématique de la donnée). Le titre et la source utilisent
 * `useEntrance` pour rester cohérents avec le reste du moteur.
 */
export const ChartFrame: React.FC<ChartFrameProps> = ({ theme, title, source, children }) => {
  const titleEntrance = useEntrance(theme);
  const sourceEntrance = useEntrance(theme, Math.round(theme.motion.durationFrames * 0.6));

  return (
    <PremiumBackground theme={theme}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: theme.spacing[6] ?? 64,
          gap: theme.spacing[4] ?? 32,
        }}
      >
        {title && (
          <div
            style={{
              fontFamily: theme.typography.heading,
              fontSize: theme.typography.titleScale[2] ?? 44,
              fontWeight: 700,
              color: theme.colors.text,
              textAlign: "center",
              maxWidth: "88%",
              opacity: titleEntrance.opacity,
              transform: titleEntrance.transform,
            }}
          >
            {title}
          </div>
        )}

        <div style={{ width: "100%", maxWidth: 1120, display: "flex", justifyContent: "center" }}>{children}</div>

        {source && (
          <div
            style={{
              fontFamily: theme.typography.label ?? theme.typography.body,
              fontSize: theme.typography.titleScale[4] ? Math.max(14, (theme.typography.titleScale[4] as number) * 0.8) : 14,
              color: theme.colors.textMuted ?? theme.colors.text,
              opacity: sourceEntrance.opacity * 0.85,
              textAlign: "center",
            }}
          >
            {source}
          </div>
        )}
      </AbsoluteFill>
    </PremiumBackground>
  );
};
