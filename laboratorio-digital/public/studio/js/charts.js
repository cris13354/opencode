import { esc, formatDate, html, raw } from "./dom.js"

// Gráficos SVG propios, sin librerías. Se dibujan con el ancho real del
// contenedor para que el texto mantenga un tamaño legible en móvil.

const compact = new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 })

export function barList(items, format = (value) => compact.format(value)) {
  const max = Math.max(...items.map((item) => item.value), 0)
  return html`<svg width="0" height="0" aria-hidden="true" focusable="false" class="defs">
      <defs>
        <linearGradient id="bar-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#2F6BFF" />
          <stop offset="1" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
    <div class="bars">
      ${items.map(
        (item) => html`<div class="bar-row">
          <span class="label" title="${item.label}">${item.label}</span>
          <svg viewBox="0 0 100 10" preserveAspectRatio="none" role="img" aria-label="${item.label}: ${format(item.value)}">
            <rect class="bar-fill" width="${max ? Math.max((item.value / max) * 100, item.value ? 0.8 : 0) : 0}" height="10" />
          </svg>
          <span class="value">${format(item.value)}</span>
        </div>`,
      )}
    </div>`
}

export function lineChart({ series, width, height = 220, format = (value) => compact.format(value) }) {
  const pad = { top: 12, right: 14, bottom: 26, left: 44 }
  const points = series.flatMap((serie) => serie.points)
  if (!points.length || width < 80) return html``
  const times = points.map((point) => Date.parse(point.x))
  const minX = Math.min(...times)
  const maxX = Math.max(...times)
  const maxY = niceMax(Math.max(...points.map((point) => point.y), 1))
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const x = (value) => pad.left + (maxX === minX ? innerW / 2 : ((Date.parse(value) - minX) / (maxX - minX)) * innerW)
  const y = (value) => pad.top + innerH - (value / maxY) * innerH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ratio * maxY)
  const labels = [...new Set(points.map((point) => point.x))].sort()
  const shown = labels.length <= 3 ? labels : [labels[0], labels[Math.floor(labels.length / 2)], labels.at(-1)]
  const svg = [
    `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Gráfico de evolución">`,
    ...ticks.map(
      (tick) =>
        `<line class="grid-line" x1="${pad.left}" x2="${width - pad.right}" y1="${y(tick)}" y2="${y(tick)}"/><text x="${pad.left - 8}" y="${y(tick) + 4}" text-anchor="end">${esc(format(tick))}</text>`,
    ),
    ...shown.map(
      (label) => `<text x="${x(label)}" y="${height - 6}" text-anchor="middle">${esc(formatDate(label))}</text>`,
    ),
    ...series.map((serie, index) => {
      const sorted = [...serie.points].sort((a, b) => a.x.localeCompare(b.x))
      const path = sorted.map((point, i) => `${i ? "L" : "M"}${x(point.x)},${y(point.y)}`).join(" ")
      const area = sorted.length > 1 ? `${path} L${x(sorted.at(-1).x)},${y(0)} L${x(sorted[0].x)},${y(0)} Z` : ""
      return [
        area && series.length === 1 ? `<path class="area s-${index % 4}" d="${area}" stroke="none"/>` : "",
        `<path class="line s-${index % 4}" d="${path}" fill="none"/>`,
        ...sorted.map(
          (point) =>
            `<circle class="dot s-${index % 4}" cx="${x(point.x)}" cy="${y(point.y)}" r="4"><title>${esc(serie.label)} · ${esc(formatDate(point.x))}: ${esc(format(point.y))}</title></circle>`,
        ),
      ].join("")
    }),
    "</svg>",
  ]
  return raw(svg.join(""))
}

function niceMax(value) {
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((candidate) => candidate * magnitude >= value) ?? 10
  return step * magnitude
}

export function meter(done, total) {
  const ratio = total ? done / total : 0
  return html`<svg class="meter" viewBox="0 0 100 4" preserveAspectRatio="none" role="img" aria-label="${done} de ${total}">
    <rect width="${ratio * 100}" height="4" />
  </svg>`
}
