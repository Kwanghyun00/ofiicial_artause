import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const title = searchParams.get('title') ?? '알터즈'
  const description = searchParams.get('description') ?? '공연/문화예술 체험단 모집 플랫폼'
  const image = searchParams.get('image')
  const type = searchParams.get('type') ?? 'show' // 'show' | 'invite'

  const accentColor = type === 'invite' ? '#a855f7' : '#6366f1'
  const badgeText = type === 'invite' ? '초대권 이벤트' : '공연 정보'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: '#0f0f12',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 배경 그라디언트 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse 80% 60% at 60% 50%, ${accentColor}22 0%, transparent 70%)`,
          }}
        />

        {/* 포스터 이미지 (있을 경우) */}
        {image ? (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '380px',
              display: 'flex',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="poster"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.7,
              }}
            />
            {/* 좌측 페이드아웃 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, #0f0f12 0%, transparent 60%)',
              }}
            />
          </div>
        ) : null}

        {/* 콘텐츠 영역 */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 64px',
            maxWidth: image ? '760px' : '1100px',
          }}
        >
          {/* 로고 + 배지 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.5px',
              }}
            >
              알터즈
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: accentColor,
                background: `${accentColor}22`,
                border: `1px solid ${accentColor}66`,
                borderRadius: '100px',
                padding: '4px 14px',
              }}
            >
              {badgeText}
            </div>
          </div>

          {/* 제목 */}
          <div
            style={{
              fontSize: title.length > 20 ? '48px' : '56px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '20px',
              letterSpacing: '-1px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </div>

          {/* 설명 */}
          {description && (
            <div
              style={{
                fontSize: '22px',
                color: '#a1a1aa',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </div>
          )}

          {/* 하단 URL */}
          <div
            style={{
              marginTop: '40px',
              fontSize: '16px',
              color: '#52525b',
              letterSpacing: '0.5px',
            }}
          >
            artause.co.kr
          </div>
        </div>

        {/* 하단 강조선 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(to right, ${accentColor}, ${accentColor}00)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
