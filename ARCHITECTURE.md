# Arquitectura de QuizLab

## Decisiones principales (y por qué)

| Decisión | Motivo | Coste de cambiarla después |
| --- | --- | --- |
| **Next.js 16 + TypeScript + Tailwind** | Estándar moderno, gratis, despliegue en un clic en Vercel, muy bien soportado por herramientas de IA. | — |
| **Sin base de datos ni cuentas en el MVP** | Coste 0 €, nada que configurar, sin datos personales que proteger. Suficiente para validar si la gente crea y comparte tests. | Medio: al añadir Supabase, los enlaces antiguos `c1.` deben seguir funcionando (el código ya lo permite: `resolveQuiz` decide por el prefijo). |
| **El test viaja dentro del enlace** (`/t/c1.<datos>`) | Es la forma más sencilla de «publicar» sin servidor. | Los enlaces son largos (1–5 KB) y no se pueden editar una vez compartidos. Se resolverá con enlaces cortos + base de datos (TODO P1). |
| **Validación con zod en un único esquema** | Todo lo que llega por URL (tests, nombres, puntuaciones) se valida en un solo sitio (`schema.ts`, `resolve.ts`). El mismo esquema genera los mensajes de error del editor. | — |
| **Imágenes PNG con `next/og`** | Las tarjetas son el motor de crecimiento (vista previa al compartir + Stories). Se generan en el servidor sin servicios externos. | — |
| **Emojis y fuente incluidos en el proyecto** | `next/og` descarga los emojis de un CDN externo por defecto; los incluimos (`@twemoji/svg`) para no depender de terceros. | — |
| **Umami para analítica (opcional)** | Sin cookies, sin datos personales, plan gratuito. Se activa con una variable de entorno. | Bajo: todo pasa por `track()` en `src/lib/analytics.ts`. |

## Flujo de datos

```
                          ┌──────────────── navegador ────────────────┐
 Creador ── /crear ──▶ QuizEditor ──(zod)──▶ encodeQuiz ──▶ enlace /t/c1.XXXX
                          │ borrador → localStorage                    │
                          └────────────────────────────────────────────┘

 Jugador ── /t/<ref> ──▶ servidor: resolveQuiz(ref)
                              ├─ "emprendedor"  → catálogo (catalog.ts)
                              └─ "c1.XXXX"      → decodeQuiz → zod → Quiz | 404
                        ──▶ QuizPlayer (navegador) → computeOutcome
                        ──▶ /t/<ref>/r/<n>?s=<aciertos>&n=<nombre>

 Amigo (WhatsApp/X) ──▶ lee <meta og:image> = /api/card?ref=…&r=…&s=…&n=…
                        ──▶ ImageResponse (PNG 1200×630 o 1080×1920)
```

Las respuestas de los jugadores **nunca** salen del navegador.

## Modelo de datos

Un test (`Quiz`, ver `src/lib/quiz/schema.ts`):

```ts
{
  v: 1,                          // versión del formato
  kind: "personality" | "trivia",
  title: string,                 // ≤ 80
  description: string,           // ≤ 200
  emoji: string,
  color: "coral" | "violet" | "blue" | "green" | "yellow",
  author?: string,               // ≤ 40
  results: [                     // 2–6
    { title, description, emoji, min? }   // min: aciertos mínimos (solo trivia)
  ],
  questions: [                   // 1–15
    {
      text,                      // ≤ 140
      correct?: number,          // índice de la respuesta correcta (solo trivia)
      answers: [ { text, result? } ]   // 2–4; result: índice del resultado (solo personalidad)
    }
  ]
}
```

Reglas cruzadas (en `superRefine`): en personalidad cada respuesta apunta a un resultado existente; en conocimientos cada pregunta tiene respuesta correcta, un resultado empieza en 0 aciertos y los mínimos no se repiten.

### Formato del enlace

`c1.` + base64url( deflate-raw( JSON ) ). Límites de seguridad: 6000 caracteres codificados y 32 KB descomprimidos (protege frente a «bombas» de compresión). Un test del tamaño máximo ocupa menos de 6000 caracteres (hay una prueba que lo comprueba).

## Rutas

| Ruta | Tipo | Notas |
| --- | --- | --- |
| `/` | Estática | Landing |
| `/t/[ref]` | Estática para el catálogo, bajo demanda para tests personalizados | `generateStaticParams` + `<Suspense>` (Cache Components) |
| `/t/[ref]/r/[result]` | Dinámica (lee `searchParams`) | Metadatos Open Graph con la imagen de la tarjeta; `noindex` |
| `/api/card` | Dinámica | PNG cacheable (`Cache-Control` largo: la imagen depende solo de la URL) |
| `/crear` | Estática + cliente | Todo el editor se ejecuta en el navegador |
| `/precios`, `/privacidad` | Estáticas | |

## Seguridad

- Toda entrada externa (ruta, parámetros, localStorage) se valida con zod o funciones de limpieza (`cleanName`, `parseResultIndex`, `parseShareParams`).
- React escapa todo el texto; no se usa `dangerouslySetInnerHTML`.
- Los nombres de archivo de emojis se construyen solo con `[0-9a-f-]` (sin riesgo de rutas manipuladas).
- Cabeceras de seguridad básicas en `next.config.ts` (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- No hay secretos en el proyecto. Todas las variables son públicas (`NEXT_PUBLIC_*`) y opcionales.
- Los tests de usuarios llevan un aviso de «contenido no revisado» y `noindex`.

**Riesgos conocidos** (ver TODO.md): abuso del dominio con tests ofensivos o engañosos (no hay moderación ni forma de bloquear un enlace concreto todavía) y uso intensivo de `/api/card` (generar PNG consume CPU; conviene limitar peticiones si hay abuso).

## Cómo evolucionar a base de datos (cuando haga falta)

1. Crear proyecto gratuito en Supabase y una tabla:
   ```sql
   create table quizzes (
     id text primary key,              -- id corto, p. ej. 8 caracteres
     owner_id uuid references auth.users,
     data jsonb not null,              -- el mismo objeto Quiz validado con zod
     blocked boolean not null default false,
     created_at timestamptz not null default now(),
     updated_at timestamptz not null default now()
   );
   alter table quizzes enable row level security;
   create policy "lectura pública" on quizzes for select using (not blocked);
   create policy "el dueño edita" on quizzes for all using (auth.uid() = owner_id);
   ```
2. En `resolveQuiz`, añadir un tercer caso: refs cortas → buscar en la tabla.
3. Mantener el caso `c1.` para que los enlaces ya compartidos sigan funcionando.
