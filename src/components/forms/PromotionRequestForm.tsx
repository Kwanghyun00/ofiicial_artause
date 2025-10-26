"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PromotionRequestState } from "@/app/request/promotion/actions";
import { submitPromotionRequestAction } from "@/app/request/promotion/actions";

type InquiryType = "invitation" | "promotion";

type InquiryOption = {
  value: InquiryType;
  title: string;
  description: string;
};

const inquiryOptions: InquiryOption[] = [
  {
    value: "invitation",
    title: "초대권 문의",
    description: "프리뷰 · 프레스 회차 추첨과 DM·체크인 자동화가 필요한 경우 선택해 주세요.",
  },
  {
    value: "promotion",
    title: "홍보 문의",
    description: "런칭/시즌 캠페인, 채널 믹스, 예산 운영 컨설팅이 필요한 경우 선택해 주세요.",
  },
];

const initialState: PromotionRequestState = {
  status: "idle",
};

export function PromotionRequestForm({ defaultInquiryType = "invitation" }: { defaultInquiryType?: InquiryType }) {
  const [state, formAction] = useActionState(submitPromotionRequestAction, initialState);

  return (
    <form action={formAction} className="card space-y-6 p-8 md:p-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">초대권 · 홍보 문의 등록</h2>
        <p className="text-sm text-slate-600">
          24시간 이내 담당 매니저가 메일 또는 전화로 회신합니다. 문의 유형과 공연 정보를 알려주시면 더 정확한 제안을
          준비할 수 있어요.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-slate-800">문의 유형</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {inquiryOptions.map((option) => (
            <label
              key={option.value}
              className="flex gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 transition hover:border-indigo-200 hover:shadow"
            >
              <input
                type="radio"
                name="inquiryType"
                value={option.value}
                defaultChecked={defaultInquiryType === option.value}
                required
                className="mt-1 h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="font-medium text-slate-900">{option.title}</span>
                <span className="mt-1 block text-xs text-slate-500">{option.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Fieldset legend="조직과 담당자 정보">
        <InputField name="organizationName" label="기관/단체명" required placeholder="예) 아르타우스 기획" />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField name="contactName" label="담당자 이름" required />
          <InputField name="contactPhone" label="연락처" required placeholder="010-0000-0000" />
        </div>
        <InputField name="contactEmail" type="email" label="이메일" required placeholder="예: contact@artause.kr" />
      </Fieldset>

      <Fieldset legend="공연 기본 정보">
        <InputField name="performanceTitle" label="공연명" required />
        <div className="grid gap-4 md:grid-cols-2">
          <InputField name="performanceCategory" label="장르" placeholder="연극 / 뮤지컬 / 국악 등" />
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
          placeholder="작품 콘셉트, 주요 출연진, 타깃 관객 등을 간단히 알려주세요."
        />
      </Fieldset>

      <Fieldset legend="희망 캠페인 정보">
        <TextareaField
          name="marketingGoals"
          label="목표"
          placeholder="예) 프리뷰 초대권 30석 모집 / SNS 팔로워 1만 타깃 유입"
          rows={3}
        />
        <CheckboxGroup
          name="marketingChannels"
          label="관심 채널"
          options={[
            { value: "spotlight", label: "아르타우스 스포트라이트" },
            { value: "ticket-news", label: "티켓 뉴스 & 뉴스레터" },
            { value: "sns", label: "SNS 운영" },
            { value: "press", label: "PR/미디어" },
            { value: "collaboration", label: "콜라보/브랜드 제휴" },
          ]}
        />
        <InputField name="assetsUrl" label="자료 링크" placeholder="포스터, 트레일러 등 공유 링크" />
        <TextareaField
          name="additionalNotes"
          label="추가 요청 사항"
          rows={3}
          placeholder="희망 일정, 예산 범위, 기존 진행 현황 등을 입력해 주세요."
        />
      </Fieldset>

      {state.status === "error" && state.message ? <p className="form-error">{state.message}</p> : null}
      {state.status === "success" && state.message ? <p className="text-sm text-indigo-600">{state.message}</p> : null}

      <SubmitButton />
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
      {pending ? "제출 중..." : "문의 보내기"}
    </button>
  );
}
