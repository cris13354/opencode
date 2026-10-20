import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Container } from "./ui/Container";
import { Logo } from "./ui/Logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-ink bg-ink text-cream">
      <Container className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="[&_a]:text-cream">
            <Logo />
          </div>
          <p className="text-sm text-cream/70">{siteConfig.description}</p>
        </div>
        <nav aria-label="Pie de página" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <Link href="/#tests" className="hover:underline">Tests de ejemplo</Link>
          <Link href="/crear" className="hover:underline">Crear un test</Link>
          <Link href="/precios" className="hover:underline">Precios</Link>
          <Link href="/privacidad" className="hover:underline">Privacidad</Link>
          {siteConfig.feedbackUrl && (
            <a href={siteConfig.feedbackUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Danos tu opinión
            </a>
          )}
        </nav>
      </Container>
      <Container className="border-t border-cream/15 py-5 text-xs text-cream/60">
        © {siteConfig.name}. Hecho para creadores y pequeños negocios. Emojis de las imágenes:{" "}
        <a href="https://github.com/jdecked/twemoji" className="underline" target="_blank" rel="noopener noreferrer">
          Twemoji
        </a>{" "}
        (CC-BY 4.0).
      </Container>
    </footer>
  );
}
