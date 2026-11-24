import Link from "next/link";
import { listPolls } from "@/lib/queries";
import { createPoll } from "./actions";

export default async function Home() {
  const polls = await listPolls();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">🎸 밴드 합주곡 투표</h1>
        <p className="mt-2 text-sm opacity-70">
          유튜브 링크로 곡을 추가하고, 👍 로 투표해서 다음 합주곡을 정해요.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-60">
          새 투표판 만들기
        </h2>
        <form action={createPoll} className="flex gap-2">
          <input
            name="title"
            required
            placeholder="예) 12월 정기공연 셋리스트"
            className="flex-1 rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-black/40 dark:border-white/20 dark:focus:border-white/50"
          />
          <button
            type="submit"
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            만들기
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide opacity-60">
          투표판 목록
        </h2>
        {polls.length === 0 ? (
          <p className="rounded-lg border border-dashed border-black/15 px-4 py-8 text-center text-sm opacity-60 dark:border-white/20">
            아직 투표판이 없어요. 위에서 하나 만들어 보세요.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {polls.map((poll) => (
              <li key={poll.id}>
                <Link
                  href={`/poll/${poll.slug}`}
                  className="flex items-center justify-between rounded-lg border border-black/10 px-4 py-3 text-sm transition-colors hover:bg-black/[.03] dark:border-white/15 dark:hover:bg-white/[.06]"
                >
                  <span className="font-medium">{poll.title}</span>
                  <span className="opacity-40">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
