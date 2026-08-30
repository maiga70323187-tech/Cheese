import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { useEntrance } from "../motion";

export interface StatisticProps {
  theme: BrandTheme;
  value: string;
  label: string;
  trend?: "up" | "down" | "flat";
}

const NUMERIC_VALUE = /^([+-]?)(\d+(?:[.,]\d+)?)(\D*)$/;

function useAnimatedValue(rawValue: string, durationFrames: number): string {
  const frame = useCurrentFrame();
  const match = NUMERIC_VALUE.exec(rawValue.trim());
  if (!match) return rawValue;
  const [, sign, numberPart, suffix] = match;
  const target = parseFloat((numberPart ?? "0").replace(",", "."));
  const decimals = numberPart?.includes(".") || numberPart?.includes(",") ? 1 : 0;
  const progress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const current = target * progress;
  return `${sign ?? ""}${current.toFixed(decimals)}${suffix ?? ""}`;
}

const TREND_GLYPH: Record<NonNullable<StatisticProps["trend"]>, string> = {
  up: "▲",
  down: "▼",
  flat: "▬",
};

export const Statistic: React.FC<StatisticProps> = ({ theme, value, label, trend }) => {
  const entrance = useEntrance(theme);
  const animatedValue = useAnimatedValue(value, theme.motion.durationFrames + 20);
  const trendColor = trend === "down" ? (theme.colors.danger ?? theme.colors.primary) : (theme.colors.success ?? theme.colors.primary);

  return (
    <PremiumBackground theme={theme}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: theme.spacing[2] ?? 16,
            opacity: entrance.opacity,
            transform: entrance.transform,
          }}
        >
          <div
            style={{
              fontFamily: theme.typography.heading,
              fontSize: theme.typography.titleScale[0] ?? 96,
              fontWeight: 800,
              color: theme.colors.primary,
              textShadow: `0 0 40px ${theme.colors.primary}55`,
            }}
          >
            {animatedValue}
          </div>
          {trend && (
            <span style={{ fontSize: 28, color: trendColor }}>{TREND_GLYPH[trend]}</span>
          )}
        </div>
        <div
          style={{
            fontFamily: theme.typography.body,
            fontSize: theme.typography.titleScale[3] ?? 26,
            color: theme.colors.textMuted ?? theme.colors.text,
            marginTop: theme.spacing[2] ?? 16,
            opacity: entrance.opacity,
          }}
        >
          {label}
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
