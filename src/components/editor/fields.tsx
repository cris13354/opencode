"use client";

/** Campos de formulario reutilizables del editor, con etiqueta y contador. */
import { useId } from "react";

const inputClasses =
  "w-full rounded-xl border-2 border-ink/80 bg-paper px-3.5 py-2.5 text-base outline-none transition placeholder:text-ink-soft/60 focus:border-ink focus:shadow-sticker-sm";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  hint?: string;
};

export function TextField({ label, value, onChange, maxLength, placeholder, multiline, required, hint }: TextFieldProps) {
  const id = useId();
  const nearLimit = value.length > maxLength * 0.85;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
          {!required && <span className="font-normal text-ink-soft"> (opcional)</span>}
        </label>
        <span aria-hidden className={`text-xs tabular-nums ${nearLimit ? "text-danger" : "text-ink-soft"}`}>
          {value.length}/{maxLength}
        </span>
      </div>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          rows={3}
          className={`${inputClasses} resize-y`}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

const EMOJI_SUGGESTIONS = ["✨", "🚀", "🔥", "💡", "🎯", "🧠", "❤️", "🌱", "☕", "🎨", "📚", "💪", "🏆", "🌟", "😎", "🧘"];

/** Selector de emoji: campo de texto (acepta cualquier emoji) + sugerencias rápidas. */
export function EmojiField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={16}
          className="size-12 rounded-xl border-2 border-ink bg-paper text-center text-2xl outline-none focus:shadow-sticker-sm"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Sugerencias de emoji">
          {EMOJI_SUGGESTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onChange(emoji)}
              aria-label={`Usar ${emoji}`}
              aria-pressed={value === emoji}
              className={`grid size-9 place-items-center rounded-lg text-lg transition hover:bg-ink/10 ${value === emoji ? "bg-lime ring-2 ring-ink" : ""}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Botón pequeño con icono para acciones secundarias (subir, bajar, eliminar…). */
export function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-lg border-2 border-transparent text-ink-soft transition hover:border-ink hover:bg-paper hover:text-ink disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
