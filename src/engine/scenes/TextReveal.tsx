import React from "react";
import { AbsoluteFill } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { useEntrance } from "../motion";

export interface TextRevealProps {
  theme: BrandTheme;
  lines: string[];
  align?: "left" | "center" | "right";
}

const TextLine: React.FC<{ theme: BrandTheme; line: string; index: number; align: string }> = ({
  theme,
  line,
  index,
}) => {
  const staggerFrames = Math.round(theme.motion.durationFrames * 0.5);
  const entrance = useEntrance(theme, index * staggerFrames);
  return (
    <div
      style={{
        fontFamily: theme.typography.heading,
        fontSize: theme.typography.titleScale[2] ?? 44,
        fontWeight: 600,
        color: theme.colors.text,
        opacity: entrance.opacity,
        transform: entrance.transform,
      }}
    >
      {line}
    </div>
  );
};

export const TextReveal: React.FC<TextRevealProps> = ({ theme, lines, align = "center" }) => {
  const alignItems = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
  return (
    <PremiumBackground theme={theme}>
      <AbsoluteFill
        style={{
          alignItems,
          justifyContent: "center",
          flexDirection: "column",
          gap: theme.spacing[2] ?? 16,
          padding: theme.spacing[6] ?? 64,
          textAlign: align,
        }}
      >
        {lines.map((line, index) => (
          <TextLine key={index} theme={theme} line={line} index={index} align={align} />
        ))}
      </AbsoluteFill>
    </PremiumBackground>
  );
};
