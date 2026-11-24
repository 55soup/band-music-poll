import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type YouTubeResult = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
};

/** 하루 검색 한도. YouTube 무료 할당량(10,000유닛 / 검색당 100유닛 = 100회)에 맞춤. */
const DAILY_LIMIT = Number(process.env.YOUTUBE_SEARCH_DAILY_LIMIT ?? 100);

/**
 * GET /api/youtube/search?q=검색어
 * YouTube Data API v3 로 영상을 검색해 결과를 돌려준다.
 * 키는 서버 전용(YOUTUBE_API_KEY) — 클라이언트에 노출되지 않음.
 */
export async function GET(request: Request) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY가 설정되지 않았어요. .env.local을 확인해 주세요." },
      { status: 503 },
    );
  }

  const q = new URL(request.url).searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  // 일일 한도 체크 (YouTube 호출 전에 원자적으로 카운트 +1)
  const supabase = await createClient();
  const { data: usage, error: usageError } = await supabase
    .rpc("bump_youtube_search", { daily_limit: DAILY_LIMIT })
    .single<{ allowed: boolean; used: number; day_limit: number }>();

  if (usageError) {
    return NextResponse.json(
      { error: "검색 한도 확인에 실패했어요.", detail: usageError.message },
      { status: 500 },
    );
  }
  if (!usage?.allowed) {
    return NextResponse.json(
      {
        error: `오늘 검색 한도(${DAILY_LIMIT}회)를 다 썼어요. 내일 다시 시도하거나 '링크 붙여넣기'로 추가해 주세요.`,
        used: usage?.used,
        limit: DAILY_LIMIT,
      },
      { status: 429 },
    );
  }

  const api = new URL("https://www.googleapis.com/youtube/v3/search");
  api.searchParams.set("key", apiKey);
  api.searchParams.set("part", "snippet");
  api.searchParams.set("type", "video");
  api.searchParams.set("maxResults", "8");
  api.searchParams.set("q", q);

  const res = await fetch(api, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: "유튜브 검색에 실패했어요.", detail: body.slice(0, 300) },
      { status: 502 },
    );
  }

  const data = await res.json();
  const results: YouTubeResult[] = (data.items ?? [])
    .filter((it: { id?: { videoId?: string } }) => it.id?.videoId)
    .map((it: {
      id: { videoId: string };
      snippet: {
        title: string;
        channelTitle: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
      };
    }) => ({
      videoId: it.id.videoId,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      thumbnail:
        it.snippet.thumbnails.medium?.url ??
        it.snippet.thumbnails.default?.url ??
        "",
    }));

  return NextResponse.json({ results });
}
