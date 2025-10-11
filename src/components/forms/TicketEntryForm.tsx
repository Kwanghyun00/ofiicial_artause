"use client";

import type { ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitTicketEntryAction, ticketEntryInitialState } from "@/app/events/tickets/[slug]/actions";

interface TicketEntryFormProps {
  campaignId: string;
  slug: string;
  campaignTitle: string;
  performanceTitle?: string;
}

export function TicketEntryForm({ campaignId, slug, campaignTitle, performanceTitle }: TicketEntryFormProps) {
  const [state, formAction] = useFormState(submitTicketEntryAction, ticketEntryInitialState);
  const headline = performanceTitle ? `${campaignTitle} × ${performanceTitle}` : campaignTitle;

  return (
    <form action={formAction} className="card space-y-6 p-8 md:p-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">초대 응모하기</h2>
        <p className="text-sm text-slate-600">
          연락처와 간단한 메모를 남겨 주세요. 운영팀이 24시간 이내에 응모 내역을 검토하고 당첨 여부와 체크인 안내를 전달해 드립니다.
        </p>
        <p className="text-sm font-medium text-slate-500">{headline}</p>
      </div>

      <input type="hidden" name="campaignId" value={campaignId} />
      <input type="hidden" name="slug" value={slug} />

      <Fieldset legend="연락처">
        <InputField name="applicantName" label="이름" required />
        <InputField name="applicantEmail" type="email" label="이메일" required placeholder="예: example@artause.com" />
        <InputField name="applicantPhone" label="휴대폰" placeholder="010-0000-0000" />
      </Fieldset>

      <Fieldset legend="추가 전달 사항">
        <TextareaField
          name="memo"
          label="메모"
          placeholder="함께 갈 친구, 선호하는 좌석, 소개하고 싶은 SNS 링크 등을 자유롭게 입력해 주세요."
          rows={4}
        />
      </Fieldset>

      <label className="flex items-start gap-3 rounded-2xl bg-surface-200/60 p-4 text-sm text-slate-600">
        <input type="checkbox" name="consentMarketing" className="mt-1" />
        <span>Artause의 초대 이벤트와 관련 소식을 이메일·SMS로 받는 데 동의합니다.</span>
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
      {pending ? "전송 중..." : "응모 제출"}
    </button>
  );
}
