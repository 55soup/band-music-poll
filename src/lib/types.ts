export type Poll = {
  id: string;
  slug: string;
  title: string;
  performance_date: string | null; // 공연 날짜 (YYYY-MM-DD), 미설정이면 null
  target_song_count: number | null; // 공연 곡 수, 미설정이면 null
  setlist_order: string[] | null; // 수동 공연 순서 (곡 id 배열), 없으면 추천 순서
  created_at: string;
};

export type Song = {
  id: string;
  poll_id: string;
  title: string;
  youtube_video_id: string;
  added_by: string | null;
  added_by_voter: string | null;
  created_at: string;
};

export type Vote = {
  id: string;
  song_id: string;
  voter_id: string;
  created_at: string;
};

/** 투표 수와 내가 투표했는지 여부가 합쳐진, 화면 표시용 타입 */
export type SongWithVotes = Song & {
  vote_count: number;
  voted_by_me: boolean;
  can_delete: boolean; // 내가 올린 곡이라 삭제 가능한지
};
