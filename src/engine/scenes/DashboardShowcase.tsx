import React from "react";
import { AbsoluteFill } from "remotion";
import type { BrandTheme } from "../../brand/schema";
import { PremiumBackground } from "../background/PremiumBackground";
import { DashboardUI } from "../dashboard/DashboardUI";
import type { DashboardMetric, DashboardVariant } from "../dashboard/dashboard-data";

export interface DashboardShowcaseProps {
  theme: BrandTheme;
  variant: DashboardVariant;
  title?: string;
  metrics?: DashboardMetric[];
}

export const DashboardShowcase: React.FC<DashboardShowcaseProps> = ({ theme, variant, title, metrics }) => (
  <PremiumBackground theme={theme}>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: theme.spacing[5] ?? 48 }}>
      <div style={{ width: "78%", height: "62%", fontSize: 22 }}>
        <DashboardUI theme={theme} variant={variant} title={title} metrics={metrics} />
      </div>
    </AbsoluteFill>
  </PremiumBackground>
);
