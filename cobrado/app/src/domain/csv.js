import { addDays, isIsoDate } from "./dates.js"
import { parseInvoice } from "./model.js"

// Cabeceras habituales en las exportaciones de programas de facturación, ya
// normalizadas (minúsculas, sin tildes ni signos).
const COLUMNS = {
  number: ["numero", "num", "n factura", "no factura", "numero factura", "factura", "invoice", "invoice number", "serie numero"],
  client: ["cliente", "nombre cliente", "razon social", "client", "customer", "nombre"],
  contact: ["contacto", "persona de contacto", "contact"],
  taxId: ["nif", "cif", "nif cliente", "cif cliente", "nif cif", "tax id", "vat"],
  email: ["email", "correo", "e mail", "email cliente"],
  phone: ["telefono", "movil", "phone"],
  address: ["direccion", "domicilio", "address"],
  concept: ["concepto", "descripcion", "description"],
  amount: ["total", "importe", "importe total", "total factura", "amount", "total eur"],
  issueDate: ["fecha", "fecha emision", "fecha factura", "emision", "fecha de emision", "issue date", "date"],
  dueDate: ["vencimiento", "fecha vencimiento", "fecha de vencimiento", "due date", "vence"],
  status: ["estado", "status", "situacion"],
}

const PAID_WORDS = ["pagada", "cobrada", "pagado", "cobrado", "paid"]

/**
 * Convierte un CSV exportado de un programa de facturación en facturas.
 * @param {string} source
 * @param {{ defaultTermDays: number }} options
 */
export function importInvoicesCsv(source, options) {
  const rows = parseCsv(source)
  if (rows.length < 2) return { invoices: [], errors: [{ line: 1, messages: ["El archivo no tiene filas de datos."] }], skipped: 0 }
  const header = rows[0].map(normalize)
  const index = Object.fromEntries(
    Object.entries(COLUMNS).map(([key, names]) => [key, header.findIndex((name) => names.includes(name))]),
  )
  const missing = ["number", "client", "amount", "issueDate"].filter((key) => index[key] === -1)
  if (missing.length > 0)
    return {
      invoices: [],
      errors: [{ line: 1, messages: [`No encuentro las columnas: ${missing.map((key) => LABELS[key]).join(", ")}.`] }],
      skipped: 0,
    }

  const results = rows.slice(1).map((cells, i) => {
    const cell = (key) => (index[key] === -1 ? "" : (cells[index[key]] ?? "").trim())
    if (PAID_WORDS.includes(normalize(cell("status")))) return { kind: "skipped" }
    const issueDate = toIso(cell("issueDate"))
    const parsed = parseInvoice({
      number: cell("number"),
      concept: cell("concept"),
      amount: cell("amount"),
      issueDate,
      dueDate: toIso(cell("dueDate")) || (isIsoDate(issueDate) ? addDays(issueDate, options.defaultTermDays) : ""),
      client: {
        name: cell("client"),
        contact: cell("contact"),
        taxId: cell("taxId"),
        email: cell("email"),
        phone: cell("phone"),
        address: cell("address"),
        type: "empresa",
      },
    })
    if (parsed.ok) return { kind: "invoice", invoice: parsed.invoice }
    return { kind: "error", line: i + 2, messages: parsed.errors }
  })

  return {
    invoices: results.filter((result) => result.kind === "invoice").map((result) => result.invoice),
    errors: results.filter((result) => result.kind === "error").map((result) => ({ line: result.line, messages: result.messages })),
    skipped: results.filter((result) => result.kind === "skipped").length,
  }
}

const LABELS = { number: "número de factura", client: "cliente", amount: "importe", issueDate: "fecha" }

/** CSV con comillas, separador ";" o "," (se detecta en la cabecera) y saltos de línea dentro de comillas. */
export function parseCsv(source) {
  const text = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n")
  const firstLine = text.split("\n", 1)[0] ?? ""
  const delimiter = count(firstLine, ";") >= count(firstLine, ",") ? ";" : ","
  const rows = []
  let row = []
  let field = ""
  let quoted = false
  // Un bucle explícito es más legible que un reduce para una máquina de estados.
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted && char === '"' && text[i + 1] === '"') {
      field += '"'
      i++
      continue
    }
    if (char === '"') {
      quoted = !quoted
      continue
    }
    if (!quoted && char === delimiter) {
      row.push(field)
      field = ""
      continue
    }
    if (!quoted && char === "\n") {
      rows.push([...row, field])
      row = []
      field = ""
      continue
    }
    field += char
  }
  rows.push([...row, field])
  return rows.filter((cells) => cells.some((value) => value.trim() !== ""))
}

/** Acepta dd/mm/aaaa, dd-mm-aaaa, dd.mm.aaaa y aaaa-mm-dd. */
export function toIso(value) {
  if (isIsoDate(value)) return value
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(value)
  if (!match) return ""
  const year = match[3].length === 2 ? `20${match[3]}` : match[3]
  const iso = `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`
  return isIsoDate(iso) ? iso : ""
}

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function count(text, char) {
  return text.split(char).length - 1
}
