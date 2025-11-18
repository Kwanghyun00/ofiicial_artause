"use client";

import { useActionState } from "react";
import { MultiStepForm, FormStep } from "./MultiStepForm";
import { submitTicketEntryAction } from "@/app/events/tickets/[slug]/actions";
import { ticketEntryInitialState } from "@/app/events/tickets/[slug]/form-state";

interface TicketEntryFormStepsProps {
  campaignId: string;
  slug: string;
  campaignTitle: string;
  performanceTitle?: string;
}

export function TicketEntryFormSteps({
  campaignId,
  slug,
  campaignTitle,
  performanceTitle,
}: TicketEntryFormStepsProps) {
  const [state, formAction] = useActionState(submitTicketEntryAction, ticketEntryInitialState);
  const headline = performanceTitle ? `${campaignTitle} · ${performanceTitle}` : campaignTitle;

  /**
   * 폼 단계별 검증 함수
   */
  const validateBasicInfo = () => {
    const name = (document.querySelector('[name="applicantName"]') as HTMLInputElement)?.value;
    const email = (document.querySelector('[name="applicantEmail"]') as HTMLInputElement)?.value;
    const phone = (document.querySelector('[name="applicantPhone"]') as HTMLInputElement)?.value;

    if (!name || !email || !phone) {
      alert("모든 필수 항목을 입력해주세요.");
      return false;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 주소를 입력해주세요.");
      return false;
    }

    return true;
  };

  const validateSNSInfo = () => {
    const instagram = (document.querySelector('[name="instagramHandle"]') as HTMLInputElement)?.value;
    const reviewUrl = (document.querySelector('[name="reviewUrl"]') as HTMLInputElement)?.value;

    if (!instagram || !reviewUrl) {
      alert("인스타그램 아이디와 SNS 주소를 모두 입력해주세요.");
      return false;
    }

    return true;
  };

  const validateTicketInfo = () => {
    const date = (document.querySelector('[name="preferredDate"]') as HTMLInputElement)?.value;
    const count = (document.querySelector('[name="ticketCount"]') as HTMLSelectElement)?.value;

    if (!date || !count) {
      alert("희망 관람일자와 매수를 선택해주세요.");
      return false;
    }

    return true;
  };

  const validateTerms = () => {
    const rulesAgreed = (document.querySelector('[name="rulesAgreed"]') as HTMLInputElement)?.checked;

    if (!rulesAgreed) {
      alert("이용 규칙에 동의해주세요.");
      return false;
    }

    return true;
  };

  /**
   * 폼 단계 정의
   */
  const steps: FormStep[] = [
    // Step 1: 기본 정보
    {
      title: "기본 정보",
      description: "성명, 이메일, 전화번호를 입력해주세요",
      icon: "📋",
      validate: validateBasicInfo,
      content: (
        <div className="space-y-4">
          <InputField label="성명" name="applicantName" required placeholder="홍길동" />
          <InputField
            label="이메일"
            name="applicantEmail"
            type="email"
            required
            placeholder="example@email.com"
          />
          <InputField
            label="전화번호"
            name="applicantPhone"
            type="tel"
            required
            placeholder="010-1234-5678"
          />
        </div>
      ),
    },

    // Step 2: SNS 정보
    {
      title: "SNS 정보",
      description: "인스타그램 팔로우 후 계정 정보를 입력해주세요",
      icon: "📱",
      validate: validateSNSInfo,
      content: (
        <div className="space-y-4">
          {/* 인스타그램 팔로우 안내 */}
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">✨</span>
              <div className="flex-1">
                <p className="mb-2 font-bold text-purple-900">
                  📸 @artause_official 팔로우 필수!
                </p>
                <p className="text-sm text-purple-800">
                  인스타그램에서 <strong className="font-bold">@artause_official</strong>을
                  팔로우하고 응모해주세요. 최신 공연 및 전시 초대권 이벤트 소식을 가장 먼저
                  받아보실 수 있습니다.
                </p>
              </div>
            </div>
          </div>

          <InputField
            label="인스타그램 아이디"
            name="instagramHandle"
            required
            placeholder="@yourhandle"
          />
          <div>
            <InputField
              label="후기를 남길 SNS 주소"
              name="reviewUrl"
              type="url"
              required
              placeholder="https://instagram.com/yourhandle 또는 블로그 주소"
            />
            <p className="mt-1 text-xs text-slate-500">
              공연 관람 후 후기를 남길 인스타그램, 블로그, 또는 기타 SNS 주소를 입력해주세요.
            </p>
          </div>
        </div>
      ),
    },

    // Step 3: 티켓 정보
    {
      title: "티켓 정보",
      description: "희망 관람일자와 매수를 선택해주세요",
      icon: "🎫",
      validate: validateTicketInfo,
      content: (
        <div className="space-y-4">
          <InputField label="희망 관람일자" name="preferredDate" type="date" required />
          <div>
            <label className="block space-y-2 text-sm text-slate-700">
              <span>
                매수
                <span className="ml-1 text-rose-500">*</span>
              </span>
              <select
                name="ticketCount"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
              >
                <option value="">선택하세요</option>
                <option value="1">1매</option>
                <option value="2">2매</option>
              </select>
            </label>
            <p className="mt-1 text-xs text-slate-500">최대 2매까지 신청 가능합니다.</p>
          </div>

          {/* 기대평 (선택 사항) */}
          <TextareaField
            label="공연에 대한 기대평"
            name="expectation"
            rows={4}
            placeholder="이 공연에 대해 기대하는 점이나 관람 동기를 자유롭게 작성해주세요. (선택사항)"
          />
        </div>
      ),
    },

    // Step 4: 약관 동의
    {
      title: "약관 동의",
      description: "이용 규칙을 확인하고 동의해주세요",
      icon: "📝",
      validate: validateTerms,
      content: (
        <div className="space-y-5">
          {/* 이용 규칙 동의 (필수) */}
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-6">
            <label className="flex cursor-pointer items-start gap-4">
              <input
                type="checkbox"
                name="rulesAgreed"
                required
                className="mt-1 h-6 w-6 cursor-pointer rounded border-2 border-rose-400 accent-rose-600"
              />
              <div className="flex-1">
                <span className="text-base font-bold text-rose-900">
                  이용 규칙에 동의합니다. (필수)
                  <span className="ml-2 text-rose-600">*</span>
                </span>
                <div className="mt-3 space-y-2 text-sm text-rose-800">
                  <p className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-600" />
                    <span>노쇼 발생 시 신뢰도 점수 차감 및 향후 응모 제한</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-600" />
                    <span>공연 3일 전부터 취소 불가</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-600" />
                    <span>규칙 위반 시 패널티 부과</span>
                  </p>
                </div>
                <a
                  href="/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-rose-700 underline hover:text-rose-900"
                >
                  📋 전체 이용 규칙 자세히 보기 →
                </a>
              </div>
            </label>
          </div>

          {/* 마케팅 수신 동의 (선택) */}
          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
            <label className="flex cursor-pointer items-start gap-4">
              <input
                type="checkbox"
                name="consentMarketing"
                className="mt-1 h-5 w-5 cursor-pointer rounded accent-slate-600"
              />
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-900">
                  선정 결과 및 향후 이벤트 안내 이메일 수신 동의 (선택)
                </span>
                <p className="mt-1 text-xs text-slate-600">
                  제공하신 정보는 이벤트 운영 외 다른 목적으로 사용하지 않으며, 언제든 수신
                  거부하실 수 있습니다.
                </p>
              </div>
            </label>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Hidden fields for form submission */}
      <input type="hidden" name="campaignId" value={campaignId} form="ticket-entry-form" />
      <input type="hidden" name="slug" value={slug} form="ticket-entry-form" />

      <MultiStepForm
        steps={steps}
        action={formAction}
        title={headline}
        subtitle="모든 정보를 정확히 입력해 주세요. 선정 결과는 이메일로 안내드립니다."
        submitLabel="이벤트 응모하기"
        isPending={false}
        isSuccess={state.status === "success"}
        message={state.message}
      />
    </>
  );
}

/**
 * 재사용 가능한 입력 필드 컴포넌트
 */
function InputField({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2 text-sm text-slate-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 transition-all focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
        aria-required={required}
      />
    </label>
  );
}

/**
 * 재사용 가능한 텍스트 영역 컴포넌트
 */
function TextareaField({
  label,
  name,
  placeholder,
  rows = 4,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2 text-sm text-slate-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 transition-all focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20"
        aria-required={required}
      />
    </label>
  );
}
