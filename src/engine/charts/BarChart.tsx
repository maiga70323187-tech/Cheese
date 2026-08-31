import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { ChartFrame, formatValue, decimalsFor } from "./chart-common";

export interface BarChartProps {
  theme: BrandTheme;
  title?: string;
  data: Array<{ label: string; value: number }>;
  unit?: string;
  source?: string;
}

// Repère SVG fixe ; le conteneur le met à l'échelle selon le format.
const VB_W = 1000;
const VB_H = 560;
const PAD_L = 40;
const PAD_R = 40;
const PAD_TOP = 40;
const PAD_BOTTOM = 96; // place pour les libellés d'axe

/**
 * Graphique à barres verticales, entièrement en SVG (géométrie et libellés
 * alignés au pixel). Chaque barre pousse depuis la ligne de base en décalé,
 * sa valeur compte jusqu'au chiffre final — tout est fonction pure de
 * `useCurrentFrame()`, donc déterministe.
 */
export const BarChart: React.FC<BarChartProps> = ({ theme, title, data, unit, source }) => {
  const frame = useCurrentFrame();
  const values = data.map((d) => d.value);
  const decimals = decimalsFor(values);
  const maxValue = Math.max(...values, 0) || 1;

  const plotW = VB_W - PAD_L - PAD_R;
  const plotH = VB_H - PAD_TOP - PAD_BOTTOM;
  const baseline = PAD_TOP + plotH;
  const slot = plotW / data.length;
  const barWidth = Math.min(slot * 0.56, 120);

  return (
    <ChartFrame theme={theme} title={title} source={source}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: "auto" }} role="img">
        {/* Ligne de base. */}
        <line x1={PAD_L} y1={baseline} x2={VB_W - PAD_R} y2={baseline} stroke={theme.colors.textMuted ?? theme.colors.text} strokeOpacity={0.35} strokeWidth={2} />

        {data.map((d, i) => {
          const start = 6 + i * 5;
          const grow = 20;
          const progress = interpolate(frame, [start, start + grow], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const h = (d.value / maxValue) * plotH * progress;
          const cx = PAD_L + slot * i + slot / 2;
          const x = cx - barWidth / 2;
          const y = baseline - h;
          const animatedValue = d.value * progress;
          const isLast = i === data.length - 1;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(0, h)}
                rx={10}
                fill={theme.colors.primary}
                opacity={isLast ? 1 : 0.82}
              />
              {/* Valeur au-dessus de la barre. */}
              <text
                x={cx}
                y={y - 14}
                textAnchor="middle"
                fill={theme.colors.text}
                style={{ fontFamily: theme.typography.heading, fontWeight: 700, fontSize: 26 }}
              >
                {formatValue(animatedValue, unit, decimals)}
              </text>
              {/* Libellé d'axe. */}
              <text
                x={cx}
                y={baseline + 34}
                textAnchor="middle"
                fill={theme.colors.textMuted ?? theme.colors.text}
                style={{ fontFamily: theme.typography.label ?? theme.typography.body, fontSize: 22 }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
};
