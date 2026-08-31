import { AssetResolutionError, type EntityAssetClient } from "../resolver";
import { inferAssetFormat, type EntityQuery, type ResolvedAsset } from "../schema";

export interface BrandfetchConfig {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

/** Forme partielle de la réponse Brandfetch v2 /brands/{domain} qu'on exploite. */
interface BrandfetchResponse {
  name?: string;
  domain?: string;
  logos?: Array<{
    type?: string; // "logo" | "symbol" | "icon" | ...
    theme?: string; // "light" | "dark"
    formats?: Array<{ src?: string; format?: string }>;
  }>;
}

/**
 * Résolution d'un logo de marque via l'API Brandfetch v2.
 *
 * Config (surchargée par le constructeur) :
 * - BRANDFETCH_API_KEY     (requise pour appeler l'API)
 * - BRANDFETCH_API_BASE_URL default: https://api.brandfetch.io/v2
 *
 * NOTE réseau : dans le sandbox de développement, `api.brandfetch.io` est
 * bloqué (403 au tunnel proxy) — seul le chemin hors-ligne (via un
 * `fetchImpl` injecté, cf. tests) est vérifiable ici. En production
 * (backend SaaS, réseau ouvert + clé), le vrai appel fonctionne. Voir
 * ASSETS.md.
 */
export class BrandfetchClient implements EntityAssetClient {
  readonly kind = "brand" as const;
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: BrandfetchConfig = {}) {
    this.apiKey = config.apiKey ?? process.env["BRANDFETCH_API_KEY"];
    this.baseUrl = config.baseUrl ?? process.env["BRANDFETCH_API_BASE_URL"] ?? "https://api.brandfetch.io/v2";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async resolve(query: EntityQuery): Promise<ResolvedAsset> {
    if (!this.apiKey) {
      throw new AssetResolutionError(
        "BRANDFETCH_API_KEY manquant. Définis cette variable d'environnement pour résoudre les logos de marque.",
      );
    }
    const domain = normalizeDomain(query.query);

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/brands/${encodeURIComponent(domain)}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
    } catch (error) {
      throw new AssetResolutionError(`Échec réseau lors de l'appel à Brandfetch (${this.baseUrl}).`, error);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new AssetResolutionError(`Brandfetch a répondu ${response.status} ${response.statusText}: ${body}`);
    }

    const data = (await response.json()) as BrandfetchResponse;
    const best = pickBestLogo(data);
    if (!best) {
      throw new AssetResolutionError(`Aucun logo exploitable renvoyé par Brandfetch pour "${domain}".`);
    }
    return {
      kind: "brand",
      format: best.format,
      src: best.src,
      label: data.name ?? domain,
      source: "brandfetch",
      attribution: `Logo © ${data.name ?? domain}`,
    };
  }
}

/** "OpenAI" / "https://openai.com/" / "openai.com" -> "openai.com". */
function normalizeDomain(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const withoutScheme = trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (withoutScheme.includes(".")) return withoutScheme;
  // Un nom de marque sans TLD : heuristique .com (le SaaS peut remplacer par
  // une vraie recherche de domaine).
  return `${withoutScheme.replace(/\s+/g, "")}.com`;
}

/** Préfère un vrai "logo" (pas "symbol"/"icon"), thème sombre, format SVG puis PNG. */
function pickBestLogo(data: BrandfetchResponse): { src: string; format: ResolvedAsset["format"] } | null {
  const logos = data.logos ?? [];
  const byPriority = [...logos].sort((a, b) => logoScore(b) - logoScore(a));
  for (const logo of byPriority) {
    const formats = logo.formats ?? [];
    const svg = formats.find((f) => (f.format ?? inferFmt(f.src)) === "svg" && f.src);
    const raster = formats.find((f) => f.src);
    const chosen = svg ?? raster;
    if (chosen?.src) {
      return { src: chosen.src, format: (chosen.format as ResolvedAsset["format"]) ?? inferAssetFormat(chosen.src) };
    }
  }
  return null;
}

function logoScore(logo: NonNullable<BrandfetchResponse["logos"]>[number]): number {
  let score = 0;
  if (logo.type === "logo") score += 4;
  else if (logo.type === "symbol") score += 2;
  if (logo.theme === "dark") score += 1;
  if ((logo.formats ?? []).some((f) => (f.format ?? inferFmt(f.src)) === "svg")) score += 2;
  return score;
}

function inferFmt(src?: string): string {
  return src ? inferAssetFormat(src) : "";
}
