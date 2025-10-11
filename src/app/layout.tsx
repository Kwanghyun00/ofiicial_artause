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
    default: 'Artause | 공연 홍보와 관객 경험을 연결합니다',
    template: '%s | Artause',
  },
  description:
    'Artause는 공연 전문 마케팅 랩입니다. 공연 홍보 전략부터 초대권 이벤트까지 한 곳에서 운영해 보세요.',
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
