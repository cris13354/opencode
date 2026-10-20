/**
 * Cálculo del resultado de un test a partir de las respuestas elegidas.
 * `answers[i]` es el índice de la respuesta elegida en la pregunta `i`.
 */
import type { Quiz } from "./schema";

export type Outcome = {
  /** Índice del resultado dentro de `quiz.results`. */
  resultIndex: number;
  /** Solo en tests de conocimientos: número de aciertos. */
  score?: number;
};

export function computeOutcome(quiz: Quiz, answers: number[]): Outcome {
  if (quiz.kind === "trivia") {
    const score = countCorrect(quiz, answers);
    return { resultIndex: resultForScore(quiz, score), score };
  }
  return { resultIndex: dominantResult(quiz, answers) };
}

export function countCorrect(quiz: Quiz, answers: number[]): number {
  return quiz.questions.filter((question, i) => question.correct === answers[i]).length;
}

/** Elige el resultado con el mayor "mínimo de aciertos" que no supere la puntuación. */
export function resultForScore(quiz: Quiz, score: number): number {
  const ranked = quiz.results
    .map((result, index) => ({ index, min: result.min ?? 0 }))
    .sort((a, b) => b.min - a.min);
  return (ranked.find((entry) => score >= entry.min) ?? ranked[ranked.length - 1]).index;
}

/**
 * Suma un punto al resultado asociado a cada respuesta y devuelve el que más
 * puntos tenga. En caso de empate gana el que aparece antes en la lista,
 * así el resultado es siempre el mismo para las mismas respuestas.
 */
export function dominantResult(quiz: Quiz, answers: number[]): number {
  const points = quiz.results.map(() => 0);
  quiz.questions.forEach((question, i) => {
    const target = question.answers[answers[i]]?.result;
    if (target !== undefined && target < points.length) points[target]++;
  });
  return points.indexOf(Math.max(...points));
}
