import Link from "next/link";
import { notFound } from "next/navigation";
import { getPollBySlug, getSongsWithVotes } from "@/lib/queries";
import { buildSetlist } from "@/lib/setlist";
import { AsciiRule } from "@/app/_components/AsciiRule";
import { AddSongForm } from "./AddSongForm";
import { VoteButton } from "./VoteButton";
import { ShareButton } from "./ShareButton";
import { YouTubeEmbed } from "./YouTubeEmbed";
import { DeleteSongButton } from "./DeleteSongButton";
import { PerformanceSettings } from "./PerformanceSettings";

/** "YYYY-MM-DD" 를 로컬 자정 기준 D-day 라벨로 (D-7 / D-DAY / D+3) */
function ddayLabel(performanceDate: string): string {
  const [y, m, d] = performanceDate.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000,
  );
  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return "D-DAY";
  return `D+${-diffDays}`;
}

export default async function PollPage({
  params,
}: PageProps<"/poll/[slug]">) {
  const { slug } = await params;
  const poll = await getPollBySlug(slug);
  if (!poll) notFound();

  const songs = await getSongsWithVotes(poll.id);
  const maxVotes = songs.reduce((m, s) => Math.max(m, s.vote_count), 0);

  // 공연 곡 수가 정해졌으면 상위 N곡을 "선정곡"으로, 그 순서를 공연 흐름으로 추천
  const target = poll.target_song_count;
  const selected = target ? songs.slice(0, target) : [];
  const setlist = buildSetlist(selected);
  const roleLabel: Record<string, string> = {
    opener: "오프닝",
    finale: "피날레",
    body: "",
  };

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

        {/* 공연 정보: 날짜(D-day) + 공연 곡 수 */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          {poll.performance_date ? (
            <span className="font-bold">
              <span className="text-muted">공연</span> {poll.performance_date}{" "}
              <span className="border border-foreground px-1.5 py-0.5 tabular-nums">
                {ddayLabel(poll.performance_date)}
              </span>
            </span>
          ) : (
            <span className="text-muted">공연 날짜 미설정</span>
          )}
          {target ? (
            <span className="font-bold">
              <span className="text-muted">공연곡</span> {target}곡
            </span>
          ) : (
            <span className="text-muted">공연 곡 수 미설정</span>
          )}
        </div>
        <div className="mt-3">
          <PerformanceSettings
            slug={slug}
            performanceDate={poll.performance_date}
            targetSongCount={poll.target_song_count}
          />
        </div>

        <div className="mt-4">
          <AsciiRule char="/" />
        </div>
      </header>

      {/* 추천 셋리스트 (공연 곡 수가 정해졌을 때) */}
      {setlist.length > 0 && (
        <section className="mb-10 border border-[var(--line)] p-4">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-muted">
            [ 추천 셋리스트 ]
          </h2>
          <p className="mt-1 text-[0.7rem] leading-relaxed text-muted">
            지금 투표수(인기) 기준 공연 흐름 추천 순서예요. 2위 곡으로 열고,
            1위 곡으로 닫아요.
          </p>
          <ol className="mt-3 flex flex-col">
            {setlist.map((entry) => (
              <li
                key={entry.song.id}
                className="flex items-center gap-3 border-[var(--line)] py-2 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-dashed"
              >
                <span className="text-sm font-bold tabular-nums text-muted">
                  {String(entry.position).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {entry.song.title}
                </span>
                {roleLabel[entry.role] && (
                  <span className="flex-shrink-0 border border-foreground px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide">
                    {roleLabel[entry.role]}
                  </span>
                )}
                <span className="flex-shrink-0 text-xs tabular-nums text-muted">
                  ▲{String(entry.song.vote_count).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mb-10">
        <AddSongForm slug={slug} />
      </div>

      {songs.length === 0 ? (
        <p className="border border-dashed border-[var(--line)] px-4 py-10 text-center text-xs text-muted">
          아직 곡이 없어요. 위에 유튜브 링크를 붙여 첫 곡을 추가해 보세요.
        </p>
      ) : (
        <ol className="flex flex-col gap-5">
          {songs.map((song, i) => {
            const isSelected = !!target && i < target;
            // 선정곡 컷라인: N번째 곡과 N+1번째 곡 사이
            const showCut = !!target && i === target && target < songs.length;
            return (
              <li key={song.id}>
                {showCut && (
                  <div className="mb-5 text-center text-[0.65rem] uppercase tracking-[0.3em] text-muted">
                    ─── 공연곡 컷 ({target}곡) ───
                  </div>
                )}
                <div
                  className={[
                    "border",
                    isSelected
                      ? "border-foreground"
                      : "border-[var(--line)] opacity-60",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-sm font-bold tabular-nums text-muted">
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {isSelected && <span className="text-foreground">★ </span>}
                        {song.title}
                      </p>
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
                  <YouTubeEmbed
                    videoId={song.youtube_video_id}
                    title={song.title}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
