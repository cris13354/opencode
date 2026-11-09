import { CLIENT_TYPES, computeClaim } from "../../domain/claim.js"
import { addDays, formatDate } from "../../domain/dates.js"
import { MASC_RESPONSE_DAYS, STAGES } from "../../domain/escalation.js"
import { formatLongDate, formatMoney } from "../../domain/format.js"
import { CHANNEL_LABELS, EVENT_LABELS } from "../../domain/model.js"
import { renderTemplate } from "../../domain/templates.js"
import { claimSettings, findInvoice, getState, today } from "../../store.js"
import { claimBreakdown } from "../components.js"
import { button, h, icon } from "../dom.js"
import { letterHandoff } from "./invoiceDetail.js"

/** Expediente imprimible: todo lo que un juzgado o un abogado necesita ver. */
export function dossierView(id) {
  const invoice = findInvoice(id)
  if (!invoice) return h("p", null, "No encuentro esa factura.")
  const asOf = today()
  const profile = getState().profile
  const claim = computeClaim(invoice, asOf, claimSettings())
  const masc = invoice.events.filter((event) => event.type === "masc").at(-1)
  const history = [
    ...invoice.events.map((event) => ({ date: event.date, text: describeEvent(event) })),
    ...invoice.payments.map((payment) => ({ date: payment.date, text: `Pago recibido de ${formatMoney(payment.amount)}${payment.note ? ` (${payment.note})` : ""}` })),
  ].sort((a, b) => a.date.localeCompare(b.date))
  const checklist = [
    [true, `Factura n.º ${invoice.number} (original o copia)`],
    [false, "Prueba de la relación: presupuesto aceptado, contrato, pedido o emails de encargo"],
    [false, "Prueba de entrega o prestación del servicio (albarán, entregables, emails de conformidad)"],
    [invoice.events.some((event) => event.type === "message"), "Copia de los recordatorios enviados (emails, capturas de WhatsApp)"],
    [Boolean(masc), "Requerimiento formal con invitación a negociar (justificante de envío y certificación de contenido)"],
    [Boolean(masc?.receivedDate), "Acuse de recibo del requerimiento"],
    [Boolean(masc?.receivedDate && addDays(masc.receivedDate, MASC_RESPONSE_DAYS) <= asOf), `Transcurso de ${MASC_RESPONSE_DAYS} días naturales desde la recepción sin acuerdo (orientativo)`],
  ]

  return h(
    "div",
    { class: "stack" },
    h(
      "div",
      { class: "no-print row-actions" },
      h("a", { href: `#/factura/${invoice.id}`, class: "back" }, icon("back"), "Volver a la factura"),
      button("Imprimir o guardar en PDF", { variant: "primary", icon: "print", onClick: () => window.print() }),
    ),
    h(
      "article",
      { class: "paper" },
      h("p", { class: "eyebrow" }, `Generado el ${formatLongDate(asOf)} con Cobrado`),
      h("h1", null, `Expediente de reclamación · Factura ${invoice.number}`),
      h(
        "div",
        { class: "grid-2 parties" },
        party("Acreedor", [profile.name || "[Completa tu perfil en Ajustes]", profile.taxId && `NIF ${profile.taxId}`, profile.address, profile.email, profile.phone]),
        party("Deudor", [
          invoice.client.name,
          invoice.client.taxId && `NIF/CIF ${invoice.client.taxId}`,
          invoice.client.address || "[Falta el domicilio: necesario para el monitorio]",
          invoice.client.email,
          invoice.client.phone,
          CLIENT_TYPES[invoice.client.type],
        ]),
      ),
      h("h2", null, "Deuda"),
      h(
        "dl",
        { class: "facts" },
        fact("Concepto", invoice.concept || "—"),
        fact("Importe de la factura", formatMoney(invoice.amount)),
        fact("Emisión", formatDate(invoice.issueDate)),
        fact("Vencimiento", formatDate(invoice.dueDate)),
        fact("Días de retraso", String(claim.daysLate)),
      ),
      claimBreakdown(claim, { open: true }),
      h("h2", null, "Cronología de gestiones"),
      history.length === 0
        ? h("p", null, "No hay gestiones registradas.")
        : h("table", { class: "mini-table history" }, h("tbody", null, history.map((item) => h("tr", null, h("td", null, formatDate(item.date)), h("td", null, item.text))))),
      h("h2", null, "Intento de negociación previa (LO 1/2025)"),
      h(
        "p",
        null,
        masc
          ? `Requerimiento enviado el ${formatDate(masc.date)} por ${CHANNEL_LABELS[masc.channel] ?? masc.channel}${masc.receivedDate ? `, recibido el ${formatDate(masc.receivedDate)}. Fecha orientativa a partir de la cual cabe acudir a la vía judicial: ${formatDate(addDays(masc.receivedDate, MASC_RESPONSE_DAYS))}.` : ". Falta registrar la fecha de recepción."}`
          : "Aún no se ha enviado el requerimiento formal con invitación a negociar. Sin él, la demanda o la petición de monitorio puede no admitirse.",
      ),
      h("h2", null, "Documentos a reunir"),
      h(
        "ul",
        { class: "checklist" },
        checklist.map(([done, text]) => h("li", { class: done ? "done" : "" }, h("span", { class: "box" }, done ? "✓" : ""), text)),
      ),
      h(
        "p",
        { class: "fine" },
        "Documento de apoyo generado a partir de los datos introducidos por el usuario. No constituye asesoramiento jurídico. Verifica los tipos de interés en el BOE y, si tienes dudas, consulta con un abogado o tu gestoría.",
      ),
    ),
  )
}

/** Carta lista para imprimir o guardar en PDF (para enviar por burofax online o en Correos). */
export function letterView(id) {
  const invoice = findInvoice(id)
  if (!invoice) return h("p", null, "No encuentro esa factura.")
  const asOf = today()
  const letter =
    letterHandoff.invoiceId === id
      ? letterHandoff
      : renderTemplate("masc", { profile: getState().profile, invoice, claim: computeClaim(invoice, asOf, claimSettings()), asOf })
  return h(
    "div",
    { class: "stack" },
    h(
      "div",
      { class: "no-print row-actions" },
      h("a", { href: `#/factura/${invoice.id}`, class: "back" }, icon("back"), "Volver a la factura"),
      button("Imprimir o guardar en PDF", { variant: "primary", icon: "print", onClick: () => window.print() }),
    ),
    h("article", { class: "paper letter" }, letter.body.split("\n").map((line) => (line.trim() === "" ? h("br") : h("p", null, line)))),
  )
}

function describeEvent(event) {
  const stage = STAGES.find((item) => item.id === event.stage)
  const base = event.type === "message" && stage ? `${stage.title} enviado` : EVENT_LABELS[event.type]
  const channel = event.channel ? ` por ${CHANNEL_LABELS[event.channel] ?? event.channel}` : ""
  const promise = event.promiseDate ? `; fecha comprometida ${formatDate(event.promiseDate)}` : ""
  const received = event.receivedDate ? `; recibido el ${formatDate(event.receivedDate)}` : ""
  const note = event.note ? `. ${event.note}` : ""
  return `${base}${channel}${promise}${received}${note}`
}

function party(title, lines) {
  return h("div", { class: "party" }, h("h3", null, title), lines.filter(Boolean).map((line) => h("p", null, line)))
}

function fact(label, value) {
  return h("div", null, h("dt", null, label), h("dd", null, value))
}
