"use client";

import { useActionState } from "react";
import Link from "next/link";
import { MultiStepForm, FormStep } from "./MultiStepForm";
import { submitTicketEntryAction } from "@/app/events/tickets/[slug]/actions";
import { ticketEntryInitialState } from "@/app/events/tickets/[slug]/form-state";

interface TicketEntryFormStepsProps {
  campaignId: string;
  slug: string;
  campaignTitle: string;
  performanceTitle?: string;
  availableDates?: string[]; // Available dates from campaign
}

export function TicketEntryFormSteps({
  campaignId,
  slug,
  campaignTitle,
  performanceTitle,
  availableDates = [],
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
    const date = (document.querySelector('[name="preferredDate"]') as HTMLInputElement | HTMLSelectElement)?.value;
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
      alert("필수 약관에 동의해주세요.");
      return false;
    }

    return true;
  };

  /**
   * Format date for display
   */
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
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
          {/* 인스타그램 팔로우 안내 - v0 style */}
          <div className="rounded-2xl border-2 border-[#8B7BA8]/30 bg-gradient-to-r from-[#8B7BA8]/10 to-[#E8D5D5]/30 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">✨</span>
              <div className="flex-1">
                <p className="mb-2 font-bold text-[#2D2A26]">
                  📸 @artause_official 팔로우 필수!
                </p>
                <p className="text-sm text-[#6B6560]">
                  인스타그램에서 <strong className="font-bold text-[#8B7BA8]">@artause_official</strong>을
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
            <p className="mt-1 text-xs text-[#6B6560]">
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
          {/* Date Selection - Show options if available_dates exist, otherwise show date input */}
          {availableDates && availableDates.length > 0 ? (
            <div>
              <label className="block space-y-2 text-sm text-[#2D2A26]">
                <span className="font-medium">
                  희망 관람일자
                  <span className="ml-1 text-[#D97B7B]">*</span>
                </span>
                <select
                  name="preferredDate"
                  required
                  className="w-full rounded-xl border-2 border-[#E8E3DC] px-4 py-3 text-[#2D2A26] focus:border-[#8B7BA8] focus:outline-none focus:ring-2 focus:ring-[#8B7BA8]/20 transition-all"
                >
                  <option value="">선택해주세요</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {formatDateDisplay(date)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-2 text-xs text-[#6B6560]">
                공연 단체가 제공하는 날짜 중에서 선택해주세요.
              </p>
            </div>
          ) : (
            <InputField
              label="희망 관람일자"
              name="preferredDate"
              type="date"
              required
            />
          )}

          <div>
            <label className="block space-y-2 text-sm text-[#2D2A26]">
              <span className="font-medium">
                매수
                <span className="ml-1 text-[#D97B7B]">*</span>
              </span>
              <select
                name="ticketCount"
                required
                className="w-full rounded-xl border-2 border-[#E8E3DC] px-4 py-3 text-[#2D2A26] focus:border-[#8B7BA8] focus:outline-none focus:ring-2 focus:ring-[#8B7BA8]/20 transition-all"
              >
                <option value="">선택하세요</option>
                <option value="1">1매</option>
                <option value="2">2매</option>
              </select>
            </label>
            <p className="mt-1 text-xs text-[#6B6560]">최대 2매까지 신청 가능합니다.</p>
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

    // Step 4: 약관 동의 - Redesigned
    {
      title: "약관 동의",
      description: "이용 규칙을 확인하고 동의해주세요",
      icon: "✅",
      validate: validateTerms,
      content: (
        <div className="space-y-4">
          {/* 전체 동의 */}
          <div className="rounded-2xl border-2 border-[#8B7BA8] bg-[#8B7BA8]/5 p-5">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-6 w-6 cursor-pointer rounded-lg border-2 border-[#8B7BA8] accent-[#8B7BA8]"
                onChange={(e) => {
                  const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name^="consent"]');
                  checkboxes.forEach(cb => {
                    if (cb.name !== 'consentMarketing') {
                      cb.checked = e.target.checked;
                    }
                  });
                  const rulesCheckbox = document.querySelector<HTMLInputElement>('input[name="rulesAgreed"]');
                  if (rulesCheckbox) rulesCheckbox.checked = e.target.checked;
                }}
              />
              <span className="text-lg font-bold text-[#2D2A26]">
                전체 동의
              </span>
            </label>
          </div>

          <div className="h-px bg-[#E8E3DC]" />

          {/* 필수 약관 */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#2D2A26]">필수 약관</h3>

            {/* 이용 규칙 동의 */}
            <div className="rounded-xl border-2 border-[#D97B7B]/30 bg-[#D97B7B]/5 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="rulesAgreed"
                  required
                  className="mt-0.5 h-5 w-5 cursor-pointer rounded border-2 border-[#D97B7B] accent-[#D97B7B]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2D2A26]">
                      이용 규칙 동의
                      <span className="ml-1 text-[#D97B7B]">*</span>
                    </span>
                    <Link
                      href="/rules"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#8B7BA8] hover:text-[#8B7BA8]/80 underline"
                    >
                      전문보기 →
                    </Link>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-[#6B6560]">
                    <li className="flex gap-1.5">
                      <span className="text-[#D97B7B]">•</span>
                      <span>노쇼 발생 시 신뢰도 점수 차감 및 향후 응모 제한</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span className="text-[#D97B7B]">•</span>
                      <span>공연 3일 전부터 취소 불가</span>
                    </li>
                    <li className="flex gap-1.5">
                      <span className="text-[#D97B7B]">•</span>
                      <span>규칙 위반 시 패널티 부과</span>
                    </li>
                  </ul>
                </div>
              </label>
            </div>

            {/* 개인정보 수집 및 이용 동의 */}
            <div className="rounded-xl border-2 border-[#E8E3DC] bg-white p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="consentPrivacy"
                  required
                  className="mt-0.5 h-5 w-5 cursor-pointer rounded border-2 border-[#8B7BA8] accent-[#8B7BA8]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2D2A26]">
                      개인정보 수집 및 이용 동의
                      <span className="ml-1 text-[#D97B7B]">*</span>
                    </span>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#8B7BA8] hover:text-[#8B7BA8]/80 underline"
                      onClick={() => alert('수집 항목: 이름, 이메일, 전화번호, SNS 정보\n이용 목적: 초대권 이벤트 운영 및 당첨자 안내\n보유 기간: 이벤트 종료 후 3개월')}
                    >
                      상세보기 →
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[#6B6560]">
                    초대권 이벤트 운영 목적으로만 사용되며, 종료 후 3개월 내 파기됩니다.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="h-px bg-[#E8E3DC]" />

          {/* 선택 약관 */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#2D2A26]">선택 약관</h3>

            {/* 마케팅 수신 동의 */}
            <div className="rounded-xl border-2 border-[#E8E3DC] bg-[#F5EFE7] p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  name="consentMarketing"
                  className="mt-0.5 h-5 w-5 cursor-pointer rounded border-2 border-[#8B7BA8] accent-[#8B7BA8]"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[#2D2A26]">
                    마케팅 정보 수신 동의 (선택)
                  </span>
                  <p className="mt-1 text-xs text-[#6B6560]">
                    신규 이벤트, 당첨 결과 등의 이메일을 받습니다. 언제든 수신 거부 가능합니다.
                  </p>
                </div>
              </label>
            </div>
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
 * 재사용 가능한 입력 필드 컴포넌트 - v0 style
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
    <label className="block space-y-2 text-sm text-[#2D2A26]">
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-[#D97B7B]">*</span> : null}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border-2 border-[#E8E3DC] px-4 py-3 text-[#2D2A26] transition-all focus:border-[#8B7BA8] focus:outline-none focus:ring-2 focus:ring-[#8B7BA8]/20"
        aria-required={required}
      />
    </label>
  );
}

/**
 * 재사용 가능한 텍스트 영역 컴포넌트 - v0 style
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
    <label className="block space-y-2 text-sm text-[#2D2A26]">
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-[#D97B7B]">*</span> : null}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full rounded-xl border-2 border-[#E8E3DC] px-4 py-3 text-[#2D2A26] transition-all focus:border-[#8B7BA8] focus:outline-none focus:ring-2 focus:ring-[#8B7BA8]/20"
        aria-required={required}
      />
    </label>
  );
}
