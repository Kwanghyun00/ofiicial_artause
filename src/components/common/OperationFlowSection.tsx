"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 운영 프로세스 섹션
 *
 * 초대권 이벤트 운영의 3단계 프로세스를 시각적으로 표현합니다.
 * - 이벤트 등록
 * - 응모 & 선정
 * - 관람 체크
 *
 * 사용처:
 * - 파트너 운영 허브 상단 (event-center)
 */

function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return { ref, isVisible };
}

export function OperationFlowSection() {
  const { ref, isVisible } = useScrollAnimation();

  const steps = [
    {
      icon: "📝",
      title: "이벤트 등록",
      detail: "공연 정보와 초대권 수량을 입력하면 이벤트 페이지가 자동으로 생성됩니다",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🎯",
      title: "응모 & 선정",
      detail: "관객이 응모하면 당첨자를 선정하고 이메일로 결과를 안내합니다",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "✅",
      title: "관람 체크",
      detail: "공연 당일 당첨자의 참석 여부를 확인하고 기록으로 남깁니다",
      color: "from-emerald-500 to-teal-500"
    },
  ];

  return (
    <section
      ref={ref}
      className={`rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white to-neutral-offwhite p-6 shadow-xl transition-all duration-700 sm:p-8 md:rounded-[40px] md:p-10 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">간단한 3단계로 완료</h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">복잡한 과정 없이 누구나 쉽게 초대권 이벤트를 운영할 수 있습니다</p>
      </div>
      <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className={`group relative overflow-hidden rounded-3xl bg-slate-50 p-5 transition-all duration-500 hover:scale-105 hover:shadow-lg sm:p-6 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className={`absolute right-0 top-0 h-32 w-32 bg-gradient-to-br ${step.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}></div>
            <div className="relative">
              <span className="text-4xl sm:text-5xl" aria-hidden="true">{step.icon}</span>
              <div className="mt-3 flex items-center gap-2 sm:mt-4">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${step.color} text-xs font-bold text-white shadow-md`}>
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600 sm:mt-3 sm:text-base">{step.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
