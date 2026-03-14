import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin 라우트 HTTP Basic Auth 보호
 *
 * ADMIN_SECRET 환경변수가 설정된 경우에만 활성화됩니다.
 * 미설정 시(로컬 개발) 인증 없이 접근 허용합니다.
 *
 * 사용: 브라우저가 기본 제공하는 로그인 대화상자에서
 *       사용자 이름은 임의값, 비밀번호는 ADMIN_SECRET 값을 입력합니다.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const adminSecret = process.env.ADMIN_SECRET;

    // 환경변수 미설정 시 개발 모드로 통과
    if (!adminSecret) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Basic ")) {
      const credentials = authHeader.slice(6);
      const decoded = Buffer.from(credentials, "base64").toString("utf-8");
      const password = decoded.includes(":") ? decoded.split(":").slice(1).join(":") : decoded;

      if (password === adminSecret) {
        return NextResponse.next();
      }
    }

    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Artause Admin", charset="UTF-8"',
      },
    });
  }

  // kopis-sync API: Cron 전용 (POST는 route.ts에서 CRON_SECRET 검증)
  // 외부 GET 요청 차단 (Cron 제외)
  if (pathname === "/api/kopis-sync" && request.method === "GET") {
    const cronHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && cronHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/kopis-sync"],
};
