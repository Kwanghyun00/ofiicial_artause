import { NextResponse } from 'next/server';
import { isKopisConfigured, fetchRecentPerformances, mapKopisListToPerformances } from '@/lib/kopis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    env: {
      KOPIS_SERVICE_KEY: process.env.KOPIS_SERVICE_KEY ? 'SET (length: ' + process.env.KOPIS_SERVICE_KEY.length + ')' : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      isKopisConfigured: isKopisConfigured(),
    },
  };

  // KOPIS API 전체 파이프라인 테스트
  if (isKopisConfigured()) {
    try {
      // 1. API 호출
      results.step1_fetch = { status: 'starting...' };
      const kopisData = await fetchRecentPerformances(5);
      results.step1_fetch = {
        status: 'success',
        count: kopisData.length,
        sample: kopisData.slice(0, 2),
      };

      // 2. 매핑
      results.step2_map = { status: 'starting...' };
      const mapped = mapKopisListToPerformances(kopisData);
      results.step2_map = {
        status: 'success',
        count: mapped.length,
        sample: mapped.slice(0, 2),
      };
    } catch (error: any) {
      results.error = {
        message: error.message,
        stack: error.stack,
      };
    }
  } else {
    results.skip = 'KOPIS not configured';
  }

  return NextResponse.json(results, { status: 200 });
}
