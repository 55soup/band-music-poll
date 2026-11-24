"use client";

import { useTransition } from "react";
import { toggleVote } from "./actions";

export function VoteButton({
  slug,
  songId,
  voteCount,
  votedByMe,
}: {
  slug: string;
  songId: string;
  voteCount: number;
  votedByMe: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void toggleVote(slug, songId))}
      aria-pressed={votedByMe}
      className={[
        "flex min-w-16 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
        votedByMe
          ? "border-transparent bg-foreground text-background"
          : "border-black/20 hover:bg-black/[.04] dark:border-white/25 dark:hover:bg-white/[.08]",
      ].join(" ")}
    >
      <span>👍</span>
      <span>{voteCount}</span>
    </button>
  );
}
