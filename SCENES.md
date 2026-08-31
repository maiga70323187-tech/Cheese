# Scènes

> Statut : les 7 scènes 2D (Checkpoint B), `phone-showcase` (2.5D + 3D),
> `icon-showcase` (3D), `asset-showcase` (2.5D, logos/visages/illustrations
> — voir `ASSETS.md`) et les 3 scènes graphiques (`bar-chart`,
> `line-chart`, `comparison`) et les 4 scènes overlay transparentes
> (`lower-third`, `quote-card`, `callout`, `stat-overlay`) sont livrées et
> vérifiées par un rendu réel (voir `ARCHITECTURE.md`). Quatre formats
> (9:16, 16:9, 1:1, 4:5). Les scènes s'assemblent en vidéos complètes via
> la bibliothèque de templates (voir `TEMPLATES.md`).

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
| `phone-showcase` | `PhoneShowcase` (2.5D) / `PhoneShowcase3D` (3D) | `phoneModel`, `dashboardVariant`, `render` | `render: "2.5d"` (défaut) ou `"3d"`, voir plus bas |
| `feature-cards` | `FeatureCards` | `items[]` (1 à 4) | Cartes avec icône/titre/description, entrée en cascade |
| `statistic` | `Statistic` | `value`, `label`, `trend?` | Compteur animé si `value` est numérique (`+42%`, `128`, ...) |
| `call-to-action` | `CallToAction` | `title`, `subtitle?`, `buttonLabel` | Bouton avec halo pulsé (`oscillate`) |
| `icon-showcase` | `IconShowcase3D` | `shape` (`ring`/`diamond`/`facet`) | 3D, un seul mark abstrait en plateau tournant, voir plus bas |
| `asset-showcase` | `AssetShowcase` | `src`, `entityKind`, `label?`, `caption?` | 2.5D, anime un logo/visage/illustration résolu, voir plus bas |
| `bar-chart` | `BarChart` | `data[]`, `title?`, `unit?`, `source?` | Barres verticales animées (SVG), voir "Graphiques" |
| `line-chart` | `LineChart` | `data[]`, `title?`, `unit?`, `source?` | Courbe tracée progressivement (SVG), voir "Graphiques" |
| `comparison` | `Comparison` | `before`, `after`, `betterWhen?`, `unit?`, `source?` | Avant/après avec badge de variation, voir "Graphiques" |
| `lower-third` | `LowerThird` | `title`, `subtitle?`, `position?` | **Overlay** transparent, voir "Overlays" |
| `quote-card` | `QuoteCard` | `quote`, `author?`, `position?` | **Overlay** transparent |
| `callout` | `Callout` | `text`, `position?` | **Overlay** transparent (pastille d'accent) |
| `stat-overlay` | `StatOverlay` | `value`, `label`, `position?` | **Overlay** transparent (stat en médaillon) |
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
utilisé plein écran (`DashboardShowcase`) **ou** projeté sur l'écran du
téléphone 2.5D (`PhoneShowcase`) sans dupliquer le code. Les données par
variante (`analytics`/`sales`/`social`/`finance`) sont dans
`src/engine/dashboard/dashboard-data.ts`, testées dans
`dashboard-data.test.ts`.

Le composant est scindé en deux : `DashboardUIPresentation` (pur — prend
`frame` en prop) et `DashboardUI` (appelle `useCurrentFrame()` puis
délègue). La scène 3D ne peut PAS utiliser `useCurrentFrame()` à
l'intérieur d'un contenu porté par `<Html>` de drei (voir
`TROUBLESHOOTING.md`) — c'est d'ailleurs pour cette raison précise que
l'écran 3D n'utilise pas `DashboardUI` du tout (voir plus bas).

Sur un écran de téléphone (2.5D et 3D), `maxMetrics={2}` (au lieu de 3 en
plein écran) : 3 tuiles de métriques ne tiennent pas sur une largeur de
téléphone sans troncature illisible — vérifié par un rendu réel, corrigé
après coup (voir `TROUBLESHOOTING.md`).

## Scène téléphone (`phone-showcase`)

### 2.5D — `PhoneShowcase` (`src/engine/scenes/PhoneShowcase.tsx`)

Un châssis de téléphone procédural en CSS pur (`src/engine/phone/Phone2_5D.tsx`),
avec plusieurs plans de profondeur animés indépendamment (tous fonctions
pures de la frame, via `oscillate`/`useEntrance`) :

- décor : deux halos flous en arrière-plan (`filter: blur`), dérive lente
  et parallaxe (le plan le plus éloigné bouge le moins) ;
- caméra virtuelle : `perspective` CSS + `rotateX`/`rotateY` du conteneur,
  qui simule un léger mouvement de caméra indépendant de la rotation du
  téléphone lui-même ;
- téléphone : rotation "plateau tournant" + respiration d'échelle,
  ombre de contact au sol qui s'aplatit avec la rotation ;
  châssis : dégradé + liseré lumineux qui se déplace le long du bord
  (`chassisLightPos`, un `linear-gradient` masqué en anneau) ;
- écran : `DashboardUI` (même composant que la scène plein écran) +
  reflet de verre animé (bande diagonale semi-transparente qui balaie
  l'écran) — le reflet et le contenu de l'écran s'animent chacun sur leur
  propre cycle, indépendamment de la rotation du téléphone.

### 3D — `PhoneShowcase3D` (`src/engine/scenes/PhoneShowcase3D.tsx`)

React Three Fiber via `@remotion/three`'s `<ThreeCanvas>` (pas le `<Canvas>`
brut de R3F — `ThreeCanvas` synchronise le rendu WebGL sur `useCurrentFrame()`
au lieu de `requestAnimationFrame`, condition nécessaire au déterminisme).
`src/engine/phone/Phone3D.tsx` :

- **téléphone procédural** : `RoundedBox` (drei) pour le châssis et le
  verre, matériaux `meshStandardMaterial` (métal, `metalness`/`roughness`)
  et `meshPhysicalMaterial` (verre, `transmission`/`ior`/`roughness`) ;
- **éclairage studio déterministe** : `ambientLight` + `hemisphereLight` +
  2 `directionalLight` + 1 `pointLight` colorée par `theme.colors.primary`
  (liseré lumineux animé) — **aucun** `<Environment>`/HDRI : ça
  téléchargerait un asset externe, voir `ARCHITECTURE.md` ;
- **ombres** : `shadows` sur `<ThreeCanvas>`, `castShadow`/`receiveShadow`
  sur le châssis, les barres du graphique et le sol ;
- **rotation lente + mouvement de caméra léger** : `group.rotation.y`
  fonction de `frame`, `PerspectiveCamera.position` qui dérive doucement ;
- **écran** : `ScreenContent`, réimplémentation du dashboard en géométrie
  Three.js native (`planeGeometry`/`boxGeometry`, pas de texte) — voir
  `TROUBLESHOOTING.md` pour pourquoi `<Html>` et `<Text>` ont été écartés.

### Remplacer le téléphone procédural par un vrai modèle GLB

1. Charger le modèle avec `useGLTF("/mon-telephone.glb")` (drei) dans
   `Phone3D.tsx`, et remplacer le `<RoundedBox>` du châssis par
   `<primitive object={gltf.scene} />`.
2. Repérer, dans le modèle, les coordonnées locales du plan d'écran (dans
   Blender ou un visualiseur glTF) et positionner `<ScreenContent>` à ces
   coordonnées au lieu de `[0, 0, PHONE_DEPTH/2 + 0.008]`.
3. Garder la caméra, les lumières et les animations de `frame` telles
   quelles — elles ne dépendent pas de la géométrie du châssis.
4. Placer le fichier `.glb` dans `public/` et vérifier avec un rendu réel
   (`remotion still`) que l'échelle et le cadrage restent corrects — un
   modèle importé a rarement les mêmes proportions que le placeholder
   procédural (voir l'entrée "cadrage caméra" de `TROUBLESHOOTING.md`).

## Scène icône (`icon-showcase`)

`src/engine/scenes/IconShowcase3D.tsx` (enveloppe `PremiumBackground` +
`<ThreeCanvas>`, même structure que `PhoneShowcase3D.tsx`) monte
`src/engine/icon/Icon3D.tsx` (`Icon3DScene`), inspirée des rendus d'icônes
d'app glossy du corpus de références analysé (un seul objet, centré, sur un
socle arrondi, reflets studio doux) :

- **caméra/éclairage/matériaux** : recette identique à `Phone3DScene` —
  `PerspectiveCamera` en `manual` avec `aspect` explicite (calculé depuis
  `useVideoConfig()` et passé en prop, l'écran d'icône n'a pas d'écran de
  téléphone à gérer donc pas besoin de `useVideoConfig()` en interne), même
  rig 5 lumières déterministe, `meshPhysicalMaterial` avec `clearcoat`
  (même look "plastique brillant" que le châssis du téléphone après la
  mise à niveau des matériaux, voir `TROUBLESHOOTING.md`) ;
- **le mark** : `torusGeometry` (`ring`), `octahedronGeometry` (`diamond`)
  ou `icosahedronGeometry` (`facet`) — primitives Three.js standard, donc
  aucun risque de géométrie dégénérée (contrairement au `RoundedBox` du
  téléphone) ; plateau tournant (`rotation.y` fonction de `frame`) +
  respiration verticale (`oscillate`), coloré par `theme.colors.primary` ;
- **socle** : `RoundedBox` en retrait (`position.z = -0.55`), même
  matériau clearcoat que le corps du téléphone, coloré par
  `theme.colors.surface` ;
- **entrée** : `scale` uniquement (0 → 1 sur 18 frames), jamais `opacity` —
  même raison que `ScreenContent` du téléphone 3D (matériaux `transparent`
  invisibles sous ce pipeline, voir `TROUBLESHOOTING.md`).

C'est la scène 3D la plus simple du projet (pas d'écran à gérer) — donc la
plus simple à faire pointer vers un vrai logo de marque : remplacer
`<Mark shape={shape} />` par `<primitive object={gltf.scene} />` (via
`useGLTF`) dans `Icon3D.tsx`, en gardant caméra/lumières/socle identiques
(mêmes étapes que "Remplacer le téléphone procédural par un vrai modèle
GLB" ci-dessus).

Contrairement au cadrage caméra du téléphone (qui avait nécessité un
réglage empirique de la distance, voir `TROUBLESHOOTING.md`), la distance
théorique (`fov: 30`, `position.z: 6.2`) a fonctionné dès le premier rendu
réel pour les trois formes — vérifié visuellement, pas seulement supposé.

## Scène asset (`asset-showcase`)

`src/engine/scenes/AssetShowcase.tsx` anime en 2.5D un **asset visuel déjà
résolu** — logo de marque, photo de personne détourée, ou illustration
sous licence — sur le fond premium :

- **entrée** `useEntrance` (pilotée par `theme.motion`), plus un léger
  flottement + parallaxe déterministes (`oscillate`, fonction pure de la
  frame) et un halo `theme.colors.primary` qui se détache toujours du fond ;
- **source** (`src`) : soit un chemin `public/` (servi par `staticFile`),
  soit une URL absolue — les deux gérés via `<Img>` de Remotion ; un vrai
  logo **SVG** s'anime parfaitement par cette voie ;
- **cadrage selon `entityKind`** :
  - `brand` → logo contenu (jamais rogné), fond transparent, halo doux ;
  - `person` → portrait en médaillon **circulaire** rogné + anneau lumineux ;
  - `illustration` → image en carte arrondie, légèrement plus grande ;
- **`label` / `caption`** en typographie du thème — la légende porte
  l'attribution (auteur + licence CC) que la résolution propage.

La résolution en ligne (Brandfetch / Wikimedia / Openverse) se fait **en
amont** du rendu et écrit `src` dans le scénario — voir `ASSETS.md`. La
scène, elle, est vérifiée par de vrais rendus avec assets locaux
(`public/assets/sample-logo.svg` pour un logo SVG, `sample-portrait.png`
pour un PNG transparent), pour les trois cadrages — SVG et PNG, chemin
local et URL, tous exercés.

Pour brancher un vrai logo/visage sans passer par la résolution en ligne :
déposer le fichier dans `public/` et référencer son chemin dans `src`.

## Graphiques animés (`bar-chart`, `line-chart`, `comparison`)

`src/engine/charts/` — trois scènes pilotées par **données** (valeurs
numériques brutes, jamais pré-formatées), pour le pilier « infographies »
(voir la feuille de route Hera). Habillage commun via
`chart-common.tsx` (`ChartFrame` : fond premium + titre + **note de source**
— Hera insiste sur le crédit systématique de la donnée). Toutes les
animations sont des fonctions pures de `useCurrentFrame()`, donc
déterministes.

- **`bar-chart`** (`BarChart.tsx`) — barres verticales en **SVG**
  (géométrie et libellés alignés au pixel) ; chaque barre pousse en décalé
  depuis la ligne de base, sa valeur compte jusqu'au chiffre final, la
  dernière barre est mise en avant. `data: {label, value}[]` (2 à 8),
  `unit?`, `source?`.
- **`line-chart`** (`LineChart.tsx`) — courbe **tracée progressivement** de
  gauche à droite (chemin partiel recalculé à chaque frame), aire
  semi-transparente, point mobile en tête affichant la valeur courante,
  grille discrète. `data` (2 à 24 points), `unit?`, `source?`.
- **`comparison`** (`Comparison.tsx`) — deux colonnes avant/après dont les
  barres montent et les valeurs comptent, plus un **badge de variation**
  en %. `betterWhen: "higher" | "lower"` (défaut `higher`) pilote la
  couleur du badge : une baisse peut être positive (ex. un temps de
  production), donc la sémantique n'est jamais devinée — elle est déclarée.

Les valeurs sont des `number` (pas des chaînes) ; le formatage (unité,
décimales) est géré par `formatValue`/`decimalsFor`. **Vérifier
humainement** les données avant publication (recommandation Hera reprise
telle quelle).

## Overlays (`lower-third`, `quote-card`, `callout`, `stat-overlay`)

`src/engine/overlays/` — scènes pensées pour être **superposées à une vidéo
existante** (pilier §9 de Hera). Contrairement à toutes les autres scènes,
elles ne peignent **aucun fond premium** : la frame est transparente, ce qui
permet de les exporter en **MOV ProRes 4444 avec canal alpha**
(`--transparent`, voir RENDERING.md) et de les compositer dans un autre
outil de montage.

Habillage commun via `overlay-common.tsx` :

- `OverlayFrame` — `AbsoluteFill` transparent, élément ancré à un coin ou au
  centre (`position`) avec des **marges de sécurité** (≈7% du plus petit
  côté, comme le recommande Hera pour ne pas coller aux bords) ;
- `useOverlayAnim` — **entrée puis sortie** temporisées (fondu + glissement)
  calées sur la durée réelle de la `<Sequence>` de la scène, donc l'overlay
  apparaît et disparaît proprement ;
- `cardStyle` — fond de carte opaque (surface + ombre) pour rester lisible
  sur n'importe quelle vidéo sous-jacente.

Les quatre : `lower-third` (nom + rôle, liseré d'accent), `quote-card`
(citation + auteur), `callout` (pastille d'accent compacte), `stat-overlay`
(grande valeur + libellé en médaillon). `position` ∈ `bottom-left`,
`bottom-right`, `top-left`, `top-right`, `bottom-center`.

## Formats

Quatre formats (`FORMAT_DIMENSIONS`, `src/scenario/schema.ts`) :

| Format | Dimensions | Ratio | Usage |
|---|---|---|---|
| `vertical` | 1080×1920 | 9:16 | Reels, Shorts, TikTok |
| `landscape` | 1920×1080 | 16:9 | Homepage, YouTube |
| `square` | 1080×1080 | 1:1 | Post social |
| `portrait` | 1080×1350 | 4:5 | Flux LinkedIn |

Chaque format a sa composition Remotion (`VideoVertical`/`Landscape`/
`Square`/`Portrait`) ; les dimensions dérivent du format, jamais codées en
dur par composition.

## Vérification réelle (pas seulement `tsc`)

Un rendu `tsc --noEmit` vert ne prouve pas qu'une scène s'affiche
correctement. Chaque scène de ce catalogue — y compris `PhoneShowcase` et
`PhoneShowcase3D`, en `vertical` et `landscape` — a été vérifiée par un
vrai rendu Remotion (`remotion still`, PNG inspecté visuellement), pas
seulement compilée. `src/remotion/mount.test.ts` automatise une version
de ce contrôle (rendu réel de chaque composition + dimensions/fps
vérifiés) dans `pnpm test`, pour que ça reste vérifié en continu plutôt
que seulement pendant le développement initial. Un contrôle de
reproductibilité a aussi été fait, à la fois manuellement et de façon
automatisée dans ce même fichier de test : rendre deux fois la même frame
produit un fichier strictement identique en octets (déterminisme
confirmé, pas supposé). La scène 3D a
d'ailleurs révélé plusieurs bugs réels (radius de `RoundedBox` dégénéré,
cadrage caméra très éloigné de la prédiction théorique, `<Html>` de drei
invisible sous `<ThreeCanvas>`, matériaux `transparent` invisibles) qu'un
`tsc --noEmit` vert n'aurait jamais révélés — voir `TROUBLESHOOTING.md`.

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
