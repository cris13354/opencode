import Link from "next/link";
import { buttonClasses } from "./ui/button";
import { Container } from "./ui/Container";
import { Logo } from "./ui/Logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink/10 bg-cream/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-4">
          <Link href="/#tests" className="hidden rounded-lg px-2 py-1 font-medium hover:bg-ink/5 sm:inline">
            Tests
          </Link>
          <Link href="/precios" className="rounded-lg px-2 py-1 font-medium hover:bg-ink/5">
            Precios
          </Link>
          <Link href="/crear" className={buttonClasses("primary", "sm")}>
            Crear test
          </Link>
        </nav>
      </Container>
    </header>
  );
}
