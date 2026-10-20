"use client";

/**
 * Editor de tests. Flujo:
 *   1. Elegir plantilla (o empezar en blanco).
 *   2. Editar datos básicos, resultados y preguntas (se guarda solo en el navegador).
 *   3. Probar el test en la vista previa.
 *   4. Publicar: se valida, se codifica en un enlace y se muestra para compartir.
 */
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { encodeQuiz } from "@/lib/quiz/codec";
import { QUIZ_COLOR_STYLES } from "@/lib/quiz/colors";
import { addPublished, clearDraft, saveDraft, type PublishedQuiz } from "@/lib/quiz/drafts";
import {
  addAnswer,
  addQuestion,
  addResult,
  moveQuestion,
  removeAnswer,
  removeQuestion,
  removeResult,
  setKind,
  updateQuestion,
} from "@/lib/quiz/editing";
import { quizPath } from "@/lib/quiz/resolve";
import { LIMITS, QUIZ_COLORS, QuizSchema, describeIssues, type Quiz, type QuizResult } from "@/lib/quiz/schema";
import { buttonClasses } from "../ui/button";
import { EmojiField, IconButton, TextField } from "./fields";
import { PreviewPanel } from "./PreviewPanel";
import { PublishedList } from "./PublishedList";
import { PublishedPanel } from "./PublishedPanel";
import { StartChooser } from "./StartChooser";

type Props = {
  initialDraft: Quiz | null;
  initialPublished: PublishedQuiz[];
};

export function QuizEditor({ initialDraft, initialPublished }: Props) {
  const [quiz, setQuiz] = useState<Quiz | null>(initialDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [publishedRef, setPublishedRef] = useState<string | null>(null);
  const [publishedList, setPublishedList] = useState(initialPublished);
  const [previewing, setPreviewing] = useState(false);
  const errorsRef = useRef<HTMLDivElement>(null);

  /** Todo cambio pasa por aquí: guarda el borrador y oculta el enlace antiguo. */
  function update(next: Quiz) {
    setQuiz(next);
    saveDraft(next);
    setPublishedRef(null);
    setPreviewing(false);
    if (errors.length > 0) setErrors([]);
  }

  function start(next: Quiz, source: string) {
    update(next);
    track("editor_start", { source });
    window.scrollTo({ top: 0 });
  }

  function validate(current: Quiz): Quiz | null {
    const parsed = QuizSchema.safeParse(current);
    if (parsed.success) return parsed.data;
    setErrors(describeIssues(parsed.error));
    // Llevamos el foco a la lista de errores para que se lea y se vea.
    window.setTimeout(() => errorsRef.current?.focus(), 0);
    return null;
  }

  async function publish(current: Quiz) {
    const valid = validate(current);
    if (!valid) return;
    const ref = await encodeQuiz(valid);
    setPublishedRef(ref);
    setPublishedList(addPublished({ ref, title: valid.title, emoji: valid.emoji, publishedAt: new Date().toISOString() }));
    track("quiz_publish", { kind: valid.kind, questions: valid.questions.length, results: valid.results.length });
  }

  function reset() {
    if (!window.confirm("¿Seguro que quieres empezar de nuevo? Se borrará el borrador actual.")) return;
    clearDraft();
    setQuiz(null);
    setErrors([]);
    setPublishedRef(null);
  }

  if (!quiz) {
    return (
      <div className="space-y-12">
        <StartChooser onStart={start} />
        <PublishedList list={publishedList} onChange={setPublishedList} onEdit={(loaded) => start(loaded, "published")} />
      </div>
    );
  }

  const isTrivia = quiz.kind === "trivia";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">Los cambios se guardan automáticamente en este navegador.</p>
        <button type="button" onClick={reset} className={buttonClasses("ghost", "sm", "text-sm")}>
          Empezar de nuevo
        </button>
      </div>

      <Section title="1. Lo básico">
        <fieldset className="min-w-0 space-y-2">
          <legend className="text-sm font-semibold">Tipo de test</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["personality", "Personalidad", "«¿Qué tipo de… eres?»"],
                ["trivia", "Conocimientos", "Respuestas correctas y puntuación"],
              ] as const
            ).map(([kind, label, help]) => (
              <label
                key={kind}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition ${quiz.kind === kind ? "border-ink bg-lime/50 shadow-sticker-sm" : "border-ink/30 bg-paper hover:border-ink"}`}
              >
                <input
                  type="radio"
                  name="kind"
                  checked={quiz.kind === kind}
                  onChange={() => update(setKind(quiz, kind))}
                  className="mt-1 accent-ink"
                />
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-sm text-ink-soft">{help}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <TextField
          label="Título"
          required
          value={quiz.title}
          maxLength={LIMITS.title}
          placeholder="¿Qué tipo de… eres?"
          onChange={(title) => update({ ...quiz, title })}
        />
        <TextField
          label="Descripción"
          multiline
          value={quiz.description}
          maxLength={LIMITS.description}
          placeholder="Una frase que invite a hacerlo."
          onChange={(description) => update({ ...quiz, description })}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <EmojiField label="Emoji del test" value={quiz.emoji} onChange={(emoji) => update({ ...quiz, emoji })} />
          <fieldset className="min-w-0 space-y-1.5">
            <legend className="text-sm font-semibold">Color</legend>
            <div className="flex flex-wrap gap-2">
              {QUIZ_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => update({ ...quiz, color })}
                  aria-label={QUIZ_COLOR_STYLES[color].label}
                  aria-pressed={quiz.color === color}
                  className={`size-11 rounded-xl border-2 border-ink transition ${QUIZ_COLOR_STYLES[color].bg} ${quiz.color === color ? "scale-110 shadow-sticker-sm ring-2 ring-ink ring-offset-2 ring-offset-cream" : "hover:scale-105"}`}
                />
              ))}
            </div>
          </fieldset>
        </div>
        <TextField
          label="Tu nombre o marca"
          value={quiz.author ?? ""}
          maxLength={LIMITS.author}
          placeholder="@tucuenta"
          hint="Aparece como «por …» al inicio del test."
          onChange={(author) => update({ ...quiz, author })}
        />
      </Section>

      <Section
        title={`2. Resultados (${quiz.results.length}/${LIMITS.maxResults})`}
        description={
          isTrivia
            ? "Cada resultado se muestra a partir de un número de aciertos. Uno debe empezar en 0."
            : "Los perfiles que puede obtener la gente. Cada respuesta sumará puntos a uno de ellos."
        }
      >
        {quiz.results.map((result, ri) => (
          <ResultEditor
            key={ri}
            index={ri}
            result={result}
            isTrivia={isTrivia}
            maxMin={quiz.questions.length}
            canRemove={quiz.results.length > LIMITS.minResults}
            onChange={(next) => update({ ...quiz, results: quiz.results.map((r, i) => (i === ri ? next : r)) })}
            onRemove={() => update(removeResult(quiz, ri))}
          />
        ))}
        {quiz.results.length < LIMITS.maxResults && (
          <button type="button" onClick={() => update(addResult(quiz))} className={buttonClasses("secondary", "md", "w-full")}>
            + Añadir resultado
          </button>
        )}
      </Section>

      <Section
        title={`3. Preguntas (${quiz.questions.length}/${LIMITS.maxQuestions})`}
        description={
          isTrivia
            ? "Marca la respuesta correcta de cada pregunta."
            : "Para cada respuesta, elige a qué resultado suma un punto."
        }
      >
        {quiz.questions.map((question, qi) => (
          <div key={qi} className="space-y-4 rounded-2xl border-2 border-ink bg-paper p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold">Pregunta {qi + 1}</h3>
              <div className="flex">
                <IconButton label="Subir pregunta" disabled={qi === 0} onClick={() => update(moveQuestion(quiz, qi, -1))}>
                  ↑
                </IconButton>
                <IconButton
                  label="Bajar pregunta"
                  disabled={qi === quiz.questions.length - 1}
                  onClick={() => update(moveQuestion(quiz, qi, 1))}
                >
                  ↓
                </IconButton>
                <IconButton
                  label="Eliminar pregunta"
                  disabled={quiz.questions.length <= LIMITS.minQuestions}
                  onClick={() => update(removeQuestion(quiz, qi))}
                >
                  ✕
                </IconButton>
              </div>
            </div>
            <TextField
              label="Enunciado"
              required
              value={question.text}
              maxLength={LIMITS.questionText}
              placeholder="Escribe la pregunta"
              onChange={(text) => update(updateQuestion(quiz, qi, (q) => ({ ...q, text })))}
            />
            <fieldset className="min-w-0 space-y-2">
              <legend className="mb-1 text-sm font-semibold">Respuestas</legend>
              {question.answers.map((answer, ai) => (
                <div key={ai} className="flex flex-col gap-2 rounded-xl bg-cream p-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-2">
                    {isTrivia && (
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={question.correct === ai}
                        onChange={() => update(updateQuestion(quiz, qi, (q) => ({ ...q, correct: ai })))}
                        aria-label={`Respuesta ${ai + 1} es la correcta`}
                        className="size-5 shrink-0 accent-success"
                      />
                    )}
                    <input
                      value={answer.text}
                      maxLength={LIMITS.answerText}
                      placeholder={`Respuesta ${ai + 1}`}
                      aria-label={`Pregunta ${qi + 1}, respuesta ${ai + 1}`}
                      onChange={(event) =>
                        update(
                          updateQuestion(quiz, qi, (q) => ({
                            ...q,
                            answers: q.answers.map((a, i) => (i === ai ? { ...a, text: event.target.value } : a)),
                          })),
                        )
                      }
                      className="min-w-0 flex-1 rounded-lg border-2 border-ink/60 bg-paper px-3 py-2 outline-none focus:border-ink"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {!isTrivia && (
                      <select
                        value={answer.result ?? ""}
                        aria-label={`Resultado al que suma la respuesta ${ai + 1}`}
                        onChange={(event) =>
                          update(
                            updateQuestion(quiz, qi, (q) => ({
                              ...q,
                              answers: q.answers.map((a, i) =>
                                i === ai ? { text: a.text, ...(event.target.value === "" ? {} : { result: Number(event.target.value) }) } : a,
                              ),
                            })),
                          )
                        }
                        className="min-w-0 flex-1 rounded-lg border-2 border-ink/60 bg-paper px-2 py-2 text-sm sm:w-44 sm:flex-none"
                      >
                        <option value="">Suma a…</option>
                        {quiz.results.map((result, ri) => (
                          <option key={ri} value={ri}>
                            {result.emoji} {result.title || `Resultado ${ri + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                    <IconButton
                      label={`Eliminar respuesta ${ai + 1}`}
                      disabled={question.answers.length <= LIMITS.minAnswers}
                      onClick={() => update(updateQuestion(quiz, qi, (q) => removeAnswer(q, ai)))}
                    >
                      ✕
                    </IconButton>
                  </div>
                </div>
              ))}
              {question.answers.length < LIMITS.maxAnswers && (
                <button
                  type="button"
                  onClick={() => update(updateQuestion(quiz, qi, (q) => addAnswer(q, quiz.kind, quiz.results.length)))}
                  className="text-sm font-semibold text-coral-dark hover:underline"
                >
                  + Añadir respuesta
                </button>
              )}
            </fieldset>
          </div>
        ))}
        {quiz.questions.length < LIMITS.maxQuestions && (
          <button type="button" onClick={() => update(addQuestion(quiz))} className={buttonClasses("secondary", "md", "w-full")}>
            + Añadir pregunta
          </button>
        )}
      </Section>

      <Section title="4. Prueba y publica">
        {errors.length > 0 && (
          <div
            ref={errorsRef}
            tabIndex={-1}
            role="alert"
            className="space-y-2 rounded-2xl border-2 border-danger bg-danger/5 p-4 outline-none"
          >
            <p className="font-semibold text-danger">Revisa estos {errors.length === 1 ? "detalle" : `${errors.length} detalles`} antes de continuar:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {errors.slice(0, 12).map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
            {errors.length > 12 && <p className="text-sm">…y {errors.length - 12} más.</p>}
          </div>
        )}

        {previewing && <PreviewPanel quiz={quiz} onClose={() => setPreviewing(false)} />}

        {publishedRef ? (
          <PublishedPanel quizRef={publishedRef} title={quiz.title} />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                if (validate(quiz)) setPreviewing(true);
              }}
              className={buttonClasses("secondary", "lg", "flex-1")}
            >
              Probar el test
            </button>
            <button type="button" onClick={() => publish(quiz)} className={buttonClasses("primary", "lg", "flex-1")}>
              Publicar y obtener enlace
            </button>
          </div>
        )}
        <p className="text-xs text-ink-soft">
          El test se guarda dentro del enlace: no necesitas cuenta. Si lo modificas después, publica de nuevo para obtener un
          enlace actualizado (el anterior seguirá mostrando la versión antigua).
        </p>
      </Section>

      <PublishedList
        list={publishedList}
        onChange={setPublishedList}
        onEdit={(loaded) => start(loaded, "published")}
        currentRef={publishedRef}
      />
      <p className="sr-only" aria-live="polite">
        {publishedRef ? `Test publicado. Enlace: ${quizPath(publishedRef)}` : ""}
      </p>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-3xl border-2 border-ink/10 bg-paper/60 p-4 sm:p-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">{title}</h2>
        {description && <p className="text-ink-soft">{description}</p>}
      </div>
      {children}
    </section>
  );
}

type ResultEditorProps = {
  index: number;
  result: QuizResult;
  isTrivia: boolean;
  maxMin: number;
  canRemove: boolean;
  onChange: (result: QuizResult) => void;
  onRemove: () => void;
};

function ResultEditor({ index, result, isTrivia, maxMin, canRemove, onChange, onRemove }: ResultEditorProps) {
  return (
    <div className="space-y-4 rounded-2xl border-2 border-ink bg-paper p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-lg font-bold">Resultado {index + 1}</h3>
        <IconButton label={`Eliminar resultado ${index + 1}`} disabled={!canRemove} onClick={onRemove}>
          ✕
        </IconButton>
      </div>
      <EmojiField label="Emoji" value={result.emoji} onChange={(emoji) => onChange({ ...result, emoji })} />
      <TextField
        label="Nombre del resultado"
        required
        value={result.title}
        maxLength={LIMITS.resultTitle}
        placeholder={isTrivia ? "Ej.: Experto" : "Ej.: Aventurero"}
        onChange={(title) => onChange({ ...result, title })}
      />
      <TextField
        label="Descripción"
        required
        multiline
        value={result.description}
        maxLength={LIMITS.resultDescription}
        placeholder="Qué significa este resultado. Sé positivo: la gente comparte lo que le hace quedar bien."
        onChange={(description) => onChange({ ...result, description })}
      />
      {isTrivia && (
        <label className="flex items-center gap-3 text-sm font-semibold">
          Desde
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={maxMin}
            value={result.min ?? 0}
            onChange={(event) => onChange({ ...result, min: Math.max(0, Math.floor(Number(event.target.value) || 0)) })}
            className="w-20 rounded-lg border-2 border-ink/60 bg-paper px-3 py-2 text-base outline-none focus:border-ink"
          />
          aciertos
        </label>
      )}
    </div>
  );
}
