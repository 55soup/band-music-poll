/**
 * 컨테이너 너비만큼 문자를 반복해 그리는 아스키 구분선.
 * 넘치는 부분은 CSS에서 clip 되므로 넉넉히 반복해 둔다.
 */
export function AsciiRule({ char = "+", className = "" }: { char?: string; className?: string }) {
  return (
    <div className={`ascii-rule ${className}`} aria-hidden>
      {char.repeat(400)}
    </div>
  );
}
