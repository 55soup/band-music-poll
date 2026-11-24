import { createBrowserClient } from "@supabase/ssr";

/** 브라우저(클라이언트 컴포넌트)에서 쓰는 Supabase 클라이언트 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
