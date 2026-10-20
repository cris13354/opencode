import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="max-w-xl space-y-6 py-20 text-center">
      <p aria-hidden className="text-6xl">🧪</p>
      <h1 className="font-display text-4xl font-extrabold tracking-tight">Este experimento no existe</h1>
      <p className="text-lg text-ink-soft">
        Puede que el enlace esté incompleto (pasa a veces al copiarlo) o que el test ya no exista.
      </p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className={buttonClasses("primary")}>Ir al inicio</Link>
        <Link href="/crear" className={buttonClasses("secondary")}>Crear un test</Link>
      </div>
    </Container>
  );
}
