"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Loader2, Upload, AlertCircle } from "lucide-react";
import { updateEventCampaign } from "@/app/event-center/actions";
import { uploadPerformanceImage } from "@/app/event-center/upload-actions";

interface InitialData {
  title: string | null;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  ticket_purchase_url: string | null;
  venue_name: string | null;
  one_line_intro: string | null;
  poster_image: string | null;
}

interface Props {
  id: string;
  initialData: InitialData;
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

const INPUT_CLS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

export default function EditCampaignForm({ id, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialData.title ?? "");
  const [description, setDescription] = useState(initialData.description ?? "");
  const [startsAt, setStartsAt] = useState(toDatetimeLocal(initialData.starts_at));
  const [endsAt, setEndsAt] = useState(toDatetimeLocal(initialData.ends_at));
  const [ticketPurchaseUrl, setTicketPurchaseUrl] = useState(initialData.ticket_purchase_url ?? "");
  const [venueName, setVenueName] = useState(initialData.venue_name ?? "");
  const [oneLineIntro, setOneLineIntro] = useState(initialData.one_line_intro ?? "");
  const [posterImageUrl, setPosterImageUrl] = useState(initialData.poster_image ?? "");
  const [posterUploading, setPosterUploading] = useState(false);
  const [posterError, setPosterError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  async function handlePosterSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterUploading(true);
    setPosterError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "posters");
    const result = await uploadPerformanceImage(fd);

    if (result.success) {
      setPosterImageUrl(result.url);
    } else {
      setPosterError(result.error);
    }
    setPosterUploading(false);
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    startTransition(async () => {
      const result = await updateEventCampaign(id, {
        title,
        description: description || undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : "",
        endsAt: endsAt ? new Date(endsAt).toISOString() : "",
        ticketPurchaseUrl: ticketPurchaseUrl || undefined,
        venueName: venueName || undefined,
        oneLineIntro: oneLineIntro || undefined,
        posterImage: posterImageUrl || undefined,
      });

      if (result.success) {
        setSubmitSuccess(true);
        setTimeout(() => router.push("/event-center"), 1500);
      } else {
        setSubmitError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/event-center"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">
            이벤트 수정
          </p>
          <h1 className="text-xl font-bold text-foreground">승인 대기 이벤트 수정</h1>
        </div>
      </div>

      {/* Notice */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
        <p className="text-sm text-amber-700">
          수정 후에도 <strong>승인 대기</strong> 상태가 유지됩니다. 관리자 검토 후 최종 승인됩니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">
            이벤트 제목 <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLS}
            placeholder="이벤트 제목을 입력해 주세요"
            required
          />
        </div>

        {/* One-line intro */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">한 줄 소개</label>
          <input
            type="text"
            value={oneLineIntro}
            onChange={(e) => setOneLineIntro(e.target.value)}
            className={INPUT_CLS}
            placeholder="공연을 한 문장으로 소개해 주세요"
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">이벤트 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${INPUT_CLS} min-h-[120px] resize-y`}
            placeholder="이벤트에 대한 상세 설명을 입력해 주세요"
          />
        </div>

        {/* Venue */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">공연 장소</label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className={INPUT_CLS}
            placeholder="예: 예술의전당 자유소극장"
          />
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">
              이벤트 시작일 <span className="text-primary">*</span>
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-foreground">
              이벤트 종료일 <span className="text-primary">*</span>
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={INPUT_CLS}
              required
            />
          </div>
        </div>

        {/* Ticket URL */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-foreground">티켓 구매 링크</label>
          <input
            type="url"
            value={ticketPurchaseUrl}
            onChange={(e) => setTicketPurchaseUrl(e.target.value)}
            className={INPUT_CLS}
            placeholder="https://example.com/ticket"
          />
        </div>

        {/* Poster image */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">포스터 이미지</label>
          {posterImageUrl ? (
            <div className="relative flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                <Image
                  src={posterImageUrl}
                  alt="포스터 미리보기"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">포스터가 업로드되었습니다.</p>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                  <Upload className="h-3 w-3" />
                  이미지 교체
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePosterSelect}
                    className="sr-only"
                    disabled={posterUploading}
                  />
                </label>
              </div>
              {posterUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/50">
              {posterUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">업로드 중...</span>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm font-medium text-foreground">포스터 이미지 업로드</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      JPG, PNG, WebP — 최대 5MB
                    </p>
                  </div>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handlePosterSelect}
                className="sr-only"
                disabled={posterUploading}
              />
            </label>
          )}
          {posterError && (
            <p className="text-xs text-destructive">{posterError}</p>
          )}
        </div>

        {/* Error / success */}
        {submitError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{submitError}</p>
          </div>
        )}
        {submitSuccess && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            ✅ 수정이 완료되었습니다. 이벤트 허브로 이동합니다...
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-6">
          <Link
            href="/event-center"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isPending || posterUploading || submitSuccess}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                수정 저장
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
