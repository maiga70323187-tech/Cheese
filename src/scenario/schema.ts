import { z } from "zod";
import { entityKindSchema } from "../assets/schema";

export const videoFormatSchema = z.enum(["vertical", "landscape", "square", "portrait"]);
export type VideoFormat = z.infer<typeof videoFormatSchema>;

export const FORMAT_DIMENSIONS: Record<VideoFormat, { width: number; height: number }> = {
  vertical: { width: 1080, height: 1920 }, // 9:16 — Reels/Shorts/TikTok
  landscape: { width: 1920, height: 1080 }, // 16:9 — homepage/YouTube
  square: { width: 1080, height: 1080 }, // 1:1 — post social
  portrait: { width: 1080, height: 1350 }, // 4:5 — flux LinkedIn
};

const baseScene = {
  durationInSeconds: z.number().positive(),
};

export const introSceneSchema = z.object({
  ...baseScene,
  type: z.literal("intro"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
});

export const textRevealSceneSchema = z.object({
  ...baseScene,
  type: z.literal("text-reveal"),
  lines: z.array(z.string().min(1)).min(1),
  align: z.enum(["left", "center", "right"]).default("center"),
});

export const dashboardShowcaseSceneSchema = z.object({
  ...baseScene,
  type: z.literal("dashboard-showcase"),
  variant: z.enum(["analytics", "sales", "social", "finance"]).default("analytics"),
  title: z.string().optional(),
  metrics: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    )
    .optional(),
});

export const phoneShowcaseSceneSchema = z.object({
  ...baseScene,
  type: z.literal("phone-showcase"),
  phoneModel: z.string().min(1).default("generic-phone"),
  dashboardVariant: z.enum(["analytics", "sales", "social", "finance"]).default("analytics"),
  /** Optional path (public/) to a real .glb model replacing the procedural phone in the 3D scene. */
  glbUrl: z.string().optional(),
  render: z.enum(["2.5d", "3d"]).default("2.5d"),
});

export const featureCardsSceneSchema = z.object({
  ...baseScene,
  type: z.literal("feature-cards"),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        icon: z.string().optional(),
      }),
    )
    .min(1)
    .max(4),
});

export const statisticSceneSchema = z.object({
  ...baseScene,
  type: z.literal("statistic"),
  value: z.string().min(1),
  label: z.string().min(1),
  trend: z.enum(["up", "down", "flat"]).optional(),
});

export const callToActionSceneSchema = z.object({
  ...baseScene,
  type: z.literal("call-to-action"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  buttonLabel: z.string().min(1),
});

export const outroSceneSchema = z.object({
  ...baseScene,
  type: z.literal("outro"),
  title: z.string().optional(),
  logoText: z.string().optional(),
});

export const iconShowcaseSceneSchema = z.object({
  ...baseScene,
  type: z.literal("icon-showcase"),
  /** Abstract 3D mark shape — no brand asset required, swap for a GLB later (see SCENES.md). */
  shape: z.enum(["ring", "diamond", "facet"]).default("ring"),
});

/** Un point de donnée nommé pour les scènes graphiques (valeur numérique brute, jamais pré-formatée). */
export const dataPointSchema = z.object({
  label: z.string().min(1),
  value: z.number(),
});

export const barChartSceneSchema = z.object({
  ...baseScene,
  type: z.literal("bar-chart"),
  title: z.string().optional(),
  data: z.array(dataPointSchema).min(2).max(8),
  /** Suffixe d'unité affiché après chaque valeur (ex: "%", "K€"). */
  unit: z.string().optional(),
  /** Note de source affichée en bas — Hera recommande de toujours créditer la donnée. */
  source: z.string().optional(),
});

export const lineChartSceneSchema = z.object({
  ...baseScene,
  type: z.literal("line-chart"),
  title: z.string().optional(),
  data: z.array(dataPointSchema).min(2).max(24),
  unit: z.string().optional(),
  source: z.string().optional(),
});

export const comparisonSceneSchema = z.object({
  ...baseScene,
  type: z.literal("comparison"),
  title: z.string().optional(),
  before: dataPointSchema,
  after: dataPointSchema,
  unit: z.string().optional(),
  /** Sens de l'amélioration : "higher" (par défaut) ou "lower" (ex: un temps qui baisse est positif). Pilote la couleur du badge. */
  betterWhen: z.enum(["higher", "lower"]).default("higher"),
  source: z.string().optional(),
});

/**
 * Scènes OVERLAY — pensées pour être rendues sur fond TRANSPARENT (export
 * MOV ProRes 4444, voir RENDERING.md) et superposées à une vidéo existante.
 * Elles ne peignent aucun fond premium ; un élément positionné apparaît puis
 * disparaît (entrée/sortie temporisées).
 */
const overlayPositionSchema = z.enum(["bottom-left", "bottom-right", "top-left", "top-right", "bottom-center"]);

export const lowerThirdSceneSchema = z.object({
  ...baseScene,
  type: z.literal("lower-third"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  position: overlayPositionSchema.default("bottom-left"),
});

export const quoteCardSceneSchema = z.object({
  ...baseScene,
  type: z.literal("quote-card"),
  quote: z.string().min(1),
  author: z.string().optional(),
  position: overlayPositionSchema.default("bottom-center"),
});

export const calloutSceneSchema = z.object({
  ...baseScene,
  type: z.literal("callout"),
  text: z.string().min(1),
  position: overlayPositionSchema.default("top-right"),
});

export const statOverlaySceneSchema = z.object({
  ...baseScene,
  type: z.literal("stat-overlay"),
  value: z.string().min(1),
  label: z.string().min(1),
  position: overlayPositionSchema.default("bottom-right"),
});

export const assetShowcaseSceneSchema = z.object({
  ...baseScene,
  type: z.literal("asset-showcase"),
  /**
   * Référence de l'asset DÉJÀ résolu : soit un chemin `public/` (servi par
   * `staticFile`), soit une URL absolue. La résolution (Brandfetch /
   * Wikimedia / Openverse, voir `src/assets/`) se fait EN AMONT du rendu et
   * écrit ce champ dans le scénario — le rendu reste ainsi déterministe et
   * testable hors-ligne. Voir ASSETS.md.
   */
  src: z.string().min(1),
  /** Famille d'entité : pilote le cadrage (logo contenu / portrait circulaire / illustration). */
  entityKind: entityKindSchema.default("illustration"),
  /** Titre affiché (nom de marque/personne, ou intitulé). */
  label: z.string().optional(),
  /** Légende / crédit (attribution CC pour une illustration ou une photo). */
  caption: z.string().optional(),
});

export const sceneSchema = z.discriminatedUnion("type", [
  introSceneSchema,
  textRevealSceneSchema,
  dashboardShowcaseSceneSchema,
  phoneShowcaseSceneSchema,
  featureCardsSceneSchema,
  statisticSceneSchema,
  callToActionSceneSchema,
  iconShowcaseSceneSchema,
  assetShowcaseSceneSchema,
  barChartSceneSchema,
  lineChartSceneSchema,
  comparisonSceneSchema,
  lowerThirdSceneSchema,
  quoteCardSceneSchema,
  calloutSceneSchema,
  statOverlaySceneSchema,
  outroSceneSchema,
]);

export type Scene = z.infer<typeof sceneSchema>;
export type SceneType = Scene["type"];

const SCENE_DURATION_TOLERANCE_SECONDS = 0.05;

export const scenarioSchema = z
  .object({
    format: videoFormatSchema,
    fps: z.number().int().positive().default(30),
    durationInSeconds: z.number().positive(),
    themeId: z.string().min(1),
    scenes: z.array(sceneSchema).min(1),
  })
  .superRefine((scenario, ctx) => {
    const sum = scenario.scenes.reduce((total, scene) => total + scene.durationInSeconds, 0);
    if (Math.abs(sum - scenario.durationInSeconds) > SCENE_DURATION_TOLERANCE_SECONDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `La somme des durées de scènes (${sum}s) ne correspond pas à durationInSeconds (${scenario.durationInSeconds}s).`,
        path: ["scenes"],
      });
    }
  });

export type Scenario = z.infer<typeof scenarioSchema>;

export function parseScenario(data: unknown): Scenario {
  return scenarioSchema.parse(data);
}

export function safeParseScenario(data: unknown): z.ZodSafeParseResult<Scenario> {
  return scenarioSchema.safeParse(data);
}

/** Total frame count for a scenario at its own fps — the single source of truth for Root.tsx durationInFrames. */
export function scenarioDurationInFrames(scenario: Scenario): number {
  return Math.round(scenario.durationInSeconds * scenario.fps);
}

/** Per-scene frame ranges (start, duration) in sequence order, at the scenario's fps. */
export function sceneFrameRanges(scenario: Scenario): Array<{ scene: Scene; from: number; durationInFrames: number }> {
  let cursor = 0;
  return scenario.scenes.map((scene) => {
    const durationInFrames = Math.round(scene.durationInSeconds * scenario.fps);
    const range = { scene, from: cursor, durationInFrames };
    cursor += durationInFrames;
    return range;
  });
}
