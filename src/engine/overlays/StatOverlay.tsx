import React from "react";
import type { BrandTheme } from "../../brand/schema";
import { OverlayFrame, cardStyle, type OverlayPosition } from "./overlay-common";

export interface StatOverlayProps {
  theme: BrandTheme;
  value: string;
  label: string;
  position: OverlayPosition;
}

/** Statistique animée en médaillon : grande valeur + libellé, dans une carte. */
export const StatOverlay: React.FC<StatOverlayProps> = ({ theme, value, label, position }) => (
  <OverlayFrame position={position}>
    <div
      style={{
        ...cardStyle(theme),
        padding: `${theme.spacing[3] ?? 22}px ${theme.spacing[4] ?? 30}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <div style={{ fontFamily: theme.typography.heading, fontWeight: 800, fontSize: 64, lineHeight: 1, color: theme.colors.primary }}>
        {value}
      </div>
      <div
        style={{
          fontFamily: theme.typography.label ?? theme.typography.body,
          fontSize: 24,
          color: theme.colors.textMuted ?? theme.colors.text,
          marginTop: 8,
        }}
      >
        {label}
      </div>
    </div>
  </OverlayFrame>
);
