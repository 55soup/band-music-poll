-- ============================================================
-- 유튜브 검색 일일 한도 (무료 할당량 = 하루 검색 100회)
-- Supabase SQL Editor 에 붙여넣고 Run
-- ============================================================

-- 날짜별 검색 횟수 카운터
create table if not exists public.youtube_search_usage (
  day   date primary key default current_date,
  count int  not null default 0
);

-- 클라이언트가 직접 못 건드리게 RLS 켜고 정책은 안 둠(=아무도 직접 접근 불가).
-- 아래 security definer 함수를 통해서만 증가시킨다.
alter table public.youtube_search_usage enable row level security;

-- 오늘 카운터를 원자적으로 +1. 한도 넘으면 증가 안 하고 allowed=false 반환.
create or replace function public.bump_youtube_search(daily_limit int)
returns table(allowed boolean, used int, day_limit int)
language plpgsql
security definer
set search_path = public
as $$
declare
  cur int;
begin
  insert into public.youtube_search_usage(day, count)
    values (current_date, 0)
    on conflict (day) do nothing;

  select count into cur
    from public.youtube_search_usage
    where day = current_date
    for update;

  if cur >= daily_limit then
    return query select false, cur, daily_limit;
  else
    update public.youtube_search_usage
      set count = count + 1
      where day = current_date;
    return query select true, cur + 1, daily_limit;
  end if;
end;
$$;

-- anon(publishable key) 가 이 함수만 실행할 수 있게 권한 부여
grant execute on function public.bump_youtube_search(int) to anon, authenticated;
