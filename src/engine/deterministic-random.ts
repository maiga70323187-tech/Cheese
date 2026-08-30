/**
 * Every "random" element in the engine (particle positions, grain seed,
 * jitter) must be a pure function of a fixed seed — never `Math.random()`.
 * Same theme + same scene => byte-identical render, every time.
 */

export function stringToSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/** mulberry32 — small, fast, deterministic PRNG. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededSequence(seed: number, count: number): number[] {
  const next = mulberry32(seed);
  return Array.from({ length: count }, () => next());
}
