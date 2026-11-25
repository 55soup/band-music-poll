-- ============================================================
-- 공연 정보: 공연 날짜 + 공연 곡 수
-- Supabase SQL Editor 에 붙여넣고 Run
-- ============================================================

-- 공연 날짜 (언제 공연인지), 공연 곡 수 (몇 곡 할지) — 둘 다 선택(null 가능)
alter table public.polls
  add column if not exists performance_date  date;
alter table public.polls
  add column if not exists target_song_count int;

-- polls 수정 정책 추가 (지금까진 select/insert 만 있었음).
-- 공연 정보는 상세 페이지에서 나중에 수정 가능해야 하므로 update 를 허용.
-- 로그인 없는 밴드 내부용이라 공개 정책.
drop policy if exists "polls update" on public.polls;
create policy "polls update" on public.polls for update using (true) with check (true);
