/**
 * Estilos de botón reutilizables. Se usan como clase en <button>, <a> o <Link>:
 *   <Link className={buttonClasses("primary")} href="/crear">Crear</Link>
 */
type Variant = "primary" | "secondary" | "ghost" | "dark";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition " +
  "disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary:
    "border-2 border-ink bg-coral text-ink shadow-sticker hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-ink)] active:translate-y-0.5 active:shadow-sticker-sm",
  secondary:
    "border-2 border-ink bg-paper text-ink shadow-sticker-sm hover:-translate-y-0.5 hover:shadow-sticker active:translate-y-0 active:shadow-none",
  dark: "border-2 border-ink bg-ink text-cream shadow-sticker-sm hover:-translate-y-0.5 hover:shadow-sticker active:translate-y-0",
  ghost: "text-ink underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-base",
  lg: "min-h-13 px-7 text-lg",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return [base, variants[variant], variant === "ghost" ? "" : sizes[size], extra].join(" ");
}
