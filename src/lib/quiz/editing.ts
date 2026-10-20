/**
 * Operaciones del editor sobre un test (borrador). Son funciones puras: reciben
 * un test y devuelven uno nuevo, sin modificar el original. Así son fáciles de
 * probar (ver editing.test.ts) y de usar con useState en React.
 */
import { LIMITS, type Question, type Quiz, type QuizKind } from "./schema";

/** Cambia entre personalidad y conocimientos, rellenando los campos que necesita cada tipo. */
export function setKind(quiz: Quiz, kind: QuizKind): Quiz {
  if (quiz.kind === kind) return quiz;
  if (kind === "trivia") {
    const step = quiz.questions.length / quiz.results.length;
    return {
      ...quiz,
      kind,
      results: quiz.results.map((result, i) => ({ ...result, min: Math.round(i * step) })),
      questions: quiz.questions.map((question) => ({
        ...question,
        correct: question.correct ?? 0,
        answers: question.answers.map((answer) => ({ text: answer.text })),
      })),
    };
  }
  return {
    ...quiz,
    kind,
    results: quiz.results.map((result) => ({ title: result.title, description: result.description, emoji: result.emoji })),
    questions: quiz.questions.map((question) => ({
      text: question.text,
      answers: question.answers.map((answer, ai) => ({ text: answer.text, result: ai % quiz.results.length })),
    })),
  };
}

export function addResult(quiz: Quiz): Quiz {
  if (quiz.results.length >= LIMITS.maxResults) return quiz;
  const mins = quiz.results.map((result) => result.min ?? 0);
  const nextMin = Math.min(Math.max(...mins) + 1, quiz.questions.length);
  return {
    ...quiz,
    results: [
      ...quiz.results,
      { title: "", description: "", emoji: "⭐", ...(quiz.kind === "trivia" ? { min: nextMin } : {}) },
    ],
  };
}

/**
 * Elimina un resultado. En personalidad, las respuestas que apuntaban a él se
 * quedan sin asignar y las que apuntaban a resultados posteriores se reajustan.
 */
export function removeResult(quiz: Quiz, index: number): Quiz {
  if (quiz.results.length <= LIMITS.minResults) return quiz;
  return {
    ...quiz,
    results: quiz.results.filter((_, i) => i !== index),
    questions: quiz.questions.map((question) => ({
      ...question,
      answers: question.answers.map((answer) => {
        if (answer.result === undefined || answer.result < index) return answer;
        if (answer.result === index) return { text: answer.text };
        return { ...answer, result: answer.result - 1 };
      }),
    })),
  };
}

export function addQuestion(quiz: Quiz): Quiz {
  if (quiz.questions.length >= LIMITS.maxQuestions) return quiz;
  const question: Question =
    quiz.kind === "trivia"
      ? { text: "", correct: 0, answers: [{ text: "" }, { text: "" }] }
      : {
          text: "",
          answers: [
            { text: "", result: 0 },
            { text: "", result: Math.min(1, quiz.results.length - 1) },
          ],
        };
  return { ...quiz, questions: [...quiz.questions, question] };
}

export function removeQuestion(quiz: Quiz, index: number): Quiz {
  if (quiz.questions.length <= LIMITS.minQuestions) return quiz;
  return { ...quiz, questions: quiz.questions.filter((_, i) => i !== index) };
}

/** Mueve una pregunta una posición arriba (-1) o abajo (+1). */
export function moveQuestion(quiz: Quiz, index: number, direction: -1 | 1): Quiz {
  const target = index + direction;
  if (target < 0 || target >= quiz.questions.length) return quiz;
  const questions = [...quiz.questions];
  [questions[index], questions[target]] = [questions[target], questions[index]];
  return { ...quiz, questions };
}

export function updateQuestion(quiz: Quiz, index: number, update: (question: Question) => Question): Quiz {
  return { ...quiz, questions: quiz.questions.map((question, i) => (i === index ? update(question) : question)) };
}

export function addAnswer(question: Question, kind: QuizKind, resultCount: number): Question {
  if (question.answers.length >= LIMITS.maxAnswers) return question;
  const answer =
    kind === "trivia" ? { text: "" } : { text: "", result: question.answers.length % Math.max(resultCount, 1) };
  return { ...question, answers: [...question.answers, answer] };
}

/** Elimina una respuesta y mantiene apuntando bien la respuesta correcta. */
export function removeAnswer(question: Question, index: number): Question {
  if (question.answers.length <= LIMITS.minAnswers) return question;
  const answers = question.answers.filter((_, i) => i !== index);
  if (question.correct === undefined) return { ...question, answers };
  const correct = question.correct === index ? 0 : question.correct > index ? question.correct - 1 : question.correct;
  return { ...question, answers, correct };
}
