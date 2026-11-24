"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  const suffix = randomUUID().slice(0, 6);
  return base ? `${base}-${suffix}` : suffix;
}

/** 새 투표판 생성 후 해당 페이지로 이동 */
export async function createPoll(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const supabase = await createClient();
  const slug = makeSlug(title);

  const { error } = await supabase.from("polls").insert({ slug, title });
  if (error) throw error;

  redirect(`/poll/${slug}`);
}
