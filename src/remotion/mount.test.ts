import { existsSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { FORMAT_DIMENSIONS } from "../scenario/schema";

/**
 * This is the point 10 requirement "un test vérifiant que toutes les
 * compositions principales se montent" — and it means it literally:
 * a real headless-Chromium render through `@remotion/bundler` +
 * `@remotion/renderer`, not a shallow React mount in jsdom. A jsdom mount
 * would pass even if a scene threw inside `<ThreeCanvas>` or produced a
 * blank frame (both bugs actually hit during Checkpoint C — see
 * TROUBLESHOOTING.md); only a real render catches those.
 *
 * Uses the same preinstalled-Chromium fallback as `remotion.config.ts`,
 * duplicated here because this test calls `@remotion/renderer` directly
 * and skips the `remotion` CLI's own config-loading step.
 */
const PREINSTALLED_HEADLESS_SHELL = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const browserExecutable =
  process.env["REMOTION_BROWSER_EXECUTABLE"] ?? (existsSync(PREINSTALLED_HEADLESS_SHELL) ? PREINSTALLED_HEADLESS_SHELL : undefined);

const COMPOSITIONS = ["VideoVertical", "VideoLandscape", "VideoSquare"] as const;

describe("every main composition actually mounts and renders", () => {
  let serveUrl: string;
  const tmpFiles: string[] = [];

  beforeAll(async () => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    serveUrl = await bundle({ entryPoint: path.resolve(dirname, "index.ts") });
  }, 180_000);

  afterAll(() => {
    for (const file of tmpFiles) {
      if (existsSync(file)) rmSync(file);
    }
  });

  it.each(COMPOSITIONS)(
    "%s selects with correct dimensions/fps and renders a non-empty still frame",
    async (id) => {
      const composition = await selectComposition({ serveUrl, id, browserExecutable });

      const expected = FORMAT_DIMENSIONS[id === "VideoVertical" ? "vertical" : id === "VideoLandscape" ? "landscape" : "square"];
      expect(composition.width).toBe(expected.width);
      expect(composition.height).toBe(expected.height);
      expect(composition.fps).toBe(30);
      expect(composition.durationInFrames).toBeGreaterThan(0);

      const output = path.join(os.tmpdir(), `cheese-mount-test-${id}-${Date.now()}.png`);
      tmpFiles.push(output);

      await renderStill({ composition, serveUrl, output, frame: 5, browserExecutable });

      expect(existsSync(output)).toBe(true);
      // A blank/corrupt render would still produce a valid (tiny) PNG file;
      // a real 1080p+ frame with content is reliably well over 50KB.
      expect(statSync(output).size).toBeGreaterThan(50_000);
    },
    120_000,
  );

  it(
    "rendering the same frame twice produces byte-identical output (determinism)",
    async () => {
      // Frame 200 of the reference scenario falls inside the 2.5D
      // phone-showcase scene — the composition with the most animated
      // layers (parallax, glass sweep, particles), so this is the most
      // meaningful frame to catch any accidental non-determinism
      // (Date.now(), unseeded Math.random(), ...) in.
      const composition = await selectComposition({ serveUrl, id: "VideoVertical", browserExecutable });
      const outputA = path.join(os.tmpdir(), `cheese-determinism-a-${Date.now()}.png`);
      const outputB = path.join(os.tmpdir(), `cheese-determinism-b-${Date.now()}.png`);
      tmpFiles.push(outputA, outputB);

      await renderStill({ composition, serveUrl, output: outputA, frame: 200, browserExecutable });
      await renderStill({ composition, serveUrl, output: outputB, frame: 200, browserExecutable });

      expect(readFileSync(outputA).equals(readFileSync(outputB))).toBe(true);
    },
    120_000,
  );
});
