"use client";

import Link from "next/link";
import { useState } from "react";
import { decodeQuiz } from "@/lib/quiz/codec";
import { removePublished, type PublishedQuiz } from "@/lib/quiz/drafts";
import { quizPath } from "@/lib/quiz/resolve";
import type { Quiz } from "@/lib/quiz/schema";

type Props = {
  list: PublishedQuiz[];
  onChange: (list: PublishedQuiz[]) => void;
  onEdit: (quiz: Quiz) => void;
  currentRef?: string | null;
};

/** Tests publicados desde este navegador (guardados en localStorage). */
export function PublishedList({ list, onChange, onEdit, currentRef }: Props) {
  const [error, setError] = useState(false);
  if (list.length === 0) return null;

  async function edit(ref: string) {
    const quiz = await decodeQuiz(ref);
    if (!quiz) {
      setError(true);
      return;
    }
    if (!window.confirm("Se cargará este test en el editor y sustituirá tu borrador actual. ¿Continuar?")) return;
    onEdit(quiz);
  }

  return (
    <section aria-labelledby="published-title" className="space-y-4">
      <div>
        <h2 id="published-title" className="font-display text-2xl font-extrabold tracking-tight">
          Tus tests publicados
        </h2>
        <p className="text-sm text-ink-soft">
          Guardados solo en este navegador. Si borras los datos del navegador, guarda antes los enlaces.
        </p>
      </div>
      <ul className="divide-y-2 divide-ink/10 rounded-2xl border-2 border-ink bg-paper">
        {list.map((item) => (
          <li key={item.ref} className="flex flex-wrap items-center gap-3 p-4">
            <span aria-hidden className="text-2xl">{item.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {item.title}
                {item.ref === currentRef && (
                  <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-xs font-bold">Nuevo</span>
                )}
              </p>
              <p className="text-xs text-ink-soft">
                Publicado el {new Date(item.publishedAt).toLocaleDateString("es-ES", { dateStyle: "medium" })}
              </p>
            </div>
            <div className="flex gap-3 text-sm font-semibold">
              <Link href={quizPath(item.ref)} target="_blank" className="underline">Abrir</Link>
              <button type="button" onClick={() => edit(item.ref)} className="underline">Editar</button>
              <button
                type="button"
                onClick={() => onChange(removePublished(item.ref))}
                className="text-ink-soft underline"
              >
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className="text-sm text-danger">
          No se pudo abrir ese test: el enlace guardado está dañado.
        </p>
      )}
    </section>
  );
}
