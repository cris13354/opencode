"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { quizPath } from "@/lib/quiz/resolve";
import { buttonClasses } from "../ui/button";

/** Se muestra tras publicar: enlace listo para copiar, abrir o compartir. */
export function PublishedPanel({ quizRef, title }: { quizRef: string; title: string }) {
  const [copied, setCopied] = useState<"ok" | "error" | null>(null);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const url = `${origin}${quizPath(quizRef)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied("ok");
    } catch {
      setCopied("error");
    }
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`¿Te atreves con mi test? «${title}» ${url}`)}`;

  return (
    <div className="animate-pop-in space-y-4 rounded-2xl border-2 border-ink bg-quiz-green p-5 shadow-sticker">
      <p className="font-display text-2xl font-extrabold">¡Tu test está listo! 🎉</p>
      <p>Comparte este enlace en tu bio, Stories, WhatsApp o newsletter:</p>
      <input
        readOnly
        value={url}
        aria-label="Enlace del test"
        onFocus={(event) => event.target.select()}
        className="w-full truncate rounded-xl border-2 border-ink bg-paper px-3 py-2.5 font-mono text-sm"
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={copy} className={buttonClasses("dark", "md")}>
          {copied === "ok" ? "¡Copiado!" : "Copiar enlace"}
        </button>
        <Link href={quizPath(quizRef)} target="_blank" className={buttonClasses("secondary", "md")}>
          Abrir test
        </Link>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary", "md")}>
          Enviar por WhatsApp
        </a>
      </div>
      {copied === "error" && (
        <p role="status" className="text-sm text-danger">
          No se pudo copiar automáticamente: selecciona el enlace y cópialo a mano.
        </p>
      )}
      <p className="text-sm">
        Consejo: pide a 3 personas que lo hagan hoy y pregúntales qué les ha parecido. Así sabrás qué mejorar.
      </p>
    </div>
  );
}
