"use client";

import { useOptimistic, useTransition } from "react";
import { toggleVote } from "./actions";

type VoteState = { voteCount: number; votedByMe: boolean };

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
  const [, startTransition] = useTransition();

  // 클릭 즉시 숫자/상태를 바꿔 보여주고(낙관적), DB 반영은 뒤에서.
  // 서버가 revalidate 하면 실제 값으로 자연스럽게 수렴하고, 실패하면 원래대로 되돌아감.
  const [optimistic, applyOptimistic] = useOptimistic<VoteState, void>(
    { voteCount, votedByMe },
    (state) => {
      const nextVoted = !state.votedByMe;
      return {
        votedByMe: nextVoted,
        voteCount: state.voteCount + (nextVoted ? 1 : -1),
      };
    },
  );

  function onClick() {
    startTransition(async () => {
      applyOptimistic();
      await toggleVote(slug, songId);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={optimistic.votedByMe}
      className={[
        "flex min-w-16 items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        optimistic.votedByMe
          ? "border-transparent bg-foreground text-background"
          : "border-black/20 hover:bg-black/[.04] dark:border-white/25 dark:hover:bg-white/[.08]",
      ].join(" ")}
    >
      <span>👍</span>
      <span>{optimistic.voteCount}</span>
    </button>
  );
}
