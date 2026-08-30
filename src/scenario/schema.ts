import { z } from "zod";

export const videoFormatSchema = z.enum(["vertical", "landscape", "square"]);
export type VideoFormat = z.infer<typeof videoFormatSchema>;

export const FORMAT_DIMENSIONS: Record<VideoFormat, { width: number; height: number }> = {
  vertical: { width: 1080, height: 1920 },
  landscape: { width: 1920, height: 1080 },
  square: { width: 1080, height: 1080 },
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

export const sceneSchema = z.discriminatedUnion("type", [
  introSceneSchema,
  textRevealSceneSchema,
  dashboardShowcaseSceneSchema,
  phoneShowcaseSceneSchema,
  featureCardsSceneSchema,
  statisticSceneSchema,
  callToActionSceneSchema,
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

export function safeParseScenario(data: unknown): z.SafeParseReturnType<unknown, Scenario> {
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
