import { CLIENT_TYPES } from "../../domain/claim.js"
import { addDays, daysBetween, isIsoDate } from "../../domain/dates.js"
import { emptyClient, parseInvoice } from "../../domain/model.js"
import { MAX_AGREED_TERM_DAYS } from "../../domain/rates.js"
import { findInvoice, getState, saveInvoice, today } from "../../store.js"
import { button, fieldControl, h, icon, toast } from "../dom.js"

export function invoiceFormView(id) {
  const existing = id ? findInvoice(id) : null
  if (id && !existing) return h("p", null, "No encuentro esa factura.")
  const state = getState()
  const issueDate = existing?.issueDate ?? today()
  const invoice = existing ?? {
    number: "",
    concept: "",
    amount: "",
    issueDate,
    dueDate: addDays(issueDate, state.settings.defaultTermDays),
    client: emptyClient(),
    payments: [],
    events: [],
  }
  const clients = knownClients(state.invoices)
  const errors = h("div", { class: "form-errors", role: "alert" })

  const form = h(
    "form",
    { class: "card form", novalidate: true },
    h("h2", null, "Cliente"),
    h(
      "div",
      { class: "grid-2" },
      fieldControl({ name: "client.name", label: "Nombre o razón social", value: invoice.client.name, required: true, list: "known-clients", autocomplete: "off" }),
      fieldControl({ name: "client.type", label: "Tipo de cliente", type: "select", value: invoice.client.type, options: Object.entries(CLIENT_TYPES), hint: "Decide qué ley se aplica: la Ley 3/2004 solo cubre empresas, profesionales y Administraciones." }),
      fieldControl({ name: "client.contact", label: "Persona de contacto", value: invoice.client.contact, hint: "Para saludar por su nombre en los mensajes." }),
      fieldControl({ name: "client.taxId", label: "NIF / CIF", value: invoice.client.taxId }),
      fieldControl({ name: "client.email", label: "Email", type: "email", value: invoice.client.email, autocomplete: "off" }),
      fieldControl({ name: "client.phone", label: "Teléfono / WhatsApp", type: "tel", value: invoice.client.phone, autocomplete: "off" }),
      fieldControl({ name: "client.address", label: "Domicilio", value: invoice.client.address, wide: true, hint: "Necesario para el burofax y para el monitorio." }),
    ),
    h("datalist", { id: "known-clients" }, clients.map((client) => h("option", { value: client.name }))),
    h("h2", null, "Factura"),
    h(
      "div",
      { class: "grid-2" },
      fieldControl({ name: "number", label: "Número de factura", value: invoice.number, required: true }),
      fieldControl({ name: "amount", label: "Importe total (IVA incluido)", value: invoice.amount === "" ? "" : String(invoice.amount).replace(".", ","), required: true, inputmode: "decimal", placeholder: "1.210,00" }),
      fieldControl({ name: "concept", label: "Concepto", value: invoice.concept, wide: true }),
      fieldControl({ name: "issueDate", label: "Fecha de emisión", type: "date", value: invoice.issueDate, required: true }),
      fieldControl({ name: "dueDate", label: "Fecha de vencimiento", type: "date", value: invoice.dueDate, required: true }),
    ),
    h(
      "div",
      { class: "term-helper" },
      h("span", { class: "muted" }, "Vence a:"),
      [15, 30, 45, 60].map((days) => button(`${days} días`, { small: true, variant: "ghost", onClick: () => setTerm(form, days) })),
    ),
    h("p", { class: "term-note fine" }),
    errors,
    h(
      "div",
      { class: "form-actions" },
      button("Cancelar", { variant: "ghost", href: existing ? `#/factura/${existing.id}` : "#/" }),
      button(existing ? "Guardar cambios" : "Guardar factura", { variant: "primary", type: "submit", icon: "check" }),
    ),
  )

  form.addEventListener("input", (event) => {
    if (event.target.name === "client.name") fillClient(form, clients, event.target.value)
    updateTermNote(form)
  })
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(form).entries())
    const parsed = parseInvoice({
      ...(existing ?? {}),
      number: values.number,
      concept: values.concept,
      amount: values.amount,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      client: Object.fromEntries(
        Object.entries(values)
          .filter(([key]) => key.startsWith("client."))
          .map(([key, value]) => [key.slice(7), value]),
      ),
    })
    if (!parsed.ok) {
      errors.replaceChildren(h("ul", null, parsed.errors.map((error) => h("li", null, icon("alert"), error))))
      errors.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    saveInvoice(parsed.invoice)
    toast(existing ? "Factura actualizada" : "Factura guardada")
    location.hash = `#/factura/${parsed.invoice.id}`
  })
  updateTermNote(form)

  return h(
    "div",
    { class: "stack narrow" },
    h("a", { href: existing ? `#/factura/${existing.id}` : "#/", class: "back" }, icon("back"), existing ? "Volver a la factura" : "Volver al panel"),
    h("h1", null, existing ? `Editar factura ${existing.number}` : "Nueva factura pendiente"),
    form,
  )
}

function setTerm(form, days) {
  const issue = form.elements.namedItem("issueDate").value
  if (!isIsoDate(issue)) return
  form.elements.namedItem("dueDate").value = addDays(issue, days)
  updateTermNote(form)
}

function updateTermNote(form) {
  const issue = form.elements.namedItem("issueDate").value
  const due = form.elements.namedItem("dueDate").value
  const type = form.elements.namedItem("client.type").value
  const note = form.querySelector(".term-note")
  if (!isIsoDate(issue) || !isIsoDate(due)) return void (note.textContent = "")
  const term = daysBetween(issue, due)
  note.textContent =
    type !== "particular" && term > MAX_AGREED_TERM_DAYS
      ? `Plazo de ${term} días: entre empresas la ley no permite pactar más de ${MAX_AGREED_TERM_DAYS}.`
      : `Plazo de pago: ${term} días desde la emisión. Sin pacto, la ley fija 30 días entre empresas.`
}

function fillClient(form, clients, name) {
  const match = clients.find((client) => client.name === name)
  if (!match) return
  Object.entries(match)
    .filter(([key]) => key !== "name")
    .forEach(([key, value]) => {
      const input = form.elements.namedItem(`client.${key}`)
      if (input && !input.value) input.value = value
      if (input && key === "type") input.value = value
    })
}

function knownClients(invoices) {
  return [...new Map(invoices.map((invoice) => [invoice.client.name, invoice.client])).values()].sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  )
}
