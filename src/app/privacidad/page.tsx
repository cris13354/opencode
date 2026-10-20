import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Qué datos usa QuizLab y cuáles no.",
};

/*
 * Texto orientativo redactado para el MVP. Antes de lanzar comercialmente,
 * hay que revisarlo con un profesional y añadir el responsable del
 * tratamiento (nombre, NIF/ID fiscal y contacto). Ver TODO.md.
 */
export default function PrivacyPage() {
  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <article className="space-y-6 text-lg leading-relaxed [&_h2]:pt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Privacidad</h1>
        <p className="text-ink-soft">Versión resumida y en lenguaje claro.</p>

        <h2>Lo que NO hacemos</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>No pedimos registro ni datos personales para crear o hacer tests.</li>
          <li>No enviamos tus respuestas a ningún servidor: el resultado se calcula en tu navegador.</li>
          <li>No usamos cookies publicitarias ni vendemos datos.</li>
        </ul>

        <h2>Dónde se guardan los tests</h2>
        <p>
          El contenido de un test creado con QuizLab viaja dentro de su propio enlace. Cualquiera que tenga el enlace
          puede ver el test. El borrador y la lista de tests que publicas se guardan solo en el almacenamiento local de
          tu navegador.
        </p>

        <h2>Tu nombre en la tarjeta</h2>
        <p>
          Si escribes tu nombre al compartir un resultado, se añade al enlace y a la imagen que generas. No lo
          almacenamos: solo lo verá quien reciba ese enlace.
        </p>

        <h2>Estadísticas de uso</h2>
        <p>
          Podemos medir estadísticas anónimas y agregadas (páginas visitadas, tests completados, clics en compartir) con
          una herramienta sin cookies que respeta la opción «No rastrear» de tu navegador. Nunca incluyen lo que
          escribes.
        </p>

        <h2>Contenido creado por usuarios</h2>
        <p>
          Los tests creados por usuarios no son revisados por QuizLab. Si encuentras uno ofensivo o engañoso,
          avísanos{" "}
          {siteConfig.contactEmail && (
            <>
              en{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold underline">
                {siteConfig.contactEmail}
              </a>{" "}
            </>
          )}
          y lo revisaremos.
        </p>
      </article>
    </Container>
  );
}
