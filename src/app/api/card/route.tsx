/**
 * GET /api/card?ref=<test>&r=<resultado>[&s=<aciertos>][&n=<nombre>][&f=story][&dl=1]
 *
 * Genera la imagen PNG de una tarjeta de resultado:
 *  - formato "og" (1200×630): la que muestran WhatsApp, X, Telegram… al compartir.
 *  - formato "story" (1080×1920): para subir a Instagram/TikTok Stories.
 * Con dl=1 el navegador la descarga como archivo.
 *
 * Todos los parámetros vienen de la URL y se validan con las mismas funciones
 * que la página de resultado.
 */
/* eslint-disable @next/next/no-img-element -- satori (el generador de PNG) solo entiende <img>, no next/image. */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { emojiDataUri, stripEmoji } from "@/lib/emoji-image";
import { BRAND, QUIZ_COLOR_STYLES } from "@/lib/quiz/colors";
import { parseResultIndex, parseShareParams, resolveQuiz } from "@/lib/quiz/resolve";

const FORMATS = {
  og: { width: 1200, height: 630 },
  story: { width: 1080, height: 1920 },
};

const FONT_DIR = path.join(process.cwd(), "src", "assets", "fonts");

/** Fuente de la marca, leída del disco una sola vez y reutilizada. */
const fontsPromise = Promise.all(
  ([500, 700, 800] as const).map(async (weight) => ({
    name: "Bricolage",
    data: (await readFile(path.join(FONT_DIR, `BricolageGrotesque-${weight}.ttf`))).buffer as ArrayBuffer,
    weight,
    style: "normal" as const,
  })),
);

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const resolved = await resolveQuiz(search.get("ref") ?? "");
  if (!resolved) return new Response("Test no encontrado", { status: 404 });
  const quiz = resolved.quiz;
  const resultIndex = parseResultIndex(quiz, search.get("r") ?? "");
  if (resultIndex === null) return new Response("Resultado no encontrado", { status: 404 });

  const share = parseShareParams(quiz, { s: search.get("s"), n: search.get("n") });
  const format = search.get("f") === "story" ? "story" : "og";
  const isStory = format === "story";
  const result = quiz.results[resultIndex];
  const [quizEmoji, resultEmoji, fonts] = await Promise.all([
    emojiDataUri(quiz.emoji),
    emojiDataUri(result.emoji),
    fontsPromise,
  ]);
  const name = share.name ? stripEmoji(share.name) : "";

  const headers: Record<string, string> = {
    // La imagen depende solo de la URL, así que puede cachearse mucho tiempo.
    "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable",
  };
  if (search.get("dl") === "1") {
    headers["Content-Disposition"] = `attachment; filename="quizlab-${isStory ? "stories" : "resultado"}.png"`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BRAND.cream,
          padding: isStory ? 80 : 48,
          fontFamily: "Bricolage",
          fontWeight: 500,
          color: BRAND.ink,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: isStory ? "center" : "space-between",
            background: QUIZ_COLOR_STYLES[quiz.color].hex,
            border: `6px solid ${BRAND.ink}`,
            borderRadius: 48,
            boxShadow: `14px 14px 0 0 ${BRAND.ink}`,
            padding: isStory ? 72 : 56,
            gap: isStory ? 56 : 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: isStory ? 44 : 30, fontWeight: 700 }}>
            {quizEmoji && <img src={quizEmoji} alt="" width={isStory ? 56 : 40} height={isStory ? 56 : 40} />}
            <div style={{ display: "flex", opacity: 0.75 }}>{truncate(stripEmoji(quiz.title), isStory ? 60 : 70)}</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: isStory ? "column" : "row",
              alignItems: isStory ? "flex-start" : "center",
              gap: isStory ? 40 : 40,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: isStory ? 240 : 180,
                height: isStory ? 240 : 180,
                background: "#ffffff",
                border: `6px solid ${BRAND.ink}`,
                borderRadius: 36,
              }}
            >
              {resultEmoji && <img src={resultEmoji} alt="" width={isStory ? 150 : 110} height={isStory ? 150 : 110} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, ...(isStory ? {} : { flex: 1 }) }}>
              <div style={{ display: "flex", fontSize: isStory ? 48 : 34, fontWeight: 600, opacity: 0.8 }}>
                {name ? `${name} es…` : "Resultado"}
              </div>
              <div style={{ display: "flex", fontSize: isStory ? 110 : 76, fontWeight: 800, lineHeight: 1.02 }}>
                {truncate(stripEmoji(result.title), 40)}
              </div>
              {share.score !== undefined && (
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      display: "flex",
                      background: BRAND.lime,
                      border: `4px solid ${BRAND.ink}`,
                      borderRadius: 999,
                      padding: "6px 24px",
                      fontSize: isStory ? 48 : 34,
                      fontWeight: 800,
                    }}
                  >
                    {`${share.score}/${quiz.questions.length} aciertos`}
                  </div>
                </div>
              )}
            </div>
          </div>
          {isStory && (
            <div style={{ display: "flex", fontSize: 46, lineHeight: 1.35, fontWeight: 500 }}>{truncate(stripEmoji(result.description), 200)}</div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: isStory ? 64 : 28,
            fontSize: isStory ? 44 : 28,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex" }}>¿Y tú? Haz el test →</div>
          <div
            style={{
              display: "flex",
              background: BRAND.ink,
              color: BRAND.cream,
              borderRadius: 16,
              padding: "6px 20px",
              fontWeight: 800,
            }}
          >
            QuizLab
          </div>
        </div>
      </div>
    ),
    { ...FORMATS[format], fonts, headers },
  );
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
