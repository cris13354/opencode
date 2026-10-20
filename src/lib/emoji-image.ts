/**
 * Emojis para las imágenes PNG generadas en /api/card (solo servidor).
 *
 * El generador de imágenes (satori) no sabe dibujar emojis por sí mismo: por
 * defecto los descarga de un CDN externo en cada imagen. Para no depender de
 * un servicio de terceros, usamos los SVG de Twemoji incluidos en el paquete
 * `@twemoji/svg` y los insertamos como imagen (data URI).
 *
 * Twemoji © Twitter, Inc. y colaboradores — gráficos bajo licencia CC-BY 4.0.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const TWEMOJI_DIR = path.join(process.cwd(), "node_modules", "@twemoji", "svg");
const FALLBACK = "2728"; // ✨

/** Devuelve un data URI con el SVG del emoji, o el de ✨ si no lo encontramos. */
export async function emojiDataUri(emoji: string): Promise<string | null> {
  for (const name of [...candidateNames(emoji), FALLBACK]) {
    const svg = await readFile(path.join(TWEMOJI_DIR, `${name}.svg`)).catch(() => null);
    if (svg) return `data:image/svg+xml;base64,${svg.toString("base64")}`;
  }
  return null;
}

/**
 * Nombres de archivo posibles según la convención de Twemoji: códigos
 * hexadecimales separados por "-". El selector de variación FE0F se omite
 * salvo en secuencias con ZWJ (200D). Solo genera [0-9a-f-], así que no hay
 * riesgo de rutas manipuladas.
 */
function candidateNames(emoji: string): string[] {
  const codes = [...emoji.trim()].map((char) => char.codePointAt(0)!.toString(16));
  const withoutVariation = codes.filter((code) => code !== "fe0f");
  return [...new Set([withoutVariation.join("-"), codes.join("-")])].filter(Boolean);
}

/**
 * Quita emojis de un texto. Los textos de la imagen (título, nombre…) se
 * muestran sin emojis para no depender de descargas externas.
 */
export function stripEmoji(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}‍️⃣]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
