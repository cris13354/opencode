import { api } from "../api.js"
import { html, mount, toast } from "../dom.js"
import { openForm } from "../forms.js"
import { icon } from "../icons.js"
import { label, options, PILLAR_KEYS, pillarName } from "../state.js"

const FIELDS = ["title", "summary", "pillar", "format", "priority", "status", "refs", "notes"]
const filters = { pillar: "", priority: "", status: "pendiente", q: "" }

export async function render(el, params, ctx) {
  const ideas = await api.list("ideas")
  const draw = () => {
    const query = filters.q.trim().toLowerCase()
    const visible = ideas.filter(
      (idea) =>
        (!filters.pillar || idea.pillar === filters.pillar) &&
        (!filters.priority || idea.priority === filters.priority) &&
        (!filters.status || idea.status === filters.status) &&
        (!query || `${idea.title} ${idea.summary ?? ""} ${idea.notes ?? ""}`.toLowerCase().includes(query)),
    )
    mount(
      el,
      html`<div class="page-head">
          <div>
            <span class="eyebrow">Banco de ideas</span>
            <h1>Ideas</h1>
            <p class="lede">Captura, clasifica y prioriza. Cuando una idea esté lista, conviértela en guion.</p>
          </div>
          <button class="btn btn-primary" data-action="new">${icon("plus")} Nueva idea</button>
        </div>

        <div class="pill-filters" role="group" aria-label="Filtrar por pilar">
          <button data-pillar="" aria-pressed="${!filters.pillar}">Todos <b>${count(ideas, "")}</b></button>
          ${PILLAR_KEYS.map(
            (key) =>
              html`<button data-pillar="${key}" aria-pressed="${filters.pillar === key}">
                ${pillarName(key)} <b>${count(ideas, key)}</b>
              </button>`,
          )}
        </div>

        <div class="toolbar">
          <input type="search" data-filter="q" placeholder="Buscar ideas…" value="${filters.q}" aria-label="Buscar" />
          <select data-filter="priority" aria-label="Prioridad">
            <option value="">Cualquier prioridad</option>
            ${Object.entries(options("ideas", "priority")).map(
              ([key, text]) => html`<option value="${key}" ${filters.priority === key ? "selected" : ""}>${text}</option>`,
            )}
          </select>
          <select data-filter="status" aria-label="Estado">
            <option value="">Cualquier estado</option>
            ${Object.entries(options("ideas", "status")).map(
              ([key, text]) => html`<option value="${key}" ${filters.status === key ? "selected" : ""}>${text}</option>`,
            )}
          </select>
          <span class="spacer"></span>
          <span class="faint small">${visible.length} de ${ideas.length} ideas</span>
        </div>

        ${visible.length
          ? html`<div class="grid grid-cards">${visible.map(card)}</div>`
          : html`<div class="empty"><strong>No hay ideas con estos filtros</strong>Cambia los filtros o crea una idea nueva.</div>`}`,
    )
    el.querySelector('[data-filter="q"]').oninput = (event) => {
      filters.q = event.target.value
      clearTimeout(draw.timer)
      draw.timer = setTimeout(() => {
        draw()
        const input = el.querySelector('[data-filter="q"]')
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
      }, 200)
    }
  }

  const edit = (idea) =>
    openForm({
      title: idea ? "Editar idea" : "Nueva idea",
      entity: "ideas",
      keys: FIELDS,
      item: idea ?? { status: "pendiente", pillar: filters.pillar || undefined },
      onSubmit: async (data) => {
        await (idea ? api.update("ideas", idea.id, data) : api.create("ideas", data))
        toast(idea ? "Idea actualizada" : "Idea creada")
        ctx.refresh()
      },
      onDelete: idea
        ? async () => {
            if (!window.confirm(`¿Eliminar la idea «${idea.title}»?`)) return false
            await api.remove("ideas", idea.id)
            toast("Idea eliminada")
            ctx.refresh()
          }
        : undefined,
    })

  el.onclick = async (event) => {
    const pillar = event.target.closest("[data-pillar]")
    if (pillar) {
      filters.pillar = pillar.dataset.pillar
      return draw()
    }
    const target = event.target.closest("[data-action]")
    if (!target) return
    const idea = ideas.find((item) => item.id === Number(target.dataset.id))
    if (target.dataset.action === "new") return edit()
    if (target.dataset.action === "edit") return edit(idea)
    if (target.dataset.action === "convert") {
      if (!window.confirm(`Se creará un guion a partir de «${idea.title}». ¿Continuar?`)) return
      const video = await api.convertIdea(idea.id).catch((error) => toast(error.message, "error"))
      if (!video) return
      toast("Guion creado")
      location.hash = `#/guiones/${video.id}`
    }
  }
  el.onchange = (event) => {
    const key = event.target.dataset.filter
    if (!key || key === "q") return
    filters[key] = event.target.value
    draw()
  }

  draw()
  if (params[0] === "nueva") {
    history.replaceState(null, "", "#/ideas")
    edit()
  }
}

function count(ideas, pillar) {
  return ideas.filter((idea) => !pillar || idea.pillar === pillar).length
}

function card(idea) {
  return html`<article class="card item">
    <div class="tag-list">
      <span class="badge pillar-${idea.pillar}">${pillarName(idea.pillar)}</span>
      <span class="badge prio-${idea.priority}">${label("ideas", "priority", idea.priority)}</span>
      <span class="badge plain">${label("ideas", "format", idea.format)}</span>
    </div>
    <h3>${idea.title}</h3>
    ${idea.summary ? html`<p>${idea.summary}</p>` : ""}
    ${idea.refs.length ? html`<p class="small faint">${idea.refs.length} referencia${idea.refs.length === 1 ? "" : "s"}</p>` : ""}
    <div class="foot">
      <span class="badge plain ${idea.status === "descartada" ? "status-muted" : idea.status === "en-guion" ? "status-ok" : ""}">
        ${label("ideas", "status", idea.status)}
      </span>
      <span class="spacer"></span>
      <button class="btn btn-sm btn-ghost" data-action="edit" data-id="${idea.id}">${icon("edit")} Editar</button>
      ${idea.video_id
        ? html`<a class="btn btn-sm" href="#/guiones/${idea.video_id}">${icon("guiones")} Abrir guion</a>`
        : idea.status === "descartada"
          ? ""
          : html`<button class="btn btn-sm" data-action="convert" data-id="${idea.id}">${icon("guiones")} Convertir en guion</button>`}
    </div>
  </article>`
}
