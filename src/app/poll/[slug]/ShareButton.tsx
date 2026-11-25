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
      className="flex-shrink-0 border border-[var(--line)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
    >
      {copied ? "[ 복사됨 ]" : "[ 공유 ]"}
    </button>
  );
}
