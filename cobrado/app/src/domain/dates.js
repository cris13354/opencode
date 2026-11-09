// Fechas de calendario como cadenas ISO "YYYY-MM-DD". Toda la aritmética se hace
// en días UTC para que los husos horarios y el horario de verano no muevan un día.

const DAY_MS = 86_400_000

export function toDay(iso) {
  const [y, m, d] = iso.split("-").map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS)
}

export function fromDay(day) {
  return new Date(day * DAY_MS).toISOString().slice(0, 10)
}

export function addDays(iso, days) {
  return fromDay(toDay(iso) + days)
}

export function daysBetween(from, to) {
  return toDay(to) - toDay(from)
}

export function isIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  return fromDay(toDay(value)) === value
}

export function todayIso(now = new Date()) {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function maxIso(a, b) {
  return a > b ? a : b
}

export function minIso(a, b) {
  return a < b ? a : b
}

/** Primer día de cada semestre natural dentro de (from, to]. */
export function semesterStartsBetween(from, to) {
  const startYear = Number(from.slice(0, 4))
  const endYear = Number(to.slice(0, 4))
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
    .flatMap((year) => [`${year}-01-01`, `${year}-07-01`])
    .filter((iso) => iso > from && iso <= to)
}

export function formatDate(iso) {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}
