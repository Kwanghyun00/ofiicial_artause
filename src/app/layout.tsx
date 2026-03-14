import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { SiteShell } from '@/components/layout/SiteShell';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  title: {
    default: 'Artause | 프리미엄 문화 초대 플랫폼',
    template: '%s | Artause',
  },
  description: '뮤지컬, 전시, 클래식 공연까지 멤버 전용 초청과 맞춤 큐레이션을 제공하는 Artause입니다.',
  metadataBase: new URL('https://artause-web.vercel.app'),
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
