import { describe, expect, it } from "vitest";
import { BriefToScenarioError, KimiBriefToScenarioClient } from "./brief-to-scenario";
import { phoneAppAdScenario } from "./examples/phone-app-ad";

function mockFetchReturning(content: string): typeof fetch {
  return (async () =>
    new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;
}

describe("KimiBriefToScenarioClient", () => {
  it("throws a clear error when KIMI_API_KEY is not configured", async () => {
    const client = new KimiBriefToScenarioClient({ apiKey: undefined, fetchImpl: mockFetchReturning("{}") });
    await expect(client.convert("Une pub de 10s")).rejects.toBeInstanceOf(BriefToScenarioError);
  });

  it("parses a well-formed JSON response (including a markdown fence) into a valid Scenario", async () => {
    const fenced = "```json\n" + JSON.stringify(phoneAppAdScenario) + "\n```";
    const client = new KimiBriefToScenarioClient({ apiKey: "test-key", fetchImpl: mockFetchReturning(fenced) });
    const scenario = await client.convert("Une pub de 12s pour mon app mobile");
    expect(scenario.format).toBe(phoneAppAdScenario.format);
    expect(scenario.scenes).toHaveLength(phoneAppAdScenario.scenes.length);
  });

  it("applies forced format/theme overrides on top of the model output", async () => {
    const client = new KimiBriefToScenarioClient({
      apiKey: "test-key",
      fetchImpl: mockFetchReturning(JSON.stringify(phoneAppAdScenario)),
    });
    const scenario = await client.convert("Une pub", { format: "square", themeId: "minimal-light" });
    expect(scenario.format).toBe("square");
    expect(scenario.themeId).toBe("minimal-light");
  });

  it("rejects a response that isn't valid JSON", async () => {
    const client = new KimiBriefToScenarioClient({
      apiKey: "test-key",
      fetchImpl: mockFetchReturning("désolé, je ne peux pas répondre en JSON"),
    });
    await expect(client.convert("Une pub")).rejects.toBeInstanceOf(BriefToScenarioError);
  });

  it("rejects a response that is valid JSON but fails the scenario schema", async () => {
    const client = new KimiBriefToScenarioClient({
      apiKey: "test-key",
      fetchImpl: mockFetchReturning(JSON.stringify({ format: "vertical" })),
    });
    await expect(client.convert("Une pub")).rejects.toBeInstanceOf(BriefToScenarioError);
  });
});
