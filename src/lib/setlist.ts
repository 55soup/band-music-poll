import type { SongWithVotes } from "@/lib/types";

export type SetlistRole = "opener" | "body" | "finale";

export type SetlistEntry = {
  song: SongWithVotes;
  position: number; // 1-based 순서
  role: SetlistRole;
};

/**
 * 투표수(인기) 기반 "공연 흐름" 추천 순서.
 *
 * 입력 `selected` 는 투표수 내림차순 정렬된 선정곡 배열이어야 한다.
 * 규칙:
 *  - 피날레(마지막) = 1위 곡  → 가장 인기곡으로 마무리
 *  - 오프닝(처음)   = 2위 곡  → 강하게 시작하되 최고는 아껴둠
 *  - 중간(body)     = 나머지를 V자 골짜기로 배치 (바깥은 높고 중앙이 최저)
 *
 * 주의: 음악적 템포가 아니라 투표수(인기도) 기준 흐름이다.
 */
export function heuristicOrder(selected: SongWithVotes[]): SongWithVotes[] {
  const n = selected.length;
  if (n <= 1) return [...selected];

  const finale = selected[0]; // 1위 → 마지막
  const opener = selected[1]; // 2위 → 처음
  const rest = selected.slice(2); // 3위 이하 (내림차순 유지)

  // 바깥(오프닝 직후·피날레 직전)에 높은 표, 중앙에 낮은 표 → V자 골짜기
  const left: SongWithVotes[] = []; // 짝수 인덱스: 내려가는 왼쪽 팔
  const right: SongWithVotes[] = []; // 홀수 인덱스: 올라가는 오른쪽 팔
  rest.forEach((song, i) => {
    (i % 2 === 0 ? left : right).push(song);
  });

  return [opener, ...left, ...right.reverse(), finale];
}

/**
 * 최종 공연 순서를 결정한다.
 *  - 수동 순서(savedOrder)가 있으면 그 순서를 따르되, 현재 선정곡 기준으로 정리:
 *      · 선정곡에 없는 id(컷 밖으로 밀려남)는 제외
 *      · 저장된 순서에 없는 새 선정곡은 뒤에 붙임(투표수 순)
 *  - 없으면 추천(휴리스틱) 순서 사용
 */
export function orderSelected(
  selected: SongWithVotes[],
  savedOrder: string[] | null,
): SongWithVotes[] {
  if (!savedOrder || savedOrder.length === 0) return heuristicOrder(selected);

  const byId = new Map(selected.map((s) => [s.id, s]));
  const ordered: SongWithVotes[] = [];
  for (const id of savedOrder) {
    const song = byId.get(id);
    if (song) {
      ordered.push(song);
      byId.delete(id);
    }
  }
  // 저장 순서에 없던 새 선정곡 (byId 는 원래 투표수 내림차순 유지)
  for (const song of byId.values()) ordered.push(song);
  return ordered;
}

/** 위치 기반 역할: 처음=오프닝, 마지막=피날레, 가운데=body */
export function roleFor(index: number, length: number): SetlistRole {
  if (length === 1) return "finale";
  if (index === 0) return "opener";
  if (index === length - 1) return "finale";
  return "body";
}

/** 순서 배열 → 역할 라벨이 붙은 SetlistEntry[] */
export function toEntries(ordered: SongWithVotes[]): SetlistEntry[] {
  return ordered.map((song, i) => ({
    song,
    position: i + 1,
    role: roleFor(i, ordered.length),
  }));
}
