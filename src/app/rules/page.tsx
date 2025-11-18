/**
 * 이용 규칙 페이지
 *
 * URL: /rules
 *
 * 초대권 이벤트 응모 규칙, 취소 정책, 패널티 시스템 안내
 */

import Link from "next/link";

export const metadata = {
  title: "이용 규칙 | Artause",
  description: "초대권 이벤트 응모 규칙, 취소 정책, 패널티 시스템 안내",
};

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 md:py-16">
      {/* Header */}
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 mb-4">
          <span className="text-2xl">📜</span>
          <span className="text-sm font-bold uppercase tracking-wide text-indigo-700">Rules</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
          초대권 이벤트 이용 규칙
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          공정하고 투명한 초대권 이벤트 운영을 위한 규칙입니다.
        </p>
      </header>

      {/* Navigation */}
      <nav className="mb-10 flex flex-wrap gap-3 justify-center">
        <a href="#apply" className="btn-secondary text-sm">응모 및 선정</a>
        <a href="#cancel" className="btn-secondary text-sm">취소 정책</a>
        <a href="#attendance" className="btn-secondary text-sm">출석 규칙</a>
        <a href="#penalty" className="btn-secondary text-sm">패널티 시스템</a>
      </nav>

      <div className="space-y-12">
        {/* 1. 응모 및 선정 규칙 */}
        <section id="apply" className="scroll-mt-20 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl shadow-lg">
              🎯
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">응모 및 선정 규칙</h2>
              <p className="text-sm text-slate-600">공정한 추첨을 위한 기본 원칙</p>
            </div>
          </div>

          <ul className="space-y-4 text-slate-700">
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="font-semibold">1인 1회 응모:</strong> 한 이벤트당 1인 1회만 응모 가능합니다.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="font-semibold">무작위 추첨:</strong> 모든 당첨자는 시스템의 무작위 추첨으로 선정됩니다.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="font-semibold">이메일 발송:</strong> 당첨 시 등록하신 이메일로 안내를 보내드립니다.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="font-semibold">본인 확인:</strong> 공연 당일 신분증으로 본인 확인이 필요합니다.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-600 font-bold">•</span>
              <div>
                <strong className="font-semibold">양도 불가:</strong> 초대권은 당첨자 본인만 사용 가능하며, 타인에게 양도할 수 없습니다.
              </div>
            </li>
          </ul>

          <div className="mt-6 rounded-2xl bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> 정확한 연락처를 입력해주세요. 당첨 안내를 받지 못하면 자동으로 취소될 수 있습니다.
            </p>
          </div>
        </section>

        {/* 2. 취소 정책 */}
        <section id="cancel" className="scroll-mt-20 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-2xl shadow-lg">
              ⏰
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">취소 정책</h2>
              <p className="text-sm text-slate-600">응모 취소 및 변경 규칙</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-amber-300 bg-white p-6">
              <h3 className="text-lg font-bold text-amber-900 mb-3">✅ 취소 가능 기간</h3>
              <p className="text-slate-700 mb-4">
                공연일로부터 <strong className="text-amber-700">3일 이전</strong>까지만 취소 가능합니다.
              </p>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-800">
                  예: 공연이 <strong>11월 20일</strong>이라면 <strong>11월 17일 23:59</strong>까지 취소 가능
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-300 bg-white p-6">
              <h3 className="text-lg font-bold text-red-900 mb-3">❌ 취소 불가 & 패널티</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-red-600">•</span>
                  <div>
                    공연 <strong>3일 이내</strong> 취소 시도 → <strong className="text-red-600">차단됩니다</strong>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600">•</span>
                  <div>
                    3일 이내 취소 강행 시 → <strong className="text-red-600">신뢰도 -10점</strong>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600">•</span>
                  <div>
                    공연 날짜 및 좌석 변경 불가
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. 출석 규칙 */}
        <section id="attendance" className="scroll-mt-20 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-2xl shadow-lg">
              ✓
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">출석 규칙</h2>
              <p className="text-sm text-slate-600">공연 당일 필수 출석</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-purple-300 bg-white p-6">
              <h3 className="text-lg font-bold text-purple-900 mb-3">✅ 정상 출석</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-green-600">•</span>
                  <div>공연 시작 30분 전까지 도착</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600">•</span>
                  <div>신분증 지참 필수</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600">•</span>
                  <div>정상 출석 시 <strong className="text-green-600">신뢰도 +5점</strong> 보너스</div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-red-300 bg-white p-6">
              <h3 className="text-lg font-bold text-red-900 mb-3">❌ 노쇼 (No-Show)</h3>
              <p className="text-slate-700 mb-3">
                당첨 후 공연에 참석하지 않으면 <strong className="text-red-600">노쇼</strong>로 기록됩니다.
              </p>
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-red-900 font-bold mb-2">🚨 노쇼 패널티</p>
                <ul className="space-y-1 text-sm text-red-800">
                  <li>• 신뢰도 <strong>-20점</strong> 차감</li>
                  <li>• 6개월간 패널티 기록 유지</li>
                  <li>• 신뢰도 60점 미만 시 응모 제한</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 패널티 시스템 */}
        <section id="penalty" className="scroll-mt-20 rounded-3xl border border-slate-300 bg-slate-50 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 text-2xl shadow-lg">
              ⚖️
            </span>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">패널티 시스템</h2>
              <p className="text-sm text-slate-600">신뢰도 점수 관리</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 신뢰도 점수 표 */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">📊 신뢰도 점수</h3>
              <p className="text-slate-700 mb-4">
                모든 사용자는 <strong className="text-indigo-600">100점</strong>으로 시작합니다.
              </p>

              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">행동</th>
                    <th className="px-4 py-3 text-center font-semibold">점수 변화</th>
                    <th className="px-4 py-3 text-center font-semibold">만료 기간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-4 py-3">노쇼 (No-Show)</td>
                    <td className="px-4 py-3 text-center text-red-600 font-bold">-20점</td>
                    <td className="px-4 py-3 text-center">6개월</td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="px-4 py-3">3일 이내 취소</td>
                    <td className="px-4 py-3 text-center text-orange-600 font-bold">-10점</td>
                    <td className="px-4 py-3 text-center">6개월</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">규칙 위반</td>
                    <td className="px-4 py-3 text-center text-red-600 font-bold">-15점</td>
                    <td className="px-4 py-3 text-center">6개월</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-4 py-3">정상 참석</td>
                    <td className="px-4 py-3 text-center text-green-600 font-bold">+5점</td>
                    <td className="px-4 py-3 text-center">영구</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 제한 기준 */}
            <div className="rounded-2xl border border-red-300 bg-red-50 p-6">
              <h3 className="text-lg font-bold text-red-900 mb-3">🚫 응모 제한</h3>
              <p className="text-slate-700 mb-3">
                다음 조건에 해당하면 새로운 이벤트에 응모할 수 없습니다:
              </p>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-red-600">1.</span>
                  <div>신뢰도 점수가 <strong className="text-red-600">60점 미만</strong></div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600">2.</span>
                  <div>활성 패널티가 <strong className="text-red-600">3건 이상</strong></div>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600">3.</span>
                  <div>관리자에 의해 <strong className="text-red-600">제한 조치</strong>를 받은 경우</div>
                </li>
              </ul>
            </div>

            {/* 패널티 해제 */}
            <div className="rounded-2xl border border-green-300 bg-green-50 p-6">
              <h3 className="text-lg font-bold text-green-900 mb-3">✅ 패널티 해제</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-green-600">•</span>
                  <div>패널티는 부과일로부터 <strong>6개월 후 자동 만료</strong>됩니다.</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600">•</span>
                  <div>만료된 패널티는 신뢰도 점수 계산에서 제외됩니다.</div>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600">•</span>
                  <div>정상 참석으로 <strong>보너스 점수(+5점)</strong>를 획득할 수 있습니다.</div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">규칙을 이해하셨나요?</h2>
          <p className="text-slate-600 mb-6">
            이용 규칙에 동의하시면 지금 바로 초대권 이벤트에 응모하세요!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              진행 중인 이벤트 보기
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/me/penalties"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-8 py-4 font-semibold text-indigo-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 active:scale-95"
            >
              내 패널티 내역 확인
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
