import Link from "next/link";
import { notFound } from "next/navigation";
import { getPollBySlug, getSongsWithVotes } from "@/lib/queries";
import { AsciiRule } from "@/app/_components/AsciiRule";
import { AddSongForm } from "./AddSongForm";
import { VoteButton } from "./VoteButton";
import { ShareButton } from "./ShareButton";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { DeleteSongButton } from "./DeleteSongButton";

export default async function PollPage({
  params,
}: PageProps<"/poll/[slug]">) {
  const { slug } = await params;
  const poll = await getPollBySlug(slug);
  if (!poll) notFound();

  const songs = await getSongsWithVotes(poll.id);
  const maxVotes = songs.reduce((m, s) => Math.max(m, s.vote_count), 0);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">
      <div className="mb-6">
        <Link href="/" className="text-xs text-muted hover:text-foreground">
          ← 투표판 목록
        </Link>
      </div>

      <header className="mb-8">
        <AsciiRule char="/" />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight">
              {poll.title}
            </h1>
            <p className="mt-1 text-xs text-muted">
              곡 {String(songs.length).padStart(2, "0")}개 · [ ▲ ] 많은 순
            </p>
          </div>
          <ShareButton />
        </div>
        <div className="mt-4">
          <AsciiRule char="/" />
        </div>
      </header>

      <div className="mb-10">
        <AddSongForm slug={slug} />
      </div>

      {songs.length === 0 ? (
        <p className="border border-dashed border-[var(--line)] px-4 py-10 text-center text-xs text-muted">
          아직 곡이 없어요. 위에 유튜브 링크를 붙여 첫 곡을 추가해 보세요.
        </p>
      ) : (
        <ol className="flex flex-col gap-5">
          {songs.map((song, i) => (
            <li key={song.id} className="border border-[var(--line)]">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm font-bold tabular-nums text-muted">
                  #{String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{song.title}</p>
                  {song.added_by && (
                    <p className="text-xs text-muted">
                      added by {song.added_by}
                    </p>
                  )}
                </div>
                <VoteButton
                  slug={slug}
                  songId={song.id}
                  voteCount={song.vote_count}
                  votedByMe={song.voted_by_me}
                  maxVotes={maxVotes}
                />
                {song.can_delete && (
                  <DeleteSongButton slug={slug} songId={song.id} />
                )}
              </div>
              <YouTubeEmbed videoId={song.youtube_video_id} title={song.title} />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
