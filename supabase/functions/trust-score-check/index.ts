/**
 * Edge Function: trust-score-check
 *
 * 목적: 사용자의 응모 자격을 확인 (신뢰도 점수, 제한 여부, 활성 패널티 등)
 *
 * 트리거: 응모 폼 제출 전
 *
 * 입력:
 * {
 *   "user_id": "uuid"
 * }
 *
 * 출력:
 * {
 *   "can_apply": true,
 *   "trust_score": 95,
 *   "is_restricted": false,
 *   "active_penalties_count": 0,
 *   "restriction_reason": null
 * }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrustScoreRequest {
  user_id: string;
}

interface TrustScoreResponse {
  can_apply: boolean;
  trust_score: number;
  is_restricted: boolean;
  active_penalties_count: number;
  restriction_reason: string | null;
  penalties?: Array<{
    penalty_type: string;
    points: number;
    reason: string;
    expires_at: string;
  }>;
}

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
    const requestBody: TrustScoreRequest = await req.json();
    const { user_id } = requestBody;

    // 입력 검증
    if (!user_id) {
      return new Response(
        JSON.stringify({
          can_apply: false,
          trust_score: 0,
          is_restricted: true,
          active_penalties_count: 0,
          restriction_reason: 'user_id가 필요합니다.',
        } as TrustScoreResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 1. 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('trust_score, is_restricted, restriction_reason')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          can_apply: false,
          trust_score: 0,
          is_restricted: true,
          active_penalties_count: 0,
          restriction_reason: '사용자를 찾을 수 없습니다.',
        } as TrustScoreResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. 활성 패널티 조회 (만료되지 않은 패널티)
    const { data: penalties, error: penaltiesError } = await supabase
      .from('user_penalties')
      .select('penalty_type, points, reason, expires_at')
      .eq('user_id', user_id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (penaltiesError) {
      console.error('패널티 조회 오류:', penaltiesError);
    }

    const activePenaltiesCount = penalties?.length ?? 0;

    // 3. 응모 가능 여부 판단
    const canApply = !user.is_restricted && user.trust_score >= 60 && activePenaltiesCount < 3;

    // 4. 제한 사유 결정
    let restrictionReason = user.restriction_reason;
    if (!canApply && !restrictionReason) {
      if (user.is_restricted) {
        restrictionReason = '신뢰도 점수가 낮아 응모가 제한되었습니다.';
      } else if (user.trust_score < 60) {
        restrictionReason = `신뢰도 점수가 60점 미만입니다. (현재: ${user.trust_score}점)`;
      } else if (activePenaltiesCount >= 3) {
        restrictionReason = `활성 패널티가 너무 많습니다. (${activePenaltiesCount}건)`;
      }
    }

    // 5. 성공 응답
    return new Response(
      JSON.stringify({
        can_apply: canApply,
        trust_score: user.trust_score,
        is_restricted: user.is_restricted,
        active_penalties_count: activePenaltiesCount,
        restriction_reason: restrictionReason,
        penalties: penalties || [],
      } as TrustScoreResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('신뢰도 점수 확인 오류:', error);
    return new Response(
      JSON.stringify({
        can_apply: false,
        trust_score: 0,
        is_restricted: true,
        active_penalties_count: 0,
        restriction_reason: error instanceof Error ? error.message : '알 수 없는 오류',
      } as TrustScoreResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
