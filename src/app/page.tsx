import Link from "next/link";
import { listPolls } from "@/lib/queries";
import { AsciiRule } from "./_components/AsciiRule";
import { createPoll } from "./actions";

export default async function Home() {
  const polls = await listPolls();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <header className="mb-10">
        <AsciiRule char="/" />
        <h1 className="mt-4 text-2xl font-bold tracking-[0.15em] uppercase">
          Band Setlist Poll
        </h1>
        <p className="mt-1 text-sm tracking-tight opacity-70">밴드 합주곡 투표</p>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          유튜브 링크로 곡을 추가하고, [ ▲ ] 로 투표해서 다음 합주곡을 정해요.
        </p>
        <div className="mt-4">
          <AsciiRule char="/" />
        </div>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 text-xs font-bold tracking-[0.2em] uppercase text-muted">
          [ 새 투표판 만들기 ]
        </h2>
        <form action={createPoll} className="flex gap-2">
          <input
            name="title"
            required
            placeholder="예) 12월 정기공연 셋리스트"
            className="flex-1 border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm outline-none focus:border-foreground"
          />
          <button
            type="submit"
            className="border border-foreground bg-foreground px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-background transition-opacity hover:opacity-80"
          >
            만들기
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-[0.2em] uppercase text-muted">
          [ 투표판 목록 ]
        </h2>
        {polls.length === 0 ? (
          <p className="border border-dashed border-[var(--line)] px-4 py-8 text-center text-xs text-muted">
            아직 투표판이 없어요. 위에서 하나 만들어 보세요.
          </p>
        ) : (
          <ul className="flex flex-col">
            {polls.map((poll, i) => (
              <li key={poll.id}>
                <Link
                  href={`/poll/${poll.slug}`}
                  className="flex items-center gap-3 border border-[var(--line)] px-4 py-3 text-sm transition-colors [&:not(:first-child)]:border-t-0 hover:bg-foreground hover:text-background"
                >
                  <span className="text-xs tabular-nums opacity-40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {poll.title}
                  </span>
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
