"use client";

import { useSyncExternalStore } from "react";
import { readDraft, readPublished } from "@/lib/quiz/drafts";
import { QuizEditor } from "./QuizEditor";

/**
 * El editor lee el borrador de localStorage, que solo existe en el navegador.
 * Hasta que el componente se hidrata en el cliente mostramos un esqueleto.
 */
export function EditorLoader() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!isClient) {
    return <div aria-hidden className="h-96 animate-pulse rounded-3xl bg-ink/10" />;
  }
  return <QuizEditor initialDraft={readDraft()} initialPublished={readPublished()} />;
}
