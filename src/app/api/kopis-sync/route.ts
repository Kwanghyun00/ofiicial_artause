/**
 * KOPIS 배치 동기화 API
 *
 * - 매일 오전 6시 KST (21:00 UTC) Vercel Cron에 의해 자동 실행
 * - 관리자 대시보드에서 수동 트리거 가능
 *
 * 동작:
 * 1. KOPIS에서 연극 + 뮤지컬 공연 목록 수집
 * 2. performances 테이블에 kopis_id 기준으로 update-or-insert (중복 방지)
 *    - 이미 kopis_id가 있는 performances → UPDATE (캠페인에 연결된 레코드 포함)
 *    - 신규 → INSERT (slug 충돌 시 -kopis_id suffix로 유일성 보장)
 * 3. 활성 ticket_campaigns에 연결된 공연은 상세 정보도 동기화
 *    (campaign.performance_id 기준으로 UPDATE — 중복 레코드 생성 없음)
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import {
  isKopisConfigured,
  fetchAllUpcomingPerformances,
  fetchPerformanceDetail,
  mapKopisListToPerformances,
  mapKopisDetailToPerformance,
} from "@/lib/kopis";

type PerformanceInsert = Database["public"]["Tables"]["performances"]["Insert"];
type PerformanceUpdate = Database["public"]["Tables"]["performances"]["Update"];

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST() {
  // Vercel Cron 및 관리자 수동 호출 인증
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

  // ─── 1단계: 공연 목록 동기화 ──────────────────────────────────────
  // NOTE: supabase.upsert({ onConflict: 'kopis_id' })는 partial unique index와
  // 호환되지 않아, 수동으로 existing 조회 후 update/insert 방식 사용
  try {
    const [theaterData, musicalData] = await Promise.all([
      fetchAllUpcomingPerformances(5, "AAAA"), // 연극
      fetchAllUpcomingPerformances(5, "BBBC"), // 뮤지컬
    ]);

    const mapped = mapKopisListToPerformances([...theaterData, ...musicalData]);

    if (mapped.length > 0) {
      // 1-a. 이미 DB에 있는 kopis_id 목록 조회 (performances)
      const kopisIds = mapped.map((p) => p.id).filter(Boolean);

      const { data: existingPerfs } = await supabase
        .from("performances")
        .select("id, kopis_id")
        .in("kopis_id", kopisIds);

      const existingByKopisId = new Map(
        (existingPerfs ?? []).map((p) => [p.kopis_id as string, p.id as string])
      );

      // 1-b. 캠페인에 연결된 performances도 포함
      //      (campaign.kopis_id 는 있지만 performance.kopis_id 는 아직 null인 경우)
      const { data: linkedCampaigns } = await supabase
        .from("ticket_campaigns")
        .select("kopis_id, performance_id")
        .not("kopis_id", "is", null)
        .not("performance_id", "is", null);

      for (const c of linkedCampaigns ?? []) {
        if (c.kopis_id && c.performance_id && !existingByKopisId.has(c.kopis_id as string)) {
          existingByKopisId.set(c.kopis_id as string, c.performance_id as string);
        }
      }

      const toUpdate: Array<{ id: string; data: PerformanceUpdate }> = [];
      const toInsert: PerformanceInsert[] = [];

      for (const p of mapped) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw = p as any;
        const rowData: PerformanceUpdate = {
          slug: p.slug,
          title: p.title,
          kopis_id: p.id,
          category: raw.category ?? null,
          region: p.region ?? null,
          venue: p.venue ?? null,
          period_start: p.period_start ?? null,
          period_end: p.period_end ?? null,
          poster_url: p.poster_url ?? null,
          // ticket_link은 list API에 없으므로 기존 값 보존 (null로 덮어쓰지 않음)
          ...(p.ticket_link ? { ticket_link: p.ticket_link } : {}),
          status: "ongoing",
          source: "kopis",
          last_synced_at: syncedAt,
          sync_status: "synced",
          updated_at: syncedAt,
        };

        const existingId = existingByKopisId.get(p.id);
        if (existingId) {
          toUpdate.push({ id: existingId, data: rowData });
        } else {
          toInsert.push({ ...rowData, slug: p.slug, title: p.title } as PerformanceInsert);
        }
      }

      // 1-c. 기존 performances UPDATE
      let updateErrors = 0;
      for (const { id, data } of toUpdate) {
        const { error } = await supabase
          .from("performances")
          .update(data)
          .eq("id", id);
        if (error) {
          console.error(`[kopis-sync] update error (${data.kopis_id}):`, error);
          updateErrors++;
        }
      }

      // 1-d. 신규 performances INSERT
      let insertErrors = 0;
      if (toInsert.length > 0) {
        const { error } = await supabase
          .from("performances")
          .insert(toInsert);
        if (error) {
          console.error("[kopis-sync] insert error:", error);
          // 슬러그 충돌 등으로 전체 실패 시 한 건씩 재시도
          for (const row of toInsert) {
            const { error: singleErr } = await supabase
              .from("performances")
              .insert({ ...row, slug: `${row.slug ?? "perf"}-${row.kopis_id}` } as PerformanceInsert);
            if (singleErr) insertErrors++;
          }
        }
      }

      result.errors += updateErrors + insertErrors;
      result.listSynced = toUpdate.length + (toInsert.length - insertErrors);
      console.log(`[kopis-sync] ✅ 목록: ${toUpdate.length}건 업데이트, ${toInsert.length}건 신규, 오류 ${updateErrors + insertErrors}건`);
    }
  } catch (err) {
    console.error("[kopis-sync] 목록 수집 실패:", err);
    result.errors++;
  }

  // ─── 2단계: 상세 정보 미입력 공연 동기화 ────────────────────────
  // description IS NULL인 KOPIS 공연 30개씩 처리 (타임아웃 방지)
  // organization, description, cast, crew, runtime, age_limit, price,
  // schedule, ticket_link, poster_url 모두 업데이트
  try {
    const DETAIL_BATCH = 30;

    // 2-a. 캠페인 연결 공연 (승인된 것, 우선순위 높음)
    const { data: campaigns } = await supabase
      .from("ticket_campaigns")
      .select("kopis_id, performance_id")
      .not("kopis_id", "is", null)
      .not("performance_id", "is", null)
      .eq("status", "approved");

    const campaignPerfIds = new Set((campaigns ?? []).map((c) => c.performance_id as string));
    const campaignByPerfId = new Map(
      (campaigns ?? []).map((c) => [c.performance_id as string, c.kopis_id as string])
    );

    // 2-b. description이 null인 KOPIS 공연 (배치 제한)
    const { data: nullDescPerfs } = await supabase
      .from("performances")
      .select("id, kopis_id")
      .not("kopis_id", "is", null)
      .is("description", null)
      .limit(DETAIL_BATCH);

    // 캠페인 공연 + null-description 공연 합산 (중복 제거)
    const toDetailSync = new Map<string, string>(); // performanceId → kopisId

    for (const c of campaigns ?? []) {
      if (c.performance_id && c.kopis_id) {
        toDetailSync.set(c.performance_id as string, c.kopis_id as string);
      }
    }
    for (const p of nullDescPerfs ?? []) {
      if (!toDetailSync.has(p.id as string)) {
        toDetailSync.set(p.id as string, p.kopis_id as string);
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
            organization: mapped.organization ?? null,
            description: mapped.description ?? null,
            synopsis: mapped.description ?? null,
            cast_info: mapped.cast ?? null,
            crew_info: mapped.crew ?? null,
            runtime_text: mapped.runtime ?? null,
            age_limit: mapped.age_limit ?? null,
            price_info: mapped.price ?? null,
            schedule_info: mapped.schedule ?? null,
            ...(mapped.ticket_link ? { ticket_link: mapped.ticket_link } : {}),
            ...(mapped.poster_url ? { poster_url: mapped.poster_url } : {}),
            last_synced_at: syncedAt,
            sync_status: "synced",
            source: "kopis",
            updated_at: syncedAt,
          })
          .eq("id", performanceId);

        if (error) {
          console.error(`[kopis-sync] 상세 업데이트 오류 (${kopisId}):`, error);
          result.errors++;
        } else {
          result.detailSynced++;
          if (campaignPerfIds.has(performanceId)) {
            console.log(`[kopis-sync] ✅ 캠페인 상세: ${mapped.title} (${kopisId})`);
          }
        }
      } catch (err) {
        console.error(`[kopis-sync] 상세 수집 실패 (${kopisId}):`, err);
        result.errors++;
      }
    }

    console.log(`[kopis-sync] ✅ 상세: ${result.detailSynced}건 완료 (캠페인 ${campaignByPerfId.size}건 포함)`);
  } catch (err) {
    console.error("[kopis-sync] 상세 동기화 단계 실패:", err);
    result.errors++;
  }

  return NextResponse.json({
    ok: true,
    synced_at: syncedAt,
    list_synced: result.listSynced,
    detail_synced: result.detailSynced,
    errors: result.errors,
  });
}

// Vercel Cron은 GET을 사용 — 내부적으로 POST와 동일 처리
export { POST as GET };
