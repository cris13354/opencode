import { api } from "../api.js"
import { formatDate, html, mount, toast, today } from "../dom.js"
import { meter } from "../charts.js"
import { openForm } from "../forms.js"
import { icon } from "../icons.js"
import { fieldDef, label, pillarName, STAGE_KEYS } from "../state.js"
import { postForm } from "./calendario.js"

export async function render(el, params, ctx) {
  if (params[0]) return sheet(el, Number(params[0]), ctx)
  const [videos, posts] = await Promise.all([api.list("videos"), api.list("posts")])
  const nextPost = (video) =>
    posts.filter((post) => post.video_id === video.id && post.status !== "cancelada").sort((a, b) => a.date.localeCompare(b.date))[0]
  const qaTotal = Object.keys(fieldDef("videos", "qa").items).length
  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Sistema de producción</span>
          <h1>Producción</h1>
          <p class="lede">Del concepto a la publicación en siete estados. Arrastra las tarjetas o usa las flechas para moverlas.</p>
        </div>
        <button class="btn btn-primary" data-action="new">${icon("plus")} Nuevo vídeo</button>
      </div>
      <div class="kanban">
        ${STAGE_KEYS.map((stage) => {
          const items = videos.filter((video) => video.stage === stage)
          return html`<section class="column" data-stage="${stage}" aria-label="${label("videos", "stage", stage)}">
            <div class="column-head"><span>${STAGE_KEYS.indexOf(stage) + 1}. ${label("videos", "stage", stage)}</span><span>${items.length}</span></div>
            ${items.map((video) => {
              const qaDone = Object.values(video.qa).filter(Boolean).length
              const post = nextPost(video)
              return html`<article class="vcard" draggable="true" data-id="${video.id}">
                <a class="title" href="#/produccion/${video.id}">${video.title}</a>
                <div class="row"><span class="badge pillar-${video.pillar}">${pillarName(video.pillar)}</span><span>QA ${qaDone}/${qaTotal}</span></div>
                ${meter(qaDone, qaTotal)}
                <div class="row">
                  <span>${post ? `Publica ${formatDate(post.date)}` : "Sin fecha de publicación"}</span>
                  <span>
                    <button class="icon-btn" data-move="-1" data-id="${video.id}" aria-label="Mover al estado anterior" ${stage === STAGE_KEYS[0] ? "disabled" : ""}>${icon("left")}</button>
                    <button class="icon-btn" data-move="1" data-id="${video.id}" aria-label="Mover al estado siguiente" ${stage === STAGE_KEYS.at(-1) ? "disabled" : ""}>${icon("right")}</button>
                  </span>
                </div>
              </article>`
            })}
          </section>`
        })}
      </div>`,
  )

  const move = async (id, stage) => {
    const video = videos.find((item) => item.id === id)
    if (!video || video.stage === stage) return
    if (!(await changeStage(video, stage))) return
    ctx.refresh()
  }

  el.onclick = (event) => {
    const mover = event.target.closest("[data-move]")
    if (mover) {
      const video = videos.find((item) => item.id === Number(mover.dataset.id))
      return move(video.id, STAGE_KEYS[STAGE_KEYS.indexOf(video.stage) + Number(mover.dataset.move)])
    }
    if (event.target.closest("[data-action]")?.dataset.action !== "new") return
    openForm({
      title: "Nuevo vídeo",
      entity: "videos",
      keys: ["title", "pillar", "format", "stage", "due_date"],
      onSubmit: async (data) => {
        const video = await api.create("videos", data)
        toast("Vídeo creado")
        location.hash = `#/produccion/${video.id}`
      },
    })
  }
  el.ondragstart = (event) => {
    const card = event.target.closest(".vcard")
    if (!card) return
    event.dataTransfer.setData("text/plain", card.dataset.id)
    card.classList.add("dragging")
  }
  el.ondragend = (event) => event.target.closest(".vcard")?.classList.remove("dragging")
  el.ondragover = (event) => {
    const column = event.target.closest(".column")
    if (!column) return
    event.preventDefault()
    el.querySelectorAll(".column.drop").forEach((item) => item !== column && item.classList.remove("drop"))
    column.classList.add("drop")
  }
  el.ondragleave = (event) => {
    if (!event.relatedTarget || !event.target.closest(".column")?.contains(event.relatedTarget))
      event.target.closest(".column")?.classList.remove("drop")
  }
  el.ondrop = (event) => {
    const column = event.target.closest(".column")
    if (!column) return
    event.preventDefault()
    column.classList.remove("drop")
    move(Number(event.dataTransfer.getData("text/plain")), column.dataset.stage)
  }
}

// Cambia el estado de un vídeo. Antes de marcarlo como publicado comprueba la
// checklist de calidad y pide confirmación si está incompleta.
async function changeStage(video, stage) {
  const items = Object.keys(fieldDef("videos", "qa").items)
  const done = items.filter((key) => video.qa[key]).length
  if (
    stage === "publicado" &&
    done < items.length &&
    !window.confirm(`La checklist de calidad está incompleta (${done}/${items.length}). ¿Marcar como publicado igualmente?`)
  )
    return false
  const patch = stage === "publicado" && !video.published_date ? { stage, published_date: today() } : { stage }
  await api.update("videos", video.id, patch)
  toast(`Movido a «${label("videos", "stage", stage)}»`)
  return true
}

async function sheet(el, id, ctx) {
  const [video, posts, tasks, ideas] = await Promise.all([
    api.get("videos", id),
    api.list("posts", { video_id: id }),
    api.list("tasks", { video_id: id }),
    api.list("ideas"),
  ])
  const qaItems = fieldDef("videos", "qa").items
  const qaDone = Object.keys(qaItems).filter((key) => video.qa[key]).length
  const idea = ideas.find((item) => item.id === video.idea_id)
  const current = STAGE_KEYS.indexOf(video.stage)
  mount(
    el,
    html`<div class="page-head">
        <div>
          <a href="#/produccion" class="small">← Tablero de producción</a>
          <span class="eyebrow mt">Ficha de vídeo · ${pillarName(video.pillar)}</span>
          <h1>${video.title}</h1>
        </div>
        <div class="actions">
          <a class="btn" href="#/guiones/${video.id}">${icon("guiones")} Editar guion</a>
          <button class="btn" data-action="edit">${icon("edit")} Datos de la ficha</button>
        </div>
      </div>

      <section class="card">
        <div class="card-head"><h2>Estado de producción</h2><span class="faint small">Haz clic en un estado para cambiarlo</span></div>
        <div class="stepper">
          ${STAGE_KEYS.map(
            (stage, index) =>
              html`<button data-stage="${stage}" class="${index < current ? "past" : index === current ? "current" : ""}" aria-pressed="${index === current}">
                ${label("videos", "stage", stage)}
              </button>`,
          )}
        </div>
      </section>

      <div class="grid grid-2 mt">
        <section class="card">
          <div class="card-head"><h2>Control de calidad</h2><span class="badge plain ${qaDone === Object.keys(qaItems).length ? "status-ok" : ""}">${qaDone}/${Object.keys(qaItems).length}</span></div>
          ${meter(qaDone, Object.keys(qaItems).length)}
          <div class="mt">
            ${Object.entries(qaItems).map(
              ([key, text]) =>
                html`<label class="check"><input type="checkbox" data-qa="${key}" ${video.qa[key] ? "checked" : ""} /> <span>${text}</span></label>`,
            )}
          </div>
        </section>

        <section class="card">
          <div class="card-head"><h2>Datos</h2></div>
          <div class="stat-row"><span>Pilar</span><b>${pillarName(video.pillar)}</b></div>
          <div class="stat-row"><span>Formato</span><b>${label("videos", "format", video.format)}</b></div>
          <div class="stat-row"><span>Duración objetivo</span><b>${video.duration ? `${video.duration} s` : "—"}</b></div>
          <div class="stat-row"><span>Fecha objetivo</span><b>${formatDate(video.due_date)}</b></div>
          <div class="stat-row"><span>Fecha de publicación</span><b>${formatDate(video.published_date)}</b></div>
          <div class="stat-row"><span>Idea de origen</span><b>${idea ? idea.title : "—"}</b></div>
          <div class="stat-row"><span>Guion</span><b>${video.narration ? "Narración escrita" : "Pendiente"} · ${video.scenes.length} escenas</b></div>
        </section>
      </div>

      <div class="grid grid-2 mt">
        <section class="card">
          <div class="card-head">
            <h2>Publicaciones</h2>
            <button class="btn btn-sm" data-action="new-post">${icon("plus")} Programar</button>
          </div>
          ${posts.length
            ? html`<ul class="list">
                ${posts.map(
                  (post) => html`<li>
                    <div class="grow">
                      <div class="title">${formatDate(post.date)} ${post.time ?? ""} · ${label("posts", "platform", post.platform)}</div>
                      <div class="meta">${label("posts", "status", post.status)}${post.url ? html` · <a href="${post.url}" target="_blank" rel="noopener noreferrer">enlace ↗</a>` : ""}</div>
                    </div>
                    <button class="icon-btn" data-post="${post.id}" aria-label="Editar publicación">${icon("edit")}</button>
                  </li>`,
                )}
              </ul>`
            : html`<div class="empty"><strong>Sin publicaciones</strong>Programa la primera desde aquí o desde el calendario.</div>`}
        </section>

        <section class="card">
          <div class="card-head"><h2>Tareas del vídeo</h2></div>
          <form class="toolbar" data-form="task">
            <input type="text" name="title" maxlength="200" placeholder="Nueva tarea…" required aria-label="Nueva tarea" />
            <input type="date" name="due_date" aria-label="Fecha límite" />
            <button class="btn btn-sm" type="submit" aria-label="Añadir tarea">${icon("plus")}</button>
          </form>
          ${tasks.length
            ? html`<ul class="list">
                ${tasks.map(
                  (task) => html`<li class="${task.done ? "done" : ""}">
                    <input type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""} aria-label="Hecha" />
                    <div class="grow"><div class="title">${task.title}</div><div class="meta">${formatDate(task.due_date)}</div></div>
                  </li>`,
                )}
              </ul>`
            : html`<p class="faint small">Sin tareas asociadas.</p>`}
        </section>
      </div>

      <section class="card mt">
        <div class="card-head"><h2>Notas de producción</h2><button class="btn btn-sm" data-action="save-notes">Guardar notas</button></div>
        <textarea data-notes rows="5" maxlength="4000" aria-label="Notas de producción">${video.notes ?? ""}</textarea>
      </section>

      <div class="actions mt-lg">
        <button class="btn btn-ghost btn-danger" data-action="delete">${icon("trash")} Eliminar vídeo</button>
      </div>`,
  )

  const openPost = (post) =>
    postForm({
      post: post ?? { title: video.title, pillar: video.pillar, video_id: video.id, date: today() },
      videos: [video],
      onDone: ctx.refresh,
    })

  el.onclick = async (event) => {
    const stage = event.target.closest("[data-stage]")?.dataset.stage
    if (stage && stage !== video.stage) return (await changeStage(video, stage)) && ctx.refresh()
    const postId = event.target.closest("[data-post]")?.dataset.post
    if (postId) return openPost(posts.find((post) => post.id === Number(postId)))
    const action = event.target.closest("[data-action]")?.dataset.action
    if (action === "new-post") return openPost()
    if (action === "save-notes") {
      await api.update("videos", id, { notes: el.querySelector("[data-notes]").value })
      return toast("Notas guardadas")
    }
    if (action === "edit")
      return openForm({
        title: "Datos de la ficha",
        entity: "videos",
        keys: ["title", "pillar", "format", "duration", "due_date", "published_date"],
        item: video,
        onSubmit: async (data) => {
          await api.update("videos", id, data)
          toast("Ficha actualizada")
          ctx.refresh()
        },
      })
    if (action === "delete") {
      if (!window.confirm(`¿Eliminar «${video.title}» y su guion? Las publicaciones quedarán sin vídeo asociado.`)) return
      await api.remove("videos", id)
      if (idea) await api.update("ideas", idea.id, { status: "pendiente" })
      toast("Vídeo eliminado")
      location.hash = "#/produccion"
    }
  }
  el.onchange = async (event) => {
    const qaKey = event.target.dataset.qa
    if (qaKey) {
      await api.update("videos", id, { qa: { ...video.qa, [qaKey]: event.target.checked } })
      return ctx.refresh()
    }
    const taskId = event.target.dataset.task
    if (taskId) {
      await api.update("tasks", taskId, { done: event.target.checked })
      return ctx.refresh()
    }
  }
  el.onsubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    await api
      .create("tasks", { title: form.elements.title.value, due_date: form.elements.due_date.value, video_id: id })
      .then(ctx.refresh)
      .catch((error) => toast(error.message, "error"))
  }
}
