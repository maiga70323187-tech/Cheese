import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { oscillate, useEntrance } from "../motion";

export interface CallToActionProps {
  theme: BrandTheme;
  title: string;
  subtitle?: string;
  buttonLabel: string;
}

export const CallToAction: React.FC<CallToActionProps> = ({ theme, title, subtitle, buttonLabel }) => {
  const frame = useCurrentFrame();
  const titleEntrance = useEntrance(theme);
  const buttonEntrance = useEntrance(theme, Math.round(theme.motion.durationFrames * 0.6));
  const glowStrength = oscillate(frame, 90, 0.4, 0.75);

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
            fontSize: theme.typography.titleScale[1] ?? 60,
            fontWeight: 700,
            color: theme.colors.text,
            maxWidth: "85%",
            opacity: titleEntrance.opacity,
            transform: titleEntrance.transform,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: theme.typography.body,
              fontSize: theme.typography.titleScale[3] ?? 24,
              color: theme.colors.textMuted ?? theme.colors.text,
              marginTop: theme.spacing[2] ?? 16,
              opacity: titleEntrance.opacity,
            }}
          >
            {subtitle}
          </div>
        )}

        <div
          style={{
            position: "relative",
            marginTop: theme.spacing[5] ?? 48,
            opacity: buttonEntrance.opacity,
            transform: buttonEntrance.transform,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: theme.radius.large * 1.5,
              background: theme.colors.primary,
              opacity: glowStrength * 0.5,
              filter: "blur(28px)",
            }}
          />
          <div
            style={{
              position: "relative",
              background: theme.colors.primary,
              color: theme.colors.background,
              fontFamily: theme.typography.label ?? theme.typography.body,
              fontWeight: 700,
              fontSize: 22,
              padding: `${theme.spacing[2] ?? 16}px ${theme.spacing[4] ?? 40}px`,
              borderRadius: theme.radius.large,
              boxShadow: theme.shadows.elevated,
            }}
          >
            {buttonLabel}
          </div>
        </div>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
