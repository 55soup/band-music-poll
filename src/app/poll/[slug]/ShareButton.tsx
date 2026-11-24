"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 접근 실패 시 무시
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-lg border border-black/15 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.08]"
    >
      {copied ? "링크 복사됨 ✓" : "🔗 링크 공유"}
    </button>
  );
}
