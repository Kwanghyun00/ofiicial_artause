"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 플랫폼 특징 섹션
 *
 * Artause 플랫폼의 핵심 가치 제안을 시각적으로 표현합니다.
 * - 무료 시작
 * - 간편한 관리
 * - SNS 홍보 효과
 * - 신뢰 시스템
 *
 * 사용처:
 * - 파트너 로그인 페이지 (로그인 전)
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
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
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

export function PlatformFeaturesSection() {
  const { ref, isVisible } = useScrollAnimation();

  const features = [
    {
      icon: "🎁",
      title: "무료로 시작",
      detail: "플랫폼 이용료 없이 초대권 이벤트를 개설하고 관객을 모집할 수 있습니다",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "⚡",
      title: "간편한 관리",
      detail: "이벤트 등록부터 응모자 선정, 관람 체크까지 한 곳에서 처리합니다",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "📢",
      title: "SNS 홍보 효과",
      detail: "응모자의 SNS 인증으로 자연스러운 입소문 마케팅이 이루어집니다",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: "🛡️",
      title: "신뢰 시스템",
      detail: "노쇼 패널티와 관람 이력 관리로 성실한 관객만 선정됩니다",
      color: "from-orange-500 to-amber-500"
    },
  ];

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">왜 Artause인가요?</h2>
        <p className="mt-3 text-base text-slate-600 sm:text-lg">공연 홍보와 관객 모집, 이제 더 쉽게</p>
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className={`group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 transition-all duration-500 hover:scale-105 hover:shadow-lg sm:p-6 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className={`absolute right-0 top-0 h-32 w-32 bg-gradient-to-br ${feature.color} opacity-10 blur-2xl transition-opacity group-hover:opacity-20`}></div>
            <div className="relative">
              <span className="text-4xl sm:text-5xl" aria-hidden="true">{feature.icon}</span>
              <h3 className="mt-3 text-lg font-bold text-slate-900 sm:mt-4 sm:text-xl">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">{feature.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
