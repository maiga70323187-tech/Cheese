import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { Icon3DScene, type IconShape } from "../icon/Icon3D";

export interface IconShowcase3DProps {
  theme: BrandTheme;
  shape: IconShape;
}

/**
 * Same `<ThreeCanvas>` + `PremiumBackground` wrapping pattern as
 * `PhoneShowcase3D` (see that file for why `<ThreeCanvas>` rather than the
 * plain R3F `<Canvas>` is required for deterministic rendering).
 */
export const IconShowcase3D: React.FC<IconShowcase3DProps> = ({ theme, shape }) => {
  const { width, height } = useVideoConfig();

  return (
    <PremiumBackground theme={theme}>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} shadows gl={{ alpha: true, antialias: true }}>
          <Icon3DScene theme={theme} shape={shape} aspect={width / height} />
        </ThreeCanvas>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
