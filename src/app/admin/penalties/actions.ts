"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export interface ApplyPenaltyFormState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function applyPenaltyByEmail(
  _prevState: ApplyPenaltyFormState,
  formData: FormData,
): Promise<ApplyPenaltyFormState> {
  const email = formData.get("email");
  const penaltyType = formData.get("penaltyType");
  const points = formData.get("points");
  const reason = formData.get("reason");

  // 기본 검증
  if (typeof email !== "string" || !email.trim()) {
    return { status: "error", message: "이메일을 입력해 주세요." };
  }
  if (typeof penaltyType !== "string" || !penaltyType) {
    return { status: "error", message: "패널티 유형을 선택해 주세요." };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 패널티 점수 결정
  const defaultPoints: Record<string, number> = {
    no_show: 20,
    late_cancel: 10,
    rule_violation: 15,
  };

  const penaltyPoints =
    typeof points === "string" && points.trim()
      ? parseInt(points, 10)
      : defaultPoints[penaltyType] || 10;

  if (isNaN(penaltyPoints) || penaltyPoints <= 0) {
    return { status: "error", message: "유효한 점수를 입력해 주세요." };
  }

  if (!isSupabaseConfigured) {
    console.log("Mock mode - 패널티 부여:", {
      email: normalizedEmail,
      penaltyType,
      points: penaltyPoints,
      reason,
    });
    return {
      status: "success",
      message: `[Mock] ${normalizedEmail}에게 패널티 부여됨 (${penaltyType}, -${penaltyPoints}점)`,
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 1. 사용자 조회 또는 생성
    let userId: string;

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, trust_score, is_restricted")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // 신규 사용자 생성 (기본값: trust_score=100, role=member)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: newUser, error: createError } = await (supabase as any)
        .from("users")
        .insert({
          email: normalizedEmail,
          role: "member",
          trust_score: 100,
          is_restricted: false,
        })
        .select("id")
        .single();

      if (createError || !newUser) {
        console.error("사용자 생성 오류:", createError);
        return { status: "error", message: "사용자 생성에 실패했습니다." };
      }

      userId = newUser.id;
    }

    // 2. 패널티 레코드 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: penaltyError } = await (supabase as any)
      .from("user_penalties")
      .insert({
        user_id: userId,
        penalty_type: penaltyType,
        points: penaltyPoints,
        reason: typeof reason === "string" && reason.trim() ? reason.trim() : null,
        expires_at: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6개월 후
      });

    if (penaltyError) {
      console.error("패널티 생성 오류:", penaltyError);
      return { status: "error", message: "패널티 부여에 실패했습니다." };
    }

    // 3. 신뢰도 점수 재계산 (트리거가 자동으로 수행하지만 명시적 호출도 가능)
    // DB 트리거가 recalculate_trust_score()를 자동 호출함

    revalidatePath("/admin/penalties");

    return {
      status: "success",
      message: `${normalizedEmail}에게 패널티가 부여되었습니다. (${penaltyType}, -${penaltyPoints}점)`,
    };
  } catch (error) {
    console.error("applyPenaltyByEmail error:", error);
    return { status: "error", message: "일시적인 문제가 발생했습니다. 다시 시도해 주세요." };
  }
}
