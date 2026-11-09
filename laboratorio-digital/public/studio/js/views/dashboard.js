import { api } from "../api.js"
import { formatDate, formatNumber, html, mount, parseDate, toast } from "../dom.js"
import { icon } from "../icons.js"
import { label, pillarName, STAGE_KEYS } from "../state.js"

const state = { allTasks: false }

export async function render(el, _params, ctx) {
  const [data, openTasks] = await Promise.all([api.dashboard(), api.list("tasks", { done: "false" })])
  const tasks = state.allTasks ? openTasks : openTasks.slice(0, 8)
  const stageLabels = STAGE_KEYS.map((key) => [key, label("videos", "stage", key)])
  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Centro de operaciones · ${formatDate(data.today, true)}</span>
          <h1>Panel de control</h1>
          <p class="lede">No hablamos de lo que podría funcionar. Lo ponemos a prueba.</p>
        </div>
        <div class="actions">
          <a class="btn" href="#/ideas/nueva">${icon("ideas")} Nueva idea</a>
          <a class="btn btn-primary" href="#/calendario">${icon("calendario")} Calendario</a>
        </div>
      </div>

      <div class="kpis">
        ${kpi("#/ideas", "Ideas pendientes", data.ideas.pending, `${data.ideas.highPriority} de prioridad alta · ${data.ideas.total} en total`)}
        ${kpi("#/produccion", "Vídeos en producción", data.videos.inProduction, "De investigación a revisión")}
        ${kpi("#/produccion", "Vídeos publicados", data.videos.published, `${data.posts.published} publicaciones registradas`)}
        ${kpi("#/calendario", "Próximos 7 días", data.posts.next7, `Publicaciones planificadas · objetivo 3/semana`)}
        ${kpi("#/analiticas", "Métricas registradas", data.metrics.records, `${data.metrics.postsTracked} publicaciones con datos`)}
        ${kpi("#/", "Tareas abiertas", data.tasks.open, data.tasks.overdue ? `${data.tasks.overdue} vencidas` : "Ninguna vencida")}
      </div>

      <section class="card">
        <div class="card-head">
          <h2>Pipeline de producción</h2>
          <a href="#/produccion">Abrir tablero →</a>
        </div>
        <div class="pipeline">
          ${stageLabels.map(
            ([key, text]) =>
              html`<a href="#/produccion" class="${data.videos.stages[key] ? "active" : ""}"><b>${data.videos.stages[key]}</b><small>${text}</small></a>`,
          )}
        </div>
      </section>

      <div class="grid grid-2 mt">
        <section class="card">
          <div class="card-head">
            <h2>Próximas publicaciones</h2>
            <a href="#/calendario">Ver calendario →</a>
          </div>
          ${data.posts.upcoming.length
            ? html`<ul class="list">
                ${data.posts.upcoming.map(
                  (post) => html`<li>
                    ${datePill(post.date)}
                    <div class="grow">
                      <div class="title">${post.title}</div>
                      <div class="meta">${post.time ?? ""} · ${label("posts", "platform", post.platform)}</div>
                    </div>
                    <span class="badge pillar-${post.pillar}">${pillarName(post.pillar)}</span>
                  </li>`,
                )}
              </ul>`
            : html`<div class="empty"><strong>Nada planificado</strong>Programa publicaciones desde el calendario.</div>`}
        </section>

        <section class="card" id="tareas">
          <div class="card-head">
            <h2>Próximas tareas</h2>
            <span class="faint small">${data.tasks.open} abiertas</span>
          </div>
          <form class="toolbar" data-form="task">
            <input type="text" name="title" maxlength="200" placeholder="Nueva tarea…" required aria-label="Nueva tarea" />
            <input type="date" name="due_date" value="${data.today}" aria-label="Fecha límite" />
            <button class="btn btn-sm" type="submit">${icon("plus")} Añadir</button>
          </form>
          ${tasks.length
            ? html`<ul class="list">
                ${tasks.map(
                  (task) => html`<li>
                    <input type="checkbox" data-task="${task.id}" aria-label="Marcar como hecha" />
                    <div class="grow">
                      <div class="title">${task.title}</div>
                      <div class="meta ${task.due_date && task.due_date < data.today ? "overdue" : ""}">
                        ${task.due_date ? formatDate(task.due_date) : "Sin fecha"} · prioridad ${label("tasks", "priority", task.priority)}
                      </div>
                    </div>
                    <button class="icon-btn" data-delete-task="${task.id}" aria-label="Eliminar tarea">${icon("trash")}</button>
                  </li>`,
                )}
              </ul>
              ${openTasks.length > 8
                ? html`<button class="btn btn-sm btn-ghost mt" data-action="toggle-tasks">
                    ${state.allTasks ? "Mostrar menos" : `Mostrar todas (${openTasks.length})`}
                  </button>`
                : ""}`
            : html`<div class="empty"><strong>Sin tareas pendientes</strong>Añade la siguiente acción arriba.</div>`}
        </section>
      </div>

      <div class="grid grid-2 mt">
        <section class="card">
          <div class="card-head">
            <h2>Estadísticas registradas</h2>
            <a href="#/analiticas">Analíticas →</a>
          </div>
          ${data.metrics.records
            ? html`<div class="kpis">
                  ${miniStat("Visualizaciones", data.metrics.views)} ${miniStat("Comentarios", data.metrics.comments)}
                  ${miniStat("Compartidos", data.metrics.shares)} ${miniStat("Guardados", data.metrics.saves)}
                </div>
                <p class="faint small">Suma del último registro de cada publicación. Datos introducidos manualmente.</p>`
            : html`<div class="empty">
                <strong>Aún no hay métricas</strong>
                Cuando publiques, registra visualizaciones, comentarios, compartidos y guardados en Analíticas. El Studio no
                inventa ni estima datos.
              </div>`}
        </section>

        <section class="card">
          <div class="card-head">
            <h2>Ideas prioritarias</h2>
            <a href="#/ideas">Banco de ideas →</a>
          </div>
          ${data.ideas.top.length
            ? html`<ul class="list">
                ${data.ideas.top.map(
                  (idea) => html`<li>
                    <div class="grow">
                      <div class="title">${idea.title}</div>
                      <div class="meta">${label("ideas", "format", idea.format)}</div>
                    </div>
                    <span class="badge prio-${idea.priority}">${label("ideas", "priority", idea.priority)}</span>
                    <span class="badge pillar-${idea.pillar}">${pillarName(idea.pillar)}</span>
                  </li>`,
                )}
              </ul>`
            : html`<div class="empty"><strong>Sin ideas pendientes</strong>Añade nuevas ideas al banco.</div>`}
        </section>
      </div>`,
  )

  el.onsubmit = async (event) => {
    if (event.target.dataset.form !== "task") return
    event.preventDefault()
    const form = event.target
    await api
      .create("tasks", { title: form.elements.title.value, due_date: form.elements.due_date.value })
      .then(() => toast("Tarea añadida"))
      .then(ctx.refresh)
      .catch((error) => toast(error.message, "error"))
  }
  el.onchange = async (event) => {
    const id = event.target.dataset.task
    if (!id) return
    await api.update("tasks", id, { done: event.target.checked })
    toast("Tarea completada")
    ctx.refresh()
  }
  el.onclick = async (event) => {
    if (event.target.closest("[data-action]")?.dataset.action === "toggle-tasks") {
      state.allTasks = !state.allTasks
      return ctx.refresh()
    }
    const id = event.target.closest("[data-delete-task]")?.dataset.deleteTask
    if (!id || !window.confirm("¿Eliminar esta tarea?")) return
    await api.remove("tasks", id)
    ctx.refresh()
  }
}

function kpi(href, title, value, sub) {
  return html`<a class="kpi" href="${href}">
    <div class="kpi-label">${title}</div>
    <div class="kpi-value">${formatNumber(value)}</div>
    <div class="kpi-sub">${sub}</div>
  </a>`
}

function miniStat(title, value) {
  return html`<div class="kpi"><div class="kpi-label">${title}</div><div class="kpi-value">${formatNumber(value)}</div></div>`
}

export function datePill(value) {
  const date = parseDate(value)
  return html`<div class="date-pill">
    <b>${date.getDate()}</b><small>${date.toLocaleDateString("es-ES", { month: "short" }).replace(".", "")}</small>
  </div>`
}
