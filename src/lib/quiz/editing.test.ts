import { describe, expect, it } from "vitest";
import { addAnswer, addQuestion, addResult, moveQuestion, removeAnswer, removeResult, setKind } from "./editing";
import { QuizSchema } from "./schema";
import { TEMPLATES, blankQuiz } from "./templates";

const personality = TEMPLATES.find((t) => t.id === "personality")!.quiz;
const trivia = TEMPLATES.find((t) => t.id === "trivia")!.quiz;

describe("plantillas", () => {
  it.each(TEMPLATES.map((t) => [t.id, t.quiz] as const))("%s es válida", (_, quiz) => {
    expect(QuizSchema.safeParse(quiz).success).toBe(true);
  });

  it("el test en blanco no es publicable hasta rellenar los textos", () => {
    expect(QuizSchema.safeParse(blankQuiz()).success).toBe(false);
  });
});

describe("operaciones del editor", () => {
  it("cambiar de tipo produce tests válidos en ambos sentidos", () => {
    const toTrivia = setKind(personality, "trivia");
    expect(QuizSchema.safeParse(toTrivia).success).toBe(true);
    expect(toTrivia.results.map((r) => r.min)).toEqual([0, 1, 2]);

    const back = setKind(trivia, "personality");
    expect(QuizSchema.safeParse(back).success).toBe(true);
    expect(back.questions[0].correct).toBeUndefined();
  });

  it("al borrar un resultado se reajustan las respuestas", () => {
    const quiz = removeResult(personality, 1);
    expect(quiz.results.map((r) => r.title)).toEqual(["Aventurero", "Cultureta"]);
    // La respuesta que sumaba a "Relax total" queda sin asignar...
    expect(quiz.questions[0].answers[1].result).toBeUndefined();
    // ...y la que sumaba a "Cultureta" (índice 2) pasa a ser el índice 1.
    expect(quiz.questions[0].answers[2].result).toBe(1);
  });

  it("respeta los mínimos y máximos", () => {
    const minimal = removeResult(removeResult(personality, 0), 0);
    expect(minimal.results).toHaveLength(2);

    let many = trivia;
    for (let i = 0; i < 10; i++) many = addResult(many);
    expect(many.results).toHaveLength(6);

    let question = trivia.questions[0];
    for (let i = 0; i < 5; i++) question = addAnswer(question, "trivia", 3);
    expect(question.answers).toHaveLength(4);
  });

  it("al borrar una respuesta se conserva la correcta", () => {
    const question = { text: "¿?", correct: 2, answers: [{ text: "A" }, { text: "B" }, { text: "C" }] };
    expect(removeAnswer(question, 0).correct).toBe(1);
    expect(removeAnswer(question, 2).correct).toBe(0);
  });

  it("mueve preguntas sin salirse de la lista", () => {
    const moved = moveQuestion(personality, 0, 1);
    expect(moved.questions[1].text).toBe(personality.questions[0].text);
    expect(moveQuestion(personality, 0, -1)).toBe(personality);
  });

  it("las preguntas nuevas tienen la forma adecuada al tipo", () => {
    expect(addQuestion(trivia).questions.at(-1)?.correct).toBe(0);
    expect(addQuestion(personality).questions.at(-1)?.answers.map((a) => a.result)).toEqual([0, 1]);
  });
});
