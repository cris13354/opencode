import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CustomQuizNotice } from "@/components/quiz/CustomQuizNotice";
import { MoreQuizzes } from "@/components/quiz/MoreQuizzes";
import { ResultCard } from "@/components/quiz/ResultCard";
import { ResultHeadline } from "@/components/quiz/ResultHeadline";
import { ShareActions } from "@/components/quiz/ShareActions";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { cardImagePath, parseResultIndex, parseShareParams, quizPath, resolveQuiz } from "@/lib/quiz/resolve";
import { siteConfig } from "@/lib/site";

type Props = PageProps<"/t/[ref]/r/[result]">;

/**
 * Página de un resultado compartido. Es la pieza clave del crecimiento:
 * cuando alguien comparte este enlace, WhatsApp/X/Telegram muestran la imagen
 * de la tarjeta (metadatos Open Graph) y quien lo abre puede hacer el test.
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const loaded = await loadResult(params, searchParams);
  if (!loaded) return { title: "Resultado no encontrado" };
  const { resolved, resultIndex, share } = loaded;
  const result = resolved.quiz.results[resultIndex];
  const title = share.name
    ? `${share.name} es «${result.title}» ${result.emoji}`
    : `Resultado: ${result.title} ${result.emoji}`;
  const description = `${resolved.quiz.title} — haz el test y descubre el tuyo.`;
  const image = cardImagePath(resolved.ref, resultIndex, share);
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function ResultPage(props: Props) {
  return (
    <Container className="max-w-2xl space-y-8 py-10 sm:py-14">
      <Suspense fallback={<div aria-hidden className="h-96 animate-pulse rounded-3xl bg-ink/10" />}>
        <ResultContent params={props.params} searchParams={props.searchParams} />
      </Suspense>
      <MoreQuizzes />
    </Container>
  );
}

async function ResultContent({ params, searchParams }: Pick<Props, "params" | "searchParams">) {
  const loaded = await loadResult(params, searchParams);
  if (!loaded) notFound();
  const { resolved, resultIndex, share } = loaded;
  return (
    <>
      <ResultHeadline ownKey={`${resolved.ref}/${resultIndex}`} name={share.name} />
      <ResultCard quiz={resolved.quiz} resultIndex={resultIndex} score={share.score} name={share.name} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={quizPath(resolved.ref)} className={buttonClasses("primary", "lg", "flex-1")}>
          Hacer el test
        </Link>
        <Link href="/crear" className={buttonClasses("secondary", "lg", "flex-1")}>
          Crea tu propio test
        </Link>
      </div>
      <ShareActions
        quizRef={resolved.ref}
        quiz={resolved.quiz}
        resultIndex={resultIndex}
        score={share.score}
        initialName={share.name}
      />
      {resolved.custom && <CustomQuizNotice />}
      {siteConfig.feedbackUrl && (
        <p className="text-center text-sm text-ink-soft">
          ¿Ideas o algo no funciona?{" "}
          <a href={siteConfig.feedbackUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            Cuéntanoslo en 1 minuto
          </a>
        </p>
      )}
    </>
  );
}

async function loadResult(params: Props["params"], searchParams: Props["searchParams"]) {
  const route = await params;
  const resolved = await resolveQuiz(route.ref);
  if (!resolved) return null;
  const resultIndex = parseResultIndex(resolved.quiz, route.result);
  if (resultIndex === null) return null;
  const share = parseShareParams(resolved.quiz, await searchParams);
  return { resolved, resultIndex, share };
}
