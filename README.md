# Cheese — moteur SaaS de génération vidéo

Transforme une demande en langage naturel en scénario JSON validé, puis en
vidéo rendue par [Remotion](https://www.remotion.dev/), pilotée par une
charte graphique elle-même validée par [Zod](https://zod.dev/) — jamais de
couleur ou de style codé en dur dans une composition.

> **Statut** : projet complet — charte graphique, scénario, conversion
> NL → JSON via Kimi K2, moteur de scènes avec 7 compositions 2D **et**
> la scène téléphone en 2.5D (CSS) et en vraie 3D (React Three Fiber +
> `@remotion/three`), pipeline de rendu MP4/GIF, et suite de tests
> complète (36 tests, dont des rendus réels automatisés) — voir
> `ARCHITECTURE.md` pour le détail des décisions et `TROUBLESHOOTING.md`
> pour les bugs réels trouvés et corrigés en cours de route.

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

pnpm studio         # Remotion Studio (prévisualisation) — VideoVertical/Landscape/Square
pnpm render:vertical   # rendu MP4 1080x1920 (scénario phone-app-ad par défaut)
pnpm render:landscape  # rendu MP4 1920x1080
pnpm render:square     # rendu MP4 1080x1080
pnpm render:gif        # export GIF
```

Voir `RENDERING.md` pour les options du CLI de rendu (`--scenario`,
`--theme`, `--out`, ...) et comment rendre un scénario JSON personnalisé.

Pour un contrôle rapide sans passer par le Studio, un rendu image fixe
réel (pas seulement `tsc`) :

```bash
mkdir -p out
pnpm exec remotion still src/remotion/index.ts VideoVertical out/check.png --frame=30
```

Voir `TROUBLESHOOTING.md` si le navigateur headless de Remotion ne peut
pas se télécharger (environnements réseau restreints).

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

## Tests

```bash
pnpm test
```

36 tests : validation des schémas (charte, scénario), client Kimi K2
(fetch simulé, déterministe), PRNG déterministe et données de dashboard,
compilation TypeScript, **et un rendu réel** de chaque composition
(`VideoVertical`/`Landscape`/`Square`, dimensions/fps vérifiés) plus un
contrôle de déterminisme automatisé (deux rendus de la même frame doivent
produire des octets identiques) — voir `src/remotion/mount.test.ts`.

## Documentation

- `ARCHITECTURE.md` — architecture, décisions techniques et pourquoi.
- `DESIGN_SYSTEM.md` — schéma de charte, presets, comment en ajouter une.
- `SCENES.md` — catalogue des scènes du moteur, y compris la scène
  téléphone 2.5D/3D et comment y brancher un modèle GLB.
- `RENDERING.md` — pipeline de rendu MP4/GIF, CLI, licences.
- `TROUBLESHOOTING.md` — problèmes réels rencontrés et leurs solutions.
