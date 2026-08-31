# Design System — Charte graphique

> Statut : schéma et presets initiaux figés (Checkpoint A), complétés
> après analyse du corpus de références par 2 nouveaux presets
> (`crimson-glow`, `emerald-glow`) et une nouvelle option de mouvement
> (`kinetic`). L'usage dans les compositions (background premium, ombres,
> glow) est documenté au fur et à mesure des checkpoints suivants.

## Principe

**Aucune couleur, police, ombre ou courbe d'animation n'est codée en dur
dans une composition.** Tout provient d'un objet `BrandTheme` validé par
Zod (`src/brand/schema.ts`) et transmis en props. Une composition qui a
besoin d'une couleur "primaire" lit `theme.colors.primary` — jamais une
valeur hex écrite dans le composant.

## Schéma `BrandTheme`

Défini dans `src/brand/schema.ts`, validé avec Zod. Champs :

- `colors` — chaque couleur est stockée sous une **clé qui est son rôle
  explicite** (`background`, `surface`, `text`, `primary`, `success`,
  `danger`, ...), jamais sous un nom générique (`color1`, `blue`). Toutes
  les valeurs sont des hex `#RRGGBB` validés par regex.
- `typography` — `heading` / `body` / `label` (familles de police) +
  `titleScale` (échelle de tailles, du plus grand titre au plus petit
  label).
- `spacing` — échelle d'espacement en pixels.
- `radius` — `small` / `medium` / `large`.
- `shadows` — `soft` / `elevated` / `glow` (chaînes CSS `box-shadow`).
- `motion` — type d'entrée (`fade|slide|scale|spring|reveal|kinetic`),
  durée en frames, easing, et paramètres de spring optionnels. `kinetic`
  (ajouté après analyse du corpus de références) combine translation +
  légère rotation + échelle sur un seul `spring()`, pour un effet plus
  "punchy"/avec dépassement que `spring` seul (voir
  `src/engine/motion.ts`, branche `useEntrance`) — disponible pour
  n'importe quelle charte, pas seulement `crimson-glow` qui l'utilise par
  défaut.
- `background` — configuration du fond premium : type, dégradé de
  couleurs, `separationFromBlack` (0-1, distance mesurable par rapport au
  noir pur — voir `src/brand/schema.test.ts`), `vignette`, `grain`
  optionnel, `glow`/`particles` optionnels.

## Presets livrés

| id | Identité | Fond | Mouvement |
|---|---|---|---|
| `luxury-dark` | Luxe / haut de gamme | Anthracite bleuté, halo or | `reveal`, lent et posé |
| `premium-tech` | Technologie | Bleu nuit, cyan électrique | `spring`, rapide et précis |
| `minimal-light` | Minimaliste | Blanc cassé, quasi plat | `fade`, sobre |
| `editorial` | Éditorial | Papier crème, encre, bordeaux | `slide`, lent |
| `vibrant-startup` | Énergique / coloré | Violet profond, dégradé magenta/orange | `scale` rebondissant |
| `crimson-glow` | Cinématique / intense | Noir profond, halo rouge, radial | `kinetic`, punchy |
| `emerald-glow` | Néon / tech | Fond sombre, vert néon | `spring`, précis |

`crimson-glow` et `emerald-glow` ont été ajoutés après analyse du corpus
de références (images/vidéos fournies par l'utilisateur) pour couvrir des
identités rouge et verte absentes des 5 presets initiaux.

Chaque preset est un objet TypeScript typé `BrandTheme` dans
`src/brand/presets/*.ts`, réexporté via `getBrandTheme(themeId)` /
`listBrandThemes()` (`src/brand/presets/index.ts`).

## Test de lisibilité "jamais dans le noir"

`src/brand/schema.test.ts` calcule la luminance relative WCAG du fond de
chaque preset sombre (`luxury-dark`, `premium-tech`, `vibrant-startup`,
`crimson-glow`, `emerald-glow`) et vérifie :

1. qu'elle reste mesurablement au-dessus du noir pur (luminance > 0.01,
   alors qu'un noir absolu `#000000` vaut 0) ;
2. que la couleur `primary` (utilisée pour le halo/CTA/liseré lumineux du
   sujet) est nettement plus lumineuse que le fond (delta > 0.05), pour
   garantir que le sujet principal (téléphone, texte, CTA) se détache
   toujours visuellement du décor.

## Ajouter une nouvelle charte

1. Créer `src/brand/presets/mon-theme.ts` exportant un objet conforme à
   `BrandTheme` (voir un preset existant comme modèle).
2. L'enregistrer dans `src/brand/presets/index.ts` (`brandThemePresets`).
3. Lancer `pnpm test` — le test `accepts every shipped preset` et, si le
   thème est sombre, le test de séparation du noir valident automatiquement
   le nouveau preset.
4. Aucune modification de `src/engine` n'est nécessaire : les compositions
   consomment déjà `BrandTheme` de façon générique.
