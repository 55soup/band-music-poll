import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const VOTER_COOKIE = "voter_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * 로그인 없이 투표자를 구분하기 위한 익명 ID.
 * 쿠키에 없으면 새로 발급해 저장한다. (서버 액션/라우트 핸들러에서 호출)
 */
export async function getOrCreateVoterId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VOTER_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(VOTER_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}

/** 읽기 전용: 쿠키에 있는 투표자 ID (없으면 null). 서버 컴포넌트에서 set 없이 조회용 */
export async function getVoterId(): Promise<string | null> {
  const store = await cookies();
  return store.get(VOTER_COOKIE)?.value ?? null;
}
