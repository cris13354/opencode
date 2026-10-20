import type { QuizColor } from "./schema";

/**
 * Colores de tarjeta de cada test.
 * - `bg`: clase de Tailwind (para la web).
 * - `hex`: el mismo color en hexadecimal (para la imagen PNG, que no usa Tailwind).
 * Mantén ambos sincronizados con src/app/globals.css.
 */
export const QUIZ_COLOR_STYLES: Record<QuizColor, { label: string; bg: string; hex: string }> = {
  coral: { label: "Coral", bg: "bg-quiz-coral", hex: "#ffb4a3" },
  violet: { label: "Violeta", bg: "bg-quiz-violet", hex: "#c9b8ff" },
  blue: { label: "Azul", bg: "bg-quiz-blue", hex: "#a8d4ff" },
  green: { label: "Verde", bg: "bg-quiz-green", hex: "#a9eec4" },
  yellow: { label: "Amarillo", bg: "bg-quiz-yellow", hex: "#ffe27a" },
};

export const BRAND = {
  ink: "#16131f",
  cream: "#fbf7f0",
  coral: "#ff5a3c",
  lime: "#d4f55b",
};
