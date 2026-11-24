"use client";

import { useRef, useState, useTransition } from "react";
import { addSong } from "./actions";

export function AddSongForm({ slug }: { slug: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addSong(slug, formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-xl border border-black/10 p-4 dark:border-white/15"
    >
      <h2 className="mb-3 text-sm font-semibold">곡 추가하기</h2>
      <div className="flex flex-col gap-2">
        <input
          name="youtube"
          required
          placeholder="유튜브 링크 붙여넣기 (youtu.be/... 또는 watch?v=...)"
          className="rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
        />
        <div className="flex gap-2">
          <input
            name="title"
            placeholder="곡 제목 (선택)"
            className="flex-1 rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
          />
          <input
            name="added_by"
            placeholder="추가한 사람 (선택)"
            className="w-36 rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "추가 중…" : "+ 추가"}
        </button>
      </div>
    </form>
  );
}
