/**
 * 득표수를 `████████░░░░` 형태의 아스키 막대로 변환.
 * value/max 비율만큼 `█`를 채우고 나머지는 `░`로 채운다.
 */
export function asciiBar(value: number, max: number, width = 16): string {
  if (max <= 0 || value <= 0) return "░".repeat(width);
  const filled = Math.max(1, Math.min(width, Math.round((value / max) * width)));
  return "█".repeat(filled) + "░".repeat(width - filled);
}
