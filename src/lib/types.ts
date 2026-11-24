export type Poll = {
  id: string;
  slug: string;
  title: string;
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
