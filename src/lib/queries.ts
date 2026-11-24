import { createClient } from "@/lib/supabase/server";
import { getVoterId } from "@/lib/voter";
import type { Poll, SongWithVotes } from "@/lib/types";

/** 전체 투표판 목록 (최신순) */
export async function listPolls(): Promise<Poll[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** slug 로 투표판 하나 */
export async function getPollBySlug(slug: string): Promise<Poll | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * 투표판의 곡들을 투표수와 함께 가져온다.
 * 투표수 내림차순 → 동률이면 먼저 추가된 순.
 */
export async function getSongsWithVotes(pollId: string): Promise<SongWithVotes[]> {
  const supabase = await createClient();
  const voterId = await getVoterId();

  const { data: songs, error: songsError } = await supabase
    .from("songs")
    .select("*")
    .eq("poll_id", pollId);
  if (songsError) throw songsError;
  if (!songs || songs.length === 0) return [];

  const songIds = songs.map((s) => s.id);
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("song_id, voter_id")
    .in("song_id", songIds);
  if (votesError) throw votesError;

  const counts = new Map<string, number>();
  const mine = new Set<string>();
  for (const v of votes ?? []) {
    counts.set(v.song_id, (counts.get(v.song_id) ?? 0) + 1);
    if (voterId && v.voter_id === voterId) mine.add(v.song_id);
  }

  return songs
    .map((s) => ({
      ...s,
      vote_count: counts.get(s.id) ?? 0,
      voted_by_me: mine.has(s.id),
    }))
    .sort(
      (a, b) =>
        b.vote_count - a.vote_count ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
}
