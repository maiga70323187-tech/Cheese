#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { spawnSync } from "node:child_process";
import { scenarioSchema, type VideoFormat } from "../scenario/schema";
import { phoneAppAdScenario } from "../scenario/examples/phone-app-ad";

const COMPOSITION_IDS = ["VideoVertical", "VideoLandscape", "VideoSquare"] as const;
type CompositionId = (typeof COMPOSITION_IDS)[number];

const COMPOSITION_TO_FORMAT: Record<CompositionId, VideoFormat> = {
  VideoVertical: "vertical",
  VideoLandscape: "landscape",
  VideoSquare: "square",
};

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function printUsage(): void {
  console.log(`
Usage: tsx src/cli/render.ts [options]

Options:
  --composition <id>   VideoVertical | VideoLandscape | VideoSquare (défaut: VideoVertical)
  --scenario <path>    Chemin vers un fichier JSON { "scenario": {...} } conforme à scenarioSchema
                        (défaut: le scénario de référence phone-app-ad)
  --theme <themeId>     Force scenario.themeId (ex: luxury-dark, premium-tech, minimal-light, editorial, vibrant-startup)
  --out <path>          Chemin de sortie (défaut: out/<composition>.<mp4|gif>)
  --gif                 Exporte un GIF (codec gif) au lieu d'un MP4 (codec h264)
  -h, --help             Affiche cette aide
`);
}

const { values } = parseArgs({
  options: {
    composition: { type: "string", default: "VideoVertical" },
    scenario: { type: "string" },
    theme: { type: "string" },
    out: { type: "string" },
    gif: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  printUsage();
  process.exit(0);
}

const compositionId = values.composition as string;
if (!COMPOSITION_IDS.includes(compositionId as CompositionId)) {
  fail(`--composition invalide: "${compositionId}". Attendu: ${COMPOSITION_IDS.join(", ")}`);
}
const format = COMPOSITION_TO_FORMAT[compositionId as CompositionId];

let rawScenario: unknown = phoneAppAdScenario;
if (values.scenario) {
  const scenarioPath = path.resolve(values.scenario);
  if (!existsSync(scenarioPath)) {
    fail(`Fichier de scénario introuvable: ${scenarioPath}`);
  }
  const parsed = JSON.parse(readFileSync(scenarioPath, "utf-8")) as { scenario?: unknown };
  if (!parsed.scenario) {
    fail(`${scenarioPath} doit contenir un objet de la forme { "scenario": { ... } }`);
  }
  rawScenario = parsed.scenario;
}

const scenarioWithOverrides = {
  ...(rawScenario as Record<string, unknown>),
  format,
  ...(values.theme ? { themeId: values.theme } : {}),
};

const result = scenarioSchema.safeParse(scenarioWithOverrides);
if (!result.success) {
  fail(`Le scénario ne respecte pas scenarioSchema:\n${result.error.message}`);
}
const scenario = result.data;

const codec = values.gif ? "gif" : "h264";
const extension = values.gif ? "gif" : "mp4";
const outPath = values.out ? path.resolve(values.out) : path.resolve("out", `${compositionId}.${extension}`);
mkdirSync(path.dirname(outPath), { recursive: true });

const propsPath = path.resolve("out", `.render-props-${Date.now()}.json`);
writeFileSync(propsPath, JSON.stringify({ scenario }));

console.log(`\n▶ Rendu ${compositionId} (${format}) — thème "${scenario.themeId}" — codec ${codec}`);
console.log(`  scénario: ${values.scenario ?? "phone-app-ad (référence)"}`);
console.log(`  sortie:   ${outPath}\n`);

const renderResult = spawnSync(
  "pnpm",
  [
    "exec",
    "remotion",
    "render",
    "src/remotion/index.ts",
    compositionId,
    outPath,
    `--props=${propsPath}`,
    `--codec=${codec}`,
  ],
  { stdio: "inherit" },
);

rmSync(propsPath, { force: true });

if (renderResult.status !== 0) {
  fail(`Le rendu Remotion a échoué (code ${renderResult.status}). Voir la sortie ci-dessus.`);
}

console.log(`\n✓ Rendu terminé: ${outPath}\n`);
