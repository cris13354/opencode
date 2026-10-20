/**
 * Codificación de tests dentro de la URL.
 *
 * Para no necesitar base de datos en el MVP, un test creado por un usuario se
 * guarda DENTRO del propio enlace:
 *
 *   objeto Quiz → JSON → comprimido (deflate) → base64url → "c1.<datos>"
 *
 * Ventajas: coste cero, sin cuentas, sin datos personales en un servidor.
 * Inconvenientes: enlaces largos y no se puede editar un test ya compartido
 * (ver TODO.md: "enlaces cortos con base de datos").
 *
 * Funciona igual en el navegador y en el servidor (Node 18+), porque ambos
 * tienen CompressionStream / DecompressionStream.
 */
import { QuizSchema, type Quiz } from "./schema";

/** Prefijo de los tests personalizados. Incluye versión del formato ("c1"). */
export const CUSTOM_PREFIX = "c1.";

/** Límite del texto codificado: evita URLs que algunos servicios cortarían. */
export const MAX_ENCODED_LENGTH = 6000;

/** Límite tras descomprimir: protege frente a "bombas" de compresión. */
const MAX_DECODED_BYTES = 32 * 1024;

export async function encodeQuiz(quiz: Quiz): Promise<string> {
  const json = JSON.stringify(quiz);
  const compressed = await compress(new TextEncoder().encode(json));
  return CUSTOM_PREFIX + toBase64Url(compressed);
}

/**
 * Devuelve el test si el texto es válido, o `null` si está roto, es demasiado
 * grande o no cumple el esquema. Nunca lanza excepciones: la URL puede venir
 * de cualquier sitio.
 */
export async function decodeQuiz(ref: string): Promise<Quiz | null> {
  if (!ref.startsWith(CUSTOM_PREFIX) || ref.length > MAX_ENCODED_LENGTH) return null;
  const bytes = fromBase64Url(ref.slice(CUSTOM_PREFIX.length));
  if (!bytes) return null;
  const json = await decompress(bytes).catch(() => null);
  if (json === null) return null;
  const parsed = safeJsonParse(json);
  const result = QuizSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

export function isCustomRef(ref: string): boolean {
  return ref.startsWith(CUSTOM_PREFIX);
}

async function compress(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Descomprime leyendo por trozos y corta si supera MAX_DECODED_BYTES. */
async function decompress(bytes: Uint8Array): Promise<string | null> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_DECODED_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(merged);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) return null;
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}
