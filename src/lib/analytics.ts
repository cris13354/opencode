/**
 * Medición de uso respetuosa con la privacidad.
 *
 * `track("evento", { datos })` envía un evento a Umami (https://umami.is) si
 * está configurado con NEXT_PUBLIC_UMAMI_WEBSITE_ID. Umami no usa cookies ni
 * guarda datos personales, por eso no necesita banner de cookies en la mayoría
 * de casos (revísalo con tu asesor legal según tu país).
 *
 * Si no está configurado, en desarrollo los eventos se muestran en la consola
 * del navegador y en producción simplemente no se envían a ningún sitio.
 *
 * Regla: NUNCA envíes datos personales (nombres, emails, textos escritos por
 * el usuario). Solo identificadores de test, tipos de acción y números.
 */
export type AnalyticsEvent =
  | "quiz_start"
  | "quiz_complete"
  | "share_click"
  | "card_download"
  | "quiz_publish"
  | "editor_start"
  | "pro_interest"
  | "feedback_click";

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

export function track(event: AnalyticsEvent, data?: EventData): void {
  if (typeof window === "undefined") return;
  if (window.umami) {
    window.umami.track(event, data);
    return;
  }
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, data ?? {});
  }
}

/**
 * Los tests personalizados tienen referencias enormes (el test entero va en la
 * URL). Para la analítica usamos "custom" en su lugar: así no se envía el
 * contenido que ha escrito el usuario.
 */
export function analyticsRef(ref: string): string {
  return ref.startsWith("c1.") ? "custom" : ref;
}
