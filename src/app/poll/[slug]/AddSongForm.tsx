"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { addSong } from "./actions";
import type { YouTubeResult } from "@/app/api/youtube/search/route";

/** YouTube가 제목을 HTML 엔티티(&amp; &#39; 등)로 주기 때문에 디코드 */
function decodeHtml(s: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = s;
  return el.value;
}

export function AddSongForm({ slug }: { slug: string }) {
  const [mode, setMode] = useState<"search" | "paste">("search");
  const [addedBy, setAddedBy] = useState("");

  return (
    <div className="border border-[var(--line)] p-4">
      <div className="mb-3 flex items-center gap-2">
        <TabButton active={mode === "search"} onClick={() => setMode("search")}>
          [ 검색 ]
        </TabButton>
        <TabButton active={mode === "paste"} onClick={() => setMode("paste")}>
          [ 링크 ]
        </TabButton>
      </div>

      <input
        value={addedBy}
        onChange={(e) => setAddedBy(e.target.value)}
        placeholder="내 이름 (선택 — 누가 추가했는지 표시)"
        className="mb-3 w-full border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
      />

      {mode === "search" ? (
        <SearchMode slug={slug} addedBy={addedBy} />
      ) : (
        <PasteMode slug={slug} addedBy={addedBy} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-transparent text-muted hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ---------------- 검색 모드 ---------------- */

function SearchMode({ slug, addedBy }: { slug: string; addedBy: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // 입력 디바운스 후 검색
  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      setError(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "검색 실패");
          setResults([]);
        } else {
          setResults(data.results ?? []);
        }
      } catch {
        setError("검색 중 오류가 났어요.");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  function add(r: YouTubeResult) {
    setAddingId(r.videoId);
    const fd = new FormData();
    fd.set("youtube", r.videoId);
    fd.set("title", decodeHtml(r.title));
    fd.set("added_by", addedBy);
    startTransition(async () => {
      const result = await addSong(slug, fd);
      setAddingId(null);
      if (result.ok) {
        setQ("");
        setResults([]);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="곡 제목 / 아티스트로 검색 (예: 잔나비 주저하는 연인들을 위해)"
        className="w-full border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      {loading && <p className="mt-2 text-xs opacity-50">검색 중…</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {results.map((r) => (
            <li
              key={r.videoId}
              className="flex items-center gap-3 border border-[var(--line)] p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.thumbnail}
                alt=""
                className="h-12 w-20 flex-shrink-0 object-cover grayscale"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{decodeHtml(r.title)}</p>
                <p className="truncate text-xs text-muted">{decodeHtml(r.channel)}</p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => add(r)}
                className="flex-shrink-0 border border-foreground bg-foreground px-3 py-1.5 text-xs font-bold uppercase text-background transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {addingId === r.videoId ? "추가 중…" : "+ 추가"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- 링크 붙여넣기 모드 ---------------- */

function PasteMode({ slug, addedBy }: { slug: string; addedBy: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("added_by", addedBy);
    startTransition(async () => {
      const result = await addSong(slug, fd);
      if (result.ok) formRef.current?.reset();
      else setError(result.error);
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        name="youtube"
        required
        placeholder="유튜브 링크 (youtu.be/... 또는 watch?v=...)"
        className="border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      <input
        name="title"
        placeholder="곡 제목 (선택)"
        className="border border-[var(--line)] bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start border border-foreground bg-foreground px-5 py-2 text-sm font-bold uppercase tracking-wide text-background transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "추가 중…" : "+ 추가"}
      </button>
    </form>
  );
}
