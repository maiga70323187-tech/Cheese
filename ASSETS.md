# Résolution d'assets (logos, visages, illustrations)

Ce module (`src/assets/`) transforme une **entité nommée dans un prompt**
(une marque, une personne, un concept) en un **asset visuel** (logo SVG,
photo détourée, illustration sous licence) que le moteur sait animer via la
scène `asset-showcase`.

```
Prompt → [NLP entité] → [résolution d'asset] → scenario JSON (avec src) → moteur Remotion → MP4
                          ├ brand        → Brandfetch  → logo SVG
                          ├ person       → Wikimedia   → photo → rembg (détourage)
                          └ illustration → Openverse   → image CC
```

Point clé d'architecture : **la résolution a lieu EN AMONT du rendu**, pas
dedans. Elle écrit un champ `src` (chemin `public/` ou URL) dans le
scénario ; la scène `asset-showcase` ne consomme que cette référence déjà
résolue. Le rendu reste ainsi **déterministe** et **vérifiable hors-ligne**
(aucun appel réseau pendant le rendu), au même titre que le reste du moteur.

## Modules

| Fichier | Rôle |
|---|---|
| `src/assets/schema.ts` | Types Zod : `EntityKind`, `EntityQuery`, `ResolvedAsset` |
| `src/assets/resolver.ts` | `EntityAssetClient` (interface), `MultiSourceAssetResolver` (aiguillage par `kind`) |
| `src/assets/clients/brandfetch.ts` | Marque → logo (API Brandfetch v2) |
| `src/assets/clients/wikimedia.ts` | Personne → photo (API REST Wikipédia), `needsCutout: true` |
| `src/assets/clients/openverse.ts` | Illustration → image sous licence CC (API Openverse) |
| `src/assets/cutout.ts` | `BackgroundRemover` (seam rembg) + passe-plat par défaut |
| `src/assets/index.ts` | `createDefaultAssetResolver()` (les 3 clients depuis l'env) |

Le moteur ne dépend que des **interfaces** — exactement comme
`BriefToScenarioClient` pour la génération de scénario. Une vraie
implémentation SaaS (files d'attente, clés utilisateur, fallback
multi-fournisseurs) se branche sans toucher au schéma, aux scènes ni au
renderer.

## Configuration (variables d'environnement)

| Variable | Défaut | Pour |
|---|---|---|
| `BRANDFETCH_API_KEY` | — (requise) | logos de marque |
| `BRANDFETCH_API_BASE_URL` | `https://api.brandfetch.io/v2` | |
| `WIKIMEDIA_API_BASE_URL` | `https://fr.wikipedia.org/api/rest_v1` | photos de personnes (pas de clé) |
| `OPENVERSE_API_BASE_URL` | `https://api.openverse.org/v1` | illustrations CC (pas de clé) |
| `OPENVERSE_API_TOKEN` | — (optionnel) | augmente le quota Openverse |

## Limite du sandbox de développement

Dans cet environnement, le proxy réseau **bloque** `api.brandfetch.io`,
`*.wikipedia.org` et `api.openverse.org` (403 au tunnel — comme
`api.tokenrouter.com` pour Kimi K2). Conséquence : seul le **chemin
hors-ligne** est vérifiable ici, en injectant un `fetchImpl` dans les
clients (voir `src/assets/assets.test.ts`, 13 tests). Les **vrais appels**
fonctionnent dans un environnement à réseau ouvert (backend SaaS, avec les
clés). La scène, elle, est vérifiée par de **vrais rendus** avec des assets
locaux (`public/assets/`), voir SCENES.md.

## Détourage (rembg)

`rembg` est un modèle Python (U²-Net) : il tourne **côté backend**, jamais
dans le navigateur de rendu. `src/assets/cutout.ts` définit l'interface
`BackgroundRemover` ; branche un `RembgBackgroundRemover` (appel au service)
côté serveur. `applyCutoutIfNeeded()` n'applique le détourage que si l'asset
porte `needsCutout` (les photos de personnes), et retire le drapeau ensuite.

## Note juridique (à lire avant la mise en production)

- **Logos de marque** : marques déposées. Leur usage dans une vidéo
  générée peut être encadré (comparaison, mention, publicité). Brandfetch
  impose aussi ses propres conditions d'utilisation.
- **Visages de personnes réelles** : relèvent du **droit à l'image** ; la
  licence du fichier Wikimedia (souvent CC-BY-SA) impose en plus une
  **attribution** — d'où le champ `attribution` propagé jusqu'à la légende
  de la scène.
- **Illustrations Openverse** : sous licences ouvertes, mais chaque licence
  a ses obligations (attribution, partage à l'identique…) — respecter le
  champ `attribution`.

Ces choix relèvent de la décision produit ; le code fournit la mécanique et
propage systématiquement l'attribution, il n'affranchit pas des droits.

## Ajouter/basculer un fournisseur

Implémenter `EntityAssetClient` (un `kind`, une méthode `resolve`), l'ajouter
à `MultiSourceAssetResolver`. Le contrat de sortie est toujours un
`ResolvedAsset` normalisé — le reste du pipeline ne change pas.
