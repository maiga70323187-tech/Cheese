import { describe, expect, it } from "vitest";
import { BrandfetchClient } from "./clients/brandfetch";
import { WikimediaClient } from "./clients/wikimedia";
import { OpenverseIllustrationClient } from "./clients/openverse";
import { MultiSourceAssetResolver, AssetResolutionError } from "./resolver";
import { NoopBackgroundRemover, applyCutoutIfNeeded } from "./cutout";
import { inferAssetFormat, type ResolvedAsset } from "./schema";

function mockFetchJson(payload: unknown, status = 200): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;
}

describe("inferAssetFormat", () => {
  it("devine le format depuis l'extension, png par défaut", () => {
    expect(inferAssetFormat("https://x/y/logo.svg")).toBe("svg");
    expect(inferAssetFormat("https://x/y/photo.JPG?crop=1")).toBe("jpg");
    expect(inferAssetFormat("https://x/y/image")).toBe("png");
  });
});

describe("BrandfetchClient", () => {
  it("exige une clé API", async () => {
    const client = new BrandfetchClient({ apiKey: undefined, fetchImpl: mockFetchJson({}) });
    await expect(client.resolve({ kind: "brand", query: "openai.com" })).rejects.toBeInstanceOf(AssetResolutionError);
  });

  it("choisit le logo SVG de type 'logo' et normalise le domaine", async () => {
    const payload = {
      name: "OpenAI",
      logos: [
        { type: "symbol", formats: [{ src: "https://cdn/sym.png", format: "png" }] },
        { type: "logo", theme: "dark", formats: [{ src: "https://cdn/logo.svg", format: "svg" }] },
      ],
    };
    const client = new BrandfetchClient({ apiKey: "k", fetchImpl: mockFetchJson(payload) });
    const asset = await client.resolve({ kind: "brand", query: "OpenAI" });
    expect(asset).toMatchObject({ kind: "brand", format: "svg", src: "https://cdn/logo.svg", label: "OpenAI", source: "brandfetch" });
  });

  it("remonte une erreur si aucun logo exploitable", async () => {
    const client = new BrandfetchClient({ apiKey: "k", fetchImpl: mockFetchJson({ name: "X", logos: [] }) });
    await expect(client.resolve({ kind: "brand", query: "x.com" })).rejects.toBeInstanceOf(AssetResolutionError);
  });

  it("propage une réponse HTTP non-OK", async () => {
    const client = new BrandfetchClient({ apiKey: "k", fetchImpl: mockFetchJson({}, 404) });
    await expect(client.resolve({ kind: "brand", query: "x.com" })).rejects.toBeInstanceOf(AssetResolutionError);
  });
});

describe("WikimediaClient", () => {
  it("renvoie l'image originale et marque needsCutout", async () => {
    const payload = { title: "Sam Altman", originalimage: { source: "https://upload/sam.jpg" } };
    const client = new WikimediaClient({ fetchImpl: mockFetchJson(payload) });
    const asset = await client.resolve({ kind: "person", query: "Sam Altman" });
    expect(asset).toMatchObject({ kind: "person", format: "jpg", src: "https://upload/sam.jpg", needsCutout: true });
    expect(asset.attribution).toBeTruthy();
  });

  it("erreur si la page n'a pas d'image", async () => {
    const client = new WikimediaClient({ fetchImpl: mockFetchJson({ title: "X" }) });
    await expect(client.resolve({ kind: "person", query: "X" })).rejects.toBeInstanceOf(AssetResolutionError);
  });
});

describe("OpenverseIllustrationClient", () => {
  it("renvoie le premier résultat avec attribution CC", async () => {
    const payload = {
      results: [{ title: "Rocket", url: "https://cc/rocket.jpg", creator: "Jane", license: "by", license_version: "4.0" }],
    };
    const client = new OpenverseIllustrationClient({ fetchImpl: mockFetchJson(payload) });
    const asset = await client.resolve({ kind: "illustration", query: "rocket launch" });
    expect(asset).toMatchObject({ kind: "illustration", src: "https://cc/rocket.jpg", source: "openverse", license: "BY-4.0" });
    expect(asset.attribution).toContain("Jane");
  });

  it("erreur si aucun résultat", async () => {
    const client = new OpenverseIllustrationClient({ fetchImpl: mockFetchJson({ results: [] }) });
    await expect(client.resolve({ kind: "illustration", query: "zzz" })).rejects.toBeInstanceOf(AssetResolutionError);
  });
});

describe("MultiSourceAssetResolver", () => {
  it("aiguille chaque requête vers le bon client par kind", async () => {
    const resolver = new MultiSourceAssetResolver([
      new BrandfetchClient({ apiKey: "k", fetchImpl: mockFetchJson({ name: "A", logos: [{ type: "logo", formats: [{ src: "https://l.svg", format: "svg" }] }] }) }),
      new WikimediaClient({ fetchImpl: mockFetchJson({ title: "P", originalimage: { source: "https://p.png" } }) }),
    ]);
    expect(resolver.supportedKinds().sort()).toEqual(["brand", "person"]);
    expect((await resolver.resolve({ kind: "brand", query: "a.com" })).source).toBe("brandfetch");
    expect((await resolver.resolve({ kind: "person", query: "P" })).source).toBe("wikimedia");
  });

  it("erreur claire pour un kind sans client", async () => {
    const resolver = new MultiSourceAssetResolver([new WikimediaClient({ fetchImpl: mockFetchJson({}) })]);
    await expect(resolver.resolve({ kind: "illustration", query: "x" })).rejects.toBeInstanceOf(AssetResolutionError);
  });

  it("refuse deux clients pour le même kind", () => {
    expect(() => new MultiSourceAssetResolver([new WikimediaClient(), new WikimediaClient()])).toThrow(AssetResolutionError);
  });
});

describe("cutout", () => {
  it("applique le détourage uniquement si needsCutout, et retire le drapeau", async () => {
    const withCutout: ResolvedAsset = { kind: "person", format: "png", src: "x.png", needsCutout: true };
    const without: ResolvedAsset = { kind: "brand", format: "svg", src: "l.svg" };
    const remover = new NoopBackgroundRemover();
    expect((await applyCutoutIfNeeded(withCutout, remover)).needsCutout).toBe(false);
    expect(await applyCutoutIfNeeded(without, remover)).toBe(without);
  });
});
