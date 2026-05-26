import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  fetchAllUpcomingPerformances,
  fetchPerformanceDetail,
  isKopisConfigured,
  mapKopisDetailToPerformance,
  mapKopisListToPerformances,
} from "@/lib/kopis";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type PerformanceInsert = Database["public"]["Tables"]["performances"]["Insert"];
type PerformanceUpdate = Database["public"]["Tables"]["performances"]["Update"];

const CRON_SECRET = process.env.CRON_SECRET;
// 6개 장르 병렬 수집 기본값 500 (env로 덮어쓰기 가능)
const KOPIS_SYNC_TARGET_COUNT = readPositiveIntEnv("KOPIS_SYNC_TARGET_COUNT", 500);
const KOPIS_DETAIL_BATCH = readPositiveIntEnv("KOPIS_DETAIL_BATCH", KOPIS_SYNC_TARGET_COUNT);

function readPositiveIntEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return parsed;
}

function toSortableTimestamp(value?: string | null): number {
  if (!value) return Number.MAX_SAFE_INTEGER;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time;
}

function pickSyncTargets(
  performances: ReturnType<typeof mapKopisListToPerformances>
): ReturnType<typeof mapKopisListToPerformances> {
  const deduped = new Map<string, (typeof performances)[number]>();

  for (const performance of performances) {
    if (!deduped.has(performance.id)) {
      deduped.set(performance.id, performance);
    }
  }

  return [...deduped.values()]
    .sort((a, b) => {
      const startDiff = toSortableTimestamp(a.period_start) - toSortableTimestamp(b.period_start);
      if (startDiff !== 0) return startDiff;

      const endDiff = toSortableTimestamp(a.period_end) - toSortableTimestamp(b.period_end);
      if (endDiff !== 0) return endDiff;

      return a.title.localeCompare(b.title, "ko-KR");
    })
    .slice(0, KOPIS_SYNC_TARGET_COUNT);
}

export async function POST() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isKopisConfigured()) {
    return NextResponse.json(
      { error: "KOPIS API key not configured (KOPIS_SERVICE_KEY missing)" },
      { status: 503 }
    );
  }

  const syncedAt = new Date().toISOString();
  const supabase = createAdminSupabaseClient();
  const result = { listSynced: 0, detailSynced: 0, errors: 0 };
  const targetKopisIds = new Set<string>();

  try {
    // 연극(AAAA), 뮤지컬(BBBC), 클래식(CCCA), 무용(GGGA), 국악(EEEB), 대중음악(CCCD)
    const [theaterData, musicalData, classicData, danceData, gugakData, popData] = await Promise.all([
      fetchAllUpcomingPerformances("AAAA"),
      fetchAllUpcomingPerformances("BBBC"),
      fetchAllUpcomingPerformances("CCCA"),
      fetchAllUpcomingPerformances("GGGA"),
      fetchAllUpcomingPerformances("EEEB"),
      fetchAllUpcomingPerformances("CCCD"),
    ]);

    const mapped = pickSyncTargets(
      mapKopisListToPerformances([...theaterData, ...musicalData, ...classicData, ...danceData, ...gugakData, ...popData])
    );

    for (const performance of mapped) {
      targetKopisIds.add(performance.id);
    }

    if (mapped.length > 0) {
      const kopisIds = mapped.map((performance) => performance.id).filter(Boolean);

      const { data: existingPerfs } = await supabase
        .from("performances")
        .select("id, kopis_id")
        .in("kopis_id", kopisIds);

      const existingByKopisId = new Map(
        (existingPerfs ?? []).map((performance) => [
          performance.kopis_id as string,
          performance.id as string,
        ])
      );

      const { data: linkedCampaigns } = await supabase
        .from("ticket_campaigns")
        .select("kopis_id, performance_id")
        .not("kopis_id", "is", null)
        .not("performance_id", "is", null);

      for (const campaign of linkedCampaigns ?? []) {
        if (
          campaign.kopis_id &&
          campaign.performance_id &&
          !existingByKopisId.has(campaign.kopis_id as string)
        ) {
          existingByKopisId.set(campaign.kopis_id as string, campaign.performance_id as string);
        }
      }

      const toUpdate: Array<{ id: string; data: PerformanceUpdate }> = [];
      const toInsert: PerformanceInsert[] = [];

      for (const performance of mapped) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = performance as any;
        const rowData: PerformanceUpdate = {
          slug: performance.slug,
          title: performance.title,
          kopis_id: performance.id,
          category: raw.category ?? null,
          region: performance.region ?? null,
          venue: performance.venue ?? null,
          period_start: performance.period_start ?? null,
          period_end: performance.period_end ?? null,
          poster_url: performance.poster_url ?? null,
          state: raw.state ?? null,
          openrun: raw.openrun ?? null,
          detail_images: raw.images ?? null,
          kopis_facility_id: raw.facility_id ?? null,
          kopis_sections: raw.kopis_sections ?? null,
          ...(performance.ticket_link ? { ticket_link: performance.ticket_link } : {}),
          status: raw.status ?? "ongoing",
          source: "kopis",
          last_synced_at: syncedAt,
          sync_status: "synced",
          updated_at: syncedAt,
        };

        const existingId = existingByKopisId.get(performance.id);
        if (existingId) {
          toUpdate.push({ id: existingId, data: rowData });
        } else {
          toInsert.push({
            ...rowData,
            slug: performance.slug,
            title: performance.title,
          } as PerformanceInsert);
        }
      }

      let updateErrors = 0;
      for (const { id, data } of toUpdate) {
        const { error } = await supabase.from("performances").update(data).eq("id", id);
        if (error) {
          console.error(`[kopis-sync] update error (${data.kopis_id}):`, error);
          updateErrors++;
        }
      }

      let insertErrors = 0;
      if (toInsert.length > 0) {
        const { error } = await supabase.from("performances").insert(toInsert);
        if (error) {
          console.error("[kopis-sync] insert error:", error);

          for (const row of toInsert) {
            const { error: singleErr } = await supabase.from("performances").insert({
              ...row,
              slug: `${row.slug ?? "perf"}-${row.kopis_id}`,
            } as PerformanceInsert);

            if (singleErr) {
              insertErrors++;
            }
          }
        }
      }

      result.errors += updateErrors + insertErrors;
      result.listSynced = toUpdate.length + (toInsert.length - insertErrors);

      console.log(
        `[kopis-sync] list sync complete: ${result.listSynced} records targeted (${mapped.length} selected, ${updateErrors + insertErrors} errors)`
      );
    }
  } catch (err) {
    console.error("[kopis-sync] list fetch failed:", err);
    result.errors++;
  }

  try {
    const { data: campaigns } = await supabase
      .from("ticket_campaigns")
      .select("kopis_id, performance_id")
      .not("kopis_id", "is", null)
      .not("performance_id", "is", null)
      .eq("status", "approved");

    const campaignPerfIds = new Set(
      (campaigns ?? []).map((campaign) => campaign.performance_id as string)
    );
    const campaignByPerfId = new Map(
      (campaigns ?? []).map((campaign) => [
        campaign.performance_id as string,
        campaign.kopis_id as string,
      ])
    );

    const toDetailSync = new Map<string, string>();

    for (const campaign of campaigns ?? []) {
      if (campaign.performance_id && campaign.kopis_id) {
        toDetailSync.set(campaign.performance_id as string, campaign.kopis_id as string);
      }
    }

    if (targetKopisIds.size > 0) {
      const { data: targetPerformances } = await supabase
        .from("performances")
        .select("id, kopis_id")
        .in("kopis_id", [...targetKopisIds])
        .order("period_start", { ascending: true })
        .limit(KOPIS_DETAIL_BATCH);

      for (const performance of targetPerformances ?? []) {
        if (!toDetailSync.has(performance.id as string) && performance.kopis_id) {
          toDetailSync.set(performance.id as string, performance.kopis_id as string);
        }
      }
    }

    for (const [performanceId, kopisId] of toDetailSync) {
      try {
        const detail = await fetchPerformanceDetail(kopisId);
        const mapped = mapKopisDetailToPerformance(detail);

        const { error } = await supabase
          .from("performances")
          .update({
            kopis_id: kopisId,
            category: mapped.category ?? null,
            status: mapped.status ?? "ongoing",
            state: mapped.state ?? null,
            openrun: mapped.openrun ?? null,
            organization: mapped.organization ?? null,
            description: mapped.description ?? null,
            synopsis: mapped.description ?? null,
            cast_info: mapped.cast ?? null,
            crew_info: mapped.crew ?? null,
            runtime_text: mapped.runtime ?? null,
            age_limit: mapped.age_limit ?? null,
            price_info: mapped.price ?? null,
            schedule_info: mapped.schedule ?? null,
            detail_images: mapped.images ?? null,
            kopis_facility_id: mapped.facility_id ?? null,
            kopis_sections: mapped.kopis_sections ?? null,
            ...(mapped.ticket_link ? { ticket_link: mapped.ticket_link } : {}),
            ...(mapped.poster_url ? { poster_url: mapped.poster_url } : {}),
            last_synced_at: syncedAt,
            sync_status: "synced",
            source: "kopis",
            updated_at: syncedAt,
          })
          .eq("id", performanceId);

        if (error) {
          console.error(`[kopis-sync] detail update error (${kopisId}):`, error);
          result.errors++;
        } else {
          result.detailSynced++;

          if (campaignPerfIds.has(performanceId)) {
            console.log(`[kopis-sync] campaign detail synced: ${mapped.title} (${kopisId})`);
          }
        }
      } catch (err) {
        console.error(`[kopis-sync] detail fetch failed (${kopisId}):`, err);
        result.errors++;
      }
    }

    console.log(
      `[kopis-sync] detail sync complete: ${result.detailSynced} updated (${campaignByPerfId.size} campaign-linked)`
    );
  } catch (err) {
    console.error("[kopis-sync] detail stage failed:", err);
    result.errors++;
  }

  return NextResponse.json({
    ok: true,
    synced_at: syncedAt,
    list_synced: result.listSynced,
    detail_synced: result.detailSynced,
    errors: result.errors,
    target_count: KOPIS_SYNC_TARGET_COUNT,
  });
}

export { POST as GET };
