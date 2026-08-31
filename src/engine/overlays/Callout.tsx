import React from "react";
import type { BrandTheme } from "../../brand/schema";
import { OverlayFrame, type OverlayPosition } from "./overlay-common";

export interface CalloutProps {
  theme: BrandTheme;
  text: string;
  position: OverlayPosition;
}

/** Callout : pastille d'accent compacte pour souligner une idée/preuve. */
export const Callout: React.FC<CalloutProps> = ({ theme, text, position }) => (
  <OverlayFrame position={position}>
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        background: theme.colors.primary,
        color: theme.colors.background,
        fontFamily: theme.typography.label ?? theme.typography.body,
        fontWeight: 600,
        fontSize: 28,
        padding: "14px 26px",
        borderRadius: 999,
        boxShadow: `0 14px 40px ${theme.colors.primary}55`,
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: theme.colors.background, opacity: 0.9 }} />
      {text}
    </div>
  </OverlayFrame>
);
