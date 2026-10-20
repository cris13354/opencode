import Link from "next/link";
import type { CatalogEntry } from "@/lib/quiz/catalog";
import { quizPath } from "@/lib/quiz/resolve";
import { QuizBadge } from "./QuizBadge";

/** Tarjeta clicable de un test del catálogo (landing y "más tests"). */
export function QuizCard({ entry }: { entry: CatalogEntry }) {
  const quiz = entry.quiz;
  return (
    <Link
      href={quizPath(entry.slug)}
      className="group flex h-full flex-col gap-4 rounded-2xl border-2 border-ink bg-paper p-5 shadow-sticker-sm transition hover:-translate-y-1 hover:shadow-sticker"
    >
      <div className="flex items-start justify-between gap-3">
        <QuizBadge quiz={quiz} />
        <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink-soft">{entry.useCase}</span>
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display text-xl font-bold leading-snug">{quiz.title}</h3>
        <p className="text-sm text-ink-soft">{quiz.description}</p>
      </div>
      <span className="mt-auto text-sm font-bold text-coral-dark">
        {quiz.questions.length} preguntas · Jugar <span aria-hidden className="inline-block transition group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
