"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // slug 은 ASCII 만 — 한글이 들어가면 URL/헤더 인코딩에서 깨짐
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  const suffix = randomUUID().slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}

/** 공연 날짜 정규화: 빈 값이면 null, 아니면 YYYY-MM-DD 문자열 그대로 */
function parsePerformanceDate(formData: FormData): string | null {
  const raw = String(formData.get("performance_date") ?? "").trim();
  return raw || null;
}

/** 공연 곡 수 정규화: 숫자 아니거나 1 미만이면 null */
function parseTargetSongCount(formData: FormData): number | null {
  const raw = String(formData.get("target_song_count") ?? "").trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) || n < 1 ? null : n;
}

/** 새 투표판 생성 후 해당 페이지로 이동 */
export async function createPoll(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const slug = makeSlug(title);

  const { error } = await supabase.from("polls").insert({
    slug,
    title,
    performance_date: parsePerformanceDate(formData),
    target_song_count: parseTargetSongCount(formData),
  });
  if (error) throw error;

  redirect(`/poll/${encodeURIComponent(slug)}`);
}
