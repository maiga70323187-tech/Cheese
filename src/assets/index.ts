export * from "./schema";
export * from "./resolver";
export * from "./cutout";
export { BrandfetchClient, type BrandfetchConfig } from "./clients/brandfetch";
export { WikimediaClient, type WikimediaConfig } from "./clients/wikimedia";
export { OpenverseIllustrationClient, type OpenverseConfig } from "./clients/openverse";

import { MultiSourceAssetResolver } from "./resolver";
import { BrandfetchClient } from "./clients/brandfetch";
import { WikimediaClient } from "./clients/wikimedia";
import { OpenverseIllustrationClient } from "./clients/openverse";

/**
 * Resolver par défaut couvrant les trois familles (marque / personne /
 * illustration) avec Brandfetch + Wikimedia + Openverse, configurés depuis
 * les variables d'environnement. C'est le point d'entrée que le backend
 * SaaS appelle ; les clés/URLs sont surchargées par les configs si besoin.
 */
export function createDefaultAssetResolver(): MultiSourceAssetResolver {
  return new MultiSourceAssetResolver([
    new BrandfetchClient(),
    new WikimediaClient(),
    new OpenverseIllustrationClient(),
  ]);
}
