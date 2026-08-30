import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import type { BrandTheme } from "../../brand/schema";
import type { DashboardVariant } from "../dashboard/dashboard-data";
import { PremiumBackground } from "../background/PremiumBackground";
import { Phone3DScene } from "../phone/Phone3D";

export interface PhoneShowcase3DProps {
  theme: BrandTheme;
  dashboardVariant: DashboardVariant;
}

/**
 * `<ThreeCanvas>` (from `@remotion/three`, not the plain R3F `<Canvas>`)
 * ties the WebGL render loop to Remotion's own frame clock instead of
 * `requestAnimationFrame`, so a still render of frame N always produces
 * the same pixels — required for the same determinism guarantee the rest
 * of the engine relies on (see ARCHITECTURE.md).
 */
export const PhoneShowcase3D: React.FC<PhoneShowcase3DProps> = ({ theme, dashboardVariant }) => {
  const { width, height } = useVideoConfig();

  return (
    <PremiumBackground theme={theme}>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} shadows gl={{ alpha: true, antialias: true }}>
          <Phone3DScene theme={theme} dashboardVariant={dashboardVariant} />
        </ThreeCanvas>
      </AbsoluteFill>
    </PremiumBackground>
  );
};
