import { api, ApiError } from "../api.js"
import { barList, lineChart } from "../charts.js"
import { formatDate, formatNumber, formatPercent, html, mount, toast, today } from "../dom.js"
import { openForm, showErrors } from "../forms.js"
import { icon } from "../icons.js"
import { label, PILLAR_KEYS, pillarName } from "../state.js"

const METRICS = [
  ["views", "Visualizaciones"],
  ["comments", "Comentarios"],
  ["shares", "Compartidos"],
  ["saves", "Guardados"],
]
const state = { compare: "views", sort: "date", post: undefined }

export async function render(el, _params, ctx) {
  const [posts, records] = await Promise.all([api.list("posts"), api.list("metrics")])
  const published = posts.filter((post) => post.status === "publicada")
  // Último registro de cada publicación: las métricas son acumuladas, así que
  // el registro más reciente es el valor vigente.
  const latest = new Map()
  records.forEach((record) => {
    const current = latest.get(record.post_id)
    if (!current || record.date > current.date || (record.date === current.date && record.id > current.id))
      latest.set(record.post_id, record)
  })
  const rows = [...latest.values()].map((record) => {
    const post = posts.find((item) => item.id === record.post_id)
    return { ...record, post, rate: record.views ? (record.comments + record.shares + record.saves) / record.views : 0 }
  })
  const totals = Object.fromEntries(METRICS.map(([key]) => [key, rows.reduce((sum, row) => sum + row[key], 0)]))
  const tracked = posts.filter((post) => latest.has(post.id))
  if (state.post === undefined || !latest.has(state.post)) state.post = tracked[0]?.id
  const compareName = [...METRICS, ["rate", "Interacción calculada"]].find(([key]) => key === state.compare)[1]
  const value = (row) => (state.compare === "rate" ? row.rate : row[state.compare])
  const format = (n) => (state.compare === "rate" ? formatPercent(n) : formatNumber(n))
  const byPillar = PILLAR_KEYS.map((pillar) => {
    const items = rows.filter((row) => row.post?.pillar === pillar)
    return { label: `${pillarName(pillar)} (${items.length})`, value: items.length ? items.reduce((sum, row) => sum + value(row), 0) / items.length : 0 }
  })
  const sorted = [...rows].sort((a, b) =>
    state.sort === "date" ? (b.post?.date ?? "").localeCompare(a.post?.date ?? "") : value(b) - value(a),
  )

  mount(
    el,
    html`<div class="page-head">
        <div>
          <span class="eyebrow">Sistema de seguimiento</span>
          <h1>Analíticas</h1>
          <p class="lede">Registra a mano las métricas que ves en cada plataforma. Aquí solo hay datos que tú has introducido.</p>
        </div>
      </div>

      <section class="card">
        <div class="card-head"><h2>Registrar métricas</h2><span class="faint small">Valores acumulados a la fecha del registro</span></div>
        ${published.length
          ? html`<form class="form-grid" data-form="metric" novalidate>
              <label class="field full" data-field="post_id">
                <span>Publicación *</span>
                <select name="post_id">
                  ${published.map((post) => html`<option value="${post.id}">${formatDate(post.date)} · ${post.title} · ${label("posts", "platform", post.platform)}</option>`)}
                </select>
                <small class="error" hidden></small>
              </label>
              <label class="field" data-field="date"><span>Fecha del registro *</span><input type="date" name="date" value="${today()}" /><small class="error" hidden></small></label>
              ${METRICS.map(
                ([key, text]) =>
                  html`<label class="field" data-field="${key}"><span>${text}</span><input type="number" name="${key}" min="0" step="1" inputmode="numeric" value="0" /><small class="error" hidden></small></label>`,
              )}
              <label class="field" data-field="notes"><span>Notas</span><input type="text" name="notes" maxlength="1000" placeholder="Opcional" /></label>
              <div class="full actions"><button class="btn btn-primary" type="submit">${icon("plus")} Guardar registro</button></div>
            </form>`
          : html`<div class="empty">
              <strong>No hay publicaciones marcadas como publicadas</strong>
              Cuando publiques un vídeo, cambia su estado a «Publicada» en el <a href="#/calendario">calendario</a> y vuelve aquí
              para registrar sus métricas.
            </div>`}
      </section>

      ${rows.length
        ? html`<div class="kpis mt">
              ${METRICS.map(([key, text]) => html`<div class="kpi"><div class="kpi-label">${text}</div><div class="kpi-value">${formatNumber(totals[key])}</div></div>`)}
              <div class="kpi">
                <div class="kpi-label">Interacción calculada</div>
                <div class="kpi-value">${totals.views ? formatPercent((totals.comments + totals.shares + totals.saves) / totals.views) : "—"}</div>
                <div class="kpi-sub">(comentarios + compartidos + guardados) ÷ visualizaciones</div>
              </div>
            </div>

            <div class="grid grid-2">
              <section class="card">
                <div class="card-head">
                  <h2>Comparar publicaciones</h2>
                  <select data-compare aria-label="Métrica a comparar">
                    ${[...METRICS, ["rate", "Interacción calculada"]].map(([key, text]) => html`<option value="${key}" ${state.compare === key ? "selected" : ""}>${text}</option>`)}
                  </select>
                </div>
                ${barList(
                  [...rows].sort((a, b) => value(b) - value(a)).map((row) => ({ label: row.post?.title ?? "—", value: value(row) })),
                  format,
                )}
              </section>
              <section class="card">
                <div class="card-head"><h2>Media por pilar</h2><span class="faint small">${compareName}</span></div>
                ${barList(byPillar, format)}
                <p class="faint small mt">Con pocas publicaciones por pilar, estas medias no son concluyentes.</p>
              </section>
            </div>

            <section class="card mt">
              <div class="card-head">
                <h2>Evolución</h2>
                <select data-evolution aria-label="Publicación">
                  ${tracked.map((post) => html`<option value="${post.id}" ${post.id === state.post ? "selected" : ""}>${post.title}</option>`)}
                </select>
              </div>
              <div class="spark-grid">
                ${METRICS.map(([key, text], index) => html`<div><div class="kpi-label">${text}</div><div class="chart" data-chart="${key}" data-series="${index}"></div></div>`)}
              </div>
              <p class="faint small mt">Cada punto es un registro manual. Registra la misma publicación en varias fechas para ver su evolución.</p>
            </section>

            <section class="card mt">
              <div class="card-head">
                <h2>Tabla comparativa</h2>
                <div class="segmented" role="group" aria-label="Ordenar">
                  <button data-sort="date" aria-pressed="${state.sort === "date"}">Por fecha</button>
                  <button data-sort="value" aria-pressed="${state.sort === "value"}">Por métrica</button>
                </div>
              </div>
              <div class="table-wrap"><table>
                <thead><tr><th>Publicación</th><th>Pilar</th><th>Último registro</th>${METRICS.map(([, text]) => html`<th class="num">${text}</th>`)}<th class="num">Interacción</th></tr></thead>
                <tbody>
                  ${sorted.map(
                    (row) => html`<tr>
                      <td>${row.post?.title ?? "—"}<div class="faint small">${formatDate(row.post?.date)} · ${label("posts", "platform", row.post?.platform)}</div></td>
                      <td><span class="badge pillar-${row.post?.pillar}">${pillarName(row.post?.pillar)}</span></td>
                      <td>${formatDate(row.date)}</td>
                      ${METRICS.map(([key]) => html`<td class="num">${formatNumber(row[key])}</td>`)}
                      <td class="num">${row.views ? formatPercent(row.rate) : "—"}</td>
                    </tr>`,
                  )}
                </tbody>
              </table></div>
            </section>`
        : html`<div class="empty mt">
            <strong>Todavía no hay métricas registradas</strong>
            Los gráficos de comparación y evolución aparecerán con el primer registro. No se muestran datos de ejemplo para no
            confundirlos con resultados reales.
          </div>`}

      <section class="card mt">
        <div class="card-head"><h2>Historial de registros</h2><span class="faint small">${records.length} registros</span></div>
        ${records.length
          ? html`<div class="table-wrap"><table>
              <thead><tr><th>Fecha</th><th>Publicación</th>${METRICS.map(([, text]) => html`<th class="num">${text}</th>`)}<th></th></tr></thead>
              <tbody>
                ${records.map(
                  (record) => html`<tr>
                    <td>${formatDate(record.date)}</td>
                    <td>${posts.find((post) => post.id === record.post_id)?.title ?? "—"}</td>
                    ${METRICS.map(([key]) => html`<td class="num">${formatNumber(record[key])}</td>`)}
                    <td class="num">
                      <button class="icon-btn" data-edit="${record.id}" aria-label="Editar registro">${icon("edit")}</button>
                    </td>
                  </tr>`,
                )}
              </tbody>
            </table></div>`
          : html`<p class="faint small">Sin registros.</p>`}
      </section>`,
  )

  const drawCharts = () =>
    el.querySelectorAll("[data-chart]").forEach((container) => {
      const key = container.dataset.chart
      const points = records
        .filter((record) => record.post_id === state.post)
        .map((record) => ({ x: record.date, y: record[key] }))
      // Si hay varios registros el mismo día, se usa el último.
      const byDate = [...new Map(points.reverse().map((point) => [point.x, point])).values()]
      const name = METRICS.find(([metric]) => metric === key)[1]
      mount(container, lineChart({ series: [{ label: name, points: byDate }], width: container.clientWidth, height: 170, format: formatNumber }))
      container.querySelectorAll(".s-0").forEach((node) => node.classList.replace("s-0", `s-${container.dataset.series}`))
    })
  drawCharts()
  ctx.onResize(drawCharts)

  el.onsubmit = async (event) => {
    event.preventDefault()
    const form = event.target
    const data = {
      post_id: Number(form.elements.post_id.value),
      date: form.elements.date.value,
      notes: form.elements.notes.value,
      ...Object.fromEntries(METRICS.map(([key]) => [key, Number(form.elements[key].value || 0)])),
    }
    await api
      .create("metrics", data)
      .then(() => {
        toast("Métricas registradas")
        state.post = data.post_id
        ctx.refresh()
      })
      .catch((error) => {
        if (!(error instanceof ApiError)) throw error
        showErrors(form, error.fields)
        toast(error.message, "error")
      })
  }
  el.onchange = (event) => {
    if (event.target.matches("[data-compare]")) {
      state.compare = event.target.value
      return ctx.refresh()
    }
    if (event.target.matches("[data-evolution]")) {
      state.post = Number(event.target.value)
      drawCharts()
    }
  }
  el.onclick = (event) => {
    const sort = event.target.closest("[data-sort]")?.dataset.sort
    if (sort) {
      state.sort = sort
      return ctx.refresh()
    }
    const id = Number(event.target.closest("[data-edit]")?.dataset.edit)
    if (!id) return
    const record = records.find((item) => item.id === id)
    openForm({
      title: "Editar registro de métricas",
      entity: "metrics",
      keys: ["post_id", "date", "views", "comments", "shares", "saves", "notes"],
      item: record,
      refs: { post_id: posts },
      onSubmit: async (data) => {
        await api.update("metrics", id, data)
        toast("Registro actualizado")
        ctx.refresh()
      },
      onDelete: async () => {
        if (!window.confirm("¿Eliminar este registro?")) return false
        await api.remove("metrics", id)
        toast("Registro eliminado")
        ctx.refresh()
      },
    })
  }
}
