"use client";

/**
 * Acciones para compartir un resultado: compartir nativo (móvil), WhatsApp,
 * X, Telegram, copiar enlace y descargar la imagen (formato post y Stories).
 *
 * Si la persona escribe su nombre, se añade al enlace y a la imagen, así sus
 * amigos ven "Ana es…" al abrirlo. El nombre NO se guarda en ningún servidor:
 * solo viaja dentro del enlace que ella decide compartir.
 */
import { useId, useState, useSyncExternalStore } from "react";
import { analyticsRef, track } from "@/lib/analytics";
import { MAX_NAME_LENGTH, cardImagePath, cleanName, resultPath } from "@/lib/quiz/resolve";
import type { Quiz } from "@/lib/quiz/schema";
import { buttonClasses } from "../ui/button";

type Props = {
  quizRef: string;
  quiz: Quiz;
  resultIndex: number;
  score?: number;
  initialName?: string;
};

export function ShareActions({ quizRef, quiz, resultIndex, score, initialName }: Props) {
  const [name, setName] = useState(initialName ?? "");
  const [copied, setCopied] = useState<"ok" | "error" | null>(null);
  const nameId = useId();
  const cleanedName = cleanName(name);
  const result = quiz.results[resultIndex];

  const params = { score, name: cleanedName };
  const shareUrl = () => `${window.location.origin}${resultPath(quizRef, resultIndex, params)}`;
  const shareText =
    score !== undefined
      ? `He sacado ${score}/${quiz.questions.length} en «${quiz.title}» ${result.emoji} ¿Me superas?`
      : `Me ha salido «${result.title}» ${result.emoji} en «${quiz.title}». ¿Y a ti?`;

  const ref = analyticsRef(quizRef);

  async function nativeShare() {
    track("share_click", { quiz: ref, channel: "native" });
    try {
      await navigator.share({ title: quiz.title, text: shareText, url: shareUrl() });
    } catch {
      // La persona canceló el diálogo: no hacemos nada.
    }
  }

  async function copyLink() {
    track("share_click", { quiz: ref, channel: "copy" });
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied("ok");
    } catch {
      setCopied("error");
    }
    window.setTimeout(() => setCopied(null), 2500);
  }

  function openShare(channel: "whatsapp" | "x" | "telegram") {
    track("share_click", { quiz: ref, channel });
    const url = encodeURIComponent(shareUrl());
    const text = encodeURIComponent(shareText);
    const targets = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      x: `https://x.com/intent/post?text=${text}&url=${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    window.open(targets[channel], "_blank", "noopener,noreferrer");
  }

  // En el servidor no existe `navigator`: empezamos sin el botón y lo mostramos al hidratar.
  const canNativeShare = useSyncExternalStore(
    noopSubscribe,
    () => "share" in navigator,
    () => false,
  );

  return (
    <section aria-labelledby={`${nameId}-title`} className="space-y-5 rounded-3xl border-2 border-ink bg-paper p-5 sm:p-6">
      <h2 id={`${nameId}-title`} className="font-display text-xl font-bold">
        Comparte y reta a tus amigos
      </h2>

      <div className="space-y-1.5">
        <label htmlFor={nameId} className="text-sm font-semibold">
          Tu nombre <span className="font-normal text-ink-soft">(opcional, aparecerá en la tarjeta)</span>
        </label>
        <input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="given-name"
          placeholder="Ej.: Lucía"
          className="w-full rounded-xl border-2 border-ink bg-cream px-4 py-2.5 text-base outline-none focus:bg-paper"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className={buttonClasses("primary", "md", "col-span-2 sm:col-span-4")}>
            Compartir
          </button>
        )}
        <button type="button" onClick={() => openShare("whatsapp")} className={buttonClasses("secondary", "md")}>
          WhatsApp
        </button>
        <button type="button" onClick={() => openShare("x")} className={buttonClasses("secondary", "md")}>
          X
        </button>
        <button type="button" onClick={() => openShare("telegram")} className={buttonClasses("secondary", "md")}>
          Telegram
        </button>
        <button type="button" onClick={copyLink} className={buttonClasses("secondary", "md")}>
          {copied === "ok" ? "¡Copiado!" : "Copiar enlace"}
        </button>
      </div>
      <p role="status" className="min-h-5 text-sm text-danger">
        {copied === "error" && "No se pudo copiar automáticamente. Copia el enlace desde la barra de direcciones."}
      </p>

      <div className="flex flex-col gap-2 border-t-2 border-dashed border-line pt-4 sm:flex-row">
        <a
          href={cardImagePath(quizRef, resultIndex, { ...params, download: true })}
          download
          onClick={() => track("card_download", { quiz: ref, format: "og" })}
          className={buttonClasses("dark", "md", "flex-1")}
        >
          Descargar imagen
        </a>
        <a
          href={cardImagePath(quizRef, resultIndex, { ...params, format: "story", download: true })}
          download
          onClick={() => track("card_download", { quiz: ref, format: "story" })}
          className={buttonClasses("dark", "md", "flex-1")}
        >
          Descargar para Stories
        </a>
      </div>
    </section>
  );
}

function noopSubscribe() {
  return () => {};
}
