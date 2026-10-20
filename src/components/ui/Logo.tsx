import Link from "next/link";

/** Logotipo: un matraz de laboratorio dentro de una "pegatina" + nombre. */
export function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-lg border-2 border-ink bg-lime shadow-sticker-sm transition group-hover:-rotate-6"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" />
          <path d="M7.5 15h9" />
        </svg>
      </span>
      QuizLab
    </Link>
  );
}
