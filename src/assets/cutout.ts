import type { ResolvedAsset } from "./schema";

/**
 * Étape de détourage (suppression de fond). Dans le pipeline de référence,
 * c'est `rembg` — un modèle Python (U²-Net) qui tourne CÔTÉ BACKEND, jamais
 * dans le navigateur de rendu Remotion. Cette interface est le seam : le
 * backend SaaS branche une vraie implémentation (appel au service rembg,
 * renvoyant un PNG transparent), le moteur ne dépend que du contrat.
 */
export interface BackgroundRemover {
  /** Prend un asset (typiquement `needsCutout: true`) et renvoie sa version détourée. */
  remove(asset: ResolvedAsset): Promise<ResolvedAsset>;
}

/**
 * Implémentation par défaut : passe-plat. Utile pour les tests et pour un
 * environnement sans service de détourage — l'asset est renvoyé tel quel
 * (avec son fond). À remplacer par un `RembgBackgroundRemover` côté backend.
 */
export class NoopBackgroundRemover implements BackgroundRemover {
  async remove(asset: ResolvedAsset): Promise<ResolvedAsset> {
    return asset;
  }
}

/**
 * Applique le détourage uniquement si l'asset le demande (`needsCutout`),
 * sinon le renvoie inchangé. Après détourage, `needsCutout` est retiré.
 */
export async function applyCutoutIfNeeded(asset: ResolvedAsset, remover: BackgroundRemover): Promise<ResolvedAsset> {
  if (!asset.needsCutout) return asset;
  const cut = await remover.remove(asset);
  return { ...cut, needsCutout: false };
}
