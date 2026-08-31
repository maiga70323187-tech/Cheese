# Rendu

## Encodage : pas de ffmpeg système requis

`@remotion/renderer` encode et mux les MP4/GIF via son propre compositeur
natif (`@remotion/compositor-linux-x64-gnu`, installé comme dépendance npm
normale — pas téléchargé au moment du rendu). Aucun `ffmpeg` système n'est
nécessaire pour les commandes ci-dessous. Voir `TROUBLESHOOTING.md` si un
rendu échoue quand même avec une erreur liée à ffmpeg.

Le seul binaire téléchargé à la demande est le navigateur headless
(Chrome Headless Shell) utilisé pour évaluer React/CSS/WebGL et capturer
chaque frame. Dans un environnement au réseau sortant filtré,
`remotion.config.ts` réutilise le Chromium déjà installé pour Playwright —
voir `TROUBLESHOOTING.md` si ce chemin n'existe pas sur ta machine.

## Commandes

```bash
pnpm render:vertical    # MP4 1080x1920, scénario par défaut (phone-app-ad)
pnpm render:landscape   # MP4 1920x1080
pnpm render:square      # MP4 1080x1080
pnpm render:gif         # GIF (composition VideoVertical par défaut)
```

Ces scripts appellent `src/cli/render.ts` (via `tsx`), qui :

1. valide le scénario avec `scenarioSchema` **avant** de lancer Remotion
   (erreur claire immédiate si le JSON est invalide, plutôt qu'une erreur
   Remotion moins lisible) ;
2. force `scenario.format` pour correspondre à la composition choisie ;
3. écrit un fichier de props temporaire dans `out/` et appelle
   `remotion render` (donc `remotion.config.ts` — navigateur, image
   format, etc. — s'applique normalement).

### Options du CLI

```bash
pnpm exec tsx src/cli/render.ts \
  --composition VideoVertical \        # VideoVertical | VideoLandscape | VideoSquare
  --scenario chemin/vers/scenario.json \  # { "scenario": {...} } conforme à scenarioSchema — défaut: phone-app-ad
  --template animated-infographic \    # part d'un template (exclusif avec --scenario) — voir TEMPLATES.md
  --theme premium-tech \               # force scenario.themeId
  --out out/ma-video.mp4 \             # défaut: out/<composition>.<mp4|gif>
  --gif                                # exporte en GIF (codec gif) au lieu de MP4 (h264)
```

`--help` affiche cette liste depuis le terminal.

## Choisir une charte graphique / un format de sortie

- **Charte graphique** : `--theme <id>` sur le CLI, ou directement dans le
  JSON du scénario (`scenario.themeId`) — un des presets de
  `src/brand/presets` (voir `DESIGN_SYSTEM.md`).
- **Format de sortie** : `--composition VideoVertical|VideoLandscape|VideoSquare|VideoPortrait`
  (9:16, 16:9, 1:1, 4:5). Le même scénario peut être rendu dans les quatre
  formats sans modification — `scenario.format` est écrasé automatiquement
  par le CLI pour correspondre à la composition choisie (voir `Root.tsx`,
  `calculateMetadata`).

## Export transparent (overlays)

Les scènes overlay (`lower-third`, `quote-card`, `callout`, `stat-overlay`)
sont sur fond transparent, à compositer sur une vidéo existante. Pour les
exporter avec canal alpha :

```bash
pnpm exec tsx src/cli/render.ts \
  --composition VideoLandscape \
  --scenario out/mes-overlays.json \
  --transparent \
  --out out/overlays.mov
```

`--transparent` produit un **MOV ProRes 4444** (`pixelFormat: yuva444p…le`,
alpha vérifié). Il force `--image-format=png` en interne : le JPEG par
défaut (`remotion.config.ts`) n'a pas de canal alpha. Incompatible avec
`--gif` (le GIF n'a pas d'alpha ProRes). Le fichier est plus lourd qu'un
MP4 (ProRes est peu compressé) — c'est normal pour un master à compositer.

## Rendre un scénario JSON personnalisé

```bash
cat > out/mon-scenario.json <<'EOF'
{
  "scenario": {
    "format": "vertical",
    "fps": 30,
    "durationInSeconds": 8,
    "themeId": "editorial",
    "scenes": [
      { "type": "intro", "durationInSeconds": 2, "title": "Mon produit" },
      { "type": "statistic", "durationInSeconds": 2, "value": "+58%", "label": "de satisfaction", "trend": "up" },
      { "type": "call-to-action", "durationInSeconds": 4, "title": "Essayez-le", "buttonLabel": "Découvrir" }
    ]
  }
}
EOF

pnpm exec tsx src/cli/render.ts --composition VideoSquare --scenario out/mon-scenario.json --out out/demo.mp4
```

La somme des `durationInSeconds` de chaque scène doit être égale à
`durationInSeconds` du scénario (tolérance 0.05s) — voir
`src/scenario/schema.ts`.

## GIF : garder une taille raisonnable

Un GIF n'a pas de compression inter-image comme un codec vidéo — un GIF
de 12s à 1080p peut facilement dépasser 40 Mo (constaté en pratique lors
de la Finalisation). Pour un GIF de démonstration, préférer un scénario
court (2-4s), une seule scène, et éventuellement un fps réduit
(`"fps": 24` ou moins dans le JSON du scénario) plutôt que de réutiliser
tel quel un scénario pensé pour du MP4.

## Vérifier un rendu MP4/GIF réellement (pas juste "le fichier existe")

Un fichier de la bonne extension ne prouve pas que le contenu est valide.
Deux méthodes utilisées pendant le développement de ce projet :

```bash
# Métadonnées réelles (durée, codec, dimensions, lisibilité) via le
# parseur média de Remotion lui-même :
node -e "require('@remotion/renderer').getVideoMetadata('out/VideoVertical.mp4').then(m => console.log(m))"

# Compter les frames d'un GIF (une frame vide/statique produirait un
# fichier bien plus petit) :
python3 -c "
data = open('out/demo.gif','rb').read()
print('frames:', data.count(b'\x21\xf9\x04'))
"
```

`src/remotion/mount.test.ts` fait l'équivalent automatiquement pour des
rendus courts (`renderStill`) — voir `SCENES.md` et ce fichier de test
pour le détail de la méthode.

## Connecter ce moteur à une API / interface SaaS plus tard

Le moteur est déjà découpé pour ça :

1. **Brief utilisateur → scénario** : appeler
   `KimiBriefToScenarioClient.convert(brief, options)`
   (`src/scenario/brief-to-scenario.ts`) côté serveur, avec la clé API en
   variable d'environnement (jamais côté client).
2. **Scénario → rendu** : au lieu du CLI, appeler directement
   `@remotion/renderer` (`bundle` + `selectComposition` + `renderMedia`)
   depuis un worker/une file de tâches, avec le `Scenario` validé comme
   `inputProps`. `src/cli/render.ts` et `src/remotion/mount.test.ts`
   montrent déjà comment invoquer ce pipeline programmatiquement.
3. **Fichier obtenu → stockage** : uploader le MP4/GIF produit vers un
   stockage objet (S3, R2, ...) et renvoyer l'URL au client — aucune
   partie du moteur n'a besoin d'être modifiée pour ça, il produit déjà un
   fichier sur disque.
4. **Multi-utilisateur** : `themeId` et `scenario` sont déjà des données
   arbitraires par requête (pas de configuration globale mutable) — le
   moteur est donc déjà "stateless" par rendu, prêt pour du traitement
   concurrent.

## Licences à vérifier avant usage commercial

- **Polices** : les presets (`src/brand/presets`) référencent des noms de
  police (`Playfair Display`, `Space Grotesk`, `Tiempos Headline`, ...)
  sans les fournir. Pour un rendu fidèle en production, ces polices
  doivent être installées/embarquées (ex. `@remotion/google-fonts` pour
  les polices Google Fonts, sous licence Open Font License — vérifier
  individuellement pour toute police non-Google) ; voir
  `TROUBLESHOOTING.md` pour pourquoi le rendu de vérification de ce
  projet est tombé sur des polices de repli faute d'accès réseau.
- **Remotion** : licence vérifiée dans `node_modules/remotion/LICENSE.md`
  (v4.0.518). Gratuite pour un individu, une organisation à but non
  lucratif, ou une entreprise à but lucratif de **3 employés maximum**
  (commercial y compris). Au-delà, une "Company License" payante est
  requise (https://www.remotion.pro/license) — pertinent dès qu'un vrai
  produit SaaS avec équipe grandit au-delà de ce seuil.
- **React Three Fiber / drei / three.js** : MIT, sans restriction
  particulière.
