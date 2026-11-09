import { formatDate } from "./dates.js"

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })
const percent = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const longDate = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

export function formatMoney(value) {
  return euros.format(value)
}

export function formatRate(value) {
  return `${percent.format(value)} %`
}

export function formatLongDate(iso) {
  return longDate.format(new Date(`${iso}T00:00:00Z`))
}

export { formatDate }
