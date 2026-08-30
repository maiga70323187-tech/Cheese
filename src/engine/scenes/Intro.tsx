import React from "react";
import { AbsoluteFill } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { useEntrance } from "../motion";

export interface IntroProps {
  theme: BrandTheme;
  title: string;
  subtitle?: string;
}

export const Intro: React.FC<IntroProps> = ({ theme, title, subtitle }) => {
  const titleEntrance = useEntrance(theme);
  const subtitleEntrance = useEntrance(theme, Math.round(theme.motion.durationFrames * 0.4));

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
            fontFamily: theme.typography.heading,
            fontSize: theme.typography.titleScale[1] ?? 64,
            fontWeight: 700,
            color: theme.colors.text,
            lineHeight: 1.08,
            maxWidth: "80%",
            opacity: titleEntrance.opacity,
            transform: titleEntrance.transform,
            textShadow: theme.shadows.glow ? `0 0 60px ${theme.colors.primary}55` : undefined,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: theme.typography.body,
              fontSize: theme.typography.titleScale[3] ?? 28,
              color: theme.colors.textMuted ?? theme.colors.text,
              marginTop: theme.spacing[3] ?? 24,
              opacity: subtitleEntrance.opacity,
              transform: subtitleEntrance.transform,
            }}
          >
            {subtitle}
          </div>
        )}
      </AbsoluteFill>
    </PremiumBackground>
  );
};
