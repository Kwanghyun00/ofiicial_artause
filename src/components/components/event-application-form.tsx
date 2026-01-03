"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormErrors {
  [key: string]: string
}

export function EventApplicationForm() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    firstName: "",
    phone: "",
    email: "",
    instagram: "",
    reason: "",
    terms1: false,
    terms2: false,
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "이름을 입력해주세요"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "연락처를 입력해주세요"
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "올바른 연락처 형식이 아닙니다"
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다"
    }

    if (!formData.terms1) {
      newErrors.terms1 = "개인정보 수집 및 이용에 동의해주세요"
    }

    if (!formData.terms2) {
      newErrors.terms2 = "이벤트 응모 규칙에 동의해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch (error) {
      setErrors({ submit: "응모 중 오류가 발생했습니다. 다시 시도해주세요." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">응모가 완료되었습니다!</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            당첨 결과는 2025년 1월 25일에
            <br />
            이메일과 카카오톡으로 안내드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setSubmitted(false)} variant="outline">
              다른 이벤트 보기
            </Button>
            <Button>내 응모 내역 확인</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">초대권 응모하기</h2>
        <p className="text-muted-foreground">정보를 입력하시면 추첨을 통해 초대권을 보내드립니다.</p>
      </div>

      {errors.submit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">1. 티켓 유형 선택</CardTitle>
          <CardDescription>원하시는 티켓 종류를 선택해주세요</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="general" className="space-y-3" aria-label="티켓 유형">
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="general" id="general" />
              <Label htmlFor="general" className="flex-1 cursor-pointer">
                <div className="font-medium">일반 관람권 (2인)</div>
                <div className="text-sm text-muted-foreground">평일/주말 모두 사용 가능</div>
              </Label>
              <span className="font-semibold text-primary">무료</span>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
              <RadioGroupItem value="premium" id="premium" />
              <Label htmlFor="premium" className="flex-1 cursor-pointer">
                <div className="font-medium">프리미엄 관람권 (2인)</div>
                <div className="text-sm text-muted-foreground">오디오 가이드 + 도록 증정</div>
              </Label>
              <span className="font-semibold text-primary">무료</span>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">2. 신청자 정보 입력</CardTitle>
          <CardDescription>당첨 시 연락받으실 정보를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">이름 *</Label>
              <Input
                id="firstName"
                placeholder="홍길동"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p id="firstName-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && (
                <p id="phone-error" className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram">인스타그램 계정</Label>
            <Input
              id="instagram"
              placeholder="@username (선택사항)"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">SNS 공유 시 당첨 확률이 2배 증가합니다</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">응모 동기</Label>
            <Textarea
              id="reason"
              placeholder="이 전시회에 응모하시는 이유를 간단히 작성해주세요 (선택사항)"
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">3. 약관 동의</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms1"
                checked={formData.terms1}
                onCheckedChange={(checked) => setFormData({ ...formData, terms1: checked as boolean })}
                aria-invalid={!!errors.terms1}
                aria-describedby={errors.terms1 ? "terms1-error" : undefined}
              />
              <Label htmlFor="terms1" className="text-sm leading-relaxed cursor-pointer">
                [필수] 개인정보 수집 및 이용에 동의합니다
              </Label>
            </div>
            {errors.terms1 && (
              <p id="terms1-error" className="text-sm text-destructive flex items-center gap-1 ml-7">
                <AlertCircle className="h-3 w-3" />
                {errors.terms1}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms2"
                checked={formData.terms2}
                onCheckedChange={(checked) => setFormData({ ...formData, terms2: checked as boolean })}
                aria-invalid={!!errors.terms2}
                aria-describedby={errors.terms2 ? "terms2-error" : undefined}
              />
              <Label htmlFor="terms2" className="text-sm leading-relaxed cursor-pointer">
                [필수] 이벤트 응모 규칙을 확인했으며 동의합니다
              </Label>
            </div>
            {errors.terms2 && (
              <p id="terms2-error" className="text-sm text-destructive flex items-center gap-1 ml-7">
                <AlertCircle className="h-3 w-3" />
                {errors.terms2}
              </p>
            )}
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox id="marketing" />
            <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
              [선택] 마케팅 정보 수신에 동의합니다 (이메일, SMS)
            </Label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full text-lg h-14 rounded-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            응모 중...
          </>
        ) : (
          "응모 완료하기"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground leading-relaxed">
        응모는 1인 1회로 제한되며, 중복 응모 시 자동으로 탈락됩니다.
        <br />
        당첨자 발표는 2025년 1월 25일이며, 개별 연락드립니다.
      </p>
    </form>
  )
}
