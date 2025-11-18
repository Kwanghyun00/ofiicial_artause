"use client";

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
    <form action={formAction} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{headline}</h2>
        <p className="text-sm text-slate-600">
          모든 정보를 정확히 입력해 주세요. 선정 결과는 이메일로 안내드립니다.
        </p>
      </div>

      <input type="hidden" name="campaignId" value={campaignId} />
      <input type="hidden" name="slug" value={slug} />

      {/* 기본 정보 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-200">
          <span className="text-lg font-bold text-slate-900">📋 기본 정보</span>
          <span className="text-xs text-rose-600">(필수)</span>
        </div>
        <InputField label="성명" name="applicantName" required placeholder="홍길동" />
        <InputField label="이메일" name="applicantEmail" type="email" required placeholder="example@email.com" />
        <InputField label="전화번호" name="applicantPhone" type="tel" required placeholder="010-1234-5678" />
      </section>

      {/* SNS 정보 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-200">
          <span className="text-lg font-bold text-slate-900">📱 SNS 정보</span>
          <span className="text-xs text-rose-600">(필수)</span>
        </div>

        {/* 인스타그램 팔로우 안내 */}
        <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✨</span>
            <div className="flex-1">
              <p className="font-bold text-purple-900 mb-2">
                📸 @artause_official 팔로우 필수!
              </p>
              <p className="text-sm text-purple-800">
                인스타그램에서 <strong className="font-bold">@artause_official</strong>을 팔로우하고 응모해주세요.
                최신 공연 및 전시 초대권 이벤트 소식을 가장 먼저 받아보실 수 있습니다.
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
      </section>

      {/* 티켓 정보 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-200">
          <span className="text-lg font-bold text-slate-900">🎫 티켓 정보</span>
          <span className="text-xs text-rose-600">(필수)</span>
        </div>
        <InputField
          label="희망 관람일자"
          name="preferredDate"
          type="date"
          required
        />
        <div>
          <label className="block space-y-2 text-sm text-slate-700">
            <span>
              매수
              <span className="ml-1 text-rose-500">*</span>
            </span>
            <select
              name="ticketCount"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">선택하세요</option>
              <option value="1">1매</option>
              <option value="2">2매</option>
            </select>
          </label>
          <p className="mt-1 text-xs text-slate-500">최대 2매까지 신청 가능합니다.</p>
        </div>
      </section>

      {/* 추가 정보 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-200">
          <span className="text-lg font-bold text-slate-900">💭 기대평</span>
          <span className="text-xs text-slate-500">(선택)</span>
        </div>
        <TextareaField
          label="공연에 대한 기대평"
          name="expectation"
          rows={4}
          placeholder="이 공연에 대해 기대하는 점이나 관람 동기를 자유롭게 작성해주세요."
        />
      </section>

      {/* 약관 동의 섹션 */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-200">
          <span className="text-lg font-bold text-slate-900">📝 약관 동의</span>
        </div>

        {/* 이용 규칙 동의 (필수) */}
        <div className="rounded-2xl border-3 border-red-300 bg-red-50 p-6">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              name="rulesAgreed"
              required
              className="mt-1 h-6 w-6 cursor-pointer accent-red-600 rounded border-2 border-red-400"
            />
            <div className="flex-1">
              <span className="text-base font-bold text-red-900">
                이용 규칙에 동의합니다. (필수)
                <span className="ml-2 text-rose-600">*</span>
              </span>
              <p className="mt-2 text-sm text-red-800 leading-relaxed">
                • 노쇼 발생 시 신뢰도 점수 차감 및 향후 응모 제한<br />
                • 공연 3일 전부터 취소 불가<br />
                • 규칙 위반 시 패널티 부과
              </p>
              <a
                href="/rules"
                target="_blank"
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-red-700 underline hover:text-red-900"
              >
                📋 전체 이용 규칙 자세히 보기 →
              </a>
            </div>
          </label>
        </div>

        {/* 마케팅 수신 동의 (선택) */}
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-5">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              name="consentMarketing"
              className="mt-1 h-5 w-5 cursor-pointer accent-slate-600 rounded"
            />
            <div className="flex-1">
              <span className="text-sm font-semibold text-slate-900">
                선정 결과 및 향후 이벤트 안내 이메일 수신 동의 (선택)
              </span>
              <p className="mt-1 text-xs text-slate-600">
                제공하신 정보는 이벤트 운영 외 다른 목적으로 사용하지 않으며, 언제든 수신 거부하실 수 있습니다.
              </p>
            </div>
          </label>
        </div>
      </section>

      {state.status === "error" && state.message ? <p className="text-sm text-rose-600">{state.message}</p> : null}
      {state.status === "success" && state.message ? <p className="text-sm text-emerald-600">{state.message}</p> : null}

      <SubmitButton disabled={state.status === "success"} />
    </form>
  );
}

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
        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

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
        className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      />
    </label>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full md:w-auto" disabled={pending || disabled}>
      {pending ? "전송 중..." : "이벤트 응모하기"}
    </button>
  );
}
