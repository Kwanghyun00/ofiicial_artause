"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { PromotionRequestState } from "@/app/request/promotion/actions";
import { submitPromotionRequestAction } from "@/app/request/promotion/actions";

const initialState: PromotionRequestState = {
  status: "idle",
};

export function PromotionRequestForm() {
  const [state, formAction] = useFormState(submitPromotionRequestAction, initialState);

  return (
    <form action={formAction} className="card space-y-6 p-8 md:p-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">프로모션 / 초대 캠페인 요청</h2>
        <p className="text-sm text-slate-600">
          아래 정보를 입력해 주시면 24시간 이내 담당자가 자료를 검토하고 맞춤 제안을 드립니다.
        </p>
      </div>

      <Fieldset legend="단체 및 담당자 정보">
        <InputField name="organizationName" label="단체명" required placeholder="예) 아르타우스 기획" />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField name="contactName" label="담당자 이름" required />
          <InputField name="contactPhone" label="연락처" required placeholder="010-0000-0000" />
        </div>
        <InputField name="contactEmail" type="email" label="이메일" required placeholder="예: contact@artause.kr" />
      </Fieldset>

      <Fieldset legend="공연 기본 정보">
        <InputField name="performanceTitle" label="공연명" required />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField name="performanceCategory" label="장르" placeholder="연극 / 콘서트 / 댄스 등" />
          <InputField name="performanceRegion" label="지역" placeholder="서울 / 부산 등" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField name="performanceDates" label="공연 일정" placeholder="2025.10.01 ~ 2025.10.20" />
          <InputField name="performanceVenue" label="공연장" />
        </div>
        <TextareaField
          name="performanceSynopsis"
          label="공연 소개"
          rows={4}
          placeholder="줄거리, 아티스트, 관람 포인트 등을 입력해 주세요."
        />
      </Fieldset>

      <Fieldset legend="캠페인 목표와 요청사항">
        <TextareaField
          name="marketingGoals"
          label="캠페인 목표"
          placeholder="예) 2030 관객 2,000명 도달 / 티켓 전환 150건"
          rows={3}
        />
        <CheckboxGroup
          name="marketingChannels"
          label="희망 채널"
          options={[
            { value: "spotlight", label: "Artause 스포트라이트" },
            { value: "ticket-news", label: "티켓 뉴스 & 큐레이션" },
            { value: "sns", label: "SNS 채널 프로모션" },
            { value: "press", label: "프레스/미디어" },
            { value: "collaboration", label: "콜라보레이션/굿즈" },
          ]}
        />
        <InputField name="assetsUrl" label="자료 공유 링크" placeholder="공유 드라이브, 영상, 이미지 등" />
        <TextareaField
          name="additionalNotes"
          label="추가 요청 사항"
          rows={3}
          placeholder="예) 우선순위 일정, 예산 범위, 내부 승인 절차 등"
        />
      </Fieldset>

      {state.status === "error" && state.message ? <p className="form-error">{state.message}</p> : null}
      {state.status === "success" && state.message ? <p className="text-sm text-indigo-600">{state.message}</p> : null}

      <SubmitButton />
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
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

type CheckboxOption = {
  value: string;
  label: string;
};

function CheckboxGroup({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: CheckboxOption[];
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
          >
            <input type="checkbox" name={name} value={option.value} className="h-4 w-4" />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full md:w-auto" disabled={pending}>
      {pending ? "전송 중..." : "문의 제출하기"}
    </button>
  );
}
