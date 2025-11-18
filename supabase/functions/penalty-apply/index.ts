/**
 * Edge Function: penalty-apply
 *
 * 목적: 노쇼, 취소 등의 패널티를 사용자에게 부여하고 신뢰도 점수를 차감
 *
 * 트리거: 파트너가 노쇼 처리 버튼 클릭
 *
 * 입력:
 * {
 *   "entry_id": "uuid",
 *   "penalty_type": "no_show" | "late_cancel" | "rule_violation",
 *   "points": 20,
 *   "reason": "공연 당일 미출석"
 * }
 *
 * 출력:
 * {
 *   "success": true,
 *   "penalty_id": "uuid",
 *   "new_trust_score": 80,
 *   "is_restricted": false
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PenaltyRequest {
  entry_id: string;
  penalty_type: 'no_show' | 'late_cancel' | 'rule_violation';
  points?: number;
  reason?: string;
}

interface PenaltyResponse {
  success: boolean;
  penalty_id?: string;
  new_trust_score?: number;
  is_restricted?: boolean;
  error?: string;
}

// 패널티 유형별 기본 점수
const DEFAULT_PENALTY_POINTS = {
  no_show: 20,
  late_cancel: 10,
  rule_violation: 15,
};

serve(async (req) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 요청 본문 파싱
    const requestBody: PenaltyRequest = await req.json();
    const { entry_id, penalty_type, points, reason } = requestBody;

    // 입력 검증
    if (!entry_id || !penalty_type) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'entry_id와 penalty_type은 필수입니다.',
        } as PenaltyResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. entry 정보 조회
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('id, user_id, campaign_id, attendance_status')
      .eq('id', entry_id)
      .single();

    if (entryError || !entry) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '응모 정보를 찾을 수 없습니다.',
        } as PenaltyResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. 패널티 점수 결정
    const penaltyPoints = points ?? DEFAULT_PENALTY_POINTS[penalty_type];

    // 3. user_penalties 레코드 생성
    const { data: penalty, error: penaltyError } = await supabase
      .from('user_penalties')
      .insert({
        user_id: entry.user_id,
        entry_id: entry.id,
        campaign_id: entry.campaign_id,
        penalty_type,
        points: penaltyPoints,
        reason: reason || `${penalty_type} 패널티`,
      })
      .select()
      .single();

    if (penaltyError) {
      console.error('패널티 생성 오류:', penaltyError);
      return new Response(
        JSON.stringify({
          success: false,
          error: '패널티를 부여할 수 없습니다.',
        } as PenaltyResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. 신뢰도 점수 재계산 (DB 함수 호출)
    const { data: recalcResult, error: recalcError } = await supabase.rpc(
      'recalculate_trust_score',
      { target_user_id: entry.user_id }
    );

    if (recalcError) {
      console.error('신뢰도 점수 재계산 오류:', recalcError);
    }

    const newTrustScore = recalcResult ?? 0;

    // 5. 사용자 정보 조회 (제한 여부 확인)
    const { data: user } = await supabase
      .from('users')
      .select('trust_score, is_restricted')
      .eq('id', entry.user_id)
      .single();

    // 6. entries 테이블 업데이트 (attendance_status)
    if (penalty_type === 'no_show') {
      await supabase
        .from('entries')
        .update({ attendance_status: 'no_show' })
        .eq('id', entry_id);
    }

    // 7. 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        penalty_id: penalty.id,
        new_trust_score: user?.trust_score ?? newTrustScore,
        is_restricted: user?.is_restricted ?? false,
      } as PenaltyResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('패널티 부여 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
      } as PenaltyResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
