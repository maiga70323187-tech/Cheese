import { parseScenario, type Scenario, type VideoFormat } from "../scenario/schema";

export interface TemplateBuildOptions {
  /** Force la charte ; par défaut la charte recommandée du template. */
  themeId?: string;
  /** Force le format ; par défaut le format recommandé du template. */
  format?: VideoFormat;
}

/**
 * Un template = une STRUCTURE narrative réutilisable (façon Hera §20) :
 * un squelette de scénario prêt à rendre, un prompt de départ à donner au
 * générateur langage-naturel, et une checklist des assets à préparer. Le
 * contenu est un placeholder cohérent, à remplacer par les vraies données
 * du projet (soit à la main, soit via `brief-to-scenario`).
 */
export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  recommendedFormat: VideoFormat;
  recommendedDurationInSeconds: number;
  /** Assets à réunir avant de générer (comme la checklist Hera). */
  assetChecklist: string[];
  /** Prompt de départ structuré pour le générateur NL. */
  startingPrompt: string;
  /** Construit un scénario complet et VALIDÉ (les durées somment déjà juste). */
  build(options?: TemplateBuildOptions): Scenario;
}

const DEFAULT_THEME = "premium-tech";

/** Fabrique un template : `build` valide toujours le scénario via `parseScenario`. */
function defineTemplate(
  spec: Omit<VideoTemplate, "build"> & { scenes: (theme: string) => Scenario["scenes"] },
): VideoTemplate {
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    recommendedFormat: spec.recommendedFormat,
    recommendedDurationInSeconds: spec.recommendedDurationInSeconds,
    assetChecklist: spec.assetChecklist,
    startingPrompt: spec.startingPrompt,
    build(options: TemplateBuildOptions = {}): Scenario {
      const themeId = options.themeId ?? DEFAULT_THEME;
      const raw = {
        format: options.format ?? spec.recommendedFormat,
        fps: 30,
        durationInSeconds: spec.recommendedDurationInSeconds,
        themeId,
        scenes: spec.scenes(themeId),
      };
      // Valide et applique les défauts (betterWhen, align, etc.). Lève si un
      // template est mal formé — c'est une erreur de programmation, couverte
      // par les tests.
      return parseScenario(raw);
    },
  };
}

const productLaunch = defineTemplate({
  id: "product-launch",
  name: "Vidéo de lancement produit",
  description: "SaaS, app, fonctionnalité IA, Product Hunt, liste d'attente. Problème → révélation → 3 preuves → résultat → CTA.",
  recommendedFormat: "landscape",
  recommendedDurationInSeconds: 25,
  assetChecklist: ["Promesse en une phrase", "3 bénéfices observables", "Captures/mockups produit", "Logo + couleurs", "URL de CTA"],
  startingPrompt:
    "Crée une vidéo de lancement de 25s au format 16:9 pour [PRODUIT], destinée à [AUDIENCE]. Montre le problème actuel, révèle le produit, anime 3 bénéfices, prouve le résultat par une comparaison chiffrée, termine par un CTA « [ACTION] ».",
  scenes: () => [
    { type: "intro", durationInSeconds: 3, title: "Le travail manuel vous ralentit", subtitle: "Il y a une meilleure façon" },
    { type: "phone-showcase", durationInSeconds: 7, phoneModel: "generic-phone", dashboardVariant: "analytics", render: "3d" },
    {
      type: "feature-cards",
      durationInSeconds: 6,
      items: [
        { title: "Rapide", description: "De l'idée à la vidéo en minutes" },
        { title: "Cohérent", description: "Votre marque appliquée partout" },
        { title: "Multicanal", description: "16:9, 1:1, 9:16 d'un coup" },
      ],
    },
    { type: "comparison", durationInSeconds: 5, title: "Temps de production", unit: "h", before: { label: "Avant", value: 5 }, after: { label: "Avec [PRODUIT]", value: 0.5 }, betterWhen: "lower" },
    { type: "call-to-action", durationInSeconds: 4, title: "Prêt à lancer ?", buttonLabel: "Commencer" },
  ],
});

const animatedInfographic = defineTemplate({
  id: "animated-infographic",
  name: "Infographie animée",
  description: "Statistiques, enquêtes, dashboards, rapports. Question → base → tendance → chiffre clé → conclusion.",
  recommendedFormat: "square",
  recommendedDurationInSeconds: 24,
  assetChecklist: ["Question à laquelle répond la donnée", "Valeurs nettoyées et vérifiées", "Source à citer", "Conclusion à retenir"],
  startingPrompt:
    "Crée une infographie animée de 24s au format 1:1 sur [SUJET]. Pose la question, montre les données en barres puis la tendance en courbe, mets en avant le chiffre clé, conclus. Cite la source « [SOURCE] ».",
  scenes: () => [
    { type: "intro", durationInSeconds: 3, title: "Où va le marché ?", subtitle: "Les chiffres 2026" },
    { type: "bar-chart", durationInSeconds: 6, title: "Répartition par segment", unit: "%", source: "Source : [SOURCE]", data: [ { label: "A", value: 24 }, { label: "B", value: 38 }, { label: "C", value: 21 }, { label: "D", value: 17 } ] },
    { type: "line-chart", durationInSeconds: 6, title: "Croissance mensuelle", unit: "K", source: "Source : [SOURCE]", data: [ { label: "Jan", value: 12 }, { label: "Fév", value: 18 }, { label: "Mar", value: 16 }, { label: "Avr", value: 27 }, { label: "Mai", value: 34 }, { label: "Juin", value: 48 } ] },
    { type: "statistic", durationInSeconds: 5, value: "+62%", label: "sur un an", trend: "up" },
    { type: "call-to-action", durationInSeconds: 4, title: "Voir le rapport complet", buttonLabel: "Télécharger" },
  ],
});

const saasExplainer = defineTemplate({
  id: "saas-explainer",
  name: "Explainer SaaS",
  description: "Explication problème → solution en étapes. SaaS, éducation, fintech, workflows complexes.",
  recommendedFormat: "landscape",
  recommendedDurationInSeconds: 32,
  assetChecklist: ["Public + problème nommés", "Ancien workflow / confusion", "Étapes de la solution", "Captures produit", "Action suivante"],
  startingPrompt:
    "Crée un explainer de 32s au format 16:9 pour [PRODUIT]. Nomme le public et le problème, montre l'ancien workflow, révèle la solution étape par étape, puis l'action à faire. Lisible sans son.",
  scenes: () => [
    { type: "intro", durationInSeconds: 4, title: "Trop d'outils, trop de friction", subtitle: "Voici une autre voie" },
    { type: "text-reveal", durationInSeconds: 6, align: "left", lines: ["1. Décrivez votre besoin", "2. L'IA structure la vidéo", "3. Vous ajustez et exportez"] },
    {
      type: "feature-cards",
      durationInSeconds: 8,
      items: [
        { title: "Brief", description: "Un prompt, pas une timeline" },
        { title: "Structure", description: "Storyboard proposé" },
        { title: "Contrôle", description: "Édition scène par scène" },
        { title: "Export", description: "MP4, GIF, formats sociaux" },
      ],
    },
    { type: "phone-showcase", durationInSeconds: 8, phoneModel: "generic-phone", dashboardVariant: "sales", render: "2.5d" },
    { type: "call-to-action", durationInSeconds: 6, title: "Essayez sur votre produit", subtitle: "Sans carte bancaire", buttonLabel: "Créer une vidéo" },
  ],
});

const appDemo = defineTemplate({
  id: "app-demo",
  name: "Démo d'application mobile",
  description: "Un seul parcours utilisateur dans un mockup de téléphone, avec CTA de téléchargement.",
  recommendedFormat: "vertical",
  recommendedDurationInSeconds: 20,
  assetChecklist: ["Captures/mockups de l'app", "Le parcours à montrer (1 seul)", "État de succès", "CTA (téléchargement / liste d'attente)"],
  startingPrompt:
    "Crée une démo d'app de 20s au format 9:16 pour [APP]. Montre l'intention utilisateur, fais apparaître le téléphone, anime le parcours principal, révèle le résultat, termine par « [CTA] ».",
  scenes: () => [
    { type: "intro", durationInSeconds: 3, title: "Votre quotidien, simplifié", subtitle: "[APP]" },
    { type: "phone-showcase", durationInSeconds: 9, phoneModel: "generic-phone", dashboardVariant: "social", render: "3d" },
    {
      type: "feature-cards",
      durationInSeconds: 4,
      items: [
        { title: "Simple", description: "Tout en un geste" },
        { title: "Rapide", description: "Aucune attente" },
      ],
    },
    { type: "call-to-action", durationInSeconds: 4, title: "Téléchargez [APP]", buttonLabel: "Installer" },
  ],
});

const socialAd = defineTemplate({
  id: "social-ad",
  name: "Publicité sociale courte",
  description: "Reels, Shorts, TikTok, LinkedIn. Hook → preuve → CTA, vertical, lisible sans son.",
  recommendedFormat: "vertical",
  recommendedDurationInSeconds: 12,
  assetChecklist: ["Hook (première frame)", "1 preuve/chiffre fort", "CTA adapté au canal", "Marges de sécurité"],
  startingPrompt:
    "Crée une pub sociale de 12s au format 9:16 pour [PRODUIT]. Ouvre sur un hook fort, montre une seule preuve chiffrée, termine par « [CTA] ». Conçue pour être lue sans son.",
  scenes: () => [
    { type: "intro", durationInSeconds: 3, title: "5 heures → 5 minutes", subtitle: "Pas de blague" },
    { type: "comparison", durationInSeconds: 5, title: "Temps par vidéo", unit: "h", before: { label: "Avant", value: 5 }, after: { label: "Après", value: 0.5 }, betterWhen: "lower" },
    { type: "call-to-action", durationInSeconds: 4, title: "Testez gratuitement", buttonLabel: "Essayer" },
  ],
});

const dataReport = defineTemplate({
  id: "data-report",
  name: "Résumé de rapport / investisseurs",
  description: "Condense un rapport ou dashboard : question → 3 résultats → comparaison → tendance → implication → CTA.",
  recommendedFormat: "landscape",
  recommendedDurationInSeconds: 34,
  assetChecklist: ["Question du rapport", "3 résultats clés (valeurs vérifiées)", "Comparaison période/cible", "Note de source", "Lien vers le document complet"],
  startingPrompt:
    "Crée un résumé de rapport de 34s au format 16:9 pour [RAPPORT]. Pose la question, montre 3 résultats en graphiques, compare à la cible, montre la tendance, conclus sur l'implication business, CTA vers le document. Cite « [SOURCE] ».",
  scenes: () => [
    { type: "intro", durationInSeconds: 4, title: "Rapport T4 2026", subtitle: "Ce que disent les chiffres" },
    { type: "bar-chart", durationInSeconds: 7, title: "Revenus par trimestre", unit: "K€", source: "Source : [SOURCE]", data: [ { label: "T1", value: 128 }, { label: "T2", value: 164 }, { label: "T3", value: 142 }, { label: "T4", value: 203 } ] },
    { type: "comparison", durationInSeconds: 6, title: "Objectif annuel", unit: "K€", before: { label: "Cible", value: 600 }, after: { label: "Réalisé", value: 637 }, betterWhen: "higher" },
    { type: "line-chart", durationInSeconds: 7, title: "Trésorerie", unit: "K€", source: "Source : [SOURCE]", data: [ { label: "Jan", value: 40 }, { label: "Mar", value: 46 }, { label: "Juin", value: 44 }, { label: "Sep", value: 58 }, { label: "Déc", value: 72 } ] },
    { type: "statistic", durationInSeconds: 5, value: "+18%", label: "vs objectif", trend: "up" },
    { type: "call-to-action", durationInSeconds: 5, title: "Lire le rapport complet", buttonLabel: "Ouvrir le PDF" },
  ],
});

const overlayPack = defineTemplate({
  id: "overlay-pack",
  name: "Pack d'overlays",
  description: "Éléments animés à superposer sur une vidéo existante (lower thirds, citation, callout, stat). À exporter en MOV transparent (--transparent).",
  recommendedFormat: "landscape",
  recommendedDurationInSeconds: 12,
  assetChecklist: ["Nom + rôle de l'intervenant", "Citation / définition à afficher", "Statistique à mettre en avant", "Couleurs de marque", "Zones sûres pour les sous-titres"],
  startingPrompt:
    "Crée un pack d'overlays de 12s au format 16:9 pour [VIDÉO]. Un lower third « [NOM] / [RÔLE] », une carte de citation, un callout, une stat animée. À compositer en transparence sur la vidéo existante.",
  scenes: () => [
    { type: "lower-third", durationInSeconds: 3, title: "[NOM]", subtitle: "[RÔLE]", position: "bottom-left" },
    { type: "quote-card", durationInSeconds: 3, quote: "[CITATION À METTRE EN AVANT]", author: "[NOM]", position: "bottom-center" },
    { type: "callout", durationInSeconds: 3, text: "[POINT CLÉ]", position: "top-right" },
    { type: "stat-overlay", durationInSeconds: 3, value: "[+X%]", label: "[MÉTRIQUE]", position: "bottom-right" },
  ],
});

export const videoTemplates: Record<string, VideoTemplate> = {
  [productLaunch.id]: productLaunch,
  [animatedInfographic.id]: animatedInfographic,
  [saasExplainer.id]: saasExplainer,
  [appDemo.id]: appDemo,
  [socialAd.id]: socialAd,
  [dataReport.id]: dataReport,
  [overlayPack.id]: overlayPack,
};

export function listTemplates(): VideoTemplate[] {
  return Object.values(videoTemplates);
}

export function getTemplate(id: string): VideoTemplate | undefined {
  return videoTemplates[id];
}
