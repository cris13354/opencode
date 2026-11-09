import { api } from "../api.js"
import { addDays, formatDate, html, isoDate, mount, parseDate, startOfWeek, toast, today } from "../dom.js"
import { openForm } from "../forms.js"
import { icon } from "../icons.js"
import { label, options, PILLAR_KEYS, pillarName } from "../state.js"

const WEEKLY_GOAL = 3
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const POST_FIELDS = ["title", "date", "time", "platform", "status", "pillar", "video_id", "url", "notes"]
const view = { mode: readMode(), cursor: today() }

export async function render(el, _params, ctx) {
  const anchor = parseDate(view.cursor)
  const month = view.mode === "month"
  const first = startOfWeek(month ? new Date(anchor.getFullYear(), anchor.getMonth(), 1) : anchor)
  const last = month ? addDays(startOfWeek(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)), 6) : addDays(first, 6)
  const weeks = (Math.round((last - first) / 86_400_000) + 1) / 7
  const [posts, tasks, videos] = await Promise.all([
    api.list("posts", { from: isoDate(first), to: isoDate(last) }),
    api.list("tasks", { from: isoDate(first), to: isoDate(last), done: "false" }),
    api.list("videos"),
  ])
  const heading =
    view.mode === "month"
      ? anchor.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
      : `Semana del ${formatDate(isoDate(first))} al ${formatDate(isoDate(last))}`
  const now = today()

  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Calendario editorial</span>
          <h1>${heading.charAt(0).toUpperCase() + heading.slice(1)}</h1>
          <p class="lede">Objetivo: ${WEEKLY_GOAL} publicaciones por semana. Haz clic en un día para programar.</p>
        </div>
        <div class="actions">
          <div class="segmented" role="group" aria-label="Vista">
            <button data-mode="week" aria-pressed="${view.mode === "week"}">Semana</button>
            <button data-mode="month" aria-pressed="${view.mode === "month"}">Mes</button>
          </div>
          <button class="icon-btn" data-nav="-1" aria-label="Anterior">${icon("left")}</button>
          <button class="btn btn-sm" data-nav="0">Hoy</button>
          <button class="icon-btn" data-nav="1" aria-label="Siguiente">${icon("right")}</button>
          <button class="btn btn-primary" data-action="new">${icon("plus")} Programar</button>
        </div>
      </div>

      <div class="calendar">
        <div class="cal-head">${DAYS.map((day) => html`<div>${day}</div>`)}<div title="Publicaciones de la semana">Total</div></div>
        ${Array.from({ length: weeks }, (_, week) => {
          const days = Array.from({ length: 7 }, (_, offset) => isoDate(addDays(first, week * 7 + offset)))
          const weekPosts = posts.filter((post) => days.includes(post.date) && post.status !== "cancelada").length
          return html`<div class="cal-week ${view.mode === "week" ? "week-view" : ""}">
            ${days.map((day) => {
              const date = parseDate(day)
              return html`<div class="cal-day ${view.mode === "month" && date.getMonth() !== anchor.getMonth() ? "other" : ""} ${day === now ? "today" : ""}" data-day="${day}">
                <span class="num">${view.mode === "week" ? html`${DAYS[(date.getDay() + 6) % 7]} ` : ""}${date.getDate()}</span>
                ${posts
                  .filter((post) => post.date === day)
                  .map(
                    (post) => html`<button class="event pillar-${post.pillar} st-${post.status}" data-post="${post.id}" title="${post.title} · ${label("posts", "status", post.status)}">
                      <span>${post.time ? `${post.time} ` : ""}${post.title}</span>
                    </button>`,
                  )}
                ${tasks
                  .filter((task) => task.due_date === day)
                  .map(
                    (task) =>
                      html`<a class="event task" href="${task.video_id ? `#/produccion/${task.video_id}` : "#/"}" title="Tarea: ${task.title}"><span>☐ ${task.title}</span></a>`,
                  )}
              </div>`
            })}
            <div class="cal-week-total ${weekPosts >= WEEKLY_GOAL ? "met" : ""}" title="Publicaciones planificadas esta semana">${weekPosts}/${WEEKLY_GOAL}</div>
          </div>`
        })}
      </div>

      <div class="legend">
        ${PILLAR_KEYS.map((key) => html`<span class="badge pillar-${key}">${pillarName(key)}</span>`)}
        <span>✓ Publicada</span><span>● Lista</span><span>⏸ Aplazada</span><span>☐ Tarea</span>
      </div>

      <section class="card mt">
        <div class="card-head"><h2>Publicaciones del periodo</h2><span class="faint small">${posts.length} en total</span></div>
        ${posts.length
          ? html`<div class="table-wrap"><table>
              <thead><tr><th>Fecha</th><th>Título</th><th>Plataforma</th><th>Pilar</th><th>Estado</th></tr></thead>
              <tbody>
                ${posts.map(
                  (post) => html`<tr>
                    <td>${formatDate(post.date)} ${post.time ?? ""}</td>
                    <td><button class="btn btn-sm btn-ghost" data-post="${post.id}">${post.title}</button></td>
                    <td>${label("posts", "platform", post.platform)}</td>
                    <td><span class="badge pillar-${post.pillar}">${pillarName(post.pillar)}</span></td>
                    <td>
                      <select data-status="${post.id}" aria-label="Estado">
                        ${Object.entries(options("posts", "status")).map(
                          ([key, text]) => html`<option value="${key}" ${key === post.status ? "selected" : ""}>${text}</option>`,
                        )}
                      </select>
                    </td>
                  </tr>`,
                )}
              </tbody>
            </table></div>`
          : html`<div class="empty"><strong>Sin publicaciones en este periodo</strong>Haz clic en un día para programar una.</div>`}
      </section>`,
  )

  el.onclick = (event) => {
    const mode = event.target.closest("[data-mode]")?.dataset.mode
    if (mode) {
      view.mode = mode
      saveMode(mode)
      return ctx.refresh()
    }
    const nav = event.target.closest("[data-nav]")?.dataset.nav
    if (nav !== undefined) {
      const step = Number(nav)
      view.cursor = !step
        ? today()
        : isoDate(view.mode === "month" ? new Date(anchor.getFullYear(), anchor.getMonth() + step, 1) : addDays(anchor, step * 7))
      return ctx.refresh()
    }
    if (event.target.closest("a.event")) return
    const postId = event.target.closest("[data-post]")?.dataset.post
    if (postId) return postForm({ post: posts.find((post) => post.id === Number(postId)), videos, onDone: ctx.refresh })
    if (event.target.closest("[data-action]")?.dataset.action === "new")
      return postForm({ post: { date: now }, videos, onDone: ctx.refresh })
    const day = event.target.closest("[data-day]")?.dataset.day
    if (day) postForm({ post: { date: day }, videos, onDone: ctx.refresh })
  }
  el.onchange = async (event) => {
    const id = event.target.dataset.status
    if (!id) return
    await api.update("posts", id, { status: event.target.value })
    toast("Estado actualizado")
    ctx.refresh()
  }
}

// Formulario de publicación reutilizado desde la ficha de producción.
export function postForm({ post, videos, onDone }) {
  const existing = post.id !== undefined
  return openForm({
    title: existing ? "Editar publicación" : "Programar publicación",
    entity: "posts",
    keys: POST_FIELDS,
    item: post,
    refs: { video_id: videos },
    intro: existing ? "" : "Planificar no publica nada: el Studio solo organiza. La publicación real la haces tú en cada plataforma.",
    onSubmit: async (data) => {
      const video = videos.find((item) => item.id === data.video_id)
      const payload = { ...data, title: data.title || video?.title || "" }
      await (existing ? api.update("posts", post.id, payload) : api.create("posts", payload))
      toast(existing ? "Publicación actualizada" : "Publicación programada")
      onDone()
    },
    onDelete: existing
      ? async () => {
          if (!window.confirm("¿Eliminar esta publicación? Se borrarán también sus métricas registradas.")) return false
          await api.remove("posts", post.id)
          toast("Publicación eliminada")
          onDone()
        }
      : undefined,
  })
}

function readMode() {
  try {
    return localStorage.getItem("lab.calendar.mode") === "week" ? "week" : "month"
  } catch {
    return "month"
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem("lab.calendar.mode", mode)
  } catch {
    // Preferencia opcional: si el navegador bloquea el almacenamiento no pasa nada.
  }
}
