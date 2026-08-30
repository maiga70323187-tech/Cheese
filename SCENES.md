# Scènes

> Statut : les 7 scènes 2D du Checkpoint B sont livrées et vérifiées par un
> rendu réel (voir `ARCHITECTURE.md` pour la méthode de vérification).
> `phone-showcase` reste un placeholder jusqu'au Checkpoint C (2.5D/3D).

Chaque scène est un composant React sous `src/engine/scenes/`, mappé depuis
`scene.type` par `src/engine/registry.ts`. Une scène ne reçoit **que**:

1. les champs de son type dans le `Scenario` (validés par Zod, voir
   `src/scenario/schema.ts`) ;
2. le `BrandTheme` résolu pour `scenario.themeId`.

Aucune scène n'importe une couleur, une police ou une durée d'animation en
dur — tout passe par `theme` (voir `DESIGN_SYSTEM.md`) ou par
`src/engine/motion.ts` (`useEntrance`, `oscillate`), qui traduit
`theme.motion` en opacité/transform de façon déterministe (fonction pure de
la frame courante).

## Catalogue

| `scene.type` | Composant | Champs | Notes |
|---|---|---|---|
| `intro` | `Intro` | `title`, `subtitle?` | Titre + sous-titre, entrée décalée |
| `text-reveal` | `TextReveal` | `lines[]`, `align?` | Chaque ligne apparaît en cascade |
| `dashboard-showcase` | `DashboardShowcase` | `variant`, `title?`, `metrics?` | Enveloppe plein écran de `DashboardUI` |
| `phone-showcase` | `PhonePlaceholder` (temporaire) | `phoneModel`, `dashboardVariant`, `render` | Vraie scène 2.5D/3D au Checkpoint C |
| `feature-cards` | `FeatureCards` | `items[]` (1 à 4) | Cartes avec icône/titre/description, entrée en cascade |
| `statistic` | `Statistic` | `value`, `label`, `trend?` | Compteur animé si `value` est numérique (`+42%`, `128`, ...) |
| `call-to-action` | `CallToAction` | `title`, `subtitle?`, `buttonLabel` | Bouton avec halo pulsé (`oscillate`) |
| `outro` | `Outro` | `title?`, `logoText?` | Écran de clôture sobre |

## Le fond premium (`PremiumBackground`)

`src/engine/background/PremiumBackground.tsx` est utilisé par **toutes**
les scènes plein écran. Il compose, dans l'ordre :

1. un dégradé de base (`solid` / `gradient` / `radial` / `studio` /
   `custom`, `theme.background.type`) — le type `radial`/`studio` utilise
   `radial-gradient(circle farthest-corner ...)` pour ne jamais couper le
   dégradé avant les coins de l'écran (pas de "seam" visible) ;
2. un halo (`theme.background.glow`) : dégradé radial centré, pulsé
   lentement via `oscillate(frame, ...)` (déterministe) ;
3. des particules discrètes (`theme.background.particles`) : positions
   tirées d'une séquence pseudo-aléatoire **seedée par `theme.id`**
   (`src/engine/deterministic-random.ts`), donc identiques à chaque rendu ;
4. un grain optionnel (`theme.background.grain`) via un filtre SVG
   `feTurbulence` à seed fixe ;
5. une vignette (`theme.background.vignette`) via `box-shadow: inset`.

## Le dashboard réutilisable (`DashboardUI`)

`src/engine/dashboard/DashboardUI.tsx` est dimensionné entièrement en `em`
(le composant appelant fixe `fontSize` sur un conteneur) pour pouvoir être
utilisé plein écran (`DashboardShowcase`) **ou** projeté sur l'écran d'un
téléphone (`PhoneShowcase`, Checkpoint C) sans dupliquer le code. Les
données par variante (`analytics`/`sales`/`social`/`finance`) sont dans
`src/engine/dashboard/dashboard-data.ts`, testées dans
`dashboard-data.test.ts`.

## Vérification réelle (pas seulement `tsc`)

Un rendu `tsc --noEmit` vert ne prouve pas qu'une scène s'affiche
correctement. Chaque scène de ce catalogue a été vérifiée par un vrai
rendu Remotion (`remotion still`, PNG inspecté visuellement) pendant le
Checkpoint B — pas seulement compilée. Un contrôle de reproductibilité a
aussi été fait : rendre deux fois la même frame produit un fichier
strictement identique en octets (déterminisme confirmé, pas supposé).

## Ajouter une nouvelle scène

1. Ajouter son schéma Zod dans `src/scenario/schema.ts`
   (`sceneSchema` = `z.discriminatedUnion("type", [...])`).
2. Créer le composant dans `src/engine/scenes/MaScene.tsx`, ne lisant que
   ses props + `theme`.
3. L'enregistrer dans `src/engine/registry.ts` (`renderScene`) — TypeScript
   signale toute scène non gérée grâce au `never` exhaustif en fin de
   switch.
4. Vérifier avec `pnpm typecheck`, `pnpm test`, puis un rendu réel
   (`pnpm exec remotion still src/remotion/index.ts VideoVertical out/x.png --frame=N --props=scenario.json`).
