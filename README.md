# 🎸 밴드 합주곡 투표 (band-music-poll)

유튜브 링크로 합주곡을 추가하고 👍 로 투표해서 다음 합주곡을 정하는 사이트.
링크를 받은 사람은 누구나 곡을 추가하고 투표할 수 있어요. (로그인 없이 익명 쿠키로 구분)

## 스택

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Supabase** (PostgreSQL) — publishable key로 클라이언트 연결
- 투표자 구분: 익명 쿠키(`voter_id`)
- Node **22** 이상 필요 (`.nvmrc` 참고)

## 처음 세팅

1. **환경변수** — `.env.local` 에 Supabase 값 채우기 (`.env.example` 참고)
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
   ```
2. **DB 스키마** — Supabase 대시보드 > SQL Editor 에 [`supabase/schema.sql`](supabase/schema.sql) 붙여넣고 Run
3. **의존성 & 실행**
   ```bash
   nvm use         # Node 22
   yarn install
   yarn dev        # http://localhost:3000
   ```

## 데이터 모델

- `polls` — 투표판 (링크 하나 = 행 하나, `slug`로 접근)
- `songs` — 곡 (`poll_id`, `youtube_video_id`, `added_by`)
- `votes` — 투표 (`song_id` + `voter_id` 유니크 = 한 곡당 1인 1표)

곡 목록은 투표수 내림차순(동률이면 추가된 순)으로 정렬돼요.

## 라우트

- `/` — 투표판 목록 + 새 투표판 만들기
- `/poll/[slug]` — 곡 추가 / 유튜브 임베드 / 투표

## 참고

- 지금 RLS 정책은 로그인 없는 밴드 내부용이라 **공개(public)** 상태입니다.
  나중에 멤버 로그인을 붙이면 `supabase/schema.sql`의 정책을 조여야 해요.
