# Guía de uso del Content Studio

El Studio es el centro de operaciones de la marca: aquí nace cada idea, se escribe su guion, se produce, se programa y se mide. Entra en http://localhost:4321/studio/ con el servidor en marcha.

## El flujo completo de un vídeo

```
Idea ──► Guion ──► Producción (7 estados + checklist) ──► Calendario ──► Analíticas
 │                                                                      │
 └──────────── Biblioteca (fuentes, herramientas, experimentos) ◄───────┘
```

1. **Ideas** → crea la idea, asígnale pilar, formato y prioridad, y guarda referencias.
2. **Convertir en guion** → se crea el vídeo en estado «Guion», con las referencias copiadas a «Fuentes».
3. **Guiones** → escribe gancho, narración y escenas. El resumen lateral avisa si la narración estimada supera la duración objetivo.
4. **Producción** → mueve el vídeo por los estados y completa la checklist de calidad.
5. **Calendario** → programa una o varias publicaciones (una por plataforma o por derivado).
6. Publicas **tú** en cada plataforma. El Studio no publica nada.
7. Marca la publicación como **Publicada** (calendario o ficha) y añade el enlace.
8. **Analíticas** → registra las métricas en varias fechas para ver su evolución.

## Rutina semanal recomendada

| Cuándo | Qué |
|---|---|
| Lunes (30 min) | Panel: revisa tareas vencidas y publicaciones de la semana. Calendario: confirma que hay 3. |
| Martes y jueves | Producción: avanza los vídeos de la semana siguiente y completa su checklist. |
| Viernes | Ideas: añade ideas nuevas a partir de comentarios y resultados. Prioriza. |
| Domingo (15 min) | Analíticas: registra las métricas acumuladas de cada publicación de la semana. Exporta una copia. |

## Secciones

### Panel

Resumen de todo: ideas pendientes (y cuántas de prioridad alta), vídeos en producción (de Investigación a Revisión), vídeos publicados, publicaciones de los próximos 7 días, métricas registradas y tareas abiertas. Cada indicador lleva a su sección.

- **Pipeline**: cuántos vídeos hay en cada uno de los 7 estados.
- **Próximas tareas**: añade tareas con fecha (por defecto, hoy) y márcalas como hechas con la casilla.
- **Estadísticas registradas**: suma del último registro de cada publicación. Si no hay registros, lo dice; nunca muestra datos de ejemplo.

### Ideas

- Filtra por pilar (botones superiores), prioridad, estado o texto.
- Por defecto se muestran las pendientes; cambia el filtro de estado para ver las convertidas o descartadas.
- **Referencias**: pares descripción + enlace. Solo se aceptan enlaces `http` o `https`.
- **Convertir en guion**: solo una vez por idea. Después, el botón cambia a «Abrir guion».
- Para descartar una idea sin borrarla, cambia su estado a «Descartada».

### Guiones

- La lista muestra cuántas secciones están completas (gancho, narración, escenas, recursos, textos, CTA y fuentes) y la duración estimada.
- En el editor:
  - **Escenas**: añade, reordena (flechas) o elimina. Cada escena tiene descripción, recurso visual, texto en pantalla y segundos.
  - **Duración estimada**: se calcula a 150 palabras por minuto. Es una suposición orientativa, no una medida; mide tu propia locución y ajústala en `public/studio/js/views/guiones.js` si hace falta.
  - **Guardar**: botón o `Ctrl/⌘ + S`. Si intentas salir con cambios sin guardar, el Studio pregunta.
  - **Exportar .md**: descarga el guion en Markdown (para compartir, imprimir o usar como teleprompter).
- Los guiones de experimento llevan `[PENDIENTE]` donde irán los resultados. No los publiques hasta sustituirlos por datos reales.

### Producción

- **Tablero**: arrastra las tarjetas entre columnas o usa las flechas ‹ › de cada tarjeta (útil en móvil y con teclado).
- Cada tarjeta muestra el progreso de la checklist de calidad y la próxima fecha de publicación.
- **Ficha del vídeo** (clic en el título):
  - Cambia el estado haciendo clic en el paso correspondiente.
  - **Checklist de calidad**: se guarda al marcar cada punto.
    1. ¿El gancho es interesante?
    2. ¿La información está contrastada?
    3. ¿El vídeo aporta algo original?
    4. ¿Los recursos visuales tienen los permisos necesarios?
    5. ¿Los subtítulos son legibles?
    6. ¿La narración es clara?
    7. ¿La conclusión aporta valor?
  - Al pasar a **Publicado** con la checklist incompleta, el Studio pide confirmación. La fecha de publicación se rellena sola si estaba vacía.
  - **Publicaciones**: programa publicaciones de este vídeo (por ejemplo, el vertical y sus derivados).
  - **Tareas** y **notas de producción** propias del vídeo.

### Calendario

- **Mes** o **Semana**, con flechas para navegar y «Hoy» para volver.
- Clic en un día vacío → programar publicación en esa fecha. Clic en una publicación → editarla o eliminarla.
- La columna **Total** muestra cuántas publicaciones hay en la semana frente al objetivo de 3 (en verde si se cumple).
- Las tareas con fecha aparecen en gris punteado (en la vista mensual de móvil se ocultan para ganar espacio).
- Debajo, la tabla del periodo permite cambiar el estado de cada publicación rápidamente: Planificada, Lista para publicar, Publicada, Aplazada o Cancelada.

### Analíticas

- Solo se pueden registrar métricas de publicaciones con estado **Publicada**.
- Introduce los valores **acumulados** que muestra la plataforma en la fecha del registro (no la diferencia). Registra la misma publicación varias veces para ver su evolución.
- **Comparar publicaciones**: barras con el último registro de cada publicación; elige la métrica o la interacción calculada.
- **Media por pilar**: útil solo con varias publicaciones por pilar; el Studio lo recuerda.
- **Evolución**: cuatro gráficos (uno por métrica) de la publicación elegida.
- **Historial**: cada registro se puede editar o eliminar.

### Biblioteca

- Tipos: **Recurso**, **Referencia**, **Herramienta** y **Experimento**.
- Las herramientas guardan coste/licencia. Compruébalo siempre en la web oficial antes de usar algo en un vídeo.
- Los experimentos tienen hipótesis, método, resultado y estado (planificado, en curso, concluido). El resultado se deja vacío hasta ejecutar el experimento.
- Al cambiar el tipo en el formulario, aparecen u ocultan los campos de experimento sin perder lo escrito.

### Estrategia

Pilares con contadores en vivo de ideas, vídeos y publicaciones; ritmo semanal; principios editoriales; y la estrategia de reutilización (una idea, ocho piezas). Documento completo: [estrategia-contenido.md](estrategia-contenido.md).

### Modelo de negocio

Tablero de hipótesis de monetización por estado: Sin validar → En validación → Validada / Descartada. Cada hipótesis tiene vía, público, método de validación, **criterio de éxito fijado antes**, requisitos y evidencia. Ver [modelo-negocio.md](modelo-negocio.md).

### Datos y copias

Exportar todo a JSON y restaurar desde un JSON. Ver [instalacion.md](instalacion.md#copias-de-seguridad).

## Buenas prácticas

- Escribe el objetivo de cada publicación (alcance, interés o confianza) en sus notas antes de publicar.
- Registra métricas siempre en el mismo momento relativo (por ejemplo, a los 2 y a los 7 días) para que las comparaciones sean justas.
- Usa la Biblioteca para guardar la licencia de cada música, imagen o voz sintética que uses.
- Exporta una copia cada semana.
