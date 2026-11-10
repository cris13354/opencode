import { CLIENT_TYPES, computeClaim } from "../../domain/claim.js"
import { formatDate } from "../../domain/dates.js"
import { STAGES, nextAction } from "../../domain/escalation.js"
import { formatMoney } from "../../domain/format.js"
import { CHANNEL_LABELS, EVENT_LABELS, money } from "../../domain/model.js"
import { DEFAULT_DEADLINE_DAYS, renderTemplate } from "../../domain/templates.js"
import {
  addEvent,
  addPayment,
  claimSettings,
  findInvoice,
  getState,
  removeEvent,
  removeInvoice,
  removePayment,
  today,
  updateEvent,
  updateInvoice,
} from "../../store.js"
import { actionTone, claimBreakdown, statusBadge, warningList } from "../components.js"
import { badge, button, confirmDialog, formDialog, h, icon, replace, toast } from "../dom.js"

// Borradores editados a mano, por factura y paso, para no perderlos al re-renderizar.
const drafts = new Map()
// Carta que se pasa a la vista de impresión.
export const letterHandoff = { invoiceId: "", subject: "", body: "" }

export function invoiceDetailView(id) {
  const invoice = findInvoice(id)
  if (!invoice) return h("div", { class: "stack" }, h("p", null, "No encuentro esa factura."), button("Volver al panel", { href: "#/" }))
  const asOf = today()
  const claim = computeClaim(invoice, asOf, claimSettings())
  const next = nextAction(invoice, claim, asOf)

  return h(
    "div",
    { class: "stack" },
    h("a", { href: "#/", class: "back" }, icon("back"), "Panel"),
    h(
      "header",
      { class: "detail-head" },
      h(
        "div",
        null,
        h("p", { class: "eyebrow" }, `Factura ${invoice.number} · ${CLIENT_TYPES[invoice.client.type]}`),
        h("h1", null, invoice.client.name),
        h(
          "p",
          { class: "muted" },
          `${formatMoney(invoice.amount)} · emitida el ${formatDate(invoice.issueDate)} · vence el ${formatDate(invoice.dueDate)}`,
          claim.daysLate > 0 && !claim.fullyPaid ? h("strong", { class: "danger-text" }, ` · ${claim.daysLate} días de retraso`) : null,
        ),
      ),
      h(
        "div",
        { class: "head-actions" },
        statusBadge(claim.status),
        button("Expediente", { href: `#/expediente/${invoice.id}`, icon: "file", small: true }),
        button("Editar", { href: `#/editar/${invoice.id}`, icon: "edit", small: true, variant: "ghost" }),
      ),
    ),
    h(
      "div",
      { class: "detail-grid" },
      h("div", { class: "stack" }, nextCard(invoice, claim, next, asOf), composer(invoice, claim, next, asOf), registerCard(invoice, claim, asOf)),
      h(
        "div",
        { class: "stack" },
        h("section", { class: "card" }, h("h2", null, "Cuánto puedes reclamar"), claimBreakdown(claim), warningList(claim.warnings)),
        timeline(invoice, asOf),
        dangerZone(invoice),
      ),
    ),
  )
}

function nextCard(invoice, claim, next, asOf) {
  const tone = actionTone(next, asOf)
  return h(
    "section",
    { class: `card next ${tone}` },
    h("p", { class: "eyebrow" }, next.date > asOf ? `Siguiente paso · ${formatDate(next.date)}` : "Siguiente paso · hoy"),
    h("h2", null, next.title),
    h("p", null, next.detail),
    next.kind === "monitorio"
      ? h(
          "div",
          { class: "row-actions" },
          button("Abrir expediente", { href: `#/expediente/${invoice.id}`, variant: "primary", icon: "file" }),
          button("Guía del monitorio", { href: "#/guia#monitorio", icon: "book" }),
          button("Marcar monitorio presentado", { variant: "ghost", onClick: () => register(invoice, claim, "monitorio", asOf) }),
        )
      : null,
    next.kind === "masc_receipt"
      ? h(
          "div",
          { class: "row-actions" },
          button("Añadir fecha de recepción", {
            variant: "primary",
            icon: "check",
            onClick: () => addReceipt(invoice, invoice.events.filter((event) => event.type === "masc").at(-1), asOf),
          }),
        )
      : null,
    next.kind === "review"
      ? h("div", { class: "row-actions" }, button("Marcar discrepancia resuelta", { variant: "primary", onClick: () => register(invoice, claim, "resolved", asOf) }))
      : null,
  )
}

function composer(invoice, claim, next, asOf) {
  if (invoice.status === "written_off") return null
  if (claim.fullyPaid && !(claim.status === "paid_late" && claim.commercial)) return null
  const stages = claim.fullyPaid
    ? [{ id: "extras", label: "Reclamar intereses" }]
    : STAGES.filter((stage) => stage.id !== "pre" || claim.daysLate === 0)
  const has = (id) => stages.some((stage) => stage.id === id)
  const saved = drafts.get(`${invoice.id}:current`)
  const pending = stages.find((stage) => !isDone(invoice, stage.id))?.id ?? stages.at(-1).id
  const local = { stage: has(saved) ? saved : has(next.stage) ? next.stage : pending }
  const body = h("div", { class: "composer-body" })
  const tabs = h(
    "div",
    { class: "steps", role: "tablist", "aria-label": "Paso de la reclamación" },
    stages.map((stage, i) =>
      h(
        "button",
        {
          type: "button",
          role: "tab",
          class: `step${stage.id === local.stage ? " active" : ""}${isDone(invoice, stage.id) ? " done" : ""}`,
          "aria-selected": String(stage.id === local.stage),
          onclick: (event) => {
            local.stage = stage.id
            drafts.set(`${invoice.id}:current`, stage.id)
            tabs.querySelectorAll(".step").forEach((tab) => {
              tab.classList.toggle("active", tab === event.currentTarget)
              tab.setAttribute("aria-selected", String(tab === event.currentTarget))
            })
            draw()
          },
        },
        h("span", { class: "step-n" }, isDone(invoice, stage.id) ? icon("check") : String(i + 1)),
        h("span", null, stage.label),
      ),
    ),
  )
  const draw = () => replace(body, stagePanel(invoice, claim, local.stage, asOf))
  draw()
  return h("section", { class: "card composer" }, h("h2", null, "Preparar mensaje"), tabs, body)
}

function stagePanel(invoice, claim, stageId, asOf) {
  const profile = getState().profile
  const key = `${invoice.id}:${stageId}`
  const stage = STAGES.find((item) => item.id === stageId)
  const draft = drafts.get(key) ?? { deadlineDays: DEFAULT_DEADLINE_DAYS[stageId] ?? 7, waive: false, edited: null }
  const generate = () => renderTemplate(stageId, { profile, invoice, claim, asOf, deadlineDays: draft.deadlineDays, waiveExtras: draft.waive })
  const text = draft.edited ?? generate()
  const subject = h("input", { class: "subject", value: text.subject, "aria-label": "Asunto" })
  const textarea = h("textarea", { class: "message", rows: stageId === "masc" ? 22 : 12, value: text.body, "aria-label": "Mensaje" })
  const saveEdit = () => {
    draft.edited = { subject: subject.value, body: textarea.value }
    drafts.set(key, draft)
  }
  subject.addEventListener("input", saveEdit)
  textarea.addEventListener("input", saveEdit)
  const regenerate = () => {
    draft.edited = null
    drafts.set(key, draft)
    const fresh = generate()
    subject.value = fresh.subject
    textarea.value = fresh.body
  }
  const showOptions = ["followup", "firm", "masc", "extras"].includes(stageId)
  const canWaive = claim.commercial && ["firm", "masc"].includes(stageId)
  const isLetter = stageId === "masc"

  return h(
    "div",
    { class: "stage-panel" },
    stage ? h("p", { class: "muted" }, stage.goal) : null,
    showOptions
      ? h(
          "div",
          { class: "options" },
          h(
            "label",
            { class: "inline" },
            "Plazo para pagar",
            h("input", {
              type: "number",
              min: "1",
              max: "60",
              value: String(draft.deadlineDays),
              class: "days",
              oninput: (event) => {
                draft.deadlineDays = Math.max(1, Number(event.target.value) || 1)
                regenerate()
              },
            }),
            "días",
          ),
          canWaive
            ? h(
                "label",
                { class: "check inline" },
                h("input", {
                  type: "checkbox",
                  checked: draft.waive,
                  onchange: (event) => {
                    draft.waive = event.target.checked
                    regenerate()
                  },
                }),
                h("span", null, "Ofrecer renunciar a intereses y 40 € si paga en plazo"),
              )
            : null,
        )
      : null,
    isLetter
      ? h(
          "div",
          { class: "note info" },
          icon("scale"),
          h(
            "p",
            null,
            "Envíalo por un medio que acredite contenido y recepción (burofax con certificación de contenido y acuse de recibo, o requerimiento notarial). Desde abril de 2025 hay que acreditar este intento de negociación antes de presentar un monitorio. Revisa el texto o consúltalo con un profesional antes de enviarlo.",
          ),
        )
      : null,
    isLetter ? missingLetterData(profile, invoice) : null,
    h("label", { class: "label" }, "Asunto"),
    subject,
    h("label", { class: "label" }, isLetter ? "Texto de la carta" : "Mensaje"),
    textarea,
    h(
      "div",
      { class: "row-actions" },
      button("Copiar", {
        icon: "copy",
        onClick: () => copy(isLetter ? textarea.value : `${subject.value}\n\n${textarea.value}`),
      }),
      isLetter
        ? button("Imprimir carta", {
            icon: "print",
            onClick: () => {
              Object.assign(letterHandoff, { invoiceId: invoice.id, subject: subject.value, body: textarea.value })
              location.hash = `#/carta/${invoice.id}`
            },
          })
        : [
            button("Abrir en email", {
              icon: "mail",
              href: `mailto:${encodeURIComponent(invoice.client.email)}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(textarea.value)}`,
              onClick: (event) => {
                event.currentTarget.href = `mailto:${encodeURIComponent(invoice.client.email)}?subject=${encodeURIComponent(subject.value)}&body=${encodeURIComponent(textarea.value)}`
              },
            }),
            invoice.client.phone
              ? button("WhatsApp", {
                  icon: "chat",
                  href: "#",
                  target: "_blank",
                  onClick: (event) => {
                    event.currentTarget.href = whatsappUrl(invoice.client.phone, textarea.value)
                  },
                })
              : null,
          ],
      button("Regenerar", { variant: "ghost", onClick: regenerate, title: "Descarta tus cambios y vuelve a la plantilla" }),
      stageId === "extras"
        ? null
        : button(isLetter ? "Registrar envío" : "Marcar como enviado", {
            variant: "primary",
            icon: "send",
            onClick: () => (isLetter ? registerMasc(invoice, asOf) : registerMessage(invoice, stageId, asOf)),
          }),
    ),
  )
}

function missingLetterData(profile, invoice) {
  const missing = [
    [profile.name, "tu nombre"],
    [profile.taxId, "tu NIF"],
    [profile.address, "tu domicilio"],
    [invoice.client.address, "el domicilio del cliente"],
  ].filter(([value]) => !value)
  if (missing.length === 0) return null
  return h(
    "div",
    { class: "note warning" },
    icon("alert"),
    h(
      "p",
      null,
      `Faltan datos para la carta: ${missing.map(([, label]) => label).join(", ")}. `,
      h("a", { href: "#/ajustes" }, "Completar mis datos"),
      " · ",
      h("a", { href: `#/editar/${invoice.id}` }, "Editar cliente"),
    ),
  )
}

function registerCard(invoice, claim, asOf) {
  if (invoice.status === "written_off") return null
  const actions = [
    ["payment", "Pago recibido", "euro"],
    ["promise", "Promesa de pago", "clock"],
    ["plan", "Plan de pagos", "clock"],
    ["call", "Llamada", "chat"],
    ["dispute", "Discrepancia", "alert"],
    ["note", "Nota", "edit"],
  ]
  return h(
    "section",
    { class: "card" },
    h("h2", null, "Registrar lo que ha pasado"),
    h("p", { class: "muted" }, "Cada registro ajusta el siguiente paso y queda en el expediente como prueba de tus gestiones."),
    h(
      "div",
      { class: "register-grid" },
      actions.map(([type, label, iconName]) => button(label, { icon: iconName, onClick: () => register(invoice, claim, type, asOf) })),
    ),
  )
}

async function register(invoice, claim, type, asOf) {
  const dateField = { name: "date", label: "Fecha", type: "date", value: asOf, required: true }
  const noteField = (label = "Nota", hint) => ({ name: "note", label, type: "textarea", hint })
  const configs = {
    payment: {
      title: "Registrar pago",
      fields: [
        dateField,
        { name: "amount", label: "Importe recibido", value: String(claim.outstanding).replace(".", ","), required: true, inputmode: "decimal" },
        noteField(),
      ],
    },
    promise: {
      title: "Promesa de pago",
      intro: "La escalera se pausa hasta esa fecha. Si no paga, la app te propondrá el siguiente paso.",
      fields: [dateField, { name: "promiseDate", label: "Fecha en la que promete pagar", type: "date", required: true, min: asOf }, noteField("Qué te ha dicho")],
    },
    plan: {
      title: "Plan de pagos acordado",
      intro: "Recomendación: confirma el plan por escrito (email) para que quede constancia.",
      fields: [dateField, { name: "promiseDate", label: "Fecha del próximo plazo", type: "date", required: true, min: asOf }, noteField("Calendario acordado", "Ej.: 3 pagos de 400 € los días 5 de cada mes.")],
    },
    call: { title: "Registrar llamada", fields: [dateField, noteField("Resumen de la llamada")] },
    dispute: {
      title: "El cliente discrepa",
      intro: "Pausa la reclamación hasta que lo resuelvas. Una deuda discutida es más difícil de reclamar en el juzgado.",
      fields: [dateField, noteField("Motivo de la discrepancia")],
    },
    resolved: { title: "Discrepancia resuelta", fields: [dateField, noteField("Cómo se ha resuelto")] },
    note: { title: "Añadir nota", fields: [dateField, noteField("Nota")] },
    monitorio: { title: "Monitorio presentado", fields: [dateField, noteField("Juzgado y número de procedimiento")] },
  }
  const values = await formDialog({ ...configs[type], submitLabel: "Guardar" })
  if (!values) return
  if (type === "payment") {
    const amount = money(values.amount)
    if (!(amount > 0)) return toast("Importe no válido", "error")
    addPayment(invoice.id, { date: values.date, amount, note: values.note })
    return toast(amount >= claim.outstanding ? "Pago registrado. ¡Factura cobrada!" : "Pago parcial registrado")
  }
  addEvent(invoice.id, { type, date: values.date, note: values.note, promiseDate: values.promiseDate || undefined })
  toast(`${EVENT_LABELS[type]} registrado`)
}

async function registerMessage(invoice, stageId, asOf) {
  const values = await formDialog({
    title: "Marcar como enviado",
    fields: [
      { name: "date", label: "Fecha de envío", type: "date", value: asOf, required: true },
      { name: "channel", label: "Canal", type: "select", value: "email", options: ["email", "whatsapp", "phone", "other"].map((key) => [key, CHANNEL_LABELS[key]]) },
      { name: "note", label: "Nota (opcional)", type: "textarea" },
    ],
  })
  if (!values) return
  addEvent(invoice.id, { type: "message", stage: stageId, date: values.date, channel: values.channel, note: values.note })
  drafts.delete(`${invoice.id}:${stageId}`)
  drafts.delete(`${invoice.id}:current`)
  toast("Envío registrado. Te avisaremos del siguiente paso.")
}

async function registerMasc(invoice, asOf) {
  const values = await formDialog({
    title: "Registrar requerimiento formal",
    intro: "Guarda el justificante de envío, el acuse de recibo y la certificación del texto: los necesitarás para el monitorio.",
    fields: [
      { name: "date", label: "Fecha de envío", type: "date", value: asOf, required: true },
      { name: "channel", label: "Medio", type: "select", value: "burofax", options: ["burofax", "certified", "notary", "email", "other"].map((key) => [key, CHANNEL_LABELS[key]]) },
      { name: "receivedDate", label: "Fecha de recepción (si ya la sabes)", type: "date", hint: "Aparece en el acuse de recibo. Puedes añadirla después." },
      { name: "note", label: "Nota (opcional)", type: "textarea", hint: "Ej.: número de envío del burofax." },
    ],
  })
  if (!values) return
  if (values.receivedDate && values.receivedDate < values.date) return toast("La recepción no puede ser anterior al envío", "error")
  addEvent(invoice.id, { type: "masc", date: values.date, channel: values.channel, receivedDate: values.receivedDate || undefined, note: values.note })
  drafts.delete(`${invoice.id}:masc`)
  if (values.channel === "email" || values.channel === "other")
    return toast("Registrado. Ojo: un email simple puede no bastar para acreditar el intento de negociación.", "warning")
  toast("Requerimiento registrado")
}

async function addReceipt(invoice, event, asOf) {
  if (!event) return
  const values = await formDialog({
    title: "Fecha de recepción",
    fields: [{ name: "receivedDate", label: "Recibido el", type: "date", value: asOf, required: true, min: event.date }],
  })
  if (!values) return
  updateEvent(invoice.id, event.id, { receivedDate: values.receivedDate })
  toast("Fecha de recepción guardada")
}

function timeline(invoice, asOf) {
  const items = [
    ...invoice.events.map((event) => ({ kind: "event", date: event.date, event })),
    ...invoice.payments.map((payment) => ({ kind: "payment", date: payment.date, payment })),
  ].sort((a, b) => b.date.localeCompare(a.date))
  return h(
    "section",
    { class: "card" },
    h("h2", null, "Historial"),
    items.length === 0
      ? h("p", { class: "muted" }, "Aún no has registrado ninguna gestión.")
      : h("ol", { class: "timeline" }, items.map((item) => (item.kind === "payment" ? paymentItem(invoice, item.payment) : eventItem(invoice, item.event, asOf)))),
  )
}

function eventItem(invoice, event, asOf) {
  const stage = STAGES.find((item) => item.id === event.stage)
  const title = event.type === "message" && stage ? `${stage.title}` : EVENT_LABELS[event.type]
  return h(
    "li",
    { class: `tl ${event.type}` },
    h("span", { class: "tl-date" }, formatDate(event.date)),
    h(
      "div",
      { class: "tl-body" },
      h("strong", null, title),
      event.channel ? h("span", { class: "sub" }, ` · ${CHANNEL_LABELS[event.channel] ?? event.channel}`) : null,
      event.promiseDate ? h("div", { class: "sub" }, `Fecha comprometida: ${formatDate(event.promiseDate)}`) : null,
      event.type === "masc"
        ? h(
            "div",
            { class: "sub" },
            event.receivedDate ? `Recibido el ${formatDate(event.receivedDate)}` : badge("Falta la fecha de recepción", "warning"),
            event.receivedDate ? null : button("Añadir", { small: true, variant: "ghost", onClick: () => addReceipt(invoice, event, asOf) }),
          )
        : null,
      event.note ? h("p", { class: "tl-note" }, event.note) : null,
    ),
    deleteButton(() => removeEvent(invoice.id, event.id)),
  )
}

function paymentItem(invoice, payment) {
  return h(
    "li",
    { class: "tl payment" },
    h("span", { class: "tl-date" }, formatDate(payment.date)),
    h("div", { class: "tl-body" }, h("strong", null, `Pago recibido: ${formatMoney(payment.amount)}`), payment.note ? h("p", { class: "tl-note" }, payment.note) : null),
    deleteButton(() => removePayment(invoice.id, payment.id)),
  )
}

function deleteButton(onConfirm) {
  return h(
    "button",
    {
      type: "button",
      class: "icon-btn",
      title: "Eliminar registro",
      "aria-label": "Eliminar registro",
      onclick: async () => {
        if (await confirmDialog("¿Eliminar este registro?", "Desaparecerá del historial y del expediente.", "Eliminar")) onConfirm()
      },
    },
    icon("trash"),
  )
}

function dangerZone(invoice) {
  const archived = invoice.status === "written_off"
  return h(
    "section",
    { class: "card subtle" },
    h(
      "div",
      { class: "row-actions" },
      button(archived ? "Reactivar" : "Archivar (no reclamar más)", {
        variant: "ghost",
        small: true,
        onClick: () => {
          updateInvoice(invoice.id, (current) => ({ ...current, status: archived ? "active" : "written_off" }))
          toast(archived ? "Factura reactivada" : "Factura archivada")
        },
      }),
      button("Eliminar factura", {
        variant: "ghost danger",
        small: true,
        icon: "trash",
        onClick: async () => {
          if (!(await confirmDialog("¿Eliminar la factura?", "Se borrarán también sus pagos y su historial. No se puede deshacer.", "Eliminar"))) return
          removeInvoice(invoice.id)
          location.hash = "#/"
          toast("Factura eliminada")
        },
      }),
    ),
  )
}

function isDone(invoice, stageId) {
  if (stageId === "masc") return invoice.events.some((event) => event.type === "masc")
  return invoice.events.some((event) => event.type === "message" && event.stage === stageId)
}

function whatsappUrl(phone, text) {
  const digits = phone.replace(/\D/g, "")
  const international = digits.length === 9 ? `34${digits}` : digits.replace(/^00/, "")
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`
}

function copy(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => toast("Copiado al portapapeles"))
    .catch(() => toast("No se pudo copiar: selecciona el texto y cópialo a mano", "error"))
}
