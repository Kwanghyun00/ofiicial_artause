"use client";

import { useState, ReactNode } from "react";

/**
 * MultiStepForm 컴포넌트
 *
 * 긴 폼을 여러 단계로 나누어 사용자 경험을 개선하는 래퍼 컴포넌트
 *
 * 주요 기능:
 * - 진행 상황 표시 (Progress Indicator)
 * - 단계별 검증
 * - 다음/이전 네비게이션
 * - 마지막 단계에서 제출
 */

export type FormStep = {
  /** 단계 제목 (예: "기본 정보") */
  title: string;
  /** 단계 설명 (예: "성명, 이메일, 전화번호를 입력해주세요") */
  description: string;
  /** 단계에 표시될 아이콘 이모지 */
  icon: string;
  /** 단계별 폼 필드 컴포넌트 */
  content: ReactNode;
  /**
   * 다음 단계로 이동하기 전 실행할 검증 함수 (선택)
   * @returns true면 다음 단계로 이동, false면 현재 단계에 머뭄
   */
  validate?: () => boolean;
};

type MultiStepFormProps = {
  /** 폼 단계 배열 */
  steps: FormStep[];
  /** 폼 제출 액션 */
  action: string | ((formData: FormData) => void | Promise<void>);
  /** 폼 제목 */
  title: string;
  /** 폼 부제목 */
  subtitle?: string;
  /** 제출 버튼 텍스트 (기본값: "제출하기") */
  submitLabel?: string;
  /** 제출 중 상태 */
  isPending?: boolean;
  /** 제출 성공 여부 */
  isSuccess?: boolean;
  /** 에러/성공 메시지 */
  message?: string;
};

export function MultiStepForm({
  steps,
  action,
  title,
  subtitle,
  submitLabel = "제출하기",
  isPending = false,
  isSuccess = false,
  message,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  /**
   * 다음 단계로 이동
   * 현재 단계의 검증 함수가 있으면 실행 후 통과 시에만 이동
   */
  const handleNext = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.validate && !currentStepData.validate()) {
      return;
    }
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
      // 페이지 최상단으로 스크롤
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /**
   * 이전 단계로 이동
   */
  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>

      {/* Progress Indicator */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-gradient-violet via-gradient-electric to-gradient-magenta transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`진행률 ${Math.round(progress)}%`}
          />
        </div>

        {/* Step Counter */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900">
            {currentStep + 1} / {totalSteps} 단계
          </span>
          <span className="text-slate-500">
            {Math.round(progress)}% 완료
          </span>
        </div>

        {/* Step Indicators (dots) */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((step, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`group relative h-3 transition-all duration-300 ${
                index === currentStep
                  ? "w-8 rounded-full bg-gradient-to-r from-gradient-violet to-gradient-magenta"
                  : index < currentStep
                  ? "w-3 rounded-full bg-emerald-500"
                  : "w-3 rounded-full bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`${step.title} ${index < currentStep ? '(완료)' : index === currentStep ? '(현재)' : '(대기 중)'}`}
              aria-current={index === currentStep ? "step" : undefined}
            >
              {/* Tooltip */}
              <span className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg group-hover:block">
                {step.icon} {step.title}
                <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <form
        action={action}
        className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"
      >
        {/* Current Step Header */}
        <div className="flex items-start gap-4 rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
          <span className="text-4xl" aria-hidden="true">{currentStepData.icon}</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">
              {currentStepData.title}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {currentStepData.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStepData.content}
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className={`rounded-2xl p-4 ${
              isSuccess
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}
            role="alert"
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`order-2 rounded-2xl border-2 px-6 py-3 font-semibold transition-all sm:order-1 ${
              isFirstStep
                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 active:scale-95"
            }`}
            aria-label="이전 단계로 이동"
          >
            ← 이전
          </button>

          {/* Next / Submit Button */}
          {isLastStep ? (
            <button
              type="submit"
              disabled={isPending || isSuccess}
              className={`order-1 rounded-2xl px-8 py-3 font-bold text-white transition-all sm:order-2 ${
                isPending || isSuccess
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-gradient-to-r from-coral to-coral-dark shadow-lg hover:shadow-xl active:scale-95"
              }`}
              aria-label={submitLabel}
            >
              {isPending ? "제출 중..." : isSuccess ? "제출 완료 ✓" : submitLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="order-1 rounded-2xl bg-gradient-to-r from-gradient-violet to-gradient-magenta px-8 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 sm:order-2"
              aria-label="다음 단계로 이동"
            >
              다음 →
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
