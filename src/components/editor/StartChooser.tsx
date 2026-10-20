"use client";

import { TEMPLATES, blankQuiz } from "@/lib/quiz/templates";
import type { Quiz } from "@/lib/quiz/schema";

/** Primera pantalla del editor: elegir una plantilla o empezar en blanco. */
export function StartChooser({ onStart }: { onStart: (quiz: Quiz, source: string) => void }) {
  return (
    <section aria-labelledby="start-title" className="space-y-5">
      <h2 id="start-title" className="font-display text-2xl font-extrabold tracking-tight">
        ¿Cómo quieres empezar?
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onStart(structuredClone(template.quiz), template.id)}
            className="flex flex-col items-start gap-3 rounded-2xl border-2 border-ink bg-paper p-5 text-left shadow-sticker-sm transition hover:-translate-y-1 hover:shadow-sticker"
          >
            <span aria-hidden className="text-3xl">{template.quiz.emoji}</span>
            <span className="font-display text-xl font-bold">{template.label}</span>
            <span className="text-sm text-ink-soft">{template.description}</span>
            <span className="mt-auto text-sm font-semibold text-coral-dark">Ejemplo: {template.quiz.title} →</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onStart(blankQuiz(), "blank")}
          className="flex flex-col items-start gap-3 rounded-2xl border-2 border-dashed border-ink/50 bg-transparent p-5 text-left transition hover:border-ink hover:bg-paper"
        >
          <span aria-hidden className="text-3xl">📝</span>
          <span className="font-display text-xl font-bold">En blanco</span>
          <span className="text-sm text-ink-soft">Empieza desde cero con un test de personalidad vacío.</span>
        </button>
      </div>
    </section>
  );
}
