import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { ChartFrame, formatValue, decimalsFor } from "./chart-common";

export interface LineChartProps {
  theme: BrandTheme;
  title?: string;
  data: Array<{ label: string; value: number }>;
  unit?: string;
  source?: string;
}

const VB_W = 1000;
const VB_H = 560;
const PAD_L = 56;
const PAD_R = 56;
const PAD_TOP = 56;
const PAD_BOTTOM = 84;

/**
 * Courbe tracée progressivement : la ligne se dessine de gauche à droite, une
 * aire semi-transparente la suit, un point mobile marque la tête de tracé et
 * affiche la valeur courante. Le tracé partiel est recalculé à chaque frame
 * (fonction pure de `useCurrentFrame()`), donc déterministe.
 */
export const LineChart: React.FC<LineChartProps> = ({ theme, title, data, unit, source }) => {
  const frame = useCurrentFrame();
  const n = data.length;
  const values = data.map((d) => d.value);
  const decimals = decimalsFor(values);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const plotW = VB_W - PAD_L - PAD_R;
  const plotH = VB_H - PAD_TOP - PAD_BOTTOM;
  const baseline = PAD_TOP + plotH;

  const px = (i: number) => PAD_L + (plotW * i) / (n - 1);
  const py = (v: number) => baseline - ((v - min) / span) * plotH;

  const progress = interpolate(frame, [8, 8 + theme.motion.durationFrames + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const t = progress * (n - 1); // position fractionnaire sur l'axe des indices
  const i0 = Math.min(n - 2, Math.floor(t));
  const frac = Math.max(0, Math.min(1, t - i0));

  // Chemin partiel jusqu'à la tête de tracé.
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= i0; i++) pts.push([px(i), py(values[i]!)]);
  const tipX = px(i0) + (px(i0 + 1) - px(i0)) * frac;
  const tipV = values[i0]! + (values[i0 + 1]! - values[i0]!) * frac;
  const tipY = py(tipV);
  pts.push([tipX, tipY]);

  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${tipX.toFixed(1)} ${baseline} L${px(0).toFixed(1)} ${baseline} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <ChartFrame theme={theme} title={title} source={source}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: "100%", height: "auto" }} role="img">
        {/* Grille horizontale discrète. */}
        {gridLines.map((g, i) => {
          const y = PAD_TOP + plotH * g;
          return <line key={i} x1={PAD_L} y1={y} x2={VB_W - PAD_R} y2={y} stroke={theme.colors.textMuted ?? theme.colors.text} strokeOpacity={0.14} strokeWidth={1.5} />;
        })}

        {/* Aire sous la courbe. */}
        <path d={areaPath} fill={theme.colors.primary} fillOpacity={0.16} />
        {/* Courbe. */}
        <path d={linePath} fill="none" stroke={theme.colors.primary} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Libellés d'axe (premier / dernier pour rester lisible). */}
        <text x={px(0)} y={baseline + 40} textAnchor="middle" fill={theme.colors.textMuted ?? theme.colors.text} style={{ fontFamily: theme.typography.label ?? theme.typography.body, fontSize: 22 }}>
          {data[0]!.label}
        </text>
        <text x={px(n - 1)} y={baseline + 40} textAnchor="middle" fill={theme.colors.textMuted ?? theme.colors.text} style={{ fontFamily: theme.typography.label ?? theme.typography.body, fontSize: 22 }}>
          {data[n - 1]!.label}
        </text>

        {/* Tête de tracé + valeur courante. */}
        <circle cx={tipX} cy={tipY} r={9} fill={theme.colors.primary} />
        <circle cx={tipX} cy={tipY} r={16} fill={theme.colors.primary} fillOpacity={0.25} />
        <text
          x={Math.min(tipX, VB_W - PAD_R - 4)}
          y={Math.max(PAD_TOP - 8, tipY - 26)}
          textAnchor={tipX > VB_W - 160 ? "end" : "middle"}
          fill={theme.colors.text}
          style={{ fontFamily: theme.typography.heading, fontWeight: 700, fontSize: 28 }}
        >
          {formatValue(tipV, unit, decimals)}
        </text>
      </svg>
    </ChartFrame>
  );
};
