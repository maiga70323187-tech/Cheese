# Architecture

> Statut : rédigé au fil des étapes. Cette version couvre le Checkpoint A
> (scaffolding, charte graphique, scénario). Les sections moteur de scènes,
> rendu et 3D seront complétées aux checkpoints suivants.

## Vue d'ensemble

```
Brief en langage naturel
        │
        ▼
BriefToScenarioClient (src/scenario/brief-to-scenario.ts)   ← seam SaaS
        │  produit un Scenario validé (Zod)
        ▼
Scenario JSON  +  themeId
        │
        ▼
Moteur de scènes (src/engine)      ← consomme Scenario + BrandTheme, jamais de couleurs codées en dur
        │
        ▼
Compositions Remotion (src/remotion) : VideoVertical / VideoLandscape / VideoSquare
        │
        ▼
Pipeline de rendu (src/cli/render.ts)  →  MP4 / GIF déterministes
```

Quatre zones de responsabilité, strictement séparées par dossier :

| Dossier | Rôle | Ne doit jamais |
|---|---|---|
| `src/brand` | Schéma Zod `BrandTheme` + presets (données de marque) | contenir de logique d'animation |
| `src/scenario` | Schéma Zod `Scenario`, conversion brief → scénario | connaître Remotion ou React |
| `src/engine` | Compositions Remotion pilotées par `Scenario` + `BrandTheme` | avoir une valeur codée en dur (couleur, easing, durée) hors des props reçues |
| `src/remotion` | `Root.tsx`, enregistrement des compositions, dimensions/fps | contenir de la logique métier |
| `src/cli` | Pipeline de rendu (MP4/GIF), sélection scénario + thème | dupliquer la validation déjà faite par `src/scenario` |

Un seul code de composition (`src/engine/scenes/*`) doit fonctionner avec
n'importe quelle charte : chaque composant lit ses valeurs via le
`BrandTheme` reçu en prop (ou via un contexte React qui le porte), jamais
via une constante importée.

## Décisions techniques et pourquoi

- **pnpm, package unique (pas de monorepo multi-packages)** : la séparation
  demandée (UI / moteur / marque / rendu) est obtenue par dossiers + exports
  nommés (`src/brand`, `src/scenario`, `src/engine`, `src/remotion`,
  `src/cli`), avec des alias TS (`@brand/*`, `@scenario/*`, `@engine/*`).
  Un monorepo pnpm multi-packages ajouterait de la résolution de
  dépendances et des soucis de hoisting sans bénéfice réel tant qu'aucun de
  ces modules n'est publié séparément. Le jour où `brand` ou `scenario`
  doivent devenir des packages npm indépendants (API SaaS séparée du
  moteur de rendu), l'extraction est mécanique grâce à cette séparation.
- **TypeScript 5.7.3 plutôt que 7.0.x (dernier `latest` sur npm)** : la
  branche 7 est la réécriture native (`tsgo`) tout juste stabilisée ;
  l'écosystème autour de Remotion, `tsx`, `@remotion/zod-types` et Vitest a
  été testé contre TS 5.x. On repasse à une 7.x quand Remotion l'annoncera
  supportée explicitiement.
- **zod 3.25.x plutôt que zod 4.5.x** : `@remotion/zod-types` (utilisé par
  Remotion Studio pour l'éditeur de props typé) est construit et testé
  contre l'API zod v3. zod v4 change des détails internes (`_def`, parsing)
  qui peuvent casser l'introspection faite par Remotion. On réévaluera zod
  4 quand `@remotion/zod-types` l'annoncera supporté.
- **Pas de Vite séparé** : Remotion Studio (`remotion studio`) est déjà le
  serveur de prévisualisation (webpack interne à Remotion). Ajouter Vite
  dupliquerait cette fonction sans l'utiliser réellement — Vite reste une
  dépendance transitive de l'outillage Remotion/Vitest, pas un serveur dev
  que ce projet pilote.
- **Pas de ffmpeg système requis** : `@remotion/renderer` embarque son
  propre compositeur ; ffmpeg n'est nécessaire que pour des conversions
  optionnelles hors du pipeline Remotion (voir `RENDERING.md` et
  `TROUBLESHOOTING.md`).
- **Kimi K2 comme fournisseur NL → JSON** : `src/scenario/brief-to-scenario.ts`
  expose l'interface `BriefToScenarioClient` (une seule méthode `convert`).
  `KimiBriefToScenarioClient` est l'implémentation réelle (appel HTTP
  OpenAI-compatible vers l'API Kimi K2 de Moonshot AI), configurable par
  variables d'environnement (`KIMI_API_KEY`, `KIMI_API_BASE_URL`,
  `KIMI_MODEL`). Le moteur de scènes ne dépend que de l'interface : changer
  de fournisseur (ou brancher un vrai backend SaaS avec file d'attente) ne
  touche pas `src/engine` ni `src/brand`.

## Déterminisme

Les animations du moteur de scènes ne doivent dépendre que de la frame
courante fournie par Remotion (`useCurrentFrame()`) et des données validées
(`Scenario`, `BrandTheme`) — jamais de `Date.now()`, de `Math.random()` non
seedé, ni d'état réseau. L'appel à Kimi K2 (étape NL → JSON) est en dehors
de cette contrainte : c'est une étape de préparation, exécutée une fois,
avant que le rendu déterministe ne commence.

## Prochaines sections (Checkpoints B/C/finalisation)

- Moteur de scènes : registre de compositions, `SceneSequence`, contexte de
  thème.
- Fond premium : halos, particules, vignette, grain — implémentation et
  test de lisibilité.
- Scène 2.5D et scène 3D (React Three Fiber) du téléphone.
- Pipeline de rendu MP4/GIF et CLI.
