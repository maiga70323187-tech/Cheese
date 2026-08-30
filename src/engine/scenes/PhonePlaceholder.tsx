import React from "react";
import { AbsoluteFill } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";

/**
 * Stand-in for `phone-showcase` until Checkpoint C ships the real 2.5D/3D
 * scene. Keeps the registry exhaustive and every scenario renderable end to
 * end (including the reference phone-app-ad scenario) at Checkpoint B.
 */
export const PhonePlaceholder: React.FC<{ theme: BrandTheme }> = ({ theme }) => (
  <PremiumBackground theme={theme}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: theme.typography.body,
          color: theme.colors.textMuted ?? theme.colors.text,
          fontSize: 22,
          border: `1px dashed ${theme.colors.textMuted ?? theme.colors.text}`,
          borderRadius: theme.radius.medium,
          padding: `${theme.spacing[2] ?? 16}px ${theme.spacing[4] ?? 32}px`,
        }}
      >
        Phone showcase — arrive au Checkpoint C
      </div>
    </AbsoluteFill>
  </PremiumBackground>
);
