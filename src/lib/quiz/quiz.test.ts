import { describe, expect, it } from "vitest";
import { CATALOG, findCatalogEntry } from "./catalog";
import { CUSTOM_PREFIX, MAX_ENCODED_LENGTH, decodeQuiz, encodeQuiz } from "./codec";
import { cleanName, parseResultIndex, parseShareParams, resolveQuiz, resultPath } from "./resolve";
import { LIMITS, QuizSchema, describeIssues, type Quiz } from "./schema";
import { computeOutcome } from "./scoring";

const emprendedor = findCatalogEntry("emprendedor")!.quiz;
const tecnologia = findCatalogEntry("tecnologia")!.quiz;

describe("catálogo", () => {
  it.each(CATALOG.map((entry) => [entry.slug, entry.quiz] as const))("%s es un test válido", (_, quiz) => {
    const result = QuizSchema.safeParse(quiz);
    expect(result.success ? [] : describeIssues(result.error)).toEqual([]);
  });

  it("los slugs son únicos", () => {
    const slugs = CATALOG.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("en los tests de personalidad todos los resultados son alcanzables", () => {
    for (const entry of CATALOG.filter((e) => e.quiz.kind === "personality")) {
      entry.quiz.results.forEach((_, ri) => {
        const answers = entry.quiz.questions.map((q) => q.answers.findIndex((a) => a.result === ri));
        expect(computeOutcome(entry.quiz, answers).resultIndex, `${entry.slug} → ${ri}`).toBe(ri);
      });
    }
  });
});

describe("puntuación", () => {
  it("personalidad: gana el resultado con más puntos", () => {
    // 5 respuestas a "Creador" (índice 2), 2 a "Visionario"
    expect(computeOutcome(emprendedor, [2, 2, 2, 2, 2, 0, 0]).resultIndex).toBe(2);
  });

  it("personalidad: los empates se resuelven por orden", () => {
    const quiz: Quiz = {
      ...emprendedor,
      questions: emprendedor.questions.slice(0, 2),
    };
    expect(computeOutcome(quiz, [3, 1]).resultIndex).toBe(1);
  });

  it("conocimientos: cuenta aciertos y elige el tramo correcto", () => {
    const allRight = tecnologia.questions.map((q) => q.correct!);
    expect(computeOutcome(tecnologia, allRight)).toEqual({ resultIndex: 3, score: 10 });

    const allWrong = tecnologia.questions.map((q) => (q.correct! + 1) % q.answers.length);
    expect(computeOutcome(tecnologia, allWrong)).toEqual({ resultIndex: 0, score: 0 });

    const seven = allRight.map((answer, i) => (i < 7 ? answer : (answer + 1) % 4));
    expect(computeOutcome(tecnologia, seven)).toEqual({ resultIndex: 2, score: 7 });
  });
});

describe("codificación en la URL", () => {
  it("ida y vuelta conserva el test", async () => {
    const encoded = await encodeQuiz(emprendedor);
    expect(encoded.startsWith(CUSTOM_PREFIX)).toBe(true);
    expect(encoded).toMatch(/^c1\.[A-Za-z0-9_-]+$/);
    expect(await decodeQuiz(encoded)).toEqual(emprendedor);
  });

  it("un test del tamaño máximo cabe en el enlace", async () => {
    const long = (n: number) => "Lorem ipsum dolor sit amet consectetur ".repeat(10).slice(0, n);
    const biggest: Quiz = {
      v: 1,
      kind: "personality",
      title: long(LIMITS.title),
      description: long(LIMITS.description),
      emoji: "🚀",
      color: "violet",
      author: long(LIMITS.author),
      results: Array.from({ length: LIMITS.maxResults }, (_, i) => ({
        title: `${i} ${long(LIMITS.resultTitle - 2)}`,
        description: long(LIMITS.resultDescription),
        emoji: "✨",
      })),
      questions: Array.from({ length: LIMITS.maxQuestions }, (_, qi) => ({
        text: `${qi} ${long(LIMITS.questionText - 3)}`,
        answers: Array.from({ length: LIMITS.maxAnswers }, (_, ai) => ({
          text: `${ai} ${long(LIMITS.answerText - 2)}`,
          result: ai,
        })),
      })),
    };
    // El esquema recorta espacios, así que comparamos con la versión normalizada.
    const normalized = QuizSchema.parse(biggest);
    const encoded = await encodeQuiz(normalized);
    expect(encoded.length).toBeLessThan(MAX_ENCODED_LENGTH);
    expect(await decodeQuiz(encoded)).toEqual(normalized);
  });

  it("rechaza datos rotos o manipulados sin lanzar errores", async () => {
    expect(await decodeQuiz("emprendedor")).toBeNull();
    expect(await decodeQuiz("c1.")).toBeNull();
    expect(await decodeQuiz("c1.!!!not-base64")).toBeNull();
    expect(await decodeQuiz("c1.AAAAAAAA")).toBeNull();
    expect(await decodeQuiz(`c1.${"A".repeat(MAX_ENCODED_LENGTH)}`)).toBeNull();
  });

  it("rechaza un JSON válido que no cumple el esquema", async () => {
    const invalid = { ...emprendedor, title: "" };
    const encoded = await encodeQuiz(invalid as Quiz);
    expect(await decodeQuiz(encoded)).toBeNull();
  });

  it("rechaza una bomba de compresión", async () => {
    const huge = { ...emprendedor, description: "a".repeat(200_000) };
    const encoded = await encodeQuiz(huge as Quiz);
    expect(encoded.length).toBeLessThan(MAX_ENCODED_LENGTH);
    expect(await decodeQuiz(encoded)).toBeNull();
  });
});

describe("validación", () => {
  it("explica los errores en español y con su ubicación", () => {
    const broken = {
      ...tecnologia,
      questions: [{ text: "¿?", answers: [{ text: "" }, { text: "B" }] }],
    };
    const result = QuizSchema.safeParse(broken);
    expect(result.success).toBe(false);
    const messages = result.success ? [] : describeIssues(result.error);
    expect(messages).toContain("Pregunta 1 › Respuesta 1 › Texto: no puede estar vacío");
    expect(messages).toContain("Pregunta 1 › Respuesta correcta: marca cuál es la respuesta correcta");
  });

  it("un test de personalidad exige asociar cada respuesta a un resultado", () => {
    const broken = {
      ...emprendedor,
      questions: [{ text: "Pregunta", answers: [{ text: "A", result: 0 }, { text: "B" }] }],
    };
    const result = QuizSchema.safeParse(broken);
    expect(result.success ? [] : describeIssues(result.error)).toEqual([
      "Pregunta 1 › Respuesta 2 › Resultado asociado: elige a qué resultado suma esta respuesta",
    ]);
  });

  it("no acepta texto en lugar de emoji", () => {
    expect(QuizSchema.safeParse({ ...emprendedor, emoji: "hola" }).success).toBe(false);
  });
});

describe("enlaces compartidos", () => {
  it("resuelve tests del catálogo y personalizados", async () => {
    expect((await resolveQuiz("emprendedor"))?.custom).toBe(false);
    const encoded = await encodeQuiz(tecnologia);
    expect((await resolveQuiz(encoded))?.custom).toBe(true);
    expect(await resolveQuiz("no-existe")).toBeNull();
    expect(await resolveQuiz("%E0%A4%A")).toBeNull();
  });

  it("limpia nombre y puntuación", () => {
    expect(parseShareParams(tecnologia, { s: "7", n: "  Ana\n\u0000 " })).toEqual({ score: 7, name: "Ana" });
    expect(parseShareParams(tecnologia, { s: "99" }).score).toBeUndefined();
    expect(parseShareParams(tecnologia, { s: "-1" }).score).toBeUndefined();
    expect(parseShareParams(emprendedor, { s: "3" }).score).toBeUndefined();
    expect(cleanName("x".repeat(100))).toHaveLength(24);
    expect(cleanName("   ")).toBeUndefined();
  });

  it("valida el índice de resultado", () => {
    expect(parseResultIndex(emprendedor, "3")).toBe(3);
    expect(parseResultIndex(emprendedor, "4")).toBeNull();
    expect(parseResultIndex(emprendedor, "abc")).toBeNull();
  });

  it("construye la URL del resultado", () => {
    expect(resultPath("tecnologia", 2, { score: 7, name: "Ana López" })).toBe("/t/tecnologia/r/2?s=7&n=Ana+L%C3%B3pez");
    expect(resultPath("emprendedor", 0)).toBe("/t/emprendedor/r/0");
  });
});
