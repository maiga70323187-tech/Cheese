import { AssetResolutionError, type EntityAssetClient } from "../resolver";
import { inferAssetFormat, type EntityQuery, type ResolvedAsset } from "../schema";

export interface WikimediaConfig {
  /** Base de l'API REST Wikipédia. Défaut: https://fr.wikipedia.org/api/rest_v1 */
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

/** Forme partielle de la réponse REST /page/summary/{title}. */
interface WikiSummaryResponse {
  title?: string;
  originalimage?: { source?: string };
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
}

/**
 * Résolution d'une photo de personne via l'API REST de Wikipédia
 * (endpoint `/page/summary/{title}`, image originale ou vignette).
 *
 * Le résultat porte `needsCutout: true` : ces photos ont un fond, à
 * détourer (rembg) avant compositing — le détourage tourne côté backend
 * (voir `cutout.ts`), pas ici.
 *
 * NOTE réseau : `*.wikipedia.org` est bloqué dans le sandbox (403 proxy) —
 * seul le chemin hors-ligne via `fetchImpl` injecté est vérifiable ici.
 * Voir ASSETS.md. Aucune clé requise en production.
 *
 * ATTENTION droits : l'image d'une personne réelle relève du droit à
 * l'image et la licence du fichier (souvent CC-BY-SA) impose une
 * attribution — d'où le champ `attribution`. C'est une décision produit,
 * voir ASSETS.md.
 */
export class WikimediaClient implements EntityAssetClient {
  readonly kind = "person" as const;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: WikimediaConfig = {}) {
    this.baseUrl = config.baseUrl ?? process.env["WIKIMEDIA_API_BASE_URL"] ?? "https://fr.wikipedia.org/api/rest_v1";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async resolve(query: EntityQuery): Promise<ResolvedAsset> {
    const title = encodeURIComponent(query.query.trim().replace(/\s+/g, "_"));

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/page/summary/${title}`, {
        headers: { Accept: "application/json" },
      });
    } catch (error) {
      throw new AssetResolutionError(`Échec réseau lors de l'appel à Wikipédia (${this.baseUrl}).`, error);
    }
    if (!response.ok) {
      throw new AssetResolutionError(`Wikipédia a répondu ${response.status} ${response.statusText} pour "${query.query}".`);
    }

    const data = (await response.json()) as WikiSummaryResponse;
    const src = data.originalimage?.source ?? data.thumbnail?.source;
    if (!src) {
      throw new AssetResolutionError(`Aucune image trouvée sur Wikipédia pour "${query.query}".`);
    }

    return {
      kind: "person",
      format: inferAssetFormat(src),
      src,
      label: data.title ?? query.query,
      source: "wikimedia",
      attribution: `Wikimedia Commons — voir la page du fichier pour l'auteur et la licence`,
      license: "voir fichier (souvent CC-BY-SA)",
      needsCutout: true,
    };
  }
}
