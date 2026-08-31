import React from "react";
import type { BrandTheme } from "../../brand/schema";
import { OverlayFrame, cardStyle, type OverlayPosition } from "./overlay-common";

export interface LowerThirdProps {
  theme: BrandTheme;
  title: string;
  subtitle?: string;
  position: OverlayPosition;
}

/** Lower third : nom + rôle dans une carte ancrée en bas, avec liseré d'accent. */
export const LowerThird: React.FC<LowerThirdProps> = ({ theme, title, subtitle, position }) => (
  <OverlayFrame position={position}>
    <div style={{ ...cardStyle(theme), display: "flex", alignItems: "stretch", overflow: "hidden" }}>
      <div style={{ width: 8, background: theme.colors.primary }} />
      <div style={{ padding: `${theme.spacing[3] ?? 20}px ${theme.spacing[4] ?? 28}px` }}>
        <div
          style={{
            fontFamily: theme.typography.heading,
            fontWeight: 700,
            fontSize: 40,
            color: theme.colors.text,
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: theme.typography.label ?? theme.typography.body,
              fontSize: 24,
              color: theme.colors.primary,
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  </OverlayFrame>
);
