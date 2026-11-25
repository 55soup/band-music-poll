import type { SongWithVotes } from "@/lib/types";

export type SetlistRole = "opener" | "body" | "finale";

export type SetlistEntry = {
  song: SongWithVotes;
  position: number; // 1-based 순서
  role: SetlistRole;
};

/**
 * 투표수(인기) 기반 "공연 흐름" 셋리스트 순서 추천.
 *
 * 입력 `selected` 는 투표수 내림차순으로 정렬된 선정곡 배열이어야 한다
 * (getSongsWithVotes 결과를 상위 N곡으로 slice 해서 넘기면 됨).
 *
 * 규칙:
 *  - 피날레(마지막)  = 1위 곡  → 가장 인기곡으로 마무리
 *  - 오프닝(처음)    = 2위 곡  → 강하게 시작하되 최고는 아껴둠
 *  - 중간(body)      = 나머지를 V자 골짜기로 배치 (바깥은 높고 중앙이 최저)
 *
 * 주의: 음악적 템포가 아니라 투표수(인기도) 기준 흐름이다.
 */
export function buildSetlist(selected: SongWithVotes[]): SetlistEntry[] {
  const n = selected.length;
  if (n === 0) return [];
  if (n === 1) return [{ song: selected[0], position: 1, role: "finale" }];

  const finale = selected[0]; // 1위 → 마지막
  const opener = selected[1]; // 2위 → 처음
  const rest = selected.slice(2); // 3위 이하 (내림차순 유지)

  // 중간: 바깥(오프닝 직후·피날레 직전)에 높은 표, 중앙에 낮은 표 → V자 골짜기
  const left: SongWithVotes[] = []; // 짝수 인덱스(0,2,..): 내려가는 왼쪽 팔
  const right: SongWithVotes[] = []; // 홀수 인덱스(1,3,..): 올라가는 오른쪽 팔
  rest.forEach((song, i) => {
    (i % 2 === 0 ? left : right).push(song);
  });
  const middle = [...left, ...right.reverse()];

  const ordered = [opener, ...middle, finale];
  return ordered.map((song, i) => ({
    song,
    position: i + 1,
    role: i === 0 ? "opener" : i === ordered.length - 1 ? "finale" : "body",
  }));
}
