import React from "react";
import type { BrandTheme } from "../../brand/schema";
import { OverlayFrame, cardStyle, type OverlayPosition } from "./overlay-common";

export interface QuoteCardProps {
  theme: BrandTheme;
  quote: string;
  author?: string;
  position: OverlayPosition;
}

/** Carte de citation : guillemet d'accent, texte de citation, auteur. */
export const QuoteCard: React.FC<QuoteCardProps> = ({ theme, quote, author, position }) => (
  <OverlayFrame position={position}>
    <div style={{ ...cardStyle(theme), padding: `${theme.spacing[4] ?? 32}px ${theme.spacing[5] ?? 44}px`, maxWidth: 820 }}>
      <div style={{ fontFamily: theme.typography.heading, fontWeight: 700, fontSize: 72, lineHeight: 0.7, color: theme.colors.primary }}>
        &ldquo;
      </div>
      <div
        style={{
          fontFamily: theme.typography.heading,
          fontWeight: 600,
          fontSize: 36,
          lineHeight: 1.28,
          color: theme.colors.text,
          marginTop: 4,
        }}
      >
        {quote}
      </div>
      {author && (
        <div
          style={{
            fontFamily: theme.typography.label ?? theme.typography.body,
            fontSize: 24,
            color: theme.colors.textMuted ?? theme.colors.text,
            marginTop: theme.spacing[3] ?? 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ width: 28, height: 2, background: theme.colors.primary }} />
          {author}
        </div>
      )}
    </div>
  </OverlayFrame>
);
