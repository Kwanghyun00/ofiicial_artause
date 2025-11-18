"use client";

import { type ChangeEvent, type FormEvent, useId, useState, useTransition } from "react";
import { createEventCampaign } from "@/app/event-center/actions";

type FormState = {
  // 공연 정보
  performanceTitle: string;
  performanceDescription: string;
  ticketPurchaseUrl: string;

  // 이벤트 정보
  eventTitle: string;
  eventDescription: string;
  ticketCount: number;
  startsAt: string;
  endsAt: string;
  showDate: string;

  // 공연 종사자 정보
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;

  // 홍보 채널
  promoChannel: string;
};

const initialState: FormState = {
  performanceTitle: "",
  performanceDescription: "",
  ticketPurchaseUrl: "",
  eventTitle: "",
  eventDescription: "",
  ticketCount: 20,
  startsAt: "",
  endsAt: "",
  showDate: "",
  partnerName: "",
  partnerEmail: "",
  partnerPhone: "",
  promoChannel: "",
};

export function EventCreationWizard() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "ticketCount" ? Number(value) : value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitResult(null);

    startTransition(async () => {
      const result = await createEventCampaign(form);

      if (result.success) {
        setSubmitResult({
          success: true,
          message: "이벤트가 성공적으로 등록되었습니다. 관리자 승인 후 공개됩니다.",
        });
        setForm(initialState);
      } else {
        setSubmitResult({
          success: false,
          message: result.error || "이벤트 등록에 실패했습니다.",
        });
      }
    });
  };

  return (
    <section id="event-create" className="rounded-3xl border border-indigo-100 bg-white/90 p-8 shadow-xl backdrop-blur">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">초대권 이벤트 개설</p>
        <h2 className="text-2xl font-semibold text-slate-900">공연 정보 + 초대권 이벤트 한 번에</h2>
        <p className="text-sm text-slate-600">
          공연 정보와 초대권 이벤트를 함께 등록하세요. 관리자 승인 후 관객들이 응모할 수 있습니다.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6" aria-labelledby={formId}>
        {/* 공연 정보 섹션 */}
        <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <legend className="text-sm font-semibold text-slate-900">공연 정보</legend>

          <LabeledInput label="공연 제목" htmlFor={`${formId}-perf-title`} required>
            <input
              id={`${formId}-perf-title`}
              name="performanceTitle"
              value={form.performanceTitle}
              onChange={handleChange}
              placeholder="예: 뮤지컬 문라이트"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </LabeledInput>

          <LabeledInput label="공연 소개" htmlFor={`${formId}-perf-desc`}>
            <textarea
              id={`${formId}-perf-desc`}
              name="performanceDescription"
              value={form.performanceDescription}
              onChange={handleChange}
              placeholder="공연에 대한 간단한 설명을 입력해 주세요"
              rows={3}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </LabeledInput>

          <LabeledInput label="티켓 구매 URL (선택)" htmlFor={`${formId}-ticket-url`}>
            <input
              id={`${formId}-ticket-url`}
              name="ticketPurchaseUrl"
              type="url"
              value={form.ticketPurchaseUrl}
              onChange={handleChange}
              placeholder="https://ticket.example.com/..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </LabeledInput>
        </fieldset>

        {/* 이벤트 정보 섹션 */}
        <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <legend className="text-sm font-semibold text-slate-900">초대권 이벤트 정보</legend>

          <LabeledInput label="이벤트 제목" htmlFor={`${formId}-event-title`} required>
            <input
              id={`${formId}-event-title`}
              name="eventTitle"
              value={form.eventTitle}
              onChange={handleChange}
              placeholder="예: 문라이트 시사회 초대권"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </LabeledInput>

          <LabeledInput label="이벤트 설명" htmlFor={`${formId}-event-desc`}>
            <textarea
              id={`${formId}-event-desc`}
              name="eventDescription"
              value={form.eventDescription}
              onChange={handleChange}
              placeholder="초대권 이벤트에 대한 설명"
              rows={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </LabeledInput>

          <div className="grid gap-4 md:grid-cols-3">
            <LabeledInput label="제공 매수" htmlFor={`${formId}-ticket-count`} required>
              <input
                type="number"
                min={1}
                step={1}
                id={`${formId}-ticket-count`}
                name="ticketCount"
                value={form.ticketCount}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </LabeledInput>

            <LabeledInput label="이벤트 시작일" htmlFor={`${formId}-starts-at`} required>
              <input
                type="date"
                id={`${formId}-starts-at`}
                name="startsAt"
                value={form.startsAt}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </LabeledInput>

            <LabeledInput label="이벤트 종료일" htmlFor={`${formId}-ends-at`} required>
              <input
                type="date"
                id={`${formId}-ends-at`}
                name="endsAt"
                value={form.endsAt}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </LabeledInput>
          </div>

          <LabeledInput label="공연 날짜" htmlFor={`${formId}-show-date`} required>
            <input
              type="datetime-local"
              id={`${formId}-show-date`}
              name="showDate"
              value={form.showDate}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </LabeledInput>
        </fieldset>

        {/* 담당자 정보 섹션 */}
        <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <legend className="text-sm font-semibold text-slate-900">담당자 정보</legend>

          <div className="grid gap-4 md:grid-cols-3">
            <LabeledInput label="이름" htmlFor={`${formId}-partner-name`} required>
              <input
                id={`${formId}-partner-name`}
                name="partnerName"
                value={form.partnerName}
                onChange={handleChange}
                placeholder="홍길동"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </LabeledInput>

            <LabeledInput label="이메일" htmlFor={`${formId}-partner-email`} required>
              <input
                type="email"
                id={`${formId}-partner-email`}
                name="partnerEmail"
                value={form.partnerEmail}
                onChange={handleChange}
                placeholder="partner@example.com"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </LabeledInput>

            <LabeledInput label="연락처" htmlFor={`${formId}-partner-phone`} required>
              <input
                type="tel"
                id={`${formId}-partner-phone`}
                name="partnerPhone"
                value={form.partnerPhone}
                onChange={handleChange}
                placeholder="010-1234-5678"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
            </LabeledInput>
          </div>
        </fieldset>

        {/* 홍보 채널 */}
        <LabeledInput label="SNS 홍보 링크 (선택)" htmlFor={`${formId}-promo`}>
          <input
            type="url"
            id={`${formId}-promo`}
            name="promoChannel"
            value={form.promoChannel}
            onChange={handleChange}
            placeholder="https://instagram.com/..."
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </LabeledInput>

        {/* 결과 메시지 */}
        {submitResult ? (
          <div
            className={`rounded-2xl border p-4 text-sm ${
              submitResult.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {submitResult.message}
          </div>
        ) : null}

        {/* 제출 버튼 */}
        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="btn-primary disabled:opacity-50">
            {isPending ? "등록 중..." : "이벤트 등록하기"}
          </button>
          {submitResult?.success ? (
            <button
              type="button"
              onClick={() => {
                setForm(initialState);
                setSubmitResult(null);
              }}
              className="btn-secondary border-slate-200 text-slate-700"
            >
              새 이벤트 등록
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

function LabeledInput({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="space-y-1 text-sm text-slate-700">
      <span className="font-semibold text-slate-900">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
