# Polices embarquées

Tous les fichiers `.woff2` de ce dossier sont sous **SIL Open Font License
1.1** (OFL), qui autorise l'incorporation et la redistribution, y compris
dans un produit commercial. Ils sont chargés localement au rendu (aucun
appel réseau, voir `src/brand/fonts.ts`).

| Fichier | Famille | Graisse | Source | Licence |
|---|---|---|---|---|
| `inter-400.woff2` | Inter | 400 | Google Fonts | OFL 1.1 |
| `inter-600.woff2` | Inter | 600 | Google Fonts | OFL 1.1 |
| `inter-700.woff2` | Inter | 700 | Google Fonts | OFL 1.1 |
| `space-grotesk-500.woff2` | Space Grotesk | 500 | Google Fonts | OFL 1.1 |
| `space-grotesk-700.woff2` | Space Grotesk | 700 | Google Fonts | OFL 1.1 |
| `playfair-display-700.woff2` | Playfair Display | 700 | Google Fonts | OFL 1.1 |
| `source-serif-4-400.woff2` | Source Serif 4 | 400 | Google Fonts | OFL 1.1 |
| `source-serif-4-600.woff2` | Source Serif 4 | 600 | Google Fonts | OFL 1.1 |
| `ibm-plex-mono-500.woff2` | IBM Plex Mono | 500 | Google Fonts | OFL 1.1 |

Seul le sous-ensemble Unicode **latin** de chaque graisse est embarqué
(fichiers volontairement légers, ~15–50 Ko chacun). Pour ajouter d'autres
alphabets, régénérer depuis l'API `fonts.googleapis.com/css2` en gardant
les blocs `/* latin-ext */`, `/* cyrillic */`, etc.

## Polices NON embarquées

Les maquettes d'origine nommaient aussi des polices commerciales ou
distribuées hors Google Fonts, non incluses ici pour raison de licence /
d'accès : **Clash Grotesk**, **Clash Display**, **General Sans** (Fontshare)
et **Tiempos**, **Neue Haas Grotesk** (commerciales). Les presets qui les
visaient pointent désormais vers un équivalent OFL de la liste ci-dessus.
Pour utiliser l'une de ces polices, déposer son `.woff2` (dûment licencié)
dans ce dossier, l'ajouter à `BRAND_FONTS` (`src/brand/fonts.ts`) et mettre
à jour le `theme.typography.*` du preset concerné.
