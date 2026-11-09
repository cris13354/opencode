// Utilidades de interfaz. Todo el HTML se construye con la plantilla `html`,
// que escapa cada valor interpolado salvo que se marque explícitamente con `raw`.

class Html {
  constructor(value) {
    this.value = value
  }
  toString() {
    return this.value
  }
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char])
}

export function raw(value) {
  return new Html(String(value))
}

function fragment(value) {
  if (value instanceof Html) return value.value
  if (Array.isArray(value)) return value.map(fragment).join("")
  if (value === null || value === undefined || value === false) return ""
  return esc(value)
}

export function html(strings, ...values) {
  return new Html(strings.reduce((out, part, index) => out + part + (index < values.length ? fragment(values[index]) : ""), ""))
}

export function mount(el, content) {
  el.innerHTML = fragment(content)
}

// ---------- Fechas y números ----------

export function parseDate(value) {
  const [y, m, d] = String(value).split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function isoDate(date) {
  const pad = (n) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function today() {
  return isoDate(new Date())
}

export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function startOfWeek(date) {
  return addDays(date, -((date.getDay() + 6) % 7))
}

const dayFormat = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" })
const longFormat = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
const numberFormat = new Intl.NumberFormat("es-ES")

export function formatDate(value, long = false) {
  if (!value) return "—"
  return (long ? longFormat : dayFormat).format(parseDate(value))
}

export function formatNumber(value) {
  return numberFormat.format(value ?? 0)
}

export function formatPercent(value) {
  return `${(value * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`
}

// ---------- Feedback ----------

export function toast(message, kind = "ok") {
  const el = document.createElement("div")
  el.className = `toast ${kind === "error" ? "error" : ""}`
  el.textContent = message
  document.getElementById("toasts").append(el)
  setTimeout(() => el.remove(), 3500)
}

export function confirmAction(message) {
  return window.confirm(message)
}

export function download(url) {
  const link = document.createElement("a")
  link.href = url
  link.download = ""
  document.body.append(link)
  link.click()
  link.remove()
}
