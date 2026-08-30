import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";

export interface FeatureCardItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeatureCardsProps {
  theme: BrandTheme;
  items: FeatureCardItem[];
}

const Card: React.FC<{ theme: BrandTheme; item: FeatureCardItem; index: number }> = ({ theme, item, index }) => {
  const frame = useCurrentFrame();
  const delay = index * 8;
  const inAnim = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: theme.colors.surface,
        borderRadius: theme.radius.medium,
        boxShadow: theme.shadows.soft,
        padding: theme.spacing[3] ?? 24,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing[1] ?? 8,
        opacity: inAnim,
        transform: `translateY(${interpolate(inAnim, [0, 1], [30, 0])}px)`,
      }}
    >
      {item.icon && <div style={{ fontSize: 28 }}>{item.icon}</div>}
      <div style={{ fontFamily: theme.typography.heading, fontWeight: 700, color: theme.colors.text, fontSize: theme.typography.titleScale[4] ?? 20 }}>
        {item.title}
      </div>
      <div style={{ fontFamily: theme.typography.body, color: theme.colors.textMuted ?? theme.colors.text, fontSize: 16, lineHeight: 1.4 }}>
        {item.description}
      </div>
    </div>
  );
};

export const FeatureCards: React.FC<FeatureCardsProps> = ({ theme, items }) => (
  <PremiumBackground theme={theme}>
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing[5] ?? 48,
      }}
    >
      <div style={{ display: "flex", gap: theme.spacing[3] ?? 24, width: "100%" }}>
        {items.map((item, index) => (
          <Card key={item.title} theme={theme} item={item} index={index} />
        ))}
      </div>
    </AbsoluteFill>
  </PremiumBackground>
);
