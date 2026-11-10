import { api } from "../api.js"
import { html, mount, toast } from "../dom.js"
import { openForm } from "../forms.js"
import { icon } from "../icons.js"
import { label, options } from "../state.js"

const FIELDS = ["title", "stream", "priority", "status", "hypothesis", "audience", "validation", "criterion", "prerequisites", "evidence", "notes"]

export async function render(el, _params, ctx) {
  const items = await api.list("hypotheses")
  const statuses = options("hypotheses", "status")
  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Planificación empresarial</span>
          <h1>Modelo de negocio</h1>
          <p class="lede">
            Hipótesis de monetización para validar con personas reales. Nada aquí es un hecho ni una previsión de ingresos, y el
            proyecto no implementa pagos ni cobros.
          </p>
        </div>
        <button class="btn btn-primary" data-action="new">${icon("plus")} Nueva hipótesis</button>
      </div>

      <section class="card prose">
        <h2>Cómo validamos</h2>
        <ol>
          <li><strong>Escribir la hipótesis</strong> en formato «Creemos que… para… porque…».</li>
          <li><strong>Fijar el criterio de éxito antes</strong> de lanzar la prueba, con un número y un plazo.</li>
          <li><strong>Probar sin cobrar:</strong> contenido gratuito, descargas, listas de espera o encuestas opcionales.</li>
          <li><strong>Registrar solo evidencia observada</strong> y decidir: validada, descartada o reformulada.</li>
        </ol>
        <p>Antes de cualquier prueba que implique contactar con personas, recoger datos o aceptar patrocinios, se requiere tu autorización expresa y revisar la normativa aplicable.</p>
      </section>

      <div class="kanban mt">
        ${Object.entries(statuses).map(([status, text]) => {
          const column = items.filter((item) => item.status === status)
          return html`<section class="column">
            <div class="column-head"><span>${text}</span><span>${column.length}</span></div>
            ${column.map(
              (item) => html`<article class="vcard" data-id="${item.id}">
                <div class="row"><span class="badge plain">${label("hypotheses", "stream", item.stream)}</span><span class="prio-${item.priority}">${label("hypotheses", "priority", item.priority)}</span></div>
                <a class="title" href="#/negocio" data-id="${item.id}">${item.title}</a>
                ${item.criterion ? html`<p class="small faint">Criterio: ${item.criterion}</p>` : ""}
              </article>`,
            )}
          </section>`
        })}
      </div>`,
  )

  const edit = (item) =>
    openForm({
      title: item ? "Editar hipótesis" : "Nueva hipótesis",
      entity: "hypotheses",
      keys: FIELDS,
      item: item ?? {},
      onSubmit: async (data) => {
        await (item ? api.update("hypotheses", item.id, data) : api.create("hypotheses", data))
        toast(item ? "Hipótesis actualizada" : "Hipótesis creada")
        ctx.refresh()
      },
      onDelete: item
        ? async () => {
            if (!window.confirm(`¿Eliminar «${item.title}»?`)) return false
            await api.remove("hypotheses", item.id)
            ctx.refresh()
          }
        : undefined,
    })

  el.onclick = (event) => {
    if (event.target.closest("[data-action]")?.dataset.action === "new") return edit()
    const id = Number(event.target.closest("[data-id]")?.dataset.id)
    if (!id) return
    event.preventDefault()
    edit(items.find((item) => item.id === id))
  }
}
