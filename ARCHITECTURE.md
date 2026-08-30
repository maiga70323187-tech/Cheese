# Architecture

> Statut : projet complet — Checkpoints A (scaffolding, charte graphique,
> scénario), B (moteur de scènes, compositions 2D, `Root.tsx`), C (scène
> téléphone 2.5D + 3D) et Finalisation (pipeline de rendu MP4/GIF, suite
> de tests, documentation) sont tous livrés.

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
- **zod 4.4.3, jamais un autre 4.x, jamais 3.x** : `remotion compositions`
  (Checkpoint B) a d'abord signalé un avertissement `Version mismatch` avec
  zod 3.25.x — Remotion 4.0.518 exige exactement `zod@4.4.3` en interne
  (`@remotion/zod-types`). C'est l'inverse de ce que Checkpoint A supposait
  (zod v3 par prudence) : vérifié ici en le lançant réellement plutôt que
  deviné. Ne pas monter vers zod 4.5.x (dernier `latest` npm) tant que
  Remotion n'annonce pas le supporter — même méthode qu'avec TypeScript
  ci-dessus, la version "la plus récente publiée" n'est pas forcément celle
  attendue par le framework.
- **Pas de Vite séparé** : Remotion Studio (`remotion studio`) est déjà le
  serveur de prévisualisation (webpack interne à Remotion). Ajouter Vite
  dupliquerait cette fonction sans l'utiliser réellement — Vite reste une
  dépendance transitive de l'outillage Remotion/Vitest, pas un serveur dev
  que ce projet pilote.
- **Pas de ffmpeg système requis** : `@remotion/renderer` encode/mux via
  son propre compositeur natif (`@remotion/compositor-linux-x64-gnu`,
  installé comme dépendance npm normale) ; vérifié par un vrai rendu MP4
  complet à la Finalisation, sans `ffmpeg` installé sur le système. ffmpeg
  ne serait utile que pour des conversions hors pipeline Remotion (voir
  `RENDERING.md` et `TROUBLESHOOTING.md`).
- **Navigateur : réutiliser le Chromium préinstallé, pas le téléchargement
  de Remotion** : le premier rendu réel (Checkpoint B) a échoué avec un
  `403` — cet environnement bloque `remotion.media` (allowlist réseau).
  `remotion.config.ts` pointe `Config.setBrowserExecutable(...)` vers le
  Chrome Headless Shell déjà installé pour Playwright
  (`/opt/pw-browsers/chromium_headless_shell-1194/...`), avec un
  `REMOTION_BROWSER_EXECUTABLE` pour l'écraser ailleurs. Voir
  `TROUBLESHOOTING.md`.
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

## Scène téléphone 2.5D + 3D (Checkpoint C)

`phone-showcase` route vers `PhoneShowcase` (2.5D, CSS/DOM pur) ou
`PhoneShowcase3D` (3D, React Three Fiber) selon `scene.render`. Détail
complet dans `SCENES.md`. Décisions notables :

- **`@remotion/three`'s `<ThreeCanvas>`, jamais le `<Canvas>` brut de
  R3F** : synchronise le rendu WebGL sur `useCurrentFrame()` plutôt que
  `requestAnimationFrame`, seule façon d'obtenir un rendu 3D déterministe
  frame par frame avec Remotion.
- **Pas de `<Html>` (drei) pour projeter du DOM sur l'écran 3D** :
  confirmé cassé dans ce pipeline (portale hors de l'arbre React que
  `ThreeCanvas` synchronise) — l'écran 3D réimplémente le tableau de bord
  en géométrie Three.js native. Voir `TROUBLESHOOTING.md`.
- **Pas de `<Text>` (drei/troika) sur l'écran 3D** : télécharge une police
  par défaut depuis un CDN externe, contraire au principe "aucune
  dépendance réseau au rendu" déjà appliqué à l'éclairage.
- **Pas de `<Environment>`/HDRI** : même principe — l'éclairage studio de
  `Phone3DScene` est entièrement procédural (`ambientLight` +
  `hemisphereLight` + `directionalLight` × 2 + `pointLight` teintée par
  `theme.colors.primary`), aucun asset à télécharger.
- **Téléphone procédural (`RoundedBox` + primitives), pas de GLB** : un
  emplacement de remplacement clair est documenté dans `SCENES.md` pour
  brancher un vrai modèle plus tard, sans toucher caméra/lumières/animation.

## Pipeline de rendu (Finalisation)

`src/cli/render.ts` (voir `RENDERING.md`) valide le scénario, force le
format à celui de la composition choisie, et appelle `remotion render`
(donc `remotion.config.ts` s'applique). Un vrai rendu MP4 complet
(1080×1920, 12s, 360 frames) et un GIF de démonstration ont été produits
et vérifiés à cette étape — pas seulement lancés sans erreur : durée,
codec et dimensions confirmés via `getVideoMetadata()` de
`@remotion/renderer` pour le MP4, et compte de frames réel (comptage des
blocs `Graphic Control Extension`) pour le GIF. Un vrai bug a été trouvé
ici aussi : `Config.setConcurrency(undefined)` (Checkpoint A) plantait
tout rendu multi-frame avec `RangeError: Invalid array length` — voir
`TROUBLESHOOTING.md`.

## Méthode de vérification (tous les checkpoints)

Un `tsc --noEmit` vert prouve que le code type-check, pas qu'un rendu est
correct. Chaque scène — y compris la 3D, en `vertical` et `landscape` —
et le pipeline de rendu final ont donc aussi été vérifiés par de vrais
rendus Remotion (`remotion still` pendant le développement,
`src/remotion/mount.test.ts` de façon automatisée, un rendu MP4/GIF
complet à la Finalisation) — jamais seulement compilés. Détail dans
`SCENES.md`. Plusieurs vrais bugs runtime ont été trouvés cette façon-là
qu'un typecheck seul n'aurait pas révélés : la version de zod attendue
par Remotion, le téléchargement de navigateur bloqué par le réseau
(Checkpoint B), un radius de `RoundedBox` dégénéré, `<Html>` de drei
invisible sous `<ThreeCanvas>`, des matériaux `transparent` invisibles,
un cadrage caméra très éloigné de sa prédiction théorique (Checkpoint C),
et `Config.setConcurrency(undefined)` qui cassait tout rendu multi-frame
(Finalisation) — voir `TROUBLESHOOTING.md` pour chacun. Le contrôle de
déterminisme (deux rendus de la même frame → fichiers identiques en
octets) est automatisé dans `src/remotion/mount.test.ts`, plutôt que
seulement vérifié manuellement.
