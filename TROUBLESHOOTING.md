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

`@remotion/renderer` embarque son propre compositeur et ne nécessite pas
de `ffmpeg` système pour le rendu MP4/GIF standard. Un `ffmpeg` système
n'est utile que pour des conversions hors pipeline Remotion (voir
`RENDERING.md`, à compléter à l'étape Finalisation).

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

> D'autres entrées seront ajoutées au fil des checkpoints (rendu 3D, GLB,
> pipeline MP4/GIF).
