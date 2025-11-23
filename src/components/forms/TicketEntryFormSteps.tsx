"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { MultiStepForm, FormStep } from "./MultiStepForm";
import { submitTicketEntryAction } from "@/app/events/tickets/[slug]/actions";
import { ticketEntryInitialState } from "@/app/events/tickets/[slug]/form-state";

// 디자인 토큰 (MultiStepForm과 일치)
const colors = {
  navy: "#293380",
  navyLight: "#3d4a9e",
  magenta: "#953D60",
  magentaLight: "#D36AD9",
  background: "#F8F6F3",
  cardBg: "#FFFFFF",
  pastelPurple: "#F0EFF7",
  pastelPink: "#DDBFE4",
  text: "#1a1a2e",
  textMuted: "#6B6560",
  border: "#E8E3DC",
  success: "#059669",
  error: "#DC2626",
  warning: "#F59E0B",
};

// 공연 회차 정보 타입
interface ShowTimeSlot {
  date: string;
  time?: string;
  remainingTickets?: number;
  maxPerPerson?: number;
}

interface TicketEntryFormStepsProps {
  campaignId: string;
  slug: string;
  campaignTitle: string;
  performanceTitle?: string;
  availableDates?: string[];
  showTimeSlots?: ShowTimeSlot[];
}

// SVG 아이콘 컴포넌트들
const Icons = {
  user: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  social: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8zM7 8V6a2 2 0 012-2h6" />
    </svg>
  ),
  ticket: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v1a2 2 0 002 2h2a2 2 0 002-2v-1a2 2 0 00-2-2H5zM17 5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2z" />
    </svg>
  ),
  check: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
};

export function TicketEntryFormSteps({
  campaignId,
  slug,
  campaignTitle,
  performanceTitle,
  availableDates = [],
  showTimeSlots = [],
}: TicketEntryFormStepsProps) {
  const [state, formAction] = useActionState(submitTicketEntryAction, ticketEntryInitialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const headline = performanceTitle ? `${campaignTitle} · ${performanceTitle}` : campaignTitle;

  const showFieldError = (fieldName: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [fieldName]: message }));
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (field as HTMLElement).focus?.();
    }
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  // 검증 함수들
  const validateBasicInfo = () => {
    const name = (document.querySelector('[name="applicantName"]') as HTMLInputElement)?.value;
    const email = (document.querySelector('[name="applicantEmail"]') as HTMLInputElement)?.value;
    const phone = (document.querySelector('[name="applicantPhone"]') as HTMLInputElement)?.value;

    clearFieldError('applicantName');
    clearFieldError('applicantEmail');
    clearFieldError('applicantPhone');

    if (!name) { showFieldError('applicantName', '성명을 입력해주세요.'); return false; }
    if (!email) { showFieldError('applicantEmail', '이메일을 입력해주세요.'); return false; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFieldError('applicantEmail', '올바른 이메일 형식으로 입력해주세요.');
      return false;
    }

    if (!phone) { showFieldError('applicantPhone', '전화번호를 입력해주세요.'); return false; }

    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(phone.replace(/-/g, ''))) {
      showFieldError('applicantPhone', '010-1234-5678 형식으로 입력해주세요.');
      return false;
    }

    return true;
  };

  const validateSNSInfo = () => {
    const instagram = (document.querySelector('[name="instagramHandle"]') as HTMLInputElement)?.value;
    const reviewUrl = (document.querySelector('[name="reviewUrl"]') as HTMLInputElement)?.value;

    clearFieldError('instagramHandle');
    clearFieldError('reviewUrl');

    if (!instagram) { showFieldError('instagramHandle', '인스타그램 아이디를 입력해주세요.'); return false; }
    if (!reviewUrl) { showFieldError('reviewUrl', '후기를 남길 SNS 주소를 입력해주세요.'); return false; }

    return true;
  };

  const validateTicketInfo = () => {
    const radioSelected = document.querySelector<HTMLInputElement>('input[type="radio"][name="selectedSlot"]:checked');
    const dateRadioSelected = document.querySelector<HTMLInputElement>('input[type="radio"][name="preferredDate"]:checked');
    const dateInput = document.querySelector('[name="preferredDate"]:not([type="radio"])') as HTMLInputElement | HTMLSelectElement | null;

    const hasDateSelected = radioSelected || dateRadioSelected || (dateInput?.value);
    const hasShowTimeSlots = document.querySelector('input[type="radio"][name="selectedSlot"]');
    const count = hasShowTimeSlots ? '1' : (document.querySelector('[name="ticketCount"]') as HTMLSelectElement)?.value;

    clearFieldError('selectedSlot');
    clearFieldError('preferredDate');
    clearFieldError('ticketCount');

    if (!hasDateSelected) { showFieldError('selectedSlot', '희망 관람 회차를 선택해주세요.'); return false; }
    if (!hasShowTimeSlots && !count) { showFieldError('ticketCount', '매수를 선택해주세요.'); return false; }

    return true;
  };

  const validateTerms = () => {
    const rulesAgreed = (document.querySelector('[name="rulesAgreed"]') as HTMLInputElement)?.checked;
    const privacyAgreed = (document.querySelector('[name="consentPrivacy"]') as HTMLInputElement)?.checked;

    clearFieldError('rulesAgreed');
    clearFieldError('consentPrivacy');

    if (!rulesAgreed) { showFieldError('rulesAgreed', '이용 규칙에 동의해주세요.'); return false; }
    if (!privacyAgreed) { showFieldError('consentPrivacy', '개인정보 수집에 동의해주세요.'); return false; }

    return true;
  };

  const FieldError = ({ name }: { name: string }) => {
    const error = fieldErrors[name];
    if (!error) return null;
    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: colors.error }}>
        {Icons.warning}
        {error}
      </p>
    );
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}월 ${day}일 (${dayOfWeek})`;
  };

  // 폼 단계 정의
  const steps: FormStep[] = [
    // Step 1: 기본 정보
    {
      title: "기본 정보",
      description: "성명, 이메일, 전화번호를 입력해주세요",
      icon: Icons.user,
      validate: validateBasicInfo,
      content: (
        <div className="space-y-4">
          <InputField label="성명" name="applicantName" required placeholder="홍길동" />
          <FieldError name="applicantName" />

          <InputField label="이메일" name="applicantEmail" type="email" required placeholder="example@email.com" />
          <FieldError name="applicantEmail" />

          <InputField label="전화번호" name="applicantPhone" type="tel" required placeholder="010-1234-5678" />
          <FieldError name="applicantPhone" />
        </div>
      ),
    },

    // Step 2: SNS 정보
    {
      title: "SNS 정보",
      description: "인스타그램 팔로우 후 계정 정보를 입력해주세요",
      icon: Icons.social,
      validate: validateSNSInfo,
      content: (
        <div className="space-y-4">
          {/* 인스타그램 팔로우 안내 */}
          <div
            className="flex items-center gap-3 rounded-xl p-3"
            style={{ backgroundColor: colors.pastelPink, border: `1px solid ${colors.magenta}30` }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}
            >
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                @artause_official 팔로우 필수
              </p>
              <p className="text-xs" style={{ color: colors.textMuted }}>
                팔로우 후 응모하시면 이벤트 소식을 먼저 받아보실 수 있습니다.
              </p>
            </div>
          </div>

          <InputField label="인스타그램 아이디" name="instagramHandle" required placeholder="your_instagram_id" />
          <FieldError name="instagramHandle" />

          <div>
            <InputField label="후기를 남길 SNS 주소" name="reviewUrl" type="url" required placeholder="https://instagram.com/your_id" />
            <FieldError name="reviewUrl" />
            <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
              공연 관람 후 후기를 남길 SNS 주소를 입력해주세요.
            </p>
          </div>
        </div>
      ),
    },

    // Step 3: 티켓 정보 - 토글 카드 UI
    {
      title: "희망 관람일",
      description: "공연 일정 중 원하시는 회차를 선택해주세요",
      icon: Icons.ticket,
      validate: validateTicketInfo,
      content: (
        <div className="space-y-4">
          {/* 날짜/시간별 토글 카드 - 2열 그리드 */}
          {showTimeSlots && showTimeSlots.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                  관람 회차 <span style={{ color: colors.magenta }}>*</span>
                </span>
                <span className="text-xs" style={{ color: colors.textMuted }}>1개만 선택 가능</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {showTimeSlots.map((slot, index) => {
                  const isAvailable = (slot.remainingTickets ?? 1) > 0;
                  const isLowStock = isAvailable && slot.remainingTickets !== undefined && slot.remainingTickets <= 3;
                  const slotValue = `${slot.date}${slot.time ? `_${slot.time}` : ''}`;
                  const isSelected = selectedDate === slotValue;

                  return (
                    <label
                      key={index}
                      className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-3 transition-all ${
                        !isAvailable ? "cursor-not-allowed opacity-50" : ""
                      }`}
                      style={{
                        borderColor: isSelected ? colors.navy : colors.border,
                        backgroundColor: isSelected ? colors.pastelPurple : isAvailable ? "#fff" : "#f9fafb",
                      }}
                    >
                      <input
                        type="radio"
                        name="selectedSlot"
                        value={slotValue}
                        disabled={!isAvailable}
                        className="sr-only"
                        onChange={() => setSelectedDate(slotValue)}
                      />

                      {/* 선택 인디케이터 */}
                      <div
                        className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          isSelected ? "border-transparent" : ""
                        }`}
                        style={{
                          borderColor: isSelected ? "transparent" : colors.border,
                          backgroundColor: isSelected ? colors.navy : "transparent",
                        }}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* 날짜 및 시간 */}
                      <span className="pr-8 text-sm font-bold" style={{ color: isAvailable ? colors.navy : colors.textMuted }}>
                        {formatDateDisplay(slot.date)}
                      </span>
                      {slot.time && (
                        <span className="text-sm font-medium" style={{ color: colors.magenta }}>
                          {slot.time}
                        </span>
                      )}

                      {/* 잔여 매수 배지 */}
                      <div className="mt-2 flex items-center gap-2">
                        {slot.remainingTickets !== undefined && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: !isAvailable ? "#f3f4f6" : isLowStock ? "#fef2f2" : "#ecfdf5",
                              color: !isAvailable ? colors.textMuted : isLowStock ? colors.error : colors.success,
                            }}
                          >
                            {isAvailable ? (isLowStock ? `마감임박 ${slot.remainingTickets}매` : `잔여 ${slot.remainingTickets}매`) : "마감"}
                          </span>
                        )}
                        {slot.maxPerPerson && isAvailable && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: colors.pastelPurple, color: colors.navy }}
                          >
                            1인 {slot.maxPerPerson}매
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
              <FieldError name="selectedSlot" />
            </div>
          ) : availableDates && availableDates.length > 0 ? (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: colors.text }}>
                  희망 관람일자 <span style={{ color: colors.magenta }}>*</span>
                </span>
                <span className="text-xs" style={{ color: colors.textMuted }}>1개만 선택 가능</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {availableDates.map((date) => {
                  const isSelected = selectedDate === date;
                  return (
                    <label
                      key={date}
                      className="relative flex cursor-pointer items-center rounded-xl border-2 p-3 transition-all"
                      style={{
                        borderColor: isSelected ? colors.navy : colors.border,
                        backgroundColor: isSelected ? colors.pastelPurple : "#fff",
                      }}
                    >
                      <input
                        type="radio"
                        name="preferredDate"
                        value={date}
                        className="sr-only"
                        onChange={() => setSelectedDate(date)}
                      />
                      <div
                        className={`mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2`}
                        style={{
                          borderColor: isSelected ? "transparent" : colors.border,
                          backgroundColor: isSelected ? colors.navy : "transparent",
                        }}
                      >
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: colors.navy }}>
                        {formatDateDisplay(date)}
                      </span>
                    </label>
                  );
                })}
              </div>
              <FieldError name="preferredDate" />
            </div>
          ) : (
            <InputField label="희망 관람일자" name="preferredDate" type="date" required />
          )}

          {/* 매수 선택 */}
          {!(showTimeSlots && showTimeSlots.length > 0) && (
            <div>
              <label className="block text-sm">
                <span className="font-semibold" style={{ color: colors.text }}>
                  매수 <span style={{ color: colors.magenta }}>*</span>
                </span>
                <select
                  name="ticketCount"
                  required
                  className="mt-1.5 w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:outline-none"
                  style={{
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                >
                  <option value="">선택하세요</option>
                  <option value="1">1매</option>
                  <option value="2">2매</option>
                </select>
              </label>
              <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>최대 2매까지 신청 가능합니다.</p>
              <FieldError name="ticketCount" />
            </div>
          )}

          {/* 기대평 */}
          <TextareaField
            label="공연에 대한 기대평"
            name="expectation"
            rows={2}
            placeholder="이 공연에 대한 기대나 관람 동기를 작성해주세요. (선택)"
          />
        </div>
      ),
    },

    // Step 4: 약관 동의 - 컴팩트 토글 스위치 형태
    {
      title: "약관 동의",
      description: "이용 규칙을 확인하고 동의해주세요",
      icon: Icons.check,
      validate: validateTerms,
      content: (
        <div className="space-y-3">
          {/* 전체 동의 토글 */}
          <label
            className="flex cursor-pointer items-center justify-between rounded-xl p-3"
            style={{ backgroundColor: colors.navy }}
          >
            <span className="text-sm font-bold text-white">전체 동의</span>
            <div className="relative">
              <input
                type="checkbox"
                className="peer sr-only"
                onChange={(e) => {
                  const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name^="consent"], input[name="rulesAgreed"]');
                  checkboxes.forEach(cb => cb.checked = e.target.checked);
                }}
              />
              <div className="h-6 w-11 rounded-full bg-white/30 transition-all peer-checked:bg-white/90"></div>
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-5 peer-checked:bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}></div>
            </div>
          </label>

          {/* 필수 약관 - 컴팩트 */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>필수</span>

            {/* 이용 규칙 */}
            <div
              className="flex items-center justify-between rounded-xl border p-3"
              style={{ borderColor: `${colors.error}30`, backgroundColor: `${colors.error}05` }}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="rulesAgreed"
                  required
                  className="h-4 w-4 rounded"
                  style={{ accentColor: colors.navy }}
                />
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  이용 규칙 동의 <span style={{ color: colors.error }}>*</span>
                </span>
              </label>
              <Link
                href="/rules"
                target="_blank"
                className="text-xs font-medium underline"
                style={{ color: colors.navy }}
              >
                보기
              </Link>
            </div>
            <FieldError name="rulesAgreed" />

            {/* 개인정보 */}
            <div
              className="flex items-center justify-between rounded-xl border p-3"
              style={{ borderColor: colors.border }}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="consentPrivacy"
                  required
                  className="h-4 w-4 rounded"
                  style={{ accentColor: colors.navy }}
                />
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  개인정보 수집 동의 <span style={{ color: colors.error }}>*</span>
                </span>
              </label>
              <button
                type="button"
                className="text-xs font-medium underline"
                style={{ color: colors.navy }}
                onClick={() => alert('수집 항목: 이름, 이메일, 전화번호, SNS 정보\n이용 목적: 초대권 이벤트 운영\n보유 기간: 이벤트 종료 후 3개월')}
              >
                보기
              </button>
            </div>
            <FieldError name="consentPrivacy" />
          </div>

          {/* 선택 약관 */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.textMuted }}>선택</span>
            <div
              className="flex items-center rounded-xl border p-3"
              style={{ borderColor: colors.border, backgroundColor: colors.pastelPurple }}
            >
              <label className="flex flex-1 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="consentMarketing"
                  className="h-4 w-4 rounded"
                  style={{ accentColor: colors.navy }}
                />
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  마케팅 정보 수신
                </span>
              </label>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <input type="hidden" name="campaignId" value={campaignId} form="ticket-entry-form" />
      <input type="hidden" name="slug" value={slug} form="ticket-entry-form" />

      <MultiStepForm
        steps={steps}
        action={formAction}
        title={headline}
        subtitle="모든 정보를 정확히 입력해 주세요. 선정 결과는 이메일로 안내드립니다."
        submitLabel="응모하기"
        isPending={false}
        isSuccess={state.status === "success"}
        message={state.message}
      />
    </>
  );
}

// 전화번호 포맷팅
function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/[^\d]/g, '');
  const truncated = numbers.slice(0, 11);

  if (truncated.length <= 3) return truncated;
  if (truncated.length <= 7) return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  return `${truncated.slice(0, 3)}-${truncated.slice(3, 7)}-${truncated.slice(7)}`;
}

// 입력 필드 컴포넌트
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
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'tel') {
      e.target.value = formatPhoneNumber(e.target.value);
    }
  };

  return (
    <label className="block text-sm">
      <span className="font-semibold" style={{ color: colors.text }}>
        {label}
        {required && <span style={{ color: colors.magenta }}> *</span>}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        onChange={type === 'tel' ? handlePhoneInput : undefined}
        className="mt-1.5 w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:outline-none"
        style={{
          borderColor: colors.border,
          color: colors.text,
        }}
        onFocus={(e) => e.target.style.borderColor = colors.navy}
        onBlur={(e) => e.target.style.borderColor = colors.border}
      />
    </label>
  );
}

// 텍스트영역 컴포넌트
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
    <label className="block text-sm">
      <span className="font-semibold" style={{ color: colors.text }}>
        {label}
        {required && <span style={{ color: colors.magenta }}> *</span>}
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="mt-1.5 w-full rounded-xl border-2 px-4 py-2.5 text-sm transition-all focus:outline-none"
        style={{
          borderColor: colors.border,
          color: colors.text,
        }}
        onFocus={(e) => e.target.style.borderColor = colors.navy}
        onBlur={(e) => e.target.style.borderColor = colors.border}
      />
    </label>
  );
}
