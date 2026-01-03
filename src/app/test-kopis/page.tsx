/**
 * KOPIS API 테스트 페이지
 *
 * KOPIS API 연동이 정상적으로 작동하는지 확인합니다.
 */

import { getAllPerformances, getPerformanceFromKopis } from '@/lib/supabase/queries';
import { isKopisConfigured } from '@/lib/kopis';

export default async function TestKopisPage() {
  const kopisConfigured = isKopisConfigured();
  let performances: any[] = [];
  let error: string | null = null;

  try {
    performances = await getAllPerformances();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">KOPIS API 테스트</h1>

      {/* Configuration Status */}
      <div className="mb-8 p-6 rounded-lg border-2 bg-white">
        <h2 className="text-2xl font-bold mb-4">API 설정 상태</h2>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">KOPIS API 키 설정:</span>{' '}
            {kopisConfigured ? (
              <span className="text-green-600">✅ 설정됨</span>
            ) : (
              <span className="text-red-600">❌ 미설정</span>
            )}
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-6 rounded-lg border-2 border-red-300 bg-red-50">
          <h2 className="text-2xl font-bold mb-4 text-red-700">에러 발생</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Performance List */}
      <div className="mb-8 p-6 rounded-lg border-2 bg-white">
        <h2 className="text-2xl font-bold mb-4">
          조회된 공연 목록 ({performances.length}개)
        </h2>

        {performances.length === 0 ? (
          <p className="text-gray-600">조회된 공연이 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {performances.slice(0, 10).map((perf, index) => (
              <div
                key={perf.id || index}
                className="p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex gap-4">
                  {perf.poster_url && (
                    <img
                      src={perf.poster_url}
                      alt={perf.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{perf.title}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-semibold">ID:</span> {perf.id}
                      </p>
                      <p>
                        <span className="font-semibold">장르:</span>{' '}
                        {perf.tags?.[0] || '미지정'}
                      </p>
                      <p>
                        <span className="font-semibold">장소:</span>{' '}
                        {perf.venue || '미지정'}
                      </p>
                      <p>
                        <span className="font-semibold">지역:</span>{' '}
                        {perf.region || '미지정'}
                      </p>
                      <p>
                        <span className="font-semibold">기간:</span>{' '}
                        {perf.period_start || '?'} ~ {perf.period_end || '?'}
                      </p>
                      {perf.state && (
                        <p>
                          <span className="font-semibold">상태:</span> {perf.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {performances.length > 10 && (
          <p className="mt-4 text-sm text-gray-500">
            ...외 {performances.length - 10}개 공연
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="p-6 rounded-lg border-2 border-blue-300 bg-blue-50">
        <h2 className="text-xl font-bold mb-2 text-blue-900">사용 방법</h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>
            KOPIS API 키가 설정되어 있으면 실시간 공연 데이터를 가져옵니다.
          </li>
          <li>Supabase 데이터와 KOPIS 데이터를 자동으로 병합합니다.</li>
          <li>
            중복된 ID는 제거되며, 총 공연 수는 양쪽 데이터의 합입니다.
          </li>
          <li>이 페이지는 개발/테스트용이며, 프로덕션에서는 제거하세요.</li>
        </ol>
      </div>
    </div>
  );
}
