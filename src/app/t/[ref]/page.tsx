import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomQuizNotice } from "@/components/quiz/CustomQuizNotice";
import { QuizBadge } from "@/components/quiz/QuizBadge";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import { Container } from "@/components/ui/Container";
import { catalogRefs, resolveQuiz } from "@/lib/quiz/resolve";

/** Los tests del catálogo se generan en el build; los personalizados, bajo demanda. */
export function generateStaticParams() {
  return catalogRefs().map((ref) => ({ ref }));
}

export async function generateMetadata({ params }: PageProps<"/t/[ref]">): Promise<Metadata> {
  const resolved = await resolveQuiz((await params).ref);
  if (!resolved) return { title: "Test no encontrado" };
  const title = `${resolved.quiz.emoji} ${resolved.quiz.title}`;
  return {
    title,
    description: resolved.quiz.description || "Haz el test y comparte tu resultado.",
    openGraph: { title, description: resolved.quiz.description || undefined },
    // Los tests de usuarios no se indexan en buscadores: no los hemos revisado.
    robots: resolved.custom ? { index: false } : undefined,
    alternates: resolved.custom ? undefined : { canonical: `/t/${resolved.ref}` },
  };
}

export default function QuizPage(props: PageProps<"/t/[ref]">) {
  return (
    <Container className="max-w-2xl py-10 sm:py-16">
      <Suspense fallback={<QuizSkeleton />}>
        <QuizLoader params={props.params} />
      </Suspense>
    </Container>
  );
}

async function QuizLoader({ params }: Pick<PageProps<"/t/[ref]">, "params">) {
  const resolved = await resolveQuiz((await params).ref);
  if (!resolved) notFound();
  const quiz = resolved.quiz;
  const intro = (
    <div className="space-y-5">
      <QuizBadge quiz={quiz} size="lg" />
      <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{quiz.title}</h1>
      {quiz.description && <p className="text-lg text-ink-soft">{quiz.description}</p>}
      <ul className="flex flex-wrap gap-2 text-sm font-medium">
        <li className="rounded-full border-2 border-ink bg-paper px-3 py-1">{quiz.questions.length} preguntas</li>
        <li className="rounded-full border-2 border-ink bg-paper px-3 py-1">
          {quiz.kind === "trivia" ? "Conocimientos" : "Personalidad"}
        </li>
        <li className="rounded-full border-2 border-ink bg-paper px-3 py-1">
          ~{Math.max(1, Math.round(quiz.questions.length * 0.15))} min
        </li>
        {quiz.author && <li className="rounded-full px-1 py-1 text-ink-soft">por {quiz.author}</li>}
      </ul>
      {resolved.custom && <CustomQuizNotice />}
    </div>
  );
  return <QuizPlayer quizRef={resolved.ref} quiz={quiz} intro={intro} />;
}

function QuizSkeleton() {
  return (
    <div aria-hidden className="animate-pulse space-y-5">
      <div className="size-20 rounded-2xl bg-ink/10" />
      <div className="h-12 w-4/5 rounded-xl bg-ink/10" />
      <div className="h-6 w-3/5 rounded-xl bg-ink/10" />
      <div className="h-13 w-48 rounded-xl bg-ink/10" />
    </div>
  );
}
