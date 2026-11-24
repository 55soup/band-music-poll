-- ============================================================
-- 곡 삭제: "올린 사람만" 삭제 가능하게 하기 위한 소유자(쿠키 ID) 기록
-- Supabase SQL Editor 에 붙여넣고 Run
-- ============================================================

-- 곡을 올린 사람의 익명 쿠키 ID (added_by 는 표시용 이름, 이건 소유권 판별용)
alter table public.songs
  add column if not exists added_by_voter text;

-- songs 삭제 정책 추가 (지금까진 select/insert 만 있었음).
-- 소유권 체크는 앱(서버 액션)에서 하고, RLS 는 밴드 내부용이라 공개로 둠.
drop policy if exists "songs delete" on public.songs;
create policy "songs delete" on public.songs for delete using (true);
