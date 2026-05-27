import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * 미들웨어 역할:
 * 1. /admin    — HTTP Basic Auth (ADMIN_SECRET)
 * 2. /my/*     — Supabase 세션 쿠키 갱신 (만료 시 /my/login 리다이렉트)
 * 3. /api/kopis-sync — Cron GET 차단 (CRON_SECRET)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Admin Basic Auth ──────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const adminSecret = process.env.ADMIN_SECRET;

    // ADMIN_SECRET 미설정 시 전면 차단 (환경변수 없이 오픈되는 것 방지)
    if (!adminSecret) {
      return new NextResponse("Admin access is not configured.", { status: 503 });
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

  // ── 2. /my/* — Supabase 세션 갱신 + 비인증 리다이렉트 ───────────
  if (pathname.startsWith("/my") && !pathname.startsWith("/my/login")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Supabase 미설정이면 /my/login 으로 (페이지에서도 체크하지만 미들웨어에서 먼저 처리)
    if (!supabaseUrl || !supabaseAnonKey) {
      const loginUrl = new URL("/my/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.next();

    // 세션 쿠키 갱신 (토큰 만료 처리)
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/my/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // ── 3. KOPIS Sync API — Cron GET 차단 ───────────────────────────
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
  matcher: ["/admin/:path*", "/my/:path*", "/api/kopis-sync"],
};
