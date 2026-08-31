import type { EntityKind, EntityQuery, ResolvedAsset } from "./schema";

export class AssetResolutionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AssetResolutionError";
  }
}

/**
 * Un client sait résoudre UNE famille d'entité (`kind`) en asset. Le moteur
 * ne dépend que de cette interface, jamais d'un fournisseur concret — même
 * principe que `BriefToScenarioClient` pour la génération de scénario : la
 * couche de résolution est un point de couplage faible, remplaçable par une
 * vraie implémentation SaaS (files d'attente, clés utilisateur, fallback
 * multi-fournisseurs) sans toucher au schéma, aux scènes ni au renderer.
 */
export interface EntityAssetClient {
  readonly kind: EntityKind;
  resolve(query: EntityQuery): Promise<ResolvedAsset>;
}

export interface AssetResolver {
  resolve(query: EntityQuery): Promise<ResolvedAsset>;
}

/**
 * Aiguille chaque requête vers le client enregistré pour son `kind`. Une
 * seule source par famille (le premier gagne, un doublon est une erreur de
 * configuration signalée à la construction).
 */
export class MultiSourceAssetResolver implements AssetResolver {
  private readonly byKind = new Map<EntityKind, EntityAssetClient>();

  constructor(clients: readonly EntityAssetClient[]) {
    for (const client of clients) {
      if (this.byKind.has(client.kind)) {
        throw new AssetResolutionError(`Deux clients enregistrés pour le type d'entité "${client.kind}".`);
      }
      this.byKind.set(client.kind, client);
    }
  }

  async resolve(query: EntityQuery): Promise<ResolvedAsset> {
    const client = this.byKind.get(query.kind);
    if (!client) {
      const available = [...this.byKind.keys()].join(", ") || "aucun";
      throw new AssetResolutionError(
        `Aucun client pour le type d'entité "${query.kind}". Types disponibles: ${available}.`,
      );
    }
    return client.resolve(query);
  }

  /** Types d'entité effectivement résolvables par ce resolver. */
  supportedKinds(): EntityKind[] {
    return [...this.byKind.keys()];
  }
}
