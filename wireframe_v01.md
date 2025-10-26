import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Gift,
  Menu,
  Sparkles,
  Trophy,
  User,
  BarChart2,
  Upload,
  Ticket,
  Bell,
  Link,
  ChevronRight,
  Star,
  Share2,
  Heart,
  MapPin,
  LayoutDashboard,
  Megaphone,
  FileText,
  Crown,
  LogIn,
  LogOut,
  ShieldCheck,
  ExternalLink,
  Settings2,
  ClipboardList,
  Users,
  Filter,
  Shuffle,
  Lock,
  KeyRound
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/**
 * Artause Hi-Fi UI v1.4 (2025-10-18 업데이트)
 * - 역할/권한: 관람객(member) · 종사자(partner) · 관리자(admin)
 * - Intro-first 상세 + AdGate + 가중치 응모 플로우 고도화
 * - 홈(추천/랭킹/추첨 일정) · 이벤트 상세(스토리/FAQ) · 마이페이지(응모/티켓/알림)
 * - 파트너 캠페인/리포트, 관리자 추첨/이상징후 UI 보강
 * - Dev Smoke Tests: RBAC, 게이트, 신규 위젯 검증
 */

function ThemeTokens({ role }: { role: Role }) {
  return (
    <style>{`
:root {
  --font-display: "Pretendard Variable", "Inter var", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", Arial, "Apple SD Gothic Neo", sans-serif;
  --font-body: "Pretendard Variable", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", Arial, "Apple SD Gothic Neo", sans-serif;
  --size-h1: clamp(28px, 3.6vw, 40px);
  --size-h2: clamp(22px, 2.6vw, 28px);
  --size-h3: 18px; --size-body: 14px;
  --lh-tight: 1.15; --lh-body: 1.6; --ls-tight: -0.01em;
  --radius-sm: 10px; --radius-md: 14px; --radius-xl: 18px;
  --shadow-md: 0 8px 24px rgba(16,24,40,.08);
  --z-nav: 20; --z-dialog: 50; --z-toast: 60;
}
[data-role="b2c"] {
  --brand-primary: #6D4AFF; --brand-secondary:#FF3E8A; --brand-accent:#00D1FF;
  --neutral-900:#0f172a; --neutral-600:#475569; --neutral-100:#f1f5f9;
  --grad-hero: linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#f43f5e 100%);
  --bg-app: linear-gradient(180deg,#fff7fb 0%,#eef2ff 100%);
  --btn-accent-bg: var(--brand-primary); --btn-accent-text:#fff;
  --chip-secondary-bg:#F1EEFF; --chip-secondary-text:#3F2B96;
}
[data-role="b2b"] {
  --brand-primary:#0F172A; --brand-secondary:#6366F1; --brand-accent:#22C55E;
  --neutral-900:#0f172a; --neutral-600:#475569; --neutral-100:#f1f5f9;
  --grad-hero: linear-gradient(135deg,#0F172A 0%, #334155 100%);
  --bg-app: linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%);
  --btn-accent-bg: var(--brand-primary); --btn-accent-text:#fff;
  --chip-secondary-bg:#EAEFFC; --chip-secondary-text:#1F2A5C;
}
[data-role="admin"] {
  --brand-primary:#8B0000; --brand-secondary:#D97706; --brand-accent:#0EA5E9;
  --neutral-900:#111827; --neutral-600:#4b5563; --neutral-100:#f3f4f6;
  --grad-hero: linear-gradient(135deg,#7f1d1d 0%, #dc2626 60%, #f59e0b 100%);
  --bg-app: linear-gradient(180deg,#fff5f5 0%,#fff7ed 100%);
  --btn-accent-bg: var(--brand-primary); --btn-accent-text:#fff;
  --chip-secondary-bg:#FEE2E2; --chip-secondary-text:#7F1D1D;
}
.font-display{ font-family: var(--font-display); }
.font-body{ font-family: var(--font-body); font-size: var(--size-body); line-height: var(--lh-body); }
.ds-h1{ font-size: var(--size-h1); line-height: var(--lh-tight); letter-spacing: var(--ls-tight); font-weight: 800; }
.ds-h2{ font-size: var(--size-h2); line-height: var(--lh-tight); font-weight: 700; }
.ds-h3{ font-size: var(--size-h3); font-weight: 600; }
.ds-hero{ background: var(--grad-hero); }
.ds-app{ background: var(--bg-app); }
.ds-card{ border-radius: var(--radius-xl); box-shadow: var(--shadow-md); }
.ds-btn-accent{ background: var(--btn-accent-bg) !important; color: var(--btn-accent-text) !important; border-radius: var(--radius-md) !important; }
.ds-chip-secondary{ background: var(--chip-secondary-bg); color: var(--chip-secondary-text); border-radius: 999px; padding: 4px 10px; font-size: 12px; }
`}</style>
  );
}

/**
 * Artause Hi-Fi UI v1.4 (2025-10-18 업데이트)
 * - 역할/권한: 관람객(member) · 종사자(partner) · 관리자(admin)
 * - Intro-first 상세 + AdGate + 가중치 응모 플로우 고도화
 * - 홈(추천/랭킹/추첨 일정) · 이벤트 상세(스토리/FAQ) · 마이페이지(응모/티켓/알림)
 * - 파트너 캠페인/리포트, 관리자 추첨/이상징후 UI 보강
 * - Dev Smoke Tests: RBAC, 게이트, 신규 위젯 검증
 */
type Role = "member" | "partner" | "admin";
const canAccessB2B = (role: Role, authed: boolean) => role === "partner" && authed;
const canAccessB2C = (role: Role) => role === "member";
const canAccessAdmin = (role: Role, authed: boolean) => role === "admin" && authed;
const isApplyEnabled = ({ seenIntro, adVisited }: { seenIntro: boolean; adVisited: boolean }) => seenIntro && adVisited;

/**
 * Artause Hi-Fi UI v1.4 (2025-10-18 업데이트)
 * - 역할/권한: 관람객(member) · 종사자(partner) · 관리자(admin)
 * - Intro-first 상세 + AdGate + 가중치 응모 플로우 고도화
 * - 홈(추천/랭킹/추첨 일정) · 이벤트 상세(스토리/FAQ) · 마이페이지(응모/티켓/알림)
 * - 파트너 캠페인/리포트, 관리자 추첨/이상징후 UI 보강
 * - Dev Smoke Tests: RBAC, 게이트, 신규 위젯 검증
 */
function Header({ role, isAuthed, onLogin, onLogout }: { role: Role; isAuthed: boolean; onLogin: (r: Role) => void; onLogout: () => void }) {
  const roleLabel = role === "member" ? "愿媛? : role === "partner" ? "醫낆궗?? : "愿由ъ옄";
  return (
    <header className="sticky top-0 z-[var(--z-nav)] border-b backdrop-blur bg-white/75">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 font-display">
        <Button variant="ghost" size="icon" className="rounded-xl"><Menu /></Button>
        <div className="font-bold text-lg tracking-tight ds-h3 flex items-center gap-2">
          <Sparkles className="w-5 h-5"/>
          Artause
          <Badge variant="secondary" className="rounded-full">Hi-Fi v1.4</Badge>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!isAuthed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl"><User className="w-4 h-4 mr-1"/>濡쒓렇??/Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuLabel>??븷濡?濡쒓렇??/DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onLogin("member")}><LogIn className="w-4 h-4 mr-2"/>愿媛?B2C)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLogin("partner")}><LogIn className="w-4 h-4 mr-2"/>醫낆궗??B2B)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onLogin("admin")}><KeyRound className="w-4 h-4 mr-2"/>愿由ъ옄(Admin)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isAuthed && (
            <>
              <Badge variant="outline" className="rounded-full"><ShieldCheck className="w-3 h-3 mr-1"/> {roleLabel}</Badge>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={onLogout}><LogOut className="w-4 h-4 mr-1"/>濡쒓렇?꾩썐</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Artause Hi-Fi UI v1.4 (2025-10-18 업데이트)
 * - 역할/권한: 관람객(member) · 종사자(partner) · 관리자(admin)
 * - Intro-first 상세 + AdGate + 가중치 응모 플로우 고도화
 * - 홈(추천/랭킹/추첨 일정) · 이벤트 상세(스토리/FAQ) · 마이페이지(응모/티켓/알림)
 * - 파트너 캠페인/리포트, 관리자 추첨/이상징후 UI 보강
 * - Dev Smoke Tests: RBAC, 게이트, 신규 위젯 검증
 */
function AudienceHero() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 ds-card">
      <div className="absolute inset-0 ds-hero opacity-10" />
      <div className="grid md:grid-cols-5 gap-6 p-6 bg-white">
        <div className="md:col-span-3 space-y-4">
          <div className="rounded-xl p-5 ds-hero text-white shadow-md">
            <div className="text-xs/5 opacity-90 mb-1 font-display">硫붿씤 珥덈?沅??대깽??/div>
            <div className="ds-h1 font-display">[?좎옉] 誘몃땲硫 ?ㅽ럹?????꾨━酉?珥덈?</div>
            <div className="text-sm/6 opacity-95 mt-2 font-body">?좎옉 ?꾨━酉??뚯감 珥덈?沅?30??쨌 移쒓뎄 異붿쿇 ???뱀꺼 媛以묒튂 +慣</div>
            <div className="mt-4 flex items-center gap-2">
              <Button className="rounded-xl bg-white text-[color:var(--neutral-900)] hover:bg-slate-50"><Gift className="w-4 h-4 mr-1"/>?묐え?섍린</Button>
              <Button variant="secondary" className="rounded-xl">怨듭쑀</Button>
              <span className="ds-chip-secondary"><Clock className="w-3 h-3 mr-1 inline"/>異붿꺼 D?? 20:00</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-sm font-body">
            {["????궧 12??,"?대쾲???묐え 4嫄?,"異붿쿇 ?깃났 3紐?].map((k, i) => (
              <Card key={i} className="rounded-xl"><CardContent className="p-4 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500"/> {k}</CardContent></Card>
            ))}
          </div>
        </div>
        <div className="md:col-span-2 space-y-3">
          <Card className="rounded-xl"><CardContent className="p-4"><div className="text-sm font-semibold mb-2 font-display">?ㅽ룿??/div><div className="rounded-lg h-24 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 text-xs">home_hero 諛곕꼫</div></CardContent></Card>
          <Card className="rounded-xl font-body">
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="font-semibold font-display">?ㅼ쓬 異붿꺼 ?쇱젙</div>
              {["10/18 20:00","10/22 20:00","10/26 20:00"].map((d, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border"><span className="flex items-center gap-2"><Clock className="w-4 h-4"/> {d}</span><Button size="sm" variant="secondary" className="rounded-xl">?뚮┝ 諛쏄린</Button></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function AudienceRanking() {
  const tabs = ["裕ㅼ?而?, "肄섏꽌??, "?곌레", "?대옒??臾댁슜", "?꾩떆/?됱궗"];
  return (
    <Card className="rounded-2xl ds-card">
      <CardHeader className="pb-2"><CardTitle className="text-base font-display">?ㅼ떆媛???궧 & ?λⅤ</CardTitle></CardHeader>
      <CardContent>
        <Tabs defaultValue="裕ㅼ?而? className="w-full">
          <TabsList className="grid grid-cols-5 w-full rounded-xl">
            {tabs.map((t) => (<TabsTrigger key={t} value={t}>{t}</TabsTrigger>))}
          </TabsList>
          {tabs.map((g) => (
            <TabsContent key={g} value={g}>
              <div className="grid md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={`${g}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="rounded-xl hover:shadow-md transition-shadow">
                      <CardContent className="p-3 space-y-2">
                        <div className="rounded-lg h-28 bg-slate-100" />
                        <div className="text-xs text-slate-500">#{i + 1} {g}</div>
                        <div className="text-sm font-semibold font-display">?묓뭹紐?/div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function AudienceSchedule() {
  const timeline = [
    { title: "광고 미션 마감", time: "10/18 19:50", badge: "남은 시간 00:45", tone: "text-amber-600" },
    { title: "응모 마감", time: "10/18 20:00", badge: "모집 좌석 30석", tone: "text-rose-600" },
    { title: "추첨 생중계", time: "10/18 20:30", badge: "YouTube Live", tone: "text-indigo-600" },
    { title: "티켓 발송", time: "10/19 10:00", badge: "알림 + 이메일", tone: "text-emerald-600" },
  ];
  return (
    <Card className="rounded-2xl ds-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2"><Calendar className="w-4 h-4" />추첨 타임라인</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-4 gap-3 text-sm font-body">
        {timeline.map((item, i) => (
          <div key={i} className="rounded-xl border p-3 space-y-2">
            <div className={`flex items-center gap-2 font-semibold ${item.tone}`}><Clock className="w-4 h-4" /> {item.title}</div>
            <div className="text-slate-600">{item.time}</div>
            <Badge variant="outline" className="rounded-full">{item.badge}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AudienceEventIntro({ onGoApply }: { onGoApply: () => void }) {
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card">
        <CardContent className="p-6 grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="rounded-xl h-64 bg-slate-100" />
            <div className="text-xs text-slate-500">포스터 & 하이라이트</div>
          </div>
          <div className="md:col-span-3 space-y-4">
            <div className="ds-h1 font-display">[시사회] 미니멀 카페뮤지컬</div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <Badge variant="secondary" className="rounded-full">12세 이상 관람가</Badge>
              <Badge variant="outline" className="rounded-full flex items-center gap-1"><MapPin className="w-3 h-3" />서울 대학로</Badge>
              <Badge variant="outline" className="rounded-full flex items-center gap-1"><Clock className="w-3 h-3" />러닝 110분</Badge>
            </div>
            <div className="rounded-xl p-4 bg-slate-50 text-sm leading-relaxed">
              <div className="font-semibold font-display mb-2">하이라이트</div>
              초연 2주 만에 전석 매진을 기록한 토크컬 드라마. 관객 참여형 카페 공간 연출로 몰입감을 높였으며, Plus 멤버에게는 리허설 현장 스틸컷을 추가 공개합니다.
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Button className="rounded-xl ds-btn-accent"><ExternalLink className="w-4 h-4 mr-1" />예매 링크 이동</Button>
              <Button variant="secondary" className="rounded-xl" onClick={onGoApply}><Gift className="w-4 h-4 mr-1" />초대 이벤트 참여</Button>
            </div>
            <div className="text-xs text-slate-500">* 응모자는 광고 미션 완료 후 신청 폼을 작성할 수 있습니다.</div>
          </div>
        </CardContent>
      </Card>
      <IntroAccordions />
      <AudienceFAQ />
    </div>
  );
}

function IntroAccordions() {
  const sections = [
    { title: "시놉시스", body: "동네 카페에서 펼쳐지는 사흘간의 드라마. 지친 직장인, 무명 싱어송라이터, 그리고 은퇴한 로스터가 서로의 상처를 치유하며 완성하는 작은 무대." },
    { title: "캐스트 & 크리에이티브", body: "연출: 김아름 · 음악감독: 이준 · 출연: 박세린, 장태현, 위수진. 라이브 밴드 4인 구성과 커스텀 로스팅 퍼포먼스." },
    { title: "추천 포인트", body: "관객이 직접 향을 고르고 핸드드립을 완성하는 인터랙션. 시사회에 한해 애프터 토크와 MD 세트 30% 할인 제공." },
  ];
  return (
    <Card className="rounded-2xl ds-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">공연 인사이트</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-3">
          {sections.map((section, idx) => (
            <AccordionItem key={idx} value={`intro-${idx}`}>
              <AccordionTrigger className="text-sm font-semibold">{section.title}</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed">{section.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function AudienceFAQ() {
  const faq = [
    { q: "응모 조건은 무엇인가요?", a: "광고 랜딩 페이지를 1회 이상 방문하고 30초 이상 머무르면 응모 버튼이 활성화됩니다. Plus/Pro 멤버는 자동 완주 기록을 제공합니다." },
    { q: "추천 가중치는 어떻게 적용되나요?", a: "추천 코드 입력 및 친구 완료 수에 따라 최대 1.5배까지 가중치가 부여됩니다. 마이페이지에서 실시간 반영치를 확인할 수 있습니다." },
    { q: "당첨자 발표는 어디서 확인하나요?", a: "추첨 30분 전 알림이 발송되며, 결과는 마이페이지 > 응모 내역에서 확인 가능합니다. 미응답 시 24시간 후 예비 당첨자에게 이관됩니다." },
  ];
  return (
    <Card className="rounded-2xl ds-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {faq.map((item, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`}>
              <AccordionTrigger className="text-sm font-semibold">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-slate-600 leading-relaxed">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function AdGate({ adVisited, onVisitAd }: { adVisited: boolean; onVisitAd: () => void }) {
  if (adVisited) {
    return (
      <Card className="rounded-xl border-emerald-200">
        <CardContent className="p-4 text-sm text-emerald-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> 광고 미션이 확인되어 응모가 가능합니다.
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="font-semibold font-display">응모 전 미션: 스폰서 페이지 30초 체류</div>
        <div className="text-slate-600">탭 이탈시 미션이 종료될 수 있어요. 미션 완료 시 자동으로 체크됩니다.</div>
        <div className="flex gap-2">
          <Button className="rounded-xl ds-btn-accent" onClick={onVisitAd}><ExternalLink className="w-4 h-4 mr-1" />스폰서 페이지 방문</Button>
          <Button variant="outline" className="rounded-xl" onClick={onVisitAd}>이미 방문했어요</Button>
        </div>
        <div className="text-xs text-slate-500">* 브라우저 쿠키로 미션 완료 여부를 24시간 동안 저장합니다.</div>
      </CardContent>
    </Card>
  );
}

function ApplicationForm({ enabled }: { enabled: boolean }) {
  return (
    <Card className={`rounded-2xl ds-card ${!enabled ? "opacity-60 pointer-events-none" : ""}`}>
      <CardContent className="p-6 grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-semibold font-display">응모 정보</div>
          <div className="grid gap-2">
            <Input placeholder="이름" />
            <Input placeholder="이메일" />
            <Input placeholder="휴대전화(- 없이)" />
            <Input placeholder="SNS(@handle)" />
          </div>
          <Textarea className="min-h-[90px]" placeholder="응원 한마디 (선택)" />
          <div className="text-xs text-slate-500">* 개인정보 수집 및 이용 동의 체크박스, 약관 링크 노출</div>
          <Button className="w-full rounded-xl ds-btn-accent"><Gift className="w-4 h-4 mr-1" />응모하기</Button>
        </div>
        <div className="space-y-3">
          <div className="text-sm font-semibold font-display">추천 & 가중치</div>
          <div className="rounded-lg border p-3 text-xs flex items-center justify-between">
            <span>내 추천코드 <span className="font-mono">ARTA-9F3C</span></span>
            <Button size="sm" variant="outline" className="rounded-xl"><Link className="w-4 h-4 mr-1" />복사</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" className="rounded-xl"><Share2 className="w-4 h-4 mr-1" />카카오 공유</Button>
            <Button variant="outline" className="rounded-xl">Top Referrers</Button>
          </div>
          <div className="rounded-lg border p-3 text-xs space-y-2">
            <div className="font-semibold">가중치 설정</div>
            <div className="flex items-center justify-between"><span>기본</span><span>1.0</span></div>
            <div className="flex items-center justify-between"><span>추천 3인 이상</span><span>+0.2</span></div>
            <div className="flex items-center justify-between"><span>Plus 멤버</span><span>+0.3</span></div>
          </div>
          <div className="text-xs text-slate-500">* 가중치 최대 1.5배, 추첨 시 통계로 표기됩니다.</div>
        </div>
      </CardContent>
    </Card>
  );
}

function AudienceEventApply({ seenIntro, adVisited, onVisitAd }: { seenIntro: boolean; adVisited: boolean; onVisitAd: () => void }) {
  const enabled = isApplyEnabled({ seenIntro, adVisited });
  return (
    <div className="grid gap-6 font-body">
      {!seenIntro && (
        <Card className="rounded-xl border-amber-200">
          <CardContent className="p-4 text-sm text-amber-700">
            공연 소개를 먼저 확인해주세요. 상단 탭의 <b>공연 소개</b> 확인 후 응모가 열립니다.
          </CardContent>
        </Card>
      )}
      <AdGate adVisited={adVisited} onVisitAd={onVisitAd} />
      <ApplicationForm enabled={enabled} />
    </div>
  );
}

function EntryHistory() {
  const entries = [
    { title: "[시사회] 미니멀 카페뮤지컬", status: "추첨 대기", draw: "10/18 20:30", weight: "가중치 1.3" },
    { title: "[콜라보 MD] 리미티드 패키지", status: "당첨", draw: "10/12 18:00", weight: "가중치 1.1" },
    { title: "[프리뷰] 신작 넌버벌 쇼", status: "미당첨", draw: "10/05 19:00", weight: "가중치 1.0" },
  ];
  return (
    <Card className="rounded-2xl ds-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">응모 내역</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {entries.map((entry, i) => (
          <div key={i} className="rounded-xl border p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold font-display">{entry.title}</div>
              <div className="text-xs text-slate-500">추첨 {entry.draw} · {entry.weight}</div>
            </div>
            <Badge variant="outline" className="rounded-full">{entry.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TicketCard({ title, date, status }: { title: string; date: string; status: string }) {
  return (
    <div className="rounded-xl border p-3 flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        <Ticket className="w-5 h-5 text-indigo-500" />
        <div>
          <div className="font-semibold font-display text-sm">{title}</div>
          <div className="text-xs text-slate-500">{date}</div>
        </div>
      </div>
      <Badge variant="secondary" className="rounded-full">{status}</Badge>
    </div>
  );
}

function TicketWallet() {
  const tickets = [
    { title: "미니멀 카페뮤지컬 1막", date: "10/20(금) 20:00 · 대학로 스테이지", status: "발권 완료" },
    { title: "신작 넌버벌 쇼", date: "미정 · 일정 확정 시 알림", status: "대기" },
  ];
  return (
    <Card className="rounded-2xl ds-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">티켓 지갑</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-3">
        {tickets.map((ticket, i) => (
          <TicketCard key={i} title={ticket.title} date={ticket.date} status={ticket.status} />
        ))}
      </CardContent>
    </Card>
  );
}

function NotificationSettingsCard() {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4 space-y-3 text-sm">
        <div className="font-semibold font-display">알림 설정</div>
        <div className="flex items-center justify-between"><span>이메일</span><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><span>카카오 알림톡</span><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><span>SMS(긴급)</span><Switch /></div>
        <div className="flex items-center justify-between"><span>야간 알림 제한 22:00-08:00</span><Switch defaultChecked /></div>
      </CardContent>
    </Card>
  );
}

function NotificationCenter() {
  const notifications = [
    { title: "응모 완료", time: "10/18 19:55", type: "success", message: "미니멀 카페뮤지컬 응모가 접수되었습니다. 추첨은 20:30에 진행됩니다." },
    { title: "추첨 예정", time: "10/18 20:00", type: "reminder", message: "30분 후 추첨이 시작됩니다. 라이브 방송 링크를 확인하세요." },
    { title: "티켓 발송 안내", time: "10/19 09:55", type: "success", message: "당첨자 티켓이 발송되었습니다. 24시간 이내에 수령을 완료해주세요." },
  ];
  return (
    <Card className="rounded-2xl ds-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display">알림 센터</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {notifications.map((item, i) => (
          <div key={i} className="rounded-xl border p-3 flex items-start gap-3">
            <div className={`mt-1 ${item.type === "success" ? "text-emerald-600" : "text-indigo-500"}`}>
              {item.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold font-display text-sm">{item.title}</span>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">{item.message}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AudienceMyPage() {
  return (
    <div className="grid gap-6 font-body">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="font-semibold font-display">프로필</div>
            <div className="grid gap-2">
              <Input placeholder="이름" />
              <Input placeholder="이메일" />
              <Input placeholder="SNS(@handle)" />
            </div>
            <Button variant="secondary" size="sm" className="rounded-xl">정보 저장</Button>
          </CardContent>
        </Card>
        <Card className="rounded-xl">
          <CardContent className="p-4 space-y-3 text-sm">
            <div className="font-semibold font-display">멤버십</div>
            <div className="rounded-lg border p-3 flex items-center justify-between">
              <span>현재: Free</span>
              <Button size="sm" className="rounded-xl ds-btn-accent"><Crown className="w-4 h-4 mr-1" />Plus 업그레이드</Button>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Plus: 추첨 가중치 + 조기 오픈 + 광고 프리뷰</div>
              <div>Pro: 오프라인 체크인 지원 예정</div>
            </div>
          </CardContent>
        </Card>
        <NotificationSettingsCard />
      </div>
      <EntryHistory />
      <TicketWallet />
      <NotificationCenter />
    </div>
  );
}\n\nfunction PartnerSidebar({ current, onSelect }: { current: string; onSelect: (k: string) => void }) {
  const items = [
    { key: "partner-dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "??쒕낫?? },
    { key: "partner-campaigns", icon: <Megaphone className="w-4 h-4" />, label: "罹좏럹?? },
    { key: "partner-submission", icon: <Upload className="w-4 h-4" />, label: "?묓뭹 ?쒖텧" },
    { key: "partner-reports", icon: <BarChart2 className="w-4 h-4" />, label: "由ы룷?? },
    { key: "partner-widget", icon: <FileText className="w-4 h-4" />, label: "?꾩젽" },
  ];
  return (
    <aside className="h-full p-3">
      <div className="space-y-2">
        {items.map((it) => (
          <button key={it.key} onClick={() => onSelect(it.key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition ${current === it.key ? "bg-[color:var(--brand-primary)] text-white border-[color:var(--brand-primary)]" : "hover:bg-slate-100"}`}>{it.icon}<span>{it.label}</span></button>
        ))}
      </div>
      <div className="pt-4 mt-4 border-t text-xs text-slate-500">?뚰듃???덈꺼/?뱀씤 ?곹깭</div>
    </aside>
  );
}

const chartData = Array.from({ length: 12 }).map((_, i) => ({ name: `W${i + 1}`, imps: Math.round(800 + Math.random() * 600), clicks: Math.round(80 + Math.random() * 140) }));

function KPIChart({ data }: { data: any[] }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" hide /><YAxis hide /><Tooltip /><Line type="monotone" dataKey="imps" stroke="#0f172a" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} dot={false} /></LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PartnerDashboard() {
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">?듭떖 KPI</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-4 gap-4">
        {[{l:"?몄텧(7d)",v:"124,210",d:"+8.1%"},{l:"CTR(7d)",v:"3.4%",d:"+0.3pp"},{l:"?대┃(7d)",v:"4,223",d:"+6.7%"},{l:"?묐え(7d)",v:"612",d:"+10.4%"}].map((k, i) => (
          <Card key={i} className="rounded-xl"><CardContent className="p-4"><div className="text-xs text-slate-500">{k.l}</div><div className="text-2xl font-bold tracking-tight mt-1 font-display">{k.v}</div><div className="text-xs text-emerald-600 mt-1">{k.d}</div><KPIChart data={chartData} /></CardContent></Card>
        ))}
      </div></CardContent></Card>
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">?щ’ ?몃깽?좊━ & ?붽툑</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-3 gap-4">
        {["home_hero", "shows_top", "event_sidebar"].map((slot) => (
          <Card key={slot} className="rounded-xl"><CardContent className="p-4 space-y-2"><div className="text-sm font-semibold font-display">{slot}</div><div className="rounded-lg h-28 bg-slate-100" /><Button className="w-full rounded-xl ds-btn-accent">?덉빟 臾몄쓽</Button></CardContent></Card>
        ))}
      </div></CardContent></Card>
    </div>
  );
}

function PartnerCampaigns() {
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">罹좏럹???붿빟 & 吏꾪뻾?곹솴</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-xl"><CardContent className="p-4 space-y-2"><div className="font-semibold font-display">罹좏럹??#{i + 1}</div><div className="text-xs text-slate-500">湲곌컙: 10/01 ~ 10/31</div><div className="text-xs">吏꾪뻾瑜?/div><Progress value={70 - i * 12} className="h-2" /><div className="grid grid-cols-3 gap-2 text-xs"><div className="rounded-lg p-2 border">Imps <div className="font-semibold">12.4k</div></div><div className="rounded-lg p-2 border">CTR <div className="font-semibold">3.2%</div></div><div className="rounded-lg p-2 border">?대┃ <div className="font-semibold">410</div></div></div><div className="flex gap-2 pt-1"><Button variant="secondary" size="sm" className="rounded-xl">由ы룷??/Button><Button size="sm" variant="outline" className="rounded-xl">?щ━?먯씠?곕툕 ?섏젙</Button></div></CardContent></Card>
        ))}
      </div></CardContent></Card>
    </div>
  );
}

function PartnerSubmission() {
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">?묓뭹 ?쒖텧</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2"><div className="text-sm font-display">?묓뭹紐?/div><Input placeholder="?묓뭹紐낆쓣 ?낅젰" /><div className="text-sm mt-3 font-display">?쒕냹?쒖뒪</div><Textarea placeholder="媛꾨떒???뚭컻" className="min-h-[120px]" /><div className="text-sm mt-3 font-display">?ъ뒪???낅줈??/div><div className="rounded-lg h-20 border border-dashed flex items-center justify-center text-xs text-slate-500">?뚯씪 ?낅줈??/div></div>
        <div className="space-y-2"><div className="text-sm font-display">湲곌컙</div><div className="rounded-lg h-12 border flex items-center justify-center text-xs text-slate-500">?쒖옉??~ 醫낅즺??(DatePicker)</div><div className="text-sm mt-3 font-display">?덈ℓ 留곹겕</div><Input placeholder="https://" /><div className="text-sm mt-3 font-display">珥덈?沅??대깽???섑뼢</div><div className="flex items-center gap-3 text-sm"><Switch />?곌퀎 ?щ쭩</div></div>
      </div><div className="mt-4 flex items-center justify-end gap-2"><Button variant="outline" className="rounded-xl">?꾩떆 ???/Button><Button className="rounded-xl ds-btn-accent">?쒖텧?섍린</Button></div></CardContent></Card>
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">媛?대뱶 & ?뺤콉</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-3 gap-4 text-sm"><div className="rounded-xl p-4 border">?쒖떆愿묎퀬/寃쏀뭹 怨좎떆 泥댄겕由ъ뒪??/div><div className="rounded-xl p-4 border">?대?吏 洹쒓꺽/移댄뵾 媛?대뱶</div><div className="rounded-xl p-4 border">?뱀씤 SLA(24~48h)쨌臾몄쓽</div></div></CardContent></Card>
    </div>
  );
}

function PartnerReports() {
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">由ы룷??蹂대뱶</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-2 gap-4"><div className="rounded-xl p-4 border text-sm">?쇰꼸: ?몄텧 ???대┃ ???묐え ??泥댄겕??/div><div className="rounded-xl p-4 border text-sm">?멸렇癒쇳듃: ?λⅤ/梨꾨꼸/?щ’</div></div></CardContent></Card>
    </div>
  );
}

function PartnerWidget() {
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">?꾨쿋?붾툝 ?꾩젽</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4 text-sm"><div className="rounded-xl h-40 border border-dashed flex items-center justify-center">理쒓렐 ?대깽??由ъ뒪???꾨━酉?/div><div className="space-y-2"><div className="font-semibold font-display">?ㅼ튂 諛⑸쾿</div><div className="rounded-xl p-3 border bg-slate-50 font-mono text-xs">{"<script src='artause-widget.js' data-theme='light' data-limit='5'></script>"}</div><div className="text-xs text-slate-500">?뱀씤???뚰듃?덉뿉寃뚮쭔 諛쒓툒?⑸땲??</div></div></CardContent></Card>
    </div>
  );
}

/**
 * Artause Hi-Fi UI v1.4 (2025-10-18 업데이트)
 * - 역할/권한: 관람객(member) · 종사자(partner) · 관리자(admin)
 * - Intro-first 상세 + AdGate + 가중치 응모 플로우 고도화
 * - 홈(추천/랭킹/추첨 일정) · 이벤트 상세(스토리/FAQ) · 마이페이지(응모/티켓/알림)
 * - 파트너 캠페인/리포트, 관리자 추첨/이상징후 UI 보강
 * - Dev Smoke Tests: RBAC, 게이트, 신규 위젯 검증
 */
function AdminSidebar({ current, onSelect }: { current: string; onSelect: (k: string) => void }) {
  const items = [
    { key: "admin-dashboard", icon: <LayoutDashboard className="w-4 h-4"/>, label: "??쒕낫?? },
    { key: "admin-approvals", icon: <Users className="w-4 h-4"/>, label: "?뱀씤/?쒖옱" },
    { key: "admin-lottery", icon: <Shuffle className="w-4 h-4"/>, label: "異붿꺼" },
    { key: "admin-policies", icon: <Settings2 className="w-4 h-4"/>, label: "?뺤콉" },
  ];
  return (
    <aside className="h-full p-3">
      <div className="space-y-2">
        {items.map((it) => (
          <button key={it.key} onClick={() => onSelect(it.key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition ${current === it.key ? "bg-[color:var(--brand-primary)] text-white border-[color:var(--brand-primary)]" : "hover:bg-slate-100"}`}>{it.icon}<span>{it.label}</span></button>
        ))}
      </div>
      <div className="pt-4 mt-4 border-t text-xs text-slate-500">媛먯궗/媛???쒖꽦</div>
    </aside>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">?댁쁺 KPI</CardTitle></CardHeader><CardContent><div className="grid md:grid-cols-4 gap-4">
        {[{l:"?좉퇋 媛??7d)",v:"1,204"},{l:"?댁긽 ?묐え ?먯?",v:"0.6%"},{l:"?묐え ?꾨즺??,v:"78%"},{l:"?뚮┝ ?ㅽ뙣??,v:"1.2%"}].map((k, i) => (<Card key={i} className="rounded-xl"><CardContent className="p-4"><div className="text-xs text-slate-500">{k.l}</div><div className="text-2xl font-bold tracking-tight mt-1 font-display">{k.v}</div></CardContent></Card>))}
      </div></CardContent></Card>
    </div>
  );
}

function AdminApprovals() {
  return (
    <div className="grid gap-6 font-body text-sm">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">?뚰듃???뱀씤 ?湲?/CardTitle></CardHeader><CardContent className="space-y-2">
        {["Studio A","Company B","Theater C"].map((n,i)=>(<div key={i} className="flex items-center justify-between p-3 rounded-xl border"><span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4"/>{n}</span><div className="flex gap-2"><Button size="sm" variant="secondary" className="rounded-xl">?뱀씤</Button><Button size="sm" variant="outline" className="rounded-xl">諛섎젮</Button></div></div>))}
      </CardContent></Card>
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">釉붾옓由ъ뒪??/CardTitle></CardHeader><CardContent className="space-y-2"><div className="rounded-xl p-3 border flex items-center justify-between"><span>?ъ슜??#4921 (以묐났 ?묐え)</span><Button size="sm" variant="outline" className="rounded-xl">?댁젣</Button></div></CardContent></Card>
    </div>
  );
}

function AdminLottery() {
  const [entries] = useState(() => Array.from({ length: 20 }).map((_, i) => ({ id: i + 1, name: `?ъ슜??#${1000 + i}`, weight: Math.round(10 + Math.random() * 90) })));
  const [winners, setWinners] = useState<number[]>([]);
  const draw = () => {
    // ?⑥닚 媛以묒튂 異붿꺼(?곕え)
    const total = entries.reduce((s, e) => s + e.weight, 0);
    const pick = () => {
      let r = Math.random() * total, idx = 0;
      for (let i = 0; i < entries.length; i++) { r -= entries[i].weight; if (r <= 0) { idx = i; break; } }
      return entries[idx].id;
    };
    const set = new Set<number>();
    while (set.size < 5) set.add(pick());
    setWinners(Array.from(set));
  };
  return (
    <div className="grid gap-6 font-body">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">異붿꺼 ?ㅽ뻾</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="rounded-xl p-3 border"><div className="font-semibold font-display mb-2">?묐え??媛以묒튂)</div><div className="h-64 overflow-auto space-y-1">{entries.map(e => (<div key={e.id} className="flex items-center justify-between p-2 rounded-lg border"><span>{e.name}</span><Badge variant="outline">{e.weight}</Badge></div>))}</div></div>
        <div className="rounded-xl p-3 border"><div className="font-semibold font-display mb-2">?뱀꺼??/div><div className="min-h-[128px] space-y-2">{winners.length===0? <div className="text-slate-500">?꾩쭅 異붿꺼 ?꾩엯?덈떎.</div> : winners.map((id,i)=>(<div key={i} className="p-2 rounded-lg border">{entries.find(e=>e.id===id)?.name}</div>))}</div><Button className="mt-3 rounded-xl ds-btn-accent" onClick={draw}><Shuffle className="w-4 h-4 mr-1"/>異붿꺼?섍린(5紐?</Button></div>
      </CardContent></Card>
    </div>
  );
}

function AdminPolicies() {
  return (
    <div className="grid gap-6 font-body text-sm">
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">愿묎퀬 寃뚯씠???뺤콉</CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid md:grid-cols-3 gap-3"><div className="rounded-xl p-3 border">?덉슜 ?꾨찓??br/><Input placeholder="sponsor.example.com"/></div><div className="rounded-xl p-3 border">?꾩닔 泥대쪟(珥?<br/><Input placeholder="5"/></div><div className="rounded-xl p-3 border">?좏슚湲곌컙(?쒓컙)<br/><Input placeholder="24"/></div></div><div className="text-xs text-slate-500">???ㅼ젣 寃利앹? ?쒕쾭/?쎌? ?곕룞?쇰줈 援ы쁽</div></CardContent></Card>
      <Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base font-display">媛以묒튂/硫ㅻ쾭??/CardTitle></CardHeader><CardContent className="grid md:grid-cols-3 gap-3"><div className="rounded-xl p-3 border">?좉퇋 媛以묒튂<br/><Input placeholder="1.2"/></div><div className="rounded-xl p-3 border">Plus 媛以묒튂<br/><Input placeholder="1.2"/></div><div className="rounded-xl p-3 border">Pro 媛以묒튂<br/><Input placeholder="1.5"/></div></CardContent></Card>
    </div>
  );
}

/**
 * Artause Hi-Fi UI v1.4 (2025-10-18 업데이트)
 * - 역할/권한: 관람객(member) · 종사자(partner) · 관리자(admin)
 * - Intro-first 상세 + AdGate + 가중치 응모 플로우 고도화
 * - 홈(추천/랭킹/추첨 일정) · 이벤트 상세(스토리/FAQ) · 마이페이지(응모/티켓/알림)
 * - 파트너 캠페인/리포트, 관리자 추첨/이상징후 UI 보강
 * - Dev Smoke Tests: RBAC, 게이트, 신규 위젯 검증
 */
function DevTests() {
  const [show, setShow] = useState(false);
  useEffect(() => { try { const params = new URLSearchParams(window.location.search); if (params.get("tests") === "1") setShow(true); } catch {} }, []);
  if (!show) return null;
  const results = runSmokeTests();
  return (
    <Card className="max-w-7xl mx-auto my-6 rounded-xl"><CardHeader className="pb-2"><CardTitle className="text-base font-display">Dev Smoke Tests</CardTitle></CardHeader><CardContent className="text-sm"><ul className="list-disc pl-5 space-y-1">{results.map((r, i) => (<li key={i} className={r.pass ? "text-emerald-700" : "text-rose-700"}>{r.pass ? "?? : "??} {r.name}{r.message ? ` ??${r.message}` : ""}</li>))}</ul></CardContent></Card>
  );
}

function runSmokeTests(): { name: string; pass: boolean; message?: string }[] {
  const out: { name: string; pass: boolean; message?: string }[] = [];
  out.push({ name: "AudienceSchedule is defined", pass: typeof AudienceSchedule === "function" });
  out.push({ name: "ApplicationForm is defined", pass: typeof ApplicationForm === "function" });
  out.push({ name: "AudienceSchedule is defined", pass: typeof AudienceSchedule === "function" });
  out.push({ name: "ApplicationForm is defined", pass: typeof ApplicationForm === "function" });
  out.push({ name: "AudienceMyPage is defined", pass: typeof AudienceMyPage === "function" });
  out.push({ name: "RBAC: member only B2C", pass: canAccessB2C("member") && !canAccessB2C("partner") && !canAccessB2C("admin") });
  out.push({ name: "RBAC: partner B2B only when authed", pass: canAccessB2B("partner", true) && !canAccessB2B("partner", false) });
  out.push({ name: "RBAC: admin portal only when authed", pass: canAccessAdmin("admin", true) && !canAccessAdmin("admin", false) });
  out.push({ name: "Gate: apply disabled until intro+ad", pass: isApplyEnabled({ seenIntro: false, adVisited: false }) === false && isApplyEnabled({ seenIntro: true, adVisited: false }) === false && isApplyEnabled({ seenIntro: false, adVisited: true }) === false && isApplyEnabled({ seenIntro: true, adVisited: true }) === true });
  return out;
}

/**
 * Artause Hi-Fi UI v1.4 (2025-10-18 업데이트)
 * - 역할/권한: 관람객(member) · 종사자(partner) · 관리자(admin)
 * - Intro-first 상세 + AdGate + 가중치 응모 플로우 고도화
 * - 홈(추천/랭킹/추첨 일정) · 이벤트 상세(스토리/FAQ) · 마이페이지(응모/티켓/알림)
 * - 파트너 캠페인/리포트, 관리자 추첨/이상징후 UI 보강
 * - Dev Smoke Tests: RBAC, 게이트, 신규 위젯 검증
 */
export default function HiFiApp() {
  const [role, setRole] = useState<Role>("member");
  const [isAuthed, setIsAuthed] = useState(false);

  // B2C ?곹깭
  const [memberTab, setMemberTab] = useState("home");
  const [seenIntro, setSeenIntro] = useState(false);
  const [adVisited, setAdVisited] = useState(false);

  // B2B ?곹깭
  const [partnerTab, setPartnerTab] = useState("partner-dashboard");

  // Admin ?곹깭
  const [adminTab, setAdminTab] = useState("admin-dashboard");

  const isPartner = role === "partner";
  const isAdmin = role === "admin";

  const onLogin = (r: Role) => { setRole(r); setIsAuthed(true); };
  const onLogout = () => { setIsAuthed(false); };

  return (
    <div data-role={isAdmin?"admin":isPartner?"b2b":"b2c"} className="ds-app min-h-screen font-body">
      <ThemeTokens role={role} />
      <Header role={role} isAuthed={isAuthed} onLogin={onLogin} onLogout={onLogout} />

      {/* B2C */}
      {!isPartner && !isAdmin && (
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-2 text-sm text-slate-600"><ChevronRight className="w-4 h-4"/>?섏씠?뚯씠 쨌 愿媛앹슜</div>
          {!isAuthed && (<Card className="rounded-xl border-amber-200"><CardContent className="p-4 text-sm text-amber-700">?묐え/?뚮┝/??궧 湲곕뒫???ъ슜?섎젮硫?<b>濡쒓렇??/b>???꾩슂?⑸땲?? ?곷떒??濡쒓렇??踰꾪듉???뚮윭 二쇱꽭??</CardContent></Card>)}
          <Tabs value={memberTab} onValueChange={(v) => { setMemberTab(v); if (v === "event-intro") setSeenIntro(true); }} className="w-full">
            <TabsList className="grid grid-cols-4 w-full rounded-xl"><TabsTrigger value="home">??/TabsTrigger><TabsTrigger value="event-intro">怨듭뿰 ?뚭컻</TabsTrigger><TabsTrigger value="event-apply">?묐え</TabsTrigger><TabsTrigger value="mypage">留덉씠?섏씠吏</TabsTrigger></TabsList>
            <TabsContent value="home" className="space-y-6"><AudienceHero /><AudienceRanking /><AudienceSchedule /></TabsContent>
            <TabsContent value="event-intro"><AudienceEventIntro onGoApply={() => setMemberTab("event-apply")} /></TabsContent>
            <TabsContent value="event-apply"><AudienceEventApply seenIntro={seenIntro} adVisited={adVisited} onVisitAd={() => setAdVisited(true)} /></TabsContent>
            <TabsContent value="mypage"><AudienceMyPage /></TabsContent>
          </Tabs>
          <footer className="text-xs text-slate-500 py-6">짤 Artause 쨌 Bloom tokens 쨌 Intro?멑irst + AdGate</footer>
        </main>
      )}

      {/* B2B */}
      {isPartner && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {!isAuthed ? (
            <Card className="rounded-xl border-amber-200"><CardContent className="p-4 text-sm text-amber-700">?뚰듃???ы꽭? <b>醫낆궗??怨꾩젙</b>?쇰줈 濡쒓렇?????댁슜 媛?ν빀?덈떎. ?곷떒??濡쒓렇????醫낆궗??B2B)瑜??좏깮?섏꽭??</CardContent></Card>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-3 lg:col-span-2 sticky top-[76px] self-start"><Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 font-display"><LayoutDashboard className="w-4 h-4"/>Partner Portal</CardTitle></CardHeader><PartnerSidebar current={partnerTab} onSelect={setPartnerTab} /></Card></div>
              <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
                {partnerTab === "partner-dashboard" && <PartnerDashboard />}
                {partnerTab === "partner-campaigns" && <PartnerCampaigns />}
                {partnerTab === "partner-submission" && <PartnerSubmission />}
                {partnerTab === "partner-reports" && <PartnerReports />}
                {partnerTab === "partner-widget" && <PartnerWidget />}
                <footer className="text-xs text-slate-500 py-6">짤 Artause 쨌 Slate tokens 쨌 RBAC Guarded</footer>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Admin */}
      {isAdmin && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {!isAuthed ? (
            <Card className="rounded-xl border-amber-200"><CardContent className="p-4 text-sm text-amber-700">愿由ъ옄 ?ы꽭? <b>愿由ъ옄 怨꾩젙</b>?쇰줈 濡쒓렇?????댁슜 媛?ν빀?덈떎. ?곷떒??濡쒓렇????愿由ъ옄(Admin)瑜??좏깮?섏꽭??</CardContent></Card>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-3 lg:col-span-2 sticky top-[76px] self-start"><Card className="rounded-2xl ds-card"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2 font-display"><Lock className="w-4 h-4"/>Admin</CardTitle></CardHeader><AdminSidebar current={adminTab} onSelect={setAdminTab} /></Card></div>
              <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-6">
                {adminTab === "admin-dashboard" && <AdminDashboard />}
                {adminTab === "admin-approvals" && <AdminApprovals />}
                {adminTab === "admin-lottery" && <AdminLottery />}
                {adminTab === "admin-policies" && <AdminPolicies />}
                <footer className="text-xs text-slate-500 py-6">짤 Artause 쨌 Crimson tokens 쨌 RBAC Guarded</footer>
              </div>
            </div>
          )}
        </main>
      )}

      <DevTests />
    </div>
  );
}







