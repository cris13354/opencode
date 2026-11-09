import { api, ApiError } from "../api.js"
import { download, formatDate, html, mount, toast } from "../dom.js"
import { fieldHtml, openForm, readFields, showErrors } from "../forms.js"
import { icon } from "../icons.js"
import { fieldDef, label, pillarName } from "../state.js"

// Ritmo de locución usado para estimar duraciones. Es una suposición
// orientativa y editable aquí, no un dato medido.
const WORDS_PER_MINUTE = 150
const TEXT_FIELDS = ["hook", "narration", "visual_resources", "onscreen_text", "cta", "sources"]
const META_FIELDS = ["pillar", "format", "stage", "duration"]

export async function render(el, params, ctx) {
  if (params[0]) return editor(el, Number(params[0]), ctx)
  const videos = await api.list("videos")
  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Sala de guion</span>
          <h1>Guiones</h1>
          <p class="lede">Cada guion vive dentro de la ficha de su vídeo. Completa gancho, narración, escenas y llamada a la acción.</p>
        </div>
        <button class="btn btn-primary" data-action="new">${icon("plus")} Nuevo guion</button>
      </div>
      ${videos.length
        ? html`<div class="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Pilar</th>
                  <th>Estado</th>
                  <th>Completado</th>
                  <th class="num">Duración est.</th>
                  <th>Fecha objetivo</th>
                </tr>
              </thead>
              <tbody>
                ${videos.map((video) => {
                  const parts = completeness(video)
                  return html`<tr>
                    <td><a href="#/guiones/${video.id}">${video.title}</a></td>
                    <td><span class="badge pillar-${video.pillar}">${pillarName(video.pillar)}</span></td>
                    <td>${label("videos", "stage", video.stage)}</td>
                    <td class="${parts.done === parts.total ? "status-ok" : "faint"}">${parts.done}/${parts.total} secciones</td>
                    <td class="num">${seconds(estimate(video.narration))}</td>
                    <td>${formatDate(video.due_date)}</td>
                  </tr>`
                })}
              </tbody>
            </table>
          </div>`
        : html`<div class="empty"><strong>Todavía no hay guiones</strong>Crea uno o convierte una idea desde el banco de ideas.</div>`}`,
  )
  el.onclick = (event) => {
    if (event.target.closest("[data-action]")?.dataset.action !== "new") return
    openForm({
      title: "Nuevo guion",
      entity: "videos",
      keys: ["title", "pillar", "format"],
      onSubmit: async (data) => {
        const video = await api.create("videos", { ...data, stage: "guion" })
        location.hash = `#/guiones/${video.id}`
      },
    })
  }
}

async function editor(el, id, ctx) {
  const video = await api.get("videos", id)
  const state = { scenes: video.scenes.map((scene) => ({ ...scene })), dirty: false }
  mount(
    el,
    html`<form class="stack" data-editor novalidate>
      <div class="page-head">
        <div class="grow">
          <a href="#/guiones" class="small">← Todos los guiones</a>
          <label class="field mt" data-field="title">
            <span class="eyebrow">Guion · ${pillarName(video.pillar)}</span>
            <input class="title-input" name="title" maxlength="160" value="${video.title}" aria-label="Título" required />
            <small class="error" hidden></small>
          </label>
        </div>
        <div class="actions">
          <span class="save-state" data-save-state>Guardado</span>
          <button type="button" class="btn" data-action="export">${icon("download")} Exportar .md</button>
          <button type="submit" class="btn btn-primary">Guardar</button>
        </div>
      </div>

      <div class="editor">
        <div class="stack">
          <section class="card">
            <div class="form-grid">${META_FIELDS.map((key) => fieldHtml("videos", key, video[key]))}</div>
          </section>
          <section class="card stack">
            ${fieldHtml("videos", "hook", video.hook)}
            <small class="faint counter" data-count="hook"></small>
            ${fieldHtml("videos", "narration", video.narration)}
            <small class="faint counter" data-count="narration"></small>
          </section>
          <section class="card">
            <div class="card-head">
              <h2>Escenas</h2>
              <button type="button" class="btn btn-sm" data-action="add-scene">${icon("plus")} Añadir escena</button>
            </div>
            <div class="stack" data-scenes></div>
          </section>
          <section class="card stack">
            ${["visual_resources", "onscreen_text", "cta", "sources"].map((key) => fieldHtml("videos", key, video[key]))}
          </section>
        </div>
        <aside class="stack">
          <section class="card" data-summary></section>
          <section class="card">
            <div class="card-head"><h3>Ficha del vídeo</h3></div>
            <p class="small muted">Checklist de calidad, publicaciones vinculadas y tareas.</p>
            <div class="actions mt">
              <a class="btn btn-sm" href="#/produccion/${video.id}">${icon("produccion")} Abrir ficha</a>
              ${video.idea_id ? html`<a class="btn btn-sm btn-ghost" href="#/ideas">${icon("ideas")} Idea de origen</a>` : ""}
            </div>
          </section>
          <p class="faint small">Atajo: Ctrl/⌘ + S para guardar. Duraciones estimadas a ${WORDS_PER_MINUTE} palabras por minuto (suposición orientativa).</p>
        </aside>
      </div>
    </form>`,
  )

  const form = el.querySelector("[data-editor]")
  const saveState = el.querySelector("[data-save-state]")
  const markDirty = (dirty) => {
    state.dirty = dirty
    saveState.textContent = dirty ? "Cambios sin guardar" : "Guardado"
    saveState.classList.toggle("dirty", dirty)
  }

  const drawScenes = () => {
    mount(
      el.querySelector("[data-scenes]"),
      state.scenes.length
        ? state.scenes.map(
            (scene, index) => html`<div class="scene" data-scene="${index}">
              <div class="scene-num">${index + 1}</div>
              <div class="stack">
                <div class="split">
                  <label class="field grow">
                    <span>Qué ocurre / narración de la escena</span>
                    <textarea data-key="description" rows="2" maxlength="2000">${scene.description}</textarea>
                  </label>
                  <div class="scene-tools">
                    <button type="button" class="icon-btn" data-action="scene-up" aria-label="Subir escena" ${index === 0 ? "disabled" : ""}>${icon("up")}</button>
                    <button type="button" class="icon-btn" data-action="scene-down" aria-label="Bajar escena" ${index === state.scenes.length - 1 ? "disabled" : ""}>${icon("down")}</button>
                    <button type="button" class="icon-btn" data-action="scene-remove" aria-label="Eliminar escena">${icon("trash")}</button>
                  </div>
                </div>
                <div class="form-grid">
                  <label class="field"><span>Recurso visual</span><textarea data-key="visual" rows="2" maxlength="2000">${scene.visual}</textarea></label>
                  <label class="field"><span>Texto en pantalla</span><textarea data-key="onscreen" rows="2" maxlength="1000">${scene.onscreen}</textarea></label>
                  <label class="field"><span>Segundos</span><input type="number" data-key="seconds" min="0" max="3600" value="${scene.seconds}" /></label>
                </div>
              </div>
            </div>`,
          )
        : html`<div class="empty"><strong>Sin escenas</strong>Divide la narración en escenas con su recurso visual y su texto en pantalla.</div>`,
    )
  }

  const drawSummary = () => {
    const narration = form.elements.narration.value
    const words = wordCount(narration)
    const sceneSeconds = state.scenes.reduce((sum, scene) => sum + (Number(scene.seconds) || 0), 0)
    const target = Number(form.elements.duration.value) || 0
    const draft = { ...readFields(form, "videos", TEXT_FIELDS), scenes: state.scenes }
    const parts = completeness(draft)
    mount(
      el.querySelector("[data-summary]"),
      html`<div class="card-head"><h3>Resumen</h3><span class="badge plain">${label("videos", "stage", form.elements.stage.value)}</span></div>
        <div class="stat-row"><span>Palabras de narración</span><b>${words}</b></div>
        <div class="stat-row"><span>Duración estimada</span><b>${seconds(estimate(narration))}</b></div>
        <div class="stat-row"><span>Suma de escenas</span><b>${seconds(sceneSeconds)}</b></div>
        <div class="stat-row"><span>Duración objetivo</span><b>${target ? seconds(target) : "—"}</b></div>
        <div class="stat-row"><span>Secciones completas</span><b class="${parts.done === parts.total ? "status-ok" : ""}">${parts.done}/${parts.total}</b></div>
        ${target && estimate(narration) > target * 1.15
          ? html`<p class="small status-warn mt">La narración estimada supera el objetivo. Considera recortar.</p>`
          : ""}`,
    )
    el.querySelector('[data-count="hook"]').textContent = `${form.elements.hook.value.length}/${fieldDef("videos", "hook").max} caracteres`
    el.querySelector('[data-count="narration"]').textContent = `${words} palabras · ≈ ${seconds(estimate(narration))}`
  }

  const save = async () => {
    const data = {
      title: form.elements.title.value,
      ...readFields(form, "videos", [...META_FIELDS, ...TEXT_FIELDS]),
      scenes: state.scenes.map((scene) => ({ ...scene, seconds: Number(scene.seconds) || 0 })),
    }
    await api
      .update("videos", id, data)
      .then(() => {
        showErrors(form, {})
        markDirty(false)
        toast("Guion guardado")
      })
      .catch((error) => {
        if (!(error instanceof ApiError)) throw error
        showErrors(form, error.fields)
        toast(error.message, "error")
      })
  }

  form.oninput = (event) => {
    const sceneEl = event.target.closest("[data-scene]")
    if (sceneEl) {
      const scene = state.scenes[Number(sceneEl.dataset.scene)]
      const key = event.target.dataset.key
      scene[key] = key === "seconds" ? Number(event.target.value) || 0 : event.target.value
    }
    markDirty(true)
    drawSummary()
  }
  form.onchange = () => drawSummary()
  form.onsubmit = (event) => {
    event.preventDefault()
    save()
  }
  form.onclick = (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action
    if (!action) return
    const index = Number(event.target.closest("[data-scene]")?.dataset.scene)
    if (action === "export") {
      if (state.dirty) return toast("Guarda los cambios antes de exportar", "error")
      return download(`/api/videos/${id}/markdown`)
    }
    if (action === "add-scene") state.scenes.push({ description: "", visual: "", onscreen: "", seconds: 0 })
    if (action === "scene-remove") {
      if (!window.confirm(`¿Eliminar la escena ${index + 1}?`)) return
      state.scenes.splice(index, 1)
    }
    if (action === "scene-up") state.scenes.splice(index - 1, 0, ...state.scenes.splice(index, 1))
    if (action === "scene-down") state.scenes.splice(index + 1, 0, ...state.scenes.splice(index, 1))
    markDirty(true)
    drawScenes()
    drawSummary()
    if (action === "add-scene") el.querySelector(`[data-scene="${state.scenes.length - 1}"] textarea`)?.focus()
  }
  el.onkeydown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault()
      save()
    }
  }
  ctx.onLeave((silent) => !state.dirty || (!silent && window.confirm("Hay cambios sin guardar. ¿Salir sin guardar?")))

  drawScenes()
  drawSummary()
}

function wordCount(text) {
  return (text ?? "").trim().split(/\s+/).filter(Boolean).length
}

function estimate(text) {
  return Math.round((wordCount(text) / WORDS_PER_MINUTE) * 60)
}

function seconds(total) {
  if (!total) return "0 s"
  const minutes = Math.floor(total / 60)
  return minutes ? `${minutes} min ${String(total % 60).padStart(2, "0")} s` : `${total} s`
}

function completeness(video) {
  const checks = [video.hook, video.narration, video.scenes?.length, video.visual_resources, video.onscreen_text, video.cta, video.sources]
  return { done: checks.filter((value) => (typeof value === "string" ? value.trim() : value)).length, total: checks.length }
}
