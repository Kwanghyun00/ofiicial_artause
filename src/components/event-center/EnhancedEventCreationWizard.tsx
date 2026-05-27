"use client";

import { type ChangeEvent, useId, useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { MultiStepForm, FormStep } from "@/components/forms/MultiStepForm";
import { createEnhancedEventCampaign } from "@/app/event-center/actions";
import { uploadPerformanceImage, deletePerformanceImage } from "@/app/event-center/upload-actions";

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
  oneLineIntro: string;
  performanceTitle: string;
  performanceDescription: string;
  posterImageUrl: string;       // 업로드 완료된 공개 URL
  stillImageUrls: string[];     // 업로드 완료된 공개 URL 배열
  venue: string;
  period: string;
  sessions: string;
  runningTime: string;
  ageRating: string;
  ticketPurchaseUrl: string;
  instagramAccount: string;
  hashtags: string[];
  promoChannel: string;
  productionTeam: ProductionMember[];
  eventTitle: string;
  eventDescription: string;
  eventStartsAt: string;
  eventEndsAt: string;
  ticketAllocations: TicketAllocation[];
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
};

const initialState: FormState = {
  oneLineIntro: "",
  performanceTitle: "",
  performanceDescription: "",
  posterImageUrl: "",
  stillImageUrls: [],
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

export function EnhancedEventCreationWizard({ partnerEmail: sessionEmail }: { partnerEmail?: string }) {
  const [form, setForm] = useState<FormState>({
    ...initialState,
    partnerEmail: sessionEmail ?? "",
  });
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [stillUploading, setStillUploading] = useState(false);
  const [stillError, setStillError] = useState<string | null>(null);
  useId();

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ─── 포스터 업로드 ─────────────────────────────────────────────────────────
  const handlePosterSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPosterError(null);
    setPosterUploading(true);

    // 기존 이미지가 있으면 삭제
    if (form.posterImageUrl) {
      await deletePerformanceImage(form.posterImageUrl).catch(() => {});
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "posters");
    const result = await uploadPerformanceImage(fd);

    if (result.success) {
      setForm((prev) => ({ ...prev, posterImageUrl: result.url }));
    } else {
      setPosterError(result.error);
    }
    setPosterUploading(false);
    // 파일 input 초기화 (같은 파일 재선택 허용)
    event.target.value = "";
  };

  const removePoster = async () => {
    if (form.posterImageUrl) {
      await deletePerformanceImage(form.posterImageUrl).catch(() => {});
    }
    setForm((prev) => ({ ...prev, posterImageUrl: "" }));
  };

  // ─── 스틸 업로드 ───────────────────────────────────────────────────────────
  const handleStillsSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const remaining = 5 - form.stillImageUrls.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) {
      setStillError("스틸 이미지는 최대 5장까지 업로드할 수 있습니다.");
      return;
    }
    setStillError(null);
    setStillUploading(true);

    const newUrls: string[] = [];
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "stills");
      const result = await uploadPerformanceImage(fd);
      if (result.success) {
        newUrls.push(result.url);
      } else {
        setStillError(result.error);
        break;
      }
    }
    setForm((prev) => ({ ...prev, stillImageUrls: [...prev.stillImageUrls, ...newUrls] }));
    setStillUploading(false);
    event.target.value = "";
  };

  const removeStill = async (index: number) => {
    const url = form.stillImageUrls[index];
    if (url) await deletePerformanceImage(url).catch(() => {});
    setForm((prev) => ({
      ...prev,
      stillImageUrls: prev.stillImageUrls.filter((_, i) => i !== index),
    }));
  };

  // 스틸 순서 변경
  const moveStill = (from: number, to: number) => {
    if (to < 0 || to >= form.stillImageUrls.length) return;
    setForm((prev) => {
      const arr = [...prev.stillImageUrls];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...prev, stillImageUrls: arr };
    });
  };

  // ─── 해시태그 ──────────────────────────────────────────────────────────────
  const addHashtag = (tag: string) => {
    if (tag && !form.hashtags.includes(tag)) {
      setForm((prev) => ({ ...prev, hashtags: [...prev.hashtags, tag] }));
    }
  };
  const removeHashtag = (tag: string) => {
    setForm((prev) => ({ ...prev, hashtags: prev.hashtags.filter((t) => t !== tag) }));
  };

  // ─── 제작진 ────────────────────────────────────────────────────────────────
  const addProductionMember = () => {
    setForm((prev) => ({ ...prev, productionTeam: [...prev.productionTeam, { role: "", name: "" }] }));
  };
  const updateProductionMember = (index: number, field: "role" | "name", value: string) => {
    setForm((prev) => {
      const updated = [...prev.productionTeam];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, productionTeam: updated };
    });
  };
  const removeProductionMember = (index: number) => {
    setForm((prev) => ({ ...prev, productionTeam: prev.productionTeam.filter((_, i) => i !== index) }));
  };

  // ─── 티켓 배분 ─────────────────────────────────────────────────────────────
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
    setForm((prev) => ({ ...prev, ticketAllocations: prev.ticketAllocations.filter((_, i) => i !== index) }));
  };

  // ─── 최종 제출 ─────────────────────────────────────────────────────────────
  const handleSubmit = async (_formData: FormData) => {
    startTransition(async () => {
      const result = await createEnhancedEventCampaign({
        oneLineIntro: form.oneLineIntro,
        posterImage: form.posterImageUrl,
        stillImages: form.stillImageUrls,
        eventTitle: form.eventTitle || form.performanceTitle,
        eventDescription: form.eventDescription || form.performanceDescription,
        venueName: form.venue,
        venueAddress: "",
        performancePeriodStart: form.eventStartsAt,
        performancePeriodEnd: form.eventEndsAt,
        sessionsPerWeek: 0,
        runningTime: parseInt(form.runningTime) || 0,
        ageRating: form.ageRating,
        snsInstagram: form.instagramAccount,
        snsYoutube: "",
        snsTiktok: "",
        hashtags: form.hashtags,
        productionTeam: form.productionTeam.map((m) => ({ ...m, contact: "" })),
        ticketAllocations: form.ticketAllocations.map((a) => ({
          date: a.date,
          time: a.time,
          quantity: a.ticketCount,
        })),
        startsAt: form.eventStartsAt,
        endsAt: form.eventEndsAt,
        ticketPurchaseUrl: form.ticketPurchaseUrl,
        partnerEmail: form.partnerEmail,
        partnerPhone: form.partnerPhone,
      });

      setSubmitResult({
        success: result.success,
        message: result.success
          ? "이벤트 등록 신청이 완료됐습니다. 관리자 승인 후 공개됩니다."
          : ((result as { success: false; error: string }).error ?? "등록 중 오류가 발생했습니다."),
      });
    });
  };

  // ─── 스텝 정의 ─────────────────────────────────────────────────────────────
  const steps: FormStep[] = [
    // Step 1: 기본 공연 정보
    {
      title: "기본 공연 정보",
      description: "공연의 제목과 소개를 입력해주세요",
      icon: "🎭",
      content: (
        <div className="space-y-4">
          <FieldWrapper label="한줄 소개 (15-20자)" required>
            <input
              name="oneLineIntro"
              value={form.oneLineIntro}
              onChange={handleChange}
              maxLength={20}
              placeholder="공연을 한 문장으로 표현해주세요"
              required
              className={INPUT_CLS}
            />
            <span className="text-xs text-muted-foreground">{form.oneLineIntro.length}/20자</span>
          </FieldWrapper>
          <FieldWrapper label="공연 제목" required>
            <input name="performanceTitle" value={form.performanceTitle} onChange={handleChange}
              placeholder="예: 뮤지컬 문라이트" required className={INPUT_CLS} />
          </FieldWrapper>
          <FieldWrapper label="공연 소개">
            <textarea name="performanceDescription" value={form.performanceDescription} onChange={handleChange}
              placeholder="공연에 대한 상세한 설명을 입력해주세요" rows={5} className={INPUT_CLS} />
          </FieldWrapper>
        </div>
      ),
    },

    // Step 2: 비주얼 자료 (이미지 업로드)
    {
      title: "비주얼 자료",
      description: "포스터와 공연 스틸 사진을 업로드해주세요",
      icon: "📸",
      content: (
        <div className="space-y-8">
          {/* 포스터 */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              포스터 / 키비주얼 <span className="text-destructive">*</span>
            </p>
            {form.posterImageUrl ? (
              <div className="flex items-start gap-4">
                <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl border border-border">
                  <Image src={form.posterImageUrl} alt="포스터 미리보기" fill className="object-cover" sizes="112px" />
                </div>
                <div className="space-y-2 pt-1">
                  <p className="text-xs text-emerald-600 font-semibold">✓ 업로드 완료</p>
                  <button
                    type="button"
                    onClick={removePoster}
                    className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    이미지 삭제
                  </button>
                  <label className="block">
                    <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary">
                      <ImagePlus className="h-3 w-3" />
                      이미지 교체
                    </span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterSelect} className="sr-only" />
                  </label>
                </div>
              </div>
            ) : (
              <label className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors ${
                posterUploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}>
                {posterUploading ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-sm text-primary font-semibold">업로드 중...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-muted-foreground/50" />
                    <div className="text-center">
                      <span className="text-sm font-semibold text-foreground">클릭하여 포스터 업로드</span>
                      <p className="mt-0.5 text-xs text-muted-foreground">JPG, PNG, WebP · 최대 5MB · 세로 비율 권장</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePosterSelect} disabled={posterUploading} className="sr-only" />
              </label>
            )}
            {posterError && <p className="text-xs text-destructive">{posterError}</p>}
          </div>

          {/* 스틸 이미지 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                공연 스틸 사진 <span className="text-muted-foreground font-normal">(최대 5장)</span>
              </p>
              <span className="text-xs text-muted-foreground">{form.stillImageUrls.length}/5</span>
            </div>

            {/* 업로드된 스틸 그리드 */}
            {form.stillImageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {form.stillImageUrls.map((url, i) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                    <Image src={url} alt={`스틸 ${i + 1}`} fill className="object-cover" sizes="100px" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" onClick={() => removeStill(i)}
                        className="rounded-full bg-destructive/80 p-1.5 text-white hover:bg-destructive">
                        <X className="h-3 w-3" />
                      </button>
                      <div className="flex gap-1">
                        {i > 0 && (
                          <button type="button" onClick={() => moveStill(i, i - 1)}
                            className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white hover:bg-white/40">◀</button>
                        )}
                        {i < form.stillImageUrls.length - 1 && (
                          <button type="button" onClick={() => moveStill(i, i + 1)}
                            className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white hover:bg-white/40">▶</button>
                        )}
                      </div>
                    </div>
                    <span className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{i + 1}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 업로드 버튼 */}
            {form.stillImageUrls.length < 5 && (
              <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed p-5 transition-colors ${
                stillUploading ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}>
                {stillUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm text-primary font-semibold">업로드 중...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-muted-foreground/50" />
                    <div>
                      <span className="text-sm font-semibold text-foreground">스틸 사진 추가</span>
                      <p className="text-xs text-muted-foreground">여러 파일 동시 선택 가능 · 남은 {5 - form.stillImageUrls.length}장</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleStillsSelect} disabled={stillUploading} className="sr-only" />
              </label>
            )}
            {stillError && <p className="text-xs text-destructive">{stillError}</p>}
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
            <FieldWrapper label="공연 장소" required>
              <input name="venue" value={form.venue} onChange={handleChange}
                placeholder="예: 대학로 예술극장" required className={INPUT_CLS} />
            </FieldWrapper>
            <FieldWrapper label="공연 기간" required>
              <input name="period" value={form.period} onChange={handleChange}
                placeholder="예: 2026.06.01 ~ 2026.07.31" required className={INPUT_CLS} />
            </FieldWrapper>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FieldWrapper label="회차/시간">
              <input name="sessions" value={form.sessions} onChange={handleChange}
                placeholder="예: 화~금 19:30, 토일 14:00" className={INPUT_CLS} />
            </FieldWrapper>
            <FieldWrapper label="러닝타임">
              <input name="runningTime" value={form.runningTime} onChange={handleChange}
                placeholder="예: 90분" className={INPUT_CLS} />
            </FieldWrapper>
            <FieldWrapper label="관람연령">
              <select name="ageRating" value={form.ageRating} onChange={handleChange} className={INPUT_CLS}>
                <option value="전체관람가">전체관람가</option>
                <option value="7세이상">7세이상</option>
                <option value="12세이상">12세이상</option>
                <option value="15세이상">15세이상</option>
                <option value="19세이상">19세이상</option>
              </select>
            </FieldWrapper>
          </div>
          <FieldWrapper label="예매 링크">
            <input type="url" name="ticketPurchaseUrl" value={form.ticketPurchaseUrl} onChange={handleChange}
              placeholder="https://ticket.example.com/..." className={INPUT_CLS} />
          </FieldWrapper>
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
          <FieldWrapper label="인스타그램 계정">
            <input name="instagramAccount" value={form.instagramAccount} onChange={handleChange}
              placeholder="@your_account" className={INPUT_CLS} />
          </FieldWrapper>
          <FieldWrapper label="해시태그">
            <input type="text" placeholder="#태그입력 후 엔터"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = e.currentTarget.value.trim();
                  if (v) { addHashtag(v.startsWith("#") ? v : `#${v}`); e.currentTarget.value = ""; }
                }
              }}
              className={INPUT_CLS}
            />
            {form.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.hashtags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {tag}
                    <button type="button" onClick={() => removeHashtag(tag)} className="text-primary/60 hover:text-primary">×</button>
                  </span>
                ))}
              </div>
            )}
          </FieldWrapper>
          <FieldWrapper label="기타 홍보 채널">
            <input type="url" name="promoChannel" value={form.promoChannel} onChange={handleChange}
              placeholder="https://..." className={INPUT_CLS} />
          </FieldWrapper>
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">작/연출, 조연출, 무대감독, 홍보 등</p>
            <button type="button" onClick={addProductionMember}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              + 제작진 추가
            </button>
          </div>
          {form.productionTeam.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
              <p className="text-sm text-muted-foreground">제작진을 추가해주세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {form.productionTeam.map((member, i) => (
                <div key={i} className="flex gap-3">
                  <input placeholder="역할 (예: 작/연출)" value={member.role}
                    onChange={(e) => updateProductionMember(i, "role", e.target.value)} className={`flex-1 ${INPUT_CLS}`} />
                  <input placeholder="이름" value={member.name}
                    onChange={(e) => updateProductionMember(i, "name", e.target.value)} className={`flex-1 ${INPUT_CLS}`} />
                  <button type="button" onClick={() => removeProductionMember(i)}
                    className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 text-destructive hover:bg-destructive/10">삭제</button>
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
          <FieldWrapper label="이벤트 제목" required>
            <input name="eventTitle" value={form.eventTitle} onChange={handleChange}
              placeholder="예: 문라이트 시사회 초대권" required className={INPUT_CLS} />
          </FieldWrapper>
          <FieldWrapper label="이벤트 설명">
            <textarea name="eventDescription" value={form.eventDescription} onChange={handleChange}
              placeholder="초대권 이벤트에 대한 설명" rows={2} className={INPUT_CLS} />
          </FieldWrapper>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldWrapper label="이벤트 시작일" required>
              <input type="date" name="eventStartsAt" value={form.eventStartsAt} onChange={handleChange} required className={INPUT_CLS} />
            </FieldWrapper>
            <FieldWrapper label="이벤트 종료일" required>
              <input type="date" name="eventEndsAt" value={form.eventEndsAt} onChange={handleChange} required className={INPUT_CLS} />
            </FieldWrapper>
          </div>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">일자별 초대권 배분</span>
              <button type="button" onClick={addTicketAllocation}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                + 일정 추가
              </button>
            </div>
            {form.ticketAllocations.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/20 p-8 text-center">
                <p className="text-sm text-muted-foreground">초대권을 배분할 일정을 추가해주세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.ticketAllocations.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <input type="date" value={a.date} onChange={(e) => updateTicketAllocation(i, "date", e.target.value)} className={`flex-1 ${INPUT_CLS}`} />
                    <input type="time" value={a.time} onChange={(e) => updateTicketAllocation(i, "time", e.target.value)} className={`flex-1 ${INPUT_CLS}`} />
                    <input type="number" min={1} value={a.ticketCount} onChange={(e) => updateTicketAllocation(i, "ticketCount", parseInt(e.target.value))}
                      placeholder="매수" className={`w-24 ${INPUT_CLS}`} />
                    <button type="button" onClick={() => removeTicketAllocation(i)}
                      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 text-destructive hover:bg-destructive/10">삭제</button>
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
            <FieldWrapper label="이름" required>
              <input name="partnerName" value={form.partnerName} onChange={handleChange}
                placeholder="홍길동" required className={INPUT_CLS} />
            </FieldWrapper>
            <FieldWrapper label="이메일">
              <input type="email" name="partnerEmail" value={form.partnerEmail} onChange={handleChange}
                placeholder="partner@example.com" readOnly={Boolean(sessionEmail)}
                className={`${INPUT_CLS} ${sessionEmail ? "opacity-60" : ""}`} />
              {sessionEmail && <p className="text-xs text-muted-foreground">로그인 이메일이 자동으로 사용됩니다</p>}
            </FieldWrapper>
            <FieldWrapper label="연락처" required>
              <input type="tel" name="partnerPhone" value={form.partnerPhone} onChange={handleChange}
                placeholder="010-1234-5678" required className={INPUT_CLS} />
            </FieldWrapper>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="event-create" className="stage-panel p-8">
      <header className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">초대권 이벤트 개설</p>
        <h2 className="text-2xl font-semibold text-foreground">공연 정보 + 초대권 이벤트 상세 등록</h2>
        <p className="text-sm text-muted-foreground">
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

// ─── 유틸 컴포넌트 ────────────────────────────────────────────────────────────

const INPUT_CLS = "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"

function FieldWrapper({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  )
}
