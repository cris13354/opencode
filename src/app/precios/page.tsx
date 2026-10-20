import type { Metadata } from "next";
import Link from "next/link";
import { ProInterestButton } from "@/components/ProInterestButton";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Precios",
  description: "QuizLab es gratis. El plan Pro (próximamente) añade captación de emails, estadísticas y tu propia marca.",
};

/**
 * Precios: hipótesis a validar, no precios definitivos (ver PLAN.md).
 * Los planes de pago todavía no existen: el botón mide el interés.
 */
const PLANS = [
  {
    name: "Gratis",
    price: "0 €",
    period: "para siempre",
    highlight: false,
    features: [
      "Tests ilimitados de personalidad y conocimientos",
      "Hasta 15 preguntas y 6 resultados por test",
      "Tarjetas de resultado para redes y Stories",
      "Sin registro",
      "Incluye «Hecho con QuizLab»",
    ],
  },
  {
    name: "Pro",
    price: "9 €",
    period: "al mes",
    highlight: true,
    features: [
      "Todo lo del plan Gratis",
      "Captación de emails antes del resultado",
      "Estadísticas: visitas, completados y resultados",
      "Sin marca de QuizLab y con tu logo",
      "Enlaces cortos y editables",
    ],
  },
  {
    name: "Negocio",
    price: "29 €",
    period: "al mes",
    highlight: false,
    features: [
      "Todo lo del plan Pro",
      "Integración con Mailchimp, Brevo y webhooks",
      "Dominio propio",
      "Hasta 3 personas del equipo",
      "Soporte prioritario",
    ],
  },
];

export default function PricingPage() {
  return (
    <Container className="space-y-12 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Empieza gratis. Crece con Pro.</h1>
        <p className="text-lg text-ink-soft">
          Crear y compartir tests es gratis. Los planes de pago están en preparación: si te interesan, avísanos y te
          daremos acceso anticipado con descuento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <section
            key={plan.name}
            aria-labelledby={`plan-${plan.name}`}
            className={`flex flex-col gap-6 rounded-3xl border-2 border-ink p-6 sm:p-8 ${plan.highlight ? "bg-lime shadow-sticker" : "bg-paper"}`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 id={`plan-${plan.name}`} className="font-display text-2xl font-extrabold">
                  {plan.name}
                </h2>
                {plan.name !== "Gratis" && (
                  <span className="rounded-full border-2 border-ink bg-paper px-2.5 py-0.5 text-xs font-bold">Próximamente</span>
                )}
              </div>
              <p>
                <span className="font-display text-5xl font-extrabold">{plan.price}</span>{" "}
                <span className="text-ink-soft">{plan.period}</span>
              </p>
            </div>
            <ul className="flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span aria-hidden className="font-bold text-success">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            {plan.name === "Gratis" ? (
              <Link href="/crear" className={buttonClasses("secondary", "md", "w-full")}>
                Crear un test gratis
              </Link>
            ) : (
              <ProInterestButton plan={plan.name} waitlistUrl={siteConfig.waitlistUrl} />
            )}
          </section>
        ))}
      </div>

      <p className="mx-auto max-w-2xl text-center text-sm text-ink-soft">
        Precios orientativos en fase de validación. Impuestos no incluidos. Nadie pagará nada hasta que el plan exista y lo
        contrate expresamente.
      </p>
    </Container>
  );
}
