"use client";

import { useMemo, useState } from "react";

interface ReferralSharePanelProps {
  campaignTitle: string;
}

export function ReferralSharePanel({ campaignTitle }: ReferralSharePanelProps) {
  const [copied, setCopied] = useState(false);
  const shareText = useMemo(
    () => `Artause ${campaignTitle} 응모 링크 공유해요! 함께 가요.`,
    [campaignTitle],
  );

  async function handleCopyLink() {
    if (typeof navigator === "undefined" || typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  }

  async function handleCopyText() {
    if (typeof navigator === "undefined") return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text", error);
    }
  }

  return (
    <div className="card space-y-4 p-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">추천 & 공유</h3>
        <p className="mt-1 text-sm text-slate-600">
          링크를 복사해 카카오톡 · DM으로 공유하거나, 스토리에 붙여넣어 친구와 함께 응모하세요.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-sm">
        <button type="button" onClick={handleCopyLink} className="btn-secondary w-full">
          이벤트 링크 복사
        </button>
        <button type="button" onClick={handleCopyText} className="btn-secondary w-full">
          초대 문구 복사
        </button>
        <a
          href="https://www.instagram.com/direct/new/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full text-center"
        >
          Instagram DM 열기
        </a>
      </div>
      {copied ? <p className="text-xs text-emerald-600">클립보드에 복사되었습니다.</p> : null}
    </div>
  );
}
