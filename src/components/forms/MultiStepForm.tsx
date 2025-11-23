"use client";

import { useState, ReactNode } from "react";

/**
 * MultiStepForm 컴포넌트
 *
 * 한국 관객을 위한 세련된 멀티스텝 폼
 * - 딥 네이비 (#293380) 기반 색상
 * - 마젠타 (#953D60~#D36AD9) 포인트
 * - 파스텔 배경 (#F0EFF7, #DDBFE4)
 * - 일관된 16px/20px 여백
 */

export type FormStep = {
  title: string;
  description: string;
  icon: ReactNode;
  content: ReactNode;
  validate?: () => boolean;
};

type MultiStepFormProps = {
  steps: FormStep[];
  action: string | ((formData: FormData) => void | Promise<void>);
  title: string;
  subtitle?: string;
  submitLabel?: string;
  isPending?: boolean;
  isSuccess?: boolean;
  message?: string;
};

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
  error: "#DC2626",
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

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.validate && !currentStepData.validate()) {
      return;
    }
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-5">
      {/* Form Header - 컴팩트 */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold" style={{ color: colors.navy }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Progress Section - 컴팩트 */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div
          className="relative h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: colors.pastelPurple }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${colors.navy}, ${colors.magenta})`
            }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Step Indicators - 숫자형 */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <button
                key={index}
                type="button"
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  index <= currentStep ? "cursor-pointer" : "cursor-default"
                }`}
                style={{
                  backgroundColor: isCurrent ? colors.navy : isCompleted ? colors.pastelPurple : "transparent",
                  color: isCurrent ? "#fff" : isCompleted ? colors.navy : colors.textMuted,
                }}
                disabled={index > currentStep}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isCurrent ? "bg-white/20" : isCompleted ? "bg-white" : "border"
                }`}
                style={{
                  borderColor: !isCurrent && !isCompleted ? colors.border : undefined,
                  color: isCurrent ? "#fff" : isCompleted ? colors.navy : colors.textMuted,
                }}>
                  {isCompleted ? (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:block">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form
        action={action}
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.cardBg,
        }}
      >
        {/* Current Step Header - 컴팩트 */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ backgroundColor: colors.pastelPurple }}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.navy, color: "#fff" }}
          >
            {currentStepData.icon}
          </span>
          <div className="flex-1">
            <h3
              className="text-base font-bold"
              style={{ color: colors.navy }}
            >
              {currentStepData.title}
            </h3>
            <p className="text-xs" style={{ color: colors.textMuted }}>
              {currentStepData.description}
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: colors.navy, color: "#fff" }}
          >
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        {/* Step Content - 일관된 여백 */}
        <div className="space-y-4 p-5">
          {currentStepData.content}
        </div>

        {/* Status Messages */}
        {message && (
          <div
            className="mx-5 mb-4 rounded-xl px-4 py-3 text-sm font-medium"
            style={{
              backgroundColor: isSuccess ? "#ecfdf5" : "#fef2f2",
              color: isSuccess ? colors.success : colors.error,
              border: `1px solid ${isSuccess ? "#a7f3d0" : "#fecaca"}`,
            }}
            role="alert"
          >
            {message}
          </div>
        )}

        {/* Navigation Buttons - 딥 네이비 */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ backgroundColor: colors.pastelPurple }}
        >
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
            style={{
              backgroundColor: isFirstStep ? colors.border : "#fff",
              color: isFirstStep ? colors.textMuted : colors.navy,
              border: `1px solid ${colors.border}`,
              opacity: isFirstStep ? 0.6 : 1,
              cursor: isFirstStep ? "not-allowed" : "pointer",
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            이전
          </button>

          {isLastStep ? (
            <button
              type="submit"
              disabled={isPending || isSuccess}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
              style={{
                background: isPending || isSuccess
                  ? colors.textMuted
                  : `linear-gradient(135deg, ${colors.magenta}, ${colors.magentaLight})`,
                cursor: isPending || isSuccess ? "not-allowed" : "pointer",
              }}
            >
              {isPending ? "제출 중..." : isSuccess ? "완료" : submitLabel}
              {!isPending && !isSuccess && (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
              }}
            >
              다음
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
