/**
 * Guardado local (en el navegador) del borrador del editor y de la lista de
 * tests publicados. No sale de este dispositivo: si la persona borra los datos
 * del navegador, se pierden (lo explicamos en la interfaz).
 */
import { z } from "zod";
import { QUIZ_COLORS, QUIZ_KINDS, type Quiz } from "./schema";

const DRAFT_KEY = "quizlab:draft";
const PUBLISHED_KEY = "quizlab:published";
const MAX_PUBLISHED = 30;

/**
 * Versión "permisiva" del esquema: un borrador puede tener textos vacíos o
 * incompletos, pero debe tener la forma correcta para que el editor no falle.
 */
const DraftSchema = z.object({
  v: z.literal(1),
  kind: z.enum(QUIZ_KINDS),
  title: z.string(),
  description: z.string(),
  emoji: z.string(),
  color: z.enum(QUIZ_COLORS),
  author: z.string().optional(),
  questions: z
    .array(
      z.object({
        text: z.string(),
        correct: z.number().int().nonnegative().optional(),
        answers: z.array(z.object({ text: z.string(), result: z.number().int().nonnegative().optional() })).min(1),
      }),
    )
    .min(1),
  results: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        emoji: z.string(),
        min: z.number().int().nonnegative().optional(),
      }),
    )
    .min(1),
});

const PublishedSchema = z.array(
  z.object({ ref: z.string(), title: z.string(), emoji: z.string(), publishedAt: z.string() }),
);

export type PublishedQuiz = z.infer<typeof PublishedSchema>[number];

export function readDraft(): Quiz | null {
  const result = DraftSchema.safeParse(readJson(DRAFT_KEY));
  return result.success ? result.data : null;
}

export function saveDraft(quiz: Quiz): void {
  writeJson(DRAFT_KEY, quiz);
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Sin acceso a localStorage: no hay nada que borrar.
  }
}

export function readPublished(): PublishedQuiz[] {
  const result = PublishedSchema.safeParse(readJson(PUBLISHED_KEY));
  return result.success ? result.data : [];
}

/** Añade un test publicado al principio de la lista (sin duplicados). */
export function addPublished(entry: PublishedQuiz): PublishedQuiz[] {
  const list = [entry, ...readPublished().filter((item) => item.ref !== entry.ref)].slice(0, MAX_PUBLISHED);
  writeJson(PUBLISHED_KEY, list);
  return list;
}

export function removePublished(ref: string): PublishedQuiz[] {
  const list = readPublished().filter((item) => item.ref !== ref);
  writeJson(PUBLISHED_KEY, list);
  return list;
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Modo privado o almacenamiento lleno: el editor sigue funcionando sin guardar.
  }
}
