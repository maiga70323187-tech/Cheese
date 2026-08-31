# Bibliothèque de templates

Un **template** (`src/templates/`) est une *structure narrative réutilisable*
— l'équivalent des modèles de Hera (§20). Chacun fournit trois choses :

1. un **squelette de scénario** prêt à rendre (l'ordre des scènes + un
   contenu placeholder cohérent), construit par `build()` et déjà **validé**
   contre `scenarioSchema` (les durées somment juste) ;
2. un **prompt de départ** structuré, à donner au générateur langage-naturel
   (`brief-to-scenario`, Kimi K2) pour remplir le template avec les vraies
   données du projet ;
3. une **checklist d'assets** à réunir avant de générer.

Le template réduit la page blanche : au lieu de partir d'un scénario vide,
on part d'une intention professionnelle déjà mise en scène.

## Templates livrés

| id | Format | Durée | Pour |
|---|---|---:|---|
| `product-launch` | 16:9 | 25 s | Lancement SaaS / app / fonctionnalité IA / Product Hunt |
| `animated-infographic` | 1:1 | 24 s | Statistiques, enquêtes, dashboards, rapports |
| `saas-explainer` | 16:9 | 32 s | Explication problème → solution en étapes |
| `app-demo` | 9:16 | 20 s | Un parcours mobile dans un mockup de téléphone |
| `social-ad` | 9:16 | 12 s | Reels / Shorts / TikTok — hook, preuve, CTA |
| `data-report` | 16:9 | 34 s | Résumé de rapport / mise à jour investisseurs |

Chaque entrée expose `id`, `name`, `description`, `recommendedFormat`,
`recommendedDurationInSeconds`, `assetChecklist`, `startingPrompt` et
`build(options?)`.

## Utilisation

### En ligne de commande

```bash
# Rendre un template directement (format déduit de la composition)
pnpm exec tsx src/cli/render.ts --composition VideoSquare --template animated-infographic --out out/demo.mp4

# Forcer une charte
pnpm exec tsx src/cli/render.ts --composition VideoLandscape --template product-launch --theme crimson-glow
```

`--template` et `--scenario` sont mutuellement exclusifs.

### En code

```ts
import { getTemplate, listTemplates } from "./src/templates";

const scenario = getTemplate("product-launch")!.build({ themeId: "emerald-glow", format: "vertical" });
// -> Scenario valide, prêt pour le renderer

// Ou : donner le prompt de départ au générateur NL puis remplir le template
const prompt = getTemplate("product-launch")!.startingPrompt;
```

## Ajouter un template

Dans `src/templates/index.ts`, appeler `defineTemplate({...})` avec les
métadonnées + une fonction `scenes(theme)` renvoyant la liste de scènes.
`build()` passe systématiquement par `parseScenario`, donc **un template mal
formé (durées qui ne somment pas, champ manquant) échoue immédiatement** —
et `templates.test.ts` vérifie que chacun construit un scénario valide.

## Contenu placeholder

Le contenu des templates est un placeholder en français (`[PRODUIT]`,
`[AUDIENCE]`, `[SOURCE]`…) : il donne une vidéo qui se rend telle quelle
pour prévisualiser la structure, mais il est destiné à être remplacé par
les vraies données — à la main dans le scénario, ou via le générateur NL en
partant du `startingPrompt`. Les valeurs des graphiques doivent être
**vérifiées humainement** avant publication.
