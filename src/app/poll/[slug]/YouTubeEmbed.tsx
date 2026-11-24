"use client";

import { useState } from "react";
import { youtubeThumbnail } from "@/lib/youtube";

/**
 * 처음엔 썸네일 + ▶ 만 보여주고, 클릭하면 실제 iframe을 autoplay로 띄운다. (facade 패턴)
 * - 유튜브 플레이어를 한꺼번에 여러 개 띄우지 않아 빠르고, 까만 화면 문제도 없음.
 */
export function YouTubeEmbed({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <div className="relative aspect-video w-full bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {/* 광고차단기 등으로 플레이어가 막혀 까맣게 나올 때의 탈출구 */}
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white/90 hover:bg-black/90"
        >
          ↗ 유튜브에서 열기
        </a>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`${title} 재생`}
      className="group relative block aspect-video w-full overflow-hidden bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={youtubeThumbnail(videoId)}
        alt=""
        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        loading="lazy"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white transition-transform group-hover:scale-110">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-7 w-7">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
