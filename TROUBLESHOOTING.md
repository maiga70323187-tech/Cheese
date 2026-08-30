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

> D'autres entrées seront ajoutées au fil des checkpoints (Remotion Studio,
> rendu 3D, GLB, GIF).
