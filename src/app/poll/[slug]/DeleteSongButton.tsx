"use client";

import { useTransition } from "react";
import { deleteSong } from "./actions";

export function DeleteSongButton({
  slug,
  songId,
}: {
  slug: string;
  songId: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("이 곡을 삭제할까요? (투표도 함께 사라져요)")) return;
    startTransition(async () => {
      const result = await deleteSong(slug, songId);
      if (!result.ok) alert(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label="곡 삭제"
      title="내가 올린 곡 삭제"
      className="flex-shrink-0 rounded-full px-2 py-2 text-sm opacity-40 transition hover:bg-red-500/10 hover:text-red-500 hover:opacity-100 disabled:opacity-30"
    >
      {pending ? "…" : "🗑"}
    </button>
  );
}
