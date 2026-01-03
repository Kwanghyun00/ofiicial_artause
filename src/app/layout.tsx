import type { Metadata } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { SiteShell } from '@/components/layout/SiteShell';

const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-sans-kr',
  weight: ['400', '500', '600', '700'],
});

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
      <body className={`${notoSans.variable} antialiased`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
