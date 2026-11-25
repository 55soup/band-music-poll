"use client";

import { useOptimistic, useTransition } from "react";
import { asciiBar } from "@/lib/ascii";
import { toggleVote } from "./actions";

type VoteState = { voteCount: number; votedByMe: boolean };

export function VoteButton({
  slug,
  songId,
  voteCount,
  votedByMe,
  maxVotes,
}: {
  slug: string;
  songId: string;
  voteCount: number;
  votedByMe: boolean;
  maxVotes: number;
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

  // 낙관적 득표수가 현재 최대치를 넘으면 그 값을 상한으로 써서 막대가 꽉 차게
  const scale = Math.max(maxVotes, optimistic.voteCount);

  return (
    <div className="flex items-center gap-3">
      <span className="ascii-bar hidden text-sm text-muted sm:inline">
        {asciiBar(optimistic.voteCount, scale)}
      </span>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={optimistic.votedByMe}
        className={[
          "flex min-w-20 items-center justify-center gap-2 border px-3 py-2 text-sm font-bold tabular-nums transition-colors",
          optimistic.votedByMe
            ? "border-foreground bg-foreground text-background"
            : "border-[var(--line)] hover:border-foreground",
        ].join(" ")}
      >
        <span>{optimistic.votedByMe ? "■" : "▲"}</span>
        <span>{String(optimistic.voteCount).padStart(2, "0")}</span>
      </button>
    </div>
  );
}
