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

> D'autres entrées seront ajoutées au fil des checkpoints (Remotion Studio,
> rendu 3D, GLB, GIF).
