# Scènes

> Statut : les 7 scènes 2D (Checkpoint B) et la scène `phone-showcase`
> (2.5D + 3D, Checkpoint C) sont livrées et vérifiées par un rendu réel
> (voir `ARCHITECTURE.md` pour la méthode de vérification).

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
