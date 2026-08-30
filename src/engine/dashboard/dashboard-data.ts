export type DashboardVariant = "analytics" | "sales" | "social" | "finance";

export interface DashboardMetric {
  label: string;
  value: string;
}

export interface DashboardPreset {
  title: string;
  metrics: DashboardMetric[];
  /** Deterministic bar-chart heights, 0-1. */
  bars: number[];
}

export const DASHBOARD_PRESETS: Record<DashboardVariant, DashboardPreset> = {
  analytics: {
    title: "Analytics",
    metrics: [
      { label: "Utilisateurs actifs", value: "24.8K" },
      { label: "Taux de conversion", value: "6.4%" },
      { label: "Temps moyen", value: "3m 12s" },
    ],
    bars: [0.35, 0.52, 0.48, 0.71, 0.64, 0.83, 0.9],
  },
  sales: {
    title: "Ventes",
    metrics: [
      { label: "Chiffre d'affaires", value: "€128K" },
      { label: "Commandes", value: "1 204" },
      { label: "Panier moyen", value: "€106" },
    ],
    bars: [0.4, 0.44, 0.58, 0.5, 0.68, 0.74, 0.86],
  },
  social: {
    title: "Social",
    metrics: [
      { label: "Impressions", value: "312K" },
      { label: "Engagement", value: "9.1%" },
      { label: "Nouveaux abonnés", value: "+2.3K" },
    ],
    bars: [0.5, 0.62, 0.4, 0.7, 0.55, 0.8, 0.68],
  },
  finance: {
    title: "Finance",
    metrics: [
      { label: "Solde", value: "€48.2K" },
      { label: "Croissance", value: "+12.6%" },
      { label: "Dépenses", value: "€9.4K" },
    ],
    bars: [0.6, 0.55, 0.7, 0.65, 0.78, 0.72, 0.88],
  },
};

export function resolveDashboardPreset(
  variant: DashboardVariant,
  overrides?: { title?: string; metrics?: DashboardMetric[] },
): DashboardPreset {
  const preset = DASHBOARD_PRESETS[variant];
  return {
    title: overrides?.title ?? preset.title,
    metrics: overrides?.metrics ?? preset.metrics,
    bars: preset.bars,
  };
}
