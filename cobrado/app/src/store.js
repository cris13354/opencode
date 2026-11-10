import { addDays, isIsoDate, todayIso } from "./domain/dates.js"
import { newId, parseInvoice } from "./domain/model.js"
import { LATE_PAYMENT_RATES, LEGAL_MONEY_RATE } from "./domain/rates.js"

// Todo se guarda en localStorage de este navegador: no hay servidor ni cuentas.
const KEY = "cobrado:v1"

const DEFAULT_STATE = {
  version: 1,
  profile: { name: "", taxId: "", address: "", city: "", email: "", phone: "", iban: "", formal: false },
  settings: { defaultTermDays: 30, rates: LATE_PAYMENT_RATES, legalMoneyRate: LEGAL_MONEY_RATE.rate },
  invoices: [],
}

// localStorage puede no existir o lanzar (modo privado, almacenamiento bloqueado):
// en ese caso la app funciona en memoria y lo avisa en Ajustes.
export const storageAvailable = (() => {
  try {
    localStorage.setItem(`${KEY}:probe`, "1")
    localStorage.removeItem(`${KEY}:probe`)
    return true
  } catch {
    return false
  }
})()

const listeners = new Set()
let state = load()

export function getState() {
  return state
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Fecha de trabajo. `?hoy=AAAA-MM-DD` permite simularla en demos y pruebas. */
export function today() {
  const override = new URLSearchParams(location.search).get("hoy")
  return override && isIsoDate(override) ? override : todayIso()
}

export function claimSettings() {
  return { rates: state.settings.rates, legalMoneyRate: state.settings.legalMoneyRate }
}

export function findInvoice(id) {
  return state.invoices.find((invoice) => invoice.id === id)
}

export function saveInvoice(invoice) {
  const exists = state.invoices.some((item) => item.id === invoice.id)
  commit({
    ...state,
    invoices: exists ? state.invoices.map((item) => (item.id === invoice.id ? invoice : item)) : [...state.invoices, invoice],
  })
}

export function updateInvoice(id, change) {
  const invoice = findInvoice(id)
  if (!invoice) return
  saveInvoice(change(invoice))
}

export function addEvent(id, event) {
  updateInvoice(id, (invoice) => ({ ...invoice, events: [...invoice.events, { id: newId(), ...event }] }))
}

export function removeEvent(id, eventId) {
  updateInvoice(id, (invoice) => ({ ...invoice, events: invoice.events.filter((event) => event.id !== eventId) }))
}

export function updateEvent(id, eventId, change) {
  updateInvoice(id, (invoice) => ({
    ...invoice,
    events: invoice.events.map((event) => (event.id === eventId ? { ...event, ...change } : event)),
  }))
}

export function addPayment(id, payment) {
  updateInvoice(id, (invoice) => ({ ...invoice, payments: [...invoice.payments, { id: newId(), note: "", ...payment }] }))
}

export function removePayment(id, paymentId) {
  updateInvoice(id, (invoice) => ({ ...invoice, payments: invoice.payments.filter((payment) => payment.id !== paymentId) }))
}

export function removeInvoice(id) {
  commit({ ...state, invoices: state.invoices.filter((invoice) => invoice.id !== id) })
}

export function addInvoices(invoices) {
  commit({ ...state, invoices: [...state.invoices, ...invoices] })
}

export function saveProfile(profile) {
  commit({ ...state, profile: { ...state.profile, ...profile } })
}

export function saveSettings(settings) {
  commit({ ...state, settings: { ...state.settings, ...settings } })
}

export function resetAll() {
  commit(structuredClone(DEFAULT_STATE))
}

export function exportJson() {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)
}

/** Sustituye los datos por una copia exportada antes. Valida cada factura. */
export function importJson(text) {
  const raw = safeJson(text)
  if (!raw || !Array.isArray(raw.invoices)) return { ok: false, error: "El archivo no es una copia de seguridad de Cobrado." }
  const parsed = raw.invoices.map(parseInvoice)
  const invoices = parsed.filter((result) => result.ok).map((result) => result.invoice)
  commit(normalize({ ...raw, invoices }))
  return { ok: true, imported: invoices.length, rejected: parsed.length - invoices.length }
}

function commit(next) {
  state = next
  persist()
  listeners.forEach((listener) => listener(state))
}

function load() {
  const raw = safeJson(readStorage())
  if (!raw) return structuredClone(DEFAULT_STATE)
  const invoices = Array.isArray(raw.invoices)
    ? raw.invoices
        .map(parseInvoice)
        .filter((result) => result.ok)
        .map((result) => result.invoice)
    : []
  return normalize({ ...raw, invoices })
}

function normalize(raw) {
  const rates = Array.isArray(raw.settings?.rates)
    ? raw.settings.rates.filter((entry) => isIsoDate(entry?.from) && Number.isFinite(entry?.rate))
    : []
  return {
    version: 1,
    profile: { ...DEFAULT_STATE.profile, ...(raw.profile ?? {}) },
    settings: {
      ...DEFAULT_STATE.settings,
      ...(raw.settings ?? {}),
      rates: rates.length > 0 ? rates : LATE_PAYMENT_RATES,
    },
    invoices: raw.invoices,
  }
}

function readStorage() {
  if (!storageAvailable) return null
  return localStorage.getItem(KEY)
}

function persist() {
  if (!storageAvailable) return
  localStorage.setItem(KEY, JSON.stringify(state))
}

function safeJson(text) {
  if (!text) return null
  try {
    const value = JSON.parse(text)
    return value && typeof value === "object" ? value : null
  } catch {
    return null
  }
}

/** Datos ficticios para explorar la app. Las fechas se calculan desde hoy. */
export function loadDemo() {
  const now = today()
  const day = (offset) => addDays(now, offset)
  const demo = [
    {
      number: "2026-031",
      concept: "Rediseño de la web corporativa",
      amount: 2420,
      issueDate: day(-75),
      dueDate: day(-45),
      client: { name: "Ejemplo Reformas Delta SL", contact: "Marta", email: "facturas@example.com", phone: "600000001", type: "empresa" },
      events: [
        { date: day(-44), type: "message", stage: "reminder", channel: "email" },
        { date: day(-37), type: "message", stage: "followup", channel: "email" },
        { date: day(-35), type: "promise", promiseDate: day(-28), note: "Dice que lo paga la semana que viene." },
        { date: day(-26), type: "message", stage: "firm", channel: "email" },
      ],
    },
    {
      number: "2026-036",
      concept: "Sesión de fotos de producto",
      amount: 605,
      issueDate: day(-40),
      dueDate: day(-10),
      client: { name: "Ejemplo Tienda Gamma", contact: "Iván", email: "hola@example.com", phone: "600000002", type: "empresa" },
      events: [{ date: day(-9), type: "message", stage: "reminder", channel: "whatsapp" }],
    },
    {
      number: "2026-040",
      concept: "Mantenimiento mensual",
      amount: 363,
      issueDate: day(-28),
      dueDate: day(2),
      client: { name: "Ejemplo Clínica Beta", contact: "Laura", email: "admin@example.com", type: "empresa" },
    },
    {
      number: "2026-022",
      concept: "Consultoría de marketing",
      amount: 1815,
      issueDate: day(-120),
      dueDate: day(-90),
      client: { name: "Ejemplo Distribuciones Épsilon SA", email: "pagos@example.com", type: "empresa", address: "Calle Inventada 10, Valencia" },
      events: [
        { date: day(-89), type: "message", stage: "reminder", channel: "email" },
        { date: day(-82), type: "message", stage: "followup", channel: "email" },
        { date: day(-75), type: "message", stage: "firm", channel: "email" },
        { date: day(-58), type: "masc", channel: "burofax", receivedDate: day(-55), note: "Burofax con certificación de contenido." },
      ],
      payments: [{ date: day(-60), amount: 500, note: "Pago parcial" }],
    },
    {
      number: "2026-018",
      concept: "Traducción jurada",
      amount: 290,
      issueDate: day(-70),
      dueDate: day(-40),
      client: { name: "Ejemplo Persona Particular", type: "particular", email: "persona@example.com" },
      payments: [{ date: day(-20), amount: 290 }],
    },
  ]
  const invoices = demo.map((raw) => parseInvoice(raw)).flatMap((result) => (result.ok ? [result.invoice] : []))
  addInvoices(invoices)
  return invoices.length
}
