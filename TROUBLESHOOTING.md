# Dépannage

## `pnpm install` échoue sur une version de package introuvable

Les versions sont pin-ées en dur dans `package.json` pour garantir des
builds reproductibles. Si npm publie une dépréciation, vérifier la
version disponible avec `npm view <package> versions` et ajuster.

## `esbuild` : "Ignored build scripts"

`pnpm.onlyBuiltDependencies` dans `package.json` autorise déjà le script
d'installation d'`esbuild` (nécessaire à Vitest). Si l'avertissement
persiste après un `pnpm install`, relancer `pnpm approve-builds`.

## ffmpeg absent du système

Vérifié à l'étape Finalisation : un rendu MP4 complet fonctionne dans cet
environnement sans `ffmpeg` système installé. `@remotion/renderer` encode
et mux directement via `@remotion/compositor-linux-x64-gnu` — un binaire
natif Rust installé comme dépendance npm normale (pas téléchargé depuis
`remotion.media`), donc pas concerné par la restriction réseau qui bloque
le Chrome Headless Shell. Un `ffmpeg` système reste utile uniquement pour
des conversions hors pipeline Remotion (voir `RENDERING.md`).

## `remotion render` plante avec `RangeError: Invalid array length` (`Concurrency NaNx`)

Trouvé au premier vrai rendu MP4 de l'étape Finalisation.
`remotion.config.ts` appelait `Config.setConcurrency(undefined)` (intention
: "laisser la valeur par défaut"). En réalité, passer explicitement
`undefined` court-circuite la résolution interne de la concurrence par
défaut de Remotion et produit `NaN`, qui casse `new Array(NaN)` dans le
pool de rendu. La ligne a été supprimée entièrement — ne pas appeler
`Config.setConcurrency()` du tout est la bonne façon de laisser Remotion
choisir sa valeur par défaut.

## `KIMI_API_KEY manquant`

`KimiBriefToScenarioClient.convert()` refuse d'appeler l'API sans clé
configurée (voir `README.md#conversion-langage-naturel--scénario-kimi-k2`).
C'est volontaire : pas d'appel réseau silencieux ni de scénario par défaut
qui masquerait l'absence de configuration.

## Appel Kimi K2 bloqué dans une session Claude Code on the web

Cette session tourne dans un environnement distant dont le trafic sortant
passe par un proxy avec une liste d'hôtes autorisés. Un fournisseur tiers
comme `api.tokenrouter.com` (routeur OpenAI-compatible vers Kimi K2) n'y
figure pas par défaut, ce qui se traduit par un `403` au niveau du tunnel
CONNECT — pas une clé invalide. C'est pourquoi la conversion Kimi K2 n'a
pu être testée qu'unitairement (fetch simulé) et non en conditions réelles
depuis cette session.

Pour tester réellement :

1. Cloner le repo sur une machine (ou un environnement Claude Code)
   sans cette restriction réseau, `pnpm install`, définir `KIMI_API_KEY` /
   `KIMI_API_BASE_URL`, puis exécuter un script qui appelle
   `KimiBriefToScenarioClient.convert(...)`.
2. Ou élargir la politique réseau de cet environnement pour autoriser
   `api.tokenrouter.com` (Environnements → paramètres réseau, voir la
   documentation Claude Code on the web).
3. Pour trouver l'identifiant exact du modèle Kimi K2 exposé par
   `tokenrouter.com` (le nom peut différer de `kimi-k2-0711-preview`,
   la valeur par défaut de ce projet), lister les modèles disponibles :
   `curl -H "Authorization: Bearer $KIMI_API_KEY" $KIMI_API_BASE_URL/models`
   puis passer l'identifiant trouvé via `KIMI_MODEL`.

## `remotion compositions` / `remotion studio` : "Version mismatch ... zod"

Remotion 4.0.518 embarque `@remotion/zod-types`, qui exige une version
**exacte** de zod (`4.4.3` pour cette version de Remotion — pas 3.x, pas
4.5.x). Si `package.json` pointe une autre version, `remotion` l'affiche
au démarrage (`Version mismatch: zod: installed X, required Y`). Fixer la
version exacte annoncée par le message et relancer `pnpm install`. Ne pas
se fier au "latest" npm : `npm view zod version` peut être plus récent que
ce que Remotion attend.

## Rendu bloqué sur "Downloading Chrome Headless Shell" (403 `remotion.media`)

Par défaut, `@remotion/renderer` télécharge son propre "Chrome Headless
Shell" au premier rendu. Dans un environnement dont le réseau sortant est
filtré (comme cette session), ce téléchargement échoue avec un `403 Host
not in allowlist: remotion.media`. `remotion.config.ts` de ce projet
contourne ça avec `Config.setBrowserExecutable(...)`, pointé par défaut
vers le Chrome Headless Shell déjà préinstallé pour Playwright
(`/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell`).
Sur une machine sans ce chemin, soit laisser Remotion télécharger son
propre navigateur (réseau ouvert), soit définir
`REMOTION_BROWSER_EXECUTABLE=/chemin/vers/un/chromium` avant de lancer
`pnpm studio` / `pnpm render:*`.

## Vérifier qu'un rendu est vraiment correct (pas seulement qu'il compile)

`pnpm typecheck` ne prouve rien sur le rendu visuel. Pour vérifier une
scène réellement :

```bash
mkdir -p out
pnpm exec remotion still src/remotion/index.ts VideoVertical out/check.png --frame=30
```

Pour tester un scénario différent de celui par défaut (`phone-app-ad`),
passer `--props=chemin/vers/scenario.json` avec `{"scenario": {...}}`
conforme à `scenarioSchema`. Pour vérifier le déterminisme, rendre deux
fois la même frame et comparer les octets (`cmp fichier1.png fichier2.png`)
— un rendu déterministe produit un fichier strictement identique.

## `<Html>` (drei) ne rend rien du tout dans `<ThreeCanvas>` (`@remotion/three`)

Tenté pour projeter `DashboardUI` (le composant DOM déjà utilisé par les
scènes 2D/2.5D) directement sur l'écran du téléphone 3D. Résultat réel :
**rien ne s'affiche**, pas même un `<div>` de debug avec un fond `lime` uni
sans aucun style complexe — ce n'est donc pas un problème de style, de
z-index ou de scale mal calculé.

Cause probable : `<Html>` sort ses enfants de l'arbre de réconciliation R3F
via `ReactDOM.createPortal`, et positionne ce DOM à chaque tick
`useFrame()`. `@remotion/three` fait tourner Canvas avec
`frameloop="never"` et déclenche un seul rendu manuel par frame Remotion
(`advance()`, voir le code source de `ThreeCanvasInternals` dans
`node_modules/@remotion/three`). Le tick de positionnement de `<Html>` ne
semble jamais s'exécuter dans ce mode "un seul rendu forcé" — le nœud DOM
portalé reste non positionné/invisible.

**Solution retenue** : ne pas utiliser `<Html>` à l'intérieur d'un
`<ThreeCanvas>`. `src/engine/phone/Phone3D.tsx` réimplémente le contenu de
l'écran (`ScreenContent`) en géométrie Three.js native (`planeGeometry` /
`boxGeometry` + `meshStandardMaterial`) plutôt qu'en DOM projeté. C'est
aussi pourquoi ce même composant n'affiche pas de texte lisible sur
l'écran 3D (voir l'entrée suivante).

## Pas de texte lisible sur l'écran du téléphone 3D (volontaire)

`@react-three/drei`'s `<Text>` (basé sur troika-three-text) télécharge par
défaut son fichier de police depuis un CDN externe — un appel réseau que
ce projet évite délibérément partout ailleurs (voir `ARCHITECTURE.md`,
section éclairage : pas de `<Environment>` HDRI pour la même raison). Le
tableau de bord entièrement lisible existe déjà dans les scènes 2D
(`DashboardShowcase`) et 2.5D (`PhoneShowcase`) ; l'écran 3D affiche la
même forme (en-tête, tuiles, graphique à barres) en géométrie pure, sans
texte. Pour ajouter du texte 3D malgré tout : fournir un fichier de police
local à `<Text font="/chemin/local.woff">` (voir la doc drei) plutôt que
laisser le comportement par défaut.

## Un `meshStandardMaterial` avec `transparent + opacity` ne s'affiche pas dans `<ThreeCanvas>`

Trouvé en construisant `ScreenContent` (`src/engine/phone/Phone3D.tsx`) :
un plan avec `transparent opacity={1}` était invisible, alors que le
**même plan**, à la même position, avec un matériau opaque classique
(sans `transparent`), s'affichait normalement. Reproduit sur plusieurs
éléments (en-tête, tuiles).

- Piste testée et **écartée** : `gl={{ premultipliedAlpha: false }}` sur
  `<ThreeCanvas>` — n'a rien changé.
- Cause racine non identifiée avec certitude (pas creusée plus loin, le
  contournement suffisait).
- **Contournement retenu** : ne pas animer l'entrée de ces éléments avec
  `opacity`, utiliser une animation d'échelle (`scale`, 0.6 → 1) à la
  place — fonctionne de façon fiable et reste déterministe. Le matériau
  `transmission` semi-transparent du verre du téléphone (`meshPhysicalMaterial`),
  lui, fonctionne correctement (chemin de rendu différent de l'alpha-blend
  classique) et n'a pas eu besoin de contournement.

## `RoundedBox` (drei) donne une géométrie énorme/dégénérée

Le radius (bevel) d'un `RoundedBox` doit rester nettement inférieur à la
moitié de la plus petite dimension de la boîte. Exemple rencontré ici : le
verre de l'écran avait `thickness = 0.02` (donc une moitié de 0.01) avec
un `radius = 0.1` — 10× trop grand. Toujours vérifier
`radius < Math.min(...dimensions) / 2` (voir les constantes `BODY_RADIUS`
/ `GLASS_RADIUS` calculées dans `Phone3D.tsx`).

## Cadrage caméra d'une scène 3D : ne pas se fier uniquement au calcul trigonométrique

Pour cadrer un objet de demi-hauteur `h` avec une caméra `PerspectiveCamera`
de champ de vision vertical `fov` à une distance `d`, la formule standard
est `d = h / tan(fov/2)`. Dans `Phone3DScene`, cette formule prédisait un
cadrage quasi parfait à `d = 6.4`, mais le rendu réel à cette distance
était très largement surcadré (téléphone débordant du cadre sur les
quatre côtés) ; à `d = 20`, en revanche, le résultat mesuré correspondait
précisément à la prédiction (≈ 30 % de la hauteur de l'image, calculé et
observé). La cause exacte de l'écart à courte distance n'a pas été
identifiée avec certitude. **La distance retenue (`d = 9.5`) a été
validée par un rendu réel inspecté visuellement**, pas seulement calculée
— c'est la méthode à reproduire pour tout nouveau réglage de caméra 3D
dans ce projet : ne jamais faire confiance à un calcul de cadrage sans un
rendu `remotion still` pour le confirmer.

> D'autres entrées seront ajoutées à l'étape Finalisation (pipeline
> MP4/GIF).
