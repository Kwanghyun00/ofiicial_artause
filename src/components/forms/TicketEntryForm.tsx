"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitTicketEntryAction } from "@/app/events/tickets/[slug]/actions";
import { ticketEntryInitialState } from "@/app/events/tickets/[slug]/form-state";

interface TicketEntryFormProps {
  campaignId: string;
  slug: string;
  campaignTitle: string;
  performanceTitle?: string;
}

export function TicketEntryForm({ campaignId, slug, campaignTitle, performanceTitle }: TicketEntryFormProps) {
  const [state, formAction] = useActionState(submitTicketEntryAction, ticketEntryInitialState);
  const headline = performanceTitle ? `${campaignTitle} · ${performanceTitle}` : campaignTitle;

  return (
    <form action={formAction} className="card space-y-6 p-8 md:p-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">응모 신청</h2>
        <p className="text-sm text-slate-600">
          카카오 로그인 사용자를 대상으로만 응모를 접수합니다. Intro-first와 AdGate 조건을 통과한 이후 24시간 이내에 제출해 주세요.
        </p>
        <p className="text-sm font-medium text-slate-500">{headline}</p>
      </div>

      <input type="hidden" name="campaignId" value={campaignId} />
      <input type="hidden" name="slug" value={slug} />

      <Fieldset legend="신청자 정보">
        <InputField name="applicantName" label="이름" required />
        <InputField name="applicantEmail" type="email" label="이메일" required placeholder="예: example@artause.com" />
        <InputField name="applicantPhone" label="연락처" placeholder="010-0000-0000" />
      </Fieldset>

      <Fieldset legend="추천 및 확인">
        <InputField name="instagramHandle" label="Instagram 계정" placeholder="@artause" />
        <InputField name="referralCode" label="추천 코드" placeholder="예: KYUNG123" />
      </Fieldset>

      <Fieldset legend="추가 메모">
        <TextareaField
          name="memo"
          label="메모"
          placeholder="함께 방문 예정인 동반자, 원하는 날짜, 배려가 필요한 사항 등을 적어주세요."
          rows={4}
        />
      </Fieldset>

      <label className="flex items-start gap-3 rounded-2xl bg-surface-200/60 p-4 text-sm text-slate-600">
        <input type="checkbox" name="consentMarketing" className="mt-1" />
        <span>아트하우스의 추첨 결과 및 관련 알림을 이메일·SMS로 받겠습니다.</span>
      </label>

      {state.status === "error" && state.message ? <p className="form-error">{state.message}</p> : null}
      {state.status === "success" && state.message ? <p className="text-sm text-indigo-600">{state.message}</p> : null}

      <SubmitButton disabled={state.status === "success"} />
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-800">{legend}</legend>
      {children}
    </fieldset>
  );
}

function InputField({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span>
        {label}
        {required ? <span className="ml-1 text-orange-500">*</span> : null}
      </span>
      <input name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

function TextareaField({
  label,
  name,
  rows = 4,
  placeholder,
}: {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-2">
      <span>{label}</span>
      <textarea name={name} rows={rows} placeholder={placeholder} />
    </label>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full md:w-auto" disabled={pending || disabled}>
      {pending ? "제출 중..." : "응모 완료"}
    </button>
  );
}
