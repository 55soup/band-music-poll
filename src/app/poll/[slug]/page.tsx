import Link from "next/link";
import { notFound } from "next/navigation";
import { getPollBySlug, getSongsWithVotes } from "@/lib/queries";
import { AddSongForm } from "./AddSongForm";
import { VoteButton } from "./VoteButton";
import { ShareButton } from "./ShareButton";
import { YouTubeEmbed } from "./YouTubeEmbed";

export default async function PollPage({
  params,
}: PageProps<"/poll/[slug]">) {
  const { slug } = await params;
  const poll = await getPollBySlug(slug);
  if (!poll) notFound();

  const songs = await getSongsWithVotes(poll.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <div className="mb-6">
        <Link href="/" className="text-xs opacity-50 hover:opacity-80">
          ← 투표판 목록
        </Link>
      </div>

      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{poll.title}</h1>
          <p className="mt-1 text-sm opacity-60">
            곡 {songs.length}개 · 👍 많은 순으로 정렬
          </p>
        </div>
        <ShareButton />
      </header>

      <div className="mb-10">
        <AddSongForm slug={slug} />
      </div>

      {songs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-black/15 px-4 py-10 text-center text-sm opacity-60 dark:border-white/20">
          아직 곡이 없어요. 위에 유튜브 링크를 붙여 첫 곡을 추가해 보세요.
        </p>
      ) : (
        <ol className="flex flex-col gap-5">
          {songs.map((song, i) => (
            <li
              key={song.id}
              className="overflow-hidden rounded-xl border border-black/10 dark:border-white/15"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-center text-lg font-bold opacity-30">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{song.title}</p>
                  {song.added_by && (
                    <p className="text-xs opacity-50">추가: {song.added_by}</p>
                  )}
                </div>
                <VoteButton
                  slug={slug}
                  songId={song.id}
                  voteCount={song.vote_count}
                  votedByMe={song.voted_by_me}
                />
              </div>
              <YouTubeEmbed videoId={song.youtube_video_id} title={song.title} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
