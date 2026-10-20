"use client";

/**
 * Botón de "prueba de interés" del plan Pro (fake door honesto):
 * - Mide cuántas personas hacen clic (evento `pro_interest`).
 * - Si hay un formulario de lista de espera configurado, lo abre.
 * - Nunca cobra ni simula un pago: lo dice claramente.
 */
import { useState } from "react";
import { track } from "@/lib/analytics";
import { buttonClasses } from "./ui/button";

export function ProInterestButton({ plan, waitlistUrl }: { plan: string; waitlistUrl: string | null }) {
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    track("pro_interest", { plan });
    setClicked(true);
    if (waitlistUrl) window.open(waitlistUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={handleClick} className={buttonClasses("primary", "md", "w-full")}>
        Quiero {plan}
      </button>
      <p role="status" className="text-center text-xs text-ink-soft">
        {clicked
          ? waitlistUrl
            ? "¡Gracias! Te hemos abierto el formulario de la lista de espera."
            : "¡Gracias por tu interés! El plan aún no está disponible; lo anunciaremos pronto."
          : "Aún no disponible. No se te cobrará nada."}
      </p>
    </div>
  );
}
