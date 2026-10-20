<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Proyecto QuizLab — notas para agentes de IA

- Lee README.md (uso), ARCHITECTURE.md (decisiones técnicas) y PLAN.md (estrategia) antes de cambios grandes.
- La persona propietaria es principiante: código claro, comentarios en español, sin abstracciones innecesarias.
- Todo dato que llegue por URL o localStorage se valida con zod (`src/lib/quiz/schema.ts`, `resolve.ts`, `drafts.ts`).
- Los enlaces `c1.` ya compartidos deben seguir funcionando siempre (no cambiar el formato sin versionarlo).
- Antes de terminar: `npm run check` y `npm run build`; si tocas la interfaz, `npm run test:e2e`.
- No añadir servicios de pago ni dependencias sin justificarlo en PLAN.md (registro de decisiones).
