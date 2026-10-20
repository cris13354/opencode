/**
 * Configuración general del sitio. Los valores opcionales se leen de variables
 * de entorno públicas (NEXT_PUBLIC_*) definidas en .env.local o en Vercel.
 * Consulta .env.example para ver todas.
 */
export const siteConfig = {
  name: "QuizLab",
  tagline: "Tests virales para crecer tu audiencia",
  description:
    "Crea tests de personalidad y de conocimientos que tu audiencia quiere compartir. Gratis, sin registro y listos en minutos.",
  /**
   * URL pública. Necesaria para que las imágenes al compartir tengan URL absoluta.
   * En Vercel, si no defines NEXT_PUBLIC_SITE_URL, se usa el dominio de producción
   * que Vercel proporciona automáticamente (VERCEL_PROJECT_PRODUCTION_URL).
   */
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
  ).replace(/\/$/, ""),
  /** Formulario externo (p. ej. Tally o Google Forms) para recoger opiniones. */
  feedbackUrl: process.env.NEXT_PUBLIC_FEEDBACK_URL || null,
  /** Email de contacto (avisos de contenido, privacidad). */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
  /** Formulario externo para la lista de espera del plan Pro (prueba de interés). */
  waitlistUrl: process.env.NEXT_PUBLIC_WAITLIST_URL || null,
};
