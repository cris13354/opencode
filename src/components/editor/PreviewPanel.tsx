"use client";

import { useState } from "react";
import type { Quiz } from "@/lib/quiz/schema";
import { QuizPlayer } from "../quiz/QuizPlayer";
import { ResultCard } from "../quiz/ResultCard";
import { buttonClasses } from "../ui/button";

/** Vista previa dentro del editor: juega el test sin publicarlo ni medir analítica. */
export function PreviewPanel({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const [outcome, setOutcome] = useState<{ resultIndex: number; score?: number } | null>(null);
  const [round, setRound] = useState(0);
  return (
    <div className="space-y-5 rounded-2xl border-2 border-ink bg-cream p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-cream">Vista previa</p>
        <button type="button" onClick={onClose} className={buttonClasses("ghost", "sm", "text-sm")}>
          Cerrar
        </button>
      </div>
      {outcome ? (
        <div className="space-y-4">
          <ResultCard quiz={quiz} resultIndex={outcome.resultIndex} score={outcome.score} />
          <button
            type="button"
            onClick={() => {
              setOutcome(null);
              setRound(round + 1);
            }}
            className={buttonClasses("secondary", "md")}
          >
            Volver a probar
          </button>
        </div>
      ) : (
        <QuizPlayer key={round} quizRef="preview" quiz={quiz} onFinish={setOutcome} />
      )}
    </div>
  );
}
