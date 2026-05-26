import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchAllUpcomingPerformances,
  fetchRecentPerformances,
} from "@/lib/kopis/api";

function buildListXml(startId: number, count: number): string {
  const items = Array.from({ length: count }, (_, index) => {
    const id = startId + index;

    return `
      <db>
        <mt20id>PF${id}</mt20id>
        <prfnm>Performance ${id}</prfnm>
        <prfpdfrom>2026.03.01</prfpdfrom>
        <prfpdto>2026.03.02</prfpdto>
        <fcltynm>Test Hall</fcltynm>
        <poster>http://example.com/poster-${id}.jpg</poster>
        <genrenm>Musical</genrenm>
        <area>Seoul</area>
        <prfstate>02</prfstate>
      </db>
    `;
  }).join("");

  return `<dbs>${items}</dbs>`;
}

function toUrl(input: RequestInfo | URL): URL {
  if (input instanceof URL) {
    return input;
  }

  if (typeof input === "string") {
    return new URL(input);
  }

  return new URL(input.url);
}

describe("KOPIS API pagination", () => {
  beforeEach(() => {
    process.env.KOPIS_SERVICE_KEY = "test-service-key";
    process.env.KOPIS_MAX_UPCOMING_PAGES = "10";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete process.env.KOPIS_SERVICE_KEY;
    delete process.env.KOPIS_MAX_UPCOMING_PAGES;
  });

  it("fetches additional pages when more than 100 rows are requested", async () => {
    const calls: Array<{ cpage: string | null; rows: string | null }> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = toUrl(input);
      const page = Number(url.searchParams.get("cpage"));
      const rows = Number(url.searchParams.get("rows"));

      calls.push({
        cpage: url.searchParams.get("cpage"),
        rows: url.searchParams.get("rows"),
      });

      const startId = (page - 1) * 100 + 1;
      return new Response(buildListXml(startId, rows), { status: 200 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const performances = await fetchRecentPerformances(250);

    expect(performances).toHaveLength(250);
    expect(calls).toEqual([
      { cpage: "1", rows: "100" },
      { cpage: "2", rows: "100" },
      { cpage: "3", rows: "50" },
    ]);
  });

  it("keeps requesting full pages until a short page is returned", async () => {
    const calls: Array<{ cpage: string | null; rows: string | null; shcate: string | null }> = [];
    const pageSizes = [100, 100, 35];

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = toUrl(input);
      const page = Number(url.searchParams.get("cpage"));
      const rows = Number(url.searchParams.get("rows"));
      const count = pageSizes[page - 1] ?? 0;

      calls.push({
        cpage: url.searchParams.get("cpage"),
        rows: url.searchParams.get("rows"),
        shcate: url.searchParams.get("shcate"),
      });

      const startId = (page - 1) * 100 + 1;
      return new Response(buildListXml(startId, Math.min(rows, count)), { status: 200 });
    });

    vi.stubGlobal("fetch", fetchMock);

    const performances = await fetchAllUpcomingPerformances("AAAA");

    expect(performances).toHaveLength(235);
    expect(calls).toEqual([
      { cpage: "1", rows: "100", shcate: "AAAA" },
      { cpage: "2", rows: "100", shcate: "AAAA" },
      { cpage: "3", rows: "100", shcate: "AAAA" },
    ]);
  });
});
