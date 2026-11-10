import { api } from "../api.js"
import { html, mount } from "../dom.js"
import { PILLAR_KEYS, pillarName } from "../state.js"

// Resumen operativo de la estrategia. El documento completo está en
// docs/estrategia-contenido.md.
const PILLARS = {
  ia: {
    promise: "Entender y usar la inteligencia artificial con criterio: qué hace bien, dónde falla y cómo comprobarlo.",
    formats: "Explicaciones con metáforas visuales, demostraciones en pantalla, rutinas de verificación.",
  },
  negocios: {
    promise: "Ideas y modelos de negocio digitales analizados con números honestos y sin promesas fáciles.",
    formats: "Cálculos con ejemplos ficticios declarados, métodos paso a paso, desmontaje de mitos.",
  },
  marketing: {
    promise: "Marketing aplicable para proyectos pequeños: ganchos, métricas útiles y reutilización de contenido.",
    formats: "Antes y después, plantillas, criterios para decidir con datos propios.",
  },
  experimentos: {
    promise: "La seña de identidad: ponemos a prueba herramientas y métodos, con reglas fijadas antes y resultados tal como salen.",
    formats: "Series de varios días, auditorías, comparativas con rúbrica publicada.",
  },
}

const REUSE = [
  ["Pieza madre", "Guion completo de vídeo vertical (60–90 s). Es la fuente de todo lo demás."],
  ["Vídeo vertical", "Se publica la misma pieza en las plataformas elegidas, adaptando solo texto y etiquetas."],
  ["Carrusel", "Las escenas del guion se convierten en diapositivas: una idea por diapositiva."],
  ["Hilo / texto", "La narración se reescribe en mensajes cortos con la conclusión al principio."],
  ["Newsletter", "Versión ampliada con fuentes, datos completos del experimento y lo que no cupo en el vídeo."],
  ["Versión larga", "Se agrupan 3–4 piezas del mismo pilar en un vídeo horizontal recopilatorio."],
  ["Clip de cita", "La frase más clara del guion, sola, como pieza breve de refuerzo."],
  ["Pregunta a la comunidad", "Se transforma la conclusión en una pregunta abierta para recoger ideas de nuevos experimentos."],
]

export async function render(el) {
  const [ideas, videos, posts] = await Promise.all([api.list("ideas"), api.list("videos"), api.list("posts")])
  const count = (items, pillar) => items.filter((item) => item.pillar === pillar).length
  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Estrategia de contenido</span>
          <h1>Cuatro pilares, tres publicaciones por semana</h1>
          <p class="lede">Una marca sin rostro que gana confianza con método: hipótesis claras, pruebas reales y resultados sin maquillar.</p>
        </div>
      </div>

      <div class="grid grid-cards">
        ${PILLAR_KEYS.map(
          (key) => html`<article class="card item pillar-card pillar-${key}">
            <h3>${pillarName(key)}</h3>
            <p>${PILLARS[key].promise}</p>
            <p class="small"><strong>Formatos:</strong> ${PILLARS[key].formats}</p>
            <div class="counts">
              <span><b>${count(ideas, key)}</b> ideas</span>
              <span><b>${count(videos, key)}</b> vídeos</span>
              <span><b>${count(posts, key)}</b> publicaciones</span>
            </div>
          </article>`,
        )}
      </div>

      <div class="grid grid-2 mt">
        <section class="card prose">
          <h2>Ritmo semanal</h2>
          <ul>
            <li><strong>Lunes</strong> — pieza de valor práctico (IA o negocios) para arrancar la semana.</li>
            <li><strong>Miércoles</strong> — pilar que lleve más tiempo sin aparecer, para mantener el equilibrio.</li>
            <li><strong>Viernes</strong> — experimento o pieza más ligera de cierre.</li>
          </ul>
          <p>El calendario marca cada semana con su total respecto al objetivo de 3. Si una semana no llega, se aplaza una pieza; no se publica algo que no haya pasado la checklist de calidad.</p>
        </section>
        <section class="card prose">
          <h2>Principios editoriales</h2>
          <ul>
            <li><strong>No inventamos resultados.</strong> Un experimento sin ejecutar lleva «[PENDIENTE]», no un dato plausible.</li>
            <li><strong>Hipótesis ≠ hecho.</strong> Lo que creemos se dice como creencia y se pone a prueba.</li>
            <li><strong>Criterio antes que datos.</strong> El umbral de éxito se fija antes de mirar los resultados.</li>
            <li><strong>Fuentes visibles.</strong> Cada dato del guion tiene su fuente en la ficha.</li>
            <li><strong>Permisos claros.</strong> Ningún recurso visual sin licencia registrada.</li>
          </ul>
        </section>
      </div>

      <section class="card mt">
        <div class="card-head"><h2>Estrategia de reutilización: una idea, ocho piezas</h2></div>
        <div class="table-wrap"><table>
          <thead><tr><th>#</th><th>Pieza</th><th>Cómo se obtiene</th></tr></thead>
          <tbody>${REUSE.map(([name, how], index) => html`<tr><td class="mono faint">${index}</td><td><strong>${name}</strong></td><td class="muted">${how}</td></tr>`)}</tbody>
        </table></div>
        <p class="faint small mt">Regla: solo se reutiliza lo que ya se ha publicado y revisado. Cada derivado se programa como una publicación más en el calendario, vinculada al mismo vídeo.</p>
      </section>`,
  )
}
