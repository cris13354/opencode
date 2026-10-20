/**
 * Modelo de datos de un test (quiz).
 *
 * Un test se describe con un objeto JSON pequeño. Ese mismo objeto se usa para:
 *  - los tests de ejemplo del catálogo (src/lib/quiz/catalog.ts),
 *  - los tests que crea la gente en el editor (/crear),
 *  - el enlace que se comparte (el test va comprimido dentro de la URL).
 *
 * Como los tests creados por usuarios llegan desde la URL (datos no fiables),
 * SIEMPRE se validan con `QuizSchema` antes de usarlos. Los límites de longitud
 * evitan enlaces gigantes y textos abusivos en las imágenes generadas.
 */
import { z } from "zod";

/** Paleta limitada de colores para la tarjeta de cada test. */
export const QUIZ_COLORS = ["coral", "violet", "blue", "green", "yellow"] as const;
export type QuizColor = (typeof QUIZ_COLORS)[number];

/** Tipos de test: personalidad ("¿qué tipo de X eres?") o conocimientos (aciertos). */
export const QUIZ_KINDS = ["personality", "trivia"] as const;
export type QuizKind = (typeof QUIZ_KINDS)[number];

export const LIMITS = {
  title: 80,
  description: 200,
  author: 40,
  emoji: 16,
  questionText: 140,
  answerText: 80,
  resultTitle: 60,
  resultDescription: 280,
  minQuestions: 1,
  maxQuestions: 15,
  minAnswers: 2,
  maxAnswers: 4,
  minResults: 2,
  maxResults: 6,
} as const;

/** Texto obligatorio: se recortan espacios y se limita la longitud. */
const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, { message: "no puede estar vacío" })
    .max(max, { message: `máximo ${max} caracteres` });

const optionalText = (max: number) =>
  z.string().trim().max(max, { message: `máximo ${max} caracteres` });

/**
 * Un emoji (o un símbolo corto). No intentamos validar que sea "un emoji
 * perfecto" porque las secuencias Unicode son complejas; solo limitamos el
 * tamaño y prohibimos letras/números para que no se use como texto libre.
 */
const emoji = z
  .string()
  .trim()
  .min(1, { message: "elige un emoji" })
  .max(LIMITS.emoji, { message: "usa un solo emoji" })
  .refine((value) => !/[\p{L}\p{N}]/u.test(value), { message: "usa un emoji, no texto" });

const AnswerSchema = z.object({
  text: requiredText(LIMITS.answerText),
  /** Solo tests de personalidad: índice del resultado al que suma un punto. */
  result: z.number().int().min(0).max(LIMITS.maxResults - 1).optional(),
});

const QuestionSchema = z.object({
  text: requiredText(LIMITS.questionText),
  answers: z
    .array(AnswerSchema)
    .min(LIMITS.minAnswers, { message: `necesita al menos ${LIMITS.minAnswers} respuestas` })
    .max(LIMITS.maxAnswers, { message: `máximo ${LIMITS.maxAnswers} respuestas` }),
  /** Solo tests de conocimientos: índice de la respuesta correcta. */
  correct: z.number().int().min(0).max(LIMITS.maxAnswers - 1).optional(),
});

const ResultSchema = z.object({
  title: requiredText(LIMITS.resultTitle),
  description: requiredText(LIMITS.resultDescription),
  emoji,
  /** Solo tests de conocimientos: número mínimo de aciertos para este resultado. */
  min: z.number().int().min(0).max(LIMITS.maxQuestions).optional(),
});

export const QuizSchema = z
  .object({
    /** Versión del formato, para poder cambiarlo en el futuro sin romper enlaces. */
    v: z.literal(1),
    kind: z.enum(QUIZ_KINDS),
    title: requiredText(LIMITS.title),
    description: optionalText(LIMITS.description),
    emoji,
    color: z.enum(QUIZ_COLORS),
    author: optionalText(LIMITS.author).optional(),
    questions: z
      .array(QuestionSchema)
      .min(LIMITS.minQuestions, { message: "añade al menos una pregunta" })
      .max(LIMITS.maxQuestions, { message: `máximo ${LIMITS.maxQuestions} preguntas` }),
    results: z
      .array(ResultSchema)
      .min(LIMITS.minResults, { message: `añade al menos ${LIMITS.minResults} resultados` })
      .max(LIMITS.maxResults, { message: `máximo ${LIMITS.maxResults} resultados` }),
  })
  .superRefine((quiz, ctx) => {
    // Reglas que dependen de varios campos a la vez (según el tipo de test).
    quiz.questions.forEach((question, qi) => {
      if (quiz.kind === "trivia") {
        if (question.correct === undefined || question.correct >= question.answers.length) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", qi, "correct"],
            message: "marca cuál es la respuesta correcta",
          });
        }
        return;
      }
      question.answers.forEach((answer, ai) => {
        if (answer.result === undefined || answer.result >= quiz.results.length) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", qi, "answers", ai, "result"],
            message: "elige a qué resultado suma esta respuesta",
          });
        }
      });
    });

    if (quiz.kind === "trivia") {
      const mins = quiz.results.map((result) => result.min ?? 0);
      if (!mins.includes(0)) {
        ctx.addIssue({
          code: "custom",
          path: ["results"],
          message: "un resultado debe empezar desde 0 aciertos",
        });
      }
      if (new Set(mins).size !== mins.length) {
        ctx.addIssue({
          code: "custom",
          path: ["results"],
          message: "cada resultado necesita un número de aciertos distinto",
        });
      }
      mins.forEach((min, ri) => {
        if (min > quiz.questions.length) {
          ctx.addIssue({
            code: "custom",
            path: ["results", ri, "min"],
            message: `no puede superar el número de preguntas (${quiz.questions.length})`,
          });
        }
      });
    }
  });

export type Quiz = z.infer<typeof QuizSchema>;
export type Question = Quiz["questions"][number];
export type Answer = Question["answers"][number];
export type QuizResult = Quiz["results"][number];

/**
 * Convierte los errores de zod en frases comprensibles en español, indicando
 * dónde está el problema (p. ej. "Pregunta 2 › Respuesta 3: no puede estar vacío").
 */
export function describeIssues(error: z.ZodError): string[] {
  const messages = error.issues.map((issue) => `${describePath(issue.path)}: ${issue.message}`);
  return [...new Set(messages)];
}

/** Nombres de campo tal y como aparecen en el editor, según dónde estén. */
const FIELD_LABELS: Record<"quiz" | "question" | "answer" | "result", Record<string, string>> = {
  quiz: { title: "Título", description: "Descripción", emoji: "Emoji", author: "Tu nombre o marca", color: "Color", kind: "Tipo de test" },
  question: { text: "Enunciado", correct: "Respuesta correcta" },
  answer: { text: "Texto", result: "Resultado asociado" },
  result: { title: "Nombre", description: "Descripción", emoji: "Emoji", min: "Aciertos mínimos" },
};

function describePath(path: PropertyKey[]): string {
  const parts: string[] = [];
  let scope: keyof typeof FIELD_LABELS = "quiz";
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    const next = path[i + 1];
    const indexed = typeof next === "number";
    if (key === "questions") {
      parts.push(indexed ? `Pregunta ${next + 1}` : "Preguntas");
      scope = "question";
    } else if (key === "answers") {
      parts.push(indexed ? `Respuesta ${next + 1}` : "Respuestas");
      scope = "answer";
    } else if (key === "results") {
      parts.push(indexed ? `Resultado ${next + 1}` : "Resultados");
      scope = "result";
    } else {
      parts.push(FIELD_LABELS[scope][String(key)] ?? String(key));
      continue;
    }
    if (indexed) i++;
  }
  return parts.length > 0 ? parts.join(" › ") : "Test";
}
