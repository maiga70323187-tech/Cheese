import { z } from "zod";

/**
 * A color is always stored as a hex string. The *key* it is stored under
 * (background, primary, textMuted, ...) is its explicit role — compositions
 * must never read a color by hard-coded value, only by role.
 */
const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, "Doit être une couleur hexadécimale (#RRGGBB)");

export const brandColorsSchema = z.object({
  background: hexColor,
  backgroundSecondary: hexColor.optional(),
  surface: hexColor,
  text: hexColor,
  textMuted: hexColor.optional(),
  primary: hexColor,
  secondary: hexColor.optional(),
  success: hexColor.optional(),
  warning: hexColor.optional(),
  danger: hexColor.optional(),
});

export const brandTypographySchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  label: z.string().min(1).optional(),
  titleScale: z.array(z.number().positive()).min(1),
});

export const brandRadiusSchema = z.object({
  small: z.number().nonnegative(),
  medium: z.number().nonnegative(),
  large: z.number().nonnegative(),
});

export const brandShadowsSchema = z.object({
  soft: z.string().min(1),
  elevated: z.string().min(1),
  glow: z.string().min(1).optional(),
});

export const motionEntranceSchema = z.enum(["fade", "slide", "scale", "spring", "reveal"]);

export const brandMotionSchema = z.object({
  entrance: motionEntranceSchema,
  durationFrames: z.number().int().positive(),
  easing: z.string().min(1),
  spring: z
    .object({
      damping: z.number().positive(),
      mass: z.number().positive(),
      stiffness: z.number().positive(),
    })
    .optional(),
});

export const backgroundTypeSchema = z.enum(["solid", "gradient", "radial", "studio", "custom"]);

export const brandBackgroundSchema = z.object({
  type: backgroundTypeSchema,
  colors: z.array(hexColor).min(1),
  /**
   * How far the background must sit from pure black, 0-1. This is what the
   * "the scene must never disappear into black" test in
   * src/brand/schema.test.ts checks against premium presets.
   */
  separationFromBlack: z.number().min(0).max(1),
  vignette: z.number().min(0).max(1),
  grain: z.number().min(0).max(1).optional(),
  glow: z.boolean().optional(),
  particles: z.boolean().optional(),
});

export const brandThemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  colors: brandColorsSchema,
  typography: brandTypographySchema,
  spacing: z.array(z.number().nonnegative()).min(1),
  radius: brandRadiusSchema,
  shadows: brandShadowsSchema,
  motion: brandMotionSchema,
  background: brandBackgroundSchema,
});

export type BrandColors = z.infer<typeof brandColorsSchema>;
export type BrandTypography = z.infer<typeof brandTypographySchema>;
export type BrandRadius = z.infer<typeof brandRadiusSchema>;
export type BrandShadows = z.infer<typeof brandShadowsSchema>;
export type BrandMotion = z.infer<typeof brandMotionSchema>;
export type BrandBackground = z.infer<typeof brandBackgroundSchema>;
export type BrandTheme = z.infer<typeof brandThemeSchema>;

export function parseBrandTheme(data: unknown): BrandTheme {
  return brandThemeSchema.parse(data);
}

export function safeParseBrandTheme(data: unknown): z.ZodSafeParseResult<BrandTheme> {
  return brandThemeSchema.safeParse(data);
}
