import { QUIZ_COLOR_STYLES } from "@/lib/quiz/colors";
import type { Quiz } from "@/lib/quiz/schema";

/** Emoji del test dentro de una "pegatina" del color del test. */
export function QuizBadge({ quiz, size = "md" }: { quiz: Pick<Quiz, "emoji" | "color">; size?: "md" | "lg" }) {
  const dimensions = size === "lg" ? "size-20 text-5xl rounded-2xl" : "size-12 text-2xl rounded-xl";
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center border-2 border-ink shadow-sticker-sm ${dimensions} ${QUIZ_COLOR_STYLES[quiz.color].bg}`}
    >
      {quiz.emoji}
    </span>
  );
}
