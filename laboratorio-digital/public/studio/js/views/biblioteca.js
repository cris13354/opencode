import { api } from "../api.js"
import { html, mount, toast } from "../dom.js"
import { openForm, readFields } from "../forms.js"
import { icon } from "../icons.js"
import { label, options } from "../state.js"

const BASE_FIELDS = ["kind", "title", "url", "license", "tags", "description"]
const EXPERIMENT_FIELDS = ["exp_status", "hypothesis", "method", "result"]
const filters = { kind: "", q: "" }

export async function render(el, _params, ctx) {
  const items = await api.list("library")
  const kinds = options("library", "kind")
  const draw = () => {
    const query = filters.q.trim().toLowerCase()
    const visible = items.filter(
      (item) =>
        (!filters.kind || item.kind === filters.kind) &&
        (!query || `${item.title} ${item.description ?? ""} ${item.tags ?? ""}`.toLowerCase().includes(query)),
    )
    mount(
      el,
      html`<div class="page-head">
          <div>
            <span class="eyebrow">Conocimiento</span>
            <h1>Biblioteca</h1>
            <p class="lede">Recursos, referencias, herramientas y el registro de cada experimento: hipótesis, método y resultado observado.</p>
          </div>
          <button class="btn btn-primary" data-action="new">${icon("plus")} Añadir</button>
        </div>
        <div class="pill-filters" role="group" aria-label="Filtrar por tipo">
          <button data-kind="" aria-pressed="${!filters.kind}">Todo <b>${items.length}</b></button>
          ${Object.entries(kinds).map(
            ([key, text]) =>
              html`<button data-kind="${key}" aria-pressed="${filters.kind === key}">${text} <b>${items.filter((item) => item.kind === key).length}</b></button>`,
          )}
        </div>
        <div class="toolbar">
          <input type="search" data-search placeholder="Buscar por título, descripción o etiqueta…" value="${filters.q}" aria-label="Buscar" />
        </div>
        ${visible.length
          ? html`<div class="grid grid-cards">${visible.map(card)}</div>`
          : html`<div class="empty"><strong>Nada por aquí</strong>Añade un recurso, una herramienta o documenta un experimento.</div>`}`,
    )
    el.querySelector("[data-search]").oninput = (event) => {
      filters.q = event.target.value
      clearTimeout(draw.timer)
      draw.timer = setTimeout(() => {
        draw()
        const input = el.querySelector("[data-search]")
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
      }, 200)
    }
  }

  // `item` es el registro existente (si se edita); `draft`, valores ya escritos
  // que se conservan al cambiar de tipo y reabrir el formulario.
  const edit = (item, draft = {}) => {
    const values = { ...(item ?? {}), ...draft }
    const kind = values.kind ?? (filters.kind || "recurso")
    const keys = kind === "experimento" ? [...BASE_FIELDS, ...EXPERIMENT_FIELDS] : BASE_FIELDS
    const dialog = openForm({
      title: item ? `Editar ${label("library", "kind", kind).toLowerCase()}` : "Añadir a la biblioteca",
      entity: "library",
      keys,
      item: { ...values, kind, exp_status: kind === "experimento" ? values.exp_status || "planificado" : "" },
      onSubmit: async (data) => {
        const payload = data.kind === "experimento" ? data : { ...data, exp_status: "", hypothesis: "", method: "", result: "" }
        await (item ? api.update("library", item.id, payload) : api.create("library", payload))
        toast(item ? "Elemento actualizado" : "Elemento añadido")
        ctx.refresh()
      },
      onDelete: item
        ? async () => {
            if (!window.confirm(`¿Eliminar «${item.title}»?`)) return false
            await api.remove("library", item.id)
            toast("Elemento eliminado")
            ctx.refresh()
          }
        : undefined,
    })
    // Los campos de experimento solo aparecen para el tipo «Experimento».
    dialog.querySelector('[name="kind"]').onchange = (event) => {
      const current = readFields(dialog.querySelector("form"), "library", keys)
      dialog.close()
      edit(item, { ...current, kind: event.target.value })
    }
  }

  el.onclick = (event) => {
    const kind = event.target.closest("[data-kind]")
    if (kind) {
      filters.kind = kind.dataset.kind
      return draw()
    }
    const action = event.target.closest("[data-action]")
    if (!action) return
    if (action.dataset.action === "new") return edit()
    edit(items.find((item) => item.id === Number(action.dataset.id)))
  }
  draw()
}

function card(item) {
  const tags = (item.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  return html`<article class="card item">
    <div class="tag-list">
      <span class="badge ${item.kind === "experimento" ? "pillar-experimentos" : "plain"}">${label("library", "kind", item.kind)}</span>
      ${item.kind === "experimento" ? html`<span class="badge plain status-info">${label("library", "exp_status", item.exp_status)}</span>` : ""}
    </div>
    <h3>${item.title}</h3>
    ${item.description ? html`<p>${item.description}</p>` : ""}
    ${item.hypothesis ? html`<p><strong>Hipótesis:</strong> ${item.hypothesis}</p>` : ""}
    ${item.kind === "experimento" ? html`<p><strong>Resultado:</strong> ${item.result || "Pendiente de ejecutar."}</p>` : ""}
    ${item.license ? html`<p class="small faint">${item.license}</p>` : ""}
    ${tags.length ? html`<div class="tag-list">${tags.map((tag) => html`<span class="badge plain">#${tag}</span>`)}</div>` : ""}
    <div class="foot">
      ${item.url ? html`<a class="btn btn-sm btn-ghost" href="${item.url}" target="_blank" rel="noopener noreferrer">${icon("external")} Abrir</a>` : ""}
      <span class="spacer"></span>
      <button class="btn btn-sm btn-ghost" data-action="edit" data-id="${item.id}">${icon("edit")} Editar</button>
    </div>
  </article>`
}
