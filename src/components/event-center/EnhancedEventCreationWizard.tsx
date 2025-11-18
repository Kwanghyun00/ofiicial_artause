"use client";

import { type ChangeEvent, type FormEvent, useId, useState, useTransition } from "react";
import { MultiStepForm, FormStep } from "@/components/forms/MultiStepForm";

type TicketAllocation = {
  date: string;
  time: string;
  ticketCount: number;
};

type ProductionMember = {
  role: string;
  name: string;
};

type FormState = {
  // Step 1: 기본 공연 정보
  oneLineIntro: string; // 15-20자 한줄 소개
  performanceTitle: string;
  performanceDescription: string;

  // Step 2: 비주얼 자료
  posterImage: File | null;
  stillImages: File[]; // 3-5장

  // Step 3: 상세 공연 정보
  venue: string; // 공연 장소
  period: string; // 공연 기간
  sessions: string; // 회차 정보
  runningTime: string; // 러닝타임
  ageRating: string; // 관람연령
  ticketPurchaseUrl: string; // 예매 링크

  // Step 4: SNS & 해시태그
  instagramAccount: string; // @계정
  hashtags: string[]; // 해시태그 목록
  promoChannel: string;

  // Step 5: 제작진 정보
  productionTeam: ProductionMember[]; // 작/연출, 조연출, 무대감독 등

  // Step 6: 초대권 이벤트 정보
  eventTitle: string;
  eventDescription: string;
  eventStartsAt: string; // 이벤트 시작일
  eventEndsAt: string; // 이벤트 종료일
  ticketAllocations: TicketAllocation[]; // 일자별 초대권 매수

  // 담당자 정보
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
};

const initialState: FormState = {
  oneLineIntro: "",
  performanceTitle: "",
  performanceDescription: "",
  posterImage: null,
  stillImages: [],
  venue: "",
  period: "",
  sessions: "",
  runningTime: "",
  ageRating: "전체관람가",
  ticketPurchaseUrl: "",
  instagramAccount: "",
  hashtags: [],
  promoChannel: "",
  productionTeam: [],
  eventTitle: "",
  eventDescription: "",
  eventStartsAt: "",
  eventEndsAt: "",
  ticketAllocations: [],
  partnerName: "",
  partnerEmail: "",
  partnerPhone: "",
};

export function EnhancedEventCreationWizard() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, fieldName: "posterImage" | "stillImages") => {
    const files = event.target.files;
    if (!files) return;

    if (fieldName === "posterImage") {
      setForm((prev) => ({ ...prev, posterImage: files[0] || null }));
    } else if (fieldName === "stillImages") {
      const fileArray = Array.from(files).slice(0, 5); // 최대 5장
      setForm((prev) => ({ ...prev, stillImages: fileArray }));
    }
  };

  const addHashtag = (tag: string) => {
    if (tag && !form.hashtags.includes(tag)) {
      setForm((prev) => ({ ...prev, hashtags: [...prev.hashtags, tag] }));
    }
  };

  const removeHashtag = (tag: string) => {
    setForm((prev) => ({ ...prev, hashtags: prev.hashtags.filter((t) => t !== tag) }));
  };

  const addProductionMember = () => {
    setForm((prev) => ({
      ...prev,
      productionTeam: [...prev.productionTeam, { role: "", name: "" }],
    }));
  };

  const updateProductionMember = (index: number, field: "role" | "name", value: string) => {
    setForm((prev) => {
      const updated = [...prev.productionTeam];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, productionTeam: updated };
    });
  };

  const removeProductionMember = (index: number) => {
    setForm((prev) => ({
      ...prev,
      productionTeam: prev.productionTeam.filter((_, i) => i !== index),
    }));
  };

  const addTicketAllocation = () => {
    setForm((prev) => ({
      ...prev,
      ticketAllocations: [...prev.ticketAllocations, { date: "", time: "", ticketCount: 10 }],
    }));
  };

  const updateTicketAllocation = (index: number, field: keyof TicketAllocation, value: string | number) => {
    setForm((prev) => {
      const updated = [...prev.ticketAllocations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ticketAllocations: updated };
    });
  };

  const removeTicketAllocation = (index: number) => {
    setForm((prev) => ({
      ...prev,
      ticketAllocations: prev.ticketAllocations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (formData: FormData) => {
    // TODO: Implement submission logic with file uploads
    console.log("Form submitted:", form);
    setSubmitResult({
      success: true,
      message: "이벤트가 성공적으로 등록되었습니다. 관리자 승인 후 공개됩니다.",
    });
  };

  const steps: FormStep[] = [
    // Step 1: 기본 공연 정보
    {
      title: "기본 공연 정보",
      description: "공연의 제목과 소개를 입력해주세요",
      icon: "🎭",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                한줄 소개 (15-20자) <span className="text-rose-500">*</span>
              </span>
              <input
                name="oneLineIntro"
                value={form.oneLineIntro}
                onChange={handleChange}
                maxLength={20}
                placeholder="공연을 한 문장으로 표현해주세요"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
              <span className="text-xs text-slate-500">{form.oneLineIntro.length}/20자</span>
            </label>
          </div>

          <div>
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                공연 제목 <span className="text-rose-500">*</span>
              </span>
              <input
                name="performanceTitle"
                value={form.performanceTitle}
                onChange={handleChange}
                placeholder="예: 뮤지컬 문라이트"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>
          </div>

          <div>
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">공연 소개</span>
              <textarea
                name="performanceDescription"
                value={form.performanceDescription}
                onChange={handleChange}
                placeholder="공연에 대한 상세한 설명을 입력해주세요"
                rows={5}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>
          </div>
        </div>
      ),
    },

    // Step 2: 비주얼 자료
    {
      title: "비주얼 자료",
      description: "포스터와 공연 스틸 사진을 업로드해주세요",
      icon: "📸",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                포스터 / 키비주얼 <span className="text-rose-500">*</span>
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "posterImage")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
              {form.posterImage && (
                <span className="text-xs text-emerald-600">✓ {form.posterImage.name}</span>
              )}
            </label>
          </div>

          <div>
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                공연/리허설 스틸 사진 (3-5장) <span className="text-rose-500">*</span>
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange(e, "stillImages")}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
              <span className="text-xs text-slate-500">세로 위주, 가로 혼용 가능 (최대 5장)</span>
              {form.stillImages.length > 0 && (
                <div className="mt-2 space-y-1">
                  {form.stillImages.map((file, i) => (
                    <div key={i} className="text-xs text-emerald-600">
                      ✓ {file.name}
                    </div>
                  ))}
                </div>
              )}
            </label>
          </div>
        </div>
      ),
    },

    // Step 3: 상세 공연 정보
    {
      title: "상세 공연 정보",
      description: "공연 장소, 기간, 러닝타임 등을 입력해주세요",
      icon: "📅",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                공연 장소 <span className="text-rose-500">*</span>
              </span>
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                placeholder="예: 대학로 예술극장"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                공연 기간 <span className="text-rose-500">*</span>
              </span>
              <input
                name="period"
                value={form.period}
                onChange={handleChange}
                placeholder="예: 2025.01.10 ~ 2025.02.28"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">회차/시간</span>
              <input
                name="sessions"
                value={form.sessions}
                onChange={handleChange}
                placeholder="예: 화~금 19:30, 토일 14:00/19:00"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">러닝타임</span>
              <input
                name="runningTime"
                value={form.runningTime}
                onChange={handleChange}
                placeholder="예: 90분"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">관람연령</span>
              <select
                name="ageRating"
                value={form.ageRating}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              >
                <option value="전체관람가">전체관람가</option>
                <option value="7세이상">7세이상</option>
                <option value="12세이상">12세이상</option>
                <option value="15세이상">15세이상</option>
                <option value="19세이상">19세이상</option>
              </select>
            </label>
          </div>

          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">예매 링크 (공식 예매처)</span>
            <input
              type="url"
              name="ticketPurchaseUrl"
              value={form.ticketPurchaseUrl}
              onChange={handleChange}
              placeholder="https://ticket.example.com/..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>
        </div>
      ),
    },

    // Step 4: SNS & 해시태그
    {
      title: "SNS & 해시태그",
      description: "공식 SNS 계정과 해시태그를 입력해주세요",
      icon: "📱",
      content: (
        <div className="space-y-4">
          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">인스타그램 계정</span>
            <input
              name="instagramAccount"
              value={form.instagramAccount}
              onChange={handleChange}
              placeholder="@your_account"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>

          <div>
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">해시태그</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="#태그입력 후 엔터"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value) {
                        addHashtag(value.startsWith("#") ? value : `#${value}`);
                        e.currentTarget.value = "";
                      }
                    }
                  }}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5"
                />
              </div>
              {form.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </label>
          </div>

          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">기타 홍보 채널</span>
            <input
              type="url"
              name="promoChannel"
              value={form.promoChannel}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>
        </div>
      ),
    },

    // Step 5: 제작진 정보
    {
      title: "제작진 정보",
      description: "공연 제작진의 역할과 이름을 입력해주세요",
      icon: "👥",
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">작/연출, 조연출, 무대감독, 홍보 등</p>
            <button
              type="button"
              onClick={addProductionMember}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
            >
              + 제작진 추가
            </button>
          </div>

          {form.productionTeam.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">제작진을 추가해주세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.productionTeam.map((member, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    placeholder="역할 (예: 작/연출)"
                    value={member.role}
                    onChange={(e) => updateProductionMember(i, "role", e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5"
                  />
                  <input
                    placeholder="이름"
                    value={member.name}
                    onChange={(e) => updateProductionMember(i, "name", e.target.value)}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5"
                  />
                  <button
                    type="button"
                    onClick={() => removeProductionMember(i)}
                    className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 text-rose-600 hover:bg-rose-100"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },

    // Step 6: 초대권 이벤트 정보
    {
      title: "초대권 이벤트 정보",
      description: "초대권 배분 일정과 수량을 설정해주세요",
      icon: "🎫",
      content: (
        <div className="space-y-4">
          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">
              이벤트 제목 <span className="text-rose-500">*</span>
            </span>
            <input
              name="eventTitle"
              value={form.eventTitle}
              onChange={handleChange}
              placeholder="예: 문라이트 시사회 초대권"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">이벤트 설명</span>
            <textarea
              name="eventDescription"
              value={form.eventDescription}
              onChange={handleChange}
              placeholder="초대권 이벤트에 대한 설명"
              rows={2}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                이벤트 시작일 <span className="text-rose-500">*</span>
              </span>
              <input
                type="date"
                name="eventStartsAt"
                value={form.eventStartsAt}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                이벤트 종료일 <span className="text-rose-500">*</span>
              </span>
              <input
                type="date"
                name="eventEndsAt"
                value={form.eventEndsAt}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-slate-900">일자별 초대권 배분</span>
              <button
                type="button"
                onClick={addTicketAllocation}
                className="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral-dark"
              >
                + 일정 추가
              </button>
            </div>

            {form.ticketAllocations.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-500">초대권을 배분할 일정을 추가해주세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.ticketAllocations.map((allocation, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      type="date"
                      value={allocation.date}
                      onChange={(e) => updateTicketAllocation(i, "date", e.target.value)}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5"
                    />
                    <input
                      type="time"
                      value={allocation.time}
                      onChange={(e) => updateTicketAllocation(i, "time", e.target.value)}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-2.5"
                    />
                    <input
                      type="number"
                      min={1}
                      value={allocation.ticketCount}
                      onChange={(e) => updateTicketAllocation(i, "ticketCount", parseInt(e.target.value))}
                      placeholder="매수"
                      className="w-24 rounded-2xl border border-slate-200 px-4 py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => removeTicketAllocation(i)}
                      className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 text-rose-600 hover:bg-rose-100"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ),
    },

    // Step 7: 담당자 정보
    {
      title: "담당자 정보",
      description: "이벤트 담당자 연락처를 입력해주세요",
      icon: "📞",
      content: (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                이름 <span className="text-rose-500">*</span>
              </span>
              <input
                name="partnerName"
                value={form.partnerName}
                onChange={handleChange}
                placeholder="홍길동"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                이메일 <span className="text-rose-500">*</span>
              </span>
              <input
                type="email"
                name="partnerEmail"
                value={form.partnerEmail}
                onChange={handleChange}
                placeholder="partner@example.com"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                연락처 <span className="text-rose-500">*</span>
              </span>
              <input
                type="tel"
                name="partnerPhone"
                value={form.partnerPhone}
                onChange={handleChange}
                placeholder="010-1234-5678"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
              />
            </label>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="event-create" className="rounded-3xl border border-indigo-100 bg-white/90 p-8 shadow-xl backdrop-blur">
      <header className="space-y-1 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">초대권 이벤트 개설</p>
        <h2 className="text-2xl font-semibold text-slate-900">공연 정보 + 초대권 이벤트 상세 등록</h2>
        <p className="text-sm text-slate-600">
          공연의 모든 정보와 초대권 배분 일정을 상세히 등록하세요. 7단계로 구성되어 있습니다.
        </p>
      </header>

      <MultiStepForm
        steps={steps}
        action={handleSubmit}
        title="이벤트 등록"
        submitLabel="이벤트 등록 신청하기"
        isPending={isPending}
        isSuccess={submitResult?.success || false}
        message={submitResult?.message}
      />
    </section>
  );
}
