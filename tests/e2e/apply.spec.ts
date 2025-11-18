import { test, expect } from "@playwright/test";

test.describe("초대권 응모 퍼널", () => {
  test("Intro 미충족 시 412", async ({ page }) => {
    await page.goto("/shows/sample");
    const responsePromise = page.waitForResponse("/api/entries");
    await page.click("button:has-text('초대권 응모 제출')");
    const response = await responsePromise;
    expect(response.status()).toBe(412);
  });

  test("AdGate 미충족 시 412", async ({ page }) => {
    await page.goto("/shows/sample");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("intro:mock", { detail: { seen: true } })));
    const responsePromise = page.waitForResponse("/api/entries");
    await page.click("button:has-text('초대권 응모 제출')");
    const response = await responsePromise;
    expect(response.status()).toBe(412);
  });

  test("중복 응모 시 409", async ({ page }) => {
    await page.goto("/shows/sample");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("intro:mock", { detail: { seen: true } })));
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("adgate:mock", { detail: { verified: true } })));
    const first = await page.request.post("/api/entries", { data: { campaignId: "sample" } });
    expect(first.status()).toBe(200);
    const second = await page.request.post("/api/entries", { data: { campaignId: "sample" } });
    expect(second.status()).toBe(409);
  });

  test("정상 응모 200", async ({ page }) => {
    await page.goto("/shows/sample");
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("intro:mock", { detail: { seen: true } })));
    await page.evaluate(() => window.dispatchEvent(new CustomEvent("adgate:mock", { detail: { verified: true } })));
    const res = await page.request.post("/api/entries", { data: { campaignId: "sample2" } });
    expect(res.status()).toBe(200);
  });
});
