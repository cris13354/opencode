import { isIsoDate } from "./dates.js"
import { CLIENT_TYPES } from "./claim.js"

/**
 * @typedef {{ name: string, contact: string, taxId: string, email: string, phone: string, address: string, type: "empresa" | "administracion" | "particular" }} Client
 * @typedef {{ id: string, date: string, amount: number, note: string }} Payment
 * @typedef {{ id: string, date: string, type: EventType, stage?: string, channel?: string, note?: string, promiseDate?: string, receivedDate?: string }} ClaimEvent
 * @typedef {"message" | "call" | "promise" | "plan" | "masc" | "dispute" | "resolved" | "monitorio" | "note"} EventType
 * @typedef {{ id: string, number: string, concept: string, amount: number, issueDate: string, dueDate: string, client: Client, payments: Payment[], events: ClaimEvent[], status: "active" | "written_off", createdAt: string }} Invoice
 */

export const EVENT_LABELS = {
  message: "Mensaje enviado",
  call: "Llamada",
  promise: "Promesa de pago",
  plan: "Plan de pagos acordado",
  masc: "Requerimiento formal enviado",
  dispute: "El cliente discrepa",
  resolved: "Discrepancia resuelta",
  monitorio: "Monitorio presentado",
  note: "Nota",
}

export const CHANNEL_LABELS = {
  email: "Email",
  whatsapp: "WhatsApp",
  phone: "Teléfono",
  burofax: "Burofax con acuse y certificación de contenido",
  certified: "Carta certificada con acuse",
  notary: "Requerimiento notarial",
  other: "Otro",
}

export function newId() {
  return crypto.randomUUID()
}

export function emptyClient() {
  return { name: "", contact: "", taxId: "", email: "", phone: "", address: "", type: "empresa" }
}

/**
 * Valida un objeto desconocido (formulario, JSON importado) y devuelve una factura
 * normalizada o la lista de errores. Es la única frontera de validación: el resto
 * del código trabaja con facturas ya tipadas.
 * @returns {{ ok: true, invoice: Invoice } | { ok: false, errors: string[] }}
 */
export function parseInvoice(raw) {
  const input = raw && typeof raw === "object" ? raw : {}
  const client = input.client && typeof input.client === "object" ? input.client : {}
  const invoice = {
    id: text(input.id) || newId(),
    number: text(input.number),
    concept: text(input.concept),
    amount: money(input.amount),
    issueDate: text(input.issueDate),
    dueDate: text(input.dueDate),
    client: {
      name: text(client.name),
      contact: text(client.contact),
      taxId: text(client.taxId),
      email: text(client.email),
      phone: text(client.phone),
      address: text(client.address),
      type: Object.hasOwn(CLIENT_TYPES, client.type) ? client.type : "empresa",
    },
    payments: list(input.payments)
      .map((payment) => ({ id: text(payment.id) || newId(), date: text(payment.date), amount: money(payment.amount), note: text(payment.note) }))
      .filter((payment) => isIsoDate(payment.date) && payment.amount > 0),
    events: list(input.events)
      .map((event) => ({ ...event, id: text(event.id) || newId(), date: text(event.date), type: text(event.type) }))
      .filter((event) => isIsoDate(event.date) && Object.hasOwn(EVENT_LABELS, event.type)),
    status: input.status === "written_off" ? "written_off" : "active",
    createdAt: text(input.createdAt) || new Date().toISOString(),
  }
  const errors = [
    invoice.client.name ? null : "Indica el nombre del cliente.",
    invoice.number ? null : "Indica el número de factura.",
    Number.isFinite(invoice.amount) && invoice.amount > 0 ? null : "El importe debe ser mayor que cero.",
    isIsoDate(invoice.issueDate) ? null : "La fecha de emisión no es válida.",
    isIsoDate(invoice.dueDate) ? null : "La fecha de vencimiento no es válida.",
    isIsoDate(invoice.issueDate) && isIsoDate(invoice.dueDate) && invoice.dueDate < invoice.issueDate
      ? "El vencimiento no puede ser anterior a la emisión."
      : null,
  ].filter((error) => error !== null)
  if (errors.length > 0) return { ok: false, errors }
  return { ok: true, invoice }
}

/** Convierte "1.234,56", "1234.56" o 1234.56 en número; NaN si no se puede. */
export function money(value) {
  if (typeof value === "number") return value
  const raw = text(value).replace(/[€\s]/g, "")
  if (!raw) return Number.NaN
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw
  return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : Number.NaN
}

function text(value) {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return String(value)
  return ""
}

function list(value) {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : []
}
