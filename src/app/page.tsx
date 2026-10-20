import Link from "next/link";
import { QuizCard } from "@/components/quiz/QuizCard";
import { ResultCard } from "@/components/quiz/ResultCard";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { CATALOG, findCatalogEntry } from "@/lib/quiz/catalog";

const STEPS = [
  {
    emoji: "✍️",
    title: "Crea tu test en minutos",
    text: "Elige personalidad o conocimientos, escribe preguntas y resultados. Sin registro y gratis.",
  },
  {
    emoji: "📲",
    title: "Compártelo donde está tu audiencia",
    text: "Un enlace para tu bio, Stories, WhatsApp o newsletter. Funciona perfecto en el móvil.",
  },
  {
    emoji: "🔁",
    title: "Tu audiencia lo comparte por ti",
    text: "Cada resultado genera una tarjeta con imagen lista para Stories que invita a sus amigos a jugar.",
  },
];

const AUDIENCES = [
  {
    emoji: "🧭",
    title: "Coaches y formadores",
    text: "«¿Qué tipo de líder eres?» Un diagnóstico rápido que demuestra tu método y abre conversaciones.",
  },
  {
    emoji: "🎬",
    title: "Creadores de contenido",
    text: "Contenido interactivo que se comparte solo, genera comentarios y te trae seguidores nuevos.",
  },
  {
    emoji: "🏪",
    title: "Pequeños negocios",
    text: "«¿Qué café eres?» Recomienda productos de forma divertida y da a tus clientes una razón para volver.",
  },
];

const FAQ = [
  {
    q: "¿Es gratis de verdad?",
    a: "Sí. Crear, compartir y jugar tests es gratis y sin registro. Más adelante habrá un plan Pro con funciones para negocios (captación de emails, estadísticas, sin marca de QuizLab).",
  },
  {
    q: "¿Dónde se guardan mis tests?",
    a: "Dentro del propio enlace. Cuando publicas un test, todo su contenido va codificado en la URL, por eso no necesitas cuenta. Además se guarda una copia en tu navegador para que puedas seguir editándolo.",
  },
  {
    q: "¿Puedo cambiar un test que ya he compartido?",
    a: "Puedes editarlo y publicar una versión nueva, que tendrá un enlace nuevo. El enlace antiguo seguirá mostrando la versión anterior.",
  },
  {
    q: "¿Guardáis las respuestas de quien hace el test?",
    a: "No. Las respuestas se procesan en el navegador de cada persona y no se envían a ningún servidor. Solo medimos estadísticas anónimas de uso.",
  },
];

export default function HomePage() {
  const demo = findCatalogEntry("emprendedor")!;
  return (
    <>
      <section className="overflow-hidden border-b-2 border-ink/10">
        <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-7">
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-lime px-3 py-1 text-sm font-bold">
              Para creadores, coaches y pequeños negocios
            </p>
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
              Tests que tu audiencia <span className="underline decoration-coral decoration-[6px] underline-offset-[6px]">quiere compartir</span>
            </h1>
            <p className="max-w-xl text-lg text-ink-soft sm:text-xl">
              Crea un test de personalidad o de conocimientos en 10 minutos. Tus seguidores lo hacen, comparten su
              resultado y te traen a sus amigos. Gratis y sin registro.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/crear" className={buttonClasses("primary", "lg")}>
                Crea tu test gratis
              </Link>
              <Link href={`/t/${demo.slug}`} className={buttonClasses("secondary", "lg")}>
                Prueba un ejemplo
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rotate-2">
              <ResultCard quiz={demo.quiz} resultIndex={0} name="Lucía" />
            </div>
            <span
              aria-hidden
              className="absolute -top-5 -left-3 -rotate-6 rounded-xl border-2 border-ink bg-lime px-3 py-1.5 text-sm font-bold shadow-sticker-sm"
            >
              Así se ve al compartir ✨
            </span>
          </div>
        </Container>
      </section>

      <section aria-labelledby="como-funciona" className="py-16 sm:py-20">
        <Container className="space-y-10">
          <h2 id="como-funciona" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cómo funciona
          </h2>
          <ol className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="space-y-3 rounded-2xl border-2 border-ink bg-paper p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-ink font-bold text-cream">{i + 1}</span>
                  <span aria-hidden className="text-2xl">{step.emoji}</span>
                </div>
                <h3 className="font-display text-xl font-bold">{step.title}</h3>
                <p className="text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="tests" aria-labelledby="tests-title" className="scroll-mt-20 border-y-2 border-ink bg-quiz-yellow/40 py-16 sm:py-20">
        <Container className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <h2 id="tests-title" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Juega un test de ejemplo
            </h2>
            <p className="text-lg text-ink-soft">
              Haz uno, comparte tu resultado y comprueba cómo lo vería tu audiencia.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATALOG.map((entry) => (
              <QuizCard key={entry.slug} entry={entry} />
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="para-quien" className="py-16 sm:py-20">
        <Container className="space-y-10">
          <h2 id="para-quien" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Hecho para quien vive de su audiencia
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {AUDIENCES.map((item) => (
              <div key={item.title} className="space-y-3 rounded-2xl border-2 border-ink bg-paper p-6 shadow-sticker-sm">
                <span aria-hidden className="text-4xl">{item.emoji}</span>
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="faq" className="pb-4">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            <h2 id="faq" className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Preguntas frecuentes
            </h2>
            <p className="text-ink-soft">
              ¿Quieres captar emails o ver estadísticas? Mira lo que preparamos en el{" "}
              <Link href="/precios" className="font-semibold text-ink underline">
                plan Pro
              </Link>
              .
            </p>
          </div>
          <div className="divide-y-2 divide-ink/10 rounded-2xl border-2 border-ink bg-paper">
            {FAQ.map((item) => (
              <details key={item.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {item.q}
                  <span aria-hidden className="text-xl transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="pt-16 sm:pt-20">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-3xl border-2 border-ink bg-coral p-8 shadow-sticker sm:p-12 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Tu primer test, hoy.</h2>
              <p className="text-lg">Empieza desde una plantilla y publícalo en menos de 10 minutos.</p>
            </div>
            <Link href="/crear" className={buttonClasses("dark", "lg")}>
              Crear mi test
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
