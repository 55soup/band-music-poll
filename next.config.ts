import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 쿠키 기반 실시간 투표 앱이라 요청마다 동적 렌더. cacheComponents(캐시 우선 모델)는 끔. */
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
