"use client";

import { useState, useTransition } from "react";
import { updatePollSettings } from "./actions";

export function PerformanceSettings({
  slug,
  performanceDate,
  targetSongCount,
}: {
  slug: string;
  performanceDate: string | null;
  targetSongCount: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePollSettings(slug, fd);
      if (result.ok) setOpen(false);
      else setError(result.error);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
      >
        [ 공연 정보 수정 ]
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 border border-[var(--line)] p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[0.65rem] uppercase tracking-wide text-muted">
            공연 날짜
          </span>
          <input
            type="date"
            name="performance_date"
            defaultValue={performanceDate ?? ""}
            className="w-full border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[0.65rem] uppercase tracking-wide text-muted">
            공연 곡 수
          </span>
          <input
            type="number"
            name="target_song_count"
            min={1}
            defaultValue={targetSongCount ?? ""}
            placeholder="예) 5"
            className="w-full border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="border border-foreground bg-foreground px-5 py-2 text-sm font-bold uppercase tracking-wide text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {pending ? "저장 중…" : "저장"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="border border-[var(--line)] px-5 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          취소
        </button>
      </div>
    </form>
  );
}
