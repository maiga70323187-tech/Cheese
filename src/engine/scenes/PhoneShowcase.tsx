import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import type { DashboardVariant } from "../dashboard/dashboard-data";
import { PremiumBackground } from "../background/PremiumBackground";
import { Phone25D } from "../phone/Phone2_5D";
import { oscillate } from "../motion";

export interface PhoneShowcaseProps {
  theme: BrandTheme;
  dashboardVariant: DashboardVariant;
}

/**
 * The furthest depth plane: large, blurred, low-opacity color blobs that
 * drift slower than the phone — this is what actually reads as "parallax"
 * rather than everything moving together.
 */
const BackdropBlobs: React.FC<{ theme: BrandTheme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const driftA = oscillate(frame, 520, -6, 6);
  const driftB = oscillate(frame + 90, 480, -5, 5);

  return (
    <>
      <div
        style={{
          position: "absolute",
          width: "70%",
          height: "40%",
          left: `${18 + driftA}%`,
          top: "8%",
          borderRadius: "50%",
          background: theme.colors.primary,
          opacity: 0.16,
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "60%",
          height: "35%",
          right: `${10 + driftB}%`,
          bottom: "6%",
          borderRadius: "50%",
          background: theme.colors.secondary ?? theme.colors.primary,
          opacity: 0.14,
          filter: "blur(90px)",
        }}
      />
    </>
  );
};

export const PhoneShowcase: React.FC<PhoneShowcaseProps> = ({ theme, dashboardVariant }) => (
  <PremiumBackground theme={theme}>
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <BackdropBlobs theme={theme} />
    </AbsoluteFill>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <Phone25D theme={theme} dashboardVariant={dashboardVariant} />
    </AbsoluteFill>
  </PremiumBackground>
);
