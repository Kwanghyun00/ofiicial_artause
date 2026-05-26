"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Instagram, Loader2 } from "lucide-react";
import { submitTicketEntryAction } from "@/app/events/tickets/[slug]/actions";
import { ticketEntryInitialState } from "@/app/events/tickets/[slug]/form-state";
import { trackEntrySubmit } from "@/lib/analytics";

interface TicketEntryFormProps {
  campaignId: string;
  slug: string;
  campaignTitle: string;
  performanceTitle?: string;
  availableDates?: string[] | null;
}

export function TicketEntryForm({
  campaignId,
  slug,
  campaignTitle,
  performanceTitle,
  availableDates,
}: TicketEntryFormProps) {
  const [state, formAction] = useActionState(submitTicketEntryAction, ticketEntryInitialState);
  const trackedStatusRef = useRef<string>("idle");

  useEffect(() => {
    if (state.status === trackedStatusRef.current) return;
    if (state.status === "success") {
      trackEntrySubmit("success", { campaign_id: campaignId, slug });
      trackedStatusRef.current = "success";
    } else if (state.status === "error") {
      trackEntrySubmit("error", { campaign_id: campaignId, slug, error_message: state.message });
      trackedStatusRef.current = "error";
    }
  }, [state.status, state.message, campaignId, slug]);

  const handleSubmit = () => {
    trackEntrySubmit("attempt", { campaign_id: campaignId, slug });
  };

  /* 응모 성공 상태 */
  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-foreground">응모 완료!</p>
          <p className="text-sm text-muted-foreground">
            {state.message ?? "선정 결과는 이메일로 안내드립니다."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-0">
      {/* 폼 헤더 */}
      <div className="border-b border-border/60 px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold text-foreground">
          {performanceTitle ? `${campaignTitle} · ${performanceTitle}` : campaignTitle}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          모든 정보를 정확히 입력해 주세요. 선정 결과는 이메일로 안내드립니다.
        </p>
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6">
        <input type="hidden" name="campaignId" value={campaignId} />
        <input type="hidden" name="slug" value={slug} />

        {/* 섹션: 기본 정보 */}
        <fieldset className="space-y-3">
          <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            기본 정보
            <span className="text-destructive">*필수</span>
          </legend>
          <Field label="성명" name="applicantName" required placeholder="홍길동" />
          <Field label="이메일" name="applicantEmail" type="email" required placeholder="example@email.com" />
          <Field label="전화번호" name="applicantPhone" type="tel" required placeholder="010-1234-5678" />
        </fieldset>

        {/* 구분선 */}
        <div className="h-px bg-border/50" />

        {/* 섹션: SNS 정보 */}
        <fieldset className="space-y-3">
          <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            SNS 정보
            <span className="text-destructive">*필수</span>
          </legend>

          {/* 팔로우 안내 */}
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
            <Instagram className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              <span className="font-bold text-primary">@artause_official</span>을 팔로우하고 응모해 주세요.
              최신 초대권 이벤트 소식을 가장 먼저 받아보실 수 있습니다.
            </p>
          </div>

          <Field
            label="인스타그램 아이디"
            name="instagramHandle"
            required
            placeholder="@yourhandle"
          />
          <Field
            label="후기를 남길 SNS 주소"
            name="reviewUrl"
            type="url"
            hint="공연 관람 후 후기를 남길 인스타그램, 블로그 등 주소 (선택)"
            placeholder="https://instagram.com/yourhandle"
          />
        </fieldset>

        {/* 구분선 */}
        <div className="h-px bg-border/50" />

        {/* 섹션: 티켓 정보 */}
        <fieldset className="space-y-3">
          <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            티켓 정보
            <span className="text-destructive">*필수</span>
          </legend>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">
              희망 관람일자 <span className="text-destructive">*</span>
            </p>
            {availableDates && availableDates.length > 0 ? (
              <DateToggleField name="preferredDate" dates={availableDates} />
            ) : (
              <input
                type="date"
                name="preferredDate"
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              관람권 선택 <span className="text-destructive">*</span>
            </label>
            <select
              name="ticketCount"
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">선택하세요</option>
              <option value="1">일반 관람권 1매</option>
              <option value="2">일반 관람권 2매</option>
            </select>
            <p className="text-[11px] text-muted-foreground">초대권은 1매 또는 2매로만 선택 가능합니다.</p>
          </div>
        </fieldset>

        {/* 구분선 */}
        <div className="h-px bg-border/50" />

        {/* 섹션: 기대평 */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            기대평 <span className="font-normal normal-case tracking-normal text-muted-foreground/50">(선택)</span>
          </legend>
          <TextareaField
            label="공연에 대한 기대평"
            name="expectation"
            rows={3}
            placeholder="이 공연에 대해 기대하는 점이나 관람 동기를 자유롭게 작성해주세요."
          />
        </fieldset>

        {/* 구분선 */}
        <div className="h-px bg-border/50" />

        {/* 섹션: 약관 동의 */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            약관 동의
          </legend>

          {/* 필수 약관 */}
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="rulesAgreed"
                required
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <div className="flex-1 space-y-1.5">
                <span className="text-sm font-semibold text-foreground">
                  이용 규칙에 동의합니다. <span className="text-destructive">*</span>
                </span>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>· 노쇼 발생 시 신뢰도 점수 차감 및 응모 제한</li>
                  <li>· 공연 3일 전부터 취소 불가</li>
                  <li>· 규칙 위반 시 패널티 부과</li>
                </ul>
                <a
                  href="/rules"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  전체 이용 규칙 보기 →
                </a>
              </div>
            </label>
          </div>

          {/* 선택 약관 */}
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="consentMarketing"
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  이벤트 안내 이메일 수신 동의 (선택)
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  이벤트 운영 외 다른 목적으로 사용하지 않으며, 언제든 수신 거부할 수 있습니다.
                </p>
              </div>
            </label>
          </div>
        </fieldset>

        {/* 에러 메시지 */}
        {state.status === "error" && state.message && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.message}
          </p>
        )}

        {/* 제출 버튼 */}
        <SubmitButton />
      </div>
    </form>
  );
}

/* ── 재사용 필드 컴포넌트 ── */

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function TextareaField({
  label,
  name,
  placeholder,
  rows = 3,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}

function DateToggleField({ name, dates }: { name: string; dates: string[] }) {
  const [selected, setSelected] = useState<string>("");

  const formatSlot = (slot: string) => {
    const spaceIdx = slot.indexOf(" ");
    const datePart = spaceIdx > -1 ? slot.slice(0, spaceIdx) : slot;
    const timePart = spaceIdx > -1 ? slot.slice(spaceIdx + 1) : null;
    const [y, m, d] = datePart.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const dateStr = dt.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
    return timePart ? `${dateStr} ${timePart}` : dateStr;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {dates.map((slot) => {
          const isSelected = selected === slot;
          return (
            <button
              key={slot}
              type="button"
              onClick={() => setSelected(isSelected ? "" : slot)}
              className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              {formatSlot(slot)}
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={selected} />
      {!selected && (
        <p className="text-[11px] text-muted-foreground">관람 희망 날짜를 선택해 주세요.</p>
      )}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-stage transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          전송 중...
        </span>
      ) : (
        "이벤트 응모하기 ✦"
      )}
    </button>
  );
}
