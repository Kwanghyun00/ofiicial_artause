import { describe, expect, it } from "vitest";
import crypto from "crypto";

function seededRandom(seed: string) {
  const hash = crypto.createHash("sha256").update(seed).digest();
  let idx = 0;
  return () => {
    if (idx >= hash.length) idx = 0;
    return hash[idx++] / 255;
  };
}

function draw(seed: string) {
  const rng = seededRandom(seed);
  return [rng(), rng(), rng()];
}

describe("seed reproducibility", () => {
  it("produces the same sequence for the same seed", () => {
    expect(draw("artause-seed")).toEqual(draw("artause-seed"));
  });

  it("produces a different sequence for another seed", () => {
    expect(draw("artause-seed")).not.toEqual(draw("another-seed"));
  });
});
