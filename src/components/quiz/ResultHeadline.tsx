"use client";

import { useSyncExternalStore } from "react";
import { OWN_RESULT_KEY } from "./QuizPlayer";

/**
 * Título encima del resultado. Si esta persona acaba de hacer el test (lo
 * sabemos por sessionStorage) dice "Tu resultado"; si llega desde un enlace
 * compartido, invita a hacer el test.
 */
export function ResultHeadline({ ownKey, name }: { ownKey: string; name?: string }) {
  const isOwn = useSyncExternalStore(subscribe, () => readOwn() === ownKey, () => false);
  if (isOwn) {
    return <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">¡Tu resultado! 🎉</h1>;
  }
  return (
    <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
      {name ? `Este es el resultado de ${name}` : "Alguien ha compartido su resultado"}. ¿Y el tuyo?
    </h1>
  );
}

function subscribe() {
  return () => {};
}

function readOwn(): string | null {
  try {
    return sessionStorage.getItem(OWN_RESULT_KEY);
  } catch {
    return null;
  }
}
