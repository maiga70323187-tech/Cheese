import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { ChartFrame, formatValue, decimalsFor } from "./chart-common";

export interface ComparisonProps {
  theme: BrandTheme;
  title?: string;
  before: { label: string; value: number };
  after: { label: string; value: number };
  unit?: string;
  betterWhen?: "higher" | "lower";
  source?: string;
}

/**
 * Comparaison avant / après : deux colonnes dont les barres montent et dont
 * les valeurs comptent jusqu'au chiffre final, plus un badge de variation en
 * pourcentage. « Avant » est traité en sourdine, « après » en couleur
 * primaire pour porter le regard. Déterministe (fonction de la frame).
 */
export const Comparison: React.FC<ComparisonProps> = ({ theme, title, before, after, unit, betterWhen = "higher", source }) => {
  const frame = useCurrentFrame();
  const decimals = decimalsFor([before.value, after.value]);
  const maxValue = Math.max(before.value, after.value, 0) || 1;

  const grow = interpolate(frame, [8, 8 + theme.motion.durationFrames + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const delta = before.value !== 0 ? ((after.value - before.value) / Math.abs(before.value)) * 100 : null;
  const deltaSign = delta !== null && delta >= 0 ? "+" : "";
  // Une variation est "positive" si elle va dans le sens de l'amélioration
  // attendue : hausse quand `betterWhen === "higher"`, baisse sinon.
  const isImprovement = delta === null || delta === 0 || (betterWhen === "higher" ? delta > 0 : delta < 0);
  const badgeColor = isImprovement ? (theme.colors.success ?? theme.colors.primary) : (theme.colors.danger ?? theme.colors.primary);

  const columns: Array<{ d: { label: string; value: number }; accent: boolean }> = [
    { d: before, accent: false },
    { d: after, accent: true },
  ];

  const BAR_MAX_H = 340;

  return (
    <ChartFrame theme={theme} title={title} source={source}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: theme.spacing[4] ?? 32, width: "100%" }}>
        {delta !== null && (
          <div
            style={{
              fontFamily: theme.typography.heading,
              fontWeight: 700,
              fontSize: 34,
              color: badgeColor,
              background: `${badgeColor}1f`,
              padding: "8px 22px",
              borderRadius: 999,
              opacity: interpolate(grow, [0.6, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {deltaSign}
            {(delta * grow).toFixed(0)}%
          </div>
        )}

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: theme.spacing[5] ?? 48 }}>
          {columns.map(({ d, accent }, i) => {
            const h = (d.value / maxValue) * BAR_MAX_H * grow;
            const color = accent ? theme.colors.primary : theme.colors.textMuted ?? theme.colors.text;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: theme.spacing[2] ?? 16 }}>
                <div
                  style={{
                    fontFamily: theme.typography.heading,
                    fontWeight: 800,
                    fontSize: 46,
                    color: accent ? theme.colors.primary : theme.colors.text,
                    opacity: accent ? 1 : 0.75,
                  }}
                >
                  {formatValue(d.value * grow, unit, decimals)}
                </div>
                <div
                  style={{
                    width: 150,
                    height: Math.max(4, h),
                    borderRadius: 16,
                    background: color,
                    opacity: accent ? 1 : 0.55,
                    boxShadow: accent ? `0 0 40px ${theme.colors.primary}55` : undefined,
                  }}
                />
                <div
                  style={{
                    fontFamily: theme.typography.label ?? theme.typography.body,
                    fontSize: 24,
                    color: theme.colors.textMuted ?? theme.colors.text,
                    marginTop: theme.spacing[1] ?? 8,
                  }}
                >
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChartFrame>
  );
};
