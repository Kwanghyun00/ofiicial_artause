import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /events → /invites 영구 리다이렉트 (SEO 링크 보존)
      {
        source: "/events/guide",
        destination: "/invites/guide",
        permanent: true,
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      // KOPIS 공연 포스터 및 상세 이미지 (HTTP 서빙)
      {
        protocol: 'http',
        hostname: 'www.kopis.or.kr',
        pathname: '/upload/**',
      },
      {
        protocol: 'http',
        hostname: 'kopis.or.kr',
        pathname: '/upload/**',
      },
    ],
    // KOPIS 이미지 응답 없음/오류 시 Next.js Image 에러 페이지 방지
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
