import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import type { DashboardMetric, DashboardVariant } from "./dashboard-data";
import { resolveDashboardPreset } from "./dashboard-data";

export interface DashboardUIProps {
  theme: BrandTheme;
  variant: DashboardVariant;
  title?: string;
  metrics?: DashboardMetric[];
  /** Frame at which this dashboard's own entrance animation starts (relative to its own Sequence). */
  startFrame?: number;
}

/**
 * Self-contained dashboard interface, sized entirely in `em` so it scales
 * cleanly whether it fills the screen (DashboardShowcase scene) or is
 * projected onto a phone screen (PhoneShowcase, checkpoint C) — the caller
 * only sets `fontSize` on a wrapping element.
 */
export const DashboardUI: React.FC<DashboardUIProps> = ({ theme, variant, title, metrics, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const local = Math.max(0, frame - startFrame);
  const preset = resolveDashboardPreset(variant, { title, metrics });
  const cardIn = interpolate(local, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.surface,
        borderRadius: theme.radius.medium,
        boxShadow: theme.shadows.elevated,
        padding: "1em",
        display: "flex",
        flexDirection: "column",
        gap: "0.75em",
        opacity: cardIn,
        transform: `translateY(${interpolate(cardIn, [0, 1], [0.6, 0])}em)`,
        fontFamily: theme.typography.body,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: theme.typography.heading,
          fontSize: "1.15em",
          fontWeight: 700,
          color: theme.colors.text,
        }}
      >
        {preset.title}
      </div>

      <div style={{ display: "flex", gap: "0.6em" }}>
        {preset.metrics.map((metric, i) => {
          const tileIn = interpolate(local, [8 + i * 6, 8 + i * 6 + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={metric.label}
              style={{
                flex: 1,
                background: theme.colors.backgroundSecondary ?? theme.colors.background,
                borderRadius: theme.radius.small,
                padding: "0.5em",
                opacity: tileIn,
                transform: `scale(${interpolate(tileIn, [0, 1], [0.85, 1])})`,
              }}
            >
              <div style={{ fontSize: "0.85em", color: theme.colors.textMuted ?? theme.colors.text }}>
                {metric.label}
              </div>
              <div style={{ fontSize: "1.1em", fontWeight: 700, color: theme.colors.primary }}>{metric.value}</div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-end",
          gap: "0.4em",
          padding: "0 0.1em",
        }}
      >
        {preset.bars.map((height, i) => {
          const barIn = interpolate(local, [24 + i * 4, 24 + i * 4 + 16], [0, height], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${barIn * 100}%`,
                background: `linear-gradient(180deg, ${theme.colors.primary}, ${theme.colors.secondary ?? theme.colors.primary})`,
                borderRadius: theme.radius.small * 0.5,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
