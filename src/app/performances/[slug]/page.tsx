/**
 * 공연 상세 페이지 - 한국형 리디자인
 *
 * 5초 안에 "언제, 어디서, 어떤 공연인지, 왜 봐야 하는지" 전달
 * - 히어로 섹션 (좌: 정보, 우: 신청 카드)
 * - 시놉시스, 관람 포인트, 관람 안내
 * - 타임테이블, 출연진, 후기, 유의사항
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPerformanceBySlug } from "@/lib/supabase/queries";

// 디자인 토큰
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
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const performance = await getPerformanceBySlug(slug);

  if (!performance || !("title" in performance)) {
    return { title: "공연을 찾을 수 없습니다" };
  }

  return {
    title: `${performance.title} | Artause`,
    description: performance.synopsis || `${performance.title} 공연 정보`,
  };
}

export default async function PerformancePage({ params }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  const performanceData = await getPerformanceBySlug(slug);

  if (!performanceData || !("title" in performanceData)) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const performance = performanceData as any;

  const now = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeCampaigns = performance.ticket_campaigns?.filter((campaign: any) => {
    const starts = campaign.starts_at ? new Date(campaign.starts_at).getTime() : null;
    const ends = campaign.ends_at ? new Date(campaign.ends_at).getTime() : null;
    if (starts && starts > now) return false;
    if (ends && ends < now) return false;
    return true;
  }) || [];

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
  };

  const period = performance.period_start || performance.period_end
    ? `${formatDate(performance.period_start) || "미정"} ~ ${formatDate(performance.period_end) || "미정"}`
    : null;

  // 샘플 회차 데이터 (실제 데이터로 교체)
  const showTimes = performance.available_dates || [
    { date: "2025-12-01", time: "19:30", remaining: 5 },
    { date: "2025-12-02", time: "16:00", remaining: 3 },
    { date: "2025-12-02", time: "19:30", remaining: 8 },
    { date: "2025-12-03", time: "19:30", remaining: 0 },
  ];

  // 관람 포인트 (실제 데이터로 교체)
  const viewingPoints = [
    { title: "관객 참여형 연출", desc: "배우와 관객이 함께 만들어가는 생동감 넘치는 무대를 경험하세요." },
    { title: "몰입감 있는 무대", desc: "360도 객석 배치로 어느 좌석에서든 최고의 시야를 보장합니다." },
    { title: "감성적인 음악", desc: "라이브 연주와 함께하는 OST가 작품의 감동을 배가시킵니다." },
  ];

  // 출연진 (실제 데이터로 교체)
  const cast = [
    { name: "김민수", role: "주연", image: null },
    { name: "이서연", role: "조연", image: null },
    { name: "박지훈", role: "조연", image: null },
  ];

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
          <Link href="/performances" className="hover:underline">공연</Link>
          <span>/</span>
          <span style={{ color: colors.text }} className="font-medium truncate">{performance.title}</span>
        </nav>

        {/* ========== 1. 히어로 섹션 ========== */}
        <section className="grid gap-6 lg:grid-cols-[1fr,380px]">
          {/* 좌측: 포스터 + 기본 정보 */}
          <div className="space-y-6">
            {/* 포스터 + 오버레이 정보 */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="relative aspect-[16/9] sm:aspect-[2/1]">
                {performance.poster_url ? (
                  <Image
                    src={performance.poster_url}
                    alt={`${performance.title} 포스터`}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div
                    className="flex h-full items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${colors.pastelPurple}, ${colors.pastelPink})` }}
                  >
                    <span className="text-8xl">🎭</span>
                  </div>
                )}
                {/* 그라데이션 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* 오버레이 정보 */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                  {/* 카테고리 */}
                  {performance.category && (
                    <span
                      className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: colors.magenta }}
                    >
                      {performance.category}
                    </span>
                  )}

                  {/* 제목 */}
                  <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                    {performance.title}
                  </h1>

                  {/* 훅 카피 */}
                  <p className="mt-2 text-sm text-white/90 sm:text-base">
                    {performance.hook_copy || "당신의 마음을 사로잡을 특별한 공연"}
                  </p>
                </div>
              </div>
            </div>

            {/* 해시태그 */}
            <div className="flex flex-wrap gap-2">
              {(performance.tags || ["연극", "대학로", "감동"]).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1.5 text-sm font-medium"
                  style={{ backgroundColor: colors.pastelPurple, color: colors.navy }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* 한 줄 요약 정보 */}
            <div
              className="flex flex-wrap items-center gap-4 rounded-2xl p-4"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
            >
              {performance.venue && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" style={{ color: colors.navy }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span style={{ color: colors.text }}>{performance.venue}</span>
                </div>
              )}
              {period && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" style={{ color: colors.navy }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span style={{ color: colors.text }}>{period}</span>
                </div>
              )}
              {performance.running_time && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" style={{ color: colors.navy }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ color: colors.text }}>{performance.running_time}분</span>
                </div>
              )}
              {performance.age_rating && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4" style={{ color: colors.navy }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span style={{ color: colors.text }}>{performance.age_rating}</span>
                </div>
              )}
            </div>
          </div>

          {/* 우측: 고정 신청 카드 */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div
              className="overflow-hidden rounded-2xl shadow-xl"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
            >
              {/* 카드 헤더 */}
              <div className="p-5" style={{ backgroundColor: colors.navy }}>
                <h2 className="text-lg font-bold text-white">예매 / 초대권 신청</h2>
                <p className="mt-1 text-sm text-white/80">원하는 회차를 선택하세요</p>
              </div>

              <div className="p-5 space-y-4">
                {/* 가격 정보 */}
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textMuted }} className="text-sm">티켓 가격</span>
                  <span style={{ color: colors.text }} className="text-lg font-bold">
                    {performance.ticket_price || "₩30,000"}
                  </span>
                </div>

                {/* 초대권 정보 */}
                {activeCampaigns.length > 0 && (
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ backgroundColor: colors.pastelPurple }}
                  >
                    <span className="text-sm font-medium" style={{ color: colors.navy }}>
                      🎫 초대권 이벤트 진행 중!
                    </span>
                  </div>
                )}

                {/* 버튼 그룹 */}
                <div className="space-y-3 pt-2">
                  {performance.ticket_purchase_url ? (
                    <a
                      href={performance.ticket_purchase_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: colors.navy }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                      </svg>
                      예매하기
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white opacity-50"
                      style={{ backgroundColor: colors.navy }}
                    >
                      예매 준비 중
                    </button>
                  )}

                  {activeCampaigns.length > 0 && (
                    <Link
                      href={`/events/tickets/${activeCampaigns[0].slug || activeCampaigns[0].id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:opacity-90"
                      style={{ background: `linear-gradient(135deg, ${colors.magenta}, ${colors.magentaLight})` }}
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      초대권 응모하기
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 2. 시놉시스 섹션 ========== */}
        {performance.synopsis && (
          <section className="mt-10">
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
            >
              <h2 className="text-xl font-bold sm:text-2xl" style={{ color: colors.navy }}>
                시놉시스
              </h2>
              <div className="mt-4 max-w-3xl space-y-4">
                <p
                  className="whitespace-pre-wrap text-base leading-relaxed sm:text-lg"
                  style={{ color: colors.text }}
                >
                  {performance.synopsis}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========== 3. 관람 포인트 섹션 ========== */}
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={{ color: colors.navy }}>
            관람 포인트
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {viewingPoints.map((point, index) => (
              <div
                key={index}
                className="rounded-2xl p-5"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
              >
                <div
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: colors.navy }}
                >
                  {index + 1}
                </div>
                <h3 className="font-bold" style={{ color: colors.text }}>{point.title}</h3>
                <p className="mt-2 text-sm" style={{ color: colors.textMuted }}>{point.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== 4. 관람 안내 섹션 ========== */}
        <section className="mt-10">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          >
            <h2 className="text-xl font-bold sm:text-2xl" style={{ color: colors.navy }}>
              관람 안내
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoRow icon="calendar" label="공연 기간" value={period || "추후 공지"} />
              <InfoRow icon="clock" label="공연 시간" value={performance.show_times || "평일 19:30 / 주말 14:00, 18:00"} />
              <InfoRow icon="timer" label="러닝타임" value={performance.running_time ? `${performance.running_time}분 (인터미션 포함)` : "약 100분"} />
              <InfoRow icon="user" label="관람 등급" value={performance.age_rating || "만 12세 이상"} />
              <InfoRow icon="ticket" label="티켓 가격" value={performance.ticket_price || "R석 55,000원 / S석 40,000원"} />
              <InfoRow icon="location" label="장소" value={performance.venue || "대학로 소극장"} />
            </div>

            {performance.venue_address && (
              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm" style={{ color: colors.textMuted }}>
                  📍 {performance.venue_address}
                </span>
                <button
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                  style={{ backgroundColor: colors.navy }}
                >
                  지도 보기
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========== 5. 타임테이블 / 회차 선택 섹션 ========== */}
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={{ color: colors.navy }}>
            공연 일정
          </h2>
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          >
            <div className="flex flex-wrap gap-3">
              {Array.isArray(showTimes) && showTimes.map((slot: { date: string; time: string; remaining: number } | string, index: number) => {
                const isObject = typeof slot === 'object';
                const dateStr = isObject ? slot.date : slot;
                const time = isObject ? slot.time : "19:30";
                const remaining = isObject ? slot.remaining : 5;
                const isSoldOut = remaining === 0;

                return (
                  <button
                    key={index}
                    disabled={isSoldOut}
                    className={`relative flex flex-col items-center rounded-xl px-4 py-3 text-sm transition-all ${
                      isSoldOut ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: isSoldOut ? "#f3f4f6" : colors.pastelPurple,
                      border: `2px solid ${isSoldOut ? colors.border : colors.navy}`,
                      color: isSoldOut ? colors.textMuted : colors.navy,
                    }}
                  >
                    <span className="font-bold">{formatShortDate(dateStr)}</span>
                    <span className="text-xs">{time}</span>
                    {!isSoldOut && remaining <= 3 && (
                      <span
                        className="absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: colors.magenta }}
                      >
                        {remaining}매
                      </span>
                    )}
                    {isSoldOut && (
                      <span className="mt-1 text-[10px] font-bold" style={{ color: colors.textMuted }}>
                        마감
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========== 6. 출연 / 제작진 섹션 ========== */}
        <section className="mt-10">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={{ color: colors.navy }}>
            출연 / 제작진
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 출연진 */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
            >
              <h3 className="mb-4 font-bold" style={{ color: colors.text }}>출연</h3>
              <div className="grid grid-cols-3 gap-3">
                {cast.map((actor, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
                      style={{ backgroundColor: colors.pastelPurple }}
                    >
                      {actor.image ? (
                        <Image src={actor.image} alt={actor.name} width={64} height={64} className="rounded-full object-cover" />
                      ) : (
                        "👤"
                      )}
                    </div>
                    <p className="text-xs font-medium" style={{ color: colors.text }}>{actor.name}</p>
                    <p className="text-[10px]" style={{ color: colors.textMuted }}>{actor.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 제작진 */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
            >
              <h3 className="mb-4 font-bold" style={{ color: colors.text }}>제작진</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>연출</span>
                  <span style={{ color: colors.text }}>{performance.director || "홍길동"}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>극본</span>
                  <span style={{ color: colors.text }}>{performance.writer || "김작가"}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>음악</span>
                  <span style={{ color: colors.text }}>{performance.music || "이음악"}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>기획</span>
                  <span style={{ color: colors.text }}>{performance.organization || "아르타우스"}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== 7. 관객 후기 섹션 ========== */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold sm:text-2xl" style={{ color: colors.navy }}>
              관객 후기
            </h2>
            <button
              className="text-sm font-medium hover:underline"
              style={{ color: colors.navy }}
            >
              더보기 →
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { rating: 5, text: "정말 감동적인 공연이었어요. 배우들의 연기가 압권!", author: "공연러버" },
              { rating: 4, text: "스토리 전개가 탄탄하고 무대 연출이 인상적이었습니다.", author: "연극덕후" },
              { rating: 5, text: "두 번째 관람인데도 새롭게 다가오는 작품. 강추합니다!", author: "재관람러" },
            ].map((review, index) => (
              <div
                key={index}
                className="rounded-2xl p-5"
                style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
              >
                <div className="mb-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-sm" style={{ color: i < review.rating ? "#FCD34D" : colors.border }}>
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm" style={{ color: colors.text }}>{review.text}</p>
                <p className="mt-3 text-xs" style={{ color: colors.textMuted }}>- {review.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========== 8. 유의 사항 / 약관 요약 섹션 ========== */}
        <section className="mt-10 mb-10">
          <h2 className="mb-5 text-xl font-bold sm:text-2xl" style={{ color: colors.navy }}>
            유의 사항
          </h2>
          <div
            className="space-y-2 rounded-2xl p-5"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}
          >
            <AccordionItem title="예매 및 취소 안내" defaultOpen>
              <ul className="list-disc space-y-1 pl-4 text-sm" style={{ color: colors.textMuted }}>
                <li>공연 7일 전까지 100% 환불 가능</li>
                <li>공연 3일 전까지 50% 환불 가능</li>
                <li>공연 당일 취소/환불 불가</li>
              </ul>
            </AccordionItem>
            <AccordionItem title="관람 에티켓">
              <ul className="list-disc space-y-1 pl-4 text-sm" style={{ color: colors.textMuted }}>
                <li>공연 시작 10분 전까지 입장 완료해주세요</li>
                <li>공연 중 촬영 및 녹음은 금지됩니다</li>
                <li>휴대폰은 진동 또는 무음으로 설정해주세요</li>
              </ul>
            </AccordionItem>
            <AccordionItem title="초대권 이벤트 규정">
              <ul className="list-disc space-y-1 pl-4 text-sm" style={{ color: colors.textMuted }}>
                <li>초대권 당첨 후 노쇼 시 향후 응모가 제한될 수 있습니다</li>
                <li>당첨된 초대권의 양도 및 판매는 불가합니다</li>
                <li>관람 후 SNS 후기 작성은 필수입니다</li>
              </ul>
            </AccordionItem>
          </div>
        </section>
      </div>
    </div>
  );
}

// 정보 행 컴포넌트
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const colors = {
    navy: "#293380",
    text: "#1a1a2e",
    textMuted: "#6B6560",
  };

  const icons: Record<string, React.ReactNode> = {
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    timer: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    ticket: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5z" />,
    location: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>,
  };

  return (
    <div className="flex items-center gap-3">
      <svg className="h-5 w-5 shrink-0" style={{ color: colors.navy }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {icons[icon]}
      </svg>
      <div className="flex-1">
        <span className="text-xs" style={{ color: colors.textMuted }}>{label}</span>
        <p className="text-sm font-medium" style={{ color: colors.text }}>{value}</p>
      </div>
    </div>
  );
}

// 아코디언 컴포넌트
function AccordionItem({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const colors = {
    navy: "#293380",
    text: "#1a1a2e",
    border: "#E8E3DC",
    pastelPurple: "#F0EFF7",
  };

  return (
    <details open={defaultOpen} className="group">
      <summary
        className="flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 transition-colors hover:bg-gray-50"
        style={{ backgroundColor: colors.pastelPurple }}
      >
        <span className="text-sm font-semibold" style={{ color: colors.navy }}>{title}</span>
        <svg
          className="h-4 w-4 transition-transform group-open:rotate-180"
          style={{ color: colors.navy }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 py-3">
        {children}
      </div>
    </details>
  );
}
