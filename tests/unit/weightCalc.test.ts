import { describe, expect, it } from "vitest";

function calculateWeight(base: number, cap: number) {
  return Math.min(base, cap);
}

describe("weight calculation", () => {
  it("caps weight at maximum", () => {
    expect(calculateWeight(10, 5)).toBe(5);
  });

  it("keeps weight when below cap", () => {
    expect(calculateWeight(3, 5)).toBe(3);
  });
});
