import { CATALOG } from "@/lib/quiz/catalog";
import { QuizCard } from "./QuizCard";

export function MoreQuizzes() {
  return (
    <section aria-labelledby="more-quizzes" className="space-y-4 pt-6">
      <h2 id="more-quizzes" className="font-display text-2xl font-bold">
        Más tests para jugar
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {CATALOG.map((entry) => (
          <QuizCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </section>
  );
}
