import React from "react";
import { AbsoluteFill } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { useEntrance } from "../motion";

export interface OutroProps {
  theme: BrandTheme;
  title?: string;
  logoText?: string;
}

export const Outro: React.FC<OutroProps> = ({ theme, title, logoText }) => {
  const entrance = useEntrance(theme);
  return (
    <PremiumBackground theme={theme}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {logoText && (
          <div
            style={{
              fontFamily: theme.typography.label ?? theme.typography.heading,
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: theme.colors.textMuted ?? theme.colors.text,
              opacity: entrance.opacity,
              marginBottom: theme.spacing[2] ?? 16,
            }}
          >
            {logoText}
          </div>
        )}
        {title && (
          <div
            style={{
              fontFamily: theme.typography.heading,
              fontSize: theme.typography.titleScale[2] ?? 40,
              fontWeight: 700,
              color: theme.colors.text,
              opacity: entrance.opacity,
              transform: entrance.transform,
            }}
          >
            {title}
          </div>
        )}
      </AbsoluteFill>
    </PremiumBackground>
  );
};
