# Roadmap de desarrollo

## Fase 1 · Base operativa — ✅ completada (v0.1)

- Identidad visual: símbolo, logotipo, paleta, tipografía, tokens y guía.
- Content Studio: panel, ideas, guiones, producción (7 estados + checklist), calendario semanal y mensual, analíticas manuales con gráficos, biblioteca, estrategia, modelo de negocio, copias de seguridad.
- Landing page local y responsive.
- Contenido inicial: 30 ideas, 10 guiones, calendario de 30 días, biblioteca e hipótesis.
- API con validación, protecciones de seguridad y 26 pruebas automáticas.

## Fase 2 · Uso real (primer ciclo de 30 días)

Objetivo: usar el Studio a diario y corregir lo que estorbe. Prioridad a lo que pida el uso real.

- [ ] Plantillas de guion por pilar (estructura de experimento, de explicación, de cálculo).
- [ ] Duplicar una publicación para crear derivados de reutilización con un clic.
- [ ] Campo «objetivo de la publicación» (alcance / interés / confianza) y comparación filtrada por objetivo.
- [ ] Vista de teleprompter para leer la narración a pantalla completa.
- [ ] Ritmo de locución configurable desde la interfaz (hoy, 150 palabras/min en el código).
- [ ] Recordatorio en el panel de publicaciones publicadas sin métricas registradas.

## Fase 3 · Análisis y productividad

- [ ] Exportar analíticas a CSV.
- [ ] Importar métricas desde los CSV que exportan las plataformas (sin APIs ni cuentas conectadas).
- [ ] Retención por segundos (si la plataforma la muestra) para el experimento de los tres ganchos.
- [ ] Etiquetas libres en ideas y vídeos; búsqueda global.
- [ ] Historial de cambios de cada guion (versiones).
- [ ] Atajos de teclado para navegar entre secciones.
- [ ] Modo claro opcional.

## Fase 4 · Publicación de la web

Solo cuando se decida publicar, con autorización expresa:

- [ ] Elegir hosting estático gratuito y dominio (decisión y gasto a aprobar).
- [ ] Activar enlaces de redes reales; quitar `noindex`.
- [ ] Sustituir las publicaciones de ejemplo por publicaciones reales (generadas desde el Studio como JSON estático).
- [ ] Página por experimento con sus datos completos.
- [ ] Política de privacidad y aviso legal si se recogen datos.

## Fase 5 · Producto (si se valida la hipótesis)

- [ ] Autenticación local para poder usar el Studio en red doméstica de forma segura.
- [ ] Empaquetado como ejecutable único (`bun build --compile`).
- [ ] Varios proyectos/marcas en la misma instalación.
- [ ] Documentación para terceros y licencia de código abierto.

## Lista de mejoras futuras

Ideas recogidas durante el desarrollo, sin prioridad asignada:

1. Vista de «semana de producción» que cruce tareas, vídeos y publicaciones.
2. Generador de miniaturas con la plantilla de marca (SVG → PNG) dentro del Studio.
3. Exportar un carrusel a imágenes a partir de las escenas del guion.
4. Comprobación automática de enlaces rotos en referencias y biblioteca.
5. Contador de días desde la última publicación de cada pilar para equilibrar el calendario.
6. Recordatorio de copia de seguridad si han pasado más de 7 días.
7. Registro de tiempo invertido por vídeo y fase, para medir el coste real de producción.
8. Integración opcional con un modelo de IA **local** (sin claves ni suscripciones) para sugerir ganchos alternativos.
9. Panel de experimentos con su línea temporal y registro diario.
10. Plantilla de dosier honesto para colaboraciones, generado con datos reales registrados.
