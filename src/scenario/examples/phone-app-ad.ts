import type { Scenario } from "../schema";

/**
 * Exemple de scénario reproduisant la demande du brief produit :
 * "Crée une vidéo publicitaire de 12 secondes présentant mon application
 * mobile avec un téléphone au centre, un arrière-plan premium, une
 * interface de dashboard animée et un appel à l'action final."
 */
export const phoneAppAdScenario: Scenario = {
  format: "vertical",
  fps: 30,
  durationInSeconds: 12,
  themeId: "premium-tech",
  scenes: [
    {
      type: "intro",
      durationInSeconds: 2,
      title: "Transformez vos idées en vidéos",
      subtitle: "Simplement avec du texte",
    },
    {
      type: "phone-showcase",
      durationInSeconds: 6,
      phoneModel: "generic-phone",
      dashboardVariant: "analytics",
      render: "2.5d",
    },
    {
      type: "call-to-action",
      durationInSeconds: 4,
      title: "Créez votre prochaine vidéo",
      buttonLabel: "Commencer maintenant",
    },
  ],
};
