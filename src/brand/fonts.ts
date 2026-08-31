import { continueRender, delayRender, staticFile } from "remotion";

/**
 * Polices réellement embarquées dans le projet (fichiers `.woff2` sous
 * `public/fonts/`, servis via `staticFile()` — donc AUCUN téléchargement
 * réseau au moment du rendu, condition du déterminisme et de la
 * compatibilité avec le sandbox hors-ligne, voir ARCHITECTURE.md).
 *
 * Toutes sont sous licence SIL Open Font License 1.1 (libre de
 * redistribution et d'incorporation), récupérées depuis Google Fonts —
 * voir `public/fonts/LICENSE.md`. Les polices commerciales nommées dans
 * les maquettes d'origine (Tiempos, Neue Haas Grotesk) ou distribuées
 * hors Google Fonts (Clash Grotesk/Display, General Sans) NE sont PAS
 * embarquées : les presets qui les visaient pointent désormais vers un
 * équivalent OFL de cette liste (voir `src/brand/presets/*.ts`).
 */
export interface BrandFontSpec {
  /** Nom de famille CSS, tel que référencé par `theme.typography.*`. */
  family: string;
  weight: number;
  /** Chemin relatif dans `public/`. */
  file: string;
}

export const BRAND_FONTS: readonly BrandFontSpec[] = [
  { family: "Inter", weight: 400, file: "fonts/inter-400.woff2" },
  { family: "Inter", weight: 600, file: "fonts/inter-600.woff2" },
  { family: "Inter", weight: 700, file: "fonts/inter-700.woff2" },
  { family: "Space Grotesk", weight: 500, file: "fonts/space-grotesk-500.woff2" },
  { family: "Space Grotesk", weight: 700, file: "fonts/space-grotesk-700.woff2" },
  { family: "Playfair Display", weight: 700, file: "fonts/playfair-display-700.woff2" },
  { family: "Source Serif 4", weight: 400, file: "fonts/source-serif-4-400.woff2" },
  { family: "Source Serif 4", weight: 600, file: "fonts/source-serif-4-600.woff2" },
  { family: "IBM Plex Mono", weight: 500, file: "fonts/ibm-plex-mono-500.woff2" },
] as const;

let started = false;

/**
 * Enregistre chaque police via l'API `FontFace` et bloque le rendu Remotion
 * (`delayRender`) jusqu'à ce qu'elles soient chargées, pour qu'aucune frame
 * ne soit capturée avant que la vraie police soit prête (sinon la première
 * frame retomberait sur une police système — bug classique de "flash of
 * unstyled text" figé dans la vidéo).
 *
 * Idempotent (ne s'exécute qu'une fois), et sans effet hors d'un contexte
 * navigateur (tests Node/jsdom) grâce au garde `typeof FontFace`. Une
 * police qui échouerait à charger débloque quand même le rendu
 * (`.catch(continueRender)`) plutôt que de le faire expirer.
 */
export function ensureBrandFontsLoaded(): void {
  if (started) return;
  if (typeof FontFace === "undefined" || typeof document === "undefined") return;
  started = true;

  for (const spec of BRAND_FONTS) {
    const handle = delayRender(`police ${spec.family} ${spec.weight}`);
    const face = new FontFace(spec.family, `url(${staticFile(spec.file)}) format('woff2')`, {
      weight: String(spec.weight),
      style: "normal",
      display: "block",
    });
    face
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        continueRender(handle);
      })
      .catch(() => {
        continueRender(handle);
      });
  }
}
