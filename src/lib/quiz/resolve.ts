/**
 * Punto único para obtener un test a partir de su "referencia" en la URL.
 *  - "emprendedor"   → test del catálogo
 *  - "c1.XXXXXXXX"   → test creado por un usuario, codificado en el enlace
 *
 * Y utilidades para construir las URLs de la app de forma consistente.
 */
import { CATALOG, findCatalogEntry } from "./catalog";
import { decodeQuiz, isCustomRef } from "./codec";
import type { Quiz } from "./schema";

export type ResolvedQuiz = {
  ref: string;
  quiz: Quiz;
  /** true si lo ha creado un usuario (no es del catálogo oficial). */
  custom: boolean;
};

export async function resolveQuiz(ref: string): Promise<ResolvedQuiz | null> {
  const decodedRef = safeDecodeURIComponent(ref);
  if (decodedRef === null) return null;
  if (isCustomRef(decodedRef)) {
    const quiz = await decodeQuiz(decodedRef);
    return quiz ? { ref: decodedRef, quiz, custom: true } : null;
  }
  const entry = findCatalogEntry(decodedRef);
  return entry ? { ref: entry.slug, quiz: entry.quiz, custom: false } : null;
}

export function catalogRefs(): string[] {
  return CATALOG.map((entry) => entry.slug);
}

/** Datos opcionales que viajan en el enlace de un resultado compartido. */
export type ShareParams = {
  score?: number;
  name?: string;
};

export const MAX_NAME_LENGTH = 24;

export function quizPath(ref: string): string {
  return `/t/${ref}`;
}

export function resultPath(ref: string, resultIndex: number, params: ShareParams = {}): string {
  const query = shareQuery(params);
  return `/t/${ref}/r/${resultIndex}${query ? `?${query}` : ""}`;
}

/** URL de la imagen PNG de la tarjeta de resultado (para redes y descargas). */
export function cardImagePath(
  ref: string,
  resultIndex: number,
  params: ShareParams & { format?: "og" | "story"; download?: boolean } = {},
): string {
  const search = new URLSearchParams({ ref, r: String(resultIndex) });
  if (params.score !== undefined) search.set("s", String(params.score));
  if (params.name) search.set("n", params.name);
  if (params.format === "story") search.set("f", "story");
  if (params.download) search.set("dl", "1");
  return `/api/card?${search.toString()}`;
}

function shareQuery(params: ShareParams): string {
  const search = new URLSearchParams();
  if (params.score !== undefined) search.set("s", String(params.score));
  if (params.name) search.set("n", params.name);
  return search.toString();
}

/**
 * Lee y limpia los parámetros de un enlace compartido. Todo lo que viene de la
 * URL es texto libre que puede manipular cualquiera, así que se valida aquí.
 */
export function parseShareParams(
  quiz: Quiz,
  raw: { s?: string | string[] | null; n?: string | string[] | null },
): ShareParams {
  const scoreText = first(raw.s);
  const score = scoreText !== undefined && /^\d{1,2}$/.test(scoreText) ? Number(scoreText) : undefined;
  const validScore =
    quiz.kind === "trivia" && score !== undefined && score <= quiz.questions.length ? score : undefined;
  return { score: validScore, name: cleanName(first(raw.n)) };
}

/** Limita el nombre a texto corto, sin caracteres de control ni saltos de línea. */
export function cleanName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const cleaned = name
    .replace(/[\p{C}]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim();
  return cleaned || undefined;
}

/** Devuelve el índice de resultado si es válido para este test, o null. */
export function parseResultIndex(quiz: Quiz, raw: string): number | null {
  if (!/^\d{1,2}$/.test(raw)) return null;
  const index = Number(raw);
  return index < quiz.results.length ? index : null;
}

function first(value: string | string[] | null | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
