# Estructura del proyecto y arquitectura

## Decisiones técnicas

| Prioridad | Decisión |
|---|---|
| Funcionamiento local | Servidor Bun que escucha en `127.0.0.1`. Sin servicios externos. |
| Coste cero | Sin dependencias de npm, sin hosting, sin APIs de pago ni claves. |
| Persistencia | SQLite integrado en Bun (`bun:sqlite`), modo WAL, claves foráneas activas. Un solo archivo fácil de copiar. |
| Seguridad | Ver [Seguridad](#seguridad). |
| Código limpio | Esquema único del que se derivan tablas, validación y formularios. Vistas pequeñas e independientes. |
| Responsive | CSS propio con rejillas fluidas; probado a 390 px y 1440 px de ancho. |
| Ampliación | Añadir un campo es una línea en `server/schema.ts`; añadir una sección es un archivo en `views/` y una línea en el router. |

**Por qué no un framework.** Un Studio para una sola persona, con decenas o cientos de registros, no necesita React, un ORM ni un bundler. Sin paso de compilación, cualquier cambio se ve recargando la página, y no hay dependencias que actualizar ni vulnerabilidades heredadas.

## Árbol de carpetas

```
laboratorio-digital/
├── package.json            Scripts (start, dev, test, backup). Sin dependencias.
├── bunfig.toml             Configuración de bun test.
├── README.md
├── data/                   Base de datos y copias (ignorado por git).
├── docs/                   Documentación y guiones exportados.
├── server/
│   ├── index.ts            Arranque: abre la BD, carga el contenido inicial y lanza Bun.serve.
│   ├── app.ts              Router HTTP, API JSON, cabeceras de seguridad, copias y archivos estáticos.
│   ├── db.ts               Conexión SQLite, migración aditiva, validación y repositorio genérico.
│   ├── schema.ts           Modelo de datos: entidades, campos, etiquetas y opciones.
│   ├── backup.ts           Copia de seguridad desde la línea de comandos.
│   └── seed/               Contenido inicial.
│       ├── index.ts        Inserta todo validándolo con el mismo esquema que la API.
│       ├── ideas.ts        30 ideas.
│       ├── guiones.ts      10 guiones completos + 3 vídeos en investigación.
│       ├── plan.ts         Calendario de 30 días y tareas.
│       ├── biblioteca.ts   Herramientas, referencias, recursos y experimentos.
│       └── negocio.ts      Hipótesis de monetización.
├── public/
│   ├── index.html          Landing page.
│   ├── landing.css / .js
│   ├── brand/              simbolo.svg, logo-horizontal.svg, favicon.svg, tokens.css
│   └── studio/
│       ├── index.html      Contenedor del Studio.
│       ├── studio.css
│       └── js/
│           ├── app.js      Router por hash, navegación, guardia de cambios sin guardar.
│           ├── api.js      Cliente de la API.
│           ├── dom.js      Plantillas HTML con escape automático, fechas, números, avisos.
│           ├── forms.js    Formularios generados desde el esquema.
│           ├── charts.js   Gráficos SVG propios (barras, líneas, medidor).
│           ├── icons.js    Iconos lineales propios.
│           ├── state.js    Metadatos del esquema servidos por /api/meta.
│           └── views/      Una vista por sección.
└── tests/
    └── api.test.ts         26 pruebas de la API.
```

## Modelo de datos

| Tabla | Qué guarda | Relaciones |
|---|---|---|
| `ideas` | Título, resumen, pilar, formato, prioridad, estado, referencias (JSON), notas. | `video_id` → vídeo creado al convertirla. |
| `videos` | Ficha de producción y guion: estado, gancho, narración, escenas (JSON), recursos, textos, CTA, fuentes, duración, fechas, checklist (JSON). | `idea_id` → idea de origen. |
| `posts` | Publicaciones planificadas: fecha, hora, plataforma, estado, pilar, enlace. | `video_id` → vídeo. |
| `metrics` | Registros manuales: fecha, visualizaciones, comentarios, compartidos, guardados. | `post_id` → publicación (se borran con ella). |
| `tasks` | Tareas con fecha, prioridad y estado. | `video_id` opcional. |
| `library` | Recursos, referencias, herramientas y experimentos. | — |
| `hypotheses` | Hipótesis de monetización y su validación. | — |

Cada tabla tiene además `id`, `created_at` y `updated_at`.

**Migraciones.** Al arrancar, `db.ts` crea las tablas que falten y añade las columnas nuevas del esquema (`ALTER TABLE ADD COLUMN`). Nunca borra columnas ni datos.

## API

Todas las respuestas son JSON salvo la exportación a Markdown.

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/meta` | Esquema con etiquetas y opciones (lo usa el Studio para los formularios). |
| GET | `/api/dashboard` | Resumen del panel. |
| GET | `/api/{entidad}` | Lista. Filtros: `?campo=valor` (enum, referencia, booleano), `?q=texto`, `?from=` / `?to=` (fecha). |
| POST | `/api/{entidad}` | Crear. |
| GET / PATCH / DELETE | `/api/{entidad}/{id}` | Leer, actualizar parcialmente, borrar. |
| POST | `/api/ideas/{id}/convert` | Convertir idea en guion (409 si ya tiene). |
| GET | `/api/videos/{id}/markdown` | Exportar guion. |
| GET | `/api/backup` | Exportar todo. |
| POST | `/api/restore` | Restaurar todo (transaccional; copia previa automática). |

Entidades: `ideas`, `videos`, `posts`, `metrics`, `tasks`, `library`, `hypotheses`.

Los errores de validación devuelven `422` con `{ error, fields: { campo: mensaje } }`.

## Seguridad

| Riesgo | Medida |
|---|---|
| Acceso desde la red | El servidor escucha en `127.0.0.1`; si se cambia `HOST`, avisa al arrancar. |
| DNS rebinding | Se rechaza cualquier petición cuyo host no sea `localhost`, `127.0.0.1` o `[::1]`. |
| CSRF desde otra web | Las escrituras exigen `Content-Type: application/json` (fuerza preflight CORS, que el servidor no autoriza) y un `Origin` igual al del Studio cuando el navegador lo envía. |
| XSS | Todo el HTML se genera con una plantilla que escapa cada valor. CSP estricta: `script-src 'self'`, `style-src 'self'`, sin recursos de terceros. Los enlaces solo admiten `http`/`https`. |
| Inyección SQL | Consultas parametrizadas. Los nombres de tablas y columnas salen únicamente del esquema. |
| Recorrido de rutas | Los archivos estáticos se resuelven y se comprueba que estén dentro de `public/`. |
| Peticiones enormes | Límite de 1 MB (20 MB para restaurar). |
| Pérdida de datos | Restauración en transacción, copia automática previa, `bun run backup` con `VACUUM INTO`. |
| Clickjacking | `X-Frame-Options: DENY` y `frame-ancestors 'none'`. |

El Studio **no tiene autenticación** porque está pensado para un único usuario en su equipo. Si algún día se expone en red, habrá que añadirla primero (ver [roadmap](roadmap.md)).

## Cómo ampliar

**Añadir un campo** (por ejemplo, «miniatura» en vídeos):

1. En `server/schema.ts`, añade `thumbnail: text("Miniatura", 300)` a `videos.fields`.
2. Reinicia el servidor: la columna se crea sola y la API la valida.
3. Para que aparezca en un formulario, añade la clave a la lista de campos de la vista (por ejemplo, `keys` del diálogo «Datos de la ficha» en `views/produccion.js`).

**Añadir una sección:**

1. Crea `public/studio/js/views/mi-seccion.js` exportando `async function render(el, params, ctx)`.
2. Regístrala en `ROUTES` de `public/studio/js/app.js`.

**Añadir una entidad:** defínela en `ENTITIES` (y su nombre en `EntityName`) dentro de `schema.ts`; tendrá tabla y API CRUD automáticamente. Añádela a `RESTORE_ORDER` en `app.ts` para incluirla en las copias.

## Pruebas

`bun run test` cubre: contenido inicial (30 ideas, 10 guiones completos, 13 publicaciones en L-X-V, sin métricas), validación, conversión de ideas, cascadas, panel, filtros, Markdown, copias y restauración, cabeceras y protecciones de seguridad, y migraciones.

La interfaz se verificó en navegador (Chromium) recorriendo todas las secciones en escritorio y móvil, y un flujo completo: crear idea → convertir → editar guion → cambiar estados y checklist → programar → registrar métricas → copia y restauración.
