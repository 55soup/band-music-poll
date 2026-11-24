"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateVoterId } from "@/lib/voter";
import { parseYouTubeId } from "@/lib/youtube";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** 곡 추가: 유튜브 링크 + (선택) 제목 */
export async function addSong(
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const urlRaw = String(formData.get("youtube") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const addedBy = String(formData.get("added_by") ?? "").trim() || null;

  const videoId = parseYouTubeId(urlRaw);
  if (!videoId) {
    return { ok: false, error: "유튜브 링크를 인식하지 못했어요. 주소를 다시 확인해 주세요." };
  }

  const voterId = await getOrCreateVoterId();
  const supabase = await createClient();

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (pollError) return { ok: false, error: pollError.message };
  if (!poll) return { ok: false, error: "투표판을 찾을 수 없어요." };

  const { error } = await supabase.from("songs").insert({
    poll_id: poll.id,
    title: title || "제목 없는 곡",
    youtube_video_id: videoId,
    added_by: addedBy,
    added_by_voter: voterId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/poll/${slug}`);
  return { ok: true };
}

/** 곡 삭제: 올린 사람(쿠키 ID 일치)만 가능 */
export async function deleteSong(
  slug: string,
  songId: string,
): Promise<ActionResult> {
  const voterId = await getOrCreateVoterId();
  const supabase = await createClient();

  const { data: song, error: selError } = await supabase
    .from("songs")
    .select("added_by_voter")
    .eq("id", songId)
    .maybeSingle();
  if (selError) return { ok: false, error: selError.message };
  if (!song) return { ok: false, error: "이미 삭제된 곡이에요." };

  if (song.added_by_voter !== voterId) {
    return { ok: false, error: "내가 올린 곡만 삭제할 수 있어요." };
  }

  const { error } = await supabase.from("songs").delete().eq("id", songId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/poll/${slug}`);
  return { ok: true };
}

/** 투표 토글: 이미 했으면 취소, 안 했으면 추가 */
export async function toggleVote(
  slug: string,
  songId: string,
): Promise<ActionResult> {
  const voterId = await getOrCreateVoterId();
  const supabase = await createClient();

  const { data: existing, error: selError } = await supabase
    .from("votes")
    .select("id")
    .eq("song_id", songId)
    .eq("voter_id", voterId)
    .maybeSingle();
  if (selError) return { ok: false, error: selError.message };

  if (existing) {
    const { error } = await supabase.from("votes").delete().eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ song_id: songId, voter_id: voterId });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/poll/${slug}`);
  return { ok: true };
}
