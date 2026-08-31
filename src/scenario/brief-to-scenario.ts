import { listBrandThemes } from "../brand/presets/index";
import { safeParseScenario, videoFormatSchema, type Scenario, type VideoFormat } from "./schema";

export interface BriefToScenarioOptions {
  /** Force a specific output format instead of letting the model choose. */
  format?: VideoFormat;
  /** Force a specific brand theme id instead of letting the model choose. */
  themeId?: string;
  /** Default duration hint in seconds if the brief doesn't specify one. */
  defaultDurationInSeconds?: number;
}

/**
 * The engine only depends on this interface, never on a concrete provider.
 * `brief-to-scenario` is the one seam meant to be swapped for a full SaaS
 * pipeline (queue, streaming, user-provided keys, provider fallback, ...)
 * without touching the brand schema, the scene engine, or the renderer.
 */
export interface BriefToScenarioClient {
  convert(brief: string, options?: BriefToScenarioOptions): Promise<Scenario>;
}

export class BriefToScenarioError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BriefToScenarioError";
  }
}

const SCENE_TYPES_DOC = `
- intro { title: string, subtitle?: string }
- text-reveal { lines: string[], align?: "left"|"center"|"right" }
- dashboard-showcase { variant: "analytics"|"sales"|"social"|"finance", title?: string, metrics?: { label: string, value: string }[] }
- phone-showcase { phoneModel?: string, dashboardVariant?: "analytics"|"sales"|"social"|"finance", render?: "2.5d"|"3d" }
- feature-cards { items: { title: string, description: string, icon?: string }[] (1 à 4 items) }
- statistic { value: string, label: string, trend?: "up"|"down"|"flat" }
- call-to-action { title: string, subtitle?: string, buttonLabel: string }
- icon-showcase { shape?: "ring"|"diamond"|"facet" }
- asset-showcase { src: string (chemin public/ ou URL d'un asset résolu), entityKind?: "brand"|"person"|"illustration", label?: string, caption?: string }
- outro { title?: string, logoText?: string }
`.trim();

function buildSystemPrompt(): string {
  const themeIds = listBrandThemes()
    .map((t) => `${t.id} (${t.description ?? t.name})`)
    .join("\n- ");

  return `Tu es un directeur artistique qui convertit une demande en langage naturel en un scénario vidéo JSON STRICT pour un moteur Remotion.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, sans balises markdown, correspondant exactement à ce schéma:

{
  "format": "vertical" | "landscape" | "square",
  "fps": number (30 par défaut),
  "durationInSeconds": number,
  "themeId": string,
  "scenes": Scene[]
}

Contraintes impératives:
- La somme des "durationInSeconds" de chaque scène DOIT être égale à "durationInSeconds" du scénario (tolérance 0.05s).
- "themeId" doit être l'un des identifiants suivants:
- ${themeIds}
- Chaque scène a un champ "type" parmi: intro, text-reveal, dashboard-showcase, phone-showcase, feature-cards, statistic, call-to-action, icon-showcase, asset-showcase, outro.
- Champs disponibles par type de scène:
${SCENE_TYPES_DOC}
- Choisis un enchaînement de scènes cohérent avec la demande (généralement: intro -> contenu -> call-to-action, avec outro optionnel).
- N'invente aucun champ hors de ce schéma.`;
}

interface KimiChatCompletionResponse {
  choices: Array<{ message: { content: string } }>;
}

export interface KimiClientConfig {
  apiKey?: string;
  /** OpenAI-compatible base URL for the Kimi K2 endpoint. */
  baseUrl?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Real implementation backed by Moonshot AI's Kimi K2 model through its
 * OpenAI-compatible chat completions API. Any OpenAI-compatible host that
 * serves a "kimi-k2*" model id works by overriding `baseUrl` / `model`.
 *
 * Configuration (env vars, all overridable via the constructor):
 * - KIMI_API_KEY        (required to actually call the API)
 * - KIMI_API_BASE_URL    default: https://api.moonshot.ai/v1
 * - KIMI_MODEL           default: kimi-k2-0711-preview
 */
export class KimiBriefToScenarioClient implements BriefToScenarioClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly fetchImpl: typeof fetch;

  constructor(config: KimiClientConfig = {}) {
    this.apiKey = config.apiKey ?? process.env["KIMI_API_KEY"];
    this.baseUrl = config.baseUrl ?? process.env["KIMI_API_BASE_URL"] ?? "https://api.moonshot.ai/v1";
    this.model = config.model ?? process.env["KIMI_MODEL"] ?? "kimi-k2-0711-preview";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async convert(brief: string, options: BriefToScenarioOptions = {}): Promise<Scenario> {
    if (!this.apiKey) {
      throw new BriefToScenarioError(
        "KIMI_API_KEY manquant. Définis cette variable d'environnement pour activer la conversion langage naturel -> scénario via Kimi K2.",
      );
    }

    const userInstruction = [
      `Demande: """${brief}"""`,
      options.format ? `Format imposé: ${options.format}` : null,
      options.themeId ? `Charte imposée: ${options.themeId}` : null,
      options.defaultDurationInSeconds
        ? `Si la demande ne précise pas de durée, utilise environ ${options.defaultDurationInSeconds}s.`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const rawContent = await this.requestCompletion(userInstruction);
    const scenario = this.parseModelOutput(rawContent, options);
    return scenario;
  }

  private async requestCompletion(userInstruction: string): Promise<string> {
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.2,
          messages: [
            { role: "system", content: buildSystemPrompt() },
            { role: "user", content: userInstruction },
          ],
        }),
      });
    } catch (error) {
      throw new BriefToScenarioError(`Échec réseau lors de l'appel à Kimi K2 (${this.baseUrl}).`, error);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new BriefToScenarioError(`Kimi K2 a répondu ${response.status} ${response.statusText}: ${body}`);
    }

    const data = (await response.json()) as KimiChatCompletionResponse;
    const content = data.choices[0]?.message.content;
    if (!content) {
      throw new BriefToScenarioError("Réponse Kimi K2 vide ou mal formée.");
    }
    return content;
  }

  private parseModelOutput(rawContent: string, options: BriefToScenarioOptions): Scenario {
    const jsonText = extractJson(rawContent);
    let candidate: unknown;
    try {
      candidate = JSON.parse(jsonText);
    } catch (error) {
      throw new BriefToScenarioError("Kimi K2 n'a pas renvoyé de JSON valide.", error);
    }

    const withOverrides =
      candidate && typeof candidate === "object"
        ? {
            ...candidate,
            ...(options.format ? { format: options.format } : {}),
            ...(options.themeId ? { themeId: options.themeId } : {}),
          }
        : candidate;

    const result = safeParseScenario(withOverrides);
    if (!result.success) {
      throw new BriefToScenarioError(
        `Le scénario généré par Kimi K2 ne respecte pas le schéma: ${result.error.message}`,
        result.error,
      );
    }
    return result.data;
  }
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return text.trim();
  return text.slice(start, end + 1);
}

/** Convenience factory using the default (Kimi K2) client. */
export function createBriefToScenarioClient(config?: KimiClientConfig): BriefToScenarioClient {
  return new KimiBriefToScenarioClient(config);
}

export { videoFormatSchema };
