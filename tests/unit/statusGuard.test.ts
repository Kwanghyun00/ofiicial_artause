import { describe, expect, it } from "vitest";

function decideStatus({
  introSeen,
  adVerified,
  alreadyApplied,
}: {
  introSeen: boolean;
  adVerified: boolean;
  alreadyApplied: boolean;
}) {
  if (alreadyApplied) return 409;
  if (!introSeen || !adVerified) return 412;
  return 200;
}

describe("응모 상태 코드", () => {
  it("중복 응모는 409", () => {
    expect(decideStatus({ introSeen: true, adVerified: true, alreadyApplied: true })).toBe(409);
  });

  it("조건 미충족은 412", () => {
    expect(decideStatus({ introSeen: false, adVerified: true, alreadyApplied: false })).toBe(412);
  });

  it("조건 충족은 200", () => {
    expect(decideStatus({ introSeen: true, adVerified: true, alreadyApplied: false })).toBe(200);
  });
});
