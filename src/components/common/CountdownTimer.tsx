"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  /** 마감 날짜/시간 (ISO 8601 문자열) */
  targetDate: string;
  /** 작은 크기로 표시 (기본값: false) */
  compact?: boolean;
};

type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

/**
 * CountdownTimer 컴포넌트
 *
 * 지정된 날짜까지 남은 시간을 실시간으로 표시합니다.
 *
 * 주요 기능:
 * - 실시간 카운트다운 (1초마다 업데이트)
 * - 일/시간/분/초 단위 표시
 * - 마감 시 "마감됨" 표시
 * - 긴급도에 따른 색상 변화 (24시간 미만: 빨강, 3일 미만: 주황)
 */
export function CountdownTimer({ targetDate, compact = false }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining(targetDate)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeRemaining.isExpired) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-slate-100 ${
          compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
        }`}
        role="status"
        aria-label="이벤트 마감됨"
      >
        <span className="text-slate-500">⏰</span>
        <span className="font-semibold text-slate-600">마감됨</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeRemaining;
  const totalHours = days * 24 + hours;

  // 긴급도에 따른 색상 결정
  const urgencyLevel = totalHours < 24 ? "critical" : totalHours < 72 ? "warning" : "normal";

  const colorClasses = {
    critical: "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200 text-rose-900",
    warning: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-900",
    normal: "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 text-indigo-900",
  };

  const dotColors = {
    critical: "bg-rose-500",
    warning: "bg-orange-500",
    normal: "bg-indigo-500",
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm ${colorClasses[urgencyLevel]}`}
        role="timer"
        aria-label={`마감까지 ${days}일 ${hours}시간 ${minutes}분 ${seconds}초 남음`}
        aria-live="off"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[urgencyLevel]} animate-pulse`} />
        {days > 0 && <span>{days}일</span>}
        <span>{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-2xl border-2 px-4 py-3 ${colorClasses[urgencyLevel]}`}
      role="timer"
      aria-label={`마감까지 ${days}일 ${hours}시간 ${minutes}분 ${seconds}초 남음`}
      aria-live="polite"
    >
      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotColors[urgencyLevel]} animate-pulse`} />
        <span className="text-sm font-bold">마감까지</span>
      </span>
      <div className="flex items-center gap-2 text-sm font-bold">
        {days > 0 && (
          <>
            <TimeUnit value={days} label="일" />
            <Separator />
          </>
        )}
        <TimeUnit value={hours} label="시간" />
        <Separator />
        <TimeUnit value={minutes} label="분" />
        <Separator />
        <TimeUnit value={seconds} label="초" />
      </div>
    </div>
  );
}

/**
 * 남은 시간 계산 함수
 */
function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const difference = target - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}

/**
 * 시간 단위 표시 컴포넌트
 */
function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="text-lg font-black tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-xs font-semibold opacity-70">{label}</span>
    </span>
  );
}

/**
 * 구분자 컴포넌트
 */
function Separator() {
  return <span className="text-lg font-bold opacity-40">:</span>;
}
