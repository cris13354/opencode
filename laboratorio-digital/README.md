# EL LABORATORIO DIGITAL

> **No hablamos de lo que podría funcionar. Lo ponemos a prueba.**

Centro de operaciones de una marca de contenido en español, sin rostro, sobre inteligencia artificial, emprendimiento, negocios digitales, marketing y experimentos tecnológicos.

Incluye:

- **Content Studio**: panel de administración local para gestionar ideas, guiones, producción, calendario, analíticas, biblioteca, estrategia y modelo de negocio.
- **Landing page**: web pública de presentación, lista para publicar más adelante (hoy solo local).
- **Identidad visual**: símbolo, logotipo, paleta, tipografía y tokens de diseño.
- **Contenido inicial**: 30 ideas, 10 guiones completos, calendario de 30 días (3 publicaciones por semana), biblioteca de herramientas y experimentos, 7 hipótesis de monetización.
- **Documentación** completa en [`docs/`](docs/).

Todo funciona en local, sin coste, sin cuentas, sin claves de API y sin dependencias externas.

## Inicio rápido

Requisito único: [Bun](https://bun.sh) 1.1 o superior.

```bash
cd laboratorio-digital
bun run start
```

| Qué | Dónde |
|---|---|
| Landing page | http://localhost:4321/ |
| Content Studio | http://localhost:4321/studio/ |
| Base de datos | `data/laboratorio.db` (se crea con el contenido inicial en el primer arranque) |

Otros comandos:

```bash
bun run dev      # arranca y se reinicia al cambiar el código del servidor
bun run test     # pruebas automáticas de la API (26 pruebas)
bun run backup   # copia consistente de la base de datos en data/backups/
```

Guía detallada: [docs/instalacion.md](docs/instalacion.md).

## Qué puedes hacer en el Studio

| Sección | Funciones |
|---|---|
| **Panel** | Ideas pendientes, vídeos en producción y publicados, publicaciones de los próximos 7 días, estadísticas registradas, pipeline y tareas (con alta rápida). |
| **Ideas** | Crear, editar, clasificar por pilar, formato y prioridad, guardar referencias y **convertir en guion** con un clic. |
| **Guiones** | Editor con título, gancho, narración, escenas (visual, texto en pantalla, segundos), recursos visuales, textos en pantalla, llamada a la acción, fuentes y estado. Recuento de palabras, duración estimada, aviso de cambios sin guardar, Ctrl/⌘+S y exportación a Markdown. |
| **Producción** | Tablero de 7 estados (Idea → Investigación → Guion → Producción → Edición → Revisión → Publicado) con arrastrar y soltar. Ficha por vídeo con checklist de calidad, publicaciones, tareas y notas. Avisa si se publica con la checklist incompleta. |
| **Calendario** | Vistas semanal y mensual, programación por clic, estado de cada publicación, tareas con fecha y contador semanal frente al objetivo de 3. |
| **Analíticas** | Registro manual de visualizaciones, comentarios, compartidos y guardados; comparación entre publicaciones y por pilar; gráficos de evolución; tabla comparativa e historial editable. |
| **Biblioteca** | Recursos, referencias, herramientas (con licencia) y experimentos (hipótesis, método, resultado y estado). |
| **Estrategia** | Pilares con contadores en vivo, ritmo semanal, principios editoriales y estrategia de reutilización. |
| **Modelo de negocio** | Tablero de hipótesis de monetización por estado de validación. |
| **Datos y copias** | Exportar e importar todos los datos en JSON (con copia automática antes de restaurar). |

Guía completa: [docs/guia-de-uso.md](docs/guia-de-uso.md).

## Arquitectura en una frase

Un servidor Bun sin dependencias sirve la landing estática y una API JSON sobre SQLite (`bun:sqlite`); el Studio es JavaScript moderno sin compilación. El esquema de datos se define una sola vez en [`server/schema.ts`](server/schema.ts) y de él salen las tablas, la validación y los formularios.

Detalles: [docs/estructura.md](docs/estructura.md).

## Documentación

| Documento | Contenido |
|---|---|
| [Instalación](docs/instalacion.md) | Requisitos, arranque, configuración, copias y solución de problemas. |
| [Guía de uso](docs/guia-de-uso.md) | Flujo de trabajo semanal y cada sección del Studio. |
| [Estructura del proyecto](docs/estructura.md) | Arquitectura, decisiones técnicas, seguridad y cómo ampliar. |
| [Identidad visual](docs/identidad-visual.md) | Símbolo, logotipo, paleta, tipografía, voz y tono. |
| [Estrategia de contenido](docs/estrategia-contenido.md) | Pilares, 30 ideas, 10 guiones, calendario de 30 días y reutilización. |
| [Guiones](docs/guiones/) | Los 10 guiones exportados a Markdown. |
| [Modelo de negocio](docs/modelo-negocio.md) | Vías de monetización e hipótesis a validar. |
| [Plan de lanzamiento de 30 días](docs/plan-lanzamiento-30-dias.md) | Preparación, semanas 1–5 y criterios de revisión. |
| [Roadmap](docs/roadmap.md) | Fases de desarrollo y lista de mejoras futuras. |
| [Próximos pasos](docs/proximos-pasos.md) | Lo que hay que decidir y hacer ahora. |

## Reglas del proyecto

- No se publica nada, no se abren cuentas, no se gasta dinero y no se contacta con nadie desde esta herramienta.
- No hay estadísticas inventadas: las métricas solo existen si alguien las registra.
- Las hipótesis se presentan como hipótesis; los resultados de los experimentos se dejan como `[PENDIENTE]` hasta ejecutarlos.
- No hay pagos ni cobros implementados.
