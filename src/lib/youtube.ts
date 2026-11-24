/**
 * 다양한 유튜브 링크 형태에서 video id를 뽑아낸다.
 * 지원: watch?v=, youtu.be/, /embed/, /shorts/, 그리고 그냥 11자리 id
 */
export function parseYouTubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // 이미 11자리 video id만 들어온 경우
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "v");
      if (idx !== -1 && parts[idx + 1]) {
        const id = parts[idx + 1];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    // URL 파싱 실패 → 아래로
  }

  return null;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function youtubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
