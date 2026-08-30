import { describe, expect, it } from "vitest";
import { mulberry32, seededSequence, stringToSeed } from "./deterministic-random";

describe("deterministic-random", () => {
  it("stringToSeed is a pure function of its input", () => {
    expect(stringToSeed("premium-tech")).toBe(stringToSeed("premium-tech"));
    expect(stringToSeed("premium-tech")).not.toBe(stringToSeed("luxury-dark"));
  });

  it("mulberry32 produces the exact same sequence for the same seed", () => {
    const seed = stringToSeed("premium-tech");
    const first = Array.from({ length: 10 }, mulberry32(seed));
    const second = Array.from({ length: 10 }, mulberry32(seed));
    expect(first).toEqual(second);
  });

  it("every value stays within [0, 1)", () => {
    for (const value of seededSequence(42, 200)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("seededSequence is reproducible across calls (the property PremiumBackground relies on for particle layout)", () => {
    const seed = stringToSeed("vibrant-startup");
    expect(seededSequence(seed, 66)).toEqual(seededSequence(seed, 66));
  });
});
