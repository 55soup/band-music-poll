-- ============================================================
-- band-music-poll 스키마
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run
-- ============================================================

create extension if not exists pgcrypto;

-- 투표판 (나중에 링크 여러 개 = polls 여러 행)
create table if not exists public.polls (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title      text not null,
  created_at timestamptz not null default now()
);

-- 곡
create table if not exists public.songs (
  id               uuid primary key default gen_random_uuid(),
  poll_id          uuid not null references public.polls(id) on delete cascade,
  title            text not null,
  youtube_video_id text not null,
  added_by         text,
  created_at       timestamptz not null default now()
);

-- 투표 (한 곡당 한 사람 1표)
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  song_id    uuid not null references public.songs(id) on delete cascade,
  voter_id   text not null,
  created_at timestamptz not null default now(),
  unique (song_id, voter_id)
);

create index if not exists songs_poll_id_idx on public.songs(poll_id);
create index if not exists votes_song_id_idx on public.votes(song_id);

-- ============================================================
-- RLS (Row Level Security)
-- 지금은 로그인 없는 밴드 내부용이라 공개 정책.
-- 나중에 멤버 로그인 붙이면 정책을 조여야 함.
-- ============================================================

alter table public.polls enable row level security;
alter table public.songs enable row level security;
alter table public.votes enable row level security;

-- polls: 누구나 읽기/생성 (삭제/수정은 막아둠)
drop policy if exists "polls read"   on public.polls;
drop policy if exists "polls insert" on public.polls;
create policy "polls read"   on public.polls for select using (true);
create policy "polls insert" on public.polls for insert with check (true);

-- songs: 누구나 읽기/추가
drop policy if exists "songs read"   on public.songs;
drop policy if exists "songs insert" on public.songs;
create policy "songs read"   on public.songs for select using (true);
create policy "songs insert" on public.songs for insert with check (true);

-- votes: 누구나 읽기/추가/삭제(=취소)
drop policy if exists "votes read"   on public.votes;
drop policy if exists "votes insert" on public.votes;
drop policy if exists "votes delete" on public.votes;
create policy "votes read"   on public.votes for select using (true);
create policy "votes insert" on public.votes for insert with check (true);
create policy "votes delete" on public.votes for delete using (true);

-- ============================================================
-- 시드: 우리 밴드 기본 투표판
-- ============================================================
insert into public.polls (slug, title)
values ('our-band', '우리 밴드 합주곡 투표')
on conflict (slug) do nothing;
