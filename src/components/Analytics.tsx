import Script from "next/script";

/**
 * Carga el script de Umami solo si hay un ID configurado.
 * `data-do-not-track` respeta la preferencia "Do Not Track" del navegador.
 */
export function Analytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!websiteId) return null;
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://cloud.umami.is/script.js";
  return <Script src={src} data-website-id={websiteId} data-do-not-track="true" strategy="afterInteractive" />;
}
