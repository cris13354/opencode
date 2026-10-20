import { QUIZ_COLOR_STYLES } from "@/lib/quiz/colors";
import type { Quiz } from "@/lib/quiz/schema";

type Props = {
  quiz: Quiz;
  resultIndex: number;
  score?: number;
  name?: string;
};

/**
 * Tarjeta de resultado en la web. Su diseño imita la imagen PNG que se genera
 * en /api/card para que lo que la gente ve y lo que comparte coincida.
 */
export function ResultCard({ quiz, resultIndex, score, name }: Props) {
  const result = quiz.results[resultIndex];
  return (
    <article
      className={`animate-pop-in relative overflow-hidden rounded-3xl border-2 border-ink p-6 shadow-sticker sm:p-10 ${QUIZ_COLOR_STYLES[quiz.color].bg}`}
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-ink/70">
        {quiz.emoji} {quiz.title}
      </p>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
        <span
          aria-hidden
          className="grid size-24 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-paper text-6xl shadow-sticker-sm"
        >
          {result.emoji}
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-ink/80">{name ? `${name} es…` : "Resultado"}</p>
          <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight break-words sm:text-5xl">
            {result.title}
          </h2>
          {score !== undefined && (
            <p className="mt-2 inline-block rounded-full border-2 border-ink bg-lime px-3 py-0.5 font-bold tabular-nums">
              {score}/{quiz.questions.length} aciertos
            </p>
          )}
        </div>
      </div>
      <p className="mt-6 text-lg leading-relaxed">{result.description}</p>
      <p className="mt-8 text-right font-display text-sm font-bold opacity-70">quizlab</p>
    </article>
  );
}
