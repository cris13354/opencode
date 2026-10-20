import type { Metadata } from "next";
import { EditorLoader } from "@/components/editor/EditorLoader";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Crea tu test",
  description: "Crea un test de personalidad o de conocimientos gratis y sin registro, y compártelo con un enlace.",
};

export default function CreatePage() {
  return (
    <Container className="max-w-3xl space-y-8 py-10 sm:py-14">
      <div className="space-y-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Crea tu test</h1>
        <p className="text-lg text-ink-soft">
          Gratis y sin registro. Empieza desde una plantilla, pruébalo y comparte el enlace con tu audiencia.
        </p>
      </div>
      <EditorLoader />
    </Container>
  );
}
