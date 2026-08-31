import { AssetResolutionError, type EntityAssetClient } from "../resolver";
import { inferAssetFormat, type EntityQuery, type ResolvedAsset } from "../schema";

export interface OpenverseConfig {
  /** Base de l'API Openverse. Défaut: https://api.openverse.org/v1 */
  baseUrl?: string;
  /** Jeton optionnel (augmente le quota ; l'API marche sans). */
  apiToken?: string;
  fetchImpl?: typeof fetch;
}

interface OpenverseSearchResponse {
  results?: Array<{
    title?: string;
    url?: string;
    creator?: string;
    license?: string;
    license_version?: string;
  }>;
}

/**
 * Résolution d'une illustration/photo de concept via Openverse (moteur de
 * recherche d'œuvres sous licences ouvertes de la Wikimedia Foundation).
 * Aucune clé requise ; un jeton optionnel augmente le quota.
 *
 * Chaque résultat porte son `attribution` (auteur + licence CC), à afficher.
 *
 * NOTE réseau : `api.openverse.org` est bloqué dans le sandbox (403 proxy) —
 * seul le chemin hors-ligne via `fetchImpl` injecté est vérifiable ici.
 * Voir ASSETS.md.
 */
export class OpenverseIllustrationClient implements EntityAssetClient {
  readonly kind = "illustration" as const;
  private readonly baseUrl: string;
  private readonly apiToken?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: OpenverseConfig = {}) {
    this.baseUrl = config.baseUrl ?? process.env["OPENVERSE_API_BASE_URL"] ?? "https://api.openverse.org/v1";
    this.apiToken = config.apiToken ?? process.env["OPENVERSE_API_TOKEN"];
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async resolve(query: EntityQuery): Promise<ResolvedAsset> {
    const url = `${this.baseUrl}/images/?q=${encodeURIComponent(query.query)}&page_size=1`;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (this.apiToken) headers["Authorization"] = `Bearer ${this.apiToken}`;

    let response: Response;
    try {
      response = await this.fetchImpl(url, { headers });
    } catch (error) {
      throw new AssetResolutionError(`Échec réseau lors de l'appel à Openverse (${this.baseUrl}).`, error);
    }
    if (!response.ok) {
      throw new AssetResolutionError(`Openverse a répondu ${response.status} ${response.statusText} pour "${query.query}".`);
    }

    const data = (await response.json()) as OpenverseSearchResponse;
    const item = data.results?.[0];
    if (!item?.url) {
      throw new AssetResolutionError(`Aucune illustration trouvée sur Openverse pour "${query.query}".`);
    }

    const licenseId = [item.license?.toUpperCase(), item.license_version].filter(Boolean).join("-");
    return {
      kind: "illustration",
      format: inferAssetFormat(item.url),
      src: item.url,
      label: item.title ?? query.query,
      source: "openverse",
      attribution: [item.creator, licenseId].filter(Boolean).join(" — ") || undefined,
      license: licenseId || undefined,
    };
  }
}
