# Cheese — moteur SaaS de génération vidéo

Transforme une demande en langage naturel en scénario JSON validé, puis en
vidéo rendue par [Remotion](https://www.remotion.dev/), pilotée par une
charte graphique elle-même validée par [Zod](https://zod.dev/) — jamais de
couleur ou de style codé en dur dans une composition.

> **Statut** : Checkpoint A livré (scaffolding, charte graphique,
> scénario, conversion NL → JSON via Kimi K2). Le moteur de scènes, les
> compositions 2D/2.5D/3D et le pipeline de rendu MP4/GIF arrivent aux
> checkpoints suivants — voir `ARCHITECTURE.md` pour le détail.

## Stack

TypeScript strict · React 19 · Remotion 4 · React Three Fiber / Three.js ·
Zod · Vitest · pnpm.

## Prérequis

- Node.js ≥ 18 (testé avec Node 22)
- pnpm (`corepack enable` ou `npm i -g pnpm`)

## Installation

```bash
pnpm install
```

## Commandes

```bash
pnpm typecheck      # tsc --noEmit sur tout le projet
pnpm test           # suite Vitest (schémas, scénario, déterminisme)
pnpm test:watch     # Vitest en mode watch

pnpm studio         # Remotion Studio (prévisualisation) — disponible à partir du Checkpoint B
pnpm render:vertical   # rendu MP4 1080x1920 — disponible à partir de la Finalisation
pnpm render:landscape  # rendu MP4 1920x1080
pnpm render:square     # rendu MP4 1080x1080
pnpm render:gif        # export GIF
```

## Charte graphique (données, pas de code en dur)

Voir `DESIGN_SYSTEM.md`. Cinq presets livrés : `luxury-dark`,
`premium-tech`, `minimal-light`, `editorial`, `vibrant-startup`
(`src/brand/presets`).

## Scénario JSON

Voir `src/scenario/schema.ts` pour le schéma Zod complet et
`src/scenario/examples/phone-app-ad.ts` pour un exemple correspondant au
brief produit de référence.

## Conversion langage naturel → scénario (Kimi K2)

`src/scenario/brief-to-scenario.ts` expose `BriefToScenarioClient`
(interface) et `KimiBriefToScenarioClient` (implémentation réelle, API
Kimi K2 de Moonshot AI, compatible OpenAI). Configuration par variables
d'environnement :

```bash
export KIMI_API_KEY="..."                                # requis
export KIMI_API_BASE_URL="https://api.moonshot.ai/v1"    # optionnel
export KIMI_MODEL="kimi-k2-0711-preview"                 # optionnel
```

Sans `KIMI_API_KEY`, `convert()` lève une `BriefToScenarioError` explicite
— aucun appel réseau silencieux. Les tests (`brief-to-scenario.test.ts`)
n'appellent jamais le réseau réel : ils injectent un `fetchImpl` simulé
pour rester déterministes.

Un `.env` local (non commité, voir `.gitignore`) est déjà configuré pour
ce projet avec `KIMI_API_KEY` et `KIMI_API_BASE_URL=https://api.tokenrouter.com/v1`
(fournisseur tiers OpenAI-compatible vers Kimi K2). **Non testé en conditions
réelles depuis cette session** : la politique réseau de cet environnement
distant bloque `api.tokenrouter.com` — voir `TROUBLESHOOTING.md#appel-kimi-k2-bloqué-dans-une-session-claude-code-on-the-web`
pour tester en dehors de ce sandbox et pour retrouver l'identifiant exact
du modèle (`KIMI_MODEL`).

## Documentation

- `ARCHITECTURE.md` — architecture, décisions techniques et pourquoi.
- `DESIGN_SYSTEM.md` — schéma de charte, presets, comment en ajouter une.
- `SCENES.md` — catalogue des scènes du moteur (à partir du Checkpoint B).
- `RENDERING.md` — pipeline de rendu MP4/GIF (à partir de la Finalisation).
- `TROUBLESHOOTING.md` — problèmes connus et solutions.
