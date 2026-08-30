import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

/**
 * "Un test de compilation TypeScript" as its own Vitest test, so `pnpm test`
 * alone catches a type error — not just a separately-run `pnpm typecheck`
 * that someone might forget to invoke.
 */
describe("TypeScript compilation", () => {
  it(
    "the whole project type-checks with `tsc --noEmit`",
    () => {
      expect(() => {
        execFileSync("pnpm", ["exec", "tsc", "--noEmit"], { stdio: "pipe" });
      }).not.toThrow();
    },
    60_000,
  );
});
