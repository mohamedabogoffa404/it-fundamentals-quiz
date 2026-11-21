import { tokenizeMathSegments } from '../utils/quizEngine';

interface MathTextProps {
  text: string;
  className?: string;
  monoClassName?: string;
}

export function MathText({
  text,
  className = '',
  monoClassName = 'font-mono font-semibold text-[#0F4C81] bg-[#0F4C81]/[0.06] px-1.5 py-0.5 rounded-md mx-0.5 text-[0.94em] tabular-nums',
}: MathTextProps) {
  const segments = tokenizeMathSegments(text);

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.isMath ? (
          <span
            key={index}
            dir="ltr"
            className={`inline-block align-baseline [direction:ltr] [unicode-bidi:isolate] ${monoClassName}`}
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
