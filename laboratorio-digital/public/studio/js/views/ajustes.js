import { api } from "../api.js"
import { download, html, mount, toast } from "../dom.js"
import { icon } from "../icons.js"

export async function render(el, _params, ctx) {
  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Sistema</span>
          <h1>Datos y copias de seguridad</h1>
          <p class="lede">Todo se guarda en una base de datos SQLite local. Nada sale de tu equipo.</p>
        </div>
      </div>

      <div class="grid grid-2">
        <section class="card stack">
          <h2>Exportar</h2>
          <p class="muted">Descarga un archivo JSON con todas las ideas, guiones, publicaciones, métricas, tareas, biblioteca e hipótesis.</p>
          <div><button class="btn btn-primary" data-action="export">${icon("download")} Exportar copia (.json)</button></div>
          <p class="faint small">También puedes crear una copia de la base de datos completa con <code>bun run backup</code>. Se guarda en <code>data/backups/</code>.</p>
        </section>
        <section class="card stack">
          <h2>Restaurar</h2>
          <p class="muted">Sustituye <strong>todos</strong> los datos actuales por los de una copia exportada. Antes de restaurar, el servidor guarda una copia automática en <code>data/backups/</code>.</p>
          <label class="field">
            <span>Archivo de copia (.json)</span>
            <input type="file" accept="application/json,.json" data-restore />
          </label>
        </section>
      </div>

      <section class="card prose mt">
        <h2>Seguridad y privacidad</h2>
        <ul>
          <li>El servidor escucha solo en <code>127.0.0.1</code> y rechaza peticiones con un nombre de host que no sea local.</li>
          <li>Las escrituras exigen JSON desde el mismo origen, lo que impide que otra web modifique tus datos.</li>
          <li>Política de seguridad de contenidos estricta: sin scripts de terceros, sin CDNs ni seguimiento.</li>
          <li>No hay cuentas, claves de API ni servicios externos. Las métricas se introducen a mano.</li>
          <li>El Studio no tiene autenticación: no lo expongas a internet ni a una red compartida.</li>
        </ul>
      </section>`,
  )

  el.onclick = (event) => {
    if (event.target.closest("[data-action]")?.dataset.action === "export") download("/api/backup")
  }
  el.onchange = async (event) => {
    if (!event.target.matches("[data-restore]")) return
    const file = event.target.files[0]
    event.target.value = ""
    if (!file) return
    const parsed = await file
      .text()
      .then(JSON.parse)
      .catch(() => undefined)
    if (!parsed) return toast("El archivo no es un JSON válido", "error")
    const counts = Object.entries(parsed.data ?? {})
      .map(([name, rows]) => `${name}: ${Array.isArray(rows) ? rows.length : 0}`)
      .join(", ")
    if (!window.confirm(`Se reemplazarán todos los datos actuales por esta copia (${counts}). ¿Continuar?`)) return
    await api
      .restore(parsed)
      .then(() => {
        toast("Copia restaurada")
        ctx.refresh()
      })
      .catch((error) => toast(error.message, "error"))
  }
}
