import { z } from "zod";

/**
 * Trois familles d'entités qu'un prompt peut nommer et qu'on sait
 * résoudre en asset visuel exploitable par le moteur (voir ASSETS.md) :
 * - `brand`        : une marque -> son logo vectoriel (Brandfetch)
 * - `person`       : une personne réelle -> une photo détourée (Wikimedia + rembg)
 * - `illustration` : un concept -> une image sous licence ouverte (Openverse)
 */
export const entityKindSchema = z.enum(["brand", "person", "illustration"]);
export type EntityKind = z.infer<typeof entityKindSchema>;

export const assetFormatSchema = z.enum(["svg", "png", "jpg"]);
export type AssetFormat = z.infer<typeof assetFormatSchema>;

/** Une requête d'entité, telle que produite par l'analyse NLP (Kimi) du prompt. */
export const entityQuerySchema = z.object({
  kind: entityKindSchema,
  /**
   * Le terme à résoudre, dépendant du type :
   * - `brand`        : un domaine ("openai.com") ou un nom de marque
   * - `person`       : un nom ("Sam Altman")
   * - `illustration` : un concept en langage naturel ("fusée au décollage")
   */
  query: z.string().min(1),
});
export type EntityQuery = z.infer<typeof entityQuerySchema>;

/**
 * Le résultat normalisé d'une résolution — indépendant de la source. Le
 * champ `src` est soit une URL (résolue en ligne), soit un chemin `public/`
 * (asset déjà téléchargé), les deux étant gérés par la scène `asset-showcase`.
 */
export const resolvedAssetSchema = z.object({
  kind: entityKindSchema,
  format: assetFormatSchema,
  src: z.string().min(1),
  /** Libellé lisible (nom de la marque / de la personne / titre de l'image). */
  label: z.string().optional(),
  /** Identifiant du fournisseur ("brandfetch", "wikimedia", "openverse"). */
  source: z.string().optional(),
  /** Crédit à afficher (auteur + licence), obligatoire pour certaines licences CC. */
  attribution: z.string().optional(),
  /** Identifiant de licence si connu (ex. "CC-BY-SA-4.0"). */
  license: z.string().optional(),
  /**
   * `true` si un détourage (suppression de fond, ex. rembg) doit être
   * appliqué avant usage — typiquement les photos de personnes. Le
   * détourage lui-même tourne côté backend (voir `cutout.ts`), pas ici.
   */
  needsCutout: z.boolean().optional(),
});
export type ResolvedAsset = z.infer<typeof resolvedAssetSchema>;

/** Devine le format d'un asset depuis l'extension de son URL/chemin (défaut: png). */
export function inferAssetFormat(src: string): AssetFormat {
  const clean = src.split("?")[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".svg")) return "svg";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "jpg";
  return "png";
}
