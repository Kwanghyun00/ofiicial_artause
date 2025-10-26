"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/layout/AuthContext";
import { useRole } from "@/components/layout/RoleContext";

type Highlight = {
  title: string;
  description: string;
};

type Channel = {
  channel: string;
  detail: string;
};

type PolicyCard = {
  title: string;
  detail: string;
};

const activityHighlights: Highlight[] = [
  {
    title: "Intro-first",
    description: "Scroll 60% or dwell 5 seconds on a show detail page to unlock entry for 24 hours.",
  },
  {
    title: "AdGate",
    description: "Land from an approved partner domain with utm_campaign and dwell 5 seconds to verify ad exposure.",
  },
  {
    title: "Weighted lottery",
    description: "Weights range from 1.0 to 4.0 with newbie, referral, loss-recovery, early bird, and region bonuses.",
  },
];

const notificationChannels: Channel[] = [
  { channel: "Email", detail: "Application receipts and draw results" },
  { channel: "SMS", detail: "Waitlist promotions and day-of reminders" },
  { channel: "KakaoTalk", detail: "Daily digest after quiet hours (22:00-08:00 KST)" },
];

const policyCards: PolicyCard[] = [
  {
    title: "Kakao login only",
    detail: "Only whitelisted Kakao IDs can access audience routes. Email/password accounts are disabled.",
  },
  {
    title: "Quiet hours",
    detail: "Marketing notifications pause between 22:00 and 08:00 KST. Emergencies require PM approval and audit notes.",
  },
  {
    title: "Data minimisation",
    detail: "Entry collects name, email, phone, optional referral code, and memo. Records expire within 90 days of completion.",
  },
];

export default function MePage() {
  const { user, initialized } = useAuth();
  const { role } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      router.replace("/");
    }
  }, [initialized, user, router]);

  if (!initialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (role === "partner") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center text-slate-700">
        <h1 className="text-2xl font-semibold text-slate-900">Continue in the partner console</h1>
        <p className="text-sm">
          You are logged in with a partner role. Campaign reports and AdGate approvals live in the Slate console.
        </p>
        <Link href="/partner" className="btn-primary">
          Open Slate console
        </Link>
      </div>
    );
  }

  const audienceMetrics = user.metrics;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold text-indigo-600">
          Kakao whitelist account
        </div>
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">{user.name}&apos;s audience profile</h1>
            <p className="mt-2 text-sm text-slate-600">
              Track your Intro-first and AdGate progress, recent entries, and lottery outcomes. Quiet hours are enforced automatically.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-700">Tier: {user.tier}</span>
            {audienceMetrics.upcomingShow ? <span>Next confirmed show: {audienceMetrics.upcomingShow}</span> : null}
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {activityHighlights.map((item) => (
          <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            <p className="mt-2 text-xs text-slate-500">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
        <p className="mt-1 text-sm text-slate-600">Rolling 90 day summary.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Intro-first passes" value={`${audienceMetrics.missionsCompleted}`} note="Includes re-checks" />
          <StatCard label="Show favourites" value={`${audienceMetrics.favorites}`} note="Saved shows ready for AdGate" />
          <StatCard label="Bloom points" value={`${audienceMetrics.points.toLocaleString()} pts`} note="Community and referral actions" />
          <StatCard
            label="Upcoming shows"
            value={audienceMetrics.upcomingShow ? "1" : "0"}
            note={audienceMetrics.upcomingShow ?? "Browse shows to plan your next visit"}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Notification channels</h2>
          <p className="mt-1 text-sm text-slate-600">Linked to your Kakao login session. Quiet hours rules apply.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {notificationChannels.map((pref) => (
              <div key={pref.channel} className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-wide text-slate-500">{pref.channel}</p>
                <p className="mt-2 text-slate-700">{pref.detail}</p>
                <button type="button" className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-500">
                  Manage preferences
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm">
          <h2 className="text-lg font-semibold">Policy summary</h2>
          <p className="mt-1 text-sm text-white/80">Audience policies inherited from PRD_MAIN.</p>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {policyCards.map((policy) => (
              <li key={policy.title} className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="font-semibold text-white/90">{policy.title}</p>
                <p className="mt-1 text-xs text-white/70">{policy.detail}</p>
              </li>
            ))}
          </ul>
          <Link href="/pricing" className="btn-secondary mt-4 inline-flex border-white/40 text-white hover:border-white/70">
            View access policy
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
