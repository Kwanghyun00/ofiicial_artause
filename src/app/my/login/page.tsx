import type { Metadata } from "next"
import { LoginForm } from "./LoginForm"

export const metadata: Metadata = {
  title: "로그인",
  description: "이메일로 받은 인증 코드로 간편하게 로그인하세요.",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-4 py-20">
      <div className="w-full max-w-md space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">Artause</p>
          <h1 className="text-3xl font-bold">로그인</h1>
          <p className="text-sm text-muted-foreground">
            이메일로 받은 6자리 인증 코드로 로그인합니다.
            <br />
            계정이 없으면 자동으로 만들어집니다.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}
