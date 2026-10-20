"use client";

/**
 * Reproductor de un test: pantalla de inicio → preguntas → redirección al resultado.
 * Todo ocurre en el navegador; no se envía ninguna respuesta a ningún servidor.
 */
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { analyticsRef, track } from "@/lib/analytics";
import { resultPath } from "@/lib/quiz/resolve";
import type { Quiz } from "@/lib/quiz/schema";
import { computeOutcome } from "@/lib/quiz/scoring";
import { buttonClasses } from "../ui/button";
import { QuizBadge } from "./QuizBadge";

/** Clave de sessionStorage para saber que el resultado lo acaba de obtener esta persona. */
export const OWN_RESULT_KEY = "quizlab:own-result";

/** Tiempo que se muestra si la respuesta era correcta (tests de conocimientos). */
const FEEDBACK_MS = 900;
const LETTERS = ["A", "B", "C", "D"];

type Props = {
  quizRef: string;
  quiz: Quiz;
  /** Pantalla de inicio. Si se omite, el test empieza directamente. */
  intro?: React.ReactNode;
  /** Modo vista previa del editor: no navega ni registra analítica. */
  onFinish?: (outcome: { resultIndex: number; score?: number }) => void;
};

export function QuizPlayer({ quizRef, quiz, intro, onFinish }: Props) {
  const router = useRouter();
  const [started, setStarted] = useState(!intro);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const current = answers.length;
  const question = quiz.questions[current];
  const isTrivia = quiz.kind === "trivia";

  // Al cambiar de pregunta, movemos el foco al enunciado (lectores de pantalla y teclado).
  useEffect(() => {
    if (started && current > 0) headingRef.current?.focus();
  }, [current, started]);

  function start() {
    setStarted(true);
    if (!onFinish) track("quiz_start", { quiz: analyticsRef(quizRef) });
  }

  function choose(answerIndex: number) {
    if (selected !== null || finishing) return;
    setSelected(answerIndex);
    // En conocimientos dejamos ver si era correcta antes de avanzar.
    const delay = isTrivia ? FEEDBACK_MS : 250;
    window.setTimeout(() => advance([...answers, answerIndex]), delay);
  }

  function advance(nextAnswers: number[]) {
    setSelected(null);
    if (nextAnswers.length < quiz.questions.length) {
      setAnswers(nextAnswers);
      return;
    }
    setFinishing(true);
    const outcome = computeOutcome(quiz, nextAnswers);
    if (onFinish) {
      onFinish(outcome);
      setAnswers([]);
      setFinishing(false);
      return;
    }
    const path = resultPath(quizRef, outcome.resultIndex, { score: outcome.score });
    try {
      sessionStorage.setItem(OWN_RESULT_KEY, `${quizRef}/${outcome.resultIndex}`);
    } catch {
      // sessionStorage puede no estar disponible (modo privado). No es grave.
    }
    track("quiz_complete", { quiz: analyticsRef(quizRef), result: outcome.resultIndex });
    router.push(path);
  }

  function back() {
    if (selected !== null) return;
    setAnswers(answers.slice(0, -1));
  }

  if (!started) {
    return (
      <div className="animate-pop-in space-y-6">
        {intro}
        <button type="button" onClick={start} className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
          Empezar el test
          <span aria-hidden>→</span>
        </button>
      </div>
    );
  }

  if (finishing || !question) {
    return (
      <div role="status" className="grid place-items-center gap-4 py-16 text-center">
        <QuizBadge quiz={quiz} size="lg" />
        <p className="font-display text-2xl font-bold">Calculando tu resultado…</p>
      </div>
    );
  }

  const progress = Math.round((current / quiz.questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={back}
          disabled={current === 0 || selected !== null}
          className="rounded-lg px-2 py-1 text-sm font-medium text-ink-soft hover:bg-ink/5 disabled:invisible"
        >
          ← Atrás
        </button>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full border-2 border-ink bg-paper"
          role="progressbar"
          aria-label="Progreso del test"
          aria-valuemin={0}
          aria-valuemax={quiz.questions.length}
          aria-valuenow={current}
        >
          <div className="h-full bg-coral transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <span className="min-w-12 text-right text-sm font-semibold tabular-nums">
          {current + 1}/{quiz.questions.length}
        </span>
      </div>

      <div key={current} className="animate-pop-in space-y-5">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold leading-tight outline-none sm:text-3xl">
          {question.text}
        </h2>
        <ul className="grid gap-3">
          {question.answers.map((answer, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => choose(i)}
                disabled={selected !== null}
                aria-pressed={selected === i}
                className={answerClasses({
                  isSelected: selected === i,
                  reveal: isTrivia && selected !== null,
                  isCorrect: question.correct === i,
                })}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-cream text-sm font-bold">
                  {LETTERS[i]}
                </span>
                <span className="flex-1">{answer.text}</span>
                {isTrivia && selected !== null && question.correct === i && <span aria-label="Correcta">✓</span>}
                {isTrivia && selected === i && question.correct !== i && <span aria-label="Incorrecta">✗</span>}
              </button>
            </li>
          ))}
        </ul>
        {isTrivia && selected !== null && (
          <p role="status" className="font-semibold">
            {selected === question.correct ? "¡Correcto! 🎉" : "Casi… la respuesta correcta está marcada."}
          </p>
        )}
      </div>
    </div>
  );
}

function answerClasses({ isSelected, reveal, isCorrect }: { isSelected: boolean; reveal: boolean; isCorrect: boolean }) {
  const base =
    "flex w-full items-center gap-3 rounded-xl border-2 border-ink p-3 text-left text-base font-medium transition sm:p-4 sm:text-lg";
  if (reveal && isCorrect) return `${base} bg-quiz-green shadow-sticker-sm`;
  if (reveal && isSelected) return `${base} bg-quiz-coral shadow-sticker-sm`;
  if (isSelected) return `${base} bg-lime shadow-sticker-sm`;
  return `${base} bg-paper shadow-sticker-sm hover:-translate-y-0.5 hover:bg-lime/40 hover:shadow-sticker disabled:opacity-60`;
}
